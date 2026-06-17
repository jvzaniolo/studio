import { Frown } from "lucide-react"

import { PageHeader } from "~/components/page-header"

export default function Diversidade() {
  return (
    <>
      <PageHeader title="Diversidade" />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground">
        <Frown className="size-10 stroke-[1.5]" />
        <p className="text-sm">Ops! Não temos dados para mostrar nessa página</p>
        <a
          href="mailto:suporte@humanizadas.com"
          className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Entre em contato com o suporte
        </a>
      </div>
    </>
  )
}
