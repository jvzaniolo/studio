import {
  BarChart3,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Cog,
  Layers,
  Map,
  Settings2,
} from "lucide-react"
import { Link, Outlet, useLocation } from "react-router"

import { cn } from "~/lib/utils"


import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
} from "~/components/ui/sidebar"
import { TooltipProvider } from "~/components/ui/tooltip"

const workspace = {
  name: "Humanizadas",
  team: "Geral",
}

const user = {
  name: "Administrador",
  email: "administrador@humanizadas.com",
  avatar: "https://i.pravatar.cc/150?img=12",
}

export default function SidebarLayout() {
  const location = useLocation()
  const isSettings = location.pathname.startsWith("/configuracoes")
  const isIndicador =
    location.pathname.startsWith("/indicador") &&
    !location.pathname.startsWith("/criar-indicador")
  const isLideranca = location.pathname.startsWith("/lideranca")
  const isDiversidade = location.pathname.startsWith("/diversidade")
  const isEngajamento = location.pathname.startsWith("/engajamento")
  const isCriarIndicador = location.pathname.startsWith("/criar-indicador")
  const isIndicadoresAtivos = location.pathname.startsWith("/indicadores-ativos")
  const isVisaoGeral =
    location.pathname === "/avaliacao-fornecedores/visao-geral" ||
    location.pathname.startsWith("/avaliacao-fornecedores/resultado")
  const isAcompanhamento = location.pathname.startsWith("/avaliacao-fornecedores/acompanhamento") ||
    location.pathname.startsWith("/avaliacao-fornecedores/fornecedor")
  const isMaterialidade =
    location.pathname === "/materialidade" ||
    location.pathname.startsWith("/materialidade/tema")
  const isMapeamentos = location.pathname.startsWith("/materialidade/mapeamentos")

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      />
                    }
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                      <Building2 />
                    </div>
                    <span className="truncate font-medium">
                      {workspace.name}
                    </span>
                    <ChevronsUpDown className="ml-auto" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="right"
                    className="min-w-56"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Building2 />
                        Humanizadas
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Building2 />
                        Demo
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<SidebarMenuButton className="font-medium" />}
                    >
                      {workspace.team}
                      <ChevronsUpDown className="ml-auto" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="right"
                      className="min-w-56"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Workspaces
                        </DropdownMenuLabel>
                        <DropdownMenuItem>Geral</DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarMenu>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip="KPIs">
                          <BarChart3 />
                          <span>KPIs</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/indicador" />}
                            isActive={isIndicador}
                          >
                            Bem-Estar
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/lideranca" />}
                            isActive={isLideranca}
                          >
                            Liderança
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/diversidade" />}
                            isActive={isDiversidade}
                          >
                            Diversidade
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/engajamento" />}
                            isActive={isEngajamento}
                          >
                            Engajamento
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip="Gerenciar Indicadores">
                          <Settings2 />
                          <span>Gerenciar Indicadores</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/indicadores-ativos" />}
                            isActive={isIndicadoresAtivos}
                          >
                            Indicadores Ativos
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/criar-indicador" />}
                            isActive={isCriarIndicador}
                          >
                            Criar Indicador
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip="Avaliação de Fornecedores">
                          <ClipboardCheck />
                          <span>Avaliação de Fornecedores</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/avaliacao-fornecedores/visao-geral" />}
                            isActive={isVisaoGeral}
                          >
                            Visão Geral
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/avaliacao-fornecedores/acompanhamento" />}
                            isActive={isAcompanhamento}
                          >
                            Acompanhamento
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip="Materialidade">
                          <Layers />
                          <span>Materialidade</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/materialidade" />}
                            isActive={isMaterialidade}
                          >
                            Matriz
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link to="/materialidade/mapeamentos" />}
                            isActive={isMapeamentos}
                          >
                            <Map className="size-3.5" />
                            Mapeamentos
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      />
                    }
                  >
                    <Avatar className="size-8 rounded-lg after:rounded-lg">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                        className="rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="right"
                    className="min-w-56"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem render={<Link to="/configuracoes" />}>
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuItem>Sair</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <SidebarMenuAction
                  render={<Link to="/configuracoes" title="Configurações" />}
                  className={cn(
                    "!top-1/2 !-translate-y-1/2",
                    isSettings ? "text-sidebar-accent-foreground" : ""
                  )}
                >
                  <Cog />
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
