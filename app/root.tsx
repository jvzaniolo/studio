import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"

import type { Route } from "./+types/root"
import "./app.css"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />
        <Links />
      </head>
      <script dangerouslySetInnerHTML={{__html: `(function(){var t=localStorage.getItem('theme'),m=localStorage.getItem('theme-mode'),a=localStorage.getItem('accent-color');if(t==='dark')document.documentElement.classList.add('dark');if(m==='minimalista')document.documentElement.classList.add('theme-minimal');if(m==='colorido')document.documentElement.classList.add('theme-colorful');var cs={roxo:[301.924,0.265,0.496],azul:[250,0.22,0.46],verde:[145,0.18,0.46],teal:[193,0.16,0.48],rosa:[340,0.22,0.52],laranja:[42,0.21,0.60]};var c=cs[a];if(c){var el=document.documentElement;el.style.setProperty('--ac-h',c[0]);el.style.setProperty('--ac-c',c[1]);el.style.setProperty('--ac-l',c[2]);}})();`}} />
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
