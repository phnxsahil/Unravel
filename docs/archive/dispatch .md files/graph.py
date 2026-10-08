"""
packages/agents/graph.py

The Dispatch LangGraph pipeline.

Graph shape:
  embed_and_retrieve
        |
    strategist
    /    |    \    \
  li    x    rd   th   (conditional — only platforms strategist selects)
    \    |    /   /
        critic (one per platform draft, in parallel)
        |
    END (state returned to API)

Each writer node emits an event to the passed-in queue so the API can
SSE-stream stamp updates to the frontend as each draft completes.
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator

from langgraph.graph import StateGraph, END

from .state import DispatchState
from .nodes import (
    embed_and_retrieve,
    strategist,
    linkedin_writer,
    x_writer,
    reddit_writer,
    threads_writer,
    critic_linkedin,
    critic_x,
    critic_reddit,
    critic_threads,
)
from .constants import Platform


def build_graph() -> StateGraph:
    graph = StateGraph(DispatchState)

    # ── nodes ────────────────────────────────────────────────────────────────
    graph.add_node("embed_and_retrieve", embed_and_retrieve)
    graph.add_node("strategist", strategist)
    graph.add_node("linkedin_writer", linkedin_writer)
    graph.add_node("x_writer", x_writer)
    graph.add_node("reddit_writer", reddit_writer)
    graph.add_node("threads_writer", threads_writer)
    graph.add_node("critic_linkedin", critic_linkedin)
    graph.add_node("critic_x", critic_x)
    graph.add_node("critic_reddit", critic_reddit)
    graph.add_node("critic_threads", critic_threads)

    # ── edges ────────────────────────────────────────────────────────────────
    graph.set_entry_point("embed_and_retrieve")
    graph.add_edge("embed_and_retrieve", "strategist")

    # After strategist: conditional fan-out to only the selected platforms.
    graph.add_conditional_edges(
        "strategist",
        route_to_writers,
        {
            "linkedin_writer": "linkedin_writer",
            "x_writer": "x_writer",
            "reddit_writer": "reddit_writer",
            "threads_writer": "threads_writer",
            # When strategist marks it not post-worthy, skip to end immediately.
            END: END,
        },
    )

    # Each writer feeds its own critic.
    graph.add_edge("linkedin_writer", "critic_linkedin")
    graph.add_edge("x_writer", "critic_x")
    graph.add_edge("reddit_writer", "critic_reddit")
    graph.add_edge("threads_writer", "critic_threads")

    # All critics go to END — the caller collects all drafts from state.
    graph.add_edge("critic_linkedin", END)
    graph.add_edge("critic_x", END)
    graph.add_edge("critic_reddit", END)
    graph.add_edge("critic_threads", END)

    return graph.compile()


def route_to_writers(state: DispatchState) -> list[str]:
    """
    Returns the list of writer node names to run next.
    If the strategist decided not to post, returns [END].
    """
    if not state.get("post_worthy"):
        return [END]

    platform_to_node: dict[Platform, str] = {
        "linkedin": "linkedin_writer",
        "x": "x_writer",
        "reddit": "reddit_writer",
        "threads": "threads_writer",
    }
    return [
        platform_to_node[p]
        for p in state.get("target_platforms", [])
        if p in platform_to_node
    ]


# ── Public entry point ────────────────────────────────────────────────────────

_compiled_graph = build_graph()


async def run_pipeline(
    dispatch_id: str,
    dispatch_body: str,
    project: dict,
    recent_posts: list[dict],
    active_arcs: list[dict],
    voice_profile: str,
    event_queue: asyncio.Queue | None = None,
) -> DispatchState:
    """
    Run the full generation pipeline for one dispatch.

    event_queue: if provided, writer/critic nodes will put progress events onto
    it as they complete. Format: {"platform": "linkedin", "status": "writing"|"ready"|"flagged"}
    The API SSE route consumes this queue to stream stamp updates to the frontend.
    """
    initial_state: DispatchState = {
        "dispatch_id": dispatch_id,
        "dispatch_body": dispatch_body,
        "project": project,
        "recent_posts": recent_posts,
        "active_arcs": active_arcs,
        "voice_profile": voice_profile,
        "event_queue": event_queue,
        # Populated by nodes:
        "retrieved_context": None,
        "post_worthy": None,
        "hold_reason": None,
        "angle": None,
        "narrative_arc": None,
        "target_platforms": [],
        "key_points": [],
        "avoid": [],
        "drafts": {},
    }

    final_state = await _compiled_graph.ainvoke(initial_state)
    return final_state
