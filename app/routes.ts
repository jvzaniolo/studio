import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("indicador", "routes/indicador.tsx"),
  ]),
] satisfies RouteConfig
