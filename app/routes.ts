import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("indicador", "routes/indicador.tsx"),
    route("lideranca", "routes/lideranca.tsx"),
    route("diversidade", "routes/diversidade.tsx"),
    route("diversidade/respondentes-insuficientes", "routes/diversidade-respondentes.tsx"),
    route("engajamento", "routes/engajamento.tsx"),
    route("criar-indicador", "routes/criar-indicador.tsx"),
    route("indicadores-ativos", "routes/indicadores-ativos.tsx"),
    route("avaliacao-fornecedores/visao-geral", "routes/avaliacao-fornecedores/visao-geral.tsx"),
    route("avaliacao-fornecedores/acompanhamento", "routes/avaliacao-fornecedores/acompanhamento.tsx"),
    route("avaliacao-fornecedores/fornecedor/:id", "routes/avaliacao-fornecedores/fornecedor.tsx"),
    route("avaliacao-fornecedores/resultado/:id", "routes/avaliacao-fornecedores/resultado.tsx"),
    route("materialidade", "routes/materialidade.tsx"),
    route("materialidade/tema/:id", "routes/materialidade.tema.$id.tsx"),
    route("materialidade/mapeamentos", "routes/materialidade.mapeamentos.tsx"),
    route("materialidade/benchmark", "routes/materialidade.benchmark.tsx"),
    route("materialidade/stakeholders", "routes/materialidade.stakeholders.tsx"),
    route("materialidade/comentarios", "routes/materialidade.comentarios.tsx"),
    route("materialidade/temas", "routes/materialidade.temas.tsx"),
    route("materialidade/prioritarios", "routes/materialidade.prioritarios.tsx"),
    route("okrs", "routes/okrs.tsx"),
    route("iniciativas", "routes/iniciativas.tsx"),
    route("configuracoes", "routes/configuracoes.tsx"),
  ]),
] satisfies RouteConfig
