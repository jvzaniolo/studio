import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Camera,
  CornerDownRight,
  Globe,
  Lock,
  MoreHorizontal,
  Palette,
  Pencil,
  Pipette,
  Plus,
  Search,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Textarea } from "~/components/ui/textarea"
import { PageHeader } from "~/components/page-header"
import { useSidebar } from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "conta" | "personalizacao" | "geral" | "perfis" | "seguranca"
type ThemeMode = "padrao" | "claro" | "escuro" | "personalizado"
type AccessRole = "admin" | "membro" | "visualizador" | "convidado"
type PrivacyLevel = "aberto" | "fechado" | "privado"
type Permission = "editor" | "leitor" | "ocultar"
type MemberStatus = "ativo" | "pendente" | "desativado"

interface Workspace {
  id: string
  name: string
  parentId: string | null
  description: string
}

interface Member {
  id: string
  name: string
  email: string
  avatar?: string
  role: AccessRole
  profileId: string | null
  status: MemberStatus
}

interface ResourcePermission {
  moduleId: string
  elementX: Permission
  elementY: Permission
}

interface UserProfile {
  id: string
  name: string
  description: string
  permissions: ResourcePermission[]
  memberIds: string[]
}

// ─── Static data ──────────────────────────────────────────────────────────────

const initialWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Geral",
    parentId: null,
    description: "Workspace principal para gestão de ESG e indicadores de impacto.",
  },
  {
    id: "2",
    name: "Indústria",
    parentId: "1",
    description: "Workspace do setor de Indústria, abaixo do Geral.",
  },
  {
    id: "3",
    name: "Qualidade",
    parentId: "2",
    description: "Workspace de Qualidade, abaixo de Indústria.",
  },
  {
    id: "4",
    name: "Projeto Piloto",
    parentId: "1",
    description: "Workspace dedicado ao projeto piloto de ESG.",
  },
  {
    id: "5",
    name: "Fornecedores ESG",
    parentId: "1",
    description: "Workspace para avaliação e monitoramento de fornecedores ESG.",
  },
]

function getWorkspaceLevel(ws: Workspace, all: Workspace[]): number {
  let level = 1
  let current = ws
  while (current.parentId) {
    const parent = all.find((w) => w.id === current.parentId)
    if (!parent) break
    level++
    current = parent
  }
  return level
}

function flattenWorkspaceTree(
  all: Workspace[],
  parentId: string | null = null,
  level = 1
): (Workspace & { level: number })[] {
  return all
    .filter((w) => w.parentId === parentId)
    .flatMap((w) => [{ ...w, level }, ...flattenWorkspaceTree(all, w.id, level + 1)])
}

const roles: { value: AccessRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Admin do Workspace",
    description:
      "Controle total sobre membros, faturamento e privacidade do workspace.",
  },
  {
    value: "membro",
    label: "Membro",
    description:
      "Cria e edita projetos e quadros; interage com todas as funcionalidades.",
  },
  {
    value: "visualizador",
    label: "Visualizador",
    description:
      "Apenas leitura e comentários. Não pode editar estruturas ou alterar status.",
  },
  {
    value: "convidado",
    label: "Convidado (Externo)",
    description:
      "Usuário externo com acesso estrito somente aos projetos para os quais foi convidado.",
  },
]

const systemModules = [
  { id: "kpis", name: "KPIs", elementX: "Indicadores", elementY: "Relatórios" },
  {
    id: "fornecedores",
    name: "Avaliação de Fornecedores",
    elementX: "Avaliações",
    elementY: "Fornecedores",
  },
  {
    id: "materialidade",
    name: "Materialidade",
    elementX: "Temas",
    elementY: "Mapeamentos",
  },
  {
    id: "configuracoes",
    name: "Configurações",
    elementX: "Membros",
    elementY: "Perfis",
  },
]

const defaultPermissions: ResourcePermission[] = systemModules.map((m) => ({
  moduleId: m.id,
  elementX: "leitor",
  elementY: "leitor",
}))

const initialMembers: Member[] = [
  {
    id: "m1",
    name: "Administrador",
    email: "admin@humanizadas.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "admin",
    profileId: "p1",
    status: "ativo",
  },
  {
    id: "m2",
    name: "Bruno Ferreira",
    email: "bruno.ferreira@humanizadas.com",
    avatar: "https://i.pravatar.cc/150?img=15",
    role: "membro",
    profileId: "p2",
    status: "ativo",
  },
  {
    id: "m3",
    name: "Carla Mendes",
    email: "carla.mendes@humanizadas.com",
    avatar: "https://i.pravatar.cc/150?img=33",
    role: "visualizador",
    profileId: "p2",
    status: "ativo",
  },
  {
    id: "m4",
    name: "Daniel Rocha",
    email: "daniel.rocha@humanizadas.com",
    role: "convidado",
    profileId: null,
    status: "pendente",
  },
  {
    id: "m5",
    name: "Eva Santana",
    email: "eva.santana@humanizadas.com",
    avatar: "https://i.pravatar.cc/150?img=25",
    role: "membro",
    profileId: "p1",
    status: "desativado",
  },
]

const initialProfiles: UserProfile[] = [
  {
    id: "p1",
    name: "Analista",
    description: "Acesso completo a KPIs e relatórios, sem acesso a configurações.",
    permissions: [
      { moduleId: "kpis", elementX: "editor", elementY: "leitor" },
      { moduleId: "fornecedores", elementX: "leitor", elementY: "leitor" },
      { moduleId: "materialidade", elementX: "leitor", elementY: "ocultar" },
      { moduleId: "configuracoes", elementX: "ocultar", elementY: "ocultar" },
    ],
    memberIds: ["m1", "m5"],
  },
  {
    id: "p2",
    name: "Gerente",
    description: "Acesso completo a todos os módulos operacionais.",
    permissions: [
      { moduleId: "kpis", elementX: "editor", elementY: "editor" },
      { moduleId: "fornecedores", elementX: "editor", elementY: "editor" },
      { moduleId: "materialidade", elementX: "editor", elementY: "leitor" },
      { moduleId: "configuracoes", elementX: "leitor", elementY: "ocultar" },
    ],
    memberIds: ["m2", "m3"],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

function normalizeHex(raw: string): string | null {
  let v = raw.trim().replace(/^#/, "")
  if (/^[0-9a-fA-F]{3}$/.test(v)) {
    v = v
      .split("")
      .map((ch) => ch + ch)
      .join("")
  }
  return /^[0-9a-fA-F]{6}$/.test(v) ? `#${v.toLowerCase()}` : null
}

// Converts sRGB hex to OKLCH (l, c, h) — see Björn Ottosson's OKLab reference.
function hexToOklch(hex: string): { h: number; c: number; l: number } {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const c = Math.sqrt(A * A + B * B)
  let h = (Math.atan2(B, A) * 180) / Math.PI
  if (h < 0) h += 360

  return { h, c, l: L }
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [active, onOutside, ref])
}

// workspaceAccess: userId → workspaceId[]
const initialWorkspaceAccess: Record<string, string[]> = {
  m1: ["1", "2", "3", "4", "5"],
  m2: ["1", "2", "4"],
  m3: ["1"],
  m4: ["1"],
  m5: ["1", "5"],
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const config: Record<MemberStatus, { label: string; className: string }> = {
    ativo: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
    pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    desativado: { label: "Desativado", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {label}
    </Badge>
  )
}

const permissionLabels: Record<Permission, string> = {
  editor: "Editor",
  leitor: "Leitor",
  ocultar: "Ocultar",
}

function PermissionSelect({
  value,
  onChange,
}: {
  value: Permission
  onChange: (v: Permission) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Permission)}>
      <SelectTrigger className="h-7 w-28 text-xs">
        <span className="flex flex-1 truncate text-left">
          {permissionLabels[value]}
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="editor" className="text-xs">Editor</SelectItem>
        <SelectItem value="leitor" className="text-xs">Leitor</SelectItem>
        <SelectItem value="ocultar" className="text-xs">Ocultar</SelectItem>
      </SelectContent>
    </Select>
  )
}

// ─── Section: Minha Conta ─────────────────────────────────────────────────────

function ContaSection() {
  const [name, setName] = useState("Administrador")
  const [email] = useState("administrador@humanizadas.com")
  const [avatarSrc, setAvatarSrc] = useState("https://i.pravatar.cc/150?img=12")

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarSrc(url)
    toast.success("Foto de perfil atualizada.")
  }

  function saveName() {
    toast.success("Nome atualizado com sucesso.")
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold">Perfil</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Informações visíveis para outros membros da plataforma.
        </p>
      </div>
      <Separator />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar className="size-20 rounded-xl after:rounded-xl">
            <AvatarImage src={avatarSrc} alt={name} className="rounded-xl object-cover" />
            <AvatarFallback className="rounded-xl text-lg">
              {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-1.5 -right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            title="Alterar foto"
          >
            <Camera className="size-3.5" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
          <label
            htmlFor="avatar-upload"
            className="mt-1.5 inline-block cursor-pointer text-xs text-primary hover:underline"
          >
            Alterar foto
          </label>
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="conta-name">Nome</Label>
        <div className="flex gap-2">
          <Input
            id="conta-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={saveName}>
            Salvar
          </Button>
        </div>
      </div>

      {/* E-mail (somente leitura) */}
      <div className="space-y-1.5">
        <Label htmlFor="conta-email">E-mail</Label>
        <Input
          id="conta-email"
          value={email}
          readOnly
          className="cursor-not-allowed bg-muted/40 text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          O e-mail é gerenciado pelo administrador da organização.
        </p>
      </div>
    </div>
  )
}

// ─── Section: Personalização ──────────────────────────────────────────────────

const accentColors: {
  key: string
  label: string
  swatch: string
  darkSidebar: string
  colorfulSidebar: string
  h: number
  c: number
  l: number
}[] = [
  { key: "roxo",    label: "Roxo",    swatch: "#7c3aed", darkSidebar: "#2e0660", colorfulSidebar: "#5b21b6", h: 301.924, c: 0.265, l: 0.496 },
  { key: "azul",    label: "Azul",    swatch: "#2563eb", darkSidebar: "#1e3a6e", colorfulSidebar: "#1d4ed8", h: 250,     c: 0.22,  l: 0.46  },
  { key: "verde",   label: "Verde",   swatch: "#16a34a", darkSidebar: "#14432a", colorfulSidebar: "#15803d", h: 145,     c: 0.18,  l: 0.46  },
  { key: "teal",    label: "Teal",    swatch: "#0d9488", darkSidebar: "#134e4a", colorfulSidebar: "#0f766e", h: 193,     c: 0.16,  l: 0.48  },
  { key: "rosa",    label: "Rosa",    swatch: "#db2777", darkSidebar: "#500724", colorfulSidebar: "#be185d", h: 340,     c: 0.22,  l: 0.52  },
  { key: "laranja", label: "Laranja", swatch: "#ea580c", darkSidebar: "#431407", colorfulSidebar: "#c2410c", h: 42,      c: 0.21,  l: 0.60  },
]

function getColorByKey(key: string): (typeof accentColors)[number] | null {
  const preset = accentColors.find((c) => c.key === key)
  if (preset) return preset
  const hex = normalizeHex(key)
  if (!hex) return null
  const { h, c, l } = hexToOklch(hex)
  return { key: hex, label: hex.toUpperCase(), swatch: hex, darkSidebar: hex, colorfulSidebar: hex, h, c, l }
}

function HexColorInputs({
  hex,
  onChange,
}: {
  hex: string
  onChange: (hex: string) => void
}) {
  return (
    <>
      <input
        type="color"
        value={normalizeHex(hex) ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        title="Escolher visualmente"
      />
      <Input
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text")
          if (normalizeHex(pasted)) {
            e.preventDefault()
            onChange(pasted)
          }
        }}
        placeholder="#RRGGBB"
        className="h-8 w-24 font-mono text-xs"
        maxLength={7}
      />
    </>
  )
}

// Custom color swatch for single-selection pickers (e.g. "Cor principal") — applies live as you type/pick.
function CustomColorButton({
  active,
  currentHex,
  onApply,
}: {
  active: boolean
  currentHex: string
  onApply: (hex: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(currentHex)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  useEffect(() => {
    if (open) setHexInput(currentHex)
  }, [open, currentHex])

  function handleChange(raw: string) {
    setHexInput(raw)
    const normalized = normalizeHex(raw)
    if (normalized) onApply(normalized)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Cor personalizada"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-2 text-muted-foreground transition-transform hover:scale-110",
          active
            ? "scale-110 ring-2 ring-offset-2 ring-offset-background"
            : "border-dashed border-muted-foreground/40 hover:border-muted-foreground"
        )}
        style={active ? { background: currentHex, borderColor: currentHex, ringColor: currentHex } : undefined}
      >
        {active ? (
          <span className="text-[11px] font-bold text-white drop-shadow">✓</span>
        ) : (
          <Pipette className="size-4" />
        )}
      </button>
      {open && (
        <div className="absolute top-11 left-0 z-20 flex items-center gap-2 rounded-lg border bg-popover p-2 shadow-md">
          <HexColorInputs hex={hexInput} onChange={handleChange} />
        </div>
      )}
    </div>
  )
}

// "Add" swatch for multi-selection pickers (e.g. "Cores principais") — confirms before adding to the list.
function AddCustomColorButton({
  onAdd,
  disabled,
}: {
  onAdd: (hex: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState("#7c3aed")
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  function handleAdd() {
    const normalized = normalizeHex(hexInput)
    if (!normalized) {
      toast.error("Informe um código hex válido, como #7C3AED.")
      return
    }
    onAdd(normalized)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Adicionar cor personalizada"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-transform hover:scale-110 hover:border-muted-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Pipette className="size-4" />
      </button>
      {open && (
        <div className="absolute top-11 left-0 z-20 flex items-center gap-2 rounded-lg border bg-popover p-2 shadow-md">
          <HexColorInputs hex={hexInput} onChange={setHexInput} />
          <Button size="sm" className="h-8 px-2.5" onClick={handleAdd}>
            Usar
          </Button>
        </div>
      )}
    </div>
  )
}

function PersonalizacaoSection() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme-mode") as ThemeMode) ?? "padrao"
  })
  const [accentKey, setAccentKey] = useState(() => {
    return localStorage.getItem("accent-color") ?? "roxo"
  })
  const [customColorKeys, setCustomColorKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem("custom-colors")
    return saved ? JSON.parse(saved) : ["roxo", "teal"]
  })

  const accent = getColorByKey(accentKey) ?? accentColors[0]

  const themeOptions = [
    {
      key: "padrao" as ThemeMode,
      label: "Padrão",
      description: "Modelo padrão da plataforma, com identidade visual completa.",
      sidebar: accent.darkSidebar,
      primary: accent.swatch,
      bg: "#ffffff",
    },
    {
      key: "claro" as ThemeMode,
      label: "Claro",
      description: "Interface em branco e cinza, exceto pelas cores de destaque.",
      sidebar: "#1a1a1a",
      primary: "#737373",
      bg: "#ffffff",
    },
    {
      key: "escuro" as ThemeMode,
      label: "Escuro",
      description: "Fundo escuro em toda a interface — como o time de tech prefere.",
      sidebar: "#050505",
      primary: accent.swatch,
      bg: "#171717",
    },
    {
      key: "personalizado" as ThemeMode,
      label: "Personalizado",
      description: "Escolha de 2 a 3 cores principais para toda a plataforma.",
      sidebar: accent.colorfulSidebar,
      primary: accent.swatch,
      bg: "#fdf4ff",
    },
  ]

  function applyTheme(mode: ThemeMode) {
    setThemeMode(mode)
    const el = document.documentElement
    el.classList.remove("theme-minimal", "theme-colorful", "dark")
    if (mode === "claro") el.classList.add("theme-minimal")
    if (mode === "personalizado") el.classList.add("theme-colorful")
    if (mode === "escuro") el.classList.add("dark")
    localStorage.setItem("theme-mode", mode)
    localStorage.setItem("theme", mode === "escuro" ? "dark" : "light")
    toast.success(`Tema "${themeOptions.find((t) => t.key === mode)?.label}" aplicado.`)
  }

  function applyAccent(color: typeof accentColors[0]) {
    setAccentKey(color.key)
    const el = document.documentElement
    el.style.setProperty("--ac-h", String(color.h))
    el.style.setProperty("--ac-c", String(color.c))
    el.style.setProperty("--ac-l", String(color.l))
    localStorage.setItem("accent-color", color.key)
    toast.success(`Cor "${color.label}" aplicada.`)
  }

  function applyCustomAccent(hex: string) {
    const color = getColorByKey(hex)
    if (color) applyAccent(color)
  }

  function toggleCustomColor(key: string) {
    setCustomColorKeys((prev) => {
      let next: string[]
      if (prev.includes(key)) {
        next = prev.filter((k) => k !== key)
      } else if (prev.length >= 3) {
        toast("Escolha no máximo 3 cores principais.")
        return prev
      } else {
        next = [...prev, key]
      }
      localStorage.setItem("custom-colors", JSON.stringify(next))
      if (next[0]) {
        const primary = getColorByKey(next[0])
        if (primary) applyAccent(primary)
      }
      return next
    })
  }

  const personalizadoSwatches = [
    ...accentColors,
    ...customColorKeys
      .filter((k) => !accentColors.some((c) => c.key === k))
      .map((k) => getColorByKey(k))
      .filter((c): c is (typeof accentColors)[number] => c !== null),
  ]

  return (
    <div className="max-w-xl space-y-8">
      {/* Cor principal */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold">Cor principal</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Substitui o roxo padrão em toda a plataforma.
          </p>
        </div>
        <Separator />
        <div className="flex gap-3">
          {accentColors.map((color) => (
            <button
              key={color.key}
              title={color.label}
              onClick={() => applyAccent(color)}
              className={cn(
                "group relative flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110",
                accentKey === color.key && "ring-2 ring-offset-2 ring-offset-background scale-110"
              )}
              style={{ background: color.swatch, ringColor: color.swatch }}
            >
              {accentKey === color.key && (
                <span className="text-[11px] font-bold text-white drop-shadow">✓</span>
              )}
            </button>
          ))}
          <CustomColorButton
            active={!accentColors.some((c) => c.key === accentKey)}
            currentHex={accent.swatch}
            onApply={applyCustomAccent}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          {accent.label} selecionado
        </p>
      </div>

      {/* Tema */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold">Tema</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define como as cores são aplicadas na interface.
          </p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((t) => (
            <button
              key={t.key}
              onClick={() => applyTheme(t.key)}
              className={cn(
                "flex flex-col gap-3 rounded-lg border-2 p-3 text-left transition-all",
                themeMode === t.key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
              )}
            >
              {/* Mini preview */}
              <div className="overflow-hidden rounded-md border" style={{ background: t.bg }}>
                <div className="flex h-16">
                  <div className="w-7 shrink-0" style={{ background: t.sidebar }} />
                  <div className="flex flex-1 flex-col justify-between p-2">
                    <div className="space-y-1">
                      <div
                        className="h-1.5 w-3/4 rounded-full"
                        style={{ background: t.key === "escuro" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                      />
                      <div
                        className="h-1.5 w-1/2 rounded-full"
                        style={{ background: t.key === "escuro" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                      />
                    </div>
                    <div className="h-3.5 w-10 rounded" style={{ background: t.primary }} />
                  </div>
                </div>
              </div>
              {/* Label */}
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{t.label}</span>
                  {themeMode === t.key && (
                    <span className="ml-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      ✓
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                  {t.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {themeMode === "personalizado" && (
          <div className="space-y-2.5 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">Cores principais</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha de 2 a 3 cores para compor a identidade da plataforma. A 1ª cor selecionada
              vira a cor de destaque principal.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {personalizadoSwatches.map((color) => {
                const order = customColorKeys.indexOf(color.key)
                const selected = order !== -1
                return (
                  <button
                    key={color.key}
                    title={color.label}
                    onClick={() => toggleCustomColor(color.key)}
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110",
                      selected && "ring-2 ring-offset-2 ring-offset-background scale-110"
                    )}
                    style={{ background: color.swatch, ringColor: color.swatch }}
                  >
                    {selected && (
                      <span className="text-[11px] font-bold text-white drop-shadow">
                        {order + 1}
                      </span>
                    )}
                  </button>
                )
              })}
              <AddCustomColorButton onAdd={toggleCustomColor} disabled={customColorKeys.length >= 3} />
            </div>
            <p className="text-xs text-muted-foreground">
              {customColorKeys.length === 0
                ? "Nenhuma cor selecionada."
                : customColorKeys
                    .map((k) => getColorByKey(k)?.label)
                    .filter(Boolean)
                    .join(" · ")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Geral (Workspaces + Membros e Acessos) ──────────────────────────

function GeralSection({
  workspaces,
  members,
  profiles,
  access,
  selectedId,
  onSelectWorkspace,
  onUpdateMember,
  onToggleAccess,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
}: {
  workspaces: Workspace[]
  members: Member[]
  profiles: UserProfile[]
  access: Record<string, string[]>
  selectedId: string
  onSelectWorkspace: (id: string) => void
  onUpdateMember: (id: string, changes: Partial<Member>) => void
  onToggleAccess: (userId: string, workspaceId: string, granted: boolean) => void
  onCreateWorkspace: (data: { name: string; parentId: string | null; description: string }) => void
  onUpdateWorkspace: (
    id: string,
    data: { name: string; parentId: string | null; description: string }
  ) => void
  onDeleteWorkspace: (id: string) => void
}) {
  const workspace = workspaces.find((w) => w.id === selectedId) ?? workspaces[0]
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description)

  const [formOpen, setFormOpen] = useState(false)
  const [editingWs, setEditingWs] = useState<Workspace | null>(null)
  const [deletingWs, setDeletingWs] = useState<Workspace | null>(null)

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [filterRole, setFilterRole] = useState("todos")
  const [filterProfile, setFilterProfile] = useState("todos")
  const [filterAccess, setFilterAccess] = useState("todos")
  const [inviteEmail, setInviteEmail] = useState("")

  const tree = flattenWorkspaceTree(workspaces)

  useEffect(() => {
    const ws = workspaces.find((w) => w.id === selectedId)
    if (ws) {
      setName(ws.name)
      setDescription(ws.description)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, workspaces])

  function saveWorkspaceInfo() {
    onUpdateWorkspace(workspace.id, { name, parentId: workspace.parentId, description })
    toast.success("Informações do workspace salvas.")
  }

  function openCreate() {
    setEditingWs(null)
    setFormOpen(true)
  }

  function openEdit(ws: Workspace) {
    setEditingWs(ws)
    setFormOpen(true)
  }

  function handleSaveWorkspaceForm(data: {
    name: string
    parentId: string | null
    description: string
  }) {
    if (editingWs) {
      onUpdateWorkspace(editingWs.id, data)
      if (editingWs.id === selectedId) {
        setName(data.name)
        setDescription(data.description)
      }
      toast.success(`Workspace "${data.name}" atualizado.`)
    } else {
      onCreateWorkspace(data)
      toast.success(`Workspace "${data.name}" criado.`)
    }
  }

  function confirmDelete() {
    if (deletingWs) {
      onDeleteWorkspace(deletingWs.id)
      if (deletingWs.id === selectedId) {
        onSelectWorkspace(workspaces.find((w) => w.id !== deletingWs.id)?.id ?? "1")
      }
      toast.success(`Workspace "${deletingWs.name}" excluído.`)
      setDeletingWs(null)
    }
  }

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "todos" || m.status === filterStatus
    const matchRole = filterRole === "todos" || m.role === filterRole
    const matchProfile =
      filterProfile === "todos" ||
      (filterProfile === "sem-perfil" ? !m.profileId : m.profileId === filterProfile)
    const hasWorkspaceAccess = (access[m.id] ?? []).includes(workspace.id)
    const matchAccess =
      filterAccess === "todos" || (filterAccess === "com-acesso" ? hasWorkspaceAccess : !hasWorkspaceAccess)
    return matchSearch && matchStatus && matchRole && matchProfile && matchAccess
  })

  function handleRoleChange(memberId: string, role: AccessRole) {
    onUpdateMember(memberId, { role })
    const label = roles.find((r) => r.value === role)?.label ?? role
    toast.success(`Nível de acesso atualizado para ${label}.`)
  }

  function handleProfileChange(memberId: string, profileId: string | null) {
    onUpdateMember(memberId, { profileId })
    const label =
      profileId === null
        ? "Sem perfil"
        : (profiles.find((p) => p.id === profileId)?.name ?? profileId)
    toast.success(`Perfil atualizado para ${label}.`)
  }

  function handleContextAction(member: Member, action: "reenviar" | "desativar" | "remover") {
    if (action === "reenviar") {
      toast.success(`Convite reenviado para ${member.email}.`)
    } else if (action === "desativar") {
      const next = member.status === "desativado" ? "ativo" : "desativado"
      onUpdateMember(member.id, { status: next })
      toast.success(`Membro ${next === "ativo" ? "reativado" : "desativado"}.`)
    } else {
      toast.error(`${member.name} foi removido do workspace.`)
    }
  }

  function handleInvite() {
    if (!inviteEmail.includes("@")) {
      toast.error("Informe um e-mail válido.")
      return
    }
    toast.success(`Convite enviado para ${inviteEmail} — acesso a "${workspace.name}" incluído.`)
    setInviteEmail("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Geral</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Escolha um workspace ao lado para ver e editar suas informações, membros e acessos — tudo
          no mesmo lugar.
        </p>
      </div>
      <Separator />

      <div className="flex gap-4">
        {/* Workspace tree */}
        <aside className="w-48 shrink-0 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Workspaces
            </p>
            <button
              onClick={openCreate}
              title="Novo Workspace"
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="divide-y overflow-hidden rounded-md border">
            {tree.map((ws) => (
              <div
                key={ws.id}
                className={cn(
                  "group relative flex items-center",
                  ws.id === selectedId ? "bg-primary/5" : "hover:bg-muted/30"
                )}
              >
                <button
                  onClick={() => onSelectWorkspace(ws.id)}
                  title={ws.name}
                  className="flex w-full min-w-0 items-center gap-1.5 py-2 text-left"
                  style={{ paddingLeft: `${8 + (ws.level - 1) * 12}px` }}
                >
                  {ws.level > 1 && (
                    <CornerDownRight className="size-3 shrink-0 text-muted-foreground/50" />
                  )}
                  <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm",
                      ws.id === selectedId ? "font-medium text-foreground" : "text-foreground/90"
                    )}
                  >
                    {ws.name}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="absolute right-1 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground data-popup-open:opacity-100">
                    <MoreHorizontal className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(ws)}>
                      <Pencil className="size-3.5" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeletingWs(ws)}>
                      <Trash2 className="size-3.5" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </aside>

        {/* Selected workspace: info + members & access, no tab switching required */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="max-w-xl space-y-4">
            <h3 className="text-sm font-semibold">Informações do Workspace</h3>
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Nome do Workspace</Label>
              <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-desc">Descrição</Label>
              <Textarea
                id="ws-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={saveWorkspaceInfo}>
                Salvar alterações
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Membros e Acessos</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Veja e edite quem tem acesso a "{workspace.name}" e seus níveis de permissão.
              </p>
            </div>

            {/* Invite bar */}
            <div className="flex gap-2">
              <Input
                placeholder="Convidar por e-mail..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="max-w-xs"
              />
              <Button size="sm" onClick={handleInvite}>
                <UserPlus className="mr-1.5 size-3.5" />
                Convidar
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-8"
                />
              </div>
              <Select value={filterAccess} onValueChange={(v) => setFilterAccess(v ?? "todos")}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Acesso ao workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os membros</SelectItem>
                  <SelectItem value="com-acesso">Com acesso a "{workspace.name}"</SelectItem>
                  <SelectItem value="sem-acesso">Sem acesso a "{workspace.name}"</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "todos")}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="desativado">Desativado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={(v) => setFilterRole(v ?? "todos")}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os níveis</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProfile} onValueChange={(v) => setFilterProfile(v ?? "todos")}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os perfis</SelectItem>
                  <SelectItem value="sem-perfil">Sem perfil</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table style={{ tableLayout: "fixed" }}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Membro</TableHead>
                    <TableHead className="w-[160px]">E-mail</TableHead>
                    <TableHead className="w-[64px] text-center">Acesso</TableHead>
                    <TableHead className="w-[150px]">Nível de Acesso</TableHead>
                    <TableHead className="w-[120px]">Perfil</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[40px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Nenhum membro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((member) => {
                      const hasAccess = (access[member.id] ?? []).includes(workspace.id)
                      return (
                        <TableRow
                          key={member.id}
                          className={cn(member.status === "desativado" && "opacity-50")}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-7">
                                {member.avatar && (
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                )}
                                <AvatarFallback className="text-xs">
                                  {initials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{member.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {member.email}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={hasAccess}
                              onCheckedChange={(v) => onToggleAccess(member.id, workspace.id, v)}
                              aria-label={`${member.name} acesso a ${workspace.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.role}
                              onValueChange={(v) => handleRoleChange(member.id, v as AccessRole)}
                            >
                              <SelectTrigger className="h-7 w-full text-xs">
                                <span className="flex flex-1 truncate text-left">
                                  {roles.find((r) => r.value === member.role)?.label ?? member.role}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((r) => (
                                  <SelectItem key={r.value} value={r.value} label={r.label} className="pr-8">
                                    <div className="flex flex-col gap-0.5 py-0.5">
                                      <span className="text-xs font-medium">{r.label}</span>
                                      <span className="max-w-[240px] whitespace-normal text-xs leading-tight text-muted-foreground">
                                        {r.description}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.profileId ?? "sem-perfil"}
                              onValueChange={(v) =>
                                handleProfileChange(member.id, v === "sem-perfil" ? null : v)
                              }
                            >
                              <SelectTrigger className="h-7 w-full text-xs">
                                <span className="flex flex-1 truncate text-left">
                                  {member.profileId === null
                                    ? "Sem perfil"
                                    : (profiles.find((p) => p.id === member.profileId)?.name ?? "Sem perfil")}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sem-perfil" className="text-xs">
                                  Sem perfil
                                </SelectItem>
                                {profiles.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="text-xs">
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-2">
                            <StatusBadge status={member.status} />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                                <MoreHorizontal className="size-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => handleContextAction(member, "reenviar")}
                                >
                                  Reenviar Convite
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleContextAction(member, "desativar")}
                                >
                                  {member.status === "desativado"
                                    ? "Reativar Membro"
                                    : "Desativar Membro"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleContextAction(member, "remover")}
                                >
                                  Remover do Workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <WorkspaceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaces={workspaces}
        editing={editingWs}
        onSave={handleSaveWorkspaceForm}
      />

      <AlertDialog open={deletingWs !== null} onOpenChange={(open) => !open && setDeletingWs(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Excluir workspace "{deletingWs?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription render={<div className="space-y-2 text-sm" />}>
              <p>
                Workspaces abaixo deste na hierarquia ficarão sem workspace pai. Esta ação não
                pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingWs(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Section: Perfis e Recursos ───────────────────────────────────────────────

function PerfisSection({
  profiles,
  members,
  onUpdateProfiles,
}: {
  profiles: UserProfile[]
  members: Member[]
  onUpdateProfiles: (profiles: UserProfile[]) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(profiles[0]?.id ?? null)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSearch, setAddSearch] = useState("")
  const [toAdd, setToAdd] = useState<string[]>([])

  const selected = profiles.find((p) => p.id === selectedId)

  function handleCreate() {
    if (!newName.trim()) {
      toast.error("Informe um nome para o perfil.")
      return
    }
    const profile: UserProfile = {
      id: `p${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      permissions: defaultPermissions.map((p) => ({ ...p })),
      memberIds: [],
    }
    onUpdateProfiles([...profiles, profile])
    setSelectedId(profile.id)
    setIsCreating(false)
    setNewName("")
    setNewDesc("")
    toast.success(`Perfil "${profile.name}" criado.`)
  }

  function handlePermissionChange(
    moduleId: string,
    element: "elementX" | "elementY",
    value: Permission
  ) {
    if (!selected) return
    onUpdateProfiles(
      profiles.map((p) =>
        p.id !== selectedId
          ? p
          : {
              ...p,
              permissions: p.permissions.map((perm) =>
                perm.moduleId === moduleId ? { ...perm, [element]: value } : perm
              ),
            }
      )
    )
    toast.success("Permissão atualizada.")
  }

  function handleUnlink(memberId: string) {
    if (!selected) return
    onUpdateProfiles(
      profiles.map((p) =>
        p.id !== selectedId
          ? p
          : { ...p, memberIds: p.memberIds.filter((id) => id !== memberId) }
      )
    )
    toast.success("Usuário desvinculado do perfil.")
  }

  function handleAddUsers() {
    if (toAdd.length === 0) {
      toast.error("Selecione ao menos um usuário.")
      return
    }
    onUpdateProfiles(
      profiles.map((p) =>
        p.id !== selectedId
          ? p
          : { ...p, memberIds: [...new Set([...p.memberIds, ...toAdd])] }
      )
    )
    toast.success(`${toAdd.length} usuário(s) adicionado(s) ao perfil.`)
    setShowAddModal(false)
    setToAdd([])
    setAddSearch("")
  }

  const profileMembers = selected ? members.filter((m) => selected.memberIds.includes(m.id)) : []

  const addableMembers = members.filter(
    (m) =>
      !selected?.memberIds.includes(m.id) &&
      (m.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(addSearch.toLowerCase()))
  )

  return (
    <div className="flex min-h-0 gap-6">
      {/* Profile list sidebar */}
      <div className="w-44 shrink-0 space-y-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Perfis
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Novo perfil"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedId(p.id)
              setIsCreating(false)
            }}
            className={cn(
              "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
              selectedId === p.id && !isCreating
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            )}
          >
            {p.name}
          </button>
        ))}

        {isCreating && (
          <div className="rounded-md border bg-muted/50 p-3 space-y-2">
            <Input
              placeholder="Nome do perfil"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-7 text-xs"
              autoFocus
            />
            <Input
              placeholder="Descrição"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="h-7 text-xs"
            />
            <div className="flex gap-1.5">
              <Button size="sm" className="h-6 flex-1 text-xs" onClick={handleCreate}>
                Criar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => {
                  setIsCreating(false)
                  setNewName("")
                  setNewDesc("")
                }}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator orientation="vertical" />

      {/* Profile detail */}
      {selected && !isCreating ? (
        <div className="min-w-0 flex-1 overflow-hidden space-y-4">
          <div>
            <h2 className="text-base font-semibold">{selected.name}</h2>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
          </div>
          <Separator />

          <Tabs defaultValue="permissoes">
            <TabsList>
              <TabsTrigger value="permissoes">Permissões de Recursos</TabsTrigger>
              <TabsTrigger value="usuarios">
                Usuários Vinculados
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {profileMembers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Permissions tab – resource matrix */}
            <TabsContent value="permissoes" className="mt-4">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[220px]">Módulo</TableHead>
                      <TableHead className="w-1/2">
                        <div className="flex items-center gap-2">
                          <span className="w-24 shrink-0">Recurso</span>
                          <span>Permissão</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/2">
                        <div className="flex items-center gap-2">
                          <span className="w-24 shrink-0">Recurso</span>
                          <span>Permissão</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemModules.map((mod) => {
                      const perm = selected.permissions.find(
                        (p) => p.moduleId === mod.id
                      ) ?? { moduleId: mod.id, elementX: "nenhum" as Permission, elementY: "nenhum" as Permission }
                      return (
                        <TableRow key={mod.id}>
                          <TableCell className="align-middle text-sm font-medium">{mod.name}</TableCell>
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-2">
                              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{mod.elementX}</span>
                              <PermissionSelect
                                value={perm.elementX}
                                onChange={(v) =>
                                  handlePermissionChange(mod.id, "elementX", v)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-2">
                              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{mod.elementY}</span>
                              <PermissionSelect
                                value={perm.elementY}
                                onChange={(v) =>
                                  handlePermissionChange(mod.id, "elementY", v)
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Users tab */}
            <TabsContent value="usuarios" className="mt-4">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setShowAddModal(true)}>
                    <UserPlus className="mr-1.5 size-3.5" />
                    Adicionar Usuários em Massa
                  </Button>
                </div>
                {profileMembers.length === 0 ? (
                  <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
                    Nenhum usuário vinculado a este perfil.
                  </div>
                ) : (
                  <div className="divide-y rounded-md border">
                    {profileMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                        <Avatar className="size-7">
                          {m.avatar && <AvatarImage src={m.avatar} alt={m.name} />}
                          <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{m.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <StatusBadge status={m.status} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleUnlink(m.id)}
                        >
                          <UserMinus className="mr-1 size-3.5" />
                          Desvincular
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        !isCreating && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Selecione um perfil para gerenciar permissões.
          </div>
        )
      )}

      {/* Add users modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Usuários em Massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar membros..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-60 overflow-y-auto divide-y rounded-md border">
              {addableMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum membro disponível.
                </p>
              ) : (
                addableMembers.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={toAdd.includes(m.id)}
                      onCheckedChange={(checked) =>
                        setToAdd((prev) =>
                          checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                        )
                      }
                    />
                    <Avatar className="size-7">
                      {m.avatar && <AvatarImage src={m.avatar} alt={m.name} />}
                      <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-muted-foreground">{toAdd.length} selecionado(s)</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddModal(false)
                  setToAdd([])
                  setAddSearch("")
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAddUsers}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Section: Workspaces ──────────────────────────────────────────────────────

function WorkspaceMembersDialog({
  workspace,
  members,
  access,
  open,
  onOpenChange,
  onEdit,
}: {
  workspace: Workspace | null
  members: Member[]
  access: Record<string, string[]>
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (workspaceId: string) => void
}) {
  const workspaceMembers = workspace
    ? members.filter((m) => (access[m.id] ?? []).includes(workspace.id))
    : []

  function handleEdit() {
    if (!workspace) return
    onOpenChange(false)
    onEdit(workspace.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Membros em "{workspace?.name}"</DialogTitle>
          <DialogDescription>
            {workspaceMembers.length} pessoa(s) com acesso a este workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {workspaceMembers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum membro com acesso a este workspace.
            </p>
          ) : (
            workspaceMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-muted/40"
              >
                <Avatar className="size-8">
                  {m.avatar && <AvatarImage src={m.avatar} alt={m.name} />}
                  <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {roles.find((r) => r.value === m.role)?.label ?? m.role}
                </Badge>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEdit}>
            <Pencil className="size-3.5" />
            Editar membros e acessos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WorkspaceFormDialog({
  open,
  onOpenChange,
  workspaces,
  editing,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaces: Workspace[]
  editing: Workspace | null
  onSave: (data: { name: string; parentId: string | null; description: string }) => void
}) {
  const [name, setName] = useState("")
  const [parentId, setParentId] = useState("none")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "")
      setParentId(editing?.parentId ?? "none")
      setDescription(editing?.description ?? "")
    }
  }, [open, editing])

  function handleSave() {
    if (!name.trim()) {
      toast.error("Informe um nome para o workspace.")
      return
    }
    onSave({
      name: name.trim(),
      parentId: parentId === "none" ? null : parentId,
      description: description.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Workspace" : "Novo Workspace"}</DialogTitle>
          <DialogDescription>
            Workspaces podem ter outros workspaces abaixo deles, formando uma hierarquia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-form-name">Nome</Label>
            <Input
              id="ws-form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Qualidade"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Workspace pai</Label>
            <Select value={parentId} onValueChange={(v) => setParentId(v ?? "none")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nenhum (nível 1)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (nível 1)</SelectItem>
                {workspaces
                  .filter((w) => w.id !== editing?.id)
                  .map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-form-desc">Descrição</Label>
            <Textarea
              id="ws-form-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? "Salvar alterações" : "Criar workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Section: Segurança e Privacidade ─────────────────────────────────────────

function SegurancaSection({
  workspaces,
  members,
  access,
  onNavigateToGeral,
}: {
  workspaces: Workspace[]
  members: Member[]
  access: Record<string, string[]>
  onNavigateToGeral: (workspaceId: string) => void
}) {
  const [selectedId, setSelectedId] = useState("1")
  const workspace = workspaces.find((w) => w.id === selectedId) ?? workspaces[0]
  const [privacy, setPrivacy] = useState<PrivacyLevel>("fechado")
  const [pendingPrivacy, setPendingPrivacy] = useState<PrivacyLevel | null>(null)
  const [inheritance, setInheritance] = useState(true)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)

  const workspaceMembers = members.filter((m) => (access[m.id] ?? []).includes(workspace.id))

  function handlePrivacySelect(value: PrivacyLevel) {
    if (privacy !== "privado" && value === "privado") {
      setPendingPrivacy(value)
      return
    }
    setPrivacy(value)
    toast.success("Nível de privacidade atualizado.")
  }

  function confirmPrivacy() {
    if (pendingPrivacy) {
      setPrivacy(pendingPrivacy)
      setPendingPrivacy(null)
      toast.success("Workspace alterado para Privado.")
    }
  }

  const options: {
    value: PrivacyLevel
    label: string
    description: string
    icon: React.ReactNode
  }[] = [
    {
      value: "aberto",
      label: "Aberto",
      description: "Todos na organização podem ver e entrar livremente neste workspace.",
      icon: <Globe className="size-5 text-green-600" />,
    },
    {
      value: "fechado",
      label: "Fechado",
      description:
        "Visível para toda a organização, mas a entrada exige aprovação do Admin.",
      icon: <Shield className="size-5 text-yellow-600" />,
    },
    {
      value: "privado",
      label: "Privado",
      description:
        "Invisível para a organização. Entrada apenas por convite explícito do Admin.",
      icon: <Lock className="size-5 text-red-500" />,
    },
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold">Segurança e Privacidade</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Controle a visibilidade do workspace e como as permissões se propagam.
        </p>
      </div>
      <Separator />

      <div className="space-y-1.5">
        <Label>Workspace</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex w-full h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <Building2 className="size-4 text-muted-foreground" />
            {workspace.name}
            <span className="ml-auto text-xs text-muted-foreground">Trocar</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setSelectedId(ws.id)}
                className={cn("text-sm", ws.id === selectedId && "font-medium")}
              >
                <Building2 className="size-3.5" />
                {ws.name}
                {ws.id === selectedId && (
                  <span className="ml-auto text-muted-foreground">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Who's inside this workspace */}
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {workspaceMembers.slice(0, 5).map((m) => (
              <Avatar key={m.id} className="size-7 ring-2 ring-background">
                {m.avatar && <AvatarImage src={m.avatar} alt={m.name} />}
                <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
              </Avatar>
            ))}
            {workspaceMembers.length === 0 && (
              <Users className="size-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {workspaceMembers.length}{" "}
              {workspaceMembers.length === 1 ? "membro tem" : "membros têm"} acesso a este
              workspace
            </p>
            <p className="text-xs text-muted-foreground">
              Veja quem está dentro de "{workspace.name}".
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setMembersDialogOpen(true)}>
          Ver membros
        </Button>
      </div>

      {/* Privacy level – radio cards */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Nível de Privacidade do Workspace</Label>
        <div className="space-y-2.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePrivacySelect(opt.value)}
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all",
                privacy === opt.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
              )}
            >
              <div className="mt-0.5 shrink-0">{opt.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {privacy === opt.value && (
                    <Badge variant="secondary" className="text-xs">
                      Atual
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {opt.description}
                </p>
              </div>
              <div
                className={cn(
                  "mt-0.5 size-4 shrink-0 rounded-full border-2",
                  privacy === opt.value ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Inheritance toggle */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Governança de Herança</Label>
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Herdar membros e perfis automaticamente</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Novos projetos e pastas criados neste workspace herdarão automaticamente os membros e
              perfis configurados aqui. Quando desativado, novos itens nascem privados.
            </p>
          </div>
          <Switch
            checked={inheritance}
            onCheckedChange={(v) => {
              setInheritance(v)
              toast.success(v ? "Herança automática ativada." : "Novos projetos nascerão privados.")
            }}
          />
        </div>
      </div>

      <WorkspaceMembersDialog
        workspace={workspace}
        members={members}
        access={access}
        open={membersDialogOpen}
        onOpenChange={setMembersDialogOpen}
        onEdit={onNavigateToGeral}
      />

      {/* Destructive confirmation modal */}
      <AlertDialog
        open={pendingPrivacy === "privado"}
        onOpenChange={(open) => !open && setPendingPrivacy(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Tornar workspace Privado?
            </AlertDialogTitle>
            <AlertDialogDescription
              render={<div className="space-y-2 text-sm" />}
            >
              <p>
                Você está prestes a tornar este workspace{" "}
                <strong>invisível</strong> para toda a organização.
              </p>
              <p>
                Membros que acessam por visibilidade organizacional{" "}
                <strong>perderão o acesso imediatamente</strong>. Apenas
                membros explicitamente convidados continuarão com acesso.
              </p>
              <p className="font-medium text-destructive">
                Esta ação remove o acesso de forma imediata e não pode ser desfeita sem uma nova
                alteração manual.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPrivacy(null)}>
              Cancelar — manter configuração atual
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmPrivacy}
            >
              Sim, tornar Privado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const navGroups: Array<{ label: string; items: { key: Section; label: string }[] }> = [
  {
    label: "Conta",
    items: [
      { key: "conta", label: "Minha Conta" },
      { key: "personalizacao", label: "Personalização" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { key: "geral", label: "Geral" },
      { key: "perfis", label: "Perfis e Recursos" },
      { key: "seguranca", label: "Segurança e Privacidade" },
    ],
  },
]

export default function ConfiguracoesPage() {
  const [section, setSection] = useState<Section>("conta")
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles)
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces)
  const [workspaceAccess, setWorkspaceAccess] = useState<Record<string, string[]>>(initialWorkspaceAccess)
  const [geralWorkspaceId, setGeralWorkspaceId] = useState(initialWorkspaces[0]?.id ?? "1")

  const navigate = useNavigate()
  const { setOpen } = useSidebar()

  useEffect(() => {
    setOpen(false)
    return () => setOpen(true)
  }, [setOpen])


  function updateMember(id: string, changes: Partial<Member>) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)))
  }

  function toggleWorkspaceAccess(userId: string, wsId: string, granted: boolean) {
    setWorkspaceAccess((prev) => {
      const current = prev[userId] ?? []
      const updated = granted
        ? [...new Set([...current, wsId])]
        : current.filter((id) => id !== wsId)
      return { ...prev, [userId]: updated }
    })
    const userName = members.find((m) => m.id === userId)?.name ?? userId
    const wsName = workspaces.find((w) => w.id === wsId)?.name ?? wsId
    if (granted) {
      toast.success(`${userName} agora tem acesso ao workspace "${wsName}".`)
    } else {
      toast(`Acesso de ${userName} ao workspace "${wsName}" removido.`)
    }
  }

  function createWorkspace(data: { name: string; parentId: string | null; description: string }) {
    setWorkspaces((prev) => [...prev, { id: `w${Date.now()}`, ...data }])
  }

  function updateWorkspace(
    id: string,
    data: { name: string; parentId: string | null; description: string }
  ) {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)))
  }

  function deleteWorkspace(id: string) {
    setWorkspaces((prev) => prev.map((w) => (w.parentId === id ? { ...w, parentId: null } : w)).filter((w) => w.id !== id))
    setWorkspaceAccess((prev) => {
      const next: Record<string, string[]> = {}
      for (const [userId, ids] of Object.entries(prev)) {
        next[userId] = ids.filter((wsId) => wsId !== id)
      }
      return next
    })
  }

  function handleBack() {
    setOpen(true)
    navigate(-1)
  }

  function goToWorkspaceInGeral(workspaceId: string) {
    setGeralWorkspaceId(workspaceId)
    setSection("geral")
  }

  return (
    <>
      <PageHeader
        title="Configurações"
        trigger={
          <button
            onClick={handleBack}
            className="-ml-1 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Fechar configurações"
          >
            <X className="size-4" />
          </button>
        }
        actions={
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Voltar à plataforma
          </Button>
        }
      />

      <div className="flex h-[calc(100svh-57px)] flex-col overflow-hidden">
        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Internal sidebar nav */}
          <aside className="w-56 shrink-0 border-r bg-muted/20 p-4">
            {navGroups.map((group, gi) => (
              <div key={group.label} className={cn("space-y-0.5", gi > 0 && "mt-4 pt-4 border-t")}>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSection(item.key)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      section === item.key
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-6">
            {section === "conta" && <ContaSection />}
            {section === "personalizacao" && <PersonalizacaoSection />}
            {section === "geral" && (
              <GeralSection
                workspaces={workspaces}
                members={members}
                profiles={profiles}
                access={workspaceAccess}
                selectedId={geralWorkspaceId}
                onSelectWorkspace={setGeralWorkspaceId}
                onUpdateMember={updateMember}
                onToggleAccess={toggleWorkspaceAccess}
                onCreateWorkspace={createWorkspace}
                onUpdateWorkspace={updateWorkspace}
                onDeleteWorkspace={deleteWorkspace}
              />
            )}
            {section === "perfis" && (
              <PerfisSection
                profiles={profiles}
                members={members}
                onUpdateProfiles={setProfiles}
              />
            )}
            {section === "seguranca" && (
              <SegurancaSection
                workspaces={workspaces}
                members={members}
                access={workspaceAccess}
                onNavigateToGeral={goToWorkspaceInGeral}
              />
            )}
          </main>
        </div>
      </div>
    </>
  )
}
