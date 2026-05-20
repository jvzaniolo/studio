import { useState } from "react"
import { AlertCircle, ChevronRight, Info, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react"

import { PageHeader } from "~/components/page-header"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "~/components/ui/combobox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
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
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = {
  nome: string
  unidade: string
  perspectiva: string
  frequencia: string
  polaridade: string
  consolidacaoAnual: string
  meta: string
  valorBase: string
  peso: string
  apenasAcompanhamento: boolean
  visivelScorecard: boolean
  codigo: string
  descricao: string
  nivel: string
  comportamento: string
  tipo: "folha" | "composto"
  modeloFormula: string
  formula: string
  filhos: Filho[]
  controleAcesso: "organizacao" | "workspaces" | "membros"
}

type Filho = {
  id: string
  codigo: string
  nome: string
  perspectiva: string
  unidade: string
  isNew: boolean
}

type NovoFilho = {
  nome: string
  unidade: string
  perspectiva: string
}

type Option = { value: string; label: string }

type IndicadorExistente = Option & {
  codigo: string
  perspectiva: string
  unidade: string
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

const indicadoresExistentes: IndicadorExistente[] = [
  { value: "ind-1", label: "Índice de Bem-Estar", codigo: "PES-1001", perspectiva: "Pessoas", unidade: "%" },
  { value: "ind-2", label: "Segurança Psicológica", codigo: "PES-1002", perspectiva: "Pessoas", unidade: "%" },
  { value: "ind-3", label: "Receita Bruta", codigo: "FIN-2001", perspectiva: "Financeiro", unidade: "R$" },
  { value: "ind-4", label: "NPS Clientes", codigo: "CLI-3001", perspectiva: "Clientes", unidade: "%" },
  { value: "ind-5", label: "Tempo Médio de Resolução", codigo: "PRO-4001", perspectiva: "Processos", unidade: "dias" },
  { value: "ind-6", label: "Taxa de Retenção", codigo: "PES-1003", perspectiva: "Pessoas", unidade: "%" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const prefixos: Record<string, string> = {
  Financeiro: "FIN",
  Pessoas: "PES",
  Clientes: "CLI",
  Processos: "PRO",
}

function gerarCodigo(perspectiva: string) {
  const prefixo = prefixos[perspectiva] ?? "IND"
  return `${prefixo}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

// ─── FormSection ─────────────────────────────────────────────────────────────

function FormSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <Card>
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <CollapsibleTrigger
          render={
            <div
              role="button"
              tabIndex={0}
              className="w-full cursor-pointer select-none rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          }
        >
          <CardHeader className="transition-colors hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  expanded && "rotate-90"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CriarIndicadorPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    unidade: "",
    perspectiva: "",
    frequencia: "Mensal",
    polaridade: "crescer",
    consolidacaoAnual: "soma",
    meta: "",
    valorBase: "",
    peso: "1",
    apenasAcompanhamento: false,
    visivelScorecard: true,
    codigo: "",
    descricao: "",
    nivel: "",
    comportamento: "proporcional",
    tipo: "folha",
    modeloFormula: "",
    formula: "",
    filhos: [],
    controleAcesso: "organizacao",
  })

  const [expandedSections, setExpandedSections] = useState({
    metas: true,
    avancado: false,
    hierarquia: false,
    governanca: false,
  })

  const [workspacesAcesso, setWorkspacesAcesso] = useState<Option[]>([])
  const [membrosAcesso, setMembrosAcesso] = useState<Option[]>([])
  const anchorWorkspaces = useComboboxAnchor()
  const anchorMembros = useComboboxAnchor()

  const [showNovoFilhoModal, setShowNovoFilhoModal] = useState(false)
  const [novoFilho, setNovoFilho] = useState<NovoFilho>({
    nome: "",
    unidade: "",
    perspectiva: "",
  })

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "perspectiva" && value && !prev.codigo) {
        updated.codigo = gerarCodigo(value as string)
      }
      if (field === "modeloFormula" && value) {
        const letras = prev.filhos.map((_, i) => String.fromCharCode(65 + i))
        switch (value) {
          case "soma":
            updated.formula = letras.join(" + ")
            break
          case "media":
            updated.formula =
              letras.length > 0
                ? `(${letras.join(" + ")}) / ${letras.length}`
                : ""
            break
          case "produto":
            updated.formula = letras.join(" * ")
            break
          case "balanco":
            updated.formula =
              letras.length >= 2 ? `${letras[0]} - ${letras[1]}` : ""
            break
          case "soma_periodica":
            updated.formula = `YTD(${letras.join(" + ")})`
            break
          case "media_periodica":
            updated.formula = `AVG(${letras.join(", ")})`
            break
          case "ultimo_valor":
            updated.formula = letras.length > 0 ? `LAST(${letras[0]})` : ""
            break
          case "personalizado":
            updated.formula = ""
            break
        }
      }
      return updated
    })
  }

  function associarFilhoExistente(ind: IndicadorExistente) {
    if (formData.filhos.find((f) => f.id === ind.value)) return
    const novo: Filho = {
      id: ind.value,
      codigo: ind.codigo,
      nome: ind.label,
      perspectiva: ind.perspectiva,
      unidade: ind.unidade,
      isNew: false,
    }
    updateField("filhos", [...formData.filhos, novo])
  }

  function removerFilho(id: string) {
    setFormData((prev) => ({
      ...prev,
      filhos: prev.filhos.filter((f) => f.id !== id),
    }))
  }

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  function adicionarNovoFilho() {
    if (!novoFilho.nome || !novoFilho.unidade || !novoFilho.perspectiva) {
      alert("Preencha todos os campos obrigatórios")
      return
    }
    const novo: Filho = {
      id: `temp-${Date.now()}`,
      codigo: gerarCodigo(novoFilho.perspectiva),
      nome: novoFilho.nome,
      perspectiva: novoFilho.perspectiva,
      unidade: novoFilho.unidade,
      isNew: true,
    }
    updateField("filhos", [...formData.filhos, novo])
    setNovoFilho({ nome: "", unidade: "", perspectiva: "" })
    setShowNovoFilhoModal(false)
  }

  const consolidacaoLabel =
    formData.consolidacaoAnual === "soma"
      ? "Soma periódica"
      : formData.consolidacaoAnual === "media"
        ? "Média periódica"
        : "Último valor"

  return (
    <>
      <PageHeader title="Criar Indicador" />

      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Coluna principal ── */}
          <div className="space-y-4 lg:col-span-2">

            {/* Informações essenciais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Informações Essenciais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="nome">Nome do Indicador</FieldLabel>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => updateField("nome", e.target.value)}
                      placeholder="Ex: Receita Bruta Mensal"
                    />
                  </Field>

                  <FieldGroup className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="unidade">Unidade</FieldLabel>
                      <Select
                        value={formData.unidade}
                        onValueChange={(v) => updateField("unidade", v ?? "")}
                      >
                        <SelectTrigger id="unidade" className="w-full">
                          <SelectValue placeholder="Selecione..." />
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
                      <FieldLabel htmlFor="perspectiva">
                        Perspectiva BSC
                      </FieldLabel>
                      <Select
                        value={formData.perspectiva}
                        onValueChange={(v) =>
                          updateField("perspectiva", v ?? "")
                        }
                      >
                        <SelectTrigger id="perspectiva" className="w-full">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Financeiro">
                              Financeiro
                            </SelectItem>
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
                      <FieldLabel htmlFor="frequencia">Frequência</FieldLabel>
                      <Select
                        value={formData.frequencia}
                        onValueChange={(v) =>
                          updateField("frequencia", v ?? "")
                        }
                      >
                        <SelectTrigger id="frequencia" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Diário">Diário</SelectItem>
                            <SelectItem value="Semanal">Semanal</SelectItem>
                            <SelectItem value="Mensal">Mensal</SelectItem>
                            <SelectItem value="Trimestral">
                              Trimestral
                            </SelectItem>
                            <SelectItem value="Anual">Anual</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <FieldSet>
                      <FieldLegend variant="label">Polaridade</FieldLegend>
                      <RadioGroup
                        value={formData.polaridade}
                        onValueChange={(v) => updateField("polaridade", v)}
                        className="flex flex-row gap-4"
                      >
                        <Field orientation="horizontal">
                          <RadioGroupItem value="crescer" id="crescer" />
                          <FieldLabel
                            htmlFor="crescer"
                            className="flex cursor-pointer items-center gap-1.5"
                          >
                            <TrendingUp className="size-3.5 text-green-600" />
                            Crescer
                          </FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                          <RadioGroupItem value="diminuir" id="diminuir" />
                          <FieldLabel
                            htmlFor="diminuir"
                            className="flex cursor-pointer items-center gap-1.5"
                          >
                            <TrendingDown className="size-3.5 text-red-600" />
                            Diminuir
                          </FieldLabel>
                        </Field>
                      </RadioGroup>
                    </FieldSet>
                  </FieldGroup>

                  {formData.frequencia !== "Anual" && (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor="consolidacao">
                          Consolidação Anual
                        </FieldLabel>
                        <FieldDescription>
                          Como o valor anual será calculado
                        </FieldDescription>
                      </FieldContent>
                      <Select
                        value={formData.consolidacaoAnual}
                        onValueChange={(v) =>
                          updateField("consolidacaoAnual", v ?? "")
                        }
                      >
                        <SelectTrigger id="consolidacao" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="soma">
                              Soma periódica (acumulado)
                            </SelectItem>
                            <SelectItem value="media">
                              Média periódica
                            </SelectItem>
                            <SelectItem value="ultimo">
                              Último valor (snapshot)
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Metas & Scorecard */}
            <FormSection
              title="Metas & Scorecard"
              expanded={expandedSections.metas}
              onToggle={() => toggleSection("metas")}
            >
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    id="apenas-acomp"
                    checked={formData.apenasAcompanhamento}
                    onCheckedChange={(checked) =>
                      updateField("apenasAcompanhamento", Boolean(checked))
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="apenas-acomp">
                      Apenas Acompanhamento
                    </FieldLabel>
                    <FieldDescription>
                      Indicador sem meta definida (informativo)
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <FieldGroup className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="base">Valor Base</FieldLabel>
                    <Input
                      id="base"
                      type="number"
                      value={formData.valorBase}
                      onChange={(e) => updateField("valorBase", e.target.value)}
                      disabled={formData.apenasAcompanhamento}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="meta">Meta</FieldLabel>
                    <Input
                      id="meta"
                      type="number"
                      value={formData.meta}
                      onChange={(e) => updateField("meta", e.target.value)}
                      disabled={formData.apenasAcompanhamento}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="peso">Peso no Scorecard</FieldLabel>
                    <Input
                      id="peso"
                      type="number"
                      value={formData.peso}
                      onChange={(e) => updateField("peso", e.target.value)}
                    />
                  </Field>
                </FieldGroup>

                <Field orientation="horizontal">
                  <Checkbox
                    id="visivel"
                    checked={formData.visivelScorecard}
                    onCheckedChange={(checked) =>
                      updateField("visivelScorecard", Boolean(checked))
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="visivel">
                      Visível no Scorecard
                    </FieldLabel>
                    <FieldDescription>
                      Exibir no painel principal
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FormSection>

            {/* Configurações Avançadas */}
            <FormSection
              title="Configurações Avançadas"
              expanded={expandedSections.avancado}
              onToggle={() => toggleSection("avancado")}
            >
              <FieldGroup>
                <FieldGroup className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="nivel">Nível Estratégico</FieldLabel>
                    <Select
                      value={formData.nivel}
                      onValueChange={(v) => updateField("nivel", v ?? "")}
                    >
                      <SelectTrigger id="nivel" className="w-full">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Estratégico">
                            Estratégico
                          </SelectItem>
                          <SelectItem value="Tático">Tático</SelectItem>
                          <SelectItem value="Operacional">
                            Operacional
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="comportamento">
                      Comportamento
                    </FieldLabel>
                    <Select
                      value={formData.comportamento}
                      onValueChange={(v) =>
                        updateField("comportamento", v ?? "")
                      }
                    >
                      <SelectTrigger id="comportamento" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="proporcional">
                            Proporcional
                          </SelectItem>
                          <SelectItem value="binario">
                            Binário (tudo ou nada)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => updateField("descricao", e.target.value)}
                    placeholder="Descreva o indicador..."
                    className="min-h-24"
                  />
                </Field>
              </FieldGroup>
            </FormSection>

            {/* Hierarquia e Fórmula */}
            <FormSection
              title="Hierarquia e Fórmula"
              expanded={expandedSections.hierarquia}
              onToggle={() => toggleSection("hierarquia")}
            >
              <FieldGroup>
                <FieldSet>
                  <FieldLegend variant="label">Tipo do Indicador</FieldLegend>
                  <RadioGroup
                    value={formData.tipo}
                    onValueChange={(v) =>
                      updateField("tipo", v as FormData["tipo"])
                    }
                    className="flex flex-row gap-4"
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="folha" id="tipo-folha" />
                      <FieldContent>
                        <FieldLabel htmlFor="tipo-folha">Folha</FieldLabel>
                        <FieldDescription>Entrada manual de dados</FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="composto" id="tipo-composto" />
                      <FieldContent>
                        <FieldLabel htmlFor="tipo-composto">Composto</FieldLabel>
                        <FieldDescription>Calculado a partir de filhos</FieldDescription>
                      </FieldContent>
                    </Field>
                  </RadioGroup>
                </FieldSet>

                {formData.tipo === "composto" && (
                  <>
                    <Field>
                      <FieldLabel>Indicadores Filhos</FieldLabel>
                      {formData.filhos.length > 0 ? (
                        <div className="mt-1 divide-y rounded-md border">
                          {formData.filhos.map((filho, i) => (
                            <div
                              key={filho.id}
                              className="flex items-center justify-between px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <div>
                                  <p className="font-medium">{filho.nome}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {filho.codigo} · {filho.perspectiva} · {filho.unidade}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removerFilho(filho.id)}
                                aria-label="Remover filho"
                              >
                                <Trash2 className="size-3.5 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Nenhum indicador filho adicionado.
                        </p>
                      )}
                      <div className="mt-2 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-fit"
                          onClick={() => setShowNovoFilhoModal(true)}
                        >
                          <Plus className="size-3.5" />
                          Criar Novo
                        </Button>

                        <Combobox
                          items={indicadoresExistentes.filter(
                            (ind) => !formData.filhos.find((f) => f.id === ind.value)
                          )}
                          onValueChange={(item) => {
                            if (item) associarFilhoExistente(item as IndicadorExistente)
                          }}
                        >
                          <ComboboxInput
                            placeholder="Associar indicador existente..."
                            className="w-full"
                            showClear
                          />
                          <ComboboxContent>
                            <ComboboxEmpty>Nenhum indicador encontrado.</ComboboxEmpty>
                            <ComboboxList>
                              {(item: IndicadorExistente) => (
                                <ComboboxItem key={item.value} value={item}>
                                  <span className="flex-1">{item.label}</span>
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {item.codigo}
                                  </span>
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="modelo-formula">
                        Modelo de Fórmula
                      </FieldLabel>
                      <Select
                        value={formData.modeloFormula}
                        onValueChange={(v) =>
                          updateField("modeloFormula", v ?? "")
                        }
                      >
                        <SelectTrigger id="modelo-formula" className="w-full">
                          <SelectValue placeholder="Selecione um modelo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="soma">Soma (A + B + ...)</SelectItem>
                            <SelectItem value="media">Média ((A + B) / n)</SelectItem>
                            <SelectItem value="produto">Produto (A × B × ...)</SelectItem>
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
                      <FieldLabel htmlFor="formula">Fórmula</FieldLabel>
                      <Input
                        id="formula"
                        value={formData.formula}
                        onChange={(e) => updateField("formula", e.target.value)}
                        placeholder="Ex: (A + B) / 2"
                        className="font-mono"
                        readOnly={formData.modeloFormula !== "personalizado" && formData.modeloFormula !== ""}
                      />
                      <FieldDescription>
                        Letras representam os indicadores filhos na ordem em que aparecem acima.
                      </FieldDescription>
                    </Field>
                  </>
                )}
              </FieldGroup>
            </FormSection>

            {/* Governança e Controle de Acesso */}
            <FormSection
              title="Governança e Controle de Acesso"
              expanded={expandedSections.governanca}
              onToggle={() => toggleSection("governanca")}
            >
              <FieldGroup>
                <FieldSet>
                  <FieldLegend variant="label">Quem pode visualizar este indicador?</FieldLegend>
                  <RadioGroup
                    value={formData.controleAcesso}
                    onValueChange={(v) =>
                      updateField("controleAcesso", v as FormData["controleAcesso"])
                    }
                    className="gap-2"
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="organizacao" id="acesso-org" />
                      <FieldContent>
                        <FieldLabel htmlFor="acesso-org">Toda a organização</FieldLabel>
                        <FieldDescription>
                          Todos os membros do workspace podem visualizar
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="workspaces" id="acesso-ws" />
                      <FieldContent>
                        <FieldLabel htmlFor="acesso-ws">Workspaces específicos</FieldLabel>
                        <FieldDescription>
                          Visível apenas nos workspaces selecionados
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="membros" id="acesso-membros" />
                      <FieldContent>
                        <FieldLabel htmlFor="acesso-membros">Membros específicos</FieldLabel>
                        <FieldDescription>
                          Visível apenas para os membros selecionados
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </RadioGroup>
                </FieldSet>

                {formData.controleAcesso === "workspaces" && (
                  <Field>
                    <FieldLabel>Workspaces com acesso</FieldLabel>
                    <Combobox
                      multiple
                      items={workspaceOptions}
                      value={workspacesAcesso}
                      onValueChange={(v) => setWorkspacesAcesso(v as Option[])}
                    >
                      <ComboboxChips ref={anchorWorkspaces} className="w-full">
                        {workspacesAcesso.map((ws) => (
                          <ComboboxChip key={ws.value}>
                            {ws.label}
                          </ComboboxChip>
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

                {formData.controleAcesso === "membros" && (
                  <Field>
                    <FieldLabel>Membros com acesso</FieldLabel>
                    <Combobox
                      multiple
                      items={membroOptions}
                      value={membrosAcesso}
                      onValueChange={(v) => setMembrosAcesso(v as Option[])}
                    >
                      <ComboboxChips ref={anchorMembros} className="w-full">
                        {membrosAcesso.map((m) => (
                          <ComboboxChip key={m.value}>
                            {m.label}
                          </ComboboxChip>
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
            </FormSection>

            <Button size="lg" className="w-full">
              Salvar Indicador
            </Button>
          </div>

          {/* ── Preview ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-primary p-5 text-primary-foreground">
                    <p className="mb-1 text-sm opacity-80">
                      {formData.nome || "Novo Indicador"}
                    </p>
                    <p className="mb-1 text-3xl font-bold tabular-nums">
                      {formData.meta || "—"}{" "}
                      <span className="text-lg font-normal opacity-80">
                        {formData.unidade}
                      </span>
                    </p>
                    <p className="text-sm opacity-70">
                      Base: {formData.valorBase || "—"} {formData.unidade}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Polaridade</span>
                      <span className="flex items-center gap-1 font-medium">
                        {formData.polaridade === "crescer" ? (
                          <>
                            <TrendingUp className="size-3.5 text-green-600" />
                            Crescer
                          </>
                        ) : (
                          <>
                            <TrendingDown className="size-3.5 text-red-600" />
                            Diminuir
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequência</span>
                      <span className="font-medium">{formData.frequencia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peso</span>
                      <span className="font-medium tabular-nums">
                        {formData.peso || "1"}
                      </span>
                    </div>
                    {formData.codigo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Código</span>
                        <span className="font-mono text-xs font-medium">
                          {formData.codigo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {formData.frequencia !== "Anual" && (
                      <Alert>
                        <Info className="size-4" />
                        <AlertDescription>
                          Consolidação anual: {consolidacaoLabel}
                        </AlertDescription>
                      </Alert>
                    )}
                    {formData.apenasAcompanhamento && (
                      <Alert>
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                          Sem meta definida (apenas acompanhamento)
                        </AlertDescription>
                      </Alert>
                    )}
                    {!formData.visivelScorecard && (
                      <Alert>
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                          Não será exibido no Scorecard
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Novo Filho ── */}
      <Dialog open={showNovoFilhoModal} onOpenChange={setShowNovoFilhoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Indicador Filho</DialogTitle>
            <DialogDescription>
              Preencha as informações básicas do indicador filho.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nome-filho">Nome</FieldLabel>
              <Input
                id="nome-filho"
                value={novoFilho.nome}
                onChange={(e) =>
                  setNovoFilho({ ...novoFilho, nome: e.target.value })
                }
                placeholder="Ex: Receita E-commerce"
              />
            </Field>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Unidade</FieldLabel>
                <Select
                  value={novoFilho.unidade}
                  onValueChange={(v) =>
                    setNovoFilho({ ...novoFilho, unidade: v ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="R$">R$</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="un">un</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Perspectiva</FieldLabel>
                <Select
                  value={novoFilho.perspectiva}
                  onValueChange={(v) =>
                    setNovoFilho({ ...novoFilho, perspectiva: v ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
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

            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                O indicador filho será criado automaticamente ao salvar.
              </AlertDescription>
            </Alert>
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNovoFilhoModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={adicionarNovoFilho}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
