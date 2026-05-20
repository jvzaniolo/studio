import { CheckCircle2, Circle, ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router"

import {
  organizacoes,
  questoes,
  type Status,
} from "~/data/avaliacao-fornecedores"
import { PageHeader } from "~/components/page-header"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { cn } from "~/lib/utils"

const statusConfig: Record<Status, { label: string; className: string }> = {
  respondido: {
    label: "Respondido",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  incompleto: {
    label: "Incompleto",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  "nao-iniciado": {
    label: "Não iniciado",
    className: "bg-secondary text-secondary-foreground",
  },
}

const temas = ["Ambiental", "Social", "Governança"] as const

export default function FornecedorPage() {
  const { id } = useParams()
  const org = organizacoes.find((o) => o.id === id)

  if (!org) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Fornecedor não encontrado" />
        <div className="p-6">
          <Button variant="ghost" render={<Link to="/avaliacao-fornecedores/acompanhamento" />}>
            <ArrowLeft />
            Voltar ao acompanhamento
          </Button>
        </div>
      </div>
    )
  }

  const totalQuestoes = questoes.length
  const questoesRespondidas = questoes.filter(
    (q) => (org.respostas[q.id] ?? []).length > 0
  ).length

  return (
    <div className="flex flex-col">
      <PageHeader
        title={org.nome}
        actions={
          <Button
            variant="ghost"
            size="sm"
            render={<Link to="/avaliacao-fornecedores/acompanhamento" />}
          >
            <ArrowLeft />
            Acompanhamento
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn("font-medium", statusConfig[org.status].className)}
          >
            {statusConfig[org.status].label}
          </Badge>
          {org.dataResposta && (
            <span className="text-sm text-muted-foreground">
              Respondido em {org.dataResposta}
            </span>
          )}
          <span className="text-sm text-muted-foreground ml-auto">
            {questoesRespondidas} de {totalQuestoes} questões respondidas
          </span>
        </div>

        <Tabs defaultValue="Ambiental">
          <TabsList>
            {temas.map((tema) => {
              const count = questoes.filter((q) => q.tema === tema).length
              const answered = questoes.filter(
                (q) => q.tema === tema && (org.respostas[q.id] ?? []).length > 0
              ).length
              return (
                <TabsTrigger key={tema} value={tema}>
                  {tema}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {answered}/{count}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {temas.map((tema) => {
            const questoesTema = questoes.filter((q) => q.tema === tema)
            return (
              <TabsContent key={tema} value={tema} className="mt-4 flex flex-col gap-4">
                {questoesTema.map((questao, index) => {
                  const respostasOrg = org.respostas[questao.id] ?? []
                  const respondida = respostasOrg.length > 0

                  return (
                    <Card key={questao.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-sm font-medium leading-relaxed">
                            <span className="text-muted-foreground mr-2">
                              {String(
                                questoesTema.indexOf(questao) + 1
                              ).padStart(2, "0")}.
                            </span>
                            {questao.texto}
                          </CardTitle>
                          {!respondida && (
                            <Badge variant="secondary" className="flex-shrink-0 text-xs">
                              Sem resposta
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="flex flex-col gap-2">
                          {questao.alternativas.map((alt) => {
                            const selecionada = respostasOrg.includes(alt.letra)
                            return (
                              <li
                                key={alt.letra}
                                className={cn(
                                  "flex items-start gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                                  selecionada
                                    ? "bg-green-50 text-green-900"
                                    : "text-muted-foreground"
                                )}
                              >
                                {selecionada ? (
                                  <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
                                ) : (
                                  <Circle className="size-4 mt-0.5 flex-shrink-0 text-muted-foreground/40" />
                                )}
                                <span>
                                  <span className="font-medium mr-1">{alt.letra}.</span>
                                  {alt.texto}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
