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
  ]),
] satisfies RouteConfig
