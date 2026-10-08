# Dispatch — OpenCode Bootstrap Prompt
# Paste this as your very first message in an OpenCode session
# opened inside the dispatch/ project directory.
# OpenCode will read AGENTS.md, PRD.md, and DESIGN.md automatically.

---

We're building Dispatch — a personal wire service for builders. I've already
created the project's planning documents (PRD.md, DESIGN.md, AGENTS.md,
opencode.json, the DB schema, LangGraph state and graph skeleton, and agent
prompts). Here's what I need you to build for Phase 0, working in order.
Ask me before making any architecture decision not covered in AGENTS.md.

## What we have

- `infra/postgres/init.sql` — full schema with pgvector
- `packages/agents/graph.py` — LangGraph graph skeleton (nodes imported but
  not yet implemented)
- `packages/agents/state.py` — state TypedDict
- `packages/agents/PROMPTS.md` — all 5 agent system prompts (move each to its
  own .txt file in `packages/agents/prompts/`)
- `.env.example` — env vars

## Phase 0 tasks — build in this order

### Task 1 — Project scaffold
Set up the monorepo structure exactly as described in AGENTS.md:
- `apps/web/` — Next.js 15, TypeScript strict, Tailwind, no component library
- `apps/api/` — FastAPI, Python 3.12, SQLAlchemy 2 async, Alembic
- `packages/agents/` — Python package with `__init__.py`, `constants.py`,
  `state.py` (already written), `graph.py` (already written)
- Root `pyproject.toml` for the Python workspace

For Next.js, set up:
- `app/globals.css` with ALL CSS variables from DESIGN.md (paper/ink/carbon/
  wire/stamp/mint, light and dark)
- `next/font/google` loading Space Grotesk, IBM Plex Sans, IBM Plex Mono
- Tailwind config extending those CSS variables as utility classes

### Task 2 — Implement the agent nodes
Create `packages/agents/nodes/` with one file per node:
- `embed_and_retrieve.py` — embed the dispatch body with OpenAI
  `text-embedding-3-small`, query `dispatches` and `voice_samples` tables
  using pgvector cosine similarity (top 5 each), return as `retrieved_context`
- `strategist.py` — call Anthropic with the strategist prompt, parse JSON
  response, return state fields
- `linkedin_writer.py`, `x_writer.py`, `reddit_writer.py`, `threads_writer.py`
  — each calls Anthropic with its platform prompt; after completing, puts a
  `{"platform": "...", "status": "ready"}` event on `state["event_queue"]`
  if it's not None
- `critic_linkedin.py` through `critic_threads.py` — each runs the critic
  prompt on the corresponding draft, parses JSON, updates `drafts[platform]`
  with score/note/passed; if passed is False, updates the event with
  `{"platform": "...", "status": "flagged"}`

All prompts are loaded from `packages/agents/prompts/*.txt` files.
Never hardcode prompt text in Python.

### Task 3 — FastAPI backend
Build `apps/api/` with:

Routers:
- `GET /projects` — list all projects
- `POST /projects` — create a project
- `GET /projects/{id}` — project detail with milestones and recent dispatches
- `GET /dispatches` — list dispatches (sorted by created_at desc, paginated)
- `POST /dispatches` — log a new dispatch (body, project_id)
- `GET /dispatches/{id}/generate` — SSE endpoint: runs the LangGraph pipeline,
  streams stamp events from the event_queue as they arrive, closes when
  pipeline completes. Event format: `data: {"platform":"linkedin","status":"writing"}\n\n`
- `GET /dispatches/{id}/drafts` — get all drafts for a dispatch
- `PATCH /drafts/{id}` — update a draft (body, status)
- `GET /voice-profile` — get the active cross-platform voice profile
- `POST /voice-profile` — create/replace (takes raw past posts, calls Claude
  to derive the profile, stores it)

Services:
- `apps/api/services/generation.py` — invokes `packages/agents/graph.py`
  `run_pipeline()`, gathers event_queue, persists resulting drafts to DB
- `apps/api/services/embedding.py` — wraps OpenAI embeddings client

### Task 4 — Frontend: The Wire + The Desk
Build the two-panel layout per DESIGN.md exactly.

**The Wire (left rail, 320px)**
- Scrollable list of dispatch cards
- Each card: timestamp (IBM Plex Mono, `--color-carbon`), project name
  (Space Grotesk, `--color-ink`), truncated dispatch body, row of 4 outlet
  stamp badges
- Outlet stamp: 20px circle, platform initial (LI/X/R/T), states: pending
  (outline only), writing (opacity pulse animation), ready (fill `--color-wire`),
  flagged (fill `--color-stamp`), posted (fill `--color-mint`)
- The STAMP ANIMATION is the signature element: when a draft completes,
  animate the badge: scale 1 → 0.92 → 1.04 → 1 over 180ms, fill transition,
  1px ring flash that fades. Respect `prefers-reduced-motion`.
- "+ New dispatch" button at the top opens a modal: project selector (dropdown)
  + textarea, POST to `/dispatches`, then immediately opens the SSE stream for
  that dispatch and starts animating stamps as results come in

**The Desk (main area)**
- Platform tabs: LI / X / RD / TH — mono font
- Editable textarea for the draft body
- Below the textarea: critic score + note in mono, styled as a margin note
  (not a badge or card — just `color: --color-carbon`, italic, small)
- "Approve & queue" and "Regenerate" buttons
- When no dispatch is selected: wire-room empty state ("Nothing in the wire.
  Log a dispatch to start.")

Use SSE (EventSource) to connect to `/dispatches/{id}/generate` after a new
dispatch is logged, updating stamp states in real-time.

### Task 5 — Seed data
`scripts/projects.json` with all 5 projects (including Dispatch itself).
`scripts/seed_projects.py` that reads that JSON, embeds each description,
and upserts to the DB. Run instructions in README.

### Task 6 — README
A minimal README with:
- What Dispatch is (2 sentences)
- Prerequisites (Node 20, Python 3.12, Docker)
- Setup: `cp .env.example .env`, fill keys, `docker compose up -d`,
  `python scripts/seed_projects.py`, `pnpm dev` (web) + `uvicorn` (api)
- Phase roadmap (0 through 3, one line each)

---

Start with Task 1. Confirm the scaffold structure before moving to Task 2.
