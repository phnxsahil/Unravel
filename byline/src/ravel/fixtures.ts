import type { Answer, Feature, SourceFile } from "./types";

const file = (path: string, body: string, language: string): SourceFile => ({
  path,
  body,
  language,
  lines: body.split("\n").length,
});
export const demoFiles: SourceFile[] = [
  file(
    "web/DraftEditor.tsx",
    `import { useState } from 'react';
import { saveDraft } from './api';

export function DraftEditor({ draft }) {
  const [body, setBody] = useState(draft.body);
  const [status, setStatus] = useState('idle');

  async function save() {
    setStatus('saving');
    try {
      await saveDraft(draft.id, body);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section>
      <textarea value={body}
        onChange={event => setBody(event.target.value)} />
      <button onClick={save}>Save changes</button>
      <p role="status">{status}</p>
    </section>
  );
}`,
    "tsx",
  ),
  file(
    "web/api.ts",
    `const BASE = '/api';

export async function saveDraft(id: string, body: string) {
  const response = await fetch(BASE + '/drafts/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    throw new Error('Your draft could not be saved.');
  }
  return response.json();
}`,
    "typescript",
  ),
  file(
    "api/routes.py",
    `from fastapi import APIRouter, HTTPException
from .store import get_draft, update_draft

router = APIRouter(prefix="/api")

@router.patch("/drafts/{draft_id}")
def save_draft(draft_id: str, payload: dict):
    if not get_draft(draft_id):
        raise HTTPException(404, "Draft not found")
    return update_draft(draft_id, payload["body"])
`,
    "python",
  ),
  file(
    "api/store.py",
    `import sqlite3

def update_draft(draft_id: str, body: str):
    with sqlite3.connect("drafts.sqlite") as connection:
        connection.execute(
            "UPDATE drafts SET body = ? WHERE id = ?",
            (body, draft_id),
        )
    return {"id": draft_id, "body": body}

def get_draft(draft_id: str):
    with sqlite3.connect("drafts.sqlite") as connection:
        return connection.execute(
            "SELECT body FROM drafts WHERE id = ?",
            (draft_id,),
        ).fetchone()
`,
    "python",
  ),
  file(
    "api/main.py",
    `from fastapi import FastAPI
from .routes import router

app = FastAPI()
app.include_router(router)

# The router's /api prefix is part of the deployed URL.
# The development proxy must preserve that same prefix.
`,
    "python",
  ),
  file(
    "web/vite.config.ts",
    `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Preserve /api. No rewrite is needed here.
      },
    },
  },
});`,
    "typescript",
  ),
  file(
    "agents/workflow.py",
    `import asyncio

async def write_posts(source, writers):
    tasks = [writer(source) for writer in writers]
    results = await asyncio.gather(*tasks,
                                   return_exceptions=True)
    drafts, failures = [], []
    for writer, result in zip(writers, results):
        if isinstance(result, Exception):
            failures.append(writer.__name__)
        else:
            drafts.append(result)
    return {"drafts": drafts, "failures": failures}
`,
    "python",
  ),
];

export const demoFeatures: Feature[] = [
  {
    id: "draft-persistence",
    project_id: "demo",
    snapshot_id: "demo-v1",
    title: "Where does a saved draft go?",
    description:
      "Follow one click from the editor to the database. Find out what survives a refresh.",
    category: "State & persistence",
    paths: [
      "web/DraftEditor.tsx",
      "web/api.ts",
      "api/routes.py",
      "api/store.py",
    ],
    entry_line: 4,
    questions: [
      "What happens if saving fails?",
      "Why doesn’t React state survive a refresh?",
      "How could I prevent two edits from overwriting each other?",
    ],
    steps: [
      {
        path: "web/DraftEditor.tsx",
        label: "The edit",
        description: "React keeps your changes in memory until you click Save.",
      },
      {
        path: "web/api.ts",
        label: "The request",
        description: "The edited text crosses the browser boundary as JSON.",
      },
      {
        path: "api/routes.py",
        label: "The route",
        description:
          "The server checks that a draft exists before updating it.",
      },
      {
        path: "api/store.py",
        label: "The record",
        description:
          "A committed database update lets the edit survive a reload.",
      },
    ],
  },
  {
    id: "request-path",
    project_id: "demo",
    snapshot_id: "demo-v1",
    title: "Why does it work locally?",
    description:
      "Trace a request prefix through the browser, proxy, and backend.",
    category: "Requests & deployment",
    paths: ["web/api.ts", "web/vite.config.ts", "api/main.py", "api/routes.py"],
    entry_line: 1,
    questions: [
      "What happens without the development proxy?",
      "Which layer owns the /api prefix?",
      "How would I check the deployed route?",
    ],
    steps: [
      {
        path: "web/api.ts",
        label: "Browser URL",
        description: "The browser sends /api/drafts/:id.",
      },
      {
        path: "web/vite.config.ts",
        label: "Development proxy",
        description: "Vite forwards the same URL to the local server.",
      },
      {
        path: "api/main.py",
        label: "Application",
        description: "FastAPI mounts the router without changing its prefix.",
      },
      {
        path: "api/routes.py",
        label: "Matching route",
        description: "The registered endpoint includes /api.",
      },
    ],
  },
  {
    id: "parallel-writers",
    project_id: "demo",
    snapshot_id: "demo-v1",
    title: "What if one writer fails?",
    description:
      "Explore concurrency, partial results, and the difference between finishing and succeeding.",
    category: "Concurrency & recovery",
    paths: ["agents/workflow.py"],
    entry_line: 3,
    questions: [
      "Why run the writers together?",
      "Does finishing mean every writer succeeded?",
      "How would I retry only the failed writer?",
    ],
    steps: [
      {
        path: "agents/workflow.py",
        label: "Fan out & collect",
        description:
          "Writers run concurrently. Exceptions are collected alongside successful drafts.",
      },
    ],
  },
];

export function demoAnswer(feature: Feature, question: string): Answer {
  const concurrency = feature.id === "parallel-writers";
  const routing = feature.id === "request-path";
  return {
    question,
    summary: concurrency
      ? "The workflow can finish with both successful drafts and failures. It makes the partial result explicit, so a failed writer does not erase the others."
      : routing
        ? "Your browser and backend need to agree on the full request path. A development proxy can hide a mismatch if it changes the prefix; this example preserves it."
        : "There are two different places holding the text: React state in the browser and a committed row in the database. Saving connects them. A page refresh discards the first.",
    claims: concurrency
      ? [
          {
            text: "gather collects writer exceptions as values rather than raising the first one.",
            kind: "source",
            citations: [{ path: "agents/workflow.py", line: 5, end_line: 6 }],
          },
          {
            text: "Successful drafts and failed writers are returned separately. A targeted retry would need to select the failures.",
            kind: "inferred",
            citations: [{ path: "agents/workflow.py", line: 7, end_line: 13 }],
          },
        ]
      : routing
        ? [
            {
              text: "The browser starts requests with /api. The router registers the same prefix.",
              kind: "source",
              citations: [
                { path: "web/api.ts", line: 1, end_line: 4 },
                { path: "api/routes.py", line: 4, end_line: 6 },
              ],
            },
            {
              text: "The proxy forwards /api unchanged. Removing that prefix would prevent this request from matching the shown backend route.",
              kind: "inferred",
              citations: [{ path: "web/vite.config.ts", line: 6, end_line: 9 }],
            },
          ]
        : [
            {
              text: "The save handler waits for the request before showing saved. Its catch branch shows error instead.",
              kind: "source",
              citations: [
                { path: "web/DraftEditor.tsx", line: 8, end_line: 16 },
              ],
            },
            {
              text: "The database update is committed when the connection context exits successfully.",
              kind: "source",
              citations: [{ path: "api/store.py", line: 3, end_line: 9 }],
            },
          ],
    questions: feature.questions,
    experiment: concurrency
      ? "Predict what the result contains if two writers succeed and one raises an exception. Then inspect the collection loop."
      : routing
        ? "In a separate copy, imagine removing /api from the router. Predict the response to the browser request before trying it."
        : "Imagine the API request fails. Predict which status appears and whether the database contains your edit. Follow the catch branch to check your reasoning.",
  };
}
