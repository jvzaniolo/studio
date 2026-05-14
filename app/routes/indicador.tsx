import type { ColumnDef } from "@tanstack/react-table"
import { EyeOff, Filter, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import { DataTable } from "~/components/ui/data-table"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { cn } from "~/lib/utils"

const periods = [
  { key: "jul-2020", label: "Jul | 2020", date: "2020-07-01" },
  { key: "fev-2021", label: "Fev | 2021", date: "2021-02-01" },
  { key: "ago-2021", label: "Ago | 2021", date: "2021-08-01" },
  { key: "mar-2023", label: "Mar | 2023", date: "2023-03-01" },
  { key: "jun-2023", label: "Jun | 2023", date: "2023-06-01" },
  { key: "jun-2024", label: "Jun | 2024", date: "2024-06-01" },
  { key: "set-2025", label: "Set | 2025", date: "2025-09-04" },
]

const indexSeries = [
  { date: new Date("2020-07-01").getTime(), value: 87 },
  { date: new Date("2021-02-01").getTime(), value: 87 },
  { date: new Date("2021-08-01").getTime(), value: 83 },
  { date: new Date("2023-03-01").getTime(), value: 87 },
  { date: new Date("2023-06-01").getTime(), value: 88 },
  { date: new Date("2024-06-01").getTime(), value: 87 },
  { date: new Date("2025-09-04").getTime(), value: 79 },
]

const yearTicks = [2020, 2021, 2023, 2024, 2025].map((y) =>
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
  { name: "Índice de Bem-Estar", values: [87, 87, 83, 87, 88, 87, 79] },
  { name: "Segurança Psicológica", values: [null, null, 89, 90, 91, 95, 92] },
  {
    name: "Valorização Profissional",
    values: [null, null, null, null, 86, 85, 90],
  },
  { name: "Saúde Física", values: [null, null, null, null, null, null, 44] },
  { name: "Saúde Mental", values: [null, null, null, null, null, null, 76] },
  { name: "Confiança", values: [null, null, null, null, null, null, 92] },
])

const demographicRows = toRows([
  { name: "Entre 20 e 29 anos", values: [null, null, 83, 85, 86, 86, 73] },
  {
    name: "Entre 30 e 39 anos",
    values: [null, null, "hidden", 83, 95, 87, 83],
  },
])

const priorities = [
  { rank: 1, name: "Benefícios", value: 100 },
  { rank: 2, name: "Remuneração", value: 78 },
  { rank: 3, name: "Retenção de talentos", value: 50 },
  { rank: 4, name: "Rotatividade", value: 50 },
  { rank: 5, name: "Diversidade", value: 28 },
  { rank: 6, name: "Plano de Carreira", value: 27 },
  { rank: 7, name: "Coerência", value: 26 },
  { rank: 8, name: "Clima Organizacional", value: 25 },
  { rank: 9, name: "Relacionamento interpessoal", value: 25 },
  { rank: 10, name: "Qualificação dos líderes", value: 25 },
].map((p) => ({ ...p, label: `${p.rank}. ${p.name}` }))

const matrix = [
  { rank: 1, sentiment: -45, frequency: 4 },
  { rank: 2, sentiment: -78, frequency: 3 },
  { rank: 3, sentiment: -65, frequency: 2 },
  { rank: 4, sentiment: -55, frequency: 2 },
  { rank: 5, sentiment: -95, frequency: 0.25 },
  { rank: 6, sentiment: -70, frequency: 0.18 },
  { rank: 7, sentiment: -55, frequency: 0.25 },
  { rank: 8, sentiment: 30, frequency: 0.25 },
  { rank: 9, sentiment: 50, frequency: 0.25 },
  { rank: 10, sentiment: 60, frequency: 0.25 },
]

const indexChartConfig = {
  value: { label: "Bem-Estar", color: "var(--chart-4)" },
} satisfies ChartConfig

const priorityChartConfig = {
  value: { label: "Prioridade", color: "var(--chart-3)" },
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

function periodCellClass(value: CellValue) {
  if (value === null) return "text-right text-muted-foreground last:pr-6"
  if (value === "hidden") return "bg-muted/40 last:pr-6"
  return cn("text-right font-medium last:pr-6", heatmapClass(value))
}

const periodColumns: ColumnDef<IndicatorRow, CellValue>[] = periods.map(
  (p) => ({
    accessorKey: p.key,
    header: p.label,
    cell: ({ getValue }) => <HeatContent value={getValue()} />,
    meta: {
      headClassName: "text-right last:pr-6",
      getCellClassName: periodCellClass,
    },
  })
)

const indicatorColumns: ColumnDef<IndicatorRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Indicador",
    meta: {
      className: "pl-6 font-medium",
      headClassName: "pl-6",
    },
  },
  ...(periodColumns as ColumnDef<IndicatorRow, unknown>[]),
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
  { value: "bem-estar", label: "Índice de Bem-Estar" },
  { value: "seg-psi", label: "Segurança Psicológica" },
  { value: "confianca", label: "Confiança" },
]

const criterioOptions = [
  { value: "faixa-etaria", label: "Faixa etária" },
  { value: "genero", label: "Gênero" },
  { value: "area", label: "Área" },
  { value: "tempo-casa", label: "Tempo de casa" },
]

const generoOptions = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao-binario", label: "Não-binário" },
  { value: "outro", label: "Outro" },
  { value: "nao-informado", label: "Prefere não informar" },
]

const escolaridadeOptions = [
  { value: "fundamental", label: "Ensino Fundamental" },
  { value: "medio", label: "Ensino Médio" },
  { value: "tecnico", label: "Ensino Técnico" },
  { value: "superior-incompleto", label: "Superior Incompleto" },
  { value: "superior", label: "Superior Completo" },
  { value: "pos", label: "Pós-graduação" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
]

const tempoContribuicaoOptions = [
  { value: "ate-1", label: "Até 1 ano" },
  { value: "1-3", label: "Entre 1 e 3 anos" },
  { value: "3-5", label: "Entre 3 e 5 anos" },
  { value: "5-10", label: "Entre 5 e 10 anos" },
  { value: "10+", label: "Mais de 10 anos" },
]

const unidadeOptions = [
  { value: "matriz", label: "Matriz" },
  { value: "filial-sp", label: "Filial São Paulo" },
  { value: "filial-rj", label: "Filial Rio de Janeiro" },
  { value: "filial-bh", label: "Filial Belo Horizonte" },
  { value: "filial-poa", label: "Filial Porto Alegre" },
  { value: "remoto", label: "Remoto" },
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
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          className="w-full"
          showClear
        />
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
              id="filtro-escolaridade"
              label="Escolaridade"
              placeholder="Todas"
              items={escolaridadeOptions}
            />
            <FilterField
              id="filtro-tempo"
              label="Tempo de contribuição"
              placeholder="Todos"
              items={tempoContribuicaoOptions}
            />
            <FilterField
              id="filtro-unidade"
              label="Unidade"
              placeholder="Todas"
              items={unidadeOptions}
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
      <Select defaultValue="set-2025" items={periodOptions}>
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

export default function IndicadorPage() {
  return (
    <>
      <PageHeader title="Bem-Estar" actions={<HeaderActions />} />

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
                      indicador de Bem-Estar avalia a percepção dos
                      colaboradores sobre sua saúde física, mental, segurança
                      geral e qualidade do ambiente de trabalho.
                    </p>
                    <p>
                      <strong className="font-semibold">Tendência:</strong> O
                      valor atual de 79% aponta um recuo de 8 pontos percentuais
                      em relação à última medição, posicionando o resultado na
                      zona de{" "}
                      <strong className="font-semibold">Aperfeiçoamento</strong>
                      .
                    </p>
                    <p>
                      <strong className="font-semibold">
                        Análise Técnica:
                      </strong>{" "}
                      Os dados sugerem uma forte dualidade na percepção do time.
                      Por um lado, o bem-estar é sustentado por componentes
                      relacionais de excelência, com destaque para Confiança
                      (92%), Segurança Psicológica (92%) e Valorização
                      Profissional (90%). Respondentes relatam de forma
                      expressiva que a autonomia, a flexibilidade, a escuta
                      ativa e o clima de colaboração são forças sólidas da
                      operação. Por outro lado, a queda no indicador global é
                      diretamente explicada pelo recuo severo no subindicador de
                      Saúde Física (44%). Cruzando essa métrica com a matriz de
                      prioridades, observa-se que Benefícios e Remuneração
                      concentram a maior frequência de comentários negativos,
                      indicando que o tema requer ação imediata da liderança.
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
              <CardTitle>Índice de Bem-Estar</CardTitle>
              <CardDescription>
                Evolução da percepção dos stakeholders sobre o bem-estar na
                organização
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
          <KpiCard label="Resultado do índice" value="79,0%" />
          <KpiCard label="População de stakeholders" value="13" />
          <KpiCard label="Stakeholders respondentes" value="13" />
          <KpiCard label="Comentários válidos realizados" value="45" />
        </div>

        {/* Tabela: Indicadores que compõem */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores que compõem o Índice de Bem-Estar</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable columns={indicatorColumns} data={indicatorRows} />
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
                <Select defaultValue="bem-estar" items={indicadorOptions}>
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
                <Select defaultValue="faixa-etaria" items={criterioOptions}>
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

            <DataTable columns={indicatorColumns} data={demographicRows} />
          </CardContent>
        </Card>

        {/* Linha final: IA Prioridades + IA Matriz */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                IA Prioridades
              </CardTitle>
              <CardDescription>
                Temas mais prioritários para a melhoria dos resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={priorityChartConfig}
                className="aspect-auto h-105 w-full"
              >
                <BarChart
                  data={priorities}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <XAxis type="number" hide domain={[0, 110]} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={170}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "var(--muted-foreground)",
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.name ?? ""
                        }
                        valueFormatter={(value) => `${value}%`}
                      />
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      className="fill-muted-foreground text-xs"
                      formatter={(v) => `${v}%`}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                IA Matriz de Prioridades
              </CardTitle>
              <CardDescription>
                Análise de criticidade para apoiar a priorização dos temas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={matrixChartConfig}
                className="aspect-auto h-105 w-full"
              >
                <ScatterChart
                  margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
                >
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
                                style={{
                                  backgroundColor: `var(--color-${key})`,
                                }}
                              />
                              <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                                <span className="text-muted-foreground">
                                  {label}
                                </span>
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
            </CardContent>
          </Card>
        </div>
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
          Período: 4 de set. de 2025
        </Badge>
      </CardContent>
    </Card>
  )
}
