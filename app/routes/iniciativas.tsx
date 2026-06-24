import { useState, useEffect, useRef, useCallback } from "react"
import {
  AlignLeft, Calendar, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUpDown, Filter, GanttChart, GitBranch, Globe,
  KanbanSquare, Link2, MoreHorizontal, Plus, Search,
  Trash2, X, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Minus, Edit2, Copy, CheckCircle2, Circle, PauseCircle,
  XCircle, Rocket, ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

import { PageHeader } from "~/components/page-header"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "~/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "~/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Slider } from "~/components/ui/slider"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "~/components/ui/sheet"
import { cn } from "~/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────

type Status = "nao_iniciada" | "em_andamento" | "pausada" | "concluida" | "cancelada"
type Prioridade = "critica" | "alta" | "media" | "baixa"
type NivelRisco = "baixo" | "medio" | "alto" | "critico" | null
type Saude = "verde" | "amarelo" | "vermelho"
type View = "kanban" | "lista" | "gantt"

interface CheckIn {
  data: string
  usuario: string
  progresso_anterior: number
  progresso_novo: number
  observacao: string
}

interface Initiative {
  id: string
  nome: string
  descricao: string
  status: Status
  prioridade: Prioridade
  responsavel: { id: string; nome: string; avatar_iniciais: string }
  equipe: string
  data_inicio: string
  data_termino: string
  progresso: number
  nivel_risco: NivelRisco
  orcamento_estimado: number | null
  custo_realizado: number | null
  retorno_estimado: number | null
  okrs_vinculados: Array<{ id: string; nome: string; progresso: number }>
  kpis_vinculados: Array<{ id: string; nome: string; valor_atual: number; meta: number; unidade: string }>
  atualizado_em: string
  criado_em: string
  historico_check_ins: CheckIn[]
}

interface Toast {
  id: string
  message: string
  action?: { label: string; onClick: () => void }
  isError?: boolean
  timeout?: number
}

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: "u1", nome: "Ana Lima", avatar_iniciais: "AL" },
  { id: "u2", nome: "Bruno Carvalho", avatar_iniciais: "BC" },
  { id: "u3", nome: "Carla Mendes", avatar_iniciais: "CM" },
  { id: "u4", nome: "Diego Rocha", avatar_iniciais: "DR" },
  { id: "u5", nome: "Elena Souza", avatar_iniciais: "ES" },
]

const MOCK_TEAMS = ["RH", "Diversidade & Inclusão", "People Analytics", "Desenvolvimento", "Sustentabilidade", "Cultura"]

const MOCK_OKRS = [
  { id: "okr1", nome: "Aumentar eNPS para 60 até Q4", progresso: 68 },
  { id: "okr2", nome: "Atingir 40% de liderança feminina", progresso: 34 },
  { id: "okr3", nome: "Reduzir turnover voluntário em 15%", progresso: 52 },
  { id: "okr4", nome: "Certificação ESG Tier 1 até dez/26", progresso: 100 },
  { id: "okr5", nome: "Implementar academia interna de competências", progresso: 20 },
]

const MOCK_KPIS_LIST = [
  { id: "kpi1", nome: "eNPS", valor_atual: 48, meta: 60, unidade: "pts" },
  { id: "kpi2", nome: "Liderança Feminina", valor_atual: 32, meta: 40, unidade: "%" },
  { id: "kpi3", nome: "Turnover Voluntário", valor_atual: 8.2, meta: 6.5, unidade: "%" },
  { id: "kpi4", nome: "Engajamento Geral", valor_atual: 74, meta: 80, unidade: "%" },
  { id: "kpi5", nome: "Horas de Treinamento", valor_atual: 22, meta: 40, unidade: "h/ano" },
]

const INITIAL_INITIATIVES: Initiative[] = [
  {
    id: "INI-0001",
    nome: "Programa de Bem-Estar Mental",
    descricao: "Estruturar e lançar programa de suporte à saúde mental, incluindo parceria com plataforma de telemedicina, treinamento de líderes e canais de escuta ativa.",
    status: "em_andamento",
    prioridade: "alta",
    responsavel: { id: "u1", nome: "Ana Lima", avatar_iniciais: "AL" },
    equipe: "RH",
    data_inicio: "2026-02-01",
    data_termino: "2026-08-31",
    progresso: 45,
    nivel_risco: "medio",
    orcamento_estimado: 280000,
    custo_realizado: 112000,
    retorno_estimado: 520000,
    okrs_vinculados: [{ id: "okr1", nome: "Aumentar eNPS para 60 até Q4", progresso: 68 }],
    kpis_vinculados: [{ id: "kpi1", nome: "eNPS", valor_atual: 48, meta: 60, unidade: "pts" }],
    atualizado_em: "2026-06-10",
    criado_em: "2026-01-15",
    historico_check_ins: [
      { data: "2026-06-10", usuario: "Ana Lima", progresso_anterior: 35, progresso_novo: 45, observacao: "Parceria com Vittude firmada. Piloto iniciado com 200 colaboradores." },
      { data: "2026-04-20", usuario: "Ana Lima", progresso_anterior: 20, progresso_novo: 35, observacao: "Treinamento de líderes concluído para 3 BUs." },
      { data: "2026-03-05", usuario: "Ana Lima", progresso_anterior: 0, progresso_novo: 20, observacao: "Diagnóstico inicial e mapeamento de necessidades finalizado." },
    ],
  },
  {
    id: "INI-0002",
    nome: "Liderança Feminina no C-Level",
    descricao: "Programa acelerador para preparar e promover mulheres a posições de liderança executiva. Inclui mentoria, job rotation e metas de representatividade.",
    status: "em_andamento",
    prioridade: "critica",
    responsavel: { id: "u3", nome: "Carla Mendes", avatar_iniciais: "CM" },
    equipe: "Diversidade & Inclusão",
    data_inicio: "2026-01-15",
    data_termino: "2026-12-15",
    progresso: 30,
    nivel_risco: "alto",
    orcamento_estimado: 450000,
    custo_realizado: 135000,
    retorno_estimado: null,
    okrs_vinculados: [{ id: "okr2", nome: "Atingir 40% de liderança feminina", progresso: 34 }],
    kpis_vinculados: [{ id: "kpi2", nome: "Liderança Feminina", valor_atual: 32, meta: 40, unidade: "%" }],
    atualizado_em: "2026-06-01",
    criado_em: "2025-12-10",
    historico_check_ins: [
      { data: "2026-06-01", usuario: "Carla Mendes", progresso_anterior: 20, progresso_novo: 30, observacao: "12 participantes selecionadas para a 2ª coorte." },
    ],
  },
  {
    id: "INI-0003",
    nome: "Reestruturação do Ciclo de Performance",
    descricao: "Redesenho do processo de avaliação de desempenho para modelo contínuo com check-ins trimestrais, calibração por comitê e metas OKR integradas.",
    status: "em_andamento",
    prioridade: "alta",
    responsavel: { id: "u2", nome: "Bruno Carvalho", avatar_iniciais: "BC" },
    equipe: "People Analytics",
    data_inicio: "2026-03-01",
    data_termino: "2026-06-30",
    progresso: 72,
    nivel_risco: "baixo",
    orcamento_estimado: 90000,
    custo_realizado: 65000,
    retorno_estimado: 180000,
    okrs_vinculados: [{ id: "okr3", nome: "Reduzir turnover voluntário em 15%", progresso: 52 }],
    kpis_vinculados: [
      { id: "kpi4", nome: "Engajamento Geral", valor_atual: 74, meta: 80, unidade: "%" },
      { id: "kpi3", nome: "Turnover Voluntário", valor_atual: 8.2, meta: 6.5, unidade: "%" },
    ],
    atualizado_em: "2026-06-18",
    criado_em: "2026-02-10",
    historico_check_ins: [
      { data: "2026-06-18", usuario: "Bruno Carvalho", progresso_anterior: 60, progresso_novo: 72, observacao: "Calibração do Q2 finalizada. Comunicação lançada." },
      { data: "2026-05-10", usuario: "Bruno Carvalho", progresso_anterior: 40, progresso_novo: 60, observacao: "Ferramenta de check-in implementada no sistema." },
    ],
  },
  {
    id: "INI-0004",
    nome: "Academia de Competências Digitais",
    descricao: "Criação de trilhas de aprendizagem digital com parceiros EdTech para desenvolver competências analíticas, IA aplicada e digital mindset em toda a força de trabalho.",
    status: "nao_iniciada",
    prioridade: "alta",
    responsavel: { id: "u4", nome: "Diego Rocha", avatar_iniciais: "DR" },
    equipe: "Desenvolvimento",
    data_inicio: "2026-08-01",
    data_termino: "2026-12-31",
    progresso: 0,
    nivel_risco: null,
    orcamento_estimado: 320000,
    custo_realizado: null,
    retorno_estimado: 600000,
    okrs_vinculados: [{ id: "okr5", nome: "Implementar academia interna de competências", progresso: 20 }],
    kpis_vinculados: [{ id: "kpi5", nome: "Horas de Treinamento", valor_atual: 22, meta: 40, unidade: "h/ano" }],
    atualizado_em: "2026-06-01",
    criado_em: "2026-05-20",
    historico_check_ins: [],
  },
  {
    id: "INI-0005",
    nome: "Revisão da Política Global de Benefícios",
    descricao: "Pesquisa, benchmarking e redesenho da política de benefícios com foco em flexibilidade, saúde integral e inclusão de dependentes não-convencionais.",
    status: "nao_iniciada",
    prioridade: "media",
    responsavel: { id: "u1", nome: "Ana Lima", avatar_iniciais: "AL" },
    equipe: "RH",
    data_inicio: "2026-09-01",
    data_termino: "2026-11-30",
    progresso: 0,
    nivel_risco: null,
    orcamento_estimado: 60000,
    custo_realizado: null,
    retorno_estimado: null,
    okrs_vinculados: [],
    kpis_vinculados: [],
    atualizado_em: "2026-06-05",
    criado_em: "2026-06-05",
    historico_check_ins: [],
  },
  {
    id: "INI-0006",
    nome: "Programa de Mentoria Reversa",
    descricao: "Iniciativa que conecta talentos jovens como mentores de líderes sênior para troca de perspectivas sobre tecnologia, cultura digital e diversidade geracional.",
    status: "pausada",
    prioridade: "media",
    responsavel: { id: "u5", nome: "Elena Souza", avatar_iniciais: "ES" },
    equipe: "Desenvolvimento",
    data_inicio: "2026-01-10",
    data_termino: "2026-07-10",
    progresso: 38,
    nivel_risco: "medio",
    orcamento_estimado: 45000,
    custo_realizado: 17000,
    retorno_estimado: 90000,
    okrs_vinculados: [{ id: "okr1", nome: "Aumentar eNPS para 60 até Q4", progresso: 68 }],
    kpis_vinculados: [],
    atualizado_em: "2026-05-15",
    criado_em: "2025-12-20",
    historico_check_ins: [
      { data: "2026-05-15", usuario: "Elena Souza", progresso_anterior: 38, progresso_novo: 38, observacao: "Pausado aguardando aprovação orçamentária para fase 2." },
      { data: "2026-03-20", usuario: "Elena Souza", progresso_anterior: 20, progresso_novo: 38, observacao: "Pares de mentoria formados. Sessões iniciais realizadas." },
    ],
  },
  {
    id: "INI-0007",
    nome: "Certificação ESG Tier 1",
    descricao: "Obtenção da certificação ESG Tier 1 junto ao Instituto Ethos, incluindo diagnóstico, plano de adequação, relatório GRI e auditoria externa.",
    status: "concluida",
    prioridade: "critica",
    responsavel: { id: "u3", nome: "Carla Mendes", avatar_iniciais: "CM" },
    equipe: "Sustentabilidade",
    data_inicio: "2025-07-01",
    data_termino: "2026-03-31",
    progresso: 100,
    nivel_risco: "baixo",
    orcamento_estimado: 180000,
    custo_realizado: 162000,
    retorno_estimado: 500000,
    okrs_vinculados: [{ id: "okr4", nome: "Certificação ESG Tier 1 até dez/26", progresso: 100 }],
    kpis_vinculados: [],
    atualizado_em: "2026-04-01",
    criado_em: "2025-06-10",
    historico_check_ins: [
      { data: "2026-04-01", usuario: "Carla Mendes", progresso_anterior: 90, progresso_novo: 100, observacao: "Certificação emitida. Relatório publicado no site institucional." },
      { data: "2026-02-10", usuario: "Carla Mendes", progresso_anterior: 70, progresso_novo: 90, observacao: "Auditoria externa concluída com aprovação." },
    ],
  },
  {
    id: "INI-0008",
    nome: "Projeto de Clima Organizacional Q1",
    descricao: "Pesquisa de clima organizacional planejada para Q1/2026. Cancelada por mudança de prioridade estratégica — incorporada ao ciclo de engajamento anual.",
    status: "cancelada",
    prioridade: "alta",
    responsavel: { id: "u2", nome: "Bruno Carvalho", avatar_iniciais: "BC" },
    equipe: "People Analytics",
    data_inicio: "2026-01-15",
    data_termino: "2026-03-15",
    progresso: 15,
    nivel_risco: null,
    orcamento_estimado: 40000,
    custo_realizado: 6000,
    retorno_estimado: null,
    okrs_vinculados: [],
    kpis_vinculados: [{ id: "kpi4", nome: "Engajamento Geral", valor_atual: 74, meta: 80, unidade: "%" }],
    atualizado_em: "2026-02-01",
    criado_em: "2025-12-15",
    historico_check_ins: [
      { data: "2026-02-01", usuario: "Bruno Carvalho", progresso_anterior: 15, progresso_novo: 15, observacao: "Cancelado por decisão da diretoria. Verba realocada para pesquisa anual." },
    ],
  },
]

// ─── Utility functions ──────────────────────────────────────────────────────

const TODAY = "2026-06-24"

function isAtrasada(ini: Initiative): boolean {
  return ini.data_termino < TODAY && ini.status !== "concluida" && ini.status !== "cancelada"
}

function calcSaude(ini: Initiative): Saude {
  if (isAtrasada(ini)) return "vermelho"
  const start = new Date(ini.data_inicio).getTime()
  const end = new Date(ini.data_termino).getTime()
  const now = new Date(TODAY).getTime()
  const duracao = end - start
  if (duracao <= 0) return "verde"
  const decorrido = Math.max(0, now - start)
  const esperado = (decorrido / duracao) * 100
  if (ini.progresso >= esperado - 10) return "verde"
  if (ini.progresso >= esperado - 20) return "amarelo"
  return "vermelho"
}

function calcROI(orcamento: number | null, retorno: number | null): string {
  if (!orcamento || !retorno || orcamento === 0) return "—"
  return ((retorno - orcamento) / orcamento * 100).toFixed(1) + "%"
}

function formatCurrency(value: number | null): string {
  if (value == null) return "—"
  return "R$ " + value.toLocaleString("pt-BR")
}

function nextId(initiatives: Initiative[]): string {
  return "INI-" + String(initiatives.length + 1).padStart(4, "0")
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y.slice(2)}`
}

// ─── Config maps ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.FC<{ className?: string }> }> = {
  nao_iniciada: { label: "Não iniciada", color: "text-slate-600", bg: "bg-slate-100", icon: Circle },
  em_andamento: { label: "Em andamento", color: "text-blue-700", bg: "bg-blue-100", icon: Rocket },
  pausada: { label: "Pausada", color: "text-amber-700", bg: "bg-amber-100", icon: PauseCircle },
  concluida: { label: "Concluída", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
}

const PRIORIDADE_CONFIG: Record<Prioridade, { label: string; color: string; bg: string }> = {
  critica: { label: "Crítica", color: "text-red-700", bg: "bg-red-100" },
  alta: { label: "Alta", color: "text-orange-700", bg: "bg-orange-100" },
  media: { label: "Média", color: "text-amber-700", bg: "bg-amber-100" },
  baixa: { label: "Baixa", color: "text-slate-600", bg: "bg-slate-100" },
}

const RISCO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  baixo: { label: "Baixo", color: "text-green-700", bg: "bg-green-100" },
  medio: { label: "Médio", color: "text-amber-700", bg: "bg-amber-100" },
  alto: { label: "Alto", color: "text-orange-700", bg: "bg-orange-100" },
  critico: { label: "Crítico", color: "text-red-700", bg: "bg-red-100" },
}

const STATUS_ORDER: Status[] = ["nao_iniciada", "em_andamento", "pausada", "concluida", "cancelada"]

// ─── StatusBadge ────────────────────────────────────────────────────────────

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

function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const cfg = PRIORIDADE_CONFIG[prioridade]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  )
}

function SaudeDot({ saude }: { saude: Saude }) {
  const colors = { verde: "bg-green-500", amarelo: "bg-amber-400", vermelho: "bg-red-500" }
  return <span className={cn("inline-block size-3 rounded-full", colors[saude])} />
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

// ─── Toast system ───────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start justify-between gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm bg-background",
            t.isError ? "border-red-300" : "border-border"
          )}
        >
          <span className="flex-1">{t.message}</span>
          <div className="flex items-center gap-1 shrink-0">
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); onDismiss(t.id) }}
                className="text-xs font-medium text-violet-600 hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => onDismiss(t.id)} className="text-muted-foreground hover:text-foreground ml-1">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ProgressBar ────────────────────────────────────────────────────────────

function ProgressBar({ value, height = 6, className }: { value: number; height?: number; className?: string }) {
  return (
    <div className={cn("w-full rounded-full bg-muted overflow-hidden", className)} style={{ height }}>
      <div
        className="h-full rounded-full bg-violet-500 transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────

function ConfirmDialogModal({
  open, title, description, confirmLabel, onCancel, onConfirm
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Kanban card ────────────────────────────────────────────────────────────

function KanbanCard({
  initiative,
  onDragStart,
  onClick,
  onEdit,
  onDuplicate,
  onDelete,
  onProgressUpdate,
}: {
  initiative: Initiative
  onDragStart: (id: string) => void
  onClick: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onProgressUpdate: (id: string, progresso: number, obs: string) => void
}) {
  const [hovering, setHovering] = useState(false)
  const [quickEdit, setQuickEdit] = useState(false)
  const [sliderVal, setSliderVal] = useState(initiative.progresso)
  const atrasada = isAtrasada(initiative)

  function handleProgressSave() {
    onProgressUpdate(initiative.id, sliderVal, "")
    setQuickEdit(false)
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(initiative.id)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false) }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-no-click]")) return
        onClick()
      }}
      className={cn(
        "relative rounded-lg border bg-card p-3 cursor-pointer select-none transition-shadow hover:shadow-md",
        atrasada && "border-l-[3px] border-l-red-500",
        initiative.status === "cancelada" && "opacity-60"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-1 mb-2" data-no-click>
        <div className="flex items-center gap-1 flex-wrap">
          <PrioridadeBadge prioridade={initiative.prioridade} />
          {atrasada && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
              Atrasada
            </span>
          )}
          {(initiative.nivel_risco === "alto" || initiative.nivel_risco === "critico") && initiative.nivel_risco && (
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", RISCO_CONFIG[initiative.nivel_risco].bg, RISCO_CONFIG[initiative.nivel_risco].color)}>
              <AlertTriangle className="size-2.5 mr-0.5" />
              Risco {RISCO_CONFIG[initiative.nivel_risco].label}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground" data-no-click>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36" data-no-click>
            <DropdownMenuItem onClick={onEdit}><Edit2 className="size-3.5 mr-2" />Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}><Copy className="size-3.5 mr-2" />Duplicar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="size-3.5 mr-2" />Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <p className="text-sm font-medium line-clamp-2 mb-2">{initiative.nome}</p>

      {/* Progress */}
      {initiative.progresso > 0 && (
        <div className="mb-2" data-no-click>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{initiative.progresso}%</span>
            {hovering && !quickEdit && (
              <button
                className="text-xs text-violet-600 hover:underline"
                onClick={() => setQuickEdit(true)}
              >
                <Edit2 className="size-3" />
              </button>
            )}
          </div>
          <ProgressBar value={initiative.progresso} height={4} />
        </div>
      )}

      {/* Quick edit slider */}
      {quickEdit && (
        <div className="mb-2 p-2 rounded bg-muted" data-no-click onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 mb-2">
            <Slider
              min={0} max={100} step={1}
              value={[sliderVal]}
              onValueChange={([v]) => setSliderVal(v)}
              className="flex-1"
            />
            <span className="text-xs w-8 text-right">{sliderVal}%</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" className="h-6 text-xs flex-1" onClick={handleProgressSave}>Salvar</Button>
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setQuickEdit(false)}>×</Button>
          </div>
        </div>
      )}

      {/* KPI badges */}
      {initiative.kpis_vinculados.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap" data-no-click>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-700">
            {initiative.kpis_vinculados[0].nome}
          </span>
          {initiative.kpis_vinculados.length > 1 && (
            <span className="text-xs text-muted-foreground">+{initiative.kpis_vinculados.length - 1}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
        <div className="flex items-center gap-1">
          <AvatarInitials iniciais={initiative.responsavel.avatar_iniciais} size={20} />
          <span className="truncate max-w-[100px]">{initiative.responsavel.nome.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          {initiative.okrs_vinculados.length > 0 && <Link2 className="size-3" />}
          <div className="flex items-center gap-0.5">
            <Calendar className="size-3" />
            <span>{formatDate(initiative.data_termino)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban view ────────────────────────────────────────────────────────────

function KanbanView({
  initiatives,
  onCardClick,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onProgressUpdate,
}: {
  initiatives: Initiative[]
  onCardClick: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, newStatus: Status) => void
  onProgressUpdate: (id: string, progresso: number, obs: string) => void
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null)
  const [cancelledOpen, setCancelledOpen] = useState(false)
  const [confirm, setConfirm] = useState<{ id: string; progresso: number; targetStatus: Status } | null>(null)

  function handleDrop(targetStatus: Status) {
    if (!dragId) return
    const ini = initiatives.find((i) => i.id === dragId)
    if (!ini || ini.status === targetStatus) { setDragId(null); setDragOverCol(null); return }
    if (targetStatus === "concluida" && ini.progresso < 80) {
      setConfirm({ id: dragId, progresso: ini.progresso, targetStatus })
    } else {
      onStatusChange(dragId, targetStatus)
    }
    setDragId(null)
    setDragOverCol(null)
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 h-full">
        {STATUS_ORDER.map((status) => {
          const cards = initiatives.filter((i) => i.status === status)
          const isCancelled = status === "cancelada"
          const isCollapsed = isCancelled && !cancelledOpen
          const cfg = STATUS_CONFIG[status]
          return (
            <div
              key={status}
              className={cn(
                "flex flex-col shrink-0 rounded-lg bg-muted/40 border transition-colors",
                isCollapsed ? "w-14" : "w-72",
                dragOverCol === status && "ring-2 ring-violet-400"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(status) }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(status)}
            >
              <div className={cn("flex items-center gap-2 p-3", isCollapsed && "flex-col py-3 px-2")}>
                {isCollapsed ? (
                  <>
                    <button onClick={() => setCancelledOpen(true)} className="text-muted-foreground hover:text-foreground">
                      <ChevronRight className="size-4" />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground rounded-full bg-muted px-1.5 py-0.5">{cards.length}</span>
                  </>
                ) : (
                  <>
                    <span className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</span>
                    <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5 ml-auto">{cards.length}</span>
                    {isCancelled && (
                      <button onClick={() => setCancelledOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <ChevronDown className="size-4" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-2">
                  {cards.map((ini) => (
                    <KanbanCard
                      key={ini.id}
                      initiative={ini}
                      onDragStart={(id) => setDragId(id)}
                      onClick={() => onCardClick(ini.id)}
                      onEdit={() => onEdit(ini.id)}
                      onDuplicate={() => onDuplicate(ini.id)}
                      onDelete={() => onDelete(ini.id)}
                      onProgressUpdate={onProgressUpdate}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-muted-foreground rounded-lg border border-dashed">
                      Vazio
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmDialogModal
        open={!!confirm}
        title="Concluir com progresso baixo?"
        description={`O progresso está em ${confirm?.progresso ?? 0}%. Deseja concluir mesmo assim?`}
        confirmLabel="Concluir mesmo assim"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) onStatusChange(confirm.id, confirm.targetStatus)
          setConfirm(null)
        }}
      />
    </>
  )
}

// ─── List view ──────────────────────────────────────────────────────────────

type SortField = "nome" | "responsavel" | "equipe" | "data_termino" | "prioridade" | "status" | "progresso" | null
type SortDir = "asc" | "desc" | null

const PRIORIDADE_ORDER: Record<Prioridade, number> = { critica: 4, alta: 3, media: 2, baixa: 1 }

function ListView({
  initiatives,
  onRowClick,
  onEdit,
  onDuplicate,
  onDelete,
  onClearFilters,
}: {
  initiatives: Initiative[]
  onRowClick: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onClearFilters: () => void
}) {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  function toggleSort(field: SortField) {
    if (sortField !== field) { setSortField(field); setSortDir("asc") }
    else if (sortDir === "asc") setSortDir("desc")
    else { setSortField(null); setSortDir(null) }
  }

  function sorted(list: Initiative[]) {
    if (!sortField || !sortDir) return list
    return [...list].sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0
      if (sortField === "nome") { va = a.nome; vb = b.nome }
      else if (sortField === "responsavel") { va = a.responsavel.nome; vb = b.responsavel.nome }
      else if (sortField === "equipe") { va = a.equipe; vb = b.equipe }
      else if (sortField === "data_termino") { va = a.data_termino; vb = b.data_termino }
      else if (sortField === "prioridade") { va = PRIORIDADE_ORDER[a.prioridade]; vb = PRIORIDADE_ORDER[b.prioridade] }
      else if (sortField === "status") { va = STATUS_ORDER.indexOf(a.status); vb = STATUS_ORDER.indexOf(b.status) }
      else if (sortField === "progresso") { va = a.progresso; vb = b.progresso }
      const cmp = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number)
      return sortDir === "asc" ? cmp : -cmp
    })
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="size-3 ml-1 opacity-40" />
    if (sortDir === "asc") return <ArrowUp className="size-3 ml-1 text-violet-600" />
    return <ArrowDown className="size-3 ml-1 text-violet-600" />
  }

  if (initiatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Filter className="size-8 opacity-40" />
        <p className="text-sm">Nenhuma iniciativa encontrada para os filtros aplicados.</p>
        <Button variant="outline" size="sm" onClick={onClearFilters}>Limpar filtros</Button>
      </div>
    )
  }

  const sortedAll = sorted(initiatives)

  const groups = [{ key: "all", label: "", items: sortedAll }]
  const showGroupHeader = false

  const cols = [
    { key: "responsavel", label: "Responsável", hideable: true, sortable: true },
    { key: "equipe", label: "Equipe", hideable: true, sortable: true },
    { key: "periodo", label: "Período", hideable: true, sortable: true },
    { key: "prioridade", label: "Prioridade", hideable: true, sortable: true },
    { key: "status", label: "Status", hideable: false, sortable: true },
    { key: "progresso", label: "Progresso", hideable: true, sortable: true },
    { key: "saude", label: "Saúde", hideable: true, sortable: false },
    { key: "risco", label: "Risco", hideable: true, sortable: false },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/30">
            <th
              className="text-left py-2 px-3 font-medium text-muted-foreground cursor-pointer whitespace-nowrap"
              onClick={() => toggleSort("nome")}
            >
              <span className="flex items-center">Nome <SortIcon field="nome" /></span>
            </th>
            {cols.filter(c => !hiddenCols.has(c.key)).map((col) => (
              <th
                key={col.key}
                className={cn("text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap", col.sortable && "cursor-pointer")}
                onClick={() => col.sortable && toggleSort(col.key as SortField)}
              >
                <span className="flex items-center">
                  {col.label}
                  {col.sortable && <SortIcon field={col.key as SortField} />}
                </span>
              </th>
            ))}
            <th className="py-2 px-3 w-8">
              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="text-muted-foreground hover:text-foreground" />}>
                  <ChevronsUpDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {cols.filter(c => c.hideable).map(col => (
                    <DropdownMenuItem
                      key={col.key}
                      onClick={() => setHiddenCols(prev => {
                        const next = new Set(prev)
                        next.has(col.key) ? next.delete(col.key) : next.add(col.key)
                        return next
                      })}
                    >
                      <span className={cn("mr-2", hiddenCols.has(col.key) ? "opacity-30" : "")}>✓</span>
                      {col.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <>
              {showGroupHeader && (
                <tr key={`g-${group.key}`} className="bg-muted/50 border-b">
                  <td colSpan={cols.filter(c => !hiddenCols.has(c.key)).length + 2} className="py-1.5 px-3">
                    <button
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                      onClick={() => setCollapsedGroups(prev => {
                        const next = new Set(prev)
                        next.has(group.key) ? next.delete(group.key) : next.add(group.key)
                        return next
                      })}
                    >
                      <ChevronRight className={cn("size-3.5 transition-transform", !collapsedGroups.has(group.key) && "rotate-90")} />
                      {group.label} · {group.items.length}
                    </button>
                  </td>
                </tr>
              )}
              {!collapsedGroups.has(group.key) && group.items.map((ini) => {
                const atrasada = isAtrasada(ini)
                const saude = calcSaude(ini)
                return (
                  <tr
                    key={ini.id}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("[data-no-click]")) return
                      onRowClick(ini.id)
                    }}
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-sm line-clamp-1">{ini.nome}</div>
                      <div className="text-xs text-muted-foreground">{ini.id}</div>
                    </td>
                    {!hiddenCols.has("responsavel") && (
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <AvatarInitials iniciais={ini.responsavel.avatar_iniciais} size={24} />
                          <span className="text-xs whitespace-nowrap">{ini.responsavel.nome}</span>
                        </div>
                      </td>
                    )}
                    {!hiddenCols.has("equipe") && <td className="py-2 px-3 text-xs whitespace-nowrap">{ini.equipe}</td>}
                    {!hiddenCols.has("periodo") && (
                      <td className="py-2 px-3 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {formatDate(ini.data_inicio)} – {formatDate(ini.data_termino)}
                          {atrasada && <span className="ml-1 inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-medium bg-red-100 text-red-700">Atrasada</span>}
                        </div>
                      </td>
                    )}
                    {!hiddenCols.has("prioridade") && <td className="py-2 px-3"><PrioridadeBadge prioridade={ini.prioridade} /></td>}
                    {!hiddenCols.has("status") && <td className="py-2 px-3"><StatusBadge status={ini.status} /></td>}
                    {!hiddenCols.has("progresso") && (
                      <td className="py-2 px-3 min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={ini.progresso} height={6} className="w-16" />
                          <span className="text-xs">{ini.progresso}%</span>
                        </div>
                      </td>
                    )}
                    {!hiddenCols.has("saude") && (
                      <td className="py-2 px-3"><SaudeDot saude={saude} /></td>
                    )}
                    {!hiddenCols.has("risco") && (
                      <td className="py-2 px-3">
                        {ini.nivel_risco ? (
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", RISCO_CONFIG[ini.nivel_risco].bg, RISCO_CONFIG[ini.nivel_risco].color)}>
                            {RISCO_CONFIG[ini.nivel_risco].label}
                          </span>
                        ) : "—"}
                      </td>
                    )}
                    <td className="py-2 px-3" data-no-click>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-muted text-muted-foreground">
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(ini.id)}><Edit2 className="size-3.5 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(ini.id)}><Copy className="size-3.5 mr-2" />Duplicar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(ini.id)} className="text-red-600"><Trash2 className="size-3.5 mr-2" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Initiative modal (create/edit) ─────────────────────────────────────────

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  status: "nao_iniciada" as Status,
  prioridade: "media" as Prioridade,
  responsavel_id: "u1",
  equipe: "RH",
  data_inicio: "",
  data_termino: "",
  orcamento_estimado: "",
  custo_realizado: "",
  retorno_estimado: "",
  nivel_risco: "" as NivelRisco | "",
  descricao_risco: "",
  acoes_mitigacao: [] as string[],
  okrs_vinculados: [] as Array<{ id: string; nome: string; progresso: number }>,
  kpis_vinculados: [] as Array<{ id: string; nome: string; valor_atual: number; meta: number; unidade: string }>,
}

function InitiativeModal({
  open,
  mode,
  initial,
  initiatives,
  onClose,
  onSave,
}: {
  open: boolean
  mode: "create" | "edit"
  initial?: Initiative
  initiatives: Initiative[]
  onClose: () => void
  onSave: (data: Partial<Initiative>) => void
}) {
  const [tab, setTab] = useState("geral")
  const [form, setForm] = useState(EMPTY_FORM)
  const [dateError, setDateError] = useState("")
  const [tabErrors, setTabErrors] = useState<Set<string>>(new Set())
  const [newAcao, setNewAcao] = useState("")
  const [okrSearch, setOkrSearch] = useState("")
  const [kpiSearch, setKpiSearch] = useState("")

  useEffect(() => {
    if (!open) return
    setTab("geral")
    setTabErrors(new Set())
    if (mode === "edit" && initial) {
      setForm({
        nome: initial.nome,
        descricao: initial.descricao,
        status: initial.status,
        prioridade: initial.prioridade,
        responsavel_id: initial.responsavel.id,
        equipe: initial.equipe,
        data_inicio: initial.data_inicio,
        data_termino: initial.data_termino,
        orcamento_estimado: initial.orcamento_estimado != null ? String(initial.orcamento_estimado) : "",
        custo_realizado: initial.custo_realizado != null ? String(initial.custo_realizado) : "",
        retorno_estimado: initial.retorno_estimado != null ? String(initial.retorno_estimado) : "",
        nivel_risco: initial.nivel_risco ?? "",
        descricao_risco: "",
        acoes_mitigacao: [],
        okrs_vinculados: initial.okrs_vinculados,
        kpis_vinculados: initial.kpis_vinculados,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setDateError("")
  }, [open, mode, initial])

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validateDates(inicio: string, termino: string) {
    if (inicio && termino && termino < inicio) {
      setDateError("A data de término deve ser igual ou posterior à data de início.")
      return false
    }
    setDateError("")
    return true
  }

  const isFormValid =
    form.nome.trim().length > 0 &&
    form.responsavel_id &&
    form.equipe &&
    form.prioridade &&
    form.status &&
    form.data_inicio &&
    form.data_termino &&
    !dateError

  const roiEstimado = calcROI(
    form.orcamento_estimado ? parseFloat(form.orcamento_estimado) : null,
    form.retorno_estimado ? parseFloat(form.retorno_estimado) : null
  )

  function handleSave() {
    if (!isFormValid) return
    const responsavel = MOCK_USERS.find(u => u.id === form.responsavel_id)!
    onSave({
      nome: form.nome,
      descricao: form.descricao,
      status: form.status,
      prioridade: form.prioridade,
      responsavel: { id: responsavel.id, nome: responsavel.nome, avatar_iniciais: responsavel.avatar_iniciais },
      equipe: form.equipe,
      data_inicio: form.data_inicio,
      data_termino: form.data_termino,
      orcamento_estimado: form.orcamento_estimado ? parseFloat(form.orcamento_estimado) : null,
      custo_realizado: form.custo_realizado ? parseFloat(form.custo_realizado) : null,
      retorno_estimado: form.retorno_estimado ? parseFloat(form.retorno_estimado) : null,
      nivel_risco: (form.nivel_risco as NivelRisco) || null,
      okrs_vinculados: form.okrs_vinculados,
      kpis_vinculados: form.kpis_vinculados,
    })
  }

  const filteredOkrs = MOCK_OKRS.filter(
    o => o.nome.toLowerCase().includes(okrSearch.toLowerCase()) &&
    !form.okrs_vinculados.some(v => v.id === o.id)
  )

  const filteredKpis = MOCK_KPIS_LIST.filter(
    k => k.nome.toLowerCase().includes(kpiSearch.toLowerCase()) &&
    !form.kpis_vinculados.some(v => v.id === k.id)
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{mode === "create" ? "Nova iniciativa" : "Editar iniciativa"}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6 mt-4 w-auto justify-start shrink-0">
            {[
              { value: "geral", label: "Geral" },
              { value: "financeiro", label: "Financeiro" },
              { value: "risco", label: "Risco" },
              { value: "vinculos", label: "Vínculos" },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="relative">
                {t.label}
                {tabErrors.has(t.value) && (
                  <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-red-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="geral" className="mt-0 space-y-4">
              <div className="space-y-1">
                <Label>Nome <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    value={form.nome}
                    maxLength={120}
                    onChange={e => set("nome", e.target.value)}
                    placeholder="Nome da iniciativa"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {form.nome.length}/120
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Responsável <span className="text-red-500">*</span></Label>
                  <Select value={form.responsavel_id} onValueChange={v => set("responsavel_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione">
                        {MOCK_USERS.find(u => u.id === form.responsavel_id)?.nome}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Equipe <span className="text-red-500">*</span></Label>
                  <Select value={form.equipe} onValueChange={v => set("equipe", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MOCK_TEAMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Prioridade <span className="text-red-500">*</span></Label>
                  <Select value={form.prioridade} onValueChange={v => set("prioridade", v as Prioridade)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PRIORIDADE_CONFIG) as Prioridade[]).map(p => (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            <span className={cn("size-2 rounded-full", p === "critica" ? "bg-red-500" : p === "alta" ? "bg-orange-500" : p === "media" ? "bg-amber-400" : "bg-slate-400")} />
                            {PRIORIDADE_CONFIG[p].label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <Select value={form.status} onValueChange={v => set("status", v as Status)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map(s => (
                        <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Data de início <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={form.data_inicio}
                    onChange={e => { set("data_inicio", e.target.value); validateDates(e.target.value, form.data_termino) }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Data de término <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={form.data_termino}
                    onChange={e => { set("data_termino", e.target.value); validateDates(form.data_inicio, e.target.value) }}
                    className={dateError ? "border-red-400" : ""}
                  />
                  {dateError && <p className="text-xs text-red-500">{dateError}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Descrição</Label>
                <Textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={3} placeholder="Descreva o objetivo e contexto da iniciativa..." />
              </div>
            </TabsContent>

            <TabsContent value="financeiro" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: "orcamento_estimado", label: "Orçamento estimado" },
                  { field: "custo_realizado", label: "Custo realizado" },
                  { field: "retorno_estimado", label: "Retorno estimado" },
                ].map(({ field, label }) => (
                  <div key={field} className="space-y-1">
                    <Label>{label}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        className="pl-8"
                        value={(form as Record<string, string>)[field]}
                        onChange={e => set(field, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
                <div className="space-y-1">
                  <Label>ROI estimado</Label>
                  <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                    {roiEstimado}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risco" className="mt-0 space-y-4">
              <div className="space-y-1">
                <Label>Nível de risco</Label>
                <Select value={form.nivel_risco ?? ""} onValueChange={v => set("nivel_risco", v || null)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Descrição do risco</Label>
                <Textarea value={form.descricao_risco} onChange={e => set("descricao_risco", e.target.value)} rows={2} placeholder="Descreva os principais riscos identificados..." />
              </div>
              <div className="space-y-2">
                <Label>Ações de mitigação</Label>
                <div className="space-y-2">
                  {form.acoes_mitigacao.map((acao, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={acao}
                        onChange={e => {
                          const next = [...form.acoes_mitigacao]
                          next[i] = e.target.value
                          set("acoes_mitigacao", next)
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost" size="icon" className="size-8 text-muted-foreground"
                        onClick={() => set("acoes_mitigacao", form.acoes_mitigacao.filter((_, j) => j !== i))}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newAcao} onChange={e => setNewAcao(e.target.value)} placeholder="Nova ação..." className="flex-1" />
                  <Button
                    variant="outline" size="sm"
                    onClick={() => { if (newAcao.trim()) { set("acoes_mitigacao", [...form.acoes_mitigacao, newAcao.trim()]); setNewAcao("") } }}
                  >
                    <Plus className="size-3.5 mr-1" />Adicionar
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vinculos" className="mt-0 space-y-6">
              {/* OKRs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>OKRs vinculados</Label>
                  <span className="text-xs text-muted-foreground">{form.okrs_vinculados.length}/5</span>
                </div>
                {form.okrs_vinculados.length < 5 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="pl-8" placeholder="Buscar OKR..." value={okrSearch} onChange={e => setOkrSearch(e.target.value)} />
                    {okrSearch && filteredOkrs.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 overflow-hidden">
                        {filteredOkrs.map(o => (
                          <button
                            key={o.id}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted text-left"
                            onClick={() => { set("okrs_vinculados", [...form.okrs_vinculados, o]); setOkrSearch("") }}
                          >
                            <span className="flex-1 line-clamp-1">{o.nome}</span>
                            <span className="text-xs text-muted-foreground ml-2">{o.progresso}%</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  {form.okrs_vinculados.map(o => (
                    <div key={o.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span className="flex-1 line-clamp-1">{o.nome}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-muted-foreground">{o.progresso}%</span>
                        <button onClick={() => set("okrs_vinculados", form.okrs_vinculados.filter(v => v.id !== o.id))} className="text-muted-foreground hover:text-foreground">
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="space-y-2">
                <Label>KPIs vinculados</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Buscar KPI..." value={kpiSearch} onChange={e => setKpiSearch(e.target.value)} />
                  {kpiSearch && filteredKpis.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 overflow-hidden">
                      {filteredKpis.map(k => (
                        <button
                          key={k.id}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted text-left"
                          onClick={() => { set("kpis_vinculados", [...form.kpis_vinculados, k]); setKpiSearch("") }}
                        >
                          <span>{k.nome}</span>
                          <span className="text-xs text-muted-foreground">{k.valor_atual}/{k.meta} {k.unidade}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  {form.kpis_vinculados.map(k => (
                    <div key={k.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span>{k.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{k.valor_atual}/{k.meta} {k.unidade}</span>
                        <button onClick={() => set("kpis_vinculados", form.kpis_vinculados.filter(v => v.id !== k.id))} className="text-muted-foreground hover:text-foreground">
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <div className="relative group">
              <Button onClick={handleSave} disabled={!isFormValid}>
                {mode === "create" ? "Criar iniciativa" : "Salvar"}
              </Button>
              {!isFormValid && (
                <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                  Preencha os campos obrigatórios para continuar
                </div>
              )}
            </div>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail drawer ──────────────────────────────────────────────────────────

function DetailDrawer({
  initiative,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onProgressUpdate,
}: {
  initiative: Initiative
  onClose: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onProgressUpdate: (id: string, progresso: number, obs: string) => void
}) {
  const [tab, setTab] = useState("visao-geral")
  const [progressModal, setProgressModal] = useState(false)
  const [sliderVal, setSliderVal] = useState(initiative.progresso)
  const [obsVal, setObsVal] = useState("")
  const [descExpanded, setDescExpanded] = useState(false)
  const saude = calcSaude(initiative)
  const atrasada = isAtrasada(initiative)

  function handleProgressSave() {
    onProgressUpdate(initiative.id, sliderVal, obsVal)
    setProgressModal(false)
    setObsVal("")
  }

  const chartData = [...initiative.historico_check_ins]
    .reverse()
    .map(c => ({ data: c.data.slice(5), progresso: c.progresso_novo }))

  const consumo = initiative.orcamento_estimado && initiative.custo_realizado
    ? (initiative.custo_realizado / initiative.orcamento_estimado) * 100
    : 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex flex-col w-[480px] h-full bg-background border-l shadow-xl overflow-hidden">
        {/* Drawer header */}
        <div className="flex items-start gap-3 p-4 border-b shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">{initiative.id}</p>
            <h2 className="font-semibold text-base leading-snug line-clamp-2">{initiative.nome}</h2>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <StatusBadge status={initiative.status} />
              <PrioridadeBadge prioridade={initiative.prioridade} />
              {atrasada && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">Atrasada</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="outline" onClick={onEdit}><Edit2 className="size-3.5 mr-1" />Editar</Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="size-8 rounded-md inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDuplicate}><Copy className="size-3.5 mr-2" />Duplicar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="size-3.5 mr-2" />Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="icon" variant="ghost" className="size-8" onClick={onClose}><X className="size-4" /></Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-4 mt-3 w-auto justify-start shrink-0 flex-wrap h-auto gap-1">
            {["visao-geral", "vinculos", "financeiro", "risco", "historico"].map(t => (
              <TabsTrigger key={t} value={t} className="text-xs px-2.5 py-1">
                {{
                  "visao-geral": "Visão geral",
                  vinculos: "Vínculos",
                  financeiro: "Financeiro",
                  risco: "Risco",
                  historico: "Histórico",
                }[t]}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Visão geral */}
            <TabsContent value="visao-geral" className="mt-0 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm font-bold text-violet-700">{initiative.progresso}%</span>
                </div>
                <ProgressBar value={initiative.progresso} height={8} />
                <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => { setSliderVal(initiative.progresso); setProgressModal(true) }}>
                  <Plus className="size-3 mr-1" />Atualizar progresso
                </Button>
              </div>

              {progressModal && (
                <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
                  <p className="text-xs font-medium">Atualizar progresso</p>
                  <div className="flex items-center gap-3">
                    <Slider min={0} max={100} step={1} value={[sliderVal]} onValueChange={([v]) => setSliderVal(v)} className="flex-1" />
                    <span className="text-sm w-8 text-right font-medium">{sliderVal}%</span>
                  </div>
                  <Textarea value={obsVal} onChange={e => setObsVal(e.target.value)} placeholder="Observação (opcional)..." rows={2} className="text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={handleProgressSave}>Salvar</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setProgressModal(false)}>Cancelar</Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Responsável</p>
                  <div className="flex items-center gap-1.5">
                    <AvatarInitials iniciais={initiative.responsavel.avatar_iniciais} size={20} />
                    <span>{initiative.responsavel.nome}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Equipe</p>
                  <p>{initiative.equipe}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p>{formatDate(initiative.data_inicio)} – {formatDate(initiative.data_termino)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Saúde</p>
                  <div className="flex items-center gap-1.5"><SaudeDot saude={saude} /><span className="capitalize">{saude === "verde" ? "Boa" : saude === "amarelo" ? "Atenção" : "Crítica"}</span></div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Última atualização</p>
                  <p>{formatDate(initiative.atualizado_em)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                {initiative.descricao ? (
                  <div>
                    <p className={cn("text-sm", !descExpanded && "line-clamp-3")}>{initiative.descricao}</p>
                    {initiative.descricao.length > 120 && (
                      <button className="text-xs text-violet-600 hover:underline mt-0.5" onClick={() => setDescExpanded(v => !v)}>
                        {descExpanded ? "Ver menos" : "Ver mais"}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Adicione uma descrição...</p>
                )}
              </div>

              {initiative.kpis_vinculados.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">KPIs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {initiative.kpis_vinculados.map(k => {
                      const trend = k.valor_atual >= k.meta ? "up" : k.valor_atual === k.meta ? "eq" : "down"
                      return (
                        <div key={k.id} className="rounded-lg border p-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{k.nome}</span>
                            {trend === "up" ? <TrendingUp className="size-3.5 text-green-500" /> : trend === "down" ? <TrendingDown className="size-3.5 text-red-500" /> : <Minus className="size-3.5 text-muted-foreground" />}
                          </div>
                          <p className="text-base font-bold">{k.valor_atual}<span className="text-xs text-muted-foreground ml-0.5">{k.unidade}</span></p>
                          <p className="text-xs text-muted-foreground">Meta: {k.meta} {k.unidade}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Vínculos */}
            <TabsContent value="vinculos" className="mt-0 space-y-4">
              <section className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OKRs</p>
                {initiative.okrs_vinculados.length > 0 ? initiative.okrs_vinculados.map(o => (
                  <div key={o.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span className="flex-1 line-clamp-1">{o.nome}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <ProgressBar value={o.progresso} height={4} className="w-16" />
                      <span className="text-xs text-muted-foreground">{o.progresso}%</span>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Nenhum OKR vinculado.</p>}
              </section>
              <section className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">KPIs</p>
                {initiative.kpis_vinculados.length > 0 ? initiative.kpis_vinculados.map(k => (
                  <div key={k.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span>{k.nome}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs">{k.valor_atual}/{k.meta} {k.unidade}</span>
                      {k.valor_atual >= k.meta ? <TrendingUp className="size-3.5 text-green-500" /> : <TrendingDown className="size-3.5 text-red-500" />}
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Nenhum KPI vinculado.</p>}
              </section>
              <section className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pesquisas</p>
                <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  eNPS: 42 · Jan/26 <TrendingUp className="inline size-3 text-green-500 ml-1" />
                </div>
              </section>
            </TabsContent>

            {/* Financeiro */}
            <TabsContent value="financeiro" className="mt-0 space-y-4">
              {initiative.orcamento_estimado == null && initiative.custo_realizado == null ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Globe className="size-8 opacity-30" />
                  <p className="text-sm">Nenhuma informação financeira cadastrada.</p>
                  <Button size="sm" variant="outline" onClick={onEdit}>Adicionar informações financeiras</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Orçamento estimado", value: formatCurrency(initiative.orcamento_estimado) },
                      { label: "Custo realizado", value: formatCurrency(initiative.custo_realizado) },
                      { label: "Retorno estimado", value: formatCurrency(initiative.retorno_estimado) },
                      { label: "ROI estimado", value: calcROI(initiative.orcamento_estimado, initiative.retorno_estimado) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border p-3 space-y-1">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-base font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                  {initiative.orcamento_estimado && initiative.custo_realizado != null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Consumo do orçamento</span>
                        <span className={consumo > 100 ? "text-red-600 font-medium" : ""}>{consumo.toFixed(0)}%</span>
                      </div>
                      <div className="w-full rounded-full bg-muted overflow-hidden h-2">
                        <div
                          className={cn("h-full rounded-full transition-all", consumo > 100 ? "bg-red-500" : "bg-violet-500")}
                          style={{ width: `${Math.min(100, consumo)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Risco */}
            <TabsContent value="risco" className="mt-0 space-y-4">
              {!initiative.nivel_risco ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                  <AlertTriangle className="size-8 opacity-30" />
                  <p className="text-sm">Nenhum risco avaliado.</p>
                  <Button size="sm" variant="outline" onClick={onEdit}>Avaliar risco</Button>
                </div>
              ) : (
                <>
                  <div className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold", RISCO_CONFIG[initiative.nivel_risco].bg, RISCO_CONFIG[initiative.nivel_risco].color)}>
                    <AlertTriangle className="size-4" />
                    Risco {RISCO_CONFIG[initiative.nivel_risco].label}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Descrição do risco</p>
                    <p className="text-sm text-muted-foreground italic">Não informado.</p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Histórico */}
            <TabsContent value="historico" className="mt-0 space-y-4">
              {chartData.length > 1 && (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="progresso" stroke="rgb(124 58 237)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {initiative.historico_check_ins.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum check-in registrado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {initiative.historico_check_ins.map((c, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="size-2 rounded-full bg-violet-400 mt-1.5" />
                        {i < initiative.historico_check_ins.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <AvatarInitials iniciais={c.usuario.split(" ").map(n => n[0]).slice(0, 2).join("")} size={18} />
                          <span className="font-medium text-xs">{c.usuario}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(c.data)}</span>
                          <span className="ml-auto text-xs font-medium">{c.progresso_anterior}% → {c.progresso_novo}%</span>
                        </div>
                        {c.observacao && <p className="text-xs text-muted-foreground">{c.observacao}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Filters panel ───────────────────────────────────────────────────────────

interface Filters {
  status: Status[]
  prioridade: Prioridade[]
  equipe: string[]
  responsavel: string[]
  risco: string[]
}

function FiltersSheet({
  initiatives,
  filters,
  onChange,
  onClear,
  total,
  activeCount,
}: {
  initiatives: Initiative[]
  filters: Filters
  onChange: (filters: Filters) => void
  onClear: () => void
  total: number
  activeCount: number
}) {
  const teams = [...new Set(initiatives.map(i => i.equipe))]
  const responsaveis = [...new Set(initiatives.map(i => i.responsavel.nome))]

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
  }

  function ChipGroup<T extends string>({
    label, options, selected, onToggle,
  }: { label: string; options: Array<{ value: T; label: string }>; selected: T[]; onToggle: (v: T) => void }) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="flex flex-wrap gap-1.5">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                selected.includes(opt.value)
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-border hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant={activeCount > 0 ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5" />
        }
      >
        <Filter className="size-3.5" />
        Filtros
        {activeCount > 0 && (
          <span className="ml-0.5 rounded-full bg-white text-violet-700 text-[10px] font-bold px-1.5 py-0 leading-4">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Refine as iniciativas por status, prioridade, equipe e mais.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <ChipGroup
            label="Status"
            options={STATUS_ORDER.map(s => ({ value: s, label: STATUS_CONFIG[s].label }))}
            selected={filters.status}
            onToggle={v => onChange({ ...filters, status: toggle(filters.status, v) })}
          />
          <ChipGroup
            label="Prioridade"
            options={(Object.keys(PRIORIDADE_CONFIG) as Prioridade[]).map(p => ({ value: p, label: PRIORIDADE_CONFIG[p].label }))}
            selected={filters.prioridade}
            onToggle={v => onChange({ ...filters, prioridade: toggle(filters.prioridade, v) })}
          />
          <ChipGroup
            label="Equipe"
            options={teams.map(t => ({ value: t, label: t }))}
            selected={filters.equipe}
            onToggle={v => onChange({ ...filters, equipe: toggle(filters.equipe, v) })}
          />
          <ChipGroup
            label="Responsável"
            options={responsaveis.map(r => ({ value: r, label: r }))}
            selected={filters.responsavel}
            onToggle={v => onChange({ ...filters, responsavel: toggle(filters.responsavel, v) })}
          />
          <ChipGroup
            label="Risco"
            options={[
              { value: "baixo", label: "Baixo" },
              { value: "medio", label: "Médio" },
              { value: "alto", label: "Alto" },
              { value: "critico", label: "Crítico" },
            ]}
            selected={filters.risco}
            onToggle={v => onChange({ ...filters, risco: toggle(filters.risco, v) })}
          />
        </div>
        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {total} iniciativa{total !== 1 ? "s" : ""} visível{total !== 1 ? "s" : ""}
          </span>
          <button onClick={onClear} className="text-xs text-violet-600 hover:underline">
            Limpar filtros
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Gantt view ─────────────────────────────────────────────────────────────

const MONTH_NAMES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const STATUS_BAR_COLOR: Record<Status, { bg: string; fill: string }> = {
  nao_iniciada: { bg: "bg-slate-200", fill: "bg-slate-400" },
  em_andamento: { bg: "bg-blue-100", fill: "bg-blue-500" },
  pausada: { bg: "bg-amber-100", fill: "bg-amber-400" },
  concluida: { bg: "bg-green-100", fill: "bg-green-500" },
  cancelada: { bg: "bg-red-100", fill: "bg-red-400" },
}

function GanttView({
  initiatives,
  onRowClick,
  onEdit,
}: {
  initiatives: Initiative[]
  onRowClick: (id: string) => void
  onEdit: (id: string) => void
}) {
  const LEFT_WIDTH = 300
  const MONTH_WIDTH = 160
  const ROW_HEIGHT = 52
  const GROUP_ROW_HEIGHT = 32

  const scrollRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; ini: Initiative } | null>(null)
  // Popover for concluded initiatives: { id, anchorRect }
  const [donePopover, setDonePopover] = useState<{ id: string; rect: DOMRect } | null>(null)

  if (initiatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <GanttChart className="size-8 opacity-30" />
        <p className="text-sm">Nenhuma iniciativa para exibir.</p>
      </div>
    )
  }

  // Date range — min/max across all visible initiatives + 1 month padding on each side
  const allMs = initiatives.flatMap(i => [new Date(i.data_inicio).getTime(), new Date(i.data_termino).getTime()])
  const rawMin = new Date(Math.min(...allMs))
  const rawMax = new Date(Math.max(...allMs))
  const startDate = new Date(rawMin.getFullYear(), rawMin.getMonth() - 1, 1)
  const endDate = new Date(rawMax.getFullYear(), rawMax.getMonth() + 2, 0)
  const totalMs = endDate.getTime() - startDate.getTime()

  // Build months array
  const months: Date[] = []
  let cur = new Date(startDate)
  while (cur <= endDate) {
    months.push(new Date(cur))
    cur.setMonth(cur.getMonth() + 1)
  }
  const totalWidth = months.length * MONTH_WIDTH

  // Today marker position
  const todayMs = new Date(TODAY).getTime()
  const todayLeft = ((todayMs - startDate.getTime()) / totalMs) * totalWidth

  function barStyle(ini: Initiative): { left: number; width: number } {
    const left = ((new Date(ini.data_inicio).getTime() - startDate.getTime()) / totalMs) * totalWidth
    const width = Math.max(10, ((new Date(ini.data_termino).getTime() - new Date(ini.data_inicio).getTime()) / totalMs) * totalWidth)
    return { left: Math.max(0, left), width }
  }

  // Scroll so that a timeline X position is centered in the visible timeline area
  function scrollToX(x: number) {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const visibleTimeline = container.clientWidth - LEFT_WIDTH
    container.scrollLeft = Math.max(0, x - visibleTimeline / 2)
  }

  // On mount: scroll to center today
  useEffect(() => {
    scrollToX(todayLeft)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close popover on outside click
  useEffect(() => {
    if (!donePopover) return
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest("[data-done-popover]")) setDonePopover(null)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [donePopover])

  type Row = { type: "ini"; initiative: Initiative }
  const rows: Row[] = initiatives.map(i => ({ type: "ini" as const, initiative: i }))

  // Week lines within each month
  function weekLines(monthIndex: number, month: Date): number[] {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const lines: number[] = []
    for (let day = 7; day < daysInMonth; day += 7) {
      lines.push((monthIndex * MONTH_WIDTH) + (day / daysInMonth) * MONTH_WIDTH)
    }
    return lines
  }

  return (
    <div ref={scrollRef} className="h-full overflow-auto relative" onClick={() => setDonePopover(null)}>
      <div style={{ minWidth: LEFT_WIDTH + totalWidth }}>

        {/* ── Sticky month header ── */}
        <div className="sticky top-0 z-20 flex border-b bg-background shadow-sm">
          {/* Corner */}
          <div
            className="sticky left-0 z-30 bg-background border-r shrink-0 flex items-end px-4 pb-2"
            style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
          >
            <span className="text-xs font-medium text-muted-foreground">Iniciativa</span>
          </div>

          {/* Month columns */}
          <div className="flex relative" style={{ width: totalWidth }}>
            {months.map((m, i) => (
              <div
                key={i}
                className="border-r shrink-0 px-3 py-2"
                style={{ width: MONTH_WIDTH, minWidth: MONTH_WIDTH }}
              >
                <span className="text-sm font-semibold">{MONTH_NAMES_PT[m.getMonth()]}</span>
                <span className="text-xs text-muted-foreground ml-1.5">{m.getFullYear()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rows ── */}
        {rows.map((row, idx) => {
          // Group header row
          if (row.type === "group") {
            return (
              <div
                key={`g-${idx}`}
                className="flex bg-muted/40 border-b"
                style={{ height: GROUP_ROW_HEIGHT }}
              >
                <div
                  className="sticky left-0 z-10 bg-muted border-r flex items-center px-4 gap-1.5 shrink-0"
                  style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
                >
                  <span className="text-xs font-semibold text-muted-foreground">{row.label}</span>
                  <span className="text-xs text-muted-foreground/60">({row.count})</span>
                </div>
                <div className="relative shrink-0" style={{ width: totalWidth }}>
                  {months.map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 border-r border-border/20" style={{ left: (i + 1) * MONTH_WIDTH }} />
                  ))}
                  {todayLeft >= 0 && todayLeft <= totalWidth && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-400/50" style={{ left: todayLeft }} />
                  )}
                </div>
              </div>
            )
          }

          // Initiative row
          const ini = row.initiative
          const { left, width } = barStyle(ini)
          const atrasada = isAtrasada(ini)
          const colors = STATUS_BAR_COLOR[ini.status]
          const saude = calcSaude(ini)
          const isDone = ini.status === "concluida"

          function handleLeftCellClick(e: React.MouseEvent<HTMLDivElement>) {
            e.stopPropagation()
            if (isDone) {
              setDonePopover({ id: ini.id, rect: e.currentTarget.getBoundingClientRect() })
            } else {
              onRowClick(ini.id)
            }
          }

          return (
            <div
              key={ini.id}
              className="flex border-b hover:bg-muted/20 transition-colors group"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Left info cell */}
              <div
                className={cn(
                  "sticky left-0 z-10 bg-background border-r flex items-center gap-2.5 px-3 shrink-0 group-hover:bg-muted transition-colors",
                  isDone ? "cursor-pointer" : "cursor-pointer"
                )}
                style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
                onClick={handleLeftCellClick}
              >
                <AvatarInitials iniciais={ini.responsavel.avatar_iniciais} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn(
                      "text-sm font-medium leading-snug truncate",
                      isDone && "underline decoration-dotted underline-offset-2"
                    )}>
                      {ini.nome}
                    </p>
                    {isDone && <ChevronDown className="size-3 shrink-0 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <SaudeDot saude={saude} />
                    <span className="text-xs text-muted-foreground truncate">{ini.responsavel.nome}</span>
                  </div>
                </div>
              </div>

              {/* Timeline cell — clicking here opens drawer for all */}
              <div
                className="relative shrink-0 cursor-pointer"
                style={{ width: totalWidth, height: ROW_HEIGHT }}
                onClick={(e) => { e.stopPropagation(); onRowClick(ini.id) }}
              >
                {/* Week sub-grid */}
                {months.map((m, i) =>
                  weekLines(i, m).map((x, wi) => (
                    <div key={`w-${i}-${wi}`} className="absolute top-0 bottom-0 border-r border-border/10" style={{ left: x }} />
                  ))
                )}

                {/* Month grid lines */}
                {months.map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 border-r border-border/25" style={{ left: (i + 1) * MONTH_WIDTH }} />
                ))}

                {/* Today line */}
                {todayLeft >= 0 && todayLeft <= totalWidth && (
                  <>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10" style={{ left: todayLeft }} />
                    <div
                      className="absolute top-0 text-[9px] font-bold text-red-500 bg-red-50 border border-red-300 rounded px-0.5 leading-4 z-10"
                      style={{ left: todayLeft + 2 }}
                    >
                      Hoje
                    </div>
                  </>
                )}

                {/* Bar */}
                <div
                  className={cn(
                    "absolute rounded-full overflow-hidden",
                    ini.status === "cancelada" && "opacity-50",
                    atrasada && "ring-1 ring-red-500 ring-offset-0"
                  )}
                  style={{ left, width, top: ROW_HEIGHT / 2 - 10, height: 20 }}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    setTooltip({ x: rect.left, y: rect.top, ini })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div className={cn("absolute inset-0", colors.bg)} />
                  <div
                    className={cn("absolute inset-y-0 left-0 transition-all", colors.fill)}
                    style={{ width: `${ini.progresso}%` }}
                  />
                  {width > 48 && (
                    <div className="absolute inset-0 flex items-center px-2.5 pointer-events-none">
                      <span className="text-[10px] font-semibold text-white/90 drop-shadow-sm truncate">
                        {ini.progresso}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Date range label */}
                {width > 80 && (
                  <div
                    className="absolute text-[10px] text-muted-foreground/80 pointer-events-none"
                    style={{ left: left + 2, top: ROW_HEIGHT / 2 + 11 }}
                  >
                    {formatDate(ini.data_inicio)} – {formatDate(ini.data_termino)}
                  </div>
                )}

                {/* Overdue badge */}
                {atrasada && (
                  <div
                    className="absolute text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded px-1 leading-4 pointer-events-none"
                    style={{ left: Math.min(left + width + 4, totalWidth - 60), top: ROW_HEIGHT / 2 - 8 }}
                  >
                    Atrasada
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Bottom spacer */}
        <div style={{ height: 24 }} />
      </div>

      {/* ── Popover for concluded initiatives ── */}
      {donePopover && (() => {
        const ini = initiatives.find(i => i.id === donePopover.id)
        if (!ini) return null
        const { left: barLeft, width: barWidth } = barStyle(ini)
        const r = donePopover.rect
        const containerLeft = scrollRef.current?.getBoundingClientRect().left ?? 0
        const timelineStartX = containerLeft + LEFT_WIDTH
        const popLeft = Math.min(Math.max(timelineStartX + 4, r.left), window.innerWidth - 216)
        return (
          <div
            data-done-popover
            className="fixed z-50 bg-popover border rounded-lg shadow-lg py-1 w-52"
            style={{ left: popLeft, top: r.bottom + 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 border-b mb-1">
              <p className="text-xs font-semibold truncate">{ini.nome}</p>
              <p className="text-xs text-muted-foreground">{formatDate(ini.data_inicio)} – {formatDate(ini.data_termino)}</p>
            </div>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted text-left"
              onClick={() => { setDonePopover(null); onEdit(ini.id) }}
            >
              <Edit2 className="size-3.5 text-muted-foreground" />
              Editar
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted text-left"
              onClick={() => {
                setDonePopover(null)
                scrollToX(barLeft + barWidth / 2)
              }}
            >
              <Calendar className="size-3.5 text-muted-foreground" />
              Ir ao período de execução
            </button>
          </div>
        )
      })()}

      {/* ── Tooltip ── */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-popover border rounded-lg shadow-lg px-3 py-2.5 text-xs max-w-56"
          style={{
            left: Math.max((scrollRef.current?.getBoundingClientRect().left ?? 0) + LEFT_WIDTH + 4, tooltip.x),
            top: tooltip.y - 90,
          }}
        >
          <p className="font-semibold mb-1.5 text-sm leading-snug">{tooltip.ini.nome}</p>
          <div className="space-y-0.5 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <StatusBadge status={tooltip.ini.status} />
              <PrioridadeBadge prioridade={tooltip.ini.prioridade} />
            </div>
            <p className="mt-1">{formatDate(tooltip.ini.data_inicio)} → {formatDate(tooltip.ini.data_termino)}</p>
            <p>Progresso: <span className="font-medium text-foreground">{tooltip.ini.progresso}%</span></p>
            <p>{tooltip.ini.responsavel.nome} · {tooltip.ini.equipe}</p>
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="sticky bottom-0 left-0 flex items-center gap-4 bg-background/95 border-t px-4 py-2 flex-wrap">
        {STATUS_ORDER.map(s => {
          const colors = STATUS_BAR_COLOR[s]
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn("size-3 rounded-full", colors.fill)} />
              <span className="text-xs text-muted-foreground">{STATUS_CONFIG[s].label}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-1.5 ml-2 border-l pl-4">
          <div className="w-3 h-0.5 bg-red-400" />
          <span className="text-xs text-muted-foreground">Hoje</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = { status: [], prioridade: [], equipe: [], responsavel: [], risco: [] }

export default function Iniciativas() {
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES)
  const [activeView, setActiveView] = useState<View>("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const [toasts, setToasts] = useState<Toast[]>([])
  const [drawerInitId, setDrawerInitId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [modalInitId, setModalInitId] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  const drawerInit = drawerInitId ? initiatives.find(i => i.id === drawerInitId) ?? null : null

  const activeFiltersCount =
    filters.status.length + filters.prioridade.length + filters.equipe.length +
    filters.responsavel.length + filters.risco.length

  const filtered = initiatives.filter(ini => {
    if (searchQuery && !ini.nome.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ini.descricao.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filters.status.length && !filters.status.includes(ini.status)) return false
    if (filters.prioridade.length && !filters.prioridade.includes(ini.prioridade)) return false
    if (filters.equipe.length && !filters.equipe.includes(ini.equipe)) return false
    if (filters.responsavel.length && !filters.responsavel.includes(ini.responsavel.nome)) return false
    if (filters.risco.length && (ini.nivel_risco == null || !filters.risco.includes(ini.nivel_risco))) return false
    return true
  })

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const inInput = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "n" && !inInput && !modalOpen && !drawerInitId) {
        setModalMode("create")
        setModalInitId(null)
        setModalOpen(true)
      }
      if (e.key === "Escape") {
        if (drawerInitId) setDrawerInitId(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [modalOpen, drawerInitId])

  // Toast helpers
  function addToast(toast: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...toast, id }])
    if (!toast.isError) {
      const timeout = toast.timeout ?? 4000
      setTimeout(() => dismissToast(id), timeout)
    }
  }
  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function handleStatusChange(id: string, newStatus: Status) {
    const prev = initiatives.find(i => i.id === id)
    if (!prev) return
    const prevStatus = prev.status
    setInitiatives(list => list.map(i => i.id === id ? { ...i, status: newStatus, atualizado_em: TODAY } : i))
    addToast({
      message: `Status atualizado para ${STATUS_CONFIG[newStatus].label}.`,
      action: {
        label: "Desfazer",
        onClick: () => setInitiatives(list => list.map(i => i.id === id ? { ...i, status: prevStatus } : i)),
      },
      timeout: 5000,
    })
  }

  function handleProgressUpdate(id: string, progresso: number, obs: string) {
    setInitiatives(list => list.map(i => {
      if (i.id !== id) return i
      const entry: CheckIn = {
        data: TODAY,
        usuario: "Administrador",
        progresso_anterior: i.progresso,
        progresso_novo: progresso,
        observacao: obs,
      }
      const updated = { ...i, progresso, atualizado_em: TODAY, historico_check_ins: [entry, ...i.historico_check_ins] }
      if (updated.orcamento_estimado != null && updated.custo_realizado != null && updated.custo_realizado > updated.orcamento_estimado) {
        setTimeout(() => addToast({
          message: "O custo realizado ultrapassou o orçamento estimado.",
          action: { label: "Ver detalhes", onClick: () => setDrawerInitId(id) },
          isError: true,
        }), 100)
      }
      return updated
    }))
    addToast({ message: `Progresso atualizado para ${progresso}%.` })
  }

  function handleDelete(id: string) {
    const removed = initiatives.find(i => i.id === id)
    if (!removed) return
    setInitiatives(list => list.filter(i => i.id !== id))
    if (drawerInitId === id) setDrawerInitId(null)
    addToast({
      message: "Iniciativa excluída.",
      action: {
        label: "Desfazer",
        onClick: () => setInitiatives(list => {
          const idx = INITIAL_INITIATIVES.findIndex(i => i.id === id)
          const newList = [...list]
          newList.splice(idx, 0, removed)
          return newList
        }),
      },
      timeout: 5000,
    })
  }

  function handleDuplicate(id: string) {
    const source = initiatives.find(i => i.id === id)
    if (!source) return
    const duplicate: Initiative = {
      ...source,
      id: nextId(initiatives),
      nome: `${source.nome} (cópia)`,
      progresso: 0,
      status: "nao_iniciada",
      criado_em: TODAY,
      atualizado_em: TODAY,
      historico_check_ins: [],
    }
    setInitiatives(list => [...list, duplicate])
    addToast({ message: "Iniciativa duplicada." })
  }

  function handleSave(data: Partial<Initiative>) {
    if (modalMode === "create") {
      const newIni: Initiative = {
        id: nextId(initiatives),
        nome: data.nome!,
        descricao: data.descricao ?? "",
        status: data.status!,
        prioridade: data.prioridade!,
        responsavel: data.responsavel!,
        equipe: data.equipe!,
        data_inicio: data.data_inicio!,
        data_termino: data.data_termino!,
        progresso: 0,
        nivel_risco: data.nivel_risco ?? null,
        orcamento_estimado: data.orcamento_estimado ?? null,
        custo_realizado: data.custo_realizado ?? null,
        retorno_estimado: data.retorno_estimado ?? null,
        okrs_vinculados: data.okrs_vinculados ?? [],
        kpis_vinculados: data.kpis_vinculados ?? [],
        criado_em: TODAY,
        atualizado_em: TODAY,
        historico_check_ins: [],
      }
      setInitiatives(list => [...list, newIni])
      setModalOpen(false)
      addToast({
        message: "Iniciativa criada com sucesso.",
        action: { label: "Ver iniciativa", onClick: () => setDrawerInitId(newIni.id) },
      })
    } else if (modalMode === "edit" && modalInitId) {
      setInitiatives(list => list.map(i => i.id === modalInitId ? { ...i, ...data, atualizado_em: TODAY } : i))
      setModalOpen(false)
      addToast({ message: "Iniciativa atualizada." })
    }
  }

  function openEdit(id: string) {
    setModalMode("edit")
    setModalInitId(id)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <PageHeader title="Iniciativas" />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-background shrink-0 flex-wrap">
        {/* Nova iniciativa */}
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setModalMode("create"); setModalInitId(null); setModalOpen(true) }}>
          <Plus className="size-3.5" />Nova iniciativa
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* View toggle */}
        <div className="flex rounded-md border overflow-hidden">
          {([
            { value: "kanban", icon: KanbanSquare, label: "Kanban" },
            { value: "lista", icon: AlignLeft, label: "Lista" },
            { value: "gantt", icon: GanttChart, label: "Gantt" },
          ] as { value: View; icon: typeof KanbanSquare; label: string }[]).map(v => (
            <button
              key={v.value}
              onClick={() => setActiveView(v.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                activeView === v.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <v.icon className="size-3.5" />{v.label}
            </button>
          ))}
        </div>

        {/* Search — pushed to the right */}
        <div className="relative ml-auto min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            ref={searchRef}
            className="pl-8 h-8 text-sm"
            placeholder="Buscar… (Ctrl+K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}>
              <X className="size-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <FiltersSheet
          initiatives={initiatives}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
          total={filtered.length}
          activeCount={activeFiltersCount}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeView === "kanban" && (
          <div className="h-full overflow-auto p-4">
            <KanbanView
              initiatives={filtered}
              onCardClick={setDrawerInitId}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        )}
        {activeView === "lista" && (
          <div className="h-full overflow-auto">
            <ListView
              initiatives={filtered}
              onRowClick={setDrawerInitId}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
            />
          </div>
        )}
        {activeView === "gantt" && (
          <div className="h-full">
            <GanttView
              initiatives={filtered}
              onRowClick={setDrawerInitId}
              onEdit={openEdit}
            />
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {drawerInit && (
        <DetailDrawer
          initiative={drawerInit}
          onClose={() => setDrawerInitId(null)}
          onEdit={() => openEdit(drawerInit.id)}
          onDuplicate={() => handleDuplicate(drawerInit.id)}
          onDelete={() => handleDelete(drawerInit.id)}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {/* Create/edit modal */}
      <InitiativeModal
        open={modalOpen}
        mode={modalMode}
        initial={modalInitId ? initiatives.find(i => i.id === modalInitId) : undefined}
        initiatives={initiatives}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
