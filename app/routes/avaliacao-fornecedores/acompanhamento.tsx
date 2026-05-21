import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"
import { Link } from "react-router"

import {
  organizacoes,
  type Organizacao,
  type Status,
} from "~/data/avaliacao-fornecedores"
import { PageHeader } from "~/components/page-header"
import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "~/components/ui/chart"
import { DataTable, DataTableColumnHeader } from "~/components/data-table"
import { TableCell } from "~/components/ui/table"
import { cn } from "~/lib/utils"

const statusConfig: Record<Status, { label: string; className: string; dot: string }> = {
  respondido: {
    label: "Respondido",
    className: "bg-green-100 text-green-800 border border-green-200",
    dot: "bg-green-500",
  },
  incompleto: {
    label: "Incompleto",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    dot: "bg-yellow-500",
  },
  "nao-iniciado": {
    label: "Não iniciado",
    className: "bg-secondary text-secondary-foreground",
    dot: "bg-muted-foreground",
  },
}

const contagens = {
  respondido: organizacoes.filter((o) => o.status === "respondido").length,
  incompleto: organizacoes.filter((o) => o.status === "incompleto").length,
  "nao-iniciado": organizacoes.filter((o) => o.status === "nao-iniciado").length,
}
const total = organizacoes.length
const percentRespondido = Math.round((contagens.respondido / total) * 100)

const respondidos = organizacoes.filter((o) => o.status === "respondido")
const pendentes = organizacoes.filter((o) => o.status !== "respondido")

const participacaoStatus =
  percentRespondido <= 30
    ? { label: "Participação baixa", className: "text-destructive" }
    : percentRespondido <= 65
      ? { label: "Participação moderada", className: "text-yellow-600" }
      : { label: "Boa participação", className: "text-green-600" }

const chartData = [
  { name: "Respondido", value: contagens.respondido, fill: "var(--color-respondido)" },
  { name: "Incompleto", value: contagens.incompleto, fill: "var(--color-incompleto)" },
  { name: "Não iniciado", value: contagens["nao-iniciado"], fill: "var(--color-naoIniciado)" },
]

const chartConfig = {
  respondido: { label: "Respondido", color: "#22c55e" },
  incompleto: { label: "Incompleto", color: "#eab308" },
  naoIniciado: { label: "Não iniciado", color: "#94a3b8" },
} satisfies ChartConfig

const columnHelper = createColumnHelper<Organizacao>()

const columns = [
  columnHelper.accessor("nome", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fornecedor" />
    ),
    cell: ({ getValue, row }) => (
      <TableCell>
        <Link
          to={`/avaliacao-fornecedores/fornecedor/${row.original.id}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {getValue()}
        </Link>
      </TableCell>
    ),
  }),
  columnHelper.accessor("dataResposta", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de resposta" />
    ),
    cell: ({ getValue }) => (
      <TableCell className="text-muted-foreground">
        {getValue() ?? "—"}
      </TableCell>
    ),
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const status = getValue()
      const config = statusConfig[status]
      return (
        <TableCell>
          <Badge
            variant="outline"
            className={cn("font-medium", config.className)}
          >
            {config.label}
          </Badge>
        </TableCell>
      )
    },
  }),
]

export default function AcompanhamentoPage() {
  const table = useReactTable({
    data: organizacoes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col">
      <PageHeader title="Acompanhamento" />

      <div className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-3 gap-4">

          {/* Card esquerdo — Visão Geral */}
          <Card className="flex flex-col items-center justify-center gap-3 px-6 py-8">
            <div className="relative w-44 h-44">
              <ChartContainer config={chartConfig} className="w-full h-full aspect-square">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius="58%"
                    outerRadius="80%"
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold">{percentRespondido}%</span>
              </div>
            </div>

            <span className={cn("text-sm font-medium", participacaoStatus.className)}>
              {participacaoStatus.label}
            </span>
            <div className="text-center">
              <p className="text-xs font-bold tracking-widest uppercase text-foreground">
                Responderam
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {contagens.respondido} de {total}
              </p>
            </div>
          </Card>

          {/* Card central — Respondidos */}
          <Card className="flex flex-col border-l-4 border-l-green-600">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="font-semibold text-sm">Respondidos</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {contagens.respondido} fornecedores
              </span>
            </div>
            <div className="flex flex-col flex-1">
              {respondidos.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <Link
                    to={`/avaliacao-fornecedores/fornecedor/${org.id}`}
                    className="text-sm truncate underline-offset-4 hover:underline"
                  >
                    {org.nome}
                  </Link>
                  <Badge
                    variant="outline"
                    className="flex-shrink-0 bg-green-50 text-green-700 border-green-200 font-normal"
                  >
                    {org.dataResposta}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Card direito — Pendentes */}
          <Card className="flex flex-col border-l-4 border-l-destructive">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                <span className="font-semibold text-sm">Pendentes</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {pendentes.length} fornecedores
              </span>
            </div>
            <div className="flex flex-col flex-1">
              {pendentes.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <Link
                    to={`/avaliacao-fornecedores/fornecedor/${org.id}`}
                    className="text-sm truncate underline-offset-4 hover:underline"
                  >
                    {org.nome}
                  </Link>
                  <Badge
                    variant="outline"
                    className={cn("flex-shrink-0 font-normal", statusConfig[org.status].className)}
                  >
                    {statusConfig[org.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento por fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <DataTable table={table} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
