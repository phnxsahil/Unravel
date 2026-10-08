"""
packages/agents/state.py

The single shared state TypedDict that flows through the Dispatch pipeline.
Nodes receive the full state and return a partial dict with only the keys
they modify — they never mutate the input.
"""

from __future__ import annotations

import asyncio
from typing import TypedDict, NotRequired

from .constants import Platform


class DraftResult(TypedDict):
    body: str
    reddit_title: NotRequired[str | None]
    reddit_subreddit: NotRequired[str | None]
    critic_score: int
    critic_note: str | None
    critic_passed: bool


class DispatchState(TypedDict):
    # ── Inputs (set before pipeline runs) ────────────────────────────────────
    dispatch_id: str
    dispatch_body: str
    project: dict                  # {name, description, stack, status, ...}
    recent_posts: list[dict]       # [{platform, topic, angle, created_at}, ...]
    active_arcs: list[dict]        # [{name, description, recent_topics}, ...]
    voice_profile: str             # structured voice profile text
    event_queue: asyncio.Queue | None  # for SSE streaming, may be None

    # ── Set by embed_and_retrieve ─────────────────────────────────────────────
    retrieved_context: list[dict] | None  # similar past dispatches + voice samples

    # ── Set by strategist ─────────────────────────────────────────────────────
    post_worthy: bool | None
    hold_reason: str | None
    angle: str | None
    narrative_arc: str | None
    target_platforms: list[Platform]
    key_points: list[str]
    avoid: list[str]

    # ── Set by writer + critic nodes ──────────────────────────────────────────
    # Keys are platform names: "linkedin", "x", "reddit", "threads"
    drafts: dict[Platform, DraftResult]
