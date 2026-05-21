import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { organizacoes, questoes } from "~/data/avaliacao-fornecedores"
import { PageHeader } from "~/components/page-header"
import { Button } from "~/components/ui/button"
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
type Tema = "Ambiental" | "Social" | "Governança"

const temas: Tema[] = ["Ambiental", "Social", "Governança"]

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

function orgTotalScore(org: (typeof organizacoes)[number]): number {
  return Math.round(
    temas.reduce((s, t) => s + orgPillarScore(org, t), 0) / temas.length,
  )
}

const esgRatingConfig = [
  {
    min: 80,
    label: "A",
    description: "Alta maturidade ESG — referência em sustentabilidade",
  },
  {
    min: 60,
    label: "B",
    description: "Boa maturidade ESG — práticas consistentes",
  },
  {
    min: 20,
    label: "C",
    description: "Maturidade ESG em desenvolvimento — atenção recomendada",
  },
  {
    min: 0,
    label: "D",
    description: "Baixa maturidade ESG — ação urgente necessária",
  },
]

function getEsgRating(score: number) {
  return (
    esgRatingConfig.find((r) => score >= r.min) ??
    esgRatingConfig[esgRatingConfig.length - 1]
  )
}

const pillarConfig: Record<Tema, { barColor: string }> = {
  Ambiental: { barColor: "#16a34a" },
  Social: { barColor: "#2563eb" },
  Governança: { barColor: "#9333ea" },
}

const chartConfig: ChartConfig = {
  score: { label: "Score", color: "#7c3aed" },
}

export default function ResultadoFornecedorPage() {
  const { id } = useParams()
  const org = organizacoes.find((o) => o.id === id)

  if (!org) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Fornecedor não encontrado" />
        <div className="p-6">
          <Button
            variant="ghost"
            render={<Link to="/avaliacao-fornecedores/visao-geral" />}
          >
            <ArrowLeft />
            Voltar à Visão Geral
          </Button>
        </div>
      </div>
    )
  }

  const totalScore = orgTotalScore(org)
  const rating = getEsgRating(totalScore)

  const totalQuestoes = questoes.length
  const questoesRespondidas = questoes.filter(
    (q) => (org.respostas[q.id] ?? []).length > 0,
  ).length
  const pctRespondidas = Math.round((questoesRespondidas / totalQuestoes) * 100)

  const priorityActions = questoes
    .filter((q) => getNonAMax(q) > 0)
    .map((q) => ({
      texto: q.texto,
      tema: q.tema as Tema,
      score: Math.round((getNonACount(org, q) / getNonAMax(q)) * 100),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const pillarData = temas.map((tema) => ({
    tema,
    score: orgPillarScore(org, tema),
    fill: pillarConfig[tema].barColor,
  }))

  const bestPillar = [...pillarData].sort((a, b) => b.score - a.score)[0]

  return (
    <div className="flex flex-col">
      <PageHeader
        title={org.nome}
        actions={
          <Button
            variant="ghost"
            size="sm"
            render={<Link to="/avaliacao-fornecedores/visao-geral" />}
          >
            <ArrowLeft />
            Visão Geral
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Nota + Prioridades de ação */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="mb-2 text-sm font-medium">Rating ESG</p>
              <div className="text-8xl font-bold leading-none text-foreground">
                {rating.label}
              </div>
              <p className="mt-4 text-sm">{rating.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Prioridades de ação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-3">
              {priorityActions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border-b px-5 py-3 last:border-0"
                >
                  <span className="mt-0.5 w-4 flex-shrink-0 text-sm">
                    {i + 1}.
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-snug">
                    {item.texto.length > 80
                      ? item.texto.slice(0, 80) + "…"
                      : item.texto}
                  </span>
                  <span className="flex-shrink-0 text-sm font-semibold tabular-nums">
                    {item.score}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col items-center pt-5 pb-5 text-center">
              <p className="text-sm font-medium">Score ESG</p>
              <div className="flex flex-1 items-center justify-center">
                <p className="text-3xl font-bold">{totalScore}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col items-center pt-5 pb-5 text-center">
              <p className="text-sm font-medium">Questões respondidas</p>
              <div className="flex flex-1 items-center justify-center">
                <p className="text-3xl font-bold">{pctRespondidas}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col items-center pt-5 pb-5 text-center">
              <p className="text-sm font-medium">Total respondido</p>
              <div className="flex flex-1 flex-col items-center justify-center">
                <p className="text-3xl font-bold">{questoesRespondidas}</p>
                <p className="text-xs">de {totalQuestoes} questões</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col items-center pt-5 pb-5 text-center">
              <p className="text-sm font-medium">Pilar em destaque</p>
              <div className="flex flex-1 flex-col items-center justify-center">
                <p className="text-3xl font-bold">{bestPillar.score}%</p>
                <p className="text-xs">{bestPillar.tema}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico por pilar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho por pilar ESG</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={pillarData} barCategoryGap="35%">
                <CartesianGrid vertical={false} />
                <XAxis dataKey="tema" axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent valueFormatter={(v) => `${v}%`} />
                  }
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {pillarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
