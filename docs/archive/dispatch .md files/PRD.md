# Dispatch — Product Requirements Document

> Working name: **Dispatch**. Borrowed from wire-service language (a "dispatch" is a report
> sent from the field to be distributed to many outlets) — which is exactly what this
> product does with your shipped work. Rename freely; it's used as a placeholder
> throughout this doc and the codebase.

## 1. Vision

Dispatch is a personal wire service for builders. You ship things. Dispatch remembers
what you've built, decides what's actually worth telling people, writes it the way you'd
write it, adapts it for LinkedIn / X / Reddit / Threads, and (eventually) sends it out —
so that shipping and being visible about shipping stop competing for your time.

The closest comparison the user gave is **Littlebird** — an assistant that "already knows
your work" so you never re-explain context. Dispatch takes that ethos but scopes it to
something buildable solo: instead of watching your whole screen, it builds memory from
things you'd be capturing anyway (git activity, a 30-second voice note, a quick text log)
plus a standing knowledge base of your own projects.

## 2. Problem

- Building in public compounds (job search visibility, startup audience, personal brand),
  but the actual bottleneck is rarely "writing skill" — it's (a) remembering what you did,
  (b) judging whether it's post-worthy, (c) reformatting for 4 different platforms with
  different norms, and (d) not getting your Reddit account shadow-banned for sounding like
  an ad.
- Existing tools (Buffer, Typefully, Postiz, Bolta, Tonemark, etc.) solve rewriting and
  scheduling, but treat every input as equally worth posting and have no persistent memory
  of *your specific projects* — every session starts from zero context.

## 3. Users

- **v1**: single user (the founder/builder themselves). Multi-project, single-tenant.
  Hard requirement: don't build multi-tenancy, teams, or billing in v1 — it's pure scope
  creep for a tool one person uses.
- **v2 (explicitly out of scope for now)**: other solo builders. If v1 proves useful,
  multi-tenancy is a deliberate, separate phase.

## 4. Goals & success metrics

- Time from "I shipped X" to "4 platform-appropriate drafts ready to review" under 2
  minutes.
- Drafts need under ~30% edits before posting (rough proxy: edit distance between
  generated and final text).
- Net effect: posting cadence increases without it becoming a second job.
- For the builder: this is shipped project #5, open-sourceable, and doubles as the engine
  that produces build-in-public content about itself and the other four projects.

## 5. Core concepts (the data model in plain language)

| Concept | What it is |
|---|---|
| **Project** | One shipped thing (fltrd.tech, Miryn, Stash, ChaiPaani, Dispatch itself). Description, stack, status, links. |
| **Dispatch** | A logged update/milestone — a feature shipped, a metric, a lesson, a bug fixed. Comes from manual entry, GitHub activity, or a voice note. |
| **Voice profile** | A description of how the builder writes, derived from their past posts, used to keep generated drafts from sounding generic. |
| **Narrative arc** | A storyline spanning multiple dispatches/projects over time — e.g. "Job search 2026" or "Building Dispatch in public" — so posts build a story instead of being disconnected announcements. |
| **Draft** | A generated, platform-specific post tied to one dispatch. Has a status (draft / approved / scheduled / posted) and, once posted, engagement numbers. |
| **Outlet** | A connected platform (LinkedIn, X, Reddit, Threads) via Composio. |

## 6. Functional requirements by phase

### Phase 0 — Memory + generation (target: one weekend)

- **FR1** CRUD for projects; seed with the 4 real projects + Dispatch itself.
- **FR2** Log a dispatch via a simple text form.
- **FR3** On logging, embed the dispatch text and retrieve relevant project context +
  voice samples via pgvector similarity search.
- **FR4** LangGraph pipeline: `retrieve_context → strategist → writer nodes (conditional
  per platform) → critic`.
- **FR5** Dashboard with two views: **The Wire** (chronological list of dispatches) and
  **The Desk** (the dispatch currently open, showing all generated drafts side by side,
  editable, with critic scores).
- **FR6** One-time voice profile import: paste past posts, get back a structured profile
  stored and used in writer prompts.

**Definition of done**: type a dispatch → see 2-4 platform drafts with critic feedback,
within ~30 seconds, no posting yet.

### Phase 1 — Review workflow & narrative arcs

- **FR7** Approve / edit / reject drafts. Edited drafts are stored and can later be used
  to refine the voice profile.
- **FR8** Create and manage narrative arcs; tag dispatches to an arc; strategist considers
  active arcs when choosing an angle.
- **FR9** "Hold for later" — strategist can mark a dispatch as not currently post-worthy;
  held dispatches resurface when a related dispatch arrives (e.g. batch three small fixes
  into one "this week in X" post).

### Phase 2 — Ambient capture (the "Littlebird" layer)

- **FR10** GitHub webhook: commits/PRs/releases on watched repos become low-confidence
  draft dispatches awaiting confirmation — you're not re-typing what you just did.
- **FR11** Voice note capture: record a 30-second note, Whisper transcribes it into a
  dispatch.
- **FR12** A tiny CLI (`dispatch log "..."`) for quick-capture from the terminal — fits a
  developer's existing workflow better than opening a dashboard.

### Phase 3 — Distribution via Composio

- **FR13** Connect outlets (LinkedIn, X, Reddit) through Composio's managed OAuth — no
  custom OAuth flows to build. Confirm Threads support separately (see Risks).
- **FR14** Post or schedule approved drafts via Composio tool calls.
- **FR15** Reddit guardrails: per-subreddit cadence limits, and the critic must
  explicitly pass a "does not read as promotional" check before a Reddit draft can be
  approved.
- **FR16** Pull engagement metrics post-publish where the API allows; store against the
  draft and feed into the voice profile / strategist's "avoid repeating" list.

## 7. Non-functional requirements

- Self-hostable via `docker compose up` (Postgres+pgvector, Redis for Phase 2+).
- Single-user auth only — a single password/session is enough; don't build a full auth
  system.
- Cost-aware: cache embeddings, batch LLM calls, use a cheaper model for the critic than
  for generation.
- All platform credentials live in Composio, not in this app's database.

## 8. Design

See `DESIGN.md`. One-line summary: a "wire room" visual concept — a live feed of
dispatches on one side, a composing desk on the other, with a signature "stamp" animation
when each platform's draft completes.

## 9. Technical architecture (summary)

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind
- **Backend**: FastAPI (Python)
- **DB**: Postgres 16 + pgvector
- **Queue**: Redis (from Phase 2)
- **Orchestration**: LangGraph
- **Generation/critique**: Anthropic API (Claude)
- **Embeddings**: OpenAI `text-embedding-3-small` (1536-dim) — swap later if needed,
  schema keeps dimension configurable
- **Distribution**: Composio (LinkedIn, X, Reddit toolkits confirmed; Threads TBD)
- **Dev agent**: OpenCode (see `AGENTS.md`)

## 10. Out of scope (v1)

- Other users, teams, billing
- Engagement analytics dashboards beyond raw numbers per draft
- Image/video generation for posts (manual upload is fine for now)
- Fully autonomous posting without human approval — every draft requires explicit
  approval through Phase 2; auto-approval for specific narrative arcs is a possible
  Phase 3+ addition, not a v1 requirement

## 11. Risks / open questions

- **LinkedIn**: Composio's LinkedIn toolkit covers posting/sharing, but personal-profile
  posting permissions can be more restrictive than company-page posting — verify scopes
  during Phase 3 setup before relying on it.
- **Threads**: not confirmed in Composio's toolkit list as of writing — may require
  direct Meta Graph API integration as a fallback.
- **Reddit ban risk**: mitigated by the critic's promotional-tone check and manual review
  in Phases 0-2; cadence limits in Phase 3.
- **Voice profile quality**: depends on volume of past posts available. If thin at
  launch, the profile improves as approved/edited drafts accumulate (FR7).
