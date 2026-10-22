const BASE = "/api";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  repo_url: string | null;
}

export interface StampState {
  platform: string;
  status: string;
  draft_id: string | null;
  critic_score: number | null;
  critic_note: string | null;
}

export interface DispatchRead {
  id: string;
  project_id: string;
  project_name: string;
  body: string;
  source: string;
  angle: string | null;
  hold_reason: string | null;
  suggested_platforms: string[];
  created_at: string;
  stamps: StampState[];
}

export interface DraftRead {
  id: string;
  dispatch_id: string;
  platform: string;
  body: string;
  reddit_title: string | null;
  reddit_subreddit: string | null;
  critic_score: number | null;
  critic_note: string | null;
  status: string;
  created_at: string;
}

export interface NarrativeArc {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function createProject(payload: {
  name: string;
  slug: string;
  description: string;
  stack?: string[];
  repo_url?: string;
}): Promise<Project> {
  return request<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listProjects(): Promise<Project[]> {
  return request<Project[]>("/projects");
}

export async function listDispatches(): Promise<DispatchRead[]> {
  return request<DispatchRead[]>("/dispatches");
}

export async function createDispatch(payload: {
  project_id: string;
  body: string;
  arc_id?: string;
  source?: string;
}): Promise<DispatchRead> {
  return request<DispatchRead>("/dispatches", {
    method: "POST",
    body: JSON.stringify({ ...payload, source: payload.source ?? "manual" }),
  });
}

export async function getDrafts(dispatchId: string): Promise<DraftRead[]> {
  return request<DraftRead[]>(`/dispatches/${dispatchId}/drafts`);
}

export async function patchDraft(
  draftId: string,
  payload: { body?: string; status?: string }
): Promise<DraftRead> {
  return request<DraftRead>(`/drafts/${draftId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listArcs(): Promise<NarrativeArc[]> {
  return request<NarrativeArc[]>("/narrative-arcs");
}

export interface VoiceProfileRead {
  id: string;
  platform: string;
  body: string;
  version: number;
  is_active: boolean;
  generated_at: string;
}

export async function getVoiceProfile(): Promise<VoiceProfileRead> {
  return request<VoiceProfileRead>("/voice-profile");
}

export async function createVoiceProfile(payload: {
  raw_posts: string;
  platform?: string;
}): Promise<VoiceProfileRead> {
  return request<VoiceProfileRead>("/voice-profile", {
    method: "POST",
    body: JSON.stringify({ raw_posts: payload.raw_posts, platform: payload.platform ?? "all" }),
  });
}

export function streamGeneration(
  dispatchId: string,
  onEvent: (event: Record<string, unknown>) => void,
  onError: (err: Error) => void,
  onDone: () => void
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}/dispatches/${dispatchId}/generate`, {
        signal: controller.signal,
      });
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                onDone();
                return;
              }
              onEvent(data);
            } catch {
              /* skip malformed SSE events */
            }
          }
        }
      }
      onDone();
    } catch (err) {
      if (!controller.signal.aborted) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return controller;
}
