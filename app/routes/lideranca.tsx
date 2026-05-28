import { useState } from "react"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { EyeOff, Filter, Frown, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts"

import { PageHeader } from "~/components/page-header"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/ui/combobox"
import { DataTable, DataTableColumnHeader } from "~/components/data-table"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { TableCell } from "~/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { cn } from "~/lib/utils"

const periods = [
  { key: "jan-2023", label: "Jan | 2023", date: "2023-01-01" },
  { key: "jun-2023", label: "Jun | 2023", date: "2023-06-01" },
  { key: "jan-2024", label: "Jan | 2024", date: "2024-01-01" },
  { key: "jun-2024", label: "Jun | 2024", date: "2024-06-01" },
]

const indexSeries = [
  { date: new Date("2023-01-01").getTime(), value: 74 },
  { date: new Date("2023-06-01").getTime(), value: 78 },
  { date: new Date("2024-01-01").getTime(), value: 75 },
  { date: new Date("2024-06-01").getTime(), value: 81 },
]

const yearTicks = [2023, 2024].map((y) =>
  new Date(`${y}-06-01`).getTime()
)

type CellValue = number | null | "hidden"
type IndicatorRow = { name: string } & Record<string, CellValue | string>

function toRows(rows: { name: string; values: CellValue[] }[]): IndicatorRow[] {
  return rows.map((row) => ({
    name: row.name,
    ...Object.fromEntries(periods.map((p, i) => [p.key, row.values[i]])),
  }))
}

const indicatorRows = toRows([
  { name: "Índice de Liderança", values: [74, 78, 75, 81] },
  { name: "Comunicação", values: [null, 80, 79, 85] },
  { name: "Visão Estratégica", values: [null, 72, 74, 78] },
  { name: "Desenvolvimento de Equipe", values: [null, null, 68, 75] },
])

const demographicRows = toRows([
  { name: "Líderes diretos", values: [76, 81, 79, 85] },
  { name: "Líderes sênior", values: [null, 74, 71, "hidden"] },
])

const priorities = [
  { rank: 1, name: "Feedback estruturado", value: 82 },
  { rank: 2, name: "Desenvolvimento de equipe", value: 61 },
].map((p) => ({ ...p, label: `${p.rank}. ${p.name}` }))

const matrix = [
  { rank: 1, sentiment: -58, frequency: 3.5 },
  { rank: 2, sentiment: -42, frequency: 2.1 },
]

const indexChartConfig = {
  value: { label: "Liderança", color: "var(--chart-4)" },
} satisfies ChartConfig

const matrixChartConfig = {
  sentiment: { label: "Sentimento", color: "var(--chart-1)" },
  frequency: { label: "Frequência", color: "var(--chart-2)" },
} satisfies ChartConfig

function formatPercent(value: number) {
  return `${value.toString().replace(".", ",")},0%`
}

function heatmapClass(value: CellValue) {
  if (value === null || value === "hidden") return ""
  if (value >= 95) return "bg-emerald-500/45 text-emerald-950"
  if (value >= 90) return "bg-emerald-500/30 text-emerald-950"
  if (value >= 85) return "bg-emerald-500/18 text-emerald-950"
  if (value >= 78) return "bg-emerald-500/10 text-foreground"
  if (value >= 70) return "bg-amber-400/25 text-amber-950"
  if (value >= 50) return "bg-orange-500/30 text-orange-950"
  return "bg-red-600 text-white"
}

function HeatContent({ value }: { value: CellValue }) {
  if (value === null) {
    return <span className="text-muted-foreground">-</span>
  }
  if (value === "hidden") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <EyeOff className="size-3.5" />
              Ocultado
            </span>
          }
        />
        <TooltipContent>
          Valor ocultado para preservar a privacidade dos respondentes
        </TooltipContent>
      </Tooltip>
    )
  }
  return <>{formatPercent(value)}</>
}

const columnHelper = createColumnHelper<IndicatorRow>()

const indicatorColumns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Indicador" />
    ),
    cell: (info) => <TableCell>{info.getValue() as string}</TableCell>,
  }),
  ...periods.map((p) =>
    columnHelper.accessor((row) => row[p.key] as CellValue, {
      id: p.key,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={p.label} align="right" />
      ),
      cell: (info) => {
        const value = info.getValue()
        if (value === null) {
          return (
            <TableCell align="right" className="text-muted-foreground last:pr-6">
              -
            </TableCell>
          )
        }
        if (value === "hidden") {
          return (
            <TableCell align="right" className="bg-muted/40 last:pr-6">
              <HeatContent value={value} />
            </TableCell>
          )
        }
        return (
          <TableCell
            align="right"
            className={cn("font-medium tabular-nums last:pr-6", heatmapClass(value))}
          >
            <HeatContent value={value} />
          </TableCell>
        )
      },
    })
  ),
]

function NumberedDot({
  cx,
  cy,
  payload,
}: {
  cx?: number
  cy?: number
  payload?: { rank: number }
}) {
  if (cx === undefined || cy === undefined || !payload) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} className="fill-primary" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-primary-foreground text-[11px] font-semibold"
      >
        {payload.rank}
      </text>
    </g>
  )
}

const calcOptions = [
  { value: "media", label: "Média" },
  { value: "nps", label: "NPS" },
  { value: "nps-norm", label: "NPS normalizado" },
]

const periodOptions = periods
  .slice()
  .reverse()
  .map((p) => ({ value: p.key, label: p.label.replace(" | ", ", ") }))

const indicadorOptions = [
  { value: "lideranca", label: "Índice de Liderança" },
  { value: "comunicacao", label: "Comunicação" },
  { value: "visao", label: "Visão Estratégica" },
]

const criterioOptions = [
  { value: "nivel", label: "Nível hierárquico" },
  { value: "area", label: "Área" },
  { value: "genero", label: "Gênero" },
  { value: "tempo-casa", label: "Tempo de casa" },
]

const generoOptions = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao-binario", label: "Não-binário" },
  { value: "outro", label: "Outro" },
  { value: "nao-informado", label: "Prefere não informar" },
]

const nivelOptions = [
  { value: "c-level", label: "C-Level" },
  { value: "diretor", label: "Diretor" },
  { value: "gerente", label: "Gerente" },
  { value: "coordenador", label: "Coordenador" },
  { value: "lider", label: "Líder de Equipe" },
]

const areaOptions = [
  { value: "tecnologia", label: "Tecnologia" },
  { value: "pessoas", label: "Pessoas & Cultura" },
  { value: "comercial", label: "Comercial" },
  { value: "operacoes", label: "Operações" },
  { value: "financeiro", label: "Financeiro" },
]

const tempoContribuicaoOptions = [
  { value: "ate-1", label: "Até 1 ano" },
  { value: "1-3", label: "Entre 1 e 3 anos" },
  { value: "3-5", label: "Entre 3 e 5 anos" },
  { value: "5-10", label: "Entre 5 e 10 anos" },
  { value: "10+", label: "Mais de 10 anos" },
]

type FilterFieldProps = {
  id: string
  label: string
  placeholder: string
  items: { value: string; label: string }[]
}

function FilterField({ id, label, placeholder, items }: FilterFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Combobox items={items}>
        <ComboboxInput id={id} placeholder={placeholder} className="w-full" showClear />
        <ComboboxContent>
          <ComboboxEmpty>Nenhum resultado encontrado.</ComboboxEmpty>
          <ComboboxList>
            {(item: { value: string; label: string }) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}

function FiltersSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <Filter data-icon="inline-start" />
            Filtros
          </Button>
        }
      />
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Refine os resultados por critérios demográficos.
          </SheetDescription>
        </SheetHeader>
        <form className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <FilterField
              id="filtro-genero"
              label="Gênero"
              placeholder="Todos"
              items={generoOptions}
            />
            <FilterField
              id="filtro-nivel"
              label="Nível hierárquico"
              placeholder="Todos"
              items={nivelOptions}
            />
            <FilterField
              id="filtro-area"
              label="Área"
              placeholder="Todas"
              items={areaOptions}
            />
            <FilterField
              id="filtro-tempo"
              label="Tempo de contribuição"
              placeholder="Todos"
              items={tempoContribuicaoOptions}
            />
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function HeaderActions() {
  return (
    <>
      <Select defaultValue="media" items={calcOptions}>
        <SelectTrigger className="min-w-40" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {calcOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select defaultValue="jun-2024" items={periodOptions}>
        <SelectTrigger className="min-w-40" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {periodOptions.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FiltersSheet />
    </>
  )
}

export default function LiderancaPage() {
  const [iaPrioridadesTab, setIaPrioridadesTab] = useState<"grafico" | "matriz">("grafico")

  const indicatorTable = useReactTable({
    data: indicatorRows,
    columns: indicatorColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const demographicTable = useReactTable({
    data: demographicRows,
    columns: indicatorColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <PageHeader title="Liderança" actions={<HeaderActions />} />

      <div className="container mx-auto flex flex-col gap-4 p-4 md:p-6">
        {/* Linha 1: AI Insights + Gráfico do índice */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="relative overflow-hidden bg-linear-to-br from-primary/8 via-card to-card ring-1 ring-primary/20 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Insights
              </CardTitle>
              <CardDescription>
                Recurso experimental com inteligência artificial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sintese">
                <TabsList variant="line">
                  <TabsTrigger value="sintese">Síntese</TabsTrigger>
                  <TabsTrigger value="prioridades">Prioridades</TabsTrigger>
                </TabsList>
                <TabsContent value="sintese" className="pt-4">
                  <div className="max-h-72 space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed text-foreground/90">
                    <p>
                      <strong className="font-semibold">Contexto:</strong> O
                      indicador de Liderança avalia a percepção das equipes
                      sobre a qualidade da liderança exercida, abrangendo
                      comunicação, visão estratégica e desenvolvimento de pessoas.
                    </p>
                    <p>
                      <strong className="font-semibold">Tendência:</strong> O
                      resultado atual de 81% representa uma evolução consistente
                      desde o início da medição, com crescimento de 7 pontos
                      percentuais ao longo dos quatro ciclos avaliados.
                    </p>
                    <p>
                      <strong className="font-semibold">
                        Análise Técnica:
                      </strong>{" "}
                      Os dados apontam avanços expressivos em Comunicação (85%)
                      e Visão Estratégica (78%), indicando que os líderes têm
                      conseguido transmitir clareza de direção e engajar suas
                      equipes. No entanto, o Desenvolvimento de Equipe (75%)
                      ainda apresenta espaço significativo de melhoria. A matriz
                      de prioridades indica que Feedback estruturado concentra
                      alta frequência de comentários negativos, sugerindo que
                      práticas de devolutiva ainda não estão consolidadas como
                      rotina de gestão.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="prioridades" className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Veja a aba lateral de IA Prioridades para detalhes dos temas
                    mais críticos.
                  </p>
                </TabsContent>
              </Tabs>
              <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span>Esta informação foi útil?</span>
                <Button variant="ghost" size="icon-xs">
                  <ThumbsUp />
                </Button>
                <Button variant="ghost" size="icon-xs">
                  <ThumbsDown />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Índice de Liderança</CardTitle>
              <CardDescription>
                Evolução da percepção das equipes sobre a liderança na organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={indexChartConfig}
                className="aspect-auto h-72 w-full"
              >
                <LineChart
                  data={indexSeries}
                  margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    ticks={yearTicks}
                    tickFormatter={(t) => new Date(t).getFullYear().toString()}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v},0%`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <ReferenceLine
                    y={90}
                    stroke="oklch(0.78 0.13 220)"
                    strokeDasharray="6 4"
                  />
                  <ReferenceLine
                    y={65}
                    stroke="oklch(0.75 0.16 60)"
                    strokeDasharray="6 4"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => {
                          const ts = payload?.[0]?.payload?.date
                          if (!ts) return ""
                          const d = new Date(ts)
                          return d.toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "numeric",
                          })
                        }}
                        valueFormatter={(value) => `${value}%`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--color-value)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Linha 2: KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Resultado do índice" value="81,0%" />
          <KpiCard label="Líderes avaliados" value="18" />
          <KpiCard label="Líderes respondentes" value="16" />
          <KpiCard label="Comentários válidos realizados" value="28" />
        </div>

        {/* Tabela: Indicadores que compõem */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores que compõem o Índice de Liderança</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable table={indicatorTable} />
          </CardContent>
        </Card>

        {/* Visão comparativa por critério demográfico */}
        <Card>
          <CardHeader>
            <CardTitle>Visão comparativa por critério demográfico</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-0">
            <FieldGroup className="grid grid-cols-1 gap-4 sm:max-w-xl sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="indicador-select">Indicador</FieldLabel>
                <Select defaultValue="lideranca" items={indicadorOptions}>
                  <SelectTrigger id="indicador-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {indicadorOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="criterio-select">
                  Critério demográfico
                </FieldLabel>
                <Select defaultValue="nivel" items={criterioOptions}>
                  <SelectTrigger id="criterio-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {criterioOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <DataTable table={demographicTable} />
          </CardContent>
        </Card>

        {/* IA Prioridades — layout em colunas fixas com tabs */}
        <Card>
          <Tabs
            defaultValue="grafico"
            onValueChange={(v) => setIaPrioridadesTab(v as "grafico" | "matriz")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  IA Prioridades
                </CardTitle>
                <CardDescription>
                  {iaPrioridadesTab === "grafico"
                    ? "Temas prioritários para a melhoria dos resultados"
                    : "Análise de criticidade: Sentimentos x Frequência"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Visualizar</span>
                <TabsList variant="line">
                  <TabsTrigger value="grafico">Gráfico</TabsTrigger>
                  <TabsTrigger value="matriz">Matriz</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <TabsContent value="grafico" className="pt-4">
                <div className="flex flex-col gap-2">
                  {priorities.map((item) => (
                    <div key={item.rank} className="flex items-center gap-4">
                      <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {item.rank}
                      </span>
                      <span className="w-[180px] shrink-0 truncate text-xs text-muted-foreground">
                        {item.name}
                      </span>
                      <div className="relative h-[30px] flex-1 max-w-[820px]">
                        <div
                          className="absolute inset-y-0 left-0 rounded bg-muted"
                          style={{ width: `${(100 / 110) * 100}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded bg-primary"
                          style={{ width: `${(item.value / 110) * 100}%` }}
                        />
                        <span
                          className="absolute inset-y-0 flex items-center text-xs tabular-nums text-muted-foreground"
                          style={{ left: `calc(${(100 / 110) * 100}% + 8px)` }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="matriz" className="pt-4">
                <ChartContainer
                  config={matrixChartConfig}
                  className="aspect-auto h-105 w-full"
                >
                  <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="sentiment"
                      domain={[-100, 100]}
                      ticks={[-100, 0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tickLine={false}
                      label={{
                        value: "Sentimento",
                        position: "insideBottom",
                        offset: -16,
                        fill: "var(--muted-foreground)",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="frequency"
                      domain={[0, 4]}
                      ticks={[0, 2, 4]}
                      tickLine={false}
                      label={{
                        value: "Frequência de comentários",
                        angle: -90,
                        position: "insideLeft",
                        offset: 12,
                        fill: "var(--muted-foreground)",
                        fontSize: 12,
                      }}
                    />
                    <ChartTooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_, payload) => {
                            const rank = payload?.[0]?.payload?.rank
                            const item = priorities.find((p) => p.rank === rank)
                            return item ? `${rank}. ${item.name}` : ""
                          }}
                          formatter={(value, name, item) => {
                            const key = String(item.dataKey ?? name)
                            const label =
                              matrixChartConfig[
                                key as keyof typeof matrixChartConfig
                              ]?.label ?? name
                            return (
                              <>
                                <div
                                  className="size-2.5 shrink-0 rounded-xs"
                                  style={{ backgroundColor: `var(--color-${key})` }}
                                />
                                <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                                  <span className="text-muted-foreground">{label}</span>
                                  <span className="font-mono font-medium text-foreground tabular-nums">
                                    {value}%
                                  </span>
                                </div>
                              </>
                            )
                          }}
                        />
                      }
                    />
                    <Scatter data={matrix} shape={NumberedDot} />
                  </ScatterChart>
                </ChartContainer>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        {/* IA Prioridades — sem dados */}
        <Card>
          <Tabs defaultValue="grafico">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  IA Prioridades
                </CardTitle>
                <CardDescription>
                  Temas prioritários para a melhoria dos resultados
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Visualizar</span>
                <TabsList variant="line">
                  <TabsTrigger value="grafico">Gráfico</TabsTrigger>
                  <TabsTrigger value="matriz">Matriz</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <TabsContent value="grafico" className="pt-4">
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                  <Frown className="size-8 stroke-[1.5]" />
                  <span className="text-sm">Não temos dados a mostrar para essa variação</span>
                </div>
              </TabsContent>
              <TabsContent value="matriz" className="pt-4">
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                  <Frown className="size-8 stroke-[1.5]" />
                  <span className="text-sm">Não temos dados a mostrar para essa variação</span>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* FAB de IA */}
      <button
        type="button"
        aria-label="Abrir assistente de IA"
        className="fixed right-6 bottom-6 z-20 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 transition hover:bg-primary/90"
      >
        <Sparkles className="size-5" />
      </button>
    </>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardDescription className="text-xs">{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="font-heading text-3xl font-semibold tracking-tight">
          {value}
        </div>
        <Badge variant="secondary" className="font-normal">
          Período: Jun, 2024
        </Badge>
      </CardContent>
    </Card>
  )
}
