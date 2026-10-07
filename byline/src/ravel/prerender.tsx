import { Suspense } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Landing from "./Landing";
import Docs, { guides } from "./Docs";
import "./ravel.css";

export const pages = [
  { path: "/", title: "Unravel — Understand the app you built." },
  { path: "/docs", title: "Documentation — Unravel" },
  ...guides.map((guide) => ({
    path: `/docs/${guide.slug}`,
    title: `${guide.title} — Unravel docs`,
  })),
];

export function render(path: string) {
  return renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <StaticRouter location={path}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/docs"
            element={
              <Suspense>
                <Docs />
              </Suspense>
            }
          />
          <Route
            path="/docs/:slug"
            element={
              <Suspense>
                <Docs />
              </Suspense>
            }
          />
        </Routes>
      </StaticRouter>
    </QueryClientProvider>,
  );
}

