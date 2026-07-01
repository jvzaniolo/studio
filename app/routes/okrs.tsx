import { useEffect, useState } from "react"
import {
  Plus, Search, MoreHorizontal, ChevronRight, ChevronDown, Edit2, Trash2, Link2,
  Target, TrendingUp, AlertTriangle, AlertOctagon, CheckCircle2, X, Sparkles,
  Building2, Users, GitBranch, Lock, Settings2, History, ThumbsUp, ThumbsDown,
} from "lucide-react"

import { PageHeader } from "~/components/page-header"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Separator } from "~/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select"
import { Card, CardContent } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "~/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"
import {
  KPI_CATALOG, useOkrShared, registerKeyResults,
  linkKrIniciativa, unlinkKrIniciativa,
  getIniciativasForKr, type RegistryItem,
} from "~/lib/okr-shared"

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "no_prazo" | "atencao" | "risco" | "concluido"
type CicloTipo = "trimestre" | "semestre" | "ano"
type CicloStatus = "rascunho" | "ativo" | "encerrado"
type Nivel = "empresa" | "time"
type KRTipo = "manual" | "auto" | "binario"
type Perspectiva = "Financeiro" | "Clientes" | "Processos" | "Pessoas" | "Personalizada"

interface Ciclo {
  id: string
  nome: string
  tipo: CicloTipo
  dataInicio: string
  dataFim: string
  status: CicloStatus
}

interface CheckIn {
  id: string
  data: string
  usuario: string
  valorAnterior: number
  valorNovo: number
  comentario: string
}

interface SubKR {
  id: string
  descricao: string
  atual: number
  meta: number
  unidade: string
}

interface KeyResult {
  id: string
  descricao: string
  tipo: KRTipo
  atual: number
  meta: number
  unidade: string
  concluido: boolean
  kpiId: string | null
  subResultados: SubKR[]
  historico: CheckIn[]
}

interface Objetivo {
  id: string
  cicloId: string
  nome: string
  descricao: string
  responsavel: { nome: string; iniciais: string }
  nivel: Nivel
  time: string | null
  peso: number
  perspectiva: string
  keyResults: KeyResult[]
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const TODAY = "2026-07-01"

const USERS = [
  { nome: "Ana Lima", iniciais: "AL" },
  { nome: "Bruno Carvalho", iniciais: "BC" },
  { nome: "Carla Mendes", iniciais: "CM" },
  { nome: "Diego Rocha", iniciais: "DR" },
  { nome: "Elena Souza", iniciais: "ES" },
]

const TEAMS = ["RH", "Diversidade & Inclusão", "People Analytics", "Desenvolvimento", "Sustentabilidade", "Cultura"]

const PERSPECTIVA_PRESETS: Perspectiva[] = ["Financeiro", "Clientes", "Processos", "Pessoas", "Personalizada"]

const PERSPECTIVA_CONFIG: Record<string, { bg: string; color: string }> = {
  Financeiro: { bg: "bg-blue-100", color: "text-blue-700" },
  Clientes: { bg: "bg-green-100", color: "text-green-700" },
  Processos: { bg: "bg-amber-100", color: "text-amber-700" },
  Pessoas: { bg: "bg-violet-100", color: "text-violet-700" },
}

function perspectivaStyle(p: string): { bg: string; color: string } {
  return PERSPECTIVA_CONFIG[p] ?? { bg: "bg-muted", color: "text-muted-foreground" }
}

const AREA_BY_TEAM: Record<string, string> = {
  "RH": "Pessoas & Cultura",
  "Diversidade & Inclusão": "Pessoas & Cultura",
  "People Analytics": "Pessoas & Cultura",
  "Desenvolvimento": "Pessoas & Cultura",
  "Cultura": "Pessoas & Cultura",
  "Sustentabilidade": "ESG & Sustentabilidade",
}

const INITIAL_CICLOS: Ciclo[] = [
  { id: "CIC-2026-Q1", nome: "Q1 2026", tipo: "trimestre", dataInicio: "2026-01-01", dataFim: "2026-03-31", status: "encerrado" },
  { id: "CIC-2026-Q2", nome: "Q2 2026", tipo: "trimestre", dataInicio: "2026-04-01", dataFim: "2026-06-30", status: "encerrado" },
  { id: "CIC-2026-Q3", nome: "Q3 2026", tipo: "trimestre", dataInicio: "2026-07-01", dataFim: "2026-09-30", status: "ativo" },
  { id: "CIC-2026-Q4", nome: "Q4 2026", tipo: "trimestre", dataInicio: "2026-10-01", dataFim: "2026-12-31", status: "rascunho" },
]

const INITIAL_OBJETIVOS: Objetivo[] = [
  {
    id: "OBJ-000",
    cicloId: "CIC-2026-Q3",
    nome: "Consolidar a Humanizadas como referência em gestão humanizada até 2027",
    descricao: "Objetivo estratégico que orienta os OKRs de todas as áreas — colocar pessoas no centro da operação sem abrir mão de performance.",
    responsavel: { nome: "Ana Lima", iniciais: "AL" },
    nivel: "empresa",
    time: null,
    peso: 5,
    perspectiva: "Pessoas",
    keyResults: [
      { id: "OBJ-000-kr1", descricao: "Elevar o índice de saúde organizacional (eNPS + engajamento) para 65 pontos", tipo: "manual", atual: 58, meta: 65, unidade: "pts", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-000-kr2", descricao: "Manter todas as áreas com OKRs ativos publicados", tipo: "manual", atual: 5, meta: 6, unidade: "áreas", concluido: false, kpiId: null, subResultados: [], historico: [] },
    ],
  },
  {
    id: "OBJ-001",
    cicloId: "CIC-2026-Q3",
    nome: "Aumentar eNPS para 60 até Q4",
    descricao: "Elevar o índice de satisfação e engajamento dos colaboradores através de ações de escuta ativa e reconhecimento.",
    responsavel: { nome: "Ana Lima", iniciais: "AL" },
    nivel: "time",
    time: "RH",
    peso: 4,
    perspectiva: "Pessoas",
    keyResults: [
      {
        id: "OBJ-001-kr1", descricao: "Elevar eNPS de 42 para 60 pontos (sincronizado com a Pesquisa de Clima)", tipo: "auto",
        atual: 48, meta: 60, unidade: "pts", concluido: false, kpiId: "kpi1", subResultados: [], historico: [],
      },
      {
        id: "OBJ-001-kr2", descricao: "Lançar canal de escuta contínua", tipo: "binario", atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null,
        subResultados: [],
        historico: [
          { id: "ck1", data: "2026-06-15", usuario: "Ana Lima", valorAnterior: 0, valorNovo: 1, comentario: "Canal lançado com pesquisa mensal para todo o público interno." },
        ],
      },
      {
        id: "OBJ-001-kr3", descricao: "Realizar 4 rodadas de pulse survey", tipo: "manual", atual: 3, meta: 4, unidade: "rodadas", concluido: false, kpiId: null,
        subResultados: [
          { id: "sub1", descricao: "Rodada — RH corporativo", atual: 1, meta: 1, unidade: "rodada" },
          { id: "sub2", descricao: "Rodada — canteiros de obra", atual: 2, meta: 3, unidade: "rodadas" },
        ],
        historico: [],
      },
    ],
  },
  {
    id: "OBJ-002",
    cicloId: "CIC-2026-Q3",
    nome: "Atingir 40% de liderança feminina",
    descricao: "Aumentar a representatividade feminina em posições de liderança executiva.",
    responsavel: { nome: "Carla Mendes", iniciais: "CM" },
    nivel: "time",
    time: "Diversidade & Inclusão",
    peso: 3,
    perspectiva: "Pessoas",
    keyResults: [
      { id: "OBJ-002-kr1", descricao: "Elevar liderança feminina de 28% para 40% (via KPI de Diversidade)", tipo: "auto", atual: 32, meta: 40, unidade: "%", concluido: false, kpiId: "kpi2", subResultados: [], historico: [] },
      { id: "OBJ-002-kr2", descricao: "Formar 2 coortes do programa acelerador", tipo: "manual", atual: 1, meta: 2, unidade: "coortes", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-002-kr3", descricao: "Mapear pipeline de sucessão diverso", tipo: "manual", atual: 60, meta: 100, unidade: "%", concluido: false, kpiId: null, subResultados: [], historico: [] },
    ],
  },
  {
    id: "OBJ-003",
    cicloId: "CIC-2026-Q2",
    nome: "Reduzir turnover voluntário em 15%",
    descricao: "Diminuir a rotatividade voluntária através de um novo ciclo de performance contínuo.",
    responsavel: { nome: "Bruno Carvalho", iniciais: "BC" },
    nivel: "time",
    time: "People Analytics",
    peso: 3,
    perspectiva: "Processos",
    keyResults: [
      { id: "OBJ-003-kr1", descricao: "Implementar check-ins trimestrais em todas as áreas", tipo: "binario", atual: 100, meta: 100, unidade: "%", concluido: true, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-003-kr2", descricao: "Calibrar performance com comitê", tipo: "manual", atual: 3, meta: 4, unidade: "ciclos", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-003-kr3", descricao: "Reduzir turnover voluntário para 8,2%", tipo: "manual", atual: 7, meta: 10, unidade: "pp reduzidos", concluido: false, kpiId: null, subResultados: [], historico: [] },
    ],
  },
  {
    id: "OBJ-004",
    cicloId: "CIC-2026-Q2",
    nome: "Certificação ESG Tier 1",
    descricao: "Obter a certificação ESG Tier 1 junto ao Instituto Ethos, com diagnóstico, plano de adequação e auditoria externa.",
    responsavel: { nome: "Carla Mendes", iniciais: "CM" },
    nivel: "time",
    time: "Sustentabilidade",
    peso: 4,
    perspectiva: "ESG & Compliance",
    keyResults: [
      { id: "OBJ-004-kr1", descricao: "Concluir diagnóstico e plano de adequação", tipo: "binario", atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-004-kr2", descricao: "Publicar relatório GRI", tipo: "binario", atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-004-kr3", descricao: "Obter aprovação em auditoria externa", tipo: "binario", atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null, subResultados: [], historico: [] },
    ],
  },
  {
    id: "OBJ-005",
    cicloId: "CIC-2026-Q3",
    nome: "Implementar academia interna de competências",
    descricao: "Criar trilhas de aprendizagem digital para desenvolver competências analíticas e digital mindset em toda a força de trabalho.",
    responsavel: { nome: "Diego Rocha", iniciais: "DR" },
    nivel: "time",
    time: "Desenvolvimento",
    peso: 2,
    perspectiva: "Pessoas",
    keyResults: [
      { id: "OBJ-005-kr1", descricao: "Lançar 3 trilhas de aprendizagem digital", tipo: "manual", atual: 1, meta: 3, unidade: "trilhas", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-005-kr2", descricao: "Capacitar 200 colaboradores", tipo: "manual", atual: 22, meta: 200, unidade: "pessoas", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-005-kr3", descricao: "Firmar parceria com EdTechs", tipo: "manual", atual: 1, meta: 2, unidade: "parcerias", concluido: false, kpiId: null, subResultados: [], historico: [] },
    ],
  },
  {
    id: "OBJ-006",
    cicloId: "CIC-2026-Q1",
    nome: "Elevar cobertura de segurança psicológica",
    descricao: "Ampliar a cultura de segurança psicológica através de treinamentos e canais de escuta para lideranças.",
    responsavel: { nome: "Elena Souza", iniciais: "ES" },
    nivel: "time",
    time: "Cultura",
    peso: 2,
    perspectiva: "Pessoas",
    keyResults: [
      { id: "OBJ-006-kr1", descricao: "Treinar lideranças em segurança psicológica", tipo: "manual", atual: 18, meta: 100, unidade: "%", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-006-kr2", descricao: "Lançar pesquisa de clima trimestral", tipo: "binario", atual: 0, meta: 1, unidade: "un", concluido: false, kpiId: null, subResultados: [], historico: [] },
    ],
  },
  {
    id: "OBJ-007",
    cicloId: "CIC-2026-Q4",
    nome: "Elevar o eNPS das lideranças via escuta contínua",
    descricao: "Rascunho do próximo ciclo — usar dados da Pesquisa de Clima para monitorar continuamente o sentimento das lideranças antes de publicar o ciclo.",
    responsavel: { nome: "Ana Lima", iniciais: "AL" },
    nivel: "time",
    time: "RH",
    peso: 3,
    perspectiva: "Pessoas",
    keyResults: [
      { id: "OBJ-007-kr1", descricao: "Elevar eNPS das lideranças de 55 para 70 pontos", tipo: "manual", atual: 55, meta: 70, unidade: "pts", concluido: false, kpiId: null, subResultados: [], historico: [] },
      { id: "OBJ-007-kr2", descricao: "Publicar dashboard de sentimento por liderança", tipo: "binario", atual: 0, meta: 1, unidade: "un", concluido: false, kpiId: null, subResultados: [], historico: [] },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",")
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y.slice(2)}`
}

function resolveKr(kr: KeyResult): { atual: number; meta: number; unidade: string } {
  if (kr.kpiId) {
    const kpi = KPI_CATALOG.find((k) => k.id === kr.kpiId)
    if (kpi) return { atual: kpi.valor_atual, meta: kpi.meta, unidade: kpi.unidade }
  }
  return { atual: kr.atual, meta: kr.meta, unidade: kr.unidade }
}

function subProgress(sub: SubKR): number {
  if (sub.meta <= 0) return 0
  return clampPct((sub.atual / sub.meta) * 100)
}

function krProgress(kr: KeyResult): number {
  if (kr.subResultados.length > 0) {
    const total = kr.subResultados.reduce((s, sub) => s + subProgress(sub), 0)
    return clampPct(total / kr.subResultados.length)
  }
  if (kr.tipo === "binario") return kr.concluido ? 100 : 0
  const { atual, meta } = resolveKr(kr)
  if (meta <= 0) return 0
  return clampPct((atual / meta) * 100)
}

function objProgress(obj: Objetivo): number {
  if (obj.keyResults.length === 0) return 0
  const total = obj.keyResults.reduce((s, kr) => s + krProgress(kr), 0)
  return clampPct(total / obj.keyResults.length)
}

/** Status é sempre calculado a partir dos KRs — nunca inserido manualmente. */
function objStatus(progress: number): Status {
  if (progress >= 100) return "concluido"
  if (progress >= 70) return "no_prazo"
  if (progress >= 40) return "atencao"
  return "risco"
}

function weightedProgress(objs: Objetivo[]): number {
  const totalPeso = objs.reduce((s, o) => s + o.peso, 0)
  if (totalPeso === 0) return 0
  return clampPct(objs.reduce((s, o) => s + objProgress(o) * o.peso, 0) / totalPeso)
}

function isPrazoVencido(obj: Objetivo, progress: number, ciclos: Ciclo[]): boolean {
  const ciclo = ciclos.find((c) => c.id === obj.cicloId)
  return progress < 100 && !!ciclo && ciclo.dataFim < TODAY
}

function nextObjId(objetivos: Objetivo[]): string {
  return "OBJ-" + String(objetivos.length).padStart(3, "0") + "-" + Math.random().toString(36).slice(2, 5)
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.FC<{ className?: string }> }> = {
  no_prazo: { label: "No prazo", color: "text-blue-700", bg: "bg-blue-100", icon: TrendingUp },
  atencao: { label: "Atenção", color: "text-amber-700", bg: "bg-amber-100", icon: AlertTriangle },
  risco: { label: "Em risco", color: "text-red-700", bg: "bg-red-100", icon: AlertOctagon },
  concluido: { label: "Concluído", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
}

const CICLO_STATUS_CONFIG: Record<CicloStatus, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "text-amber-700", bg: "bg-amber-50 border border-amber-200" },
  ativo: { label: "Ativo", color: "text-green-700", bg: "bg-green-100" },
  encerrado: { label: "Encerrado", color: "text-muted-foreground", bg: "bg-muted" },
}

const CICLO_TIPO_LABEL: Record<CicloTipo, string> = {
  trimestre: "Trimestre",
  semestre: "Semestre",
  ano: "Ano",
}

// Base UI's <Select> only renders the selected item's label via `items` — passing
// just <SelectItem> children shows the raw value instead. See base-vs-radix notes.
const CICLO_TIPO_ITEMS = [
  { label: "Trimestre", value: "trimestre" },
  { label: "Semestre", value: "semestre" },
  { label: "Ano", value: "ano" },
]
const NIVEL_ITEMS = [
  { label: "Time", value: "time" },
  { label: "Empresa", value: "empresa" },
]
const PESO_ITEMS = [1, 2, 3, 4, 5].map((p) => ({ label: `×${p}`, value: String(p) }))
const PERSPECTIVA_ITEMS = PERSPECTIVA_PRESETS.map((p) => ({ label: p, value: p }))
const KR_TIPO_ITEMS: { label: string; value: KRTipo }[] = [
  { label: "Manual", value: "manual" },
  { label: "Auto (via KPI)", value: "auto" },
  { label: "Binário (Sim/Não)", value: "binario" },
]
const KR_TIPO_LABEL: Record<KRTipo, string> = {
  manual: "Manual",
  auto: "Auto",
  binario: "Binário",
}
const KPI_SELECT_ITEMS_DETAILED = KPI_CATALOG.map((k) => ({
  label: `${k.nome} — ${k.valor_atual}/${k.meta} ${k.unidade}`,
  value: k.id,
}))
const KPI_SELECT_ITEMS_WITH_NONE = [
  { label: "Nenhum — valor manual", value: "none" },
  ...KPI_CATALOG.map((k) => ({ label: k.nome, value: k.id })),
]

// ─── AI Coach heuristics ─────────────────────────────────────────────────────

const VERBOS_FORTES = [
  "aumentar", "reduzir", "elevar", "atingir", "implementar", "lançar", "criar",
  "consolidar", "garantir", "ampliar", "diminuir", "dobrar", "triplicar",
  "alcançar", "obter", "construir", "fortalecer", "manter",
]

function precisaMelhorRedacao(nome: string): boolean {
  const lower = nome.toLowerCase()
  const temVerboForte = VERBOS_FORTES.some((v) => lower.startsWith(v))
  const temNumero = /\d/.test(nome)
  return !(temVerboForte && temNumero)
}

// ─── Small UI helpers ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  )
}

function CicloBadge({ ciclo }: { ciclo: Ciclo | undefined }) {
  if (!ciclo) return null
  const cfg = CICLO_STATUS_CONFIG[ciclo.status]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
      {ciclo.status === "rascunho" && <Lock className="size-3" />}
      {ciclo.nome}
    </span>
  )
}

function AvatarInitials({ iniciais, size = 24 }: { iniciais: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-violet-100 text-violet-700 font-medium text-xs shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {iniciais}
    </span>
  )
}

// ─── Sub-KR row ──────────────────────────────────────────────────────────────

function SubKrRow({ sub, onUpdate, onRemove }: { sub: SubKR; onUpdate: (atual: number) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(sub.atual))
  const progress = subProgress(sub)

  function save() {
    const parsed = parseFloat(draft.replace(",", "."))
    onUpdate(Number.isFinite(parsed) ? parsed : sub.atual)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 py-1.5 pl-4 border-l-2 border-dashed border-border">
      <span className="size-1 shrink-0 rounded-full bg-muted-foreground/30" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{sub.descricao}</p>
        <Progress value={progress} className="mt-0.5 h-1 w-24 gap-0" />
      </div>
      {editing ? (
        <div className="flex items-center gap-1 shrink-0">
          <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} className="h-6 w-14 text-[11px]" />
          <Button size="sm" className="h-6 px-2 text-[11px]" onClick={save}>OK</Button>
        </div>
      ) : (
        <button className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)}>
          {fmtNum(sub.atual)}/{fmtNum(sub.meta)} {sub.unidade}
        </button>
      )}
      <button onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive">
        <X className="size-3" />
      </button>
    </div>
  )
}

// ─── Key Result row ──────────────────────────────────────────────────────────

function KeyResultRow({
  kr,
  linkedIniciativas,
  iniciativaRegistry,
  onCheckIn,
  onToggleBinario,
  onLinkKpi,
  onUnlinkKpi,
  onAddSub,
  onUpdateSub,
  onRemoveSub,
  onLinkIniciativa,
  onUnlinkIniciativa,
}: {
  kr: KeyResult
  linkedIniciativas: RegistryItem[]
  iniciativaRegistry: RegistryItem[]
  onCheckIn: (novoValor: number, comentario: string) => void
  onToggleBinario: (concluido: boolean, comentario: string) => void
  onLinkKpi: (kpiId: string) => void
  onUnlinkKpi: () => void
  onAddSub: (descricao: string, meta: number, unidade: string) => void
  onUpdateSub: (subId: string, atual: number) => void
  onRemoveSub: (subId: string) => void
  onLinkIniciativa: (iniciativaId: string) => void
  onUnlinkIniciativa: (iniciativaId: string) => void
}) {
  const [panel, setPanel] = useState<null | "checkin" | "kpi" | "subform" | "binario">(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [subListOpen, setSubListOpen] = useState(true)
  const [iniOpen, setIniOpen] = useState(false)
  const [valorForm, setValorForm] = useState("")
  const [comentario, setComentario] = useState("")
  const [kpiChoice, setKpiChoice] = useState<string>("")
  const [subDesc, setSubDesc] = useState("")
  const [subMeta, setSubMeta] = useState("")
  const [subUnidade, setSubUnidade] = useState("")

  const resolved = resolveKr(kr)
  const progress = krProgress(kr)
  const isKpi = kr.tipo === "auto"
  const isBinario = kr.tipo === "binario"
  const kpi = isKpi ? KPI_CATALOG.find((k) => k.id === kr.kpiId) : null
  const hasSubs = kr.subResultados.length > 0

  function openCheckin() {
    setValorForm(String(kr.atual))
    setComentario("")
    setPanel("checkin")
  }

  function saveCheckin() {
    const parsed = parseFloat(valorForm.replace(",", "."))
    onCheckIn(Number.isFinite(parsed) ? parsed : kr.atual, comentario.trim())
    setPanel(null)
  }

  function saveBinario(concluido: boolean) {
    onToggleBinario(concluido, comentario.trim())
    setComentario("")
    setPanel(null)
  }

  function saveKpi() {
    if (kpiChoice) onLinkKpi(kpiChoice)
    setPanel(null)
  }

  function saveSub() {
    const meta = parseFloat(subMeta.replace(",", "."))
    if (!subDesc.trim() || !Number.isFinite(meta)) return
    onAddSub(subDesc.trim(), meta, subUnidade.trim() || "un")
    setSubDesc(""); setSubMeta(""); setSubUnidade("")
    setPanel(null)
    setSubListOpen(true)
  }

  return (
    <div className="py-2.5 pl-8 pr-2">
      <div className="flex items-center gap-3">
        <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm text-foreground">{kr.descricao}</p>
            {isKpi && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <Link2 className="size-2.5" />KPI · {kpi?.nome}
              </span>
            )}
            {isBinario && (
              <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", kr.concluido ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                {kr.concluido ? "✓ Concluído" : "Pendente"}
              </span>
            )}
            {hasSubs && (
              <button
                onClick={() => setSubListOpen((v) => !v)}
                className="shrink-0 text-[10px] font-medium text-muted-foreground underline decoration-dotted hover:text-foreground"
              >
                {kr.subResultados.length} sub-resultado{kr.subResultados.length > 1 ? "s" : ""}
              </button>
            )}
            {kr.historico.length > 0 && (
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="shrink-0 text-[10px] font-medium text-muted-foreground underline decoration-dotted hover:text-foreground"
              >
                histórico ({kr.historico.length})
              </button>
            )}
            <button
              onClick={() => setIniOpen((v) => !v)}
              className="shrink-0 text-[10px] font-medium text-muted-foreground underline decoration-dotted hover:text-foreground"
            >
              {linkedIniciativas.length > 0 ? `${linkedIniciativas.length} iniciativa${linkedIniciativas.length > 1 ? "s" : ""}` : "vincular iniciativa"}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={progress} className="w-32 gap-0" />
            <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
          </div>
        </div>

        {!isBinario && (
          <span className="shrink-0 text-right text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-medium tabular-nums text-foreground">{fmtNum(resolved.atual)}</span> / {fmtNum(resolved.meta)} {resolved.unidade}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted">
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {kr.tipo === "manual" && (
              <DropdownMenuItem onClick={openCheckin}>
                <History className="size-3.5 mr-2" />Registrar check-in
              </DropdownMenuItem>
            )}
            {isBinario && (
              <DropdownMenuItem onClick={() => { setComentario(""); setPanel("binario") }}>
                <History className="size-3.5 mr-2" />{kr.concluido ? "Reabrir" : "Marcar como concluído"}
              </DropdownMenuItem>
            )}
            {!isKpi && (
              <DropdownMenuItem onClick={() => setPanel("subform")}>
                <Plus className="size-3.5 mr-2" />Adicionar sub-resultado
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isKpi ? (
              <DropdownMenuItem onClick={onUnlinkKpi}>Desvincular KPI</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => { setKpiChoice(""); setPanel("kpi") }}>Tornar Auto (vincular KPI)</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {panel === "checkin" && (
        <div className="ml-4 mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">Registrar check-in</p>
          <div className="flex items-center gap-2">
            <Input autoFocus value={valorForm} onChange={(e) => setValorForm(e.target.value)} className="h-8 w-24 text-xs" />
            <span className="text-xs text-muted-foreground">{kr.unidade} (meta: {fmtNum(kr.meta)})</span>
          </div>
          <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Comentário sobre este check-in (opcional)..." className="text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={saveCheckin}>Salvar check-in</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPanel(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {panel === "binario" && (
        <div className="ml-4 mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">{kr.concluido ? "Reabrir este resultado-chave?" : "Marcar como concluído?"}</p>
          <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Comentário (opcional)..." className="text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => saveBinario(!kr.concluido)}>
              {kr.concluido ? "Reabrir" : "Marcar como concluído"}
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPanel(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {panel === "kpi" && (
        <div className="ml-4 mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">Vincular este KR a um indicador existente</p>
          <Select items={KPI_SELECT_ITEMS_DETAILED} value={kpiChoice} onValueChange={setKpiChoice}>
            <SelectTrigger className="h-8 w-full text-xs"><SelectValue placeholder="Selecione um KPI" /></SelectTrigger>
            <SelectContent>
              {KPI_CATALOG.map((k) => (
                <SelectItem key={k.id} value={k.id}>{k.nome} — {k.valor_atual}/{k.meta} {k.unidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">O valor atual e a meta deste KR passarão a ser atualizados automaticamente pelo indicador (o KR passa a ser do tipo Auto).</p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" disabled={!kpiChoice} onClick={saveKpi}>Vincular</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPanel(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {panel === "subform" && (
        <div className="ml-4 mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">Novo sub-resultado</p>
          <Input value={subDesc} onChange={(e) => setSubDesc(e.target.value)} placeholder="Descrição do sub-resultado" className="h-8 text-xs" />
          <div className="flex gap-2">
            <Input value={subMeta} onChange={(e) => setSubMeta(e.target.value)} placeholder="Meta" className="h-8 w-24 text-xs" />
            <Input value={subUnidade} onChange={(e) => setSubUnidade(e.target.value)} placeholder="Unidade" className="h-8 w-24 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={saveSub}>Adicionar</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPanel(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {hasSubs && subListOpen && (
        <div className="mt-2 space-y-1.5">
          {kr.subResultados.map((sub) => (
            <SubKrRow key={sub.id} sub={sub} onUpdate={(atual) => onUpdateSub(sub.id, atual)} onRemove={() => onRemoveSub(sub.id)} />
          ))}
        </div>
      )}

      {historyOpen && kr.historico.length > 0 && (
        <div className="ml-4 mt-2 space-y-1.5 border-l-2 border-border pl-3">
          {[...kr.historico].reverse().map((h) => (
            <div key={h.id} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{fmtDate(h.data)}</span> · {h.usuario} · {fmtNum(h.valorAnterior)} → <b className="text-foreground">{fmtNum(h.valorNovo)}</b>
              {h.comentario && <p className="mt-0.5 italic">"{h.comentario}"</p>}
            </div>
          ))}
        </div>
      )}

      {iniOpen && (
        <IniciativasVinculadasSection
          linked={linkedIniciativas}
          registry={iniciativaRegistry}
          onLink={onLinkIniciativa}
          onUnlink={onUnlinkIniciativa}
        />
      )}
    </div>
  )
}

// ─── Iniciativas vinculadas (vínculo bidirecional) ──────────────────────────

function IniciativasVinculadasSection({
  linked,
  registry,
  onLink,
  onUnlink,
}: {
  linked: RegistryItem[]
  registry: RegistryItem[]
  onLink: (iniciativaId: string) => void
  onUnlink: (iniciativaId: string) => void
}) {
  const [search, setSearch] = useState("")
  const linkedIds = new Set(linked.map((i) => i.id))
  const matches = registry
    .filter((i) => !linkedIds.has(i.id) && i.nome.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 6)

  return (
    <div className="ml-4 mt-2 rounded-md border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link2 className="size-3.5" />Iniciativas vinculadas
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {linked.length === 0 && <span className="text-xs italic text-muted-foreground">Nenhuma iniciativa vinculada.</span>}
        {linked.map((i) => (
          <span key={i.id} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs">
            {i.nome} <span className="text-muted-foreground tabular-nums">{i.progresso}%</span>
            <button onClick={() => onUnlink(i.id)} className="text-muted-foreground hover:text-destructive"><X className="size-3" /></button>
          </span>
        ))}
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Vincular iniciativa existente..."
          className="h-7 pl-7 text-xs"
        />
        {search && matches.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-md border bg-popover shadow-md">
            {matches.map((i) => (
              <button
                key={i.id}
                className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                onClick={() => { onLink(i.id); setSearch("") }}
              >
                <span className="truncate">{i.nome}</span>
                <span className="ml-2 shrink-0 text-muted-foreground">{i.progresso}%</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Objective card ──────────────────────────────────────────────────────────

function ObjectiveCard({
  objetivo,
  ciclo,
  ciclos,
  iniciativaRegistry,
  linksByKr,
  onEdit,
  onDelete,
  onUpdateKr,
  onToggleBinario,
  onLinkKpi,
  onUnlinkKpi,
  onAddSub,
  onUpdateSub,
  onRemoveSub,
  onLinkIniciativa,
  onUnlinkIniciativa,
}: {
  objetivo: Objetivo
  ciclo: Ciclo | undefined
  ciclos: Ciclo[]
  iniciativaRegistry: RegistryItem[]
  linksByKr: (krId: string) => RegistryItem[]
  onEdit: () => void
  onDelete: () => void
  onUpdateKr: (krId: string, atual: number, comentario: string) => void
  onToggleBinario: (krId: string, concluido: boolean, comentario: string) => void
  onLinkKpi: (krId: string, kpiId: string) => void
  onUnlinkKpi: (krId: string) => void
  onAddSub: (krId: string, descricao: string, meta: number, unidade: string) => void
  onUpdateSub: (krId: string, subId: string, atual: number) => void
  onRemoveSub: (krId: string, subId: string) => void
  onLinkIniciativa: (krId: string, iniciativaId: string) => void
  onUnlinkIniciativa: (krId: string, iniciativaId: string) => void
}) {
  const [open, setOpen] = useState(true)
  const progress = objProgress(objetivo)
  const status = objStatus(progress)
  const atrasado = isPrazoVencido(objetivo, progress, ciclos)
  const area = objetivo.time ? AREA_BY_TEAM[objetivo.time] : null

  return (
    <Card className={cn("p-0 overflow-hidden", atrasado && "border-l-[3px] border-l-red-500")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <CollapsibleTrigger
            render={
              <button className="shrink-0 text-muted-foreground hover:text-foreground">
                <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
              </button>
            }
          />
          {objetivo.nivel === "empresa" ? <Building2 className="size-4 shrink-0 text-primary" /> : <Target className="size-4 shrink-0 text-primary" />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{objetivo.nome}</p>
              <StatusBadge status={status} />
              {atrasado && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                  Atrasado
                </span>
              )}
              <CicloBadge ciclo={ciclo} />
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                Peso ×{objetivo.peso}
              </span>
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", perspectivaStyle(objetivo.perspectiva).bg, perspectivaStyle(objetivo.perspectiva).color)}>
                {objetivo.perspectiva}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {objetivo.nivel === "empresa" ? "Objetivo da empresa" : `${objetivo.time} · ${area}`} — {objetivo.descricao}
            </p>
          </div>

          <div className="hidden items-center gap-1.5 shrink-0 sm:flex">
            <AvatarInitials iniciais={objetivo.responsavel.iniciais} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{objetivo.responsavel.nome}</span>
          </div>

          <div className="flex w-32 shrink-0 items-center gap-2">
            <Progress value={progress} className="gap-0" />
            <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">{progress}%</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted">
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit2 className="size-3.5 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="size-3.5 mr-2" />Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CollapsibleContent>
          <Separator />
          <div className="divide-y divide-border/60">
            {objetivo.keyResults.map((kr) => (
              <KeyResultRow
                key={kr.id}
                kr={kr}
                linkedIniciativas={linksByKr(kr.id)}
                iniciativaRegistry={iniciativaRegistry}
                onCheckIn={(valor, comentario) => onUpdateKr(kr.id, valor, comentario)}
                onToggleBinario={(concluido, comentario) => onToggleBinario(kr.id, concluido, comentario)}
                onLinkKpi={(kpiId) => onLinkKpi(kr.id, kpiId)}
                onUnlinkKpi={() => onUnlinkKpi(kr.id)}
                onAddSub={(descricao, meta, unidade) => onAddSub(kr.id, descricao, meta, unidade)}
                onUpdateSub={(subId, atual) => onUpdateSub(kr.id, subId, atual)}
                onRemoveSub={(subId) => onRemoveSub(kr.id, subId)}
                onLinkIniciativa={(iniciativaId) => onLinkIniciativa(kr.id, iniciativaId)}
                onUnlinkIniciativa={(iniciativaId) => onUnlinkIniciativa(kr.id, iniciativaId)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// ─── AI Coach ────────────────────────────────────────────────────────────────

function AICoachPanel({ objetivos, ciclo }: { objetivos: Objetivo[]; ciclo: Ciclo | undefined }) {
  const [open, setOpen] = useState(true)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const sugestoes = objetivos.filter((o) => precisaMelhorRedacao(o.nome)).slice(0, 3)

  const alertas = objetivos
    .flatMap((o) => o.keyResults.map((kr) => ({ obj: o, kr, progress: krProgress(kr) })))
    .filter((a) => a.progress < 40)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 4)

  const tudoOk = sugestoes.length === 0 && alertas.length === 0

  return (
    <Card className="relative overflow-hidden bg-linear-to-br from-primary/8 via-card to-card ring-1 ring-primary/20 p-0 mb-4">
      <CardContent className="p-4 flex flex-col">
        <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 text-left">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background border-primary/20">
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            <span className="size-1.5 rounded-full bg-primary" />IA · Coach
          </span>
          <span className="font-semibold text-sm text-primary">
            {ciclo ? `Sugestões para ${ciclo.nome}` : "Sugestões de OKR"}
          </span>
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-primary transition-transform duration-200", open ? "rotate-180" : "rotate-0")} />
        </button>

        {open && (
          <div className="mt-4 flex flex-col gap-4">
            {tudoOk ? (
              <p className="text-sm text-foreground/80">Nenhum alerta no momento — os objetivos deste ciclo estão bem redigidos e sem KRs críticos.</p>
            ) : (
              <>
                {sugestoes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Sugestões de redação</p>
                    {sugestoes.map((o) => (
                      <div key={o.id} className="flex items-start gap-2.5">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="text-sm leading-snug text-foreground/80">
                          <b className="font-semibold text-foreground">"{o.nome}"</b> pode ficar mais forte com um verbo de ação e uma meta numérica clara — ex.: "Aumentar/Reduzir [métrica] de X para Y até {ciclo?.nome ?? "o fim do ciclo"}".
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {alertas.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">KRs em risco</p>
                    {alertas.map(({ obj, kr, progress }) => (
                      <div key={kr.id} className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                        <span className="text-sm leading-snug text-foreground/80">
                          <b className="font-semibold text-foreground">"{kr.descricao}"</b> (objetivo "{obj.nome}") está em apenas <b>{progress}%</b> — considere revisar o plano de ação ou os recursos alocados.
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2 border-t border-primary/15 pt-2.5 text-xs text-muted-foreground">
              <span>Esta informação foi útil?</span>
              <Button variant="ghost" size="icon-xs" onClick={() => setFeedback(feedback === "up" ? null : "up")} className={feedback === "up" ? "text-green-600" : ""}>
                <ThumbsUp className="size-3" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={() => setFeedback(feedback === "down" ? null : "down")} className={feedback === "down" ? "text-destructive" : ""}>
                <ThumbsDown className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Árvore de alinhamento ───────────────────────────────────────────────────

function TreeRow({
  depth, icon: Icon, label, sub, progress, expandable, expanded, onToggle,
}: {
  depth: number
  icon: React.FC<{ className?: string }>
  label: string
  sub?: string
  progress: number
  expandable?: boolean
  expanded?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40" style={{ paddingLeft: 12 + depth * 22 }}>
      {expandable ? (
        <button onClick={onToggle} className="shrink-0 text-muted-foreground hover:text-foreground">
          <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        </button>
      ) : (
        <span className="w-3.5 shrink-0" />
      )}
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}</span>
      {sub && <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{sub}</span>}
      <div className="flex w-28 shrink-0 items-center gap-2">
        <Progress value={progress} className="gap-0" />
        <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums">{progress}%</span>
      </div>
    </div>
  )
}

function ObjectiveLeaf({ depth, objetivo }: { depth: number; objetivo: Objetivo }) {
  const progress = objProgress(objetivo)
  const status = objStatus(progress)
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/40" style={{ paddingLeft: 12 + depth * 22 }}>
      <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{objetivo.nome}</span>
      <StatusBadge status={status} />
      <div className="flex w-28 shrink-0 items-center gap-2">
        <Progress value={progress} className="gap-0" />
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{progress}%</span>
      </div>
    </div>
  )
}

function AlignmentTree({ objetivos }: { objetivos: Objetivo[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const empresaObjs = objetivos.filter((o) => o.nivel === "empresa")
  const timeObjs = objetivos.filter((o) => o.nivel === "time")
  const areas = Array.from(new Set(timeObjs.map((o) => AREA_BY_TEAM[o.time ?? ""] ?? "Outras áreas")))
  const overall = weightedProgress(objetivos)

  if (objetivos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border py-16 text-muted-foreground">
        <GitBranch className="size-8 opacity-40" />
        <p className="text-sm">Nenhum objetivo neste ciclo para montar a árvore de alinhamento.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border divide-y divide-border/60">
      <TreeRow
        depth={0} icon={Building2} label="Humanizadas" sub="Empresa" progress={overall}
        expandable expanded={!collapsed.has("empresa")} onToggle={() => toggle("empresa")}
      />
      {!collapsed.has("empresa") && (
        <>
          {empresaObjs.map((o) => <ObjectiveLeaf key={o.id} depth={1} objetivo={o} />)}
          {areas.map((area) => {
            const areaObjs = timeObjs.filter((o) => (AREA_BY_TEAM[o.time ?? ""] ?? "Outras áreas") === area)
            const areaProgress = weightedProgress(areaObjs)
            const times = Array.from(new Set(areaObjs.map((o) => o.time as string)))
            const areaKey = `area:${area}`
            return (
              <div key={area}>
                <TreeRow
                  depth={1} icon={Users} label={area} sub="Área" progress={areaProgress}
                  expandable expanded={!collapsed.has(areaKey)} onToggle={() => toggle(areaKey)}
                />
                {!collapsed.has(areaKey) && times.map((time) => {
                  const timeObjsFiltered = areaObjs.filter((o) => o.time === time)
                  const timeProgress = weightedProgress(timeObjsFiltered)
                  const timeKey = `${areaKey}/time:${time}`
                  return (
                    <div key={time}>
                      <TreeRow
                        depth={2} icon={Target} label={time} sub="Time" progress={timeProgress}
                        expandable expanded={!collapsed.has(timeKey)} onToggle={() => toggle(timeKey)}
                      />
                      {!collapsed.has(timeKey) && timeObjsFiltered.map((o) => <ObjectiveLeaf key={o.id} depth={3} objetivo={o} />)}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

// ─── Gestão de ciclos ────────────────────────────────────────────────────────

const EMPTY_CICLO_FORM = { nome: "", tipo: "trimestre" as CicloTipo, dataInicio: "", dataFim: "" }

function CicloManagerDialog({
  open, ciclos, objetivos, onClose, onCreate, onActivate, onEncerrar, onDelete,
}: {
  open: boolean
  ciclos: Ciclo[]
  objetivos: Objetivo[]
  onClose: () => void
  onCreate: (data: typeof EMPTY_CICLO_FORM) => void
  onActivate: (id: string) => void
  onEncerrar: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [form, setForm] = useState(EMPTY_CICLO_FORM)
  const countByCiclo = (id: string) => objetivos.filter((o) => o.cicloId === id).length
  const isValid = form.nome.trim().length > 0 && !!form.dataInicio && !!form.dataFim && form.dataFim >= form.dataInicio

  function submit() {
    if (!isValid) return
    onCreate(form)
    setForm(EMPTY_CICLO_FORM)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestão de ciclos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            {[...ciclos].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio)).map((c) => {
              const cfg = CICLO_STATUS_CONFIG[c.status]
              const count = countByCiclo(c.id)
              return (
                <div key={c.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{c.nome}</span>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", cfg.bg, cfg.color)}>
                        {c.status === "rascunho" && <Lock className="size-2.5" />}{cfg.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{CICLO_TIPO_LABEL[c.tipo]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{fmtDate(c.dataInicio)} – {fmtDate(c.dataFim)} · {count} objetivo{count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {c.status !== "ativo" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onActivate(c.id)}>
                        {c.status === "rascunho" ? "Publicar" : "Ativar"}
                      </Button>
                    )}
                    {c.status === "ativo" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onEncerrar(c.id)}>Encerrar</Button>
                    )}
                    <Button
                      size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-destructive"
                      disabled={count > 0}
                      title={count > 0 ? "Não é possível excluir: há objetivos neste ciclo" : "Excluir ciclo"}
                      onClick={() => onDelete(c.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Novo ciclo</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Ex.: Q1 2027" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select items={CICLO_TIPO_ITEMS} value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as CicloTipo }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div />
              <div className="space-y-1">
                <Label className="text-xs">Data início</Label>
                <Input type="date" value={form.dataInicio} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data fim</Label>
                <Input type="date" value={form.dataFim} onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))} />
              </div>
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5" disabled={!isValid} onClick={submit}>
              <Plus className="size-3.5" />Criar ciclo (rascunho)
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create/edit objective modal ─────────────────────────────────────────────

interface KrFormRow {
  id?: string
  descricao: string
  tipo: KRTipo
  atual: string
  meta: string
  unidade: string
  concluido: boolean
  kpiId: string
}

const EMPTY_KR_FORM: KrFormRow = { descricao: "", tipo: "manual", meta: "", atual: "", unidade: "", concluido: false, kpiId: "" }

function emptyObjForm(defaultCicloId: string) {
  return {
    nome: "",
    descricao: "",
    responsavel: USERS[0].nome,
    nivel: "time" as Nivel,
    time: TEAMS[0],
    cicloId: defaultCicloId,
    peso: "3",
    perspectiva: PERSPECTIVA_PRESETS[0] as string,
    perspectivaCustom: "",
    keyResults: [{ ...EMPTY_KR_FORM }],
  }
}

function ObjectiveModal({
  open,
  mode,
  initial,
  ciclos,
  defaultCicloId,
  onClose,
  onSave,
}: {
  open: boolean
  mode: "create" | "edit"
  initial?: Objetivo
  ciclos: Ciclo[]
  defaultCicloId: string
  onClose: () => void
  onSave: (data: ReturnType<typeof emptyObjForm>) => void
}) {
  const [form, setForm] = useState(() => emptyObjForm(defaultCicloId))

  const [lastOpen, setLastOpen] = useState(false)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      if (mode === "edit" && initial) {
        const isPreset = PERSPECTIVA_PRESETS.slice(0, -1).includes(initial.perspectiva as Perspectiva)
        setForm({
          nome: initial.nome,
          descricao: initial.descricao,
          responsavel: initial.responsavel.nome,
          nivel: initial.nivel,
          time: initial.time ?? TEAMS[0],
          cicloId: initial.cicloId,
          peso: String(initial.peso),
          perspectiva: isPreset ? initial.perspectiva : "Personalizada",
          perspectivaCustom: isPreset ? "" : initial.perspectiva,
          keyResults: initial.keyResults.map((kr) => ({
            id: kr.id,
            descricao: kr.descricao,
            tipo: kr.tipo,
            meta: String(kr.meta),
            atual: String(kr.atual),
            unidade: kr.unidade,
            concluido: kr.concluido,
            kpiId: kr.kpiId ?? "",
          })),
        })
      } else {
        setForm(emptyObjForm(defaultCicloId))
      }
    }
  }

  function set<K extends keyof ReturnType<typeof emptyObjForm>>(field: K, value: ReturnType<typeof emptyObjForm>[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isValid =
    form.nome.trim().length > 0 &&
    !!form.cicloId &&
    form.keyResults.some((kr) => kr.descricao.trim().length > 0 && (kr.tipo === "binario" || kr.kpiId || kr.meta.trim().length > 0))

  function addKr() {
    set("keyResults", [...form.keyResults, { ...EMPTY_KR_FORM }])
  }

  function updateKr<K extends keyof KrFormRow>(idx: number, field: K, value: KrFormRow[K]) {
    set("keyResults", form.keyResults.map((kr, i) => (i === idx ? { ...kr, [field]: value } : kr)))
  }

  function removeKr(idx: number) {
    set("keyResults", form.keyResults.filter((_, i) => i !== idx))
  }

  const cicloItems = ciclos.map((c) => ({
    label: `${c.nome}${c.status === "rascunho" ? " · rascunho" : c.status === "encerrado" ? " · encerrado" : ""}`,
    value: c.id,
  }))

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{mode === "create" ? "Novo objetivo" : "Editar objetivo"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="space-y-1">
            <Label>Objetivo <span className="text-red-500">*</span></Label>
            <Input
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex.: Aumentar eNPS para 60 até Q4"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Ciclo <span className="text-red-500">*</span></Label>
              <Select items={cicloItems} value={form.cicloId} onValueChange={(v) => set("cicloId", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ciclos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} {c.status === "rascunho" ? "· rascunho" : c.status === "encerrado" ? "· encerrado" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nível</Label>
              <Select items={NIVEL_ITEMS} value={form.nivel} onValueChange={(v) => set("nivel", v as Nivel)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Peso</Label>
              <Select items={PESO_ITEMS} value={form.peso} onValueChange={(v) => set("peso", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((p) => <SelectItem key={p} value={String(p)}>×{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={cn("grid gap-4", form.nivel === "time" ? "grid-cols-3" : "grid-cols-2")}>
            <div className="space-y-1">
              <Label>Responsável</Label>
              <Select value={form.responsavel} onValueChange={(v) => set("responsavel", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {USERS.map((u) => <SelectItem key={u.nome} value={u.nome}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.nivel === "time" && (
              <div className="space-y-1">
                <Label>Time</Label>
                <Select value={form.time} onValueChange={(v) => set("time", v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Perspectiva</Label>
              <Select items={PERSPECTIVA_ITEMS} value={form.perspectiva} onValueChange={(v) => set("perspectiva", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERSPECTIVA_PRESETS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.perspectiva === "Personalizada" && (
            <div className="space-y-1">
              <Label>Nome da perspectiva personalizada</Label>
              <Input
                value={form.perspectivaCustom}
                onChange={(e) => set("perspectivaCustom", e.target.value)}
                placeholder="Ex.: ESG & Compliance"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              rows={2}
              placeholder="Contexto e motivação do objetivo..."
            />
          </div>

          <div className="space-y-2">
            <Label>Key Results <span className="text-red-500">*</span></Label>
            <div className="flex flex-col gap-2">
              {form.keyResults.map((kr, idx) => {
                return (
                  <div key={idx} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-start gap-2">
                      <Input
                        value={kr.descricao}
                        onChange={(e) => updateKr(idx, "descricao", e.target.value)}
                        placeholder="Descreva o resultado-chave"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost" size="icon" className="shrink-0"
                        onClick={() => removeKr(idx)}
                        disabled={form.keyResults.length === 1}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        items={KR_TIPO_ITEMS}
                        value={kr.tipo}
                        onValueChange={(v) => updateKr(idx, "tipo", v as KRTipo)}
                      >
                        <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {KR_TIPO_ITEMS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      {kr.tipo === "auto" && (
                        <Select items={KPI_SELECT_ITEMS_DETAILED} value={kr.kpiId} onValueChange={(v) => updateKr(idx, "kpiId", v)}>
                          <SelectTrigger className="h-8 w-56 text-xs"><SelectValue placeholder="Selecione um KPI" /></SelectTrigger>
                          <SelectContent>
                            {KPI_CATALOG.map((k) => <SelectItem key={k.id} value={k.id}>{k.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}

                      {kr.tipo === "manual" && (
                        <>
                          <Input value={kr.atual} onChange={(e) => updateKr(idx, "atual", e.target.value)} placeholder="Atual" className="h-8 w-20 text-xs" />
                          <Input value={kr.meta} onChange={(e) => updateKr(idx, "meta", e.target.value)} placeholder="Meta" className="h-8 w-20 text-xs" />
                          <Input value={kr.unidade} onChange={(e) => updateKr(idx, "unidade", e.target.value)} placeholder="Unid." className="h-8 w-20 text-xs" />
                        </>
                      )}

                      {kr.tipo === "binario" && (
                        <label className="flex items-center gap-2 text-xs text-foreground">
                          <input
                            type="checkbox"
                            checked={kr.concluido}
                            onChange={(e) => updateKr(idx, "concluido", e.target.checked)}
                            className="size-3.5"
                          />
                          Já concluído
                        </label>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={addKr}>
              <Plus className="size-3.5" />Adicionar Key Result
            </Button>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!isValid} onClick={() => onSave(form)}>
            {mode === "create" ? "Criar objetivo" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OkrsPage() {
  const [ciclos, setCiclos] = useState<Ciclo[]>(INITIAL_CICLOS)
  const [objetivos, setObjetivos] = useState<Objetivo[]>(INITIAL_OBJETIVOS)
  const [activeCicloId, setActiveCicloId] = useState<string>(
    INITIAL_CICLOS.find((c) => c.status === "ativo")?.id ?? INITIAL_CICLOS[0].id
  )
  const [view, setView] = useState<"lista" | "arvore">("lista")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<"todos" | Status>("todos")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [modalObjId, setModalObjId] = useState<string | null>(null)
  const [cicloManagerOpen, setCicloManagerOpen] = useState(false)

  const shared = useOkrShared()

  // Publica o registro de key results (nome do objetivo + descrição do KR + progresso)
  // para a página de Iniciativas ler — o vínculo cross-module vive no nível de KR.
  useEffect(() => {
    registerKeyResults(
      objetivos.flatMap((o) => o.keyResults.map((kr) => ({
        id: kr.id,
        nome: `${o.nome} › ${kr.descricao}`,
        progresso: krProgress(kr),
      })))
    )
  }, [objetivos])

  const ciclo = ciclos.find((c) => c.id === activeCicloId)
  const objetivosDoCiclo = objetivos.filter((o) => o.cicloId === activeCicloId)

  const filtered = objetivosDoCiclo.filter((obj) => {
    if (searchQuery && !obj.nome.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFiltro !== "todos" && objStatus(objProgress(obj)) !== statusFiltro) return false
    return true
  })

  const progressoCiclo = weightedProgress(objetivosDoCiclo)
  const concluidos = objetivosDoCiclo.filter((o) => objProgress(o) >= 100).length
  const atrasados = objetivosDoCiclo.filter((o) => isPrazoVencido(o, objProgress(o), ciclos)).length

  const iniciativaRegistry = Object.values(shared.iniciativas)

  const cicloSelectItems = [...ciclos].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio)).map((c) => ({
    label: `${c.nome}${c.status === "rascunho" ? " · rascunho" : c.status === "encerrado" ? " · encerrado" : ""}`,
    value: c.id,
  }))

  function openCreate() {
    setModalMode("create")
    setModalObjId(null)
    setModalOpen(true)
  }

  function openEdit(id: string) {
    setModalMode("edit")
    setModalObjId(id)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    setObjetivos((list) => list.filter((o) => o.id !== id))
  }

  function updateKrIn(objId: string, krId: string, updater: (kr: KeyResult) => KeyResult) {
    setObjetivos((list) => list.map((o) => (
      o.id !== objId ? o : { ...o, keyResults: o.keyResults.map((kr) => (kr.id === krId ? updater(kr) : kr)) }
    )))
  }

  function handleCheckIn(objId: string, krId: string, novoValor: number, comentario: string) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      atual: novoValor,
      historico: [
        ...kr.historico,
        { id: nextId("ck"), data: TODAY, usuario: "Administrador", valorAnterior: kr.atual, valorNovo: novoValor, comentario },
      ],
    }))
  }

  function handleToggleBinario(objId: string, krId: string, concluido: boolean, comentario: string) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      concluido,
      historico: [
        ...kr.historico,
        { id: nextId("ck"), data: TODAY, usuario: "Administrador", valorAnterior: kr.concluido ? 1 : 0, valorNovo: concluido ? 1 : 0, comentario },
      ],
    }))
  }

  function handleLinkKpi(objId: string, krId: string, kpiId: string) {
    updateKrIn(objId, krId, (kr) => ({ ...kr, tipo: "auto", kpiId }))
  }

  function handleUnlinkKpi(objId: string, krId: string) {
    updateKrIn(objId, krId, (kr) => ({ ...kr, tipo: "manual", kpiId: null }))
  }

  function handleAddSub(objId: string, krId: string, descricao: string, meta: number, unidade: string) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      subResultados: [...kr.subResultados, { id: nextId("sub"), descricao, atual: 0, meta, unidade }],
    }))
  }

  function handleUpdateSub(objId: string, krId: string, subId: string, atual: number) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      subResultados: kr.subResultados.map((s) => (s.id === subId ? { ...s, atual } : s)),
    }))
  }

  function handleRemoveSub(objId: string, krId: string, subId: string) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      subResultados: kr.subResultados.filter((s) => s.id !== subId),
    }))
  }

  function handleSaveObjetivo(data: ReturnType<typeof emptyObjForm>) {
    const responsavel = USERS.find((u) => u.nome === data.responsavel) ?? USERS[0]
    const previous = modalObjId ? objetivos.find((o) => o.id === modalObjId) : undefined
    const perspectiva = data.perspectiva === "Personalizada" ? (data.perspectivaCustom.trim() || "Personalizada") : data.perspectiva
    const keyResults: KeyResult[] = data.keyResults
      .filter((kr) => kr.descricao.trim().length > 0 && (kr.tipo === "binario" || kr.kpiId || kr.meta.trim().length > 0))
      .map((kr) => {
        const existing = kr.id ? previous?.keyResults.find((p) => p.id === kr.id) : undefined
        return {
          id: kr.id ?? nextId("kr"),
          descricao: kr.descricao,
          tipo: kr.tipo,
          meta: parseFloat(kr.meta.replace(",", ".")) || 0,
          atual: parseFloat(kr.atual.replace(",", ".")) || 0,
          unidade: kr.unidade || "un",
          concluido: kr.concluido,
          kpiId: kr.tipo === "auto" ? (kr.kpiId || null) : null,
          subResultados: existing?.subResultados ?? [],
          historico: existing?.historico ?? [],
        }
      })

    if (modalMode === "create") {
      const novo: Objetivo = {
        id: nextObjId(objetivos),
        cicloId: data.cicloId,
        nome: data.nome,
        descricao: data.descricao,
        responsavel,
        nivel: data.nivel,
        time: data.nivel === "empresa" ? null : data.time,
        peso: parseInt(data.peso, 10) || 1,
        perspectiva,
        keyResults,
      }
      setObjetivos((list) => [...list, novo])
    } else if (modalObjId) {
      setObjetivos((list) => list.map((o) => (
        o.id !== modalObjId ? o : {
          ...o,
          cicloId: data.cicloId,
          nome: data.nome,
          descricao: data.descricao,
          responsavel,
          nivel: data.nivel,
          time: data.nivel === "empresa" ? null : data.time,
          peso: parseInt(data.peso, 10) || 1,
          perspectiva,
          keyResults,
        }
      )))
    }
    setModalOpen(false)
  }

  function handleCreateCiclo(data: typeof EMPTY_CICLO_FORM) {
    setCiclos((list) => [...list, { id: nextId("CIC"), nome: data.nome, tipo: data.tipo, dataInicio: data.dataInicio, dataFim: data.dataFim, status: "rascunho" }])
  }

  function handleActivateCiclo(id: string) {
    setCiclos((list) => list.map((c) => {
      if (c.id === id) return { ...c, status: "ativo" }
      if (c.status === "ativo") return { ...c, status: "encerrado" }
      return c
    }))
  }

  function handleEncerrarCiclo(id: string) {
    setCiclos((list) => list.map((c) => (c.id === id ? { ...c, status: "encerrado" } : c)))
  }

  function handleDeleteCiclo(id: string) {
    if (objetivos.some((o) => o.cicloId === id)) return
    setCiclos((list) => list.filter((c) => c.id !== id))
    if (activeCicloId === id) {
      const remaining = ciclos.filter((c) => c.id !== id)
      setActiveCicloId(remaining[0]?.id ?? "")
    }
  }

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <PageHeader title="OKRs" />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-background shrink-0 flex-wrap">
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={openCreate}>
          <Plus className="size-3.5" />Novo objetivo
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setCicloManagerOpen(true)}>
          <Settings2 className="size-3.5" />Gerenciar ciclos
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <Select items={cicloSelectItems} value={activeCicloId} onValueChange={setActiveCicloId}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Ciclo" />
          </SelectTrigger>
          <SelectContent>
            {[...ciclos].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio)).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome} {c.status === "rascunho" ? "· rascunho" : c.status === "encerrado" ? "· encerrado" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex rounded-md border overflow-hidden">
          {([
            { value: "lista", label: "Lista" },
            { value: "arvore", label: "Árvore de alinhamento", icon: GitBranch },
          ] as { value: "lista" | "arvore"; label: string; icon?: React.FC<{ className?: string }> }[]).map((v) => (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                view === v.value ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              )}
            >
              {v.icon && <v.icon className="size-3.5" />}{v.label}
            </button>
          ))}
        </div>

        {view === "lista" && (
          <div className="flex rounded-md border overflow-hidden">
            {([
              { value: "todos", label: "Todos" },
              { value: "no_prazo", label: "No prazo" },
              { value: "atencao", label: "Atenção" },
              { value: "risco", label: "Em risco" },
              { value: "concluido", label: "Concluído" },
            ] as { value: "todos" | Status; label: string }[]).map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFiltro(s.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  statusFiltro === s.value ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {view === "lista" && (
          <div className="relative ml-auto min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Buscar objetivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}>
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {ciclo?.status === "rascunho" && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Lock className="size-4 shrink-0 text-amber-700" />
            <div className="flex-1 text-sm text-amber-900">
              <b>Espaço de rascunho</b> — o ciclo "{ciclo.nome}" ainda não foi publicado. Use este espaço para planejar os próximos OKRs com privacidade antes de ativá-lo.
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleActivateCiclo(ciclo.id)}>
              Publicar ciclo
            </Button>
          </div>
        )}

        <AICoachPanel objetivos={objetivosDoCiclo} ciclo={ciclo} />

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          <Card className="p-[14px_16px] border-t-2 border-t-primary/25">
            <CardContent className="p-0">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Objetivos no ciclo</div>
              <div className="font-display text-[26px] font-black leading-tight tracking-[-0.02em] tabular-nums">{objetivosDoCiclo.length}</div>
            </CardContent>
          </Card>
          <Card className="p-[14px_16px] border-t-2 border-t-primary/25">
            <CardContent className="p-0">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Progresso do ciclo</div>
              <div className="font-display text-[26px] font-black leading-tight tracking-[-0.02em] tabular-nums">{progressoCiclo}%</div>
            </CardContent>
          </Card>
          <Card className="p-[14px_16px] border-t-2 border-t-primary/25">
            <CardContent className="p-0">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Concluídos</div>
              <div className="font-display text-[26px] font-black leading-tight tracking-[-0.02em] tabular-nums text-green-700">{concluidos}</div>
            </CardContent>
          </Card>
          <Card className="p-[14px_16px] border-t-2 border-t-primary/25">
            <CardContent className="p-0">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Atrasados</div>
              <div className="font-display text-[26px] font-black leading-tight tracking-[-0.02em] tabular-nums text-red-600">{atrasados}</div>
            </CardContent>
          </Card>
        </div>

        {view === "arvore" ? (
          <AlignmentTree objetivos={objetivosDoCiclo} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Target className="size-8 opacity-40" />
            <p className="text-sm">Nenhum objetivo encontrado para os filtros aplicados.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFiltro("todos") }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((obj) => (
              <ObjectiveCard
                key={obj.id}
                objetivo={obj}
                ciclo={ciclos.find((c) => c.id === obj.cicloId)}
                ciclos={ciclos}
                iniciativaRegistry={iniciativaRegistry}
                linksByKr={(krId) => getIniciativasForKr(shared, krId)}
                onEdit={() => openEdit(obj.id)}
                onDelete={() => handleDelete(obj.id)}
                onUpdateKr={(krId, atual, comentario) => handleCheckIn(obj.id, krId, atual, comentario)}
                onToggleBinario={(krId, concluido, comentario) => handleToggleBinario(obj.id, krId, concluido, comentario)}
                onLinkKpi={(krId, kpiId) => handleLinkKpi(obj.id, krId, kpiId)}
                onUnlinkKpi={(krId) => handleUnlinkKpi(obj.id, krId)}
                onAddSub={(krId, descricao, meta, unidade) => handleAddSub(obj.id, krId, descricao, meta, unidade)}
                onUpdateSub={(krId, subId, atual) => handleUpdateSub(obj.id, krId, subId, atual)}
                onRemoveSub={(krId, subId) => handleRemoveSub(obj.id, krId, subId)}
                onLinkIniciativa={(krId, iniciativaId) => linkKrIniciativa(krId, iniciativaId)}
                onUnlinkIniciativa={(krId, iniciativaId) => unlinkKrIniciativa(krId, iniciativaId)}
              />
            ))}
          </div>
        )}
      </div>

      <ObjectiveModal
        open={modalOpen}
        mode={modalMode}
        initial={modalObjId ? objetivos.find((o) => o.id === modalObjId) : undefined}
        ciclos={ciclos}
        defaultCicloId={activeCicloId}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveObjetivo}
      />

      <CicloManagerDialog
        open={cicloManagerOpen}
        ciclos={ciclos}
        objetivos={objetivos}
        onClose={() => setCicloManagerOpen(false)}
        onCreate={handleCreateCiclo}
        onActivate={handleActivateCiclo}
        onEncerrar={handleEncerrarCiclo}
        onDelete={handleDeleteCiclo}
      />
    </div>
  )
}
