# Byline

**Your byline. Everywhere you ship.**

Byline is an open-source multi-agent content engine for developer-founders who build in public. It watches your GitHub, listens for voice notes, and accepts quick captures — then runs a 5-agent LangGraph pipeline to produce platform-native drafts for LinkedIn, X, Reddit, and Threads.

## Architecture

```
Milestone → [Strategist] → [Writers ×4] → [Critic] → You review → Post
```

- **Strategist** — decides if it's post-worthy, picks angle and platforms
- **4 Writers** — LinkedIn, X, Reddit, Threads (parallel, per strategist routing)
- **Critic** — scores each draft for voice match, platform fit, and AI slop detection
- **The Desk** — web UI to review, edit, and approve drafts
- **The Watcher** — GitHub webhooks + voice notes (Phase 2)

## Stack

| Layer | Tech |
|-------|------|
| Pipeline | Python · LangGraph · Claude Sonnet 4.6 |
| Backend | FastAPI · asyncpg · PostgreSQL 16 + pgvector |
| Frontend | TanStack React · Tailwind v4 · shadcn/ui |
| Vector store | pgvector (cosine similarity) |

## Quick start

### Prerequisites
- Python 3.12+
- Docker Desktop (for PostgreSQL + pgvector)
- Node.js 20+

### 1. Start PostgreSQL

```bash
cd infra
docker compose up -d
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY
```

### 3. Install and run

```bash
pip install -r requirements.txt  # or install from pyproject.toml
python scripts/seed_projects.py

# Start the API
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000

# Or use the CLI directly (in another terminal)
python cli.py log "shipped semantic search on fltrd.tech using pgvector"
python cli.py projects            # list your projects
```

### 4. Start the frontend

```bash
cd lovable-project
npm install
npm run dev
```

Open http://localhost:8081 in your browser.

## CLI

```bash
# Log a milestone and generate drafts
python cli.py log "your milestone here"

# Target a specific project
python cli.py log "fixed n+1 query" --project byline

# List projects
python cli.py projects
```

## Pipeline

The generation pipeline in `packages/agents/graph.py`:

1. **embed_and_retrieve** — embeds the milestone, fetches similar past dispatches + voice samples via pgvector
2. **strategist** — LLM decides: post-worthy? angle? which platforms?
3. **writers** — one per platform, runs in parallel with conditional fan-out
4. **critic** — scores each draft (1-10), flags voice mismatches and AI slop
5. **Drafts saved** to PostgreSQL, ready for review in The Desk

Fallbacks exist for every node — the pipeline works without an LLM or database connection.

## Phase roadmap

- **Phase 0** ✅ CLI pipeline — milestone → 4 drafts in terminal
- **Phase 1** 🏗️ Web UI — The Wire + The Desk (in progress)
- **Phase 2** ⏳ The Watcher — GitHub webhooks, voice notes, voice profile extractor
- **Phase 3** ⏳ Distribution — Composio posting + engagement analytics

## License

MIT — built in public by [Sahil](https://github.com/phnxsahil).
