import type { ReactNode } from "react"
import { PanelLeft } from "lucide-react"

import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

export function PageHeader({
  title,
  actions,
  trigger,
}: {
  title: ReactNode
  actions?: ReactNode
  trigger?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      {trigger ?? (
        <SidebarTrigger className="-ml-1">
          <PanelLeft />
        </SidebarTrigger>
      )}
      <Separator orientation="vertical" className="mr-2 my-3" />
      <span className="text-sm font-medium">{title}</span>
      {actions ? (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
