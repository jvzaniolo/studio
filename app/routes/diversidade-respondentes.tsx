import { EyeOff } from "lucide-react"

import { PageHeader } from "~/components/page-header"

export default function DiversidadeRespondentes() {
  return (
    <>
      <PageHeader title="Diversidade" />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground">
        <EyeOff className="size-10 stroke-[1.5]" />
        <div className="space-y-1">
          <p className="text-sm">
            Dados ocultados para preservar a privacidade dos respondentes
          </p>
          <p className="text-sm">
            O número de respondentes é menor que 5
          </p>
        </div>
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
