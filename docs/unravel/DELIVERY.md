# Ravel approved delivery plan

Historical delivery record. See [UNRAVEL_PLAN.md](UNRAVEL_PLAN.md) and [UNRAVEL_VERIFICATION.md](UNRAVEL_VERIFICATION.md) for the current local release and its measured limits.

## Architecture

Reuse the actual React/Vite frontend, Tailwind, Radix primitives and React Router. FastAPI exposes one /api prefix in development and production. Local SQLite through SQLAlchemy/aiosqlite has a separate Ravel migration history; existing PostgreSQL content data is not converted or deleted. The legacy content pipeline is no longer the active app.

Provide default `ravel` with browser opening after readiness, `ravel serve` for manual opening, and `ravel serve --open` for explicit opening. `ravel doctor` checks packaged interface, writable storage and port. Each accepts `--home` and `--port`. These commands start loopback API, worker, database and built frontend. One durable local worker processes snapshot/analysis/AI/check jobs, with persisted events and reconnectable SSE. Interrupted indexing can resume; interrupted checks require an explicit rerun. Restrict host/origin access and cross-site mutation.

Models: projects, immutable snapshots, source chunks, symbols/relationships, features, investigations, discoveries, check profiles/runs, jobs/events. Source hashes associate every explanation and result with a version, including dirty/non-Git folders.

Ingestion: local folder, ignore rules, secret/generated/binary/dependency exclusions, no escaping symlinks; 2,500 files, 512KiB/file, 30MiB total limits reported to the user. Tree-sitter parses Python/JS/TS/TSX. Literal relationships are direct; unresolved/inferred links stay labelled. SQLite FTS5 plus related symbols supplies context. No embeddings in v1.

AI: initial Anthropic provider with ANTHROPIC_API_KEY and RAVEL_MODEL. Pydantic-valid structured output, existing source citations, 60s timeout, at most two transient retries, bounded context, cached by snapshot/question/prompt/model. Selected excerpts go to the provider after explicit first-use consent. Keys never enter browser persistence, exports or logs.

## Public interfaces

- Projects: register/list/read/remove local folder registrations; removal never deletes source.
- Snapshots: capture/read/compare immutable versions.
- Features: list/read evidenced implementation paths and curiosity questions.
- Investigations: create/read/update, ask questions, save discoveries.
- Check profiles/runs: configure explicit trusted commands, run/read/cancel.
- Jobs: inspect/stream/cancel; event sequence enables reconnection.
- Exports: Markdown/JSON investigation, with outcomes distinguished from suggestions.
- Settings: provider/model/capability/storage status; never return secrets.
- OpenAPI-derived frontend types/client keep contracts aligned.

Check profiles use selected existing npm scripts or pytest, executable/argv/cwd, five-minute timeout. No AI-generated commands. Trust local projects before execution; checks are not sandboxed. Capture exit code, output, duration and pre/post source identity. Cancel descendants on Windows/Linux. Changes during execution invalidate a claim about a stable version.

## Public demo

Same frontend, fixture-backed adapter, browser-local notes. Three curated investigations: route prefix mismatch, draft persistence, parallel writing flow. Prepared explanations are labelled. The initial demo does not show recorded check results: real command execution is demonstrated in the local workshop and QA suite. No live model calls, arbitrary folder access or command execution in demo. Static Vercel configuration; publishing is a separate action.

## Build sequence

1. Decision records, tokens, navigation, landing and complete demo workbench.
2. Local registration, snapshots, parsing/search/evidence.
3. Explanations, curiosity branches, saved/resumable discoveries.
4. Version comparison and trusted real checks.
5. Documentation, install flow, accessibility/performance and pilot.

## Acceptance and tests

Test snapshot bounds/exclusions/dirty trees, relationships and unsupported syntax, citation validation, provider errors/timeouts, durable job restart/reconnect/cancel, check pass/fail/timeout/descendants/source changes, and full connect→explore→save→reload→external change→compare→check→export. Unknown API routes must not become SPA HTML.

Windows is the owner's environment; test portability to Linux. Keep a ≥30-question human-reviewed evaluation set across three projects. Measure explanation correctness separately from citation existence. Product pilot: owner + five builders, usual assistant vs Ravel, alternate comparable tasks, report actual outcomes and return use. No résumé improvements are presumed.

## Package delivery

The wheel contains compiled frontend files in `apps/ravel/_web`. Installed servers prefer that directory; source development falls back to `byline/dist`. Build frontend then `python -m build --wheel`. End users need Python 3.12+ only. `scripts/verify_install.py` creates a fresh external environment, removes Node from runtime PATH, checks direct docs/assets and persists source/discoveries across restart. Publication and download hosting are separate release actions.

The frontend build also generates the landing page, docs overview and ten guides as readable HTML from the same React/Markdown sources. Installed serving resolves their directory indexes before the interactive app fallback. Public reading works without JavaScript; the project workbench remains an interactive browser application. See DESIGN_REVISION.md for the 4 October refinement, verification and screenshot review.
