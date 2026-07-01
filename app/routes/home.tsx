import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { PageHeader } from "~/components/page-header"

export default function Home() {
  return (
    <>
      <PageHeader title="Página inicial" />
      <div className="flex min-h-svh p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-medium">Project ready!</h1>
            <p>You may now add components and start building.</p>
            <p>We&apos;ve already added the button component for you.</p>
            <Dialog>
              <DialogTrigger render={<Button className="mt-2" />}>
                Button
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modal de exemplo</DialogTitle>
                  <DialogDescription>
                    Este é um modal de exemplo. Adicione o conteúdo que desejar aqui.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}
