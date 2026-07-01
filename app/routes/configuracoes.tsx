import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Camera,
  Globe,
  Moon,
  Sun,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  UserMinus,
  UserPlus,
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

type Section = "conta" | "personalizacao" | "geral" | "membros" | "perfis" | "acesso" | "seguranca"
type ThemeMode = "tradicional" | "minimalista" | "colorido"
type AccessRole = "admin" | "membro" | "visualizador" | "convidado"
type PrivacyLevel = "aberto" | "fechado" | "privado"
type Permission = "editor" | "leitor" | "ocultar"
type MemberStatus = "ativo" | "pendente" | "desativado"

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

const workspaces = [
  { id: "1", name: "Geral" },
  { id: "2", name: "Projeto Piloto" },
  { id: "3", name: "Fornecedores ESG" },
]

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

// workspaceAccess: userId → workspaceId[]
const initialWorkspaceAccess: Record<string, string[]> = {
  m1: ["1", "2", "3"],
  m2: ["1", "2"],
  m3: ["1"],
  m4: ["1"],
  m5: ["1", "3"],
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

function PersonalizacaoSection() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme-mode") as ThemeMode) ?? "tradicional"
  })
  const [accentKey, setAccentKey] = useState(() => {
    return localStorage.getItem("accent-color") ?? "roxo"
  })
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  )

  const accent = accentColors.find((c) => c.key === accentKey) ?? accentColors[0]

  const themeOptions = [
    {
      key: "tradicional" as ThemeMode,
      label: "Tradicional",
      description: "Interface padrão com identidade visual completa.",
      sidebar: accent.darkSidebar,
      primary: accent.swatch,
      bg: "#ffffff",
    },
    {
      key: "minimalista" as ThemeMode,
      label: "Minimalista",
      description: "Cor apenas em sinais semânticos e gráficos.",
      sidebar: "#1a1a1a",
      primary: "#737373",
      bg: "#ffffff",
    },
    {
      key: "colorido" as ThemeMode,
      label: "Colorido",
      description: "Cores mais presentes em toda a interface.",
      sidebar: accent.colorfulSidebar,
      primary: accent.swatch,
      bg: "#fdf4ff",
    },
  ]

  function applyTheme(mode: ThemeMode) {
    setThemeMode(mode)
    document.documentElement.classList.remove("theme-minimal", "theme-colorful")
    if (mode === "minimalista") document.documentElement.classList.add("theme-minimal")
    if (mode === "colorido") document.documentElement.classList.add("theme-colorful")
    localStorage.setItem("theme-mode", mode)
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

  function toggleDark(checked: boolean) {
    setDarkMode(checked)
    if (checked) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

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
        <div className="grid grid-cols-3 gap-3">
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
                      <div className="h-1.5 w-3/4 rounded-full bg-black/10" />
                      <div className="h-1.5 w-1/2 rounded-full bg-black/10" />
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
      </div>

      {/* Modo noturno */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold">Brilho</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Ajuste o fundo geral da interface.
          </p>
        </div>
        <Separator />
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="size-5 text-muted-foreground" />
            ) : (
              <Sun className="size-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Modo noturno</p>
              <p className="text-xs text-muted-foreground">
                Ativa o fundo escuro em toda a plataforma.
              </p>
            </div>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDark} />
        </div>
      </div>
    </div>
  )
}

// ─── Section: Geral ───────────────────────────────────────────────────────────

const workspaceDescriptions: Record<string, string> = {
  "1": "Workspace principal para gestão de ESG e indicadores de impacto.",
  "2": "Workspace dedicado ao projeto piloto de ESG.",
  "3": "Workspace para avaliação e monitoramento de fornecedores ESG.",
}

function GeralSection({ initialWorkspaceId = "1" }: { initialWorkspaceId?: string }) {
  const [selectedId, setSelectedId] = useState(initialWorkspaceId)
  const workspace = workspaces.find((w) => w.id === selectedId) ?? workspaces[0]
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspaceDescriptions[selectedId] ?? "")

  function handleWorkspaceChange(id: string) {
    setSelectedId(id)
    const ws = workspaces.find((w) => w.id === id)
    if (ws) setName(ws.name)
    setDescription(workspaceDescriptions[id] ?? "")
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold">Informações do Workspace</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Nome e descrição visíveis para todos os membros.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
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
                  onClick={() => handleWorkspaceChange(ws.id)}
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
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => toast.success("Configurações salvas com sucesso.")}>
          Salvar alterações
        </Button>
      </div>
    </div>
  )
}

// ─── Section: Membros e Acessos ───────────────────────────────────────────────

function MembrosSection({
  members,
  profiles,
  onUpdateMember,
}: {
  members: Member[]
  profiles: UserProfile[]
  onUpdateMember: (id: string, changes: Partial<Member>) => void
}) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [filterRole, setFilterRole] = useState("todos")
  const [filterProfile, setFilterProfile] = useState("todos")
  const [inviteEmail, setInviteEmail] = useState("")

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "todos" || m.status === filterStatus
    const matchRole = filterRole === "todos" || m.role === filterRole
    const matchProfile =
      filterProfile === "todos" ||
      (filterProfile === "sem-perfil" ? !m.profileId : m.profileId === filterProfile)
    return matchSearch && matchStatus && matchRole && matchProfile
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
    toast.success(`Convite enviado para ${inviteEmail}.`)
    setInviteEmail("")
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Membros e Acessos</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie quem tem acesso a este workspace e seus níveis de permissão.
        </p>
      </div>
      <Separator />

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
            className="pl-8 w-64"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
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
        <Select value={filterRole} onValueChange={setFilterRole}>
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
        <Select value={filterProfile} onValueChange={setFilterProfile}>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Membro</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="w-[190px]">Nível de Acesso</TableHead>
              <TableHead className="w-[160px]">Perfil</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[44px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => (
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
                  <TableCell>
                    {/* Module 2: Role select with descriptions */}
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
                  <TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
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

// ─── Section: Acesso por Workspace ───────────────────────────────────────────

function AcessoSection({
  members,
  workspaces,
  access,
  onToggle,
}: {
  members: Member[]
  workspaces: { id: string; name: string }[]
  access: Record<string, string[]>
  onToggle: (userId: string, workspaceId: string, granted: boolean) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  )

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("")
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Acesso por Workspace</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Defina quais workspaces cada usuário pode acessar. Um usuário pode ter acesso a múltiplos workspaces simultaneamente.
        </p>
      </div>
      <Separator />

      <div className="relative max-w-xs">
        <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[220px]">Usuário</TableHead>
              {workspaces.map((ws) => (
                <TableHead key={ws.id} className="text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-medium">{ws.name}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[80px] text-center text-xs text-muted-foreground">
                Acessos
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={workspaces.length + 2}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => {
                const memberAccess = access[member.id] ?? []
                const count = memberAccess.length
                return (
                  <TableRow key={member.id} className={cn(member.status === "desativado" && "opacity-50")}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                          <AvatarFallback className="text-xs">{initials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    {workspaces.map((ws) => {
                      const hasAccess = memberAccess.includes(ws.id)
                      return (
                        <TableCell key={ws.id} className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={hasAccess}
                              onCheckedChange={(v) => onToggle(member.id, ws.id, v)}
                              aria-label={`${member.name} acesso a ${ws.name}`}
                            />
                          </div>
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs tabular-nums",
                          count === 0 && "text-muted-foreground"
                        )}
                      >
                        {count}/{workspaces.length}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Alterações são salvas automaticamente. Usuários desativados não podem acessar nenhum workspace independentemente desta configuração.
      </p>
    </div>
  )
}

// ─── Section: Segurança e Privacidade ─────────────────────────────────────────

function SegurancaSection() {
  const [selectedId, setSelectedId] = useState("1")
  const workspace = workspaces.find((w) => w.id === selectedId) ?? workspaces[0]
  const [privacy, setPrivacy] = useState<PrivacyLevel>("fechado")
  const [pendingPrivacy, setPendingPrivacy] = useState<PrivacyLevel | null>(null)
  const [inheritance, setInheritance] = useState(true)

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
      { key: "membros", label: "Membros e Acessos" },
      { key: "perfis", label: "Perfis e Recursos" },
      { key: "acesso", label: "Acesso por Workspace" },
      { key: "seguranca", label: "Segurança e Privacidade" },
    ],
  },
]

export default function ConfiguracoesPage() {
  const [section, setSection] = useState<Section>("conta")
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles)
  const [workspaceAccess, setWorkspaceAccess] = useState<Record<string, string[]>>(initialWorkspaceAccess)

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

  function handleBack() {
    setOpen(true)
    navigate(-1)
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
            {section === "geral" && <GeralSection />}
            {section === "membros" && (
              <MembrosSection
                members={members}
                profiles={profiles}
                onUpdateMember={updateMember}
              />
            )}
            {section === "perfis" && (
              <PerfisSection
                profiles={profiles}
                members={members}
                onUpdateProfiles={setProfiles}
              />
            )}
            {section === "acesso" && (
              <AcessoSection
                members={members}
                workspaces={workspaces}
                access={workspaceAccess}
                onToggle={toggleWorkspaceAccess}
              />
            )}
            {section === "seguranca" && <SegurancaSection />}
          </main>
        </div>
      </div>
    </>
  )
}
