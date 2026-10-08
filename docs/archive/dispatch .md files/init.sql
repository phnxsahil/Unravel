-- Dispatch — init.sql
-- Source of truth for the database schema.
-- Never edit to fix bugs; use Alembic migrations instead.
-- Requires: pgvector extension, uuid-ossp extension.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── PROJECTS ────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,               -- used in URLs and CLI
  description  TEXT NOT NULL,                       -- what it does, 1-3 sentences
  problem      TEXT,                                -- problem it solves
  stack        TEXT[],                              -- ['Next.js', 'FastAPI', 'pgvector']
  status       TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'paused', 'archived')),
  demo_url     TEXT,
  repo_url     TEXT,
  thumbnail_url TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NARRATIVE ARCS ──────────────────────────────────────────────────────────
-- A storyline spanning multiple dispatches, e.g. "Job search 2026" or
-- "Building Dispatch in public". The strategist uses active arcs when choosing
-- an angle so posts build a series, not isolated announcements.

CREATE TABLE narrative_arcs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DISPATCHES ──────────────────────────────────────────────────────────────
-- One logged update/milestone. The atomic unit of content.

CREATE TABLE dispatches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  arc_id         UUID REFERENCES narrative_arcs(id) ON DELETE SET NULL,
  body           TEXT NOT NULL,       -- raw log entry: "shipped semantic search using pgvector, took 2 days"
  source         TEXT NOT NULL DEFAULT 'manual'
                   CHECK (source IN ('manual', 'github', 'voice', 'cli')),
  is_post_worthy BOOLEAN,             -- null = not yet evaluated by strategist
  hold_reason    TEXT,                -- set when strategist marks it "hold for later"
  angle          TEXT,                -- strategist's chosen angle, e.g. "technical deep-dive"
  suggested_platforms TEXT[],         -- strategist's platform recommendations
  avoid_topics   TEXT[],              -- things to avoid per strategist
  embedding      vector(1536),        -- embedding of body, for retrieval
  deleted_at     TIMESTAMPTZ,         -- soft delete
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX dispatches_embedding_idx
  ON dispatches USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX dispatches_project_id_idx ON dispatches(project_id);
CREATE INDEX dispatches_created_at_idx ON dispatches(created_at DESC);

-- ─── VOICE SAMPLES ───────────────────────────────────────────────────────────
-- Past posts from the builder, used to derive and reinforce voice profile.

CREATE TABLE voice_samples (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     TEXT NOT NULL
                 CHECK (platform IN ('linkedin', 'x', 'reddit', 'threads', 'other')),
  body         TEXT NOT NULL,
  embedding    vector(1536),
  source_url   TEXT,
  deleted_at   TIMESTAMPTZ,   -- soft delete — never hard-delete voice samples
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX voice_samples_embedding_idx
  ON voice_samples USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- ─── VOICE PROFILE ───────────────────────────────────────────────────────────
-- Derived structured profile from voice samples. One row per platform
-- (or 'all' for the cross-platform profile). Regenerated on demand.

CREATE TABLE voice_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     TEXT NOT NULL DEFAULT 'all'
                 CHECK (platform IN ('linkedin', 'x', 'reddit', 'threads', 'all')),
  body         TEXT NOT NULL,   -- the structured profile text, used in system prompts
  version      INT NOT NULL DEFAULT 1,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, is_active)  -- only one active profile per platform
);

-- ─── DRAFTS ──────────────────────────────────────────────────────────────────
-- A generated, platform-specific post tied to one dispatch.

CREATE TABLE drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id     UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL
                    CHECK (platform IN ('linkedin', 'x', 'reddit', 'threads')),
  body            TEXT NOT NULL,             -- generated (or edited) post text
  reddit_title    TEXT,                      -- only set for reddit drafts
  reddit_subreddit TEXT,                     -- suggested subreddit, e.g. "r/SideProject"
  generation      INT NOT NULL DEFAULT 1,    -- which generation attempt (for regenerate)
  critic_score    SMALLINT                   -- 1-10, set by critic node
                    CHECK (critic_score BETWEEN 1 AND 10),
  critic_note     TEXT,                      -- one-line editor note from critic
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'approved', 'scheduled', 'posted', 'rejected')),
  scheduled_at    TIMESTAMPTZ,
  posted_at       TIMESTAMPTZ,
  -- Engagement (populated post-publish where API allows)
  likes           INT,
  comments        INT,
  reposts         INT,
  impressions     INT,
  composio_post_id TEXT,          -- platform's ID for the posted content, from Composio
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX drafts_dispatch_id_idx ON drafts(dispatch_id);
CREATE INDEX drafts_status_idx ON drafts(status);

-- ─── MILESTONES (project-level timeline) ─────────────────────────────────────
-- Named milestones on a project for the project detail view.
-- Dispatches are the day-to-day log; milestones are the highlights.

CREATE TABLE milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  achieved_at DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── OUTLETS ─────────────────────────────────────────────────────────────────
-- Connected platforms. Credentials live in Composio, not here.
-- This table just tracks connection status and metadata.

CREATE TABLE outlets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform          TEXT NOT NULL UNIQUE
                      CHECK (platform IN ('linkedin', 'x', 'reddit', 'threads')),
  composio_entity_id TEXT,          -- Composio entity ID for this connection
  display_name      TEXT,           -- e.g. "@sahilsinha" or "Sahil Sinha"
  is_connected      BOOLEAN NOT NULL DEFAULT FALSE,
  connected_at      TIMESTAMPTZ,
  last_posted_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed outlets (disconnected by default — connect via settings)
INSERT INTO outlets (platform) VALUES
  ('linkedin'), ('x'), ('reddit'), ('threads');

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_narrative_arcs
  BEFORE UPDATE ON narrative_arcs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_dispatches
  BEFORE UPDATE ON dispatches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_voice_profiles
  BEFORE UPDATE ON voice_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_drafts
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_outlets
  BEFORE UPDATE ON outlets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
