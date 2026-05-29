import { useState, useMemo } from "react"
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  X,
  SlidersHorizontal,
  Sparkles,
  Download,
} from "lucide-react"

import { PageHeader } from "~/components/page-header"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet"

// ─── Design tokens ────────────────────────────────────────────────────────────

const OR_PALETTE = {
  orcado: "#AA95BE",
  realizado: "#7401C3",
  excessoFill: "rgba(224,49,49,0.10)",
  economiaFill: "rgba(0,169,112,0.08)",
}

const TONE = {
  success: { bg: "#F3FCF7", fg: "#009966", solid: "#00A970", border: "#B2DFCB" },
  warning: { bg: "#FFFBEB", fg: "#89380A", solid: "#F59E0B", border: "#FDE68A" },
  danger:  { bg: "#FFF5F5", fg: "#C81E1E", solid: "#E03131", border: "#FECACA" },
  info:    { bg: "#FAF7FD", fg: "#5A0992", solid: "#7401C3", border: "#E9D5FF" },
} as const

type ToneKey = keyof typeof TONE

const CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #EEE6F3",
  boxShadow: "0 1px 3px rgba(60,3,102,0.05)",
}

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#737373",
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function orFmtBRL(v: number | null): string {
  if (v == null) return "—"
  const abs = Math.abs(v)
  const sign = v < 0 ? "−" : ""
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace(".", ",")} M`
  if (abs >= 100_000)   return `${sign}R$ ${Math.round(abs / 1_000)}k`
  if (abs >= 1_000)     return `${sign}R$ ${(abs / 1_000).toFixed(1).replace(".", ",")}k`
  return `${sign}R$ ${abs}`
}

function orFmtSignedBRL(v: number | null): string {
  if (v == null || v === 0) return "R$ 0"
  const s = orFmtBRL(v)
  return v > 0 ? "+" + s : s
}

function orFmtPct(v: number | null, decimals = 1): string {
  if (v == null) return "—"
  const sign = v > 0 ? "+" : v < 0 ? "−" : ""
  return `${sign}${Math.abs(v).toFixed(decimals).replace(".", ",")}%`
}

function tonePct(p: number): ToneKey {
  return p <= 0 ? "success" : p <= 5 ? "warning" : "danger"
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

const OR_CURRENT_MONTH_IDX = 3 // Abril

const OR_DATA = {
  mesCorrente: {
    label: "Abril/2026",
    orcado: 1_840_000,
    realizado: 2_110_000,
    desvioPct: 14.7,
    desvioPp: 0.8,
    orcadoVsAnt: 5.2,
  },
  ytd: {
    orcadoAcum: 7_200_000,
    realizadoAcum: 7_812_000,
    desvioAcum: 612_000,
    pctDoAno: 32.6,
  },
  projecao: {
    orcadoAnual: 22_100_000,
    projetadoAnual: 23_300_000,
    desvioPct: 5.4,
    tone: "danger" as ToneKey,
    recomendacao:
      "Com o desvio atual de +5,4%, o projetado supera o orçado em R$ 1,2 M. Recomenda-se revisão das folhas de Cozinha e BRAZ Campinas.",
  },
  serie: [
    { mes: "Jan", orcado: 1_780_000, realizado: 1_745_000 },
    { mes: "Fev", orcado: 1_790_000, realizado: 1_820_000 },
    { mes: "Mar", orcado: 1_810_000, realizado: 1_950_000 },
    { mes: "Abr", orcado: 1_840_000, realizado: 2_110_000 },
    { mes: "Mai", orcado: 1_850_000, realizado: null },
    { mes: "Jun", orcado: 1_860_000, realizado: null },
    { mes: "Jul", orcado: 1_870_000, realizado: null },
    { mes: "Ago", orcado: 1_875_000, realizado: null },
    { mes: "Set", orcado: 1_880_000, realizado: null },
    { mes: "Out", orcado: 1_890_000, realizado: null },
    { mes: "Nov", orcado: 1_895_000, realizado: null },
    { mes: "Dez", orcado: 1_900_000, realizado: null },
  ],
  linhaCusto: [
    { key: "Folha base",       orcado: 980_000,  realizado: 1_050_000, deltaPct: 7.1 },
    { key: "Horas extras",     orcado: 120_000,  realizado: 195_000,   deltaPct: 62.5 },
    { key: "13º / Férias",     orcado: 210_000,  realizado: 215_000,   deltaPct: 2.4 },
    { key: "INSS / FGTS",      orcado: 185_000,  realizado: 198_000,   deltaPct: 7.0 },
    { key: "Benefícios",       orcado: 95_000,   realizado: 88_000,    deltaPct: -7.4 },
    { key: "Vale-refeição",    orcado: 72_000,   realizado: 74_000,    deltaPct: 2.8 },
    { key: "Transporte",       orcado: 48_000,   realizado: 51_000,    deltaPct: 6.3 },
    { key: "EPI",              orcado: 22_000,   realizado: 19_000,    deltaPct: -13.6 },
    { key: "Uniforme",         orcado: 18_000,   realizado: 17_000,    deltaPct: -5.6 },
    { key: "Treinamento",      orcado: 90_000,   realizado: 103_000,   deltaPct: 14.4 },
  ],
  centroCusto: [
    { key: "COZINHA",       orcado: 780_000,   realizado: 920_000,   deltaPct: 17.9 },
    { key: "SALÃO",         orcado: 610_000,   realizado: 660_000,   deltaPct: 8.2 },
    { key: "BAR",           orcado: 290_000,   realizado: 310_000,   deltaPct: 6.9 },
    { key: "ADMINISTRAÇÃO", orcado: 160_000,   realizado: 220_000,   deltaPct: 37.5 },
  ],
  vertical: [
    { key: "BRAZ",              orcado: 520_000,   realizado: 610_000,   deltaPct: 17.3 },
    { key: "ASTOR",             orcado: 380_000,   realizado: 412_000,   deltaPct: 8.4 },
    { key: "ICI",               orcado: 290_000,   realizado: 305_000,   deltaPct: 5.2 },
    { key: "BOTECOS",           orcado: 350_000,   realizado: 420_000,   deltaPct: 20.0 },
    { key: "CENTRAL DE MASSAS", orcado: 185_000,   realizado: 218_000,   deltaPct: 17.8 },
    { key: "DELIVERIES",        orcado: 115_000,   realizado: 145_000,   deltaPct: 26.1 },
  ],
  loja: [
    { key: "BRAZ CAMPINAS",     orcado: 226_000,   realizado: 312_000,   deltaPct: 38.1 },
    { key: "BRAZ PAULISTA",     orcado: 210_000,   realizado: 245_000,   deltaPct: 16.7 },
    { key: "ASTOR HIGIENÓPOLIS",orcado: 190_000,   realizado: 208_000,   deltaPct: 9.5 },
    { key: "BOTECOS PINHEIROS", orcado: 175_000,   realizado: 220_000,   deltaPct: 25.7 },
    { key: "ICI JARDINS",       orcado: 158_000,   realizado: 162_000,   deltaPct: 2.5 },
    { key: "BRAZ MOEMA",        orcado: 145_000,   realizado: 172_000,   deltaPct: 18.6 },
    { key: "ASTOR ITAIM",       orcado: 132_000,   realizado: 138_000,   deltaPct: 4.5 },
    { key: "CENTRAL MASSAS SP", orcado: 125_000,   realizado: 148_000,   deltaPct: 18.4 },
    { key: "BOTECOS VILA MADALENA", orcado: 112_000, realizado: 126_000, deltaPct: 12.5 },
    { key: "DELIVERIES SP",     orcado: 98_000,    realizado: 125_000,   deltaPct: 27.6 },
  ],
  nivel: [
    { key: "Estagiário",  orcado: 140_000,  realizado: 148_000,  deltaPct: 5.7 },
    { key: "Analista",    orcado: 510_000,  realizado: 580_000,  deltaPct: 13.7 },
    { key: "Coordenação", orcado: 620_000,  realizado: 695_000,  deltaPct: 12.1 },
    { key: "Gerência",    orcado: 420_000,  realizado: 510_000,  deltaPct: 21.4 },
    { key: "Diretoria",   orcado: 150_000,  realizado: 177_000,  deltaPct: 18.0 },
  ],
  heatmap: {
    linhaCusto: {
      rows: ["Folha base","Horas extras","13º / Férias","INSS / FGTS","Benefícios","Vale-refeição","Transporte","EPI","Uniforme","Treinamento"],
      data: [
        [-2.1,-1.8, 0.5, 1.2, 3.4, 5.1, 6.2, 7.1, null,null,null,null],
        [ 1.2, 2.4, 8.1,15.3,22.5,35.8,45.0,62.5, null,null,null,null],
        [-0.5,-0.3, 0.8, 1.1, 1.9, 2.1, 2.3, 2.4, null,null,null,null],
        [ 0.3, 0.8, 2.1, 3.5, 4.8, 5.9, 6.5, 7.0, null,null,null,null],
        [-9.1,-8.2,-6.5,-5.1,-4.2,-3.8,-3.2,-7.4, null,null,null,null],
        [-1.2,-0.5, 0.3, 1.1, 1.8, 2.2, 2.5, 2.8, null,null,null,null],
        [ 0.5, 1.2, 2.8, 3.9, 4.5, 5.1, 5.8, 6.3, null,null,null,null],
        [-5.2,-4.8,-3.2,-2.1,-1.5,-1.2,-0.8,-13.6,null,null,null,null],
        [-3.8,-4.2,-5.1,-6.2,-5.8,-5.5,-5.2,-5.6, null,null,null,null],
        [ 2.1, 3.5, 5.8, 8.2,10.1,11.8,13.2,14.4, null,null,null,null],
      ],
    },
    centroCusto: {
      rows: ["COZINHA","SALÃO","BAR","ADMINISTRAÇÃO"],
      data: [
        [ 3.2, 5.1, 8.4,11.2,13.5,15.8,16.9,17.9, null,null,null,null],
        [ 1.5, 2.8, 4.2, 5.8, 6.5, 7.1, 7.8, 8.2, null,null,null,null],
        [ 0.8, 1.5, 2.8, 3.9, 4.5, 5.8, 6.2, 6.9, null,null,null,null],
        [ 5.2, 8.8,12.5,18.2,22.8,28.5,32.1,37.5, null,null,null,null],
      ],
    },
    vertical: {
      rows: ["BRAZ","ASTOR","ICI","BOTECOS","CENTRAL DE MASSAS","DELIVERIES"],
      data: [
        [ 2.1, 4.5, 7.8,10.2,12.5,14.8,16.1,17.3, null,null,null,null],
        [ 0.8, 2.1, 3.8, 5.2, 6.5, 7.2, 7.9, 8.4, null,null,null,null],
        [-0.5, 0.8, 1.5, 2.8, 3.5, 4.1, 4.8, 5.2, null,null,null,null],
        [ 3.5, 6.2, 9.8,12.5,14.8,16.9,18.5,20.0, null,null,null,null],
        [ 2.8, 5.1, 8.2,10.8,13.2,15.1,16.8,17.8, null,null,null,null],
        [ 5.8, 9.2,13.5,16.8,19.5,21.8,24.2,26.1, null,null,null,null],
      ],
    },
    loja: {
      rows: ["BRAZ CAMPINAS","BRAZ PAULISTA","ASTOR HIGIENÓPOLIS","BOTECOS PINHEIROS","ICI JARDINS","BRAZ MOEMA","ASTOR ITAIM","CENTRAL MASSAS SP","BOTECOS V.MADALENA","DELIVERIES SP"],
      data: [
        [ 5.2, 8.8,12.5,18.2,22.8,28.5,32.1,38.1, null,null,null,null],
        [ 2.1, 4.5, 7.8,10.2,12.5,14.8,16.1,16.7, null,null,null,null],
        [ 0.8, 2.1, 3.8, 5.2, 6.5, 7.9, 8.8, 9.5, null,null,null,null],
        [ 3.5, 6.2, 9.8,12.5,14.8,18.5,21.2,25.7, null,null,null,null],
        [-0.5, 0.2, 0.8, 1.2, 1.8, 2.2, 2.5, 2.5, null,null,null,null],
        [ 2.8, 5.1, 8.2,10.8,13.2,15.8,17.5,18.6, null,null,null,null],
        [ 0.2, 0.8, 1.5, 2.1, 2.8, 3.5, 4.1, 4.5, null,null,null,null],
        [ 2.5, 4.8, 7.5,10.1,12.8,15.2,17.1,18.4, null,null,null,null],
        [ 1.5, 3.2, 5.8, 7.8, 9.5,10.8,11.8,12.5, null,null,null,null],
        [ 5.8, 9.2,13.5,16.8,19.5,22.8,25.5,27.6, null,null,null,null],
      ],
    },
    nivel: {
      rows: ["Estagiário","Analista","Coordenação","Gerência","Diretoria"],
      data: [
        [ 0.5, 1.2, 2.1, 3.2, 4.1, 4.8, 5.2, 5.7, null,null,null,null],
        [ 1.8, 3.5, 5.8, 7.8, 9.5,11.2,12.8,13.7, null,null,null,null],
        [ 1.5, 3.2, 5.5, 7.2, 8.8,10.2,11.5,12.1, null,null,null,null],
        [ 3.2, 5.8, 9.2,12.5,14.8,17.5,19.8,21.4, null,null,null,null],
        [ 2.5, 4.8, 7.5,10.1,12.8,14.8,16.5,18.0, null,null,null,null],
      ],
    },
  },
  top: [
    { rank:1, loja:"BRAZ CAMPINAS",      vertical:"BRAZ",    centro:"COZINHA",     orcado:226_000, realizado:312_000, desvio:38.0 },
    { rank:2, loja:"BOTECOS PINHEIROS",  vertical:"BOTECOS", centro:"COZINHA",     orcado:175_000, realizado:220_000, desvio:25.7 },
    { rank:3, loja:"DELIVERIES SP",      vertical:"DELIVERIES", centro:"OPERAÇÕES",orcado:98_000,  realizado:125_000, desvio:27.6 },
    { rank:4, loja:"BRAZ PAULISTA",      vertical:"BRAZ",    centro:"ADMINISTRAÇÃO",orcado:210_000,realizado:245_000, desvio:16.7 },
    { rank:5, loja:"CENTRAL MASSAS SP",  vertical:"CENTRAL DE MASSAS", centro:"PRODUÇÃO",orcado:125_000,realizado:148_000, desvio:18.4 },
  ],
}

const DIRETORIAS_BREAKDOWN = [
  { key:"Operações", orcado:580_000, realizado:612_000, deltaPct:5.5,
    back:{ orcado:420_000, realizado:440_000, deltaPct:4.8 }, front:{ orcado:160_000, realizado:172_000, deltaPct:7.5 } },
  { key:"Marketing", orcado:210_000, realizado:225_000, deltaPct:7.1,
    back:{ orcado:140_000, realizado:148_000, deltaPct:5.7 }, front:{ orcado:70_000,  realizado:77_000,  deltaPct:10.0 } },
  { key:"Comercial", orcado:185_000, realizado:192_000, deltaPct:3.8,
    back:{ orcado:120_000, realizado:122_000, deltaPct:1.7 }, front:{ orcado:65_000,  realizado:70_000,  deltaPct:7.7 } },
  { key:"Financeiro", orcado:165_000, realizado:172_000, deltaPct:4.2,
    back:{ orcado:130_000, realizado:135_000, deltaPct:3.8 }, front:{ orcado:35_000,  realizado:37_000,  deltaPct:5.7 } },
  { key:"Pessoas",   orcado:148_000, realizado:168_000, deltaPct:13.5,
    back:{ orcado:95_000,  realizado:110_000, deltaPct:15.8 }, front:{ orcado:53_000, realizado:58_000,  deltaPct:9.4 } },
  { key:"TI",        orcado:112_000, realizado:118_000, deltaPct:5.4,
    back:{ orcado:90_000,  realizado:95_000,  deltaPct:5.6 },  front:{ orcado:22_000, realizado:23_000,  deltaPct:4.5 } },
]

const FORNECEDORES_CATEGORIAS = [
  { id:"padaria",    label:"PADARIA",            orcado:45_000,  realizado:32_400,  ativos:8,
    fornecedores:[{ nome:"Padaria Real Pão", orcado:18_000, realizado:14_200 },{ nome:"Grão & Farinha", orcado:15_000, realizado:11_800 },{ nome:"Levain Artesanal", orcado:12_000, realizado:6_400 }] },
  { id:"uniformes",  label:"UNIFORMES",          orcado:28_000,  realizado:31_200,  ativos:3,
    fornecedores:[{ nome:"UniWork Fardamentos", orcado:18_000, realizado:21_000 },{ nome:"Têxtil Norte", orcado:10_000, realizado:10_200 }] },
  { id:"treinamento",label:"TREINAMENTO",         orcado:62_000,  realizado:71_500,  ativos:5,
    fornecedores:[{ nome:"Academia RH+", orcado:30_000, realizado:38_000 },{ nome:"Culinary Institute", orcado:22_000, realizado:24_500 },{ nome:"Segurança Alimentar BR", orcado:10_000, realizado:9_000 }] },
  { id:"limpeza",    label:"LIMPEZA & HIGIENE",   orcado:38_500,  realizado:35_800,  ativos:4,
    fornecedores:[{ nome:"CleanPro Higiene", orcado:22_000, realizado:20_500 },{ nome:"EcoClean", orcado:16_500, realizado:15_300 }] },
  { id:"manutencao", label:"MANUTENÇÃO",          orcado:55_000,  realizado:62_000,  ativos:6,
    fornecedores:[{ nome:"TechFix Serviços", orcado:30_000, realizado:35_000 },{ nome:"Elétrica Premium", orcado:15_000, realizado:18_000 },{ nome:"Hidro&Ar", orcado:10_000, realizado:9_000 }] },
  { id:"papelaria",  label:"PAPELARIA & ESCRITÓRIO", orcado:12_000, realizado:10_800, ativos:2,
    fornecedores:[{ nome:"MaxOffice", orcado:8_000, realizado:7_200 },{ nome:"Papel & Cia", orcado:4_000, realizado:3_600 }] },
  { id:"descartaveis",label:"DESCARTÁVEIS & DELIVERY", orcado:48_000, realizado:58_500, ativos:5,
    fornecedores:[{ nome:"EcoBox Embalagens", orcado:25_000, realizado:32_000 },{ nome:"DescartFácil", orcado:15_000, realizado:18_500 },{ nome:"GreenPack", orcado:8_000, realizado:8_000 }] },
]

// Lookup tables
const LOJAS_HEADCOUNT: Record<string, number> = {
  "BRAZ CAMPINAS":8,"BRAZ PAULISTA":7,"ASTOR HIGIENÓPOLIS":6,"BOTECOS PINHEIROS":6,
  "ICI JARDINS":5,"BRAZ MOEMA":5,"ASTOR ITAIM":5,"CENTRAL MASSAS SP":4,"BOTECOS VILA MADALENA":4,"DELIVERIES SP":4,
}
const TOTAL_HEADCOUNT = 278
const CENTRO_HEADCOUNT_PCT: Record<string, number> = { COZINHA:0.42, SALÃO:0.33, BAR:0.16, ADMINISTRAÇÃO:0.09 }
const NIVEL_HEADCOUNT_PCT: Record<string, number> = { Estagiário:0.12, Analista:0.35, Coordenação:0.30, Gerência:0.18, Diretoria:0.05 }

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({ tone, solid, children }: { tone: ToneKey; solid?: boolean; children: React.ReactNode }) {
  const t = TONE[tone]
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", padding:"2px 8px",
      borderRadius:999, fontSize:11, fontWeight:700,
      background: solid ? t.solid : t.bg,
      color: solid ? "#fff" : t.fg,
      border: `1px solid ${solid ? t.solid : t.border}`,
    }}>
      {children}
    </span>
  )
}

// ─── ORKpi ────────────────────────────────────────────────────────────────────

function ORKpi({ eyebrow, value, delta, tone, icon: Icon }: {
  eyebrow: string; value: string; delta: string; tone: ToneKey; icon: React.ElementType
}) {
  const t = TONE[tone]
  return (
    <div style={{ ...CARD_STYLE, padding:"18px 20px", borderTop:`3px solid ${t.solid}`, flex:1, minWidth:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <span style={EYEBROW_STYLE}>{eyebrow}</span>
        <Icon size={16} color={t.fg} strokeWidth={2} />
      </div>
      <div style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.03em", color:"#1C0033", fontVariantNumeric:"tabular-nums", lineHeight:1.1, marginBottom:6 }}>
        {value}
      </div>
      <div style={{ fontSize:12, color:t.fg, fontWeight:500 }}>{delta}</div>
    </div>
  )
}

// ─── ORConsumoBar ─────────────────────────────────────────────────────────────

const SCALE_MAX = 150

function ORConsumoBar({ pct }: { pct: number }) {
  const fillW = Math.min(pct, SCALE_MAX) / SCALE_MAX * 100
  const markerPos = (100 / SCALE_MAX) * 100
  const over = pct > 100
  return (
    <div style={{ position:"relative", height:10, borderRadius:5,
      background: over ? "rgba(224,49,49,0.12)" : "#F4F0F8", overflow:"hidden" }}>
      <div style={{
        position:"absolute", left:0, top:0, height:"100%",
        width:`${fillW}%`, borderRadius:5,
        background: over ? "#E03131" : "#7401C3",
        transition:"width 0.4s",
      }} />
      {over && (
        <div style={{ position:"absolute", top:0, height:"100%", left:`${markerPos}%`,
          width:2, background:"rgba(255,255,255,0.8)" }} />
      )}
    </div>
  )
}

// ─── ORDualLineChart ──────────────────────────────────────────────────────────

function ORDualLineChart({ data, currentIdx }: {
  data: typeof OR_DATA.serie; currentIdx: number
}) {
  const W = 860, H = 280
  const pad = { t:20, r:20, b:48, l:72 }
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b

  const allVals = data.flatMap(d => [d.orcado, d.realizado ?? 0].filter(Boolean))
  const maxV = Math.ceil(Math.max(...allVals) / 200_000) * 200_000
  const minV = Math.floor(Math.min(...allVals) / 200_000) * 200_000

  const xOf = (i: number) => pad.l + (i / (data.length - 1)) * iW
  const yOf = (v: number) => pad.t + iH - ((v - minV) / (maxV - minV)) * iH

  const orcPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.orcado)}`).join(" ")
  const realPts = data.filter(d => d.realizado != null)
  const realPath = realPts.map((d, i) => {
    const idx = data.indexOf(d)
    return `${i === 0 ? "M" : "L"}${xOf(idx)},${yOf(d.realizado!)}`
  }).join(" ")

  // Area between lines (only up to currentIdx)
  const areaData = data.slice(0, currentIdx + 1)
  const areaPath = areaData.length < 2 ? "" : [
    ...areaData.map((d, i) => `${i===0?"M":"L"}${xOf(i)},${yOf(d.orcado)}`),
    ...areaData.slice().reverse().map((d, ri) => {
      const i = areaData.length - 1 - ri
      return `L${xOf(i)},${yOf(d.realizado ?? d.orcado)}`
    }),
    "Z"
  ].join(" ")

  const lastReal = data.slice(0, currentIdx + 1).reverse().find(d => d.realizado != null)
  const isOver = lastReal ? lastReal.realizado! > lastReal.orcado : false

  const ticks = [minV, minV + (maxV-minV)/4, minV + (maxV-minV)/2, minV + (maxV-minV)*3/4, maxV]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto" }}>
      {/* Grid lines */}
      {ticks.map(v => (
        <line key={v} x1={pad.l} y1={yOf(v)} x2={W-pad.r} y2={yOf(v)}
          stroke="#EEE6F3" strokeWidth={1} />
      ))}
      {ticks.map(v => (
        <text key={v} x={pad.l - 8} y={yOf(v) + 4} textAnchor="end"
          fontSize={11} fill="#737373">
          {orFmtBRL(v)}
        </text>
      ))}
      {/* Month labels */}
      {data.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - pad.b + 18} textAnchor="middle"
          fontSize={11} fill={i === currentIdx ? "#7401C3" : "#737373"}
          fontWeight={i === currentIdx ? 700 : 400}>
          {d.mes}
        </text>
      ))}
      {/* Area */}
      {areaPath && <path d={areaPath} fill={isOver ? OR_PALETTE.excessoFill : OR_PALETTE.economiaFill} />}
      {/* Current month marker */}
      <line x1={xOf(currentIdx)} y1={pad.t} x2={xOf(currentIdx)} y2={H - pad.b}
        stroke="#D1C4E9" strokeWidth={1.5} strokeDasharray="4 3" />
      {/* Orçado line */}
      <path d={orcPath} fill="none" stroke={OR_PALETTE.orcado} strokeWidth={2} strokeDasharray="5 4" />
      {/* Realizado line */}
      <path d={realPath} fill="none" stroke={OR_PALETTE.realizado} strokeWidth={2.5} />
      {/* Realizado dots */}
      {data.map((d, i) => d.realizado != null ? (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(d.realizado)} r={5} fill="#fff" stroke={OR_PALETTE.realizado} strokeWidth={2} />
          <circle cx={xOf(i)} cy={yOf(d.realizado)} r={2.5} fill={OR_PALETTE.realizado} />
        </g>
      ) : null)}
      {/* Legend */}
      <line x1={W-140} y1={16} x2={W-116} y2={16} stroke={OR_PALETTE.orcado} strokeWidth={2} strokeDasharray="5 4" />
      <text x={W-112} y={20} fontSize={11} fill="#737373">Orçado</text>
      <line x1={W-60} y1={16} x2={W-36} y2={16} stroke={OR_PALETTE.realizado} strokeWidth={2.5} />
      <text x={W-32} y={20} fontSize={11} fill="#737373">Real</text>
    </svg>
  )
}

// ─── ORBreakdownTable ─────────────────────────────────────────────────────────

type BreakdownRow = { key: string; orcado: number; realizado: number; deltaPct: number }

function ORBreakdownTable({ rows }: { rows: BreakdownRow[] }) {
  const COL = "1.6fr 2.4fr 1fr 1fr 1fr 0.9fr"
  const headerStyle: React.CSSProperties = { ...EYEBROW_STYLE, padding:"0 10px 8px" }
  const cellStyle: React.CSSProperties = { padding:"10px 10px", fontSize:13, display:"flex", alignItems:"center" }
  const total = OR_DATA.mesCorrente
  const totalDeltaPct = ((total.realizado - total.orcado) / total.orcado) * 100

  return (
    <div>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:COL, borderBottom:"1px solid #EEE6F3", padding:"0 0 4px" }}>
        {["Categoria","Consumo do orçado","Orçado","Realizado","Δ R$","Δ %"].map(h => (
          <span key={h} style={headerStyle}>{h}</span>
        ))}
      </div>
      {/* Rows */}
      {rows.map((r, i) => (
        <div key={r.key} style={{
          display:"grid", gridTemplateColumns:COL,
          background: i % 2 === 0 ? "#FDFBFE" : "#fff",
          borderBottom:"1px solid #F5F0F9",
        }}>
          <div style={{ ...cellStyle, fontWeight:600, fontSize:13.5 }}>{r.key}</div>
          <div style={{ ...cellStyle }}><ORConsumoBar pct={(r.realizado / r.orcado) * 100} /></div>
          <div style={{ ...cellStyle, justifyContent:"flex-end", color:"#737373" }}>{orFmtBRL(r.orcado)}</div>
          <div style={{ ...cellStyle, justifyContent:"flex-end", fontWeight:700 }}>{orFmtBRL(r.realizado)}</div>
          <div style={{ ...cellStyle, justifyContent:"flex-end", color: r.realizado > r.orcado ? "#C81E1E" : "#009966" }}>
            {orFmtSignedBRL(r.realizado - r.orcado)}
          </div>
          <div style={{ ...cellStyle, justifyContent:"flex-end" }}>
            <Pill tone={tonePct(r.deltaPct)}>{orFmtPct(r.deltaPct)}</Pill>
          </div>
        </div>
      ))}
      {/* Total row */}
      <div style={{ display:"grid", gridTemplateColumns:COL, background:"#FDFBFE", borderTop:"2px solid #EEE6F3" }}>
        <div style={{ ...cellStyle, fontWeight:700, fontSize:13.5, textTransform:"uppercase", letterSpacing:"0.05em" }}>TOTAL</div>
        <div style={{ ...cellStyle }}><ORConsumoBar pct={(total.realizado / total.orcado) * 100} /></div>
        <div style={{ ...cellStyle, justifyContent:"flex-end", color:"#737373", fontWeight:700 }}>{orFmtBRL(total.orcado)}</div>
        <div style={{ ...cellStyle, justifyContent:"flex-end", fontWeight:700 }}>{orFmtBRL(total.realizado)}</div>
        <div style={{ ...cellStyle, justifyContent:"flex-end", fontWeight:700, color:"#C81E1E" }}>
          {orFmtSignedBRL(total.realizado - total.orcado)}
        </div>
        <div style={{ ...cellStyle, justifyContent:"flex-end" }}>
          <Pill tone={tonePct(totalDeltaPct)} solid>{orFmtPct(totalDeltaPct)}</Pill>
        </div>
      </div>
    </div>
  )
}

// ─── ORDesvioHeatmap ──────────────────────────────────────────────────────────

function ORDesvioHeatmap({ rows, data, currentIdx }: {
  rows: string[]; data: (number | null)[][]; currentIdx: number
}) {
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

  function cellColor(v: number | null): string {
    if (v == null) return "#F4F0F8"
    const intensity = Math.min(Math.abs(v) / 40, 1)
    if (v <= 0) return `rgba(0,169,112,${0.12 + intensity * 0.55})`
    return `rgba(224,49,49,${0.12 + intensity * 0.55})`
  }
  function cellText(v: number | null): string {
    if (v == null) return ""
    return orFmtPct(v)
  }

  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ borderCollapse:"collapse", width:"100%", fontSize:11 }}>
        <thead>
          <tr>
            <th style={{ width:140, textAlign:"left", padding:"4px 8px", ...EYEBROW_STYLE as any }}>Categoria</th>
            {months.map((m, i) => (
              <th key={m} style={{
                padding:"4px 4px", textAlign:"center", ...EYEBROW_STYLE as any,
                borderLeft: i === currentIdx ? "2px solid #7401C3" : undefined,
                color: i === currentIdx ? "#7401C3" : "#737373",
              }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row}>
              <td style={{ padding:"3px 8px", fontWeight:600, fontSize:12, color:"#1C0033", whiteSpace:"nowrap" }}>{row}</td>
              {months.map((_, ci) => {
                const v = data[ri]?.[ci] ?? null
                return (
                  <td key={ci} style={{
                    padding:"3px 4px", textAlign:"center",
                    background: cellColor(v),
                    color: v == null ? "transparent" : v <= 0 ? "#006644" : "#9B1C1C",
                    fontWeight:600,
                    borderLeft: ci === currentIdx ? "2px solid #7401C3" : undefined,
                    borderRadius: 3,
                  }}>
                    {cellText(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── ORTopTable ───────────────────────────────────────────────────────────────

function verticalColor(v: string): string {
  return ({ BRAZ:"#3C0366", ASTOR:"#7401C3", ICI:"#5A0992", BOTECOS:"#AA95BE" } as any)[v] || "#737373"
}

function ORTopTable({ rows }: { rows: typeof OR_DATA.top }) {
  const COL = "46px 1.7fr 0.85fr 0.95fr 1.1fr 1fr 1fr 1fr 0.85fr"
  const totalOrc = OR_DATA.mesCorrente.orcado
  const cell: React.CSSProperties = { padding:"10px 8px", fontSize:12.5, display:"flex", alignItems:"center" }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:COL, borderBottom:"1px solid #EEE6F3", padding:"0 0 4px" }}>
        {["#","Loja","Vertical","Centro","Repr.","Orçado","Realizado","Δ R$","Δ %"].map(h => (
          <span key={h} style={{ ...EYEBROW_STYLE, padding:"0 8px 8px" }}>{h}</span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={r.rank} style={{
          display:"grid", gridTemplateColumns:COL,
          background: i % 2 === 0 ? "#FDFBFE" : "#fff",
          borderBottom:"1px solid #F5F0F9",
        }}>
          <div style={{ ...cell, justifyContent:"center" }}>
            <div style={{
              width:28, height:28, borderRadius:"50%",
              background: r.rank === 1 ? "#FFE2E2" : "#F4F0F8",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, fontSize:12, color: r.rank === 1 ? "#C81E1E" : "#5A0992"
            }}>{r.rank}</div>
          </div>
          <div style={{ ...cell, gap:8 }}>
            <div style={{
              width:30, height:30, borderRadius:"50%",
              background: verticalColor(r.vertical),
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, color:"#fff", flexShrink:0,
            }}>
              {r.loja.slice(0,2)}
            </div>
            <span style={{ fontWeight:600 }}>{r.loja}</span>
          </div>
          <div style={{ ...cell }}>
            <span style={{
              display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600,
              color: verticalColor(r.vertical),
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:verticalColor(r.vertical), flexShrink:0 }} />
              {r.vertical}
            </span>
          </div>
          <div style={{ ...cell, color:"#737373" }}>{r.centro}</div>
          <div style={{ ...cell }}>
            <div style={{ display:"flex", flexDirection:"column", gap:2, width:"100%" }}>
              <div style={{ fontSize:11, color:"#5A0992", fontWeight:700 }}>
                {((r.orcado / totalOrc) * 100).toFixed(1)}% do orçado
              </div>
              <div style={{ height:4, borderRadius:2, background:"#EEE6F3", overflow:"hidden" }}>
                <div style={{ height:"100%", background:"#AA95BE", width:`${Math.min((r.orcado/totalOrc)*100*3,100)}%` }} />
              </div>
            </div>
          </div>
          <div style={{ ...cell, justifyContent:"flex-end", color:"#737373" }}>{orFmtBRL(r.orcado)}</div>
          <div style={{ ...cell, justifyContent:"flex-end", fontWeight:700 }}>{orFmtBRL(r.realizado)}</div>
          <div style={{ ...cell, justifyContent:"flex-end", color:"#C81E1E", fontWeight:600 }}>
            {orFmtSignedBRL(r.realizado - r.orcado)}
          </div>
          <div style={{ ...cell, justifyContent:"flex-end" }}>
            <Pill tone="danger">{orFmtPct(r.desvio)}</Pill>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ORProjecaoCard ───────────────────────────────────────────────────────────

function ORProjecaoCard() {
  const p = OR_DATA.projecao
  const ytd = OR_DATA.ytd
  const t = TONE[p.tone]
  return (
    <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
      <div style={{ marginBottom:16 }}>
        <div style={EYEBROW_STYLE}>Fechamento previsto</div>
        <div style={{ fontSize:17, fontWeight:700, color:"#1C0033", marginTop:4 }}>Projeção do ano · 2026</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:20 }}>
        {[
          { label:"Orçado anual", value:orFmtBRL(p.orcadoAnual), sub:"Baseline aprovado" },
          { label:"Realizado YTD", value:orFmtBRL(ytd.realizadoAcum), sub:`${ytd.pctDoAno}% do ano` },
          { label:"Projetado anual", value:orFmtBRL(p.projetadoAnual), sub:orFmtPct(p.desvioPct) + " vs. orçado", tone:p.tone },
        ].map(item => (
          <div key={item.label} style={{ padding:"14px 16px", background:"#FAF7FD", borderRadius:10, border:"1px solid #EEE6F3" }}>
            <div style={EYEBROW_STYLE}>{item.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color: item.tone ? t.fg : "#1C0033", marginTop:6, letterSpacing:"-0.02em" }}>
              {item.value}
            </div>
            <div style={{ fontSize:11, color: item.tone ? t.fg : "#737373", marginTop:2, fontWeight:item.tone ? 600 : 400 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"14px 16px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, display:"flex", gap:12, alignItems:"flex-start" }}>
        <AlertTriangle size={18} color={t.fg} style={{ flexShrink:0, marginTop:1 }} />
        <p style={{ fontSize:13, color:t.fg, lineHeight:1.55, margin:0 }}>{p.recomendacao}</p>
      </div>
    </div>
  )
}

// ─── Módulo de Fornecedores ───────────────────────────────────────────────────

function fnBarTone(pct: number): { tone: ToneKey; label: string } {
  if (pct > 100) return { tone:"danger",  label:"estouro" }
  if (pct >= 90) return { tone:"warning", label:"atenção" }
  if (pct >= 70) return { tone:"warning", label:"consumo alto" }
  return              { tone:"success", label:"no ritmo" }
}

type FnCat = typeof FORNECEDORES_CATEGORIAS[number]

function FnCategoriaCard({ cat, onClick }: { cat: FnCat; onClick: () => void }) {
  const pct = (cat.realizado / cat.orcado) * 100
  const { tone, label } = fnBarTone(pct)
  return (
    <button onClick={onClick} style={{
      ...CARD_STYLE, padding:"18px 20px", cursor:"pointer", textAlign:"left",
      width:"100%", background:"#fff", transition:"box-shadow 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(60,3,102,0.12)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = CARD_STYLE.boxShadow as string)}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <span style={EYEBROW_STYLE}>{cat.label}</span>
        <Pill tone={tone}>{label}</Pill>
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:10 }}>
        <span style={{ fontSize:22, fontWeight:700, color:"#1C0033" }}>{orFmtBRL(cat.realizado)}</span>
        <span style={{ fontSize:12, color:"#737373" }}>de {orFmtBRL(cat.orcado)}</span>
      </div>
      <ORConsumoBar pct={pct} />
      <div style={{ marginTop:8, fontSize:11, color:"#737373" }}>{cat.ativos} fornecedores ativos · {pct.toFixed(0)}%</div>
    </button>
  )
}

function FnDrawer({ cat, onClose }: { cat: FnCat; onClose: () => void }) {
  const pct = (cat.realizado / cat.orcado) * 100
  const { tone } = fnBarTone(pct)
  return (
    <Sheet open onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-[480px] max-w-full overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-[#EEE6F3]">
          <SheetTitle style={{ color:"#1C0033" }}>{cat.label}</SheetTitle>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
            <Pill tone={tone}>{pct.toFixed(0)}% consumido</Pill>
            <span style={{ fontSize:12, color:"#737373" }}>{cat.ativos} fornecedores ativos</span>
          </div>
          <div style={{ marginTop:8 }}><ORConsumoBar pct={pct} /></div>
        </SheetHeader>
        <div style={{ padding:"20px 0", display:"flex", flexDirection:"column", gap:12 }}>
          {cat.fornecedores.map(f => {
            const fp = (f.realizado / f.orcado) * 100
            const { tone: ft } = fnBarTone(fp)
            return (
              <div key={f.nome} style={{ padding:"14px 16px", borderRadius:10, border:"1px solid #EEE6F3", background:"#FDFBFE" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontWeight:600, fontSize:13, color:"#1C0033" }}>{f.nome}</span>
                  <Pill tone={ft}>{fp.toFixed(0)}%</Pill>
                </div>
                <div style={{ display:"flex", gap:16, fontSize:12, color:"#737373", marginBottom:8 }}>
                  <span>Orçado: <strong style={{ color:"#1C0033" }}>{orFmtBRL(f.orcado)}</strong></span>
                  <span>Realizado: <strong style={{ color:"#1C0033" }}>{orFmtBRL(f.realizado)}</strong></span>
                </div>
                <ORConsumoBar pct={fp} />
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function FornecedoresModulo() {
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const cat = selecionada ? FORNECEDORES_CATEGORIAS.find(c => c.id === selecionada) : null

  return (
    <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
      <div style={{ marginBottom:16 }}>
        <div style={EYEBROW_STYLE}>Fornecedores</div>
        <div style={{ fontSize:17, fontWeight:700, color:"#1C0033", marginTop:4 }}>Consumo por categoria</div>
        <div style={{ fontSize:12, color:"#737373", marginTop:2 }}>Clique numa categoria para ver o detalhamento por fornecedor</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
        {FORNECEDORES_CATEGORIAS.map(c => (
          <FnCategoriaCard key={c.id} cat={c} onClick={() => setSelecionada(c.id)} />
        ))}
      </div>
      {cat && <FnDrawer cat={cat} onClose={() => setSelecionada(null)} />}
    </div>
  )
}

// ─── ORDNAView ────────────────────────────────────────────────────────────────

function DNABreakdownTable({ diretoria, backFront }: { diretoria: string; backFront: string }) {
  const [expanded, setExpanded] = useState<string[]>([])
  const rows = diretoria === "Todas" ? DIRETORIAS_BREAKDOWN : DIRETORIAS_BREAKDOWN.filter(r => r.key === diretoria)
  const COL = "1.6fr 2.4fr 1fr 1fr 1fr 0.9fr 32px"
  const cell: React.CSSProperties = { padding:"10px 10px", fontSize:13, display:"flex", alignItems:"center" }

  function toggle(key: string) {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:COL, borderBottom:"1px solid #EEE6F3" }}>
        {["Diretoria","Consumo do orçado","Orçado","Realizado","Δ R$","Δ %",""].map(h => (
          <span key={h} style={{ ...EYEBROW_STYLE, padding:"0 10px 8px" }}>{h}</span>
        ))}
      </div>
      {rows.map((r, i) => {
        const isExp = expanded.includes(r.key)
        const displayRow = backFront === "Back" ? { orcado:r.back.orcado, realizado:r.back.realizado, deltaPct:r.back.deltaPct }
          : backFront === "Front" ? { orcado:r.front.orcado, realizado:r.front.realizado, deltaPct:r.front.deltaPct }
          : { orcado:r.orcado, realizado:r.realizado, deltaPct:r.deltaPct }
        return (
          <>
            <div key={r.key} style={{
              display:"grid", gridTemplateColumns:COL,
              background: i % 2 === 0 ? "#FDFBFE" : "#fff",
              borderBottom:"1px solid #F5F0F9",
            }}>
              <div style={{ ...cell, fontWeight:700 }}>{r.key}</div>
              <div style={{ ...cell }}><ORConsumoBar pct={(displayRow.realizado / displayRow.orcado) * 100} /></div>
              <div style={{ ...cell, justifyContent:"flex-end", color:"#737373" }}>{orFmtBRL(displayRow.orcado)}</div>
              <div style={{ ...cell, justifyContent:"flex-end", fontWeight:700 }}>{orFmtBRL(displayRow.realizado)}</div>
              <div style={{ ...cell, justifyContent:"flex-end", color: displayRow.realizado > displayRow.orcado ? "#C81E1E" : "#009966" }}>
                {orFmtSignedBRL(displayRow.realizado - displayRow.orcado)}
              </div>
              <div style={{ ...cell, justifyContent:"flex-end" }}>
                <Pill tone={tonePct(displayRow.deltaPct)}>{orFmtPct(displayRow.deltaPct)}</Pill>
              </div>
              <div style={{ ...cell, justifyContent:"center" }}>
                <button onClick={() => toggle(r.key)} style={{ background:"none", border:"none", cursor:"pointer", color:"#7401C3", padding:2 }}>
                  {isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
            {isExp && backFront === "Ambos" && (
              <>
                {[{ label:"Back", data:r.back }, { label:"Front", data:r.front }].map(sub => (
                  <div key={sub.label} style={{
                    display:"grid", gridTemplateColumns:COL,
                    background:"#FAF7FD", borderBottom:"1px solid #F5F0F9",
                    paddingLeft:16,
                  }}>
                    <div style={{ ...cell, color:"#5A0992", fontWeight:600, fontSize:12 }}>↳ {sub.label}</div>
                    <div style={{ ...cell }}><ORConsumoBar pct={(sub.data.realizado / sub.data.orcado) * 100} /></div>
                    <div style={{ ...cell, justifyContent:"flex-end", color:"#737373", fontSize:12 }}>{orFmtBRL(sub.data.orcado)}</div>
                    <div style={{ ...cell, justifyContent:"flex-end", fontWeight:600, fontSize:12 }}>{orFmtBRL(sub.data.realizado)}</div>
                    <div style={{ ...cell, justifyContent:"flex-end", fontSize:12, color: sub.data.realizado > sub.data.orcado ? "#C81E1E" : "#009966" }}>
                      {orFmtSignedBRL(sub.data.realizado - sub.data.orcado)}
                    </div>
                    <div style={{ ...cell, justifyContent:"flex-end" }}>
                      <Pill tone={tonePct(sub.data.deltaPct)}>{orFmtPct(sub.data.deltaPct)}</Pill>
                    </div>
                    <div />
                  </div>
                ))}
              </>
            )}
          </>
        )
      })}
    </div>
  )
}

function ORDNAView({ dnaT, diretoria, backFront }: {
  dnaT: { orc:number; real:number; back:number; front:number; delta:number; pct:number };
  diretoria: string; backFront: string
}) {
  const desvio = dnaT.pct
  const toneDesvio: ToneKey = desvio <= 0 ? "success" : desvio <= 5 ? "warning" : "danger"
  const bfDisplay = backFront === "Ambos" ? dnaT.real : backFront === "Back" ? dnaT.back : dnaT.front

  const rows = diretoria === "Todas" ? DIRETORIAS_BREAKDOWN : DIRETORIAS_BREAKDOWN.filter(r => r.key === diretoria)
  const sortedRows = [...rows].sort((a, b) => b.realizado - a.realizado)

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Context chips */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={EYEBROW_STYLE}>Recorte</span>
        <span style={{ padding:"3px 10px", borderRadius:999, background:"#EEE6F3", fontSize:12, fontWeight:600, color:"#5A0992" }}>
          Diretoria: {diretoria}
        </span>
        <span style={{ padding:"3px 10px", borderRadius:999, background:"#EEE6F3", fontSize:12, fontWeight:600, color:"#5A0992" }}>
          {backFront}
        </span>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
        <ORKpi eyebrow="Orçado DNA" value={orFmtBRL(dnaT.orc)} delta="Baseline aprovado" tone="info" icon={Building2} />
        <ORKpi eyebrow="Realizado DNA" value={orFmtBRL(dnaT.real)} delta={`${orFmtPct(dnaT.pct)} vs. orçado`} tone={toneDesvio} icon={TrendingUp} />
        <ORKpi eyebrow="Desvio DNA" value={orFmtSignedBRL(dnaT.delta)} delta={`${orFmtPct(dnaT.pct)} do orçado`} tone={toneDesvio} icon={AlertTriangle} />
        <ORKpi eyebrow={`${backFront} · Realizado`} value={orFmtBRL(bfDisplay)} delta={backFront === "Ambos" ? "Back + Front" : `Recorte ${backFront}`} tone="info" icon={Users} />
      </div>

      {/* Hero */}
      <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
        <div style={{ marginBottom:16 }}>
          <div style={EYEBROW_STYLE}>Composição por Diretoria</div>
          <div style={{ fontSize:15, fontWeight:700, color:"#1C0033", marginTop:4 }}>
            Distribuição do realizado DNA
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sortedRows.map(r => {
            const data = backFront === "Back" ? r.back : backFront === "Front" ? r.front : r
            const pct = (data.realizado / dnaT.real) * 100
            return (
              <div key={r.key} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ width:100, fontSize:12, fontWeight:600, color:"#1C0033", flexShrink:0 }}>{r.key}</span>
                <div style={{ flex:1, height:10, borderRadius:5, background:"#F4F0F8", overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"#7401C3", width:`${pct}%`, borderRadius:5, transition:"width 0.4s" }} />
                </div>
                <span style={{ width:90, textAlign:"right", fontSize:12, color:"#737373" }}>
                  {orFmtBRL(data.realizado)} · {pct.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Breakdown table */}
      <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
        <div style={{ marginBottom:16 }}>
          <div style={EYEBROW_STYLE}>Detalhamento</div>
          <div style={{ fontSize:15, fontWeight:700, color:"#1C0033", marginTop:4 }}>Por Diretoria · expansível por Back/Front</div>
        </div>
        <DNABreakdownTable diretoria={diretoria} backFront={backFront} />
      </div>

      {/* Didactic card */}
      <div style={{ ...CARD_STYLE, padding:"20px 22px", background:"#FAF7FD" }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ width:36, height:36, borderRadius:8, background:"#EEE6F3", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Info size={18} color="#7401C3" />
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#1C0033", marginBottom:6 }}>O que é o DNA?</div>
            <p style={{ fontSize:13, color:"#5A0992", lineHeight:1.6, margin:0 }}>
              O <strong>DNA</strong> agrupa os custos do escritório central que presta serviços para as lojas da rede.
              É dividido em <strong>Back</strong> (áreas de suporte: Financeiro, TI, Pessoas) e <strong>Front</strong>
              (áreas voltadas ao negócio: Operações, Comercial, Marketing). O monitoramento do DNA garante que o custo
              de estrutura esteja alinhado ao crescimento da rede.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FiltersDrawer ────────────────────────────────────────────────────────────

type FilterState = {
  loja: string; vertical: string; centroCusto: string
  nivel: string; faixaEtaria: string; cargo: string; diretoria: string
  backFront: string
}
type FilterSetters = {
  setLoja: (v:string)=>void; setVertical: (v:string)=>void; setCentroCusto: (v:string)=>void
  setNivel: (v:string)=>void; setFaixaEtaria: (v:string)=>void; setCargo: (v:string)=>void
  setDiretoria: (v:string)=>void; setBackFront: (v:string)=>void
}

function FiltersDrawer({
  open, onClose, filters, setters, showDiretoria, showBackFront
}: { open:boolean; onClose:()=>void; filters:FilterState; setters:FilterSetters; showDiretoria:boolean; showBackFront:boolean }) {
  const lojas = ["Todas","BRAZ CAMPINAS","BRAZ PAULISTA","ASTOR HIGIENÓPOLIS","BOTECOS PINHEIROS","ICI JARDINS","BRAZ MOEMA","ASTOR ITAIM","CENTRAL MASSAS SP","BOTECOS VILA MADALENA","DELIVERIES SP"]
  const verticais = ["Todas","BRAZ","ASTOR","ICI","BOTECOS","CENTRAL DE MASSAS","DELIVERIES"]
  const centros = ["Todos","COZINHA","SALÃO","BAR","ADMINISTRAÇÃO"]
  const niveis = ["Todos","Estagiário","Analista","Coordenação","Gerência","Diretoria"]
  const faixas = ["Todas","18–25","26–35","36–45","46–55","56+"]
  const cargos = ["Todos","Cozinheiro","Garçom","Barista","Gerente","Coordenador","Analista","Estagiário"]
  const diretorias = ["Todas","Operações","Marketing","Comercial","Financeiro","Pessoas","TI"]

  function SelField({ label, value, onChange, opts }: { label:string; value:string; onChange:(v:string)=>void; opts:string[] }) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <label style={EYEBROW_STYLE}>{label}</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-[360px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-[#EEE6F3]">
          <SheetTitle>Filtros · Orçamento × Real</SheetTitle>
        </SheetHeader>
        <div style={{ display:"flex", flexDirection:"column", gap:16, padding:"20px 0" }}>
          <SelField label="Loja" value={filters.loja} onChange={setters.setLoja} opts={lojas} />
          <SelField label="Vertical" value={filters.vertical} onChange={setters.setVertical} opts={verticais} />
          <SelField label="Centro de custo" value={filters.centroCusto} onChange={setters.setCentroCusto} opts={centros} />
          <Separator />
          <SelField label="Nível" value={filters.nivel} onChange={setters.setNivel} opts={niveis} />
          <SelField label="Cargo" value={filters.cargo} onChange={setters.setCargo} opts={cargos} />
          <SelField label="Faixa etária" value={filters.faixaEtaria} onChange={setters.setFaixaEtaria} opts={faixas} />
          {showDiretoria && <><Separator /><SelField label="Diretoria" value={filters.diretoria} onChange={setters.setDiretoria} opts={diretorias} /></>}
          {showBackFront && <SelField label="Back / Front" value={filters.backFront} onChange={setters.setBackFront} opts={["Ambos","Back","Front"]} />}
        </div>
        <div style={{ paddingTop:8 }}>
          <Button variant="outline" className="w-full" onClick={() => {
            setters.setLoja("Todas"); setters.setVertical("Todas"); setters.setCentroCusto("Todos")
            setters.setNivel("Todos"); setters.setCargo("Todos"); setters.setFaixaEtaria("Todas")
            setters.setDiretoria("Todas"); setters.setBackFront("Ambos")
          }}>Limpar filtros</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Panel = "operacao" | "dna"
type Dimensao = "linhaCusto" | "centroCusto" | "vertical" | "loja" | "nivel"

export default function OrcamentoRealPage() {
  // Filters
  const [loja,         setLoja]         = useState("Todas")
  const [vertical,     setVertical]     = useState("Todas")
  const [centroCusto,  setCentroCusto]  = useState("Todos")
  const [nivel,        setNivel]        = useState("Todos")
  const [faixaEtaria,  setFaixaEtaria]  = useState("Todas")
  const [cargo,        setCargo]        = useState("Todos")
  const [diretoria,    setDiretoria]    = useState("Todas")
  const [periodo,      setPeriodo]      = useState("Mensal")
  // Page state
  const [dimensao,     setDimensao]     = useState<Dimensao>("linhaCusto")
  const [panel,        setPanel]        = useState<Panel>("operacao")
  const [backFront,    setBackFront]    = useState("Ambos")
  const [filtersOpen,  setFiltersOpen]  = useState(false)

  const filters: FilterState = { loja, vertical, centroCusto, nivel, faixaEtaria, cargo, diretoria, backFront }
  const setters: FilterSetters = { setLoja, setVertical, setCentroCusto, setNivel, setFaixaEtaria, setCargo, setDiretoria, setBackFront }

  // budgetMul
  const budgetMul = useMemo(() => {
    const verticalMulMap: Record<string, number> = {
      Todas:1, ASTOR:0.55, BRAZ:0.78, ICI:0.32, BOTECOS:0.46, "CENTRAL DE MASSAS":0.18, DELIVERIES:0.16,
    }
    const verticalMul = verticalMulMap[vertical] ?? 1
    const lojaMul = loja !== "Todas" ? (LOJAS_HEADCOUNT[loja] || 0) / TOTAL_HEADCOUNT : 1
    const geoMul = loja !== "Todas" ? lojaMul : verticalMul
    const centroFrac  = centroCusto !== "Todos" ? CENTRO_HEADCOUNT_PCT[centroCusto] ?? 1 : 1
    const nivelFrac   = nivel !== "Todos"        ? NIVEL_HEADCOUNT_PCT[nivel] ?? 1 : 1
    const headcountMul = centroFrac * nivelFrac
    return geoMul * headcountMul
  }, [loja, vertical, centroCusto, nivel])

  // Derived KPI values
  const m = useMemo(() => {
    const mc = OR_DATA.mesCorrente
    return {
      orcado:    mc.orcado    * budgetMul,
      realizado: mc.realizado * budgetMul,
      desvioPct: mc.desvioPct,
    }
  }, [budgetMul])

  const ytd = useMemo(() => {
    const y = OR_DATA.ytd
    return {
      orcadoAcum:    y.orcadoAcum    * budgetMul,
      realizadoAcum: y.realizadoAcum * budgetMul,
      desvioAcum:    y.desvioAcum    * budgetMul,
      pctDoAno:      y.pctDoAno,
    }
  }, [budgetMul])

  // Scaled serie
  const serieData = useMemo(() =>
    OR_DATA.serie.map(d => ({
      ...d,
      orcado:    d.orcado * budgetMul,
      realizado: d.realizado != null ? d.realizado * budgetMul : null,
    })),
  [budgetMul])

  // Breakdown rows
  const breakdownRows = useMemo((): BreakdownRow[] => {
    const src = OR_DATA[dimensao] as BreakdownRow[]
    return src.map(r => {
      const isNonPerson = /EPI|Uniforme|Refei|Transporte/i.test(r.key)
      const mul = isNonPerson ? Math.sqrt(budgetMul) : budgetMul
      const orcado    = r.orcado    * mul
      const realizado = r.realizado * mul
      return { ...r, orcado, realizado, deltaPct: ((realizado - orcado) / orcado) * 100 }
    })
  }, [dimensao, budgetMul])

  // Heatmap
  const heatmapData = useMemo(() => OR_DATA.heatmap[dimensao], [dimensao])

  // DNA totals
  const dnaT = useMemo(() => {
    const rows = diretoria === "Todas" ? DIRETORIAS_BREAKDOWN : DIRETORIAS_BREAKDOWN.filter(r => r.key === diretoria)
    const sum = (fn: (r: typeof DIRETORIAS_BREAKDOWN[number]) => number) => rows.reduce((a, r) => a + fn(r), 0)
    const orc  = sum(r => r.orcado)
    const real = sum(r => r.realizado)
    const back = sum(r => r.back.realizado)
    const front = sum(r => r.front.realizado)
    const delta = real - orc
    const pct = (delta / orc) * 100
    return { orc, real, back, front, delta, pct }
  }, [diretoria])

  // Active filters
  const activeFilters = [
    loja !== "Todas" && { label:`Loja: ${loja}`, clear:()=>setLoja("Todas") },
    vertical !== "Todas" && { label:`Vertical: ${vertical}`, clear:()=>setVertical("Todas") },
    centroCusto !== "Todos" && { label:`Centro: ${centroCusto}`, clear:()=>setCentroCusto("Todos") },
    nivel !== "Todos" && { label:`Nível: ${nivel}`, clear:()=>setNivel("Todos") },
    cargo !== "Todos" && { label:`Cargo: ${cargo}`, clear:()=>setCargo("Todos") },
    faixaEtaria !== "Todas" && { label:`Faixa: ${faixaEtaria}`, clear:()=>setFaixaEtaria("Todas") },
    panel === "dna" && diretoria !== "Todas" && { label:`Diretoria: ${diretoria}`, clear:()=>setDiretoria("Todas") },
    panel === "dna" && backFront !== "Ambos" && { label:backFront, clear:()=>setBackFront("Ambos") },
  ].filter(Boolean) as { label:string; clear:()=>void }[]

  const toneDesvioMes: ToneKey = m.desvioPct <= 0 ? "success" : m.desvioPct <= 5 ? "warning" : "danger"
  const ytdPct = (ytd.desvioAcum / ytd.orcadoAcum) * 100
  const toneYtd: ToneKey = ytdPct <= 0 ? "success" : ytdPct <= 5 ? "warning" : "danger"

  const DIMENSAO_OPTS: { id: Dimensao; label: string }[] = [
    { id:"linhaCusto",  label:"Linha de Custo" },
    { id:"centroCusto", label:"Centro de Custo" },
    { id:"vertical",    label:"Vertical" },
    { id:"loja",        label:"Loja" },
    { id:"nivel",       label:"Nível" },
  ]

  return (
    <>
      <PageHeader
        title="Orçamento × Real"
        actions={
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mensal">Mensal</SelectItem>
                <SelectItem value="Trimestral">Trimestral</SelectItem>
                <SelectItem value="Anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={14} className="mr-2" />
              Filtros
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">{activeFilters.length}</Badge>
              )}
            </Button>
          </div>
        }
      />

      <div style={{ padding:"24px 32px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
            <span style={EYEBROW_STYLE}>Filtros ativos:</span>
            {activeFilters.map(f => (
              <button key={f.label} onClick={f.clear} style={{
                display:"flex", alignItems:"center", gap:4,
                padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:600,
                background:"#EEE6F3", color:"#5A0992", border:"none", cursor:"pointer",
              }}>
                {f.label}
                <X size={12} />
              </button>
            ))}
          </div>
        )}

        {/* Panel switcher */}
        <div style={{
          display:"inline-flex", background:"#F4F0F8", borderRadius:10, padding:3, gap:2, alignSelf:"flex-start",
        }}>
          {([
            { id:"operacao" as Panel, label:"Operação", sub:"lojas e centros de custo", Icon:Building2 },
            { id:"dna"      as Panel, label:"DNA",       sub:"escritório — serve as lojas", Icon:Users },
          ]).map(t => (
            <button key={t.id} onClick={() => setPanel(t.id)} style={{
              display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:8,
              border:"none", cursor:"pointer", transition:"all 0.15s",
              background: panel === t.id ? "#fff" : "transparent",
              boxShadow: panel === t.id ? "0 1px 4px rgba(60,3,102,0.12)" : "none",
            }}>
              <t.Icon size={16} color={panel === t.id ? "#7401C3" : "#737373"} />
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:13, fontWeight:700, color: panel === t.id ? "#1C0033" : "#737373" }}>{t.label}</div>
                <div style={{ fontSize:10, color:"#737373" }}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {panel === "dna" ? (
          <ORDNAView dnaT={dnaT} diretoria={diretoria} backFront={backFront} />
        ) : (
          <>
            {/* KPI strip */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
              <ORKpi
                eyebrow={`Orçado · ${OR_DATA.mesCorrente.label}`}
                value={orFmtBRL(m.orcado)}
                delta={`+${OR_DATA.mesCorrente.orcadoVsAnt}% vs. mês ant.`}
                tone="info" icon={Building2}
              />
              <ORKpi
                eyebrow="Realizado · Abril"
                value={orFmtBRL(m.realizado)}
                delta={`${orFmtPct(m.desvioPct)} vs. orçado`}
                tone={toneDesvioMes} icon={m.desvioPct > 0 ? TrendingUp : TrendingDown}
              />
              <ORKpi
                eyebrow="Desvio do mês"
                value={orFmtPct(m.desvioPct)}
                delta={`${orFmtPct(OR_DATA.mesCorrente.desvioPp)} p.p. vs. mês ant.`}
                tone={toneDesvioMes} icon={AlertTriangle}
              />
              <ORKpi
                eyebrow="Acumulado YTD"
                value={orFmtBRL(ytd.desvioAcum)}
                delta={`${ytd.pctDoAno}% do ano consumido`}
                tone={toneYtd} icon={CheckCircle}
              />
            </div>

            {/* Hero: AI insights + chart */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.7fr", gap:16 }}>
              {/* AI Insights card (simplified) */}
              <div style={{ ...CARD_STYLE, padding:"20px 22px", background:"linear-gradient(135deg,#FAF7FD 0%,#F0E8FA 100%)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"#7401C3", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Sparkles size={14} color="#fff" />
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:"#1C0033" }}>Análise IA</span>
                </div>
                <p style={{ fontSize:13, color:"#3C0366", lineHeight:1.65, margin:0 }}>
                  <strong>Abril apresenta o maior desvio do ano (+14,7%)</strong>, impulsionado por Horas Extras (+62,5%)
                  e Treinamento (+14,4%). Cozinha concentra 44% do estouro. Recomenda-se revisão do banco de horas de BRAZ Campinas.
                </p>
                <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
                  {["Horas extras acima da meta em 3 lojas BRAZ","Administração com +37,5% — investigar hora extra gerencial","BOTECOS com maior crescimento YTD de desvio"].map(item => (
                    <div key={item} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:"#7401C3", flexShrink:0, marginTop:5 }} />
                      <span style={{ fontSize:12, color:"#5A0992", lineHeight:1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Chart */}
              <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={EYEBROW_STYLE}>Evolução mensal · 2026</div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#1C0033", marginTop:4 }}>Orçado vs. Realizado</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:4, background:"#F4F0F8", borderRadius:8, padding:"4px 8px" }}>
                    <Sparkles size={12} color="#7401C3" />
                    <span style={{ fontSize:11, color:"#7401C3", fontWeight:600 }}>IA ativa</span>
                  </div>
                </div>
                <ORDualLineChart data={serieData as any} currentIdx={OR_CURRENT_MONTH_IDX} />
              </div>
            </div>

            {/* Breakdown table */}
            <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={EYEBROW_STYLE}>Detalhamento por dimensão</div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#1C0033", marginTop:4 }}>Consumo orçamentário</div>
                </div>
                {/* Dimensao segmented */}
                <div style={{ display:"flex", background:"#F4F0F8", borderRadius:8, padding:3, gap:2 }}>
                  {DIMENSAO_OPTS.map(opt => (
                    <button key={opt.id} onClick={() => setDimensao(opt.id)} style={{
                      padding:"5px 12px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                      background: dimensao === opt.id ? "#fff" : "transparent",
                      color: dimensao === opt.id ? "#1C0033" : "#737373",
                      boxShadow: dimensao === opt.id ? "0 1px 3px rgba(60,3,102,0.1)" : "none",
                      transition:"all 0.15s",
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <ORBreakdownTable rows={breakdownRows} />
            </div>

            {/* Heatmap */}
            <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
              <div style={{ marginBottom:16 }}>
                <div style={EYEBROW_STYLE}>Desvio mensal acumulado</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#1C0033", marginTop:4 }}>
                  Heatmap de desvio (%) · {DIMENSAO_OPTS.find(o => o.id === dimensao)?.label}
                </div>
              </div>
              <ORDesvioHeatmap
                rows={heatmapData.rows}
                data={heatmapData.data as (number|null)[][]}
                currentIdx={OR_CURRENT_MONTH_IDX}
              />
            </div>

            {/* Fornecedores */}
            <FornecedoresModulo />

            {/* Top 5 */}
            <div style={{ ...CARD_STYLE, padding:"20px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={EYEBROW_STYLE}>Ranking de desvio</div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#1C0033", marginTop:4 }}>Top 5 · Maior desvio do mês</div>
                </div>
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <ORTopTable rows={OR_DATA.top} />
            </div>

            {/* Projeção */}
            <ORProjecaoCard />
          </>
        )}
      </div>

      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setters={setters}
        showDiretoria={panel === "dna"}
        showBackFront={panel === "dna"}
      />
    </>
  )
}
