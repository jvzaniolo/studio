import { useEffect, useState } from "react"
import {
  Plus, Search, MoreHorizontal, ChevronRight, Edit2, Trash2, Link2,
  Target, TrendingUp, AlertTriangle, AlertOctagon, CheckCircle2, X, Filter,
  Building2, Users, GitBranch, Lock, History,
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
import { Checkbox } from "~/components/ui/checkbox"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "~/components/ui/sheet"
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

interface Acao {
  id: string
  texto: string
  concluida: boolean
}

interface KeyResult {
  id: string
  descricao: string
  tipo: KRTipo
  responsavel: { nome: string; iniciais: string }
  atual: number
  meta: number
  unidade: string
  concluido: boolean
  kpiId: string | null
  subResultados: SubKR[]
  historico: CheckIn[]
  acoes: Acao[]
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

function mkAcoes(...textos: string[]): Acao[] {
  return textos.map((texto, i) => ({ id: `a${i + 1}`, texto, concluida: false }))
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
      { id: "OBJ-000-kr1", descricao: "Elevar o índice de saúde organizacional (eNPS + engajamento) para 65 pontos", tipo: "manual", responsavel: { nome: "Ana Lima", iniciais: "AL" }, atual: 58, meta: 65, unidade: "pts", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Consolidar dados de eNPS e engajamento em um painel único", "Apresentar resultado trimestral ao comitê executivo") },
      { id: "OBJ-000-kr2", descricao: "Manter todas as áreas com OKRs ativos publicados", tipo: "manual", responsavel: { nome: "Ana Lima", iniciais: "AL" }, atual: 5, meta: 6, unidade: "áreas", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Cobrar publicação do ciclo pendente da área Cultura", "Revisar OKRs publicados em reunião mensal") },
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
        responsavel: { nome: "Ana Lima", iniciais: "AL" },
        atual: 48, meta: 60, unidade: "pts", concluido: false, kpiId: "kpi1", subResultados: [], historico: [],
        acoes: mkAcoes("Acompanhar resultado mensal da Pesquisa de Clima", "Compartilhar destaques com lideranças"),
      },
      {
        id: "OBJ-001-kr2", descricao: "Lançar canal de escuta contínua", tipo: "binario",
        responsavel: { nome: "Elena Souza", iniciais: "ES" },
        atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null,
        subResultados: [],
        historico: [
          { id: "ck1", data: "2026-06-15", usuario: "Ana Lima", valorAnterior: 0, valorNovo: 1, comentario: "Canal lançado com pesquisa mensal para todo o público interno." },
        ],
        acoes: mkAcoes("Divulgar canal no onboarding", "Definir SLA de resposta às mensagens"),
      },
      {
        id: "OBJ-001-kr3", descricao: "Realizar 4 rodadas de pulse survey", tipo: "manual",
        responsavel: { nome: "Ana Lima", iniciais: "AL" },
        atual: 3, meta: 4, unidade: "rodadas", concluido: false, kpiId: null,
        subResultados: [
          { id: "sub1", descricao: "Rodada — RH corporativo", atual: 1, meta: 1, unidade: "rodada" },
          { id: "sub2", descricao: "Rodada — canteiros de obra", atual: 2, meta: 3, unidade: "rodadas" },
        ],
        historico: [],
        acoes: mkAcoes("Agendar rodada dos canteiros restante", "Consolidar resultados da rodada RH corporativo"),
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
      { id: "OBJ-002-kr1", descricao: "Elevar liderança feminina de 28% para 40% (via KPI de Diversidade)", tipo: "auto", responsavel: { nome: "Carla Mendes", iniciais: "CM" }, atual: 32, meta: 40, unidade: "%", concluido: false, kpiId: "kpi2", subResultados: [], historico: [], acoes: mkAcoes("Mapear posições de liderança em aberto", "Acompanhar indicador mensalmente com D&I") },
      { id: "OBJ-002-kr2", descricao: "Formar 2 coortes do programa acelerador", tipo: "manual", responsavel: { nome: "Carla Mendes", iniciais: "CM" }, atual: 1, meta: 2, unidade: "coortes", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Selecionar participantes da 2ª coorte", "Definir mentoras para o programa") },
      { id: "OBJ-002-kr3", descricao: "Mapear pipeline de sucessão diverso", tipo: "manual", responsavel: { nome: "Bruno Carvalho", iniciais: "BC" }, atual: 60, meta: 100, unidade: "%", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Mapear sucessoras por posição crítica", "Validar pipeline com liderança de cada área") },
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
      { id: "OBJ-003-kr1", descricao: "Implementar check-ins trimestrais em todas as áreas", tipo: "binario", responsavel: { nome: "Bruno Carvalho", iniciais: "BC" }, atual: 100, meta: 100, unidade: "%", concluido: true, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Documentar processo de check-in trimestral", "Treinar gestores no novo formato") },
      { id: "OBJ-003-kr2", descricao: "Calibrar performance com comitê", tipo: "manual", responsavel: { nome: "Bruno Carvalho", iniciais: "BC" }, atual: 3, meta: 4, unidade: "ciclos", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Agendar calibração do próximo ciclo", "Revisar critérios de calibração com RH") },
      { id: "OBJ-003-kr3", descricao: "Reduzir turnover voluntário para 8,2%", tipo: "manual", responsavel: { nome: "Bruno Carvalho", iniciais: "BC" }, atual: 7, meta: 10, unidade: "pp reduzidos", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Entrevistar desligamentos voluntários recentes", "Implementar plano de retenção por área crítica") },
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
      { id: "OBJ-004-kr1", descricao: "Concluir diagnóstico e plano de adequação", tipo: "binario", responsavel: { nome: "Carla Mendes", iniciais: "CM" }, atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Arquivar relatório de diagnóstico", "Compartilhar plano de adequação com diretoria") },
      { id: "OBJ-004-kr2", descricao: "Publicar relatório GRI", tipo: "binario", responsavel: { nome: "Carla Mendes", iniciais: "CM" }, atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Publicar relatório no site institucional", "Enviar relatório para stakeholders-chave") },
      { id: "OBJ-004-kr3", descricao: "Obter aprovação em auditoria externa", tipo: "binario", responsavel: { nome: "Carla Mendes", iniciais: "CM" }, atual: 1, meta: 1, unidade: "un", concluido: true, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Arquivar certificado de auditoria", "Planejar manutenção anual da certificação") },
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
      { id: "OBJ-005-kr1", descricao: "Lançar 3 trilhas de aprendizagem digital", tipo: "manual", responsavel: { nome: "Diego Rocha", iniciais: "DR" }, atual: 1, meta: 3, unidade: "trilhas", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Finalizar conteúdo da 2ª trilha", "Selecionar fornecedor para a 3ª trilha") },
      { id: "OBJ-005-kr2", descricao: "Capacitar 200 colaboradores", tipo: "manual", responsavel: { nome: "Diego Rocha", iniciais: "DR" }, atual: 22, meta: 200, unidade: "pessoas", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Divulgar inscrições para o próximo lote", "Acompanhar taxa de conclusão dos cursos") },
      { id: "OBJ-005-kr3", descricao: "Firmar parceria com EdTechs", tipo: "manual", responsavel: { nome: "Diego Rocha", iniciais: "DR" }, atual: 1, meta: 2, unidade: "parcerias", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Negociar segunda parceria com EdTech", "Formalizar contrato da parceria atual") },
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
      { id: "OBJ-006-kr1", descricao: "Treinar lideranças em segurança psicológica", tipo: "manual", responsavel: { nome: "Elena Souza", iniciais: "ES" }, atual: 18, meta: 100, unidade: "%", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Agendar treinamento para lideranças restantes", "Avaliar eficácia do treinamento piloto") },
      { id: "OBJ-006-kr2", descricao: "Lançar pesquisa de clima trimestral", tipo: "binario", responsavel: { nome: "Elena Souza", iniciais: "ES" }, atual: 0, meta: 1, unidade: "un", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Definir escopo da pesquisa trimestral", "Selecionar ferramenta de aplicação") },
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
      { id: "OBJ-007-kr1", descricao: "Elevar eNPS das lideranças de 55 para 70 pontos", tipo: "manual", responsavel: { nome: "Ana Lima", iniciais: "AL" }, atual: 55, meta: 70, unidade: "pts", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Definir cadência de medição do eNPS de lideranças", "Cruzar dados com Pesquisa de Clima") },
      { id: "OBJ-007-kr2", descricao: "Publicar dashboard de sentimento por liderança", tipo: "binario", responsavel: { nome: "Ana Lima", iniciais: "AL" }, atual: 0, meta: 1, unidade: "un", concluido: false, kpiId: null, subResultados: [], historico: [], acoes: mkAcoes("Especificar métricas do dashboard", "Validar protótipo com RH") },
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

const CICLO_TIPO_MESES: Record<CicloTipo, number> = { trimestre: 3, semestre: 6, ano: 12 }

/** Data fim padrão = data início + duração do tipo - 1 dia (ex.: Trimestre a partir de 01/07 → 30/09). */
function computeDataFim(dataInicio: string, tipo: CicloTipo): string {
  const [y, m, d] = dataInicio.split("-").map(Number)
  const date = new Date(y, m - 1 + CICLO_TIPO_MESES[tipo], d)
  date.setDate(date.getDate() - 1)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
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

// ─── Actions checklist (dashed box, editável) ───────────────────────────────

function ActionsChecklist({
  acoes,
  dashed = true,
  onAdd,
  onToggle,
  onRemove,
}: {
  acoes: Acao[]
  dashed?: boolean
  onAdd: (texto: string) => void
  onToggle: (id: string, concluida: boolean) => void
  onRemove: (id: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [novoTexto, setNovoTexto] = useState("")

  function submit() {
    if (novoTexto.trim()) onAdd(novoTexto.trim())
    setNovoTexto("")
    setAdding(false)
  }

  return (
    <div className={cn("rounded-lg p-2.5", dashed ? "border-2 border-dashed border-border" : "border bg-muted/20")}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Ações</span>
        <button onClick={() => setAdding((v) => !v)} className="shrink-0 text-muted-foreground hover:text-foreground">
          <Edit2 className="size-3" />
        </button>
      </div>
      {acoes.length === 0 && !adding && (
        <p className="text-[11px] italic text-muted-foreground">Nenhuma ação cadastrada.</p>
      )}
      {acoes.length > 0 && (
        <ul className="space-y-1">
          {acoes.map((a) => (
            <li key={a.id} className="flex items-center gap-1.5">
              <Checkbox checked={a.concluida} onCheckedChange={(v) => onToggle(a.id, v === true)} />
              <span className={cn("min-w-0 flex-1 truncate text-xs", a.concluida && "text-muted-foreground line-through")}>{a.texto}</span>
              <button onClick={() => onRemove(a.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {adding && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <Input
            autoFocus
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nova ação..."
            className="h-6 flex-1 text-[11px]"
          />
          <Button size="sm" className="h-6 px-2 text-[11px]" onClick={submit}>OK</Button>
        </div>
      )}
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
  onAddAcao,
  onToggleAcao,
  onRemoveAcao,
  onEditKr,
  siblingKrs,
  onConvertToSub,
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
  onAddAcao: (texto: string) => void
  onToggleAcao: (acaoId: string, concluida: boolean) => void
  onRemoveAcao: (acaoId: string) => void
  onEditKr: (data: { descricao: string; responsavel: string; meta: number; unidade: string }) => void
  siblingKrs: { id: string; descricao: string }[]
  onConvertToSub: (targetKrId: string) => void
}) {
  const [panel, setPanel] = useState<null | "checkin" | "kpi" | "subform" | "binario" | "edit" | "tosub">(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [subListOpen, setSubListOpen] = useState(true)
  const [iniOpen, setIniOpen] = useState(false)
  const [acoesOpen, setAcoesOpen] = useState(false)
  const [valorForm, setValorForm] = useState("")
  const [comentario, setComentario] = useState("")
  const [kpiChoice, setKpiChoice] = useState<string>("")
  const [subDesc, setSubDesc] = useState("")
  const [subMeta, setSubMeta] = useState("")
  const [subUnidade, setSubUnidade] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editResp, setEditResp] = useState("")
  const [editMeta, setEditMeta] = useState("")
  const [editUnidade, setEditUnidade] = useState("")
  const [targetKrId, setTargetKrId] = useState("")

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

  function openEditKr() {
    setEditDesc(kr.descricao)
    setEditResp(kr.responsavel.nome)
    setEditMeta(String(kr.meta))
    setEditUnidade(kr.unidade)
    setPanel("edit")
  }

  function saveConvertToSub() {
    if (!targetKrId) return
    onConvertToSub(targetKrId)
    setTargetKrId("")
    setPanel(null)
  }

  function saveEditKr() {
    if (!editDesc.trim()) return
    const meta = parseFloat(editMeta.replace(",", "."))
    onEditKr({
      descricao: editDesc.trim(),
      responsavel: editResp,
      meta: Number.isFinite(meta) ? meta : kr.meta,
      unidade: editUnidade.trim() || kr.unidade,
    })
    setPanel(null)
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
            <button
              onClick={() => setAcoesOpen((v) => !v)}
              className="shrink-0 text-[10px] font-medium text-muted-foreground underline decoration-dotted hover:text-foreground"
            >
              {kr.acoes.length > 0 ? `${kr.acoes.length} ${kr.acoes.length > 1 ? "ações" : "ação"}` : "adicionar ações"}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={progress} className="w-32 gap-0" />
            <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
            <span className="ml-1 flex shrink-0 items-center gap-1">
              <AvatarInitials iniciais={kr.responsavel.iniciais} size={16} />
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{kr.responsavel.nome}</span>
            </span>
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
            <DropdownMenuItem onClick={openEditKr}>
              <Edit2 className="size-3.5 mr-2" />Editar KR
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
            {siblingKrs.length > 0 && (
              <DropdownMenuItem onClick={() => { setTargetKrId(""); setPanel("tosub") }}>
                <ChevronRight className="size-3.5 mr-2" />Transformar em sub-resultado de...
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

      {panel === "tosub" && (
        <div className="ml-4 mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">Transformar em sub-resultado</p>
          <Select
            items={siblingKrs.map((s) => ({ label: s.descricao, value: s.id }))}
            value={targetKrId}
            onValueChange={setTargetKrId}
          >
            <SelectTrigger className="h-8 w-full text-xs"><SelectValue placeholder="Selecione o KR de destino" /></SelectTrigger>
            <SelectContent>
              {siblingKrs.map((s) => <SelectItem key={s.id} value={s.id}>{s.descricao}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Este KR passará a ser um sub-resultado do KR selecionado.
            {(kr.subResultados.length > 0 || kr.historico.length > 0) && " Sub-resultados e histórico deste KR serão perdidos."}
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" disabled={!targetKrId} onClick={saveConvertToSub}>Transformar</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPanel(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {panel === "edit" && (
        <div className="ml-4 mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">Editar resultado-chave</p>
          <Input autoFocus value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descrição do resultado-chave" className="h-8 text-xs" />
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Responsável</Label>
            <Select value={editResp} onValueChange={setEditResp}>
              <SelectTrigger className="h-8 w-full text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {USERS.map((u) => <SelectItem key={u.nome} value={u.nome}>{u.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {kr.tipo === "manual" && (
            <div className="flex gap-2">
              <Input value={editMeta} onChange={(e) => setEditMeta(e.target.value)} placeholder="Meta" className="h-8 w-24 text-xs" />
              <Input value={editUnidade} onChange={(e) => setEditUnidade(e.target.value)} placeholder="Unidade" className="h-8 w-24 text-xs" />
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={saveEditKr}>Salvar</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPanel(null)}>Cancelar</Button>
          </div>
        </div>
      )}

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

      {acoesOpen && (
        <div className="ml-4 mt-2 max-w-md">
          <ActionsChecklist
            acoes={kr.acoes}
            onAdd={onAddAcao}
            onToggle={onToggleAcao}
            onRemove={onRemoveAcao}
          />
        </div>
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
  const [focused, setFocused] = useState(false)
  const linkedIds = new Set(linked.map((i) => i.id))
  const matches = registry
    .filter((i) => !linkedIds.has(i.id) && i.nome.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8)

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
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Vincular iniciativa existente..."
          className="h-7 pl-7 text-xs"
        />
        {focused && matches.length > 0 && (
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
  selected,
  onToggleSelect,
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
  onAddAcao,
  onToggleAcao,
  onRemoveAcao,
  onEditKr,
  onConvertToSub,
}: {
  objetivo: Objetivo
  ciclo: Ciclo | undefined
  ciclos: Ciclo[]
  iniciativaRegistry: RegistryItem[]
  linksByKr: (krId: string) => RegistryItem[]
  selected: boolean
  onToggleSelect: () => void
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
  onAddAcao: (krId: string, texto: string) => void
  onToggleAcao: (krId: string, acaoId: string, concluida: boolean) => void
  onRemoveAcao: (krId: string, acaoId: string) => void
  onEditKr: (krId: string, data: { descricao: string; responsavel: string; meta: number; unidade: string }) => void
  onConvertToSub: (krId: string, targetKrId: string) => void
}) {
  const [open, setOpen] = useState(true)
  const progress = objProgress(objetivo)
  const status = objStatus(progress)
  const atrasado = isPrazoVencido(objetivo, progress, ciclos)
  const area = objetivo.time ? AREA_BY_TEAM[objetivo.time] : null

  return (
    <Card className={cn("p-0 overflow-hidden", atrasado && "border-l-[3px] border-l-red-500", selected && "ring-2 ring-primary/60")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="shrink-0" />
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
                onAddAcao={(texto) => onAddAcao(kr.id, texto)}
                onToggleAcao={(acaoId, concluida) => onToggleAcao(kr.id, acaoId, concluida)}
                onRemoveAcao={(acaoId) => onRemoveAcao(kr.id, acaoId)}
                onEditKr={(data) => onEditKr(kr.id, data)}
                siblingKrs={objetivo.keyResults.filter((k) => k.id !== kr.id).map((k) => ({ id: k.id, descricao: k.descricao }))}
                onConvertToSub={(targetKrId) => onConvertToSub(kr.id, targetKrId)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// ─── Objective tree diagram (Objetivo → Key Results → Ações) ────────────────

const KR_TREE_COLORS = [
  { border: "border-blue-300", bg: "bg-blue-50", dot: "bg-blue-500" },
  { border: "border-green-300", bg: "bg-green-50", dot: "bg-green-500" },
  { border: "border-orange-300", bg: "bg-orange-50", dot: "bg-orange-500" },
  { border: "border-purple-300", bg: "bg-purple-50", dot: "bg-purple-500" },
]

function TreeConnector({ n }: { n: number }) {
  return (
    <>
      <div className="h-6 w-px bg-border" />
      {n > 1 && (
        <div className="relative w-full">
          <div className="absolute top-0 h-px bg-border" style={{ left: `${50 / n}%`, right: `${50 / n}%` }} />
        </div>
      )}
    </>
  )
}

type OrgTreeSelection =
  | { kind: "org" }
  | { kind: "lane"; laneKey: string }
  | { kind: "objetivo"; objId: string }
  | { kind: "kr"; objId: string; krId: string }

function OrgTreeView({
  objetivos,
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
  onAddAcao,
  onToggleAcao,
  onRemoveAcao,
  onEditKr,
  onConvertToSub,
}: {
  objetivos: Objetivo[]
  iniciativaRegistry: RegistryItem[]
  linksByKr: (krId: string) => RegistryItem[]
  onEdit: (objId: string) => void
  onDelete: (objId: string) => void
  onUpdateKr: (objId: string, krId: string, atual: number, comentario: string) => void
  onToggleBinario: (objId: string, krId: string, concluido: boolean, comentario: string) => void
  onLinkKpi: (objId: string, krId: string, kpiId: string) => void
  onUnlinkKpi: (objId: string, krId: string) => void
  onAddSub: (objId: string, krId: string, descricao: string, meta: number, unidade: string) => void
  onUpdateSub: (objId: string, krId: string, subId: string, atual: number) => void
  onRemoveSub: (objId: string, krId: string, subId: string) => void
  onLinkIniciativa: (krId: string, iniciativaId: string) => void
  onUnlinkIniciativa: (krId: string, iniciativaId: string) => void
  onAddAcao: (objId: string, krId: string, texto: string) => void
  onToggleAcao: (objId: string, krId: string, acaoId: string, concluida: boolean) => void
  onRemoveAcao: (objId: string, krId: string, acaoId: string) => void
  onEditKr: (objId: string, krId: string, data: { descricao: string; responsavel: string; meta: number; unidade: string }) => void
  onConvertToSub: (objId: string, krId: string, targetKrId: string) => void
}) {
  const [selected, setSelected] = useState<OrgTreeSelection | null>(null)
  const overall = weightedProgress(objetivos)
  const empresaObjs = objetivos.filter((o) => o.nivel === "empresa")
  const timeObjs = objetivos.filter((o) => o.nivel === "time")
  const times = Array.from(new Set(timeObjs.map((o) => o.time as string)))

  const lanes = [
    ...(empresaObjs.length > 0 ? [{ key: "empresa", label: "Objetivos da empresa", objetivos: empresaObjs }] : []),
    ...times.map((time) => ({ key: time, label: time, objetivos: timeObjs.filter((o) => o.time === time) })),
  ]

  if (objetivos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border py-16 text-muted-foreground">
        <Building2 className="size-8 opacity-40" />
        <p className="text-sm">Nenhum objetivo neste ciclo para montar a árvore.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto p-6">
      <div className="mx-auto flex flex-col items-center" style={{ minWidth: `${Math.max(lanes.length, 1) * 280}px` }}>
        {/* Linha 1 — Organização */}
        <button
          onClick={() => setSelected({ kind: "org" })}
          className="flex w-64 flex-col gap-1.5 rounded-xl border-2 border-primary/50 bg-primary/10 px-4 py-3 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex items-start gap-1.5">
            <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 break-words text-sm font-bold text-foreground">Humanizadas</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={overall} className="h-1.5 flex-1 gap-0" />
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{overall}%</span>
          </div>
        </button>

        <TreeConnector n={lanes.length} />

        {/* Linha 2 — Times */}
        <div className="flex w-full justify-center gap-8">
          {lanes.map((lane) => {
            const laneProgress = weightedProgress(lane.objetivos)
            return (
              <div key={lane.key} className="flex flex-col items-center">
                <div className="h-6 w-px bg-border" />
                <button
                  onClick={() => setSelected({ kind: "lane", laneKey: lane.key })}
                  className="flex w-60 flex-col gap-1.5 rounded-xl border-2 border-border bg-muted/40 px-3 py-2.5 text-left transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-1.5">
                    <Users className="mt-0.5 size-3.5 shrink-0 text-foreground" />
                    <span className="min-w-0 flex-1 break-words text-xs font-semibold text-foreground">{lane.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={laneProgress} className="h-1.5 flex-1 gap-0" />
                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{laneProgress}%</span>
                  </div>
                </button>

                <TreeConnector n={lane.objetivos.length} />

                {/* Linha 3 — Objetivos (OKRs) */}
                <div className="flex gap-4">
                  {lane.objetivos.map((obj) => {
                    const objProg = objProgress(obj)
                    const objSt = objStatus(objProg)
                    return (
                      <div key={obj.id} className="flex w-56 flex-col items-center">
                        <div className="h-6 w-px bg-border" />
                        <button
                          onClick={() => setSelected({ kind: "objetivo", objId: obj.id })}
                          className="flex w-full flex-col gap-1.5 rounded-xl border-2 border-primary/30 bg-background px-3 py-2.5 text-left transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start gap-1.5">
                            <Target className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-xs font-medium text-foreground">{obj.nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={objProg} className="h-1.5 flex-1 gap-0" />
                            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{objProg}%</span>
                          </div>
                          <StatusBadge status={objSt} />
                        </button>

                        <div className="h-6 w-px bg-border" />

                        {/* Linha 4 — Key Results */}
                        <div className="flex w-full flex-col gap-1.5">
                          {obj.keyResults.map((kr, i) => {
                            const palette = KR_TREE_COLORS[i % KR_TREE_COLORS.length]
                            const progress = krProgress(kr)
                            return (
                              <button
                                key={kr.id}
                                onClick={() => setSelected({ kind: "kr", objId: obj.id, krId: kr.id })}
                                className={cn("flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-shadow hover:shadow-md", palette.border, palette.bg)}
                              >
                                <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", palette.dot)} />
                                <span className="min-w-0 flex-1 break-words text-[10px] font-medium text-foreground">{kr.descricao}</span>
                                <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground">{progress}%</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected?.kind === "org" && <OrgDetailContent />}
          {selected?.kind === "lane" && (() => {
            const lane = lanes.find((l) => l.key === selected.laneKey)
            return lane ? <LaneDetailContent lane={lane} onSelectObjetivo={(objId) => setSelected({ kind: "objetivo", objId })} /> : null
          })()}
          {selected?.kind === "objetivo" && (() => {
            const obj = objetivos.find((o) => o.id === selected.objId)
            return obj ? (
              <ObjetivoDetailContent
                obj={obj}
                iniciativaRegistry={iniciativaRegistry}
                linksByKr={linksByKr}
                onEditRequest={() => { onEdit(obj.id); setSelected(null) }}
                onDeleteRequest={() => { onDelete(obj.id); setSelected(null) }}
                onUpdateKr={onUpdateKr}
                onToggleBinario={onToggleBinario}
                onLinkKpi={onLinkKpi}
                onUnlinkKpi={onUnlinkKpi}
                onAddSub={onAddSub}
                onUpdateSub={onUpdateSub}
                onRemoveSub={onRemoveSub}
                onLinkIniciativa={onLinkIniciativa}
                onUnlinkIniciativa={onUnlinkIniciativa}
                onAddAcao={onAddAcao}
                onToggleAcao={onToggleAcao}
                onRemoveAcao={onRemoveAcao}
                onEditKr={onEditKr}
                onConvertToSub={onConvertToSub}
              />
            ) : null
          })()}
          {selected?.kind === "kr" && (() => {
            const obj = objetivos.find((o) => o.id === selected.objId)
            const kr = obj?.keyResults.find((k) => k.id === selected.krId)
            return obj && kr ? (
              <div className="min-w-0 space-y-4">
                <DialogHeader>
                  <DialogTitle className="break-words">{kr.descricao}</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground">Objetivo: {obj.nome}</p>
                <div className="-mx-6 divide-y divide-border/60 border-y">
                  <KeyResultRow
                    kr={kr}
                    linkedIniciativas={linksByKr(kr.id)}
                    iniciativaRegistry={iniciativaRegistry}
                    onCheckIn={(valor, comentario) => onUpdateKr(obj.id, kr.id, valor, comentario)}
                    onToggleBinario={(concluido, comentario) => onToggleBinario(obj.id, kr.id, concluido, comentario)}
                    onLinkKpi={(kpiId) => onLinkKpi(obj.id, kr.id, kpiId)}
                    onUnlinkKpi={() => onUnlinkKpi(obj.id, kr.id)}
                    onAddSub={(descricao, meta, unidade) => onAddSub(obj.id, kr.id, descricao, meta, unidade)}
                    onUpdateSub={(subId, atual) => onUpdateSub(obj.id, kr.id, subId, atual)}
                    onRemoveSub={(subId) => onRemoveSub(obj.id, kr.id, subId)}
                    onLinkIniciativa={(iniciativaId) => onLinkIniciativa(kr.id, iniciativaId)}
                    onUnlinkIniciativa={(iniciativaId) => onUnlinkIniciativa(kr.id, iniciativaId)}
                    onAddAcao={(texto) => onAddAcao(obj.id, kr.id, texto)}
                    onToggleAcao={(acaoId, concluida) => onToggleAcao(obj.id, kr.id, acaoId, concluida)}
                    onRemoveAcao={(acaoId) => onRemoveAcao(obj.id, kr.id, acaoId)}
                    onEditKr={(data) => onEditKr(obj.id, kr.id, data)}
                    siblingKrs={obj.keyResults.filter((k) => k.id !== kr.id).map((k) => ({ id: k.id, descricao: k.descricao }))}
                    onConvertToSub={(targetKrId) => onConvertToSub(obj.id, kr.id, targetKrId)}
                  />
                </div>
              </div>
            ) : null
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrgDetailContent() {
  return (
    <div className="min-w-0 space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Building2 className="size-4 text-primary" />Humanizadas</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">Visão geral da organização no ciclo selecionado.</p>
    </div>
  )
}

function LaneDetailContent({
  lane, onSelectObjetivo,
}: {
  lane: { key: string; label: string; objetivos: Objetivo[] }
  onSelectObjetivo: (objId: string) => void
}) {
  const laneProgress = weightedProgress(lane.objetivos)
  return (
    <div className="min-w-0 space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Users className="size-4" />{lane.label}</DialogTitle>
      </DialogHeader>
      <div className="flex items-center gap-2">
        <Progress value={laneProgress} className="h-2 flex-1 gap-0" />
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">{laneProgress}%</span>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Objetivos ({lane.objetivos.length})</p>
        {lane.objetivos.map((o) => {
          const p = objProgress(o)
          return (
            <button
              key={o.id}
              onClick={() => onSelectObjetivo(o.id)}
              className="block w-full rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{o.nome}</span>
                <StatusBadge status={objStatus(p)} />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress value={p} className="h-1.5 flex-1 gap-0" />
                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{p}%</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ObjetivoDetailContent({
  obj,
  iniciativaRegistry,
  linksByKr,
  onEditRequest,
  onDeleteRequest,
  onUpdateKr,
  onToggleBinario,
  onLinkKpi,
  onUnlinkKpi,
  onAddSub,
  onUpdateSub,
  onRemoveSub,
  onLinkIniciativa,
  onUnlinkIniciativa,
  onAddAcao,
  onToggleAcao,
  onRemoveAcao,
  onEditKr,
  onConvertToSub,
}: {
  obj: Objetivo
  iniciativaRegistry: RegistryItem[]
  linksByKr: (krId: string) => RegistryItem[]
  onEditRequest: () => void
  onDeleteRequest: () => void
  onUpdateKr: (objId: string, krId: string, atual: number, comentario: string) => void
  onToggleBinario: (objId: string, krId: string, concluido: boolean, comentario: string) => void
  onLinkKpi: (objId: string, krId: string, kpiId: string) => void
  onUnlinkKpi: (objId: string, krId: string) => void
  onAddSub: (objId: string, krId: string, descricao: string, meta: number, unidade: string) => void
  onUpdateSub: (objId: string, krId: string, subId: string, atual: number) => void
  onRemoveSub: (objId: string, krId: string, subId: string) => void
  onLinkIniciativa: (krId: string, iniciativaId: string) => void
  onUnlinkIniciativa: (krId: string, iniciativaId: string) => void
  onAddAcao: (objId: string, krId: string, texto: string) => void
  onToggleAcao: (objId: string, krId: string, acaoId: string, concluida: boolean) => void
  onRemoveAcao: (objId: string, krId: string, acaoId: string) => void
  onEditKr: (objId: string, krId: string, data: { descricao: string; responsavel: string; meta: number; unidade: string }) => void
  onConvertToSub: (objId: string, krId: string, targetKrId: string) => void
}) {
  const progress = objProgress(obj)
  const status = objStatus(progress)
  const area = obj.time ? AREA_BY_TEAM[obj.time] : null
  return (
    <div className="min-w-0 space-y-4">
      <DialogHeader className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-2 pr-6">
          <DialogTitle className="flex min-w-0 flex-1 items-start gap-2 break-words"><Target className="mt-0.5 size-4 shrink-0 text-primary" /><span className="min-w-0 break-words">{obj.nome}</span></DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted">
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditRequest}><Edit2 className="size-3.5 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeleteRequest} className="text-red-600"><Trash2 className="size-3.5 mr-2" />Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{obj.descricao}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={status} />
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">Peso ×{obj.peso}</span>
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", perspectivaStyle(obj.perspectiva).bg, perspectivaStyle(obj.perspectiva).color)}>
          {obj.perspectiva}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {obj.nivel === "empresa" ? "Objetivo da empresa" : `${obj.time} · ${area}`}
      </p>
      <div className="flex items-center gap-2">
        <Progress value={progress} className="h-2 flex-1 gap-0" />
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">{progress}%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <AvatarInitials iniciais={obj.responsavel.iniciais} />
        <span className="text-sm text-muted-foreground">{obj.responsavel.nome}</span>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key Results ({obj.keyResults.length})</p>
        <div className="-mx-6 divide-y divide-border/60 border-y">
          {obj.keyResults.map((kr) => (
            <KeyResultRow
              key={kr.id}
              kr={kr}
              linkedIniciativas={linksByKr(kr.id)}
              iniciativaRegistry={iniciativaRegistry}
              onCheckIn={(valor, comentario) => onUpdateKr(obj.id, kr.id, valor, comentario)}
              onToggleBinario={(concluido, comentario) => onToggleBinario(obj.id, kr.id, concluido, comentario)}
              onLinkKpi={(kpiId) => onLinkKpi(obj.id, kr.id, kpiId)}
              onUnlinkKpi={() => onUnlinkKpi(obj.id, kr.id)}
              onAddSub={(descricao, meta, unidade) => onAddSub(obj.id, kr.id, descricao, meta, unidade)}
              onUpdateSub={(subId, atual) => onUpdateSub(obj.id, kr.id, subId, atual)}
              onRemoveSub={(subId) => onRemoveSub(obj.id, kr.id, subId)}
              onLinkIniciativa={(iniciativaId) => onLinkIniciativa(kr.id, iniciativaId)}
              onUnlinkIniciativa={(iniciativaId) => onUnlinkIniciativa(kr.id, iniciativaId)}
              onAddAcao={(texto) => onAddAcao(obj.id, kr.id, texto)}
              onToggleAcao={(acaoId, concluida) => onToggleAcao(obj.id, kr.id, acaoId, concluida)}
              onRemoveAcao={(acaoId) => onRemoveAcao(obj.id, kr.id, acaoId)}
              onEditKr={(data) => onEditKr(obj.id, kr.id, data)}
              siblingKrs={obj.keyResults.filter((k) => k.id !== kr.id).map((k) => ({ id: k.id, descricao: k.descricao }))}
              onConvertToSub={(targetKrId) => onConvertToSub(obj.id, kr.id, targetKrId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

function FiltersSheet({
  statusFiltro,
  onChangeStatus,
  timeFiltro,
  onChangeTime,
  responsavelFiltro,
  onChangeResponsavel,
  searchQuery,
  onChangeSearch,
  total,
  activeCount,
  onClear,
}: {
  statusFiltro: "todos" | Status
  onChangeStatus: (s: "todos" | Status) => void
  timeFiltro: string
  onChangeTime: (t: string) => void
  responsavelFiltro: string
  onChangeResponsavel: (r: string) => void
  searchQuery: string
  onChangeSearch: (v: string) => void
  total: number
  activeCount: number
  onClear: () => void
}) {
  const statusOptions: { value: "todos" | Status; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "no_prazo", label: "No prazo" },
    { value: "atencao", label: "Atenção" },
    { value: "risco", label: "Em risco" },
    { value: "concluido", label: "Concluído" },
  ]

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
          <span className="ml-0.5 rounded-full bg-white text-primary text-[10px] font-bold px-1.5 py-0 leading-4">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Refine os objetivos por status ou busque por nome.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buscar</p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Buscar objetivo..."
                value={searchQuery}
                onChange={(e) => onChangeSearch(e.target.value)}
              />
              {searchQuery && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => onChangeSearch("")}>
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onChangeStatus(s.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    statusFiltro === s.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onChangeTime("todos")}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                  timeFiltro === "todos" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                )}
              >
                Todos
              </button>
              {TEAMS.map((t) => (
                <button
                  key={t}
                  onClick={() => onChangeTime(t)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    timeFiltro === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onChangeResponsavel("todos")}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                  responsavelFiltro === "todos" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                )}
              >
                Todos
              </button>
              {USERS.map((u) => (
                <button
                  key={u.nome}
                  onClick={() => onChangeResponsavel(u.nome)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    responsavelFiltro === u.nome ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {u.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {total} objetivo{total !== 1 ? "s" : ""} {total !== 1 ? "visíveis" : "visível"}
          </span>
          <button onClick={onClear} className="text-xs text-primary hover:underline">
            Limpar filtros
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Gestão de ciclos ────────────────────────────────────────────────────────

const EMPTY_CICLO_FORM = { nome: "", tipo: "trimestre" as CicloTipo, dataInicio: "", dataFimPersonalizada: false, dataFimCustom: "" }

function NovoCicloDialog({
  open, onClose, onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: { nome: string; tipo: CicloTipo; dataInicio: string; dataFim: string }) => void
}) {
  const [form, setForm] = useState(EMPTY_CICLO_FORM)
  const autoDataFim = form.dataInicio ? computeDataFim(form.dataInicio, form.tipo) : ""
  const dataFim = form.dataFimPersonalizada ? form.dataFimCustom : autoDataFim
  const isValid =
    form.nome.trim().length > 0 && !!form.dataInicio && !!dataFim &&
    (!form.dataFimPersonalizada || (dataFim >= form.dataInicio && dataFim <= autoDataFim))

  function submit() {
    if (!isValid) return
    onCreate({ nome: form.nome, tipo: form.tipo, dataInicio: form.dataInicio, dataFim })
    setForm(EMPTY_CICLO_FORM)
  }

  function toggleDataFimPersonalizada(checked: boolean) {
    setForm((f) => ({ ...f, dataFimPersonalizada: checked, dataFimCustom: checked ? (autoDataFim || f.dataFimCustom) : f.dataFimCustom }))
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo ciclo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
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

          <div className="space-y-1">
            <Label className="text-xs">Data início</Label>
            <Input type="date" value={form.dataInicio} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <Label className={cn("text-xs", !form.dataFimPersonalizada && "text-muted-foreground")}>Data fim</Label>
            <Input
              type="date"
              value={dataFim}
              disabled={!form.dataFimPersonalizada}
              min={form.dataInicio || undefined}
              max={autoDataFim || undefined}
              onChange={(e) => setForm((f) => ({ ...f, dataFimCustom: e.target.value }))}
              className={cn(!form.dataFimPersonalizada && "text-muted-foreground bg-muted/40")}
            />
            <label className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={form.dataFimPersonalizada} onCheckedChange={(v) => toggleDataFimPersonalizada(v === true)} />
              Data fim personalizada
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!isValid} onClick={submit}>
            <Plus className="size-3.5" />Criar ciclo (rascunho)
          </Button>
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
  responsavel: string
  atual: string
  meta: string
  unidade: string
  concluido: boolean
  kpiId: string
}

const EMPTY_KR_FORM: KrFormRow = { descricao: "", tipo: "manual", responsavel: USERS[0].nome, meta: "", atual: "", unidade: "", concluido: false, kpiId: "" }

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
            responsavel: kr.responsavel.nome,
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
    set("keyResults", [...form.keyResults, { ...EMPTY_KR_FORM, responsavel: form.responsavel }])
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
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground shrink-0">Responsável</Label>
                      <Select value={kr.responsavel} onValueChange={(v) => updateKr(idx, "responsavel", v)}>
                        <SelectTrigger className="h-8 w-full text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {USERS.map((u) => <SelectItem key={u.nome} value={u.nome}>{u.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
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

// ─── Duplicar objetivos para outro ciclo ────────────────────────────────────

function DuplicateDialog({
  open, count, ciclos, currentCicloId, onClose, onConfirm,
}: {
  open: boolean
  count: number
  ciclos: Ciclo[]
  currentCicloId: string
  onClose: () => void
  onConfirm: (destCicloId: string, includeKrs: boolean) => void
}) {
  const destinos = [...ciclos].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
  const [destCicloId, setDestCicloId] = useState("")
  const [includeKrs, setIncludeKrs] = useState(true)

  const [lastOpen, setLastOpen] = useState(false)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setDestCicloId(destinos.find((c) => c.id !== currentCicloId)?.id ?? "")
      setIncludeKrs(true)
    }
  }

  const cicloItems = destinos.map((c) => ({
    label: `${c.nome}${c.status === "rascunho" ? " · rascunho" : c.status === "encerrado" ? " · encerrado" : ""}`,
    value: c.id,
  }))

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar {count} objetivo{count > 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Ciclo de destino</Label>
            <Select items={cicloItems} value={destCicloId} onValueChange={setDestCicloId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecione um ciclo" /></SelectTrigger>
              <SelectContent>
                {destinos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome} {c.status === "rascunho" ? "· rascunho" : c.status === "encerrado" ? "· encerrado" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={includeKrs} onCheckedChange={(v) => setIncludeKrs(v === true)} />
            Duplicar com os Key Results
          </label>
          <p className="text-xs text-muted-foreground">
            {includeKrs
              ? "Os Key Results serão copiados sem histórico e sem check-ins."
              : "O objetivo será duplicado sem nenhum Key Result."}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!destCicloId} onClick={() => onConfirm(destCicloId, includeKrs)}>
            Duplicar
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
  const [timeFiltro, setTimeFiltro] = useState<string>("todos")
  const [responsavelFiltro, setResponsavelFiltro] = useState<string>("todos")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [modalObjId, setModalObjId] = useState<string | null>(null)
  const [novoCicloOpen, setNovoCicloOpen] = useState(false)
  const [selectedObjIds, setSelectedObjIds] = useState<Set<string>>(new Set())
  const [duplicateOpen, setDuplicateOpen] = useState(false)

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
    if (timeFiltro !== "todos" && obj.time !== timeFiltro) return false
    if (responsavelFiltro !== "todos" && obj.responsavel.nome !== responsavelFiltro) return false
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
    setSelectedObjIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function toggleSelectObj(id: string) {
    setSelectedObjIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleDuplicate(destCicloId: string, includeKrs: boolean) {
    setObjetivos((list) => {
      const toDuplicate = list.filter((o) => selectedObjIds.has(o.id))
      const copies = toDuplicate.map((o) => ({
        ...o,
        id: nextObjId(list),
        cicloId: destCicloId,
        keyResults: includeKrs
          ? o.keyResults.map((kr) => ({
              ...kr,
              id: nextId("kr"),
              historico: [],
              subResultados: kr.subResultados.map((s) => ({ ...s, id: nextId("sub") })),
              acoes: kr.acoes.map((a) => ({ ...a, id: nextId("acao") })),
            }))
          : [],
      }))
      return [...list, ...copies]
    })
    setSelectedObjIds(new Set())
    setDuplicateOpen(false)
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

  function handleAddAcao(objId: string, krId: string, texto: string) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      acoes: [...kr.acoes, { id: nextId("acao"), texto, concluida: false }],
    }))
  }

  function handleToggleAcao(objId: string, krId: string, acaoId: string, concluida: boolean) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      acoes: kr.acoes.map((a) => (a.id === acaoId ? { ...a, concluida } : a)),
    }))
  }

  function handleRemoveAcao(objId: string, krId: string, acaoId: string) {
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      acoes: kr.acoes.filter((a) => a.id !== acaoId),
    }))
  }

  function handleEditKr(objId: string, krId: string, data: { descricao: string; responsavel: string; meta: number; unidade: string }) {
    const responsavel = USERS.find((u) => u.nome === data.responsavel)
    updateKrIn(objId, krId, (kr) => ({
      ...kr,
      descricao: data.descricao,
      responsavel: responsavel ?? kr.responsavel,
      meta: kr.tipo === "manual" ? data.meta : kr.meta,
      unidade: kr.tipo === "manual" ? data.unidade : kr.unidade,
    }))
  }

  function handleConvertToSub(objId: string, krId: string, targetKrId: string) {
    setObjetivos((list) => list.map((o) => {
      if (o.id !== objId) return o
      const kr = o.keyResults.find((k) => k.id === krId)
      if (!kr || krId === targetKrId) return o
      const resolved = resolveKr(kr)
      const novoSub: SubKR = { id: nextId("sub"), descricao: kr.descricao, atual: resolved.atual, meta: resolved.meta, unidade: resolved.unidade }
      return {
        ...o,
        keyResults: o.keyResults
          .filter((k) => k.id !== krId)
          .map((k) => (k.id === targetKrId ? { ...k, subResultados: [...k.subResultados, novoSub] } : k)),
      }
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
        const krResponsavel = USERS.find((u) => u.nome === kr.responsavel) ?? responsavel
        return {
          id: kr.id ?? nextId("kr"),
          descricao: kr.descricao,
          tipo: kr.tipo,
          responsavel: krResponsavel,
          meta: parseFloat(kr.meta.replace(",", ".")) || 0,
          atual: parseFloat(kr.atual.replace(",", ".")) || 0,
          unidade: kr.unidade || "un",
          concluido: kr.concluido,
          kpiId: kr.tipo === "auto" ? (kr.kpiId || null) : null,
          subResultados: existing?.subResultados ?? [],
          historico: existing?.historico ?? [],
          acoes: existing?.acoes ?? [],
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

  function handleCreateCiclo(data: { nome: string; tipo: CicloTipo; dataInicio: string; dataFim: string }) {
    setCiclos((list) => [...list, { id: nextId("CIC"), nome: data.nome, tipo: data.tipo, dataInicio: data.dataInicio, dataFim: data.dataFim, status: "rascunho" }])
  }

  function handleActivateCiclo(id: string) {
    setCiclos((list) => list.map((c) => {
      if (c.id === id) return { ...c, status: "ativo" }
      if (c.status === "ativo") return { ...c, status: "encerrado" }
      return c
    }))
  }

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <PageHeader title="OKRs" />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-background shrink-0 flex-wrap">
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={openCreate}>
          <Plus className="size-3.5" />Novo objetivo
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex rounded-md border overflow-hidden">
          {([
            { value: "lista", label: "Lista" },
            { value: "arvore", label: "Árvore geral", icon: GitBranch },
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

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setNovoCicloOpen(true)}>
            <Plus className="size-3.5" />Novo ciclo
          </Button>

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

          {view === "lista" && (
            <FiltersSheet
              statusFiltro={statusFiltro}
              onChangeStatus={setStatusFiltro}
              timeFiltro={timeFiltro}
              onChangeTime={setTimeFiltro}
              responsavelFiltro={responsavelFiltro}
              onChangeResponsavel={setResponsavelFiltro}
              searchQuery={searchQuery}
              onChangeSearch={setSearchQuery}
              total={filtered.length}
              activeCount={
                (statusFiltro !== "todos" ? 1 : 0) +
                (timeFiltro !== "todos" ? 1 : 0) +
                (responsavelFiltro !== "todos" ? 1 : 0) +
                (searchQuery.trim() ? 1 : 0)
              }
              onClear={() => { setSearchQuery(""); setStatusFiltro("todos"); setTimeFiltro("todos"); setResponsavelFiltro("todos") }}
            />
          )}
        </div>
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

        {view === "lista" && (
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
        )}

        {view === "lista" && selectedObjIds.size > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
            <span className="text-xs font-medium text-foreground">
              {selectedObjIds.size} selecionado{selectedObjIds.size > 1 ? "s" : ""}
            </span>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setDuplicateOpen(true)}>
              <Plus className="size-3.5" />Duplicar para outro ciclo
            </Button>
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedObjIds(new Set())}>
              Limpar seleção
            </button>
          </div>
        )}

        {view === "arvore" ? (
          <OrgTreeView
            objetivos={objetivosDoCiclo}
            iniciativaRegistry={iniciativaRegistry}
            linksByKr={(krId) => getIniciativasForKr(shared, krId)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onUpdateKr={handleCheckIn}
            onToggleBinario={handleToggleBinario}
            onLinkKpi={handleLinkKpi}
            onUnlinkKpi={handleUnlinkKpi}
            onAddSub={handleAddSub}
            onUpdateSub={handleUpdateSub}
            onRemoveSub={handleRemoveSub}
            onLinkIniciativa={linkKrIniciativa}
            onUnlinkIniciativa={unlinkKrIniciativa}
            onAddAcao={handleAddAcao}
            onToggleAcao={handleToggleAcao}
            onRemoveAcao={handleRemoveAcao}
            onEditKr={handleEditKr}
            onConvertToSub={handleConvertToSub}
          />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Target className="size-8 opacity-40" />
            <p className="text-sm">Nenhum objetivo encontrado para os filtros aplicados.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFiltro("todos"); setTimeFiltro("todos"); setResponsavelFiltro("todos") }}>
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
                selected={selectedObjIds.has(obj.id)}
                onToggleSelect={() => toggleSelectObj(obj.id)}
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
                onAddAcao={(krId, texto) => handleAddAcao(obj.id, krId, texto)}
                onToggleAcao={(krId, acaoId, concluida) => handleToggleAcao(obj.id, krId, acaoId, concluida)}
                onRemoveAcao={(krId, acaoId) => handleRemoveAcao(obj.id, krId, acaoId)}
                onEditKr={(krId, data) => handleEditKr(obj.id, krId, data)}
                onConvertToSub={(krId, targetKrId) => handleConvertToSub(obj.id, krId, targetKrId)}
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

      <NovoCicloDialog
        open={novoCicloOpen}
        onClose={() => setNovoCicloOpen(false)}
        onCreate={handleCreateCiclo}
      />

      <DuplicateDialog
        open={duplicateOpen}
        count={selectedObjIds.size}
        ciclos={ciclos}
        currentCicloId={activeCicloId}
        onClose={() => setDuplicateOpen(false)}
        onConfirm={handleDuplicate}
      />
    </div>
  )
}
