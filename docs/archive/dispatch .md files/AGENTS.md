# Dispatch — AGENTS.md

This file is read by OpenCode at the start of every session. It is the authoritative
source of truth for project structure, coding patterns, and what the codebase does.
Update it whenever the architecture changes.

---

## What this project is

Dispatch is a personal content engine for builders. It maintains a persistent memory of
your software projects, watches for things worth posting about, writes platform-native
drafts for LinkedIn / X / Reddit / Threads using a multi-agent LangGraph pipeline, and
(eventually) posts them via Composio.

**Single-user, self-hosted, no SaaS.** Never add multi-tenancy, billing, or team features
without an explicit instruction to do so.

---

## Monorepo structure

```
dispatch/
├── apps/
│   ├── web/              # Next.js 15 App Router frontend
│   └── api/              # FastAPI backend
├── packages/
│   └── agents/           # LangGraph agent pipeline (Python package)
├── infra/
│   ├── docker-compose.yml
│   └── postgres/
│       └── init.sql      # Schema — source of truth for the DB
├── AGENTS.md             # This file
├── PRD.md
├── DESIGN.md
└── opencode.json
```

---

## Apps/api — FastAPI

- Python 3.12, FastAPI, SQLAlchemy 2 (async), Alembic for migrations.
- Postgres connection string from `DATABASE_URL` env var.
- OpenAI client from `OPENAI_API_KEY` for embeddings only (`text-embedding-3-small`,
  1536 dimensions).
- Anthropic client from `ANTHROPIC_API_KEY` for all generation/critique via LangGraph.
- Composio client from `COMPOSIO_API_KEY` for platform posting (Phase 3+).
- All routes are async. No synchronous DB calls.
- Route files live in `apps/api/routers/`. One file per resource group:
  `projects.py`, `dispatches.py`, `drafts.py`, `outlets.py`, `voice.py`.
- Pydantic v2 models in `apps/api/schemas/`.
- Business logic (not route handling) lives in `apps/api/services/`.
- The LangGraph pipeline is invoked from `apps/api/services/generation.py` via
  `packages/agents` — never inline pipeline logic in route handlers.

### Naming conventions (api)

- Endpoint paths: plural nouns, kebab-case: `/projects`, `/dispatches/{id}/generate`.
- Pydantic models: `ProjectCreate`, `ProjectRead`, `DispatchCreate`, etc.
- SQLAlchemy models: `Project`, `Dispatch`, `Draft`, `VoiceSample`, `NarrativeArc`.
- Services: `create_project()`, `log_dispatch()`, `generate_drafts()`, etc.

---

## Apps/web — Next.js

- Next.js 15 App Router, TypeScript strict mode, Tailwind CSS.
- **No component library** (no shadcn, no Radix-UI, no MUI). Build components from
  scratch per DESIGN.md — this keeps the visual identity distinctive.
- Fonts: Space Grotesk, IBM Plex Sans, IBM Plex Mono — loaded via `next/font/google`.
- CSS variables for the full token system (defined in `apps/web/app/globals.css`):
  ```css
  :root {
    --color-paper: #F6F4EF;
    --color-ink: #1F1E1B;
    --color-carbon: #6B6A66;
    --color-wire: #5B5BD6;
    --color-stamp: #D4572A;
    --color-mint: #3F7D5C;
  }
  .dark {
    --color-paper: #17161A;
    --color-ink: #F2F0EB;
    --color-carbon: #9C9A95;
    --color-wire: #9C97F2;
    --color-stamp: #F08A5D;
    --color-mint: #7FCBA4;
  }
  ```
- Components live in `apps/web/components/`. Subdirectories: `wire/` (feed), `desk/`
  (composing desk), `stamps/` (outlet badge components), `ui/` (primitives like Button,
  Input).
- Server components by default. Client components only where interactivity demands it;
  always `"use client"` at the top and a comment explaining why.
- API calls from the frontend go to `/api/` — Next.js route handlers proxy to FastAPI to
  avoid CORS complexity.

### Naming conventions (web)

- Components: PascalCase files and exports. `DispatchCard`, `OutletStamp`, `TheWire`,
  `TheDesk`.
- Hooks: `useDispatch`, `useDrafts`, `useGeneration` — in `apps/web/hooks/`.
- Do not duplicate type definitions — a shared types package at `packages/types/` if
  types need to cross app boundaries.

---

## Packages/agents — LangGraph pipeline

- Pure Python package, imported by the API service.
- One file per agent node: `strategist.py`, `linkedin_writer.py`, `x_writer.py`,
  `reddit_writer.py`, `threads_writer.py`, `critic.py`.
- The graph is defined in `packages/agents/graph.py`.
- State type is a TypedDict in `packages/agents/state.py`.
- All agent system prompts are in `packages/agents/prompts/` as `.txt` files — not
  hardcoded in Python strings. Load with `Path(__file__).parent / "prompts" / "...txt"`.
- The pipeline streams results: each writer node emits to a queue consumed by the API
  route, which SSE-streams stamp updates to the frontend. This is what powers the
  real-time stamp animation.

---

## Database rules

- Never modify `infra/postgres/init.sql` to fix a bug — use an Alembic migration.
- The `embedding` column uses type `vector(1536)` from pgvector.
- All tables have `id uuid default gen_random_uuid()`, `created_at`, `updated_at`.
- Foreign keys are always named `{table}_id`.
- Soft deletes: add `deleted_at timestamptz` when needed; never hard-delete voice samples
  or dispatches.

---

## Environment variables

```
# Required from day 1
DATABASE_URL=postgresql+asyncpg://dispatch:dispatch@localhost:5432/dispatch
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...        # embeddings only

# Required from Phase 3
COMPOSIO_API_KEY=...
```

Copy `.env.example` to `.env`. Never commit `.env`.

---

## Code quality rules

1. **No placeholder code.** If a function isn't implemented yet, raise
   `NotImplementedError("Phase N")` — don't write `pass` or `# TODO` silently.
2. **No magic strings.** Platform names go in `packages/agents/constants.py` as a
   `Platform` Literal type: `Platform = Literal["linkedin", "x", "reddit", "threads"]`.
3. **Streaming is real.** The stamp animation depends on SSE from `/dispatches/{id}/
   generate` — don't turn this into a polling endpoint without being told to.
4. **Composio calls live only in** `apps/api/services/publishing.py`. Nowhere else.
5. **LangGraph state is immutable in nodes** — nodes return a partial state dict, never
   mutate the input.
6. **Every new route needs a brief docstring** explaining what it does and what auth is
   expected (currently: none / single-user assumption).
7. **Migrations before code** — if a schema change is needed, write the Alembic migration
   first, confirm it, then write the code that depends on it.

---

## What's explicitly out of scope (refuse if asked)

- Multi-tenancy, user accounts, auth beyond a simple single-user secret
- Billing, subscription management
- Fully autonomous posting (every draft requires human approval)
- A public-facing marketing site for Dispatch itself

---

## Seed data

The following projects should be inserted on first run (`infra/postgres/seed.sql`):

| id (use fixed UUIDs for reproducibility) | name | slug | status |
|---|---|---|---|
| `a1b2c3d4-...` | fltrd.tech | fltrd | active |
| `b2c3d4e5-...` | Miryn | miryn | active |
| `c3d4e5f6-...` | Stash | stash | active |
| `d4e5f6g7-...` | ChaiPaani | chaipaani | active |
| `e5f6g7h8-...` | Dispatch | dispatch | active |

Full descriptions and stacks are inserted at setup time by running
`scripts/seed_projects.py` — which reads from `scripts/projects.json`.
