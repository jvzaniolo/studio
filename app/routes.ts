import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("indicador", "routes/indicador.tsx"),
    route("criar-indicador", "routes/criar-indicador.tsx"),
    route("indicadores-ativos", "routes/indicadores-ativos.tsx"),
    route("avaliacao-fornecedores/visao-geral", "routes/avaliacao-fornecedores/visao-geral.tsx"),
    route("avaliacao-fornecedores/acompanhamento", "routes/avaliacao-fornecedores/acompanhamento.tsx"),
    route("avaliacao-fornecedores/fornecedor/:id", "routes/avaliacao-fornecedores/fornecedor.tsx"),
    route("avaliacao-fornecedores/resultado/:id", "routes/avaliacao-fornecedores/resultado.tsx"),
    route("materialidade", "routes/materialidade.tsx"),
    route("materialidade/tema/:id", "routes/materialidade.tema.$id.tsx"),
    route("materialidade/mapeamentos", "routes/materialidade.mapeamentos.tsx"),
  ]),
] satisfies RouteConfig
