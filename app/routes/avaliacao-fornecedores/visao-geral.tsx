import { useMemo, useState } from "react"
import { Leaf, Shield, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Link } from "react-router"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { organizacoes, questoes } from "~/data/avaliacao-fornecedores"
import { PageHeader } from "~/components/page-header"
import { Badge } from "~/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import {
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { cn } from "~/lib/utils"

type Tema = "Ambiental" | "Social" | "Governança"

const temas: Tema[] = ["Ambiental", "Social", "Governança"]

const respondidosOrgs = organizacoes.filter((o) => o.status === "respondido")

function getNonAMax(q: (typeof questoes)[number]) {
  return q.alternativas.filter((a) => a.letra !== "A").length
}

function getNonACount(
  org: (typeof organizacoes)[number],
  q: (typeof questoes)[number],
) {
  return (org.respostas[q.id] ?? []).filter((r) => r !== "A").length
}

function orgPillarScore(
  org: (typeof organizacoes)[number],
  tema: Tema,
): number {
  const temaQs = questoes.filter((q) => q.tema === tema)
  const sum = temaQs.reduce((s, q) => {
    const max = getNonAMax(q)
    return s + (max > 0 ? getNonACount(org, q) / max : 0)
  }, 0)
  return Math.round((sum / temaQs.length) * 100)
}

const esgRatingConfig = [
  { min: 80, label: "A", className: "bg-green-50 text-green-700 border-green-200" },
  { min: 60, label: "B", className: "bg-blue-50 text-blue-700 border-blue-200" },
  { min: 20, label: "C", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { min: 0,  label: "D", className: "bg-red-50 text-red-700 border-red-200" },
]

function getEsgRating(score: number) {
  return esgRatingConfig.find((r) => score >= r.min) ?? esgRatingConfig[esgRatingConfig.length - 1]
}

function orgTotalScore(org: (typeof organizacoes)[number]): number {
  return Math.round(
    temas.reduce((s, t) => s + orgPillarScore(org, t), 0) / temas.length,
  )
}

function pillarAvgScore(tema: Tema): number {
  if (respondidosOrgs.length === 0) return 0
  return Math.round(
    respondidosOrgs.reduce((s, org) => s + orgPillarScore(org, tema), 0) /
      respondidosOrgs.length,
  )
}

const questionRates = questoes.map((q) => {
  const max = getNonAMax(q)
  const rate =
    max === 0 || respondidosOrgs.length === 0
      ? 0
      : respondidosOrgs.reduce((s, org) => s + getNonACount(org, q) / max, 0) /
        respondidosOrgs.length
  return {
    id: q.id,
    texto: q.texto,
    tema: q.tema as Tema,
    rate: Math.round(rate * 100),
  }
})

const topQuestions = [...questionRates].sort((a, b) => b.rate - a.rate).slice(0, 5)
const bottomQuestions = [...questionRates].sort((a, b) => a.rate - b.rate).slice(0, 5)

const orgsByScore = respondidosOrgs
  .map((org) => ({ org, total: orgTotalScore(org), rating: getEsgRating(orgTotalScore(org)) }))
  .sort((a, b) => b.total - a.total)

const pillarConfig: Record<
  Tema,
  {
    Icon: React.ComponentType<{ className?: string }>
    textClass: string
    borderClass: string
    barClass: string
  }
> = {
  Ambiental: {
    Icon: Leaf,
    textClass: "text-green-600",
    borderClass: "border-l-green-600",
    barClass: "bg-green-500",
  },
  Social: {
    Icon: Users,
    textClass: "text-blue-600",
    borderClass: "border-l-blue-600",
    barClass: "bg-blue-500",
  },
  Governança: {
    Icon: Shield,
    textClass: "text-purple-600",
    borderClass: "border-l-purple-600",
    barClass: "bg-purple-500",
  },
}

const temaBadgeClass: Record<Tema, string> = {
  Ambiental: "bg-green-50 text-green-700 border-green-200",
  Social: "bg-blue-50 text-blue-700 border-blue-200",
  Governança: "bg-purple-50 text-purple-700 border-purple-200",
}

const temaTextClass: Record<Tema, string> = {
  Ambiental: "text-green-600",
  Social: "text-blue-600",
  Governança: "text-purple-600",
}

export default function VisaoGeralPage() {
  const [orgAId, setOrgAId] = useState(respondidosOrgs[0]?.id ?? "")
  const [orgBId, setOrgBId] = useState(respondidosOrgs[1]?.id ?? "")

  const orgA = respondidosOrgs.find((o) => o.id === orgAId)
  const orgB = respondidosOrgs.find((o) => o.id === orgBId)

  const comparisonData = temas.map((tema) => ({
    tema,
    a: orgA ? orgPillarScore(orgA, tema) : 0,
    b: orgB ? orgPillarScore(orgB, tema) : 0,
  }))

  const comparisonChartConfig: ChartConfig = useMemo(
    () => ({
      a: {
        label: orgA?.nome.split(" ")[0] ?? "Fornecedor A",
        color: "#7c3aed",
      },
      b: {
        label: orgB?.nome.split(" ")[0] ?? "Fornecedor B",
        color: "#06b6d4",
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgA?.nome, orgB?.nome],
  )

  return (
    <div className="flex flex-col">
      <PageHeader title="Visão Geral" />

      <div className="flex flex-col gap-6 p-6">
        {/* Pillar score cards */}
        <div className="grid grid-cols-3 gap-4">
          {temas.map((tema) => {
            const { Icon, textClass, borderClass, barClass } = pillarConfig[tema]
            const score = pillarAvgScore(tema)
            const count = questoes.filter((q) => q.tema === tema).length
            return (
              <Card key={tema} className={cn("border-l-4", borderClass)}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className={cn("size-4", textClass)} />
                    {tema}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{score}%</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {count} questões · média de adoção
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", barClass)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Comparison + side cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Comparison — spans 2 columns */}
          <Card className="col-span-2">
            <CardContent className="pt-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Comparar
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                    <span className="inline-block size-2 rounded-full bg-purple-600" />
                    Fornecedor A
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                    <span
                      className="inline-block w-4"
                      style={{ borderTop: "2px dashed #06b6d4", display: "inline-block" }}
                    />
                    Fornecedor B
                  </span>
                </div>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <select
                  value={orgAId}
                  onChange={(e) => setOrgAId(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {respondidosOrgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome.split(" ")[0]}
                    </option>
                  ))}
                </select>
                <span className="flex-shrink-0 text-sm text-muted-foreground">vs.</span>
                <select
                  value={orgBId}
                  onChange={(e) => setOrgBId(e.target.value)}
                  className="flex-1 rounded-md border border-dashed border-cyan-400 bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {respondidosOrgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome.split(" ")[0]}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mb-4 text-xs italic text-muted-foreground">
                Comparação de maturidade por pilar ESG
              </p>

              <ChartContainer config={comparisonChartConfig} className="h-[200px] w-full">
                <LineChart data={comparisonData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="tema" axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent valueFormatter={(v) => `${v}%`} />}
                  />
                  <Line
                    dataKey="a"
                    stroke="var(--color-a)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-a)" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    dataKey="b"
                    stroke="var(--color-b)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "white", stroke: "var(--color-b)", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Melhores + Piores ratings stacked */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="size-4 text-green-600" />
                  Melhores ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                {orgsByScore.map((item) => (
                  <div
                    key={item.org.id}
                    className="flex items-center gap-3 border-b px-4 py-2.5 last:border-0"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.org.nome.split(" ")[0]}
                    </span>
                    <span className="flex-shrink-0 text-xs text-muted-foreground tabular-nums">
                      {item.total}%
                    </span>
                    <span className="w-4 flex-shrink-0 text-right text-sm font-bold">
                      {item.rating.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingDown className="size-4 text-destructive" />
                  Piores ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                {[...orgsByScore].reverse().map((item) => (
                  <div
                    key={item.org.id}
                    className="flex items-center gap-3 border-b px-4 py-2.5 last:border-0"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.org.nome.split(" ")[0]}
                    </span>
                    <span className="flex-shrink-0 text-xs text-muted-foreground tabular-nums">
                      {item.total}%
                    </span>
                    <span className="w-4 flex-shrink-0 text-right text-sm font-bold">
                      {item.rating.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results table — full width */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados por fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="rounded-none border-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[34%] pl-5 text-left">Fornecedor</TableHead>
                  <TableHead className="w-[13%] text-right">Ambiental</TableHead>
                  <TableHead className="w-[13%] text-right">Social</TableHead>
                  <TableHead className="w-[13%] text-right">Governança</TableHead>
                  <TableHead className="w-[13%] text-right">Score ESG</TableHead>
                  <TableHead className="w-[14%] pr-5 text-right">Rating ESG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {respondidosOrgs.map((org) => {
                  const total = orgTotalScore(org)
                  const rating = getEsgRating(total)
                  return (
                    <TableRow key={org.id}>
                      <TableCell className="pl-5 text-left font-medium">
                        <Link
                          to={`/avaliacao-fornecedores/resultado/${org.id}`}
                          className="hover:underline"
                        >
                          {org.nome}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {orgPillarScore(org, "Ambiental")}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {orgPillarScore(org, "Social")}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {orgPillarScore(org, "Governança")}%
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {total}%
                      </TableCell>
                      <TableCell className="pr-5 text-right font-semibold tabular-nums">
                        {rating.label}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Pontos fortes + Principais lacunas */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-green-600" />
                Pontos fortes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              {topQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 border-b px-5 py-3 last:border-0"
                >
                  <span className="w-4 flex-shrink-0 text-xs text-muted-foreground">
                    {i + 1}.
                  </span>
                  <Tooltip>
                    <TooltipTrigger
                      render={<span className="min-w-0 flex-1 cursor-default text-left text-sm" />}
                    >
                      {q.texto}
                    </TooltipTrigger>
                    <TooltipContent>{q.tema}</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="size-4 text-destructive" />
                Principais lacunas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              {bottomQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 border-b px-5 py-3 last:border-0"
                >
                  <span className="w-4 flex-shrink-0 text-xs text-muted-foreground">
                    {i + 1}.
                  </span>
                  <Tooltip>
                    <TooltipTrigger
                      render={<span className="min-w-0 flex-1 cursor-default text-left text-sm" />}
                    >
                      {q.texto}
                    </TooltipTrigger>
                    <TooltipContent>{q.tema}</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
