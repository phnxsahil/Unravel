# BYLINE — Master Agent Context
> OpenCode reads this file automatically at session start.
> This is the single source of truth for the entire project.
> Do not ask clarifying questions covered here. Build.

---

## 0. What is Byline?

Byline is an open-source multi-agent content engine for developer-founders who build in public.

It watches your GitHub, listens for voice notes, and accepts quick captures. When it detects
something worth saying, a 5-agent LangGraph pipeline runs: a Strategist decides the angle and
platforms, four platform Writers produce native drafts (LinkedIn, X, Reddit, Threads), and a
Critic scores each one for voice match and platform fit. You review, edit, and approve from
a web dashboard. Composio posts for you.

**The key positioning:** Other tools wait for you to bring content. Byline watches and finds it.

**Tagline:** Your byline. Everywhere you ship.
**Domain:** byline.so
**License:** MIT
**Stack:** FastAPI (Python) · Next.js 14 (TypeScript) · PostgreSQL + pgvector · LangGraph · Claude claude-sonnet-4-6 · Composio

---

## 1. Project owner context

Builder: Sahil (student founder, final year)
Projects being tracked by Byline:
- fltrd.tech — AI-powered content filtering (Next.js, FastAPI, pgvector, RAG)
- Miryn — [AI project]
- Stash — [productivity tool]
- ChaiPaani — [community/social project]
- Byline itself (recursive: using Byline to post about building Byline)

Voice profile notes (use in all writer agents):
- Writes in lowercase for casual posts, sentence case for LinkedIn
- Opener patterns: "I spent X days on Y and Z was the hard part", "Here's what nobody tells you about..."
- Banned phrases: "excited to announce", "humbled", "thrilled to share", "game-changer",
  "synergy", "leverage", "at the end of the day", "in today's landscape", "excited to share"
- Average LinkedIn post: 180–280 words, short paragraphs (1-2 sentences max)
- Average X post: punchy, lowercase, opinions over information
- Reddit: always educational framing, disclosure at end only

---

## 2. Brand & visual identity

**Name:** Byline (final, not Dispatch)
**Mascot:** "The Wire Agent" — a small owl-like robot with amber eyes. The owl watches
silently and dispatches when it detects something worth saying. Platform signals radiate
from it like antenna wires. Used in: loading states, empty states, og:image, stickers.
Expression variants needed: watching, typing, dispatching, sleeping (idle).

**Design tokens (use these everywhere):**
```
--bg:       #0D1117   (GitHub dark)
--bg2:      #161B22   (card surface)
--bg3:      #21262D   (elevated surface)
--border:   #30363D   (default border)
--border2:  #3D444D   (hover border)
--text:     #E6EDF3   (primary text)
--muted:    #8B949E   (secondary text)
--dim:      #484F58   (tertiary / placeholder)
--amber:    #F0A500   (THE ONE ACCENT — use sparingly)
--green:    #3FB950   (success / live indicator)
--red:      #F85149   (error / danger)
--blue:     #58A6FF   (info / code keywords)
```

**Typography:**
- Headings / terminal / stamps: DM Mono (Google Fonts)
- Body / UI: Inter (Google Fonts)
- Code blocks: DM Mono

**Signature motion:** The "byline stamp" — when a draft is ready, the text "By Sahil —"
types itself character by character before the platform draft appears. Like watching a
journalist's byline appear on a fresh article. This animation plays on: draft completion,
the hero section of the landing page, and the "approved" confirmation in The Desk.

**Landing page aesthetic:** Dark terminal-editorial. NOT a generic SaaS page. The hero
shows a live animated wire feed (agents running in real time via CSS/JS animation).
Reference feel: GitHub · Linear · Warp terminal.

---

## 3. Repository structure

```
byline/
├── AGENTS.md                          ← this file (OpenCode reads automatically)
├── README.md
├── .env.example
├── docker-compose.yml
│
├── packages/
│   ├── agents/                        ← Python: LangGraph pipeline
│   │   ├── graph.py                   ← main pipeline definition
│   │   ├── state.py                   ← BylineState TypedDict
│   │   ├── nodes/
│   │   │   ├── strategist.py
│   │   │   ├── writer_linkedin.py
│   │   │   ├── writer_x.py
│   │   │   ├── writer_reddit.py
│   │   │   ├── writer_threads.py
│   │   │   └── critic.py
│   │   └── prompts/                   ← system prompt .txt files
│   │       ├── strategist.txt
│   │       ├── writer_linkedin.txt
│   │       ├── writer_x.txt
│   │       ├── writer_reddit.txt
│   │       ├── writer_threads.txt
│   │       └── critic.txt
│   │
│   └── web/                           ← Next.js 14 frontend (Phase 1+)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx               ← landing page
│       │   └── desk/
│       │       └── page.tsx           ← The Desk (review UI)
│       └── components/
│           ├── WirePanel.tsx
│           ├── DeskPanel.tsx
│           ├── AgentFeed.tsx
│           ├── CriticScore.tsx
│           └── BylineStamp.tsx        ← the signature animation component
│
├── api/                               ← FastAPI backend
│   ├── main.py
│   ├── db.py                          ← asyncpg connection pool
│   └── routes/
│       ├── dispatch.py                ← POST /dispatch, GET /dispatch/{id}
│       ├── webhooks.py                ← POST /webhooks/github (Phase 2)
│       ├── voice.py                   ← POST /voice (Phase 2)
│       └── posting.py                 ← POST /dispatch/{id}/post (Phase 3)
│
├── watcher/                           ← GitHub watcher service (Phase 2)
│   └── github.py
│
└── infra/
    └── postgres/
        └── init.sql
```

---

## 4. Database schema (init.sql)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT,
  description TEXT,
  stack       TEXT[],
  status      TEXT DEFAULT 'active',
  repo_url    TEXT,
  demo_url    TEXT,
  embedding   vector(1536),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  source      TEXT NOT NULL,   -- 'manual' | 'github' | 'voice'
  raw_input   TEXT NOT NULL,
  embedding   vector(1536),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dispatches (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id         UUID REFERENCES milestones(id),
  project_id           UUID REFERENCES projects(id),
  status               TEXT DEFAULT 'pending',
  narrative_arc        TEXT,
  strategist_reasoning JSONB,
  platforms_selected   TEXT[],
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform_drafts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id      UUID REFERENCES dispatches(id),
  platform         TEXT NOT NULL,
  content          TEXT NOT NULL,
  critic_score     NUMERIC(3,1),
  critic_notes     JSONB,
  status           TEXT DEFAULT 'draft',
  posted_at        TIMESTAMPTZ,
  external_post_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE voice_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version         INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT true,
  avg_post_length INT,
  opener_patterns TEXT[],
  banned_phrases  TEXT[],
  platform_notes  JSONB,
  raw_samples     TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_analytics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_draft_id UUID REFERENCES platform_drafts(id),
  platform          TEXT,
  impressions       INT,
  likes             INT,
  comments          INT,
  shares            INT,
  measured_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON milestones USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON projects USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON dispatches (status);
CREATE INDEX ON platform_drafts (dispatch_id, platform);

-- Seed: Sahil's projects
INSERT INTO projects (slug, name, tagline, description, stack, status, repo_url) VALUES
('fltrd-tech', 'fltrd.tech', 'AI-powered content filtering', 'Semantic search and content curation using pgvector and RAG pipelines', ARRAY['Next.js','FastAPI','pgvector','PostgreSQL','OpenAI'], 'active', 'https://github.com/sahil/fltrd'),
('miryn', 'Miryn', 'AI project', 'Miryn — description TBD', ARRAY['React','FastAPI'], 'active', NULL),
('stash', 'Stash', 'Productivity tool', 'Stash — description TBD', ARRAY['Next.js','PostgreSQL'], 'active', NULL),
('chaipanni', 'ChaiPaani', 'Community project', 'ChaiPaani — description TBD', ARRAY['React Native','FastAPI'], 'active', NULL),
('byline', 'Byline', 'Your byline. Everywhere you ship.', 'Open-source multi-agent content engine for developer-founders', ARRAY['Next.js','FastAPI','pgvector','LangGraph','Anthropic'], 'active', 'https://github.com/sahil/byline');
```

---

## 5. LangGraph pipeline

### state.py
```python
from typing import TypedDict, Optional, Any

class BylineState(TypedDict):
    raw_milestone:      str
    project_id:         str
    project_context:    str
    voice_profile:      dict
    strategist_output:  dict
    linkedin_draft:     Optional[dict]
    x_draft:            Optional[dict]
    reddit_draft:       Optional[dict]
    threads_draft:      Optional[dict]
    critic_results:     dict
    dispatch_id:        str
    sse_queue:          Any
```

### graph.py
```python
from langgraph.graph import StateGraph, END
from .state import BylineState
from .nodes import strategist, writer_linkedin, writer_x, writer_reddit, writer_threads, critic

def build_graph():
    g = StateGraph(BylineState)
    g.add_node("strategist",    strategist.run)
    g.add_node("write_linkedin", writer_linkedin.run)
    g.add_node("write_x",       writer_x.run)
    g.add_node("write_reddit",  writer_reddit.run)
    g.add_node("write_threads", writer_threads.run)
    g.add_node("critic",        critic.run)
    g.set_entry_point("strategist")

    def route(state: BylineState) -> list[str]:
        return [f"write_{p}" for p in state["strategist_output"]["platforms"]]

    g.add_conditional_edges("strategist", route)
    for p in ["linkedin", "x", "reddit", "threads"]:
        g.add_edge(f"write_{p}", "critic")
    g.add_edge("critic", END)
    return g.compile()
```

### Node pattern (use for all nodes)
```python
# nodes/strategist.py
import json
from anthropic import Anthropic

client = Anthropic()

SYSTEM_PROMPT = open("prompts/strategist.txt").read()

def run(state: BylineState) -> BylineState:
    if state.get("sse_queue"):
        state["sse_queue"].put_nowait({"node": "strategist", "status": "running"})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Milestone: {state['raw_milestone']}\n\nProject context:\n{state['project_context']}\n\nVoice profile:\n{json.dumps(state['voice_profile'])}"
        }]
    )

    output = json.loads(response.content[0].text)
    state["strategist_output"] = output

    if state.get("sse_queue"):
        state["sse_queue"].put_nowait({"node": "strategist", "status": "done", "output": output})

    return state
```

---

## 6. Agent system prompts

### prompts/strategist.txt
```
You are the Strategist agent for Byline, a content engine for developer-founders.

Given a raw milestone (something shipped or learned), decide:
1. Is this post-worthy? Score 1-10. Post if >= 6.
2. Best angle: lesson_learned | build_log | milestone | opinion | technical_deep_dive
3. Which platforms: any subset of [linkedin, x, reddit, threads]
4. Narrative arc this belongs to

Use the project context and voice profile provided.

Output ONLY valid JSON, no other text:
{
  "post_worthy_score": 8,
  "should_post": true,
  "angle": "lesson_learned",
  "angle_reasoning": "one sentence why",
  "platforms": ["linkedin", "x", "reddit"],
  "skip_reason": null,
  "narrative_arc": "build_in_public",
  "suggested_hook": "the chunking was harder than the embeddings"
}
```

### prompts/writer_linkedin.txt
```
You write LinkedIn posts for a student developer-founder building in public.
You have: the milestone, project context, strategist angle + hook, and voice profile.

Rules:
- First 2 lines must work standalone before "see more" — write them like a hook, not an intro
- Max 2 sentences per paragraph. Short paragraphs = more reads.
- Specific numbers beat vague claims. "47 signups" not "good traction".
- End with a genuine question or insight. Never "thoughts?" or "agree?"
- 150-300 words total
- NEVER use: "excited to announce", "humbled", "thrilled to share", "game-changer",
  "synergy", "leverage", "in today's landscape", "excited to share", "I'm proud to"
- Match the voice profile: opener patterns, banned phrases, avg length

Output ONLY valid JSON:
{
  "content": "full post text",
  "char_count": 247,
  "hook": "first line",
  "cta": "closing line"
}
```

### prompts/writer_x.txt
```
You write X (Twitter) content for a student developer-founder.

Rules:
- First tweet determines if anyone reads the thread. Write it last.
- 3-5 tweets max. Each under 280 chars.
- Cut every word that doesn't earn its place.
- Opinions outperform pure info on X. Be slightly spicy.
- Lowercase preferred for authenticity.
- No hashtags unless genuinely relevant (max 1).

Output ONLY valid JSON:
{
  "tweets": [
    {"index": 1, "content": "...", "char_count": 187},
    {"index": 2, "content": "...", "char_count": 241}
  ],
  "hook": "the first tweet"
}
```

### prompts/writer_reddit.txt
```
You write Reddit posts for a developer-founder. Reddit removes anything that smells
like self-promotion. Your job is to make the post genuinely educational.

Rules (non-negotiable):
- Frame as lesson or problem post, NOT a product announcement
- "What I learned" or "How I solved X" — not "Check out my thing"
- Project name at the END only, with full disclosure: "I built this to solve X"
- Minimum 400 words. Reddit rewards depth.
- Strategist output tells you which subreddit to target.
- Never cross-post identical content across subreddits.
- Add real value: code snippets, specific decisions, what failed before what worked.

Anti-ban check before outputting — verify:
- No "check out my product" in first 3 paragraphs
- No direct product link in first paragraph
- Post reads as educational, not promotional

Output ONLY valid JSON:
{
  "title": "...",
  "body": "...",
  "suggested_subreddit": "r/webdev",
  "flair": "Discussion",
  "self_promo_risk": "low"
}
```

### prompts/writer_threads.txt
```
You write Threads posts. Threads is casual — write like texting a friend who already
knows what you're building.

Rules:
- Under 300 characters ideally. One idea. No elaborate setup.
- Raw, unpolished energy. "just shipped X. the hard part was Y."
- Never repurpose the LinkedIn post. Completely fresh take on same topic.
- Lowercase preferred.

Output ONLY valid JSON:
{
  "content": "...",
  "char_count": 187
}
```

### prompts/critic.txt
```
You are the Critic agent for Byline. Score each draft honestly. Your job is to flag
AI slop, voice mismatches, and platform rule violations — not to be nice.

Score each 1-10:
- clarity: Is the main point obvious in the first sentence?
- voice_match: Does this sound like the user's actual writing? Check against samples.
- hook_strength: Would someone stop scrolling for this first line?
- platform_fit: Does this follow the norms of this specific platform?

For Reddit: add self_promo_risk (low/medium/high). High = rewrite the opening.
Flag any phrase that sounds like an LLM wrote it ("delve", "it's worth noting", etc.)

Output ONLY valid JSON:
{
  "overall_score": 8.4,
  "scores": {
    "clarity": 9,
    "voice_match": 8,
    "hook_strength": 8,
    "platform_fit": 8
  },
  "flags": ["consider cutting last paragraph", "third sentence is passive voice"],
  "ai_slop_detected": false,
  "verdict": "approve",
  "self_promo_risk": "low"
}
```

---

## 7. FastAPI routes

### api/routes/dispatch.py
```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio, json, uuid
from ..db import get_pool
from packages.agents.graph import build_graph
from packages.agents.state import BylineState

router = APIRouter()
graph = build_graph()

@router.post("/dispatch")
async def create_dispatch(body: dict):
    pool = await get_pool()
    async with pool.acquire() as conn:
        # 1. Store milestone
        milestone_id = await conn.fetchval(
            "INSERT INTO milestones (project_id, source, raw_input) VALUES ($1, $2, $3) RETURNING id",
            body["project_id"], body.get("source", "manual"), body["milestone"]
        )
        # 2. Create dispatch record
        dispatch_id = str(uuid.uuid4())
        await conn.execute(
            "INSERT INTO dispatches (id, milestone_id, project_id, status) VALUES ($1, $2, $3, 'running')",
            dispatch_id, milestone_id, body["project_id"]
        )

    # 3. Fetch project context
    async with pool.acquire() as conn:
        project = await conn.fetchrow("SELECT * FROM projects WHERE id = $1", body["project_id"])
        voice = await conn.fetchrow("SELECT * FROM voice_profiles WHERE is_active = true ORDER BY version DESC LIMIT 1")

    # 4. Run pipeline
    sse_queue = asyncio.Queue()
    state: BylineState = {
        "raw_milestone": body["milestone"],
        "project_id": body["project_id"],
        "project_context": f"{project['name']}: {project['description']} Stack: {', '.join(project['stack'])}",
        "voice_profile": dict(voice) if voice else {},
        "strategist_output": {},
        "linkedin_draft": None, "x_draft": None, "reddit_draft": None, "threads_draft": None,
        "critic_results": {},
        "dispatch_id": dispatch_id,
        "sse_queue": sse_queue,
    }

    async def run_graph():
        result = await asyncio.to_thread(graph.invoke, state)
        # Save drafts to DB
        async with pool.acquire() as conn:
            for platform in result["strategist_output"].get("platforms", []):
                draft_key = f"{platform}_draft"
                if result.get(draft_key):
                    content = result[draft_key].get("content") or json.dumps(result[draft_key])
                    score = result["critic_results"].get(platform, {}).get("overall_score")
                    notes = result["critic_results"].get(platform, {})
                    await conn.execute(
                        "INSERT INTO platform_drafts (dispatch_id, platform, content, critic_score, critic_notes) VALUES ($1,$2,$3,$4,$5)",
                        dispatch_id, platform, content, score, json.dumps(notes)
                    )
            await conn.execute("UPDATE dispatches SET status='ready' WHERE id=$1", dispatch_id)
        sse_queue.put_nowait({"done": True, "dispatch_id": dispatch_id})

    asyncio.create_task(run_graph())
    return {"dispatch_id": dispatch_id, "status": "running"}


@router.get("/dispatch/{dispatch_id}/stream")
async def stream_dispatch(dispatch_id: str):
    """SSE endpoint — frontend connects here to watch agents run live."""
    queue: asyncio.Queue = asyncio.Queue()

    async def event_stream():
        while True:
            msg = await queue.get()
            yield f"data: {json.dumps(msg)}\n\n"
            if msg.get("done"):
                break

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/dispatch/{dispatch_id}")
async def get_dispatch(dispatch_id: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        dispatch = await conn.fetchrow("SELECT * FROM dispatches WHERE id = $1", dispatch_id)
        drafts = await conn.fetch("SELECT * FROM platform_drafts WHERE dispatch_id = $1", dispatch_id)
    return {
        "dispatch": dict(dispatch),
        "drafts": [dict(d) for d in drafts]
    }


@router.patch("/dispatch/{dispatch_id}/drafts/{platform}")
async def update_draft(dispatch_id: str, platform: str, body: dict):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE platform_drafts SET content=$1, status=$2 WHERE dispatch_id=$3 AND platform=$4",
            body.get("content"), body.get("status", "draft"), dispatch_id, platform
        )
    return {"ok": True}
```

---

## 8. Phase build order — strict

### Phase 0 (do first — this weekend)
**Goal:** CLI → 4 drafts in terminal. Nothing else.

Steps:
1. `docker-compose up -d` (postgres + pgvector)
2. Run init.sql, verify seed data inserted
3. Build `packages/agents/` — state, graph, all 5 nodes, all 5 prompts
4. Build `api/main.py` + `api/routes/dispatch.py` (just the POST endpoint for now)
5. Build `cli.py`:
   ```python
   # cli.py
   import sys, asyncio, httpx, json

   async def main():
       milestone = " ".join(sys.argv[2:])
       async with httpx.AsyncClient() as c:
           r = await c.post("http://localhost:8000/dispatch", json={
               "milestone": milestone,
               "project_id": "PUT_FLTRD_UUID_HERE",  # from seed data
               "source": "manual"
           })
           data = r.json()
           dispatch_id = data["dispatch_id"]
           # Poll until done
           while True:
               r2 = await c.get(f"http://localhost:8000/dispatch/{dispatch_id}")
               d = r2.json()
               if d["dispatch"]["status"] == "ready":
                   for draft in d["drafts"]:
                       print(f"\n{'='*50}")
                       print(f"PLATFORM: {draft['platform'].upper()}")
                       print(f"CRITIC SCORE: {draft['critic_score']}/10")
                       print(f"{'='*50}")
                       print(draft["content"])
                   break
               await asyncio.sleep(1)

   if __name__ == "__main__":
       asyncio.run(main())
   ```
6. Test: `python cli.py log "shipped semantic search on fltrd.tech using pgvector"`
7. Done when: 4 drafts print in terminal

**Phase 0 is done when you get 4 drafts. Do not move to Phase 1 until this works.**

### Phase 1 (next weekend)
**Goal:** Next.js review UI — The Wire + The Desk.

Steps:
1. `cd packages/web && npx create-next-app@14 . --typescript --tailwind --app`
2. Build components: WirePanel, DeskPanel, AgentFeed, CriticScore, BylineStamp
3. Add SSE endpoint to FastAPI: `GET /dispatch/{id}/stream`
4. Wire SSE to AgentFeed component
5. The BylineStamp animation (key component):
   ```tsx
   // components/BylineStamp.tsx
   // Typewriter effect: "By Sahil — " appears char by char
   // when a draft completes. Use useEffect + setInterval.
   // Amber (#F0A500) color. DM Mono font. 14px.
   ```
6. Approve button → PATCH /dispatch/{id}/drafts/{platform} with {status: "approved"}

### Phase 2 (weekend 3-4)
**Goal:** The Watcher — GitHub webhook + voice notes.

Steps:
1. GitHub webhook: `POST /webhooks/github`
   - Verify `X-Hub-Signature-256` header
   - Filter with `is_post_worthy()` function
   - Auto-create pending dispatch on match
   - Send notification (email or dashboard badge — your choice)
2. Voice note: `POST /voice` — accepts multipart audio file
   - Transcribe with `openai.audio.transcriptions.create(model="whisper-1", ...)`
   - Create milestone with source="voice"
   - Auto-run pipeline
3. Voice profile extractor: `POST /voice-profile/extract`
   - Accept array of past LinkedIn/X posts as strings
   - Run Claude to extract: opener_patterns, banned_phrases, avg_length, style_notes
   - Save to voice_profiles table

```python
# watcher/github.py
def is_post_worthy(commit_msg: str, files_changed: list[str]) -> bool:
    skip = ["chore", "deps", "lint", "format", "typo", "merge", "bump", "wip"]
    post = ["feat", "add", "ship", "launch", "fix", "perf", "release", "implement"]
    msg = commit_msg.lower()
    if any(k in msg for k in skip): return False
    if any(k in msg for k in post): return True
    sig_paths = [f for f in files_changed if any(p in f for p in ["pages/","app/","components/","api/"])]
    return len(sig_paths) >= 3
```

### Phase 3 (weekend 5-6)
**Goal:** Real posting. Engagement feedback.

Composio setup:
```bash
pip install composio-core
npx @composio/cli add --app linkedin   # LINKEDIN_CREATE_LINKEDIN_POST
npx @composio/cli add --app twitter    # TWITTER_CREATE_TWEET
npx @composio/cli add --app reddit     # REDDIT_CREATE_TEXT_POST
# Threads: Meta Graph API directly (Composio doesn't support it yet as of June 2026)
```

Reddit guardrail (run BEFORE posting — hard block):
```python
def reddit_guardrail(content: str, title: str) -> bool:
    """Returns True if safe to post."""
    signals = ["check out","try my","launched","excited to","sign up","available now","get it here"]
    combined = f"{title} {content}".lower()
    return not any(s in combined for s in signals)
```

Threads posting (Meta Graph API):
```python
async def post_threads(content: str, user_id: str, token: str) -> dict:
    async with httpx.AsyncClient() as c:
        r1 = await c.post(f"https://graph.threads.net/v1.0/{user_id}/threads",
                          params={"media_type":"TEXT","text":content,"access_token":token})
        r2 = await c.post(f"https://graph.threads.net/v1.0/{user_id}/threads_publish",
                          params={"creation_id":r1.json()["id"],"access_token":token})
        return r2.json()
```

---

## 9. Environment variables

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql+asyncpg://byline:byline@localhost:5432/byline
COMPOSIO_API_KEY=...
GITHUB_WEBHOOK_SECRET=...
GITHUB_TOKEN=ghp_...
THREADS_USER_ID=...
THREADS_ACCESS_TOKEN=...
PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000
SECRET_KEY=changeme
```

---

## 10. docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: byline
      POSTGRES_USER: byline
      POSTGRES_PASSWORD: byline
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    profiles: ["phase2"]   # only starts when needed: docker-compose --profile phase2 up

volumes:
  pgdata:
```

---

## 11. Landing page creative brief (for Figma Make or direct code)

The landing page lives at `byline.so`. It is NOT a standard SaaS page.

**Vibe:** A newsroom's control room at 2am. Dark. Precise. One thing is glowing: your byline
appearing on freshly dispatched posts across four platforms.

**Sections (in order):**
1. Nav: `byline.` wordmark (DM Mono) + GitHub stars badge + "Get early access" (amber CTA)
2. Hero: "Your byline. Everywhere you ship." — left: headline + sub + CTAs + trust bar.
   Right: the animated wire feed (live agent pipeline animation showing a milestone being
   processed). The wire feed is the SIGNATURE ELEMENT — it must be animated, not static.
3. Problem: 4 cards. Memory gap / Voice decay / Format fatigue / Reddit death.
4. The Watcher: "An agent that notices before you do." Code snippet showing `is_post_worthy()`.
5. Pipeline: 5-step horizontal flow (Signal in → Strategist → Writers ×4 → Critic → You approve)
6. Demo: Interactive tab switcher showing platform-native drafts (LinkedIn / X / Reddit / Threads)
7. Open source: MIT badge, stat strip (4 platforms, 5 agents, 0 lock-in), GitHub clone command
8. CTA: Waitlist email input. Stat strip. GitHub link.

**The Wire Agent mascot** appears in:
- Favicon (32×32 amber owl face)
- The "agents running" state in the hero wire feed
- 404 page (the agent is sleeping with "zzz" above its head)
- Empty state in The Desk when no dispatches exist yet

**Figma Make prompt (paste this as first message):**
```
Build a landing page for "Byline" — an open-source multi-agent content engine for
developer-founders who build in public.

Brand tokens:
- bg: #0D1117, surface: #161B22, border: #30363D
- accent: #F0A500 (amber — used sparingly, one CTA, one highlight)
- text: #E6EDF3, muted: #8B949E
- fonts: DM Mono (headings, terminal, stamps) + Inter (body, UI)

Section 1: Sticky nav. Left: "byline." in DM Mono 16px. Center: links (How it works,
GitHub, Docs). Right: GitHub star badge (★ 247) + amber filled CTA "Get early access".
Background: rgba(13,17,23,0.88) with 12px backdrop blur. Border-bottom #30363D.

Section 2: Hero. Two-column grid. Left: eyebrow badge (green pulsing dot + "MIT open source · actively building"). H1 in DM Mono: "Your byline." newline "Everywhere" in amber newline "you ship." Body text muted 15px. Two CTAs. Trust bar (3 items in DM Mono 11px muted). Right: dark terminal card (#161B22 bg, 1px #30363D border, border-radius 10px) showing an animated "wire feed": a CLI-style input with typewriter animation, then 5 agent rows appearing one by one with status indicators (✓ done in green, ⟳ running in amber, ○ pending in gray), then a draft preview with platform tabs. The animation loops every 12 seconds.

Section 3: Problem. 4 cards on dark surface. Icons, titles, body text. No promo language.

Section 4: Watcher section. Headline + subtext + code block showing the is_post_worthy()
Python function with syntax highlighting (comments: dim gray, keywords: blue #58A6FF,
strings: green #3FB950, function names: amber #F0A500, booleans: red #F85149).

Section 5: Pipeline. 5 horizontal steps connected by amber → arrows. Amber highlight on
"Strategist" step (it's the decision-maker). Each step: icon, name, 3-word description.

Section 6: Demo shell (macOS-style dark card). Left panel: textarea with pre-filled milestone + "Dispatch →" amber button. Right panel: 4 tabs (LinkedIn, X Thread, Reddit, Threads) each with different pre-written draft text. Tabs are interactive — clicking switches draft content. Platform-specific styling for each tab badge (LinkedIn blue, X dark, Reddit orange, Threads dark).

Section 7: Open source. MIT badge, 3-stat grid (4 platforms, 5 agents, 0 lock-in), dark code block with 3-line clone-and-run instructions.

Section 8: CTA. Center-aligned. DM Mono headline: "Stop choosing between shipping and being seen." Email input + amber button. Stat strip. GitHub link in muted.
```

---

## 12. Coding rules for OpenCode

- Use `claude-sonnet-4-6` for ALL LLM calls. Never gpt-4o, never claude-3-opus.
- All agent outputs are JSON. Parse with `json.loads()`. Validate required fields. If parsing fails, retry once with explicit "output ONLY valid JSON, no other text" instruction.
- Use `asyncpg` for all database operations. Never SQLAlchemy in the backend.
- Use `httpx.AsyncClient` for all HTTP calls. Never `requests`.
- Print agent status to stdout in Phase 0 (e.g. `print(f"[strategist] running...")`). Replace with SSE in Phase 1.
- Never add mock data or placeholder content. Use the real seed projects from the database.
- Error handling: wrap all Claude API calls in try/except. On `anthropic.APIError`, retry once after 2s delay. Log all errors to stderr.
- Type everything. Use TypedDict for state, Pydantic for API request/response bodies.
- Ask before making architectural decisions not covered in this file.
- Phase 0 only: no web UI, no posting, no webhooks. CLI only.

---

## 13. What's already done (don't rebuild)

- `BYLINE_SPEC.md` — full technical spec with architecture, DB schema, Composio integration code
- `landing.html` — standalone landing page (dark amber aesthetic, animated wire feed, interactive demo tabs)

The landing page is production-ready as a static HTML file. For the web app, the landing
page lives at `packages/web/app/page.tsx` — port the HTML to Next.js/Tailwind, keeping all
animations and interactive elements.

---

## 14. What to build right now (Phase 0 checklist)

OpenCode: start here. Do these in order. Do not skip ahead.

- [ ] Create directory structure from §3
- [ ] Create `docker-compose.yml` from §10
- [ ] Create `infra/postgres/init.sql` from §4 (include seed data)
- [ ] Run `docker-compose up -d`
- [ ] Create `packages/agents/state.py` from §5
- [ ] Create `packages/agents/graph.py` from §5
- [ ] Create all 5 prompt files in `packages/agents/prompts/` from §6
- [ ] Create `packages/agents/nodes/strategist.py` (implement run() function)
- [ ] Create `packages/agents/nodes/writer_linkedin.py`
- [ ] Create `packages/agents/nodes/writer_x.py`
- [ ] Create `packages/agents/nodes/writer_reddit.py`
- [ ] Create `packages/agents/nodes/writer_threads.py`
- [ ] Create `packages/agents/nodes/critic.py`
- [ ] Create `api/db.py` (asyncpg connection pool)
- [ ] Create `api/main.py` (FastAPI app, include dispatch router)
- [ ] Create `api/routes/dispatch.py` from §7 (POST /dispatch + GET /dispatch/{id} only)
- [ ] Create `cli.py` from §8 Phase 0 section
- [ ] Create `.env.example` from §9
- [ ] Install dependencies: `pip install fastapi uvicorn asyncpg anthropic langgraph httpx python-dotenv`
- [ ] Run: `python cli.py log "shipped semantic search on fltrd.tech using pgvector"`
- [ ] Verify: 4 platform drafts print in terminal with critic scores

Phase 0 is complete when the CLI works end-to-end.

---

*Byline · MIT · byline.so · Built in public by Sahil*
*This file is the single source of truth. Last updated: June 2026.*
