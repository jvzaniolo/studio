import { useSyncExternalStore } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Shared, client-side store used to keep OKRs (app/routes/okrs.tsx) and
// Iniciativas (app/routes/iniciativas.tsx) in sync — o vínculo cross-module
// vive no nível de Key Result (não do Objetivo), então um link criado a
// partir de qualquer uma das páginas é refletido em ambas. Também hospeda o
// catálogo consolidado de KPIs usado no "KR automático via KPI" (fonte única
// em vez de cada módulo manter sua própria lista hard-coded).
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiCatalogItem {
  id: string
  nome: string
  valor_atual: number
  meta: number
  unidade: string
}

export const KPI_CATALOG: KpiCatalogItem[] = [
  { id: "kpi1", nome: "eNPS", valor_atual: 48, meta: 60, unidade: "pts" },
  { id: "kpi2", nome: "Liderança Feminina", valor_atual: 32, meta: 40, unidade: "%" },
  { id: "kpi3", nome: "Turnover Voluntário", valor_atual: 8.2, meta: 6.5, unidade: "%" },
  { id: "kpi4", nome: "Engajamento Geral", valor_atual: 74, meta: 80, unidade: "%" },
  { id: "kpi5", nome: "Horas de Treinamento", valor_atual: 22, meta: 40, unidade: "h/ano" },
]

export interface RegistryItem {
  id: string
  nome: string
  progresso: number
}

interface LinkRecord {
  krId: string
  iniciativaId: string
}

interface StoreState {
  links: LinkRecord[]
  keyResults: Record<string, RegistryItem>
  iniciativas: Record<string, RegistryItem>
}

const STORAGE_KEY = "hu-okr-shared-v2"

const DEFAULT_STATE: StoreState = {
  links: [
    { krId: "OBJ-001-kr1", iniciativaId: "INI-0001" },
    { krId: "OBJ-001-kr2", iniciativaId: "INI-0006" },
    { krId: "OBJ-002-kr1", iniciativaId: "INI-0002" },
    { krId: "OBJ-003-kr3", iniciativaId: "INI-0003" },
    { krId: "OBJ-004-kr1", iniciativaId: "INI-0007" },
    { krId: "OBJ-004-kr2", iniciativaId: "INI-0007" },
    { krId: "OBJ-004-kr3", iniciativaId: "INI-0007" },
    { krId: "OBJ-005-kr1", iniciativaId: "INI-0004" },
  ],
  keyResults: {
    "OBJ-000-kr1": { id: "OBJ-000-kr1", nome: "Consolidar a Humanizadas… › Elevar o índice de saúde organizacional para 65 pontos", progresso: 89 },
    "OBJ-000-kr2": { id: "OBJ-000-kr2", nome: "Consolidar a Humanizadas… › Manter todas as áreas com OKRs ativos publicados", progresso: 83 },
    "OBJ-001-kr1": { id: "OBJ-001-kr1", nome: "Aumentar eNPS para 60 até Q4 › Elevar eNPS de 42 para 60 pontos", progresso: 80 },
    "OBJ-001-kr2": { id: "OBJ-001-kr2", nome: "Aumentar eNPS para 60 até Q4 › Lançar canal de escuta contínua", progresso: 100 },
    "OBJ-001-kr3": { id: "OBJ-001-kr3", nome: "Aumentar eNPS para 60 até Q4 › Realizar 4 rodadas de pulse survey", progresso: 84 },
    "OBJ-002-kr1": { id: "OBJ-002-kr1", nome: "Atingir 40% de liderança feminina › Elevar liderança feminina de 28% para 40%", progresso: 80 },
    "OBJ-002-kr2": { id: "OBJ-002-kr2", nome: "Atingir 40% de liderança feminina › Formar 2 coortes do programa acelerador", progresso: 50 },
    "OBJ-002-kr3": { id: "OBJ-002-kr3", nome: "Atingir 40% de liderança feminina › Mapear pipeline de sucessão diverso", progresso: 60 },
    "OBJ-003-kr1": { id: "OBJ-003-kr1", nome: "Reduzir turnover voluntário em 15% › Implementar check-ins trimestrais em todas as áreas", progresso: 100 },
    "OBJ-003-kr2": { id: "OBJ-003-kr2", nome: "Reduzir turnover voluntário em 15% › Calibrar performance com comitê", progresso: 75 },
    "OBJ-003-kr3": { id: "OBJ-003-kr3", nome: "Reduzir turnover voluntário em 15% › Reduzir turnover voluntário para 8,2%", progresso: 70 },
    "OBJ-004-kr1": { id: "OBJ-004-kr1", nome: "Certificação ESG Tier 1 › Concluir diagnóstico e plano de adequação", progresso: 100 },
    "OBJ-004-kr2": { id: "OBJ-004-kr2", nome: "Certificação ESG Tier 1 › Publicar relatório GRI", progresso: 100 },
    "OBJ-004-kr3": { id: "OBJ-004-kr3", nome: "Certificação ESG Tier 1 › Obter aprovação em auditoria externa", progresso: 100 },
    "OBJ-005-kr1": { id: "OBJ-005-kr1", nome: "Implementar academia interna de competências › Lançar 3 trilhas de aprendizagem digital", progresso: 33 },
    "OBJ-005-kr2": { id: "OBJ-005-kr2", nome: "Implementar academia interna de competências › Capacitar 200 colaboradores", progresso: 11 },
    "OBJ-005-kr3": { id: "OBJ-005-kr3", nome: "Implementar academia interna de competências › Firmar parceria com EdTechs", progresso: 50 },
    "OBJ-006-kr1": { id: "OBJ-006-kr1", nome: "Elevar cobertura de segurança psicológica › Treinar lideranças em segurança psicológica", progresso: 18 },
    "OBJ-006-kr2": { id: "OBJ-006-kr2", nome: "Elevar cobertura de segurança psicológica › Lançar pesquisa de clima trimestral", progresso: 0 },
    "OBJ-007-kr1": { id: "OBJ-007-kr1", nome: "Elevar o eNPS das lideranças… › Elevar eNPS das lideranças de 55 para 70 pontos", progresso: 79 },
    "OBJ-007-kr2": { id: "OBJ-007-kr2", nome: "Elevar o eNPS das lideranças… › Publicar dashboard de sentimento por liderança", progresso: 0 },
  },
  iniciativas: {
    "INI-0001": { id: "INI-0001", nome: "Programa de Bem-Estar Mental", progresso: 45 },
    "INI-0002": { id: "INI-0002", nome: "Liderança Feminina no C-Level", progresso: 30 },
    "INI-0003": { id: "INI-0003", nome: "Reestruturação do Ciclo de Performance", progresso: 72 },
    "INI-0004": { id: "INI-0004", nome: "Academia de Competências Digitais", progresso: 0 },
    "INI-0005": { id: "INI-0005", nome: "Revisão da Política Global de Benefícios", progresso: 0 },
    "INI-0006": { id: "INI-0006", nome: "Programa de Mentoria Reversa", progresso: 38 },
    "INI-0007": { id: "INI-0007", nome: "Certificação ESG Tier 1", progresso: 100 },
    "INI-0008": { id: "INI-0008", nome: "Projeto de Clima Organizacional Q1", progresso: 15 },
  },
}

function load(): StoreState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return {
      links: parsed.links ?? DEFAULT_STATE.links,
      keyResults: parsed.keyResults ?? {},
      iniciativas: parsed.iniciativas ?? {},
    }
  } catch {
    return DEFAULT_STATE
  }
}

let state: StoreState = load()
const listeners = new Set<() => void>()

function persist() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return DEFAULT_STATE
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      state = load()
      listeners.forEach((l) => l())
    }
  })
}

function sameRegistry(a: Record<string, RegistryItem>, b: Record<string, RegistryItem>): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((k) => {
    const x = a[k]
    const y = b[k]
    return y && x.nome === y.nome && x.progresso === y.progresso
  })
}

/** Chamado pela página de OKRs sempre que a lista de key results muda. */
export function registerKeyResults(items: RegistryItem[]) {
  const next: Record<string, RegistryItem> = {}
  for (const item of items) next[item.id] = item
  if (sameRegistry(next, state.keyResults)) return
  state = { ...state, keyResults: next }
  emit()
}

/** Chamado pela página de Iniciativas sempre que sua lista muda. */
export function registerIniciativas(items: RegistryItem[]) {
  const next: Record<string, RegistryItem> = {}
  for (const item of items) next[item.id] = item
  if (sameRegistry(next, state.iniciativas)) return
  state = { ...state, iniciativas: next }
  emit()
}

export function linkKrIniciativa(krId: string, iniciativaId: string) {
  if (state.links.some((l) => l.krId === krId && l.iniciativaId === iniciativaId)) return
  state = { ...state, links: [...state.links, { krId, iniciativaId }] }
  emit()
}

export function unlinkKrIniciativa(krId: string, iniciativaId: string) {
  const next = state.links.filter((l) => !(l.krId === krId && l.iniciativaId === iniciativaId))
  if (next.length === state.links.length) return
  state = { ...state, links: next }
  emit()
}

/** Substitui todos os vínculos de um KR (usado pelo card de objetivo na página de OKRs). */
export function setLinksForKr(krId: string, iniciativaIds: string[]) {
  const others = state.links.filter((l) => l.krId !== krId)
  state = { ...state, links: [...others, ...iniciativaIds.map((iniciativaId) => ({ krId, iniciativaId }))] }
  emit()
}

/** Substitui todos os vínculos de uma iniciativa (usado na aba "Vínculos" de Iniciativas). */
export function setLinksForIniciativa(iniciativaId: string, krIds: string[]) {
  const others = state.links.filter((l) => l.iniciativaId !== iniciativaId)
  state = { ...state, links: [...others, ...krIds.map((krId) => ({ krId, iniciativaId }))] }
  emit()
}

export function useOkrShared(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function getIniciativasForKr(snap: StoreState, krId: string): RegistryItem[] {
  return snap.links
    .filter((l) => l.krId === krId)
    .map((l) => snap.iniciativas[l.iniciativaId])
    .filter((x): x is RegistryItem => Boolean(x))
}

export function getKeyResultsForIniciativa(snap: StoreState, iniciativaId: string): RegistryItem[] {
  return snap.links
    .filter((l) => l.iniciativaId === iniciativaId)
    .map((l) => snap.keyResults[l.krId])
    .filter((x): x is RegistryItem => Boolean(x))
}
