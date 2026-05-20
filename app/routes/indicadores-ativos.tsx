import { useState } from "react"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil, TrendingDown, TrendingUp } from "lucide-react"

import { DataTable, DataTableColumnHeader } from "~/components/data-table"
import { PageHeader } from "~/components/page-header"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "~/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { TableCell, TableHead } from "~/components/ui/table"
import { Textarea } from "~/components/ui/textarea"

// ─── Types ───────────────────────────────────────────────────────────────────

type Option = { value: string; label: string }

type Indicador = {
  id: string
  codigo: string
  nome: string
  perspectiva: string
  unidade: string
  frequencia: string
  polaridade: "crescer" | "diminuir"
  meta: string
  valorBase: string
  peso: string
  apenasAcompanhamento: boolean
  visivelScorecard: boolean
  nivel: string
  comportamento: string
  descricao: string
  consolidacaoAnual: string
  tipo: "folha" | "composto"
  paiId?: string
  modeloFormula: string
  formula: string
  controleAcesso: "organizacao" | "workspaces" | "membros"
  workspacesAcesso: Option[]
  membrosAcesso: Option[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const workspaceOptions: Option[] = [
  { value: "geral", label: "Geral" },
  { value: "rh", label: "RH" },
  { value: "financeiro", label: "Financeiro" },
  { value: "operacoes", label: "Operações" },
  { value: "comercial", label: "Comercial" },
  { value: "tecnologia", label: "Tecnologia" },
]

const membroOptions: Option[] = [
  { value: "m1", label: "Ana Souza" },
  { value: "m2", label: "Carlos Lima" },
  { value: "m3", label: "Fernanda Rocha" },
  { value: "m4", label: "Marcos Alves" },
  { value: "m5", label: "Paula Mendes" },
  { value: "m6", label: "Ricardo Nunes" },
]

const indicadores: Indicador[] = [
  {
    id: "ind-1",
    codigo: "PES-1001",
    nome: "Índice de Bem-Estar",
    perspectiva: "Pessoas",
    unidade: "%",
    frequencia: "Mensal",
    polaridade: "crescer",
    meta: "85",
    valorBase: "79",
    peso: "2",
    apenasAcompanhamento: false,
    visivelScorecard: true,
    nivel: "Estratégico",
    comportamento: "proporcional",
    descricao: "Avalia a percepção dos colaboradores sobre seu bem-estar geral.",
    consolidacaoAnual: "media",
    tipo: "composto",
    modeloFormula: "media",
    formula: "(A + B + C) / 3",
    controleAcesso: "organizacao",
    workspacesAcesso: [],
    membrosAcesso: [],
  },
  {
    id: "ind-2",
    codigo: "PES-1002",
    nome: "Segurança Psicológica",
    perspectiva: "Pessoas",
    unidade: "%",
    frequencia: "Trimestral",
    polaridade: "crescer",
    meta: "90",
    valorBase: "92",
    peso: "1",
    apenasAcompanhamento: false,
    visivelScorecard: true,
    nivel: "Tático",
    comportamento: "proporcional",
    descricao: "Mede o grau de segurança psicológica no ambiente de trabalho.",
    consolidacaoAnual: "media",
    tipo: "folha",
    paiId: "ind-1",
    modeloFormula: "",
    formula: "",
    controleAcesso: "organizacao",
    workspacesAcesso: [],
    membrosAcesso: [],
  },
  {
    id: "ind-3",
    codigo: "FIN-2001",
    nome: "Receita Bruta",
    perspectiva: "Financeiro",
    unidade: "R$",
    frequencia: "Mensal",
    polaridade: "crescer",
    meta: "500000",
    valorBase: "420000",
    peso: "3",
    apenasAcompanhamento: false,
    visivelScorecard: true,
    nivel: "Estratégico",
    comportamento: "proporcional",
    descricao: "Total de receita bruta mensal da organização.",
    consolidacaoAnual: "soma",
    tipo: "folha",
    modeloFormula: "",
    formula: "",
    controleAcesso: "workspaces",
    workspacesAcesso: [{ value: "financeiro", label: "Financeiro" }],
    membrosAcesso: [],
  },
  {
    id: "ind-4",
    codigo: "CLI-3001",
    nome: "NPS Clientes",
    perspectiva: "Clientes",
    unidade: "%",
    frequencia: "Trimestral",
    polaridade: "crescer",
    meta: "70",
    valorBase: "62",
    peso: "2",
    apenasAcompanhamento: false,
    visivelScorecard: true,
    nivel: "Estratégico",
    comportamento: "proporcional",
    descricao: "Net Promoter Score dos clientes da organização.",
    consolidacaoAnual: "media",
    tipo: "folha",
    modeloFormula: "",
    formula: "",
    controleAcesso: "organizacao",
    workspacesAcesso: [],
    membrosAcesso: [],
  },
  {
    id: "ind-5",
    codigo: "PRO-4001",
    nome: "Tempo Médio de Resolução",
    perspectiva: "Processos",
    unidade: "dias",
    frequencia: "Mensal",
    polaridade: "diminuir",
    meta: "3",
    valorBase: "5",
    peso: "1",
    apenasAcompanhamento: false,
    visivelScorecard: false,
    nivel: "Operacional",
    comportamento: "proporcional",
    descricao: "Tempo médio para resolução de chamados internos.",
    consolidacaoAnual: "media",
    tipo: "folha",
    modeloFormula: "",
    formula: "",
    controleAcesso: "membros",
    workspacesAcesso: [],
    membrosAcesso: [{ value: "m2", label: "Carlos Lima" }],
  },
  {
    id: "ind-6",
    codigo: "PES-1003",
    nome: "Taxa de Retenção",
    perspectiva: "Pessoas",
    unidade: "%",
    frequencia: "Anual",
    polaridade: "crescer",
    meta: "90",
    valorBase: "85",
    peso: "2",
    apenasAcompanhamento: false,
    visivelScorecard: true,
    nivel: "Estratégico",
    comportamento: "proporcional",
    descricao: "Percentual de colaboradores retidos ao longo do ano.",
    consolidacaoAnual: "ultimo",
    tipo: "folha",
    paiId: "ind-1",
    modeloFormula: "",
    formula: "",
    controleAcesso: "organizacao",
    workspacesAcesso: [],
    membrosAcesso: [],
  },
]

// ─── Table columns ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Indicador>()

function buildColumns(onEdit: (ind: Indicador) => void) {
  return [
    columnHelper.accessor("nome", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Indicador" className="min-w-48 pl-4" />
      ),
      cell: (info) => (
        <TableCell className="min-w-48 pl-4">
          <p className="font-medium">{info.getValue()}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {info.row.original.codigo}
          </p>
        </TableCell>
      ),
    }),
    columnHelper.accessor("perspectiva", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Perspectiva" className="w-36" />
      ),
      cell: (info) => (
        <TableCell className="w-36">
          <Badge variant="secondary">{info.getValue()}</Badge>
        </TableCell>
      ),
    }),
    columnHelper.display({
      id: "hierarquia",
      header: () => (
        <TableHead className="w-28 text-left">Hierarquia</TableHead>
      ),
      cell: (info) => {
        const ind = info.row.original
        if (ind.tipo === "composto") {
          return (
            <TableCell className="w-28">
              <Badge variant="default">Pai</Badge>
            </TableCell>
          )
        }
        if (ind.paiId) {
          return (
            <TableCell className="w-28">
              <Badge variant="secondary">Filho</Badge>
            </TableCell>
          )
        }
        return (
          <TableCell className="w-28 text-muted-foreground">—</TableCell>
        )
      },
    }),
    columnHelper.accessor("frequencia", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Frequência" className="w-28" />
      ),
      cell: (info) => <TableCell className="w-28">{info.getValue()}</TableCell>,
    }),
    columnHelper.accessor("unidade", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unidade" className="w-20" />
      ),
      cell: (info) => (
        <TableCell className="w-20 text-muted-foreground">{info.getValue()}</TableCell>
      ),
    }),
    columnHelper.accessor("meta", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meta" align="right" className="w-24 pr-4" />
      ),
      cell: (info) => (
        <TableCell align="right" className="w-24 pr-4 tabular-nums">
          {info.getValue()} {info.row.original.unidade}
        </TableCell>
      ),
    }),
    columnHelper.accessor("polaridade", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Polaridade" className="w-28" />
      ),
      cell: (info) =>
        info.getValue() === "crescer" ? (
          <TableCell className="w-28">
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="size-3.5" />
              Crescer
            </span>
          </TableCell>
        ) : (
          <TableCell className="w-28">
            <span className="flex items-center gap-1 text-red-600">
              <TrendingDown className="size-3.5" />
              Diminuir
            </span>
          </TableCell>
        ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <TableCell align="right" className="w-12 pr-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar indicador"
            onClick={() => onEdit(info.row.original)}
          >
            <Pencil className="size-3.5" />
          </Button>
        </TableCell>
      ),
    }),
  ]
}

// ─── Edit form section heading ────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{children}</p>
      <Separator />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IndicadoresAtivosPage() {
  const [editando, setEditando] = useState<Indicador | null>(null)
  const [form, setForm] = useState<Indicador | null>(null)

  const anchorWorkspaces = useComboboxAnchor()
  const anchorMembros = useComboboxAnchor()

  function abrirEdicao(ind: Indicador) {
    setEditando(ind)
    setForm({ ...ind })
  }

  function fecharEdicao() {
    setEditando(null)
    setForm(null)
  }

  function updateForm<K extends keyof Indicador>(field: K, value: Indicador[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const columns = buildColumns(abrirEdicao)

  const table = useReactTable({
    data: indicadores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <PageHeader title="Indicadores Ativos" />

      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {indicadores.length} indicador{indicadores.length !== 1 ? "es" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable table={table} />
          </CardContent>
        </Card>
      </div>

      {/* ── Sheet de edição ── */}
      <Sheet
        open={!!editando}
        onOpenChange={(open) => {
          if (!open) fecharEdicao()
        }}
      >
        <SheetContent className="sm:max-w-xl flex flex-col">
          <SheetHeader>
            <SheetTitle>Editar Indicador</SheetTitle>
            {editando && (
              <SheetDescription>
                <span className="font-mono">{editando.codigo}</span>
                {" — "}
                {editando.nome}
              </SheetDescription>
            )}
          </SheetHeader>

          {form && (
            <div className="flex-1 overflow-y-auto px-4">
              <FieldGroup className="py-2">

                {/* ── Informações Essenciais ── */}
                <SectionHeading>Informações Essenciais</SectionHeading>

                <Field>
                  <FieldLabel htmlFor="edit-nome">Nome do Indicador</FieldLabel>
                  <Input
                    id="edit-nome"
                    value={form.nome}
                    onChange={(e) => updateForm("nome", e.target.value)}
                  />
                </Field>

                <FieldGroup className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit-unidade">Unidade</FieldLabel>
                    <Select
                      value={form.unidade}
                      onValueChange={(v) => updateForm("unidade", v ?? "")}
                    >
                      <SelectTrigger id="edit-unidade" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="R$">R$ (Reais)</SelectItem>
                          <SelectItem value="%">% (Percentual)</SelectItem>
                          <SelectItem value="un">un (Unidades)</SelectItem>
                          <SelectItem value="dias">Dias</SelectItem>
                          <SelectItem value="horas">Horas</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-perspectiva">Perspectiva BSC</FieldLabel>
                    <Select
                      value={form.perspectiva}
                      onValueChange={(v) => updateForm("perspectiva", v ?? "")}
                    >
                      <SelectTrigger id="edit-perspectiva" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="Clientes">Clientes</SelectItem>
                          <SelectItem value="Pessoas">Pessoas</SelectItem>
                          <SelectItem value="Processos">Processos</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <FieldGroup className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit-frequencia">Frequência</FieldLabel>
                    <Select
                      value={form.frequencia}
                      onValueChange={(v) => updateForm("frequencia", v ?? "")}
                    >
                      <SelectTrigger id="edit-frequencia" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Diário">Diário</SelectItem>
                          <SelectItem value="Semanal">Semanal</SelectItem>
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Trimestral">Trimestral</SelectItem>
                          <SelectItem value="Anual">Anual</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <FieldSet>
                    <FieldLegend variant="label">Polaridade</FieldLegend>
                    <RadioGroup
                      value={form.polaridade}
                      onValueChange={(v) =>
                        updateForm("polaridade", v as Indicador["polaridade"])
                      }
                      className="flex flex-row gap-4"
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem value="crescer" id="edit-crescer" />
                        <FieldLabel
                          htmlFor="edit-crescer"
                          className="flex cursor-pointer items-center gap-1.5"
                        >
                          <TrendingUp className="size-3.5 text-green-600" />
                          Crescer
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="diminuir" id="edit-diminuir" />
                        <FieldLabel
                          htmlFor="edit-diminuir"
                          className="flex cursor-pointer items-center gap-1.5"
                        >
                          <TrendingDown className="size-3.5 text-red-600" />
                          Diminuir
                        </FieldLabel>
                      </Field>
                    </RadioGroup>
                  </FieldSet>
                </FieldGroup>

                {form.frequencia !== "Anual" && (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="edit-consolidacao">
                        Consolidação Anual
                      </FieldLabel>
                      <FieldDescription>
                        Como o valor anual será calculado
                      </FieldDescription>
                    </FieldContent>
                    <Select
                      value={form.consolidacaoAnual}
                      onValueChange={(v) => updateForm("consolidacaoAnual", v ?? "")}
                    >
                      <SelectTrigger id="edit-consolidacao" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="soma">
                            Soma periódica (acumulado)
                          </SelectItem>
                          <SelectItem value="media">Média periódica</SelectItem>
                          <SelectItem value="ultimo">
                            Último valor (snapshot)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {/* ── Metas & Scorecard ── */}
                <SectionHeading>Metas & Scorecard</SectionHeading>

                <Field orientation="horizontal">
                  <Checkbox
                    id="edit-acomp"
                    checked={form.apenasAcompanhamento}
                    onCheckedChange={(c) =>
                      updateForm("apenasAcompanhamento", Boolean(c))
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="edit-acomp">
                      Apenas Acompanhamento
                    </FieldLabel>
                    <FieldDescription>
                      Indicador sem meta definida (informativo)
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <FieldGroup className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit-base">Valor Base</FieldLabel>
                    <Input
                      id="edit-base"
                      type="number"
                      value={form.valorBase}
                      onChange={(e) => updateForm("valorBase", e.target.value)}
                      disabled={form.apenasAcompanhamento}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-meta">Meta</FieldLabel>
                    <Input
                      id="edit-meta"
                      type="number"
                      value={form.meta}
                      onChange={(e) => updateForm("meta", e.target.value)}
                      disabled={form.apenasAcompanhamento}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-peso">Peso</FieldLabel>
                    <Input
                      id="edit-peso"
                      type="number"
                      value={form.peso}
                      onChange={(e) => updateForm("peso", e.target.value)}
                    />
                  </Field>
                </FieldGroup>

                <Field orientation="horizontal">
                  <Checkbox
                    id="edit-visivel"
                    checked={form.visivelScorecard}
                    onCheckedChange={(c) =>
                      updateForm("visivelScorecard", Boolean(c))
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="edit-visivel">
                      Visível no Scorecard
                    </FieldLabel>
                    <FieldDescription>Exibir no painel principal</FieldDescription>
                  </FieldContent>
                </Field>

                {/* ── Configurações Avançadas ── */}
                <SectionHeading>Configurações Avançadas</SectionHeading>

                <FieldGroup className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit-nivel">Nível Estratégico</FieldLabel>
                    <Select
                      value={form.nivel}
                      onValueChange={(v) => updateForm("nivel", v ?? "")}
                    >
                      <SelectTrigger id="edit-nivel" className="w-full">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Estratégico">Estratégico</SelectItem>
                          <SelectItem value="Tático">Tático</SelectItem>
                          <SelectItem value="Operacional">Operacional</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-comportamento">Comportamento</FieldLabel>
                    <Select
                      value={form.comportamento}
                      onValueChange={(v) => updateForm("comportamento", v ?? "")}
                    >
                      <SelectTrigger id="edit-comportamento" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="proporcional">Proporcional</SelectItem>
                          <SelectItem value="binario">
                            Binário (tudo ou nada)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel htmlFor="edit-descricao">Descrição</FieldLabel>
                  <Textarea
                    id="edit-descricao"
                    value={form.descricao}
                    onChange={(e) => updateForm("descricao", e.target.value)}
                    placeholder="Descreva o indicador..."
                    className="min-h-20"
                  />
                </Field>

                {/* ── Hierarquia & Fórmula ── */}
                <SectionHeading>Hierarquia & Fórmula</SectionHeading>

                <FieldSet>
                  <FieldLegend variant="label">Tipo do Indicador</FieldLegend>
                  <RadioGroup
                    value={form.tipo}
                    onValueChange={(v) =>
                      updateForm("tipo", v as Indicador["tipo"])
                    }
                    className="flex flex-row gap-4"
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="folha" id="edit-folha" />
                      <FieldContent>
                        <FieldLabel htmlFor="edit-folha">Folha</FieldLabel>
                        <FieldDescription>Entrada manual</FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="composto" id="edit-composto" />
                      <FieldContent>
                        <FieldLabel htmlFor="edit-composto">Composto</FieldLabel>
                        <FieldDescription>Calculado de filhos</FieldDescription>
                      </FieldContent>
                    </Field>
                  </RadioGroup>
                </FieldSet>

                {form.tipo === "composto" && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="edit-modelo">Modelo de Fórmula</FieldLabel>
                      <Select
                        value={form.modeloFormula}
                        onValueChange={(v) => updateForm("modeloFormula", v ?? "")}
                      >
                        <SelectTrigger id="edit-modelo" className="w-full">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="soma">Soma (A + B + ...)</SelectItem>
                            <SelectItem value="media">Média ((A + B) / n)</SelectItem>
                            <SelectItem value="produto">Produto (A × B)</SelectItem>
                            <SelectItem value="balanco">Balanço (A − B)</SelectItem>
                            <SelectItem value="soma_periodica">Soma periódica YTD</SelectItem>
                            <SelectItem value="media_periodica">Média periódica AVG</SelectItem>
                            <SelectItem value="ultimo_valor">Último valor LAST</SelectItem>
                            <SelectItem value="personalizado">Personalizado</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-formula">Fórmula</FieldLabel>
                      <Input
                        id="edit-formula"
                        value={form.formula}
                        onChange={(e) => updateForm("formula", e.target.value)}
                        className="font-mono"
                        readOnly={
                          form.modeloFormula !== "personalizado" &&
                          form.modeloFormula !== ""
                        }
                      />
                    </Field>
                  </>
                )}

                {/* ── Governança ── */}
                <SectionHeading>Governança & Controle de Acesso</SectionHeading>

                <FieldSet>
                  <FieldLegend variant="label">
                    Quem pode visualizar este indicador?
                  </FieldLegend>
                  <RadioGroup
                    value={form.controleAcesso}
                    onValueChange={(v) =>
                      updateForm(
                        "controleAcesso",
                        v as Indicador["controleAcesso"]
                      )
                    }
                    className="gap-2"
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="organizacao" id="edit-org" />
                      <FieldContent>
                        <FieldLabel htmlFor="edit-org">Toda a organização</FieldLabel>
                        <FieldDescription>
                          Todos os membros podem visualizar
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="workspaces" id="edit-ws" />
                      <FieldContent>
                        <FieldLabel htmlFor="edit-ws">
                          Workspaces específicos
                        </FieldLabel>
                        <FieldDescription>
                          Visível apenas nos workspaces selecionados
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="membros" id="edit-membros" />
                      <FieldContent>
                        <FieldLabel htmlFor="edit-membros">
                          Membros específicos
                        </FieldLabel>
                        <FieldDescription>
                          Visível apenas para os membros selecionados
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </RadioGroup>
                </FieldSet>

                {form.controleAcesso === "workspaces" && (
                  <Field>
                    <FieldLabel>Workspaces com acesso</FieldLabel>
                    <Combobox
                      multiple
                      items={workspaceOptions}
                      value={form.workspacesAcesso}
                      onValueChange={(v) =>
                        updateForm("workspacesAcesso", v as Option[])
                      }
                    >
                      <ComboboxChips ref={anchorWorkspaces} className="w-full">
                        {form.workspacesAcesso.map((ws) => (
                          <ComboboxChip key={ws.value}>{ws.label}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder="Pesquisar workspaces..." />
                      </ComboboxChips>
                      <ComboboxContent anchor={anchorWorkspaces} align="start">
                        <ComboboxEmpty>Nenhum workspace encontrado.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: Option) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}

                {form.controleAcesso === "membros" && (
                  <Field>
                    <FieldLabel>Membros com acesso</FieldLabel>
                    <Combobox
                      multiple
                      items={membroOptions}
                      value={form.membrosAcesso}
                      onValueChange={(v) =>
                        updateForm("membrosAcesso", v as Option[])
                      }
                    >
                      <ComboboxChips ref={anchorMembros} className="w-full">
                        {form.membrosAcesso.map((m) => (
                          <ComboboxChip key={m.value}>{m.label}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder="Pesquisar membros..." />
                      </ComboboxChips>
                      <ComboboxContent anchor={anchorMembros} align="start">
                        <ComboboxEmpty>Nenhum membro encontrado.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: Option) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              </FieldGroup>
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={fecharEdicao}>
              Cancelar
            </Button>
            <Button onClick={fecharEdicao}>Salvar Alterações</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
