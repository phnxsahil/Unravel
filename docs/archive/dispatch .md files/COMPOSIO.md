# Dispatch — Composio Integration Guide (Phase 3)

This document covers everything needed to wire up actual posting via Composio.
Don't start this until Phase 0-1 (generation + review workflow) are solid.

---

## Why Composio

Composio handles OAuth for LinkedIn, X (Twitter), and Reddit as managed connections —
you don't build token refresh, scope management, or API version updates yourself.
All posting calls go through Composio's Tool Router, which maps natural-language-ish
tool calls to the correct platform API endpoint.

LinkedIn and X posting are confirmed supported.
Reddit posting is confirmed supported (creates text posts to a specified subreddit).
Threads: not confirmed in Composio's current toolkit list — fall back to Meta Graph API
directly if needed.

---

## Setup

### 1. Get your Composio API key

Sign up at composio.dev, create a project, copy the API key.
Put it in `.env` as `COMPOSIO_API_KEY`.

### 2. Install the Python SDK

```bash
pip install composio-langchain
# or for direct use without LangChain:
pip install composio-core
```

### 3. Connect each platform account

Run the CLI to connect each platform once. This opens an OAuth flow in your browser.

```bash
composio add linkedin
composio add twitter   # covers X
composio add reddit
```

After connecting, Composio gives you an **entity ID** for each account.
Store these in the `outlets` table:

```sql
UPDATE outlets
SET composio_entity_id = '<entity_id_from_composio>',
    is_connected = TRUE,
    connected_at = NOW()
WHERE platform = 'linkedin';
```

---

## Publishing service

All Composio calls live in `apps/api/services/publishing.py`. Nowhere else.

```python
"""
apps/api/services/publishing.py

Handles actual posting to platforms via Composio.
Called only from the /drafts/{id}/approve-and-post endpoint.
"""

import os
from composio import ComposioToolSet, Action

toolset = ComposioToolSet(api_key=os.environ["COMPOSIO_API_KEY"])


async def post_to_linkedin(entity_id: str, body: str) -> str:
    """
    Post to LinkedIn. Returns the platform's post ID.
    """
    response = toolset.execute_action(
        action=Action.LINKEDIN_CREATE_SHARE_POST,
        params={"text": body},
        entity_id=entity_id,
    )
    # Extract post ID from response — check Composio response schema
    # at composio.dev/toolkits/linkedin for the exact field name.
    return response.get("id") or response.get("postId")


async def post_to_x(entity_id: str, body: str) -> str:
    """
    Post a single tweet/post to X. For threads, call this once per post
    and chain them via reply_to_id (check Composio's Twitter toolkit for
    the reply parameter name).
    """
    response = toolset.execute_action(
        action=Action.TWITTER_CREATE_TWEET,
        params={"text": body},
        entity_id=entity_id,
    )
    return response.get("id")


async def post_to_reddit(
    entity_id: str,
    title: str,
    body: str,
    subreddit: str,
) -> str:
    """
    Create a text post on Reddit.
    subreddit should be passed without the 'r/' prefix.
    """
    subreddit_clean = subreddit.lstrip("r/")
    response = toolset.execute_action(
        action=Action.REDDIT_CREATE_POST,
        params={
            "subreddit": subreddit_clean,
            "title": title,
            "text": body,
            "kind": "self",  # text post
        },
        entity_id=entity_id,
    )
    return response.get("id") or response.get("name")


async def fetch_linkedin_engagement(entity_id: str, post_id: str) -> dict:
    """
    Pull likes, comments, impressions for a LinkedIn post.
    Called 24h after posting via a background job (Phase 3+).
    """
    response = toolset.execute_action(
        action=Action.LINKEDIN_GET_POST_ANALYTICS,
        params={"post_id": post_id},
        entity_id=entity_id,
    )
    return {
        "likes": response.get("likeCount", 0),
        "comments": response.get("commentCount", 0),
        "impressions": response.get("impressionCount", 0),
    }
```

---

## API route: POST /drafts/{id}/approve-and-post

Add this to `apps/api/routers/drafts.py`:

```python
@router.post("/{draft_id}/approve-and-post")
async def approve_and_post(draft_id: UUID, db: AsyncSession = Depends(get_db)):
    draft = await get_draft_or_404(db, draft_id)

    # 1. Reddit-specific guard: critic must have passed
    if draft.platform == "reddit" and not draft.critic_passed:
        raise HTTPException(
            status_code=422,
            detail="Reddit draft has not passed the critic check. "
                   "Edit until score >= 7 before posting.",
        )

    # 2. Get outlet connection
    outlet = await get_outlet(db, draft.platform)
    if not outlet.is_connected or not outlet.composio_entity_id:
        raise HTTPException(
            status_code=400,
            detail=f"{draft.platform} is not connected. Go to Settings > Outlets.",
        )

    # 3. Post via Composio
    platform_post_id = await post_via_composio(draft, outlet.composio_entity_id)

    # 4. Update draft record
    draft.status = "posted"
    draft.posted_at = datetime.utcnow()
    draft.composio_post_id = platform_post_id
    await db.commit()

    return {"status": "posted", "platform_post_id": platform_post_id}
```

---

## Reddit-specific guardrails (enforced in code, not just docs)

Before any Reddit draft can be approved, two conditions must both be true:

1. `drafts.critic_score >= 7`
2. The critic's breakdown must have `platform_fit >= 2` (meaning the critic
   explicitly confirmed it doesn't read as promotional)

These are checked in the `approve_and_post` route handler and in the frontend
"Approve & queue" button — the button is disabled with a tooltip if either
condition fails.

Additionally, track post cadence per subreddit in the `outlet_cadence` table
(add this in a migration when Phase 3 starts):

```sql
CREATE TABLE outlet_cadence (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform      TEXT NOT NULL,
  context       TEXT NOT NULL,  -- subreddit name for reddit, 'feed' for others
  last_posted_at TIMESTAMPTZ,
  post_count_7d  INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Enforce: no more than 2 Reddit posts to the same subreddit within 7 days.

---

## Connecting Threads (fallback if Composio doesn't support it)

If Threads is unavailable via Composio, use the Meta Graph API directly.

1. Create a Meta Developer app at developers.facebook.com
2. Enable the "Threads API" product
3. Get a long-lived user access token
4. Store it encrypted in a `platform_tokens` table (separate from Composio)
5. Implement `post_to_threads()` using direct HTTP to
   `https://graph.threads.net/v1.0/{user-id}/threads` (create container)
   then `https://graph.threads.net/v1.0/{user-id}/threads_publish`

Keep this in `apps/api/services/publishing.py` alongside the Composio calls —
same file, different function, clearly commented.
