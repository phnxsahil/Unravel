import type {
  CheckInput,
  DiscoveryInput,
  InvestigationInput,
  InvestigationUpdate,
  ProjectInput,
  QuestionInput,
  TrustInput,
} from "./contracts.generated";
import { demoAnswer, demoFeatures, demoFiles } from "./fixtures";
import type {
  Discovery,
  Investigation,
  Project,
  Repository,
  Snapshot,
} from "./types";

export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Ravel-Client": "workshop",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Your local workshop is not connected. Start ravel serve, or open the prepared demo.",
    );
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : Array.isArray(result.detail)
          ? result.detail.slice(0, 3).map((item: { msg?: string }) => item.msg || "Check the field value.").join(" ")
          : "The request could not finish. Please check the input and try again.",
    );
  }
  if (response.status === 204) return undefined as T;
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "Your local workshop is not running here. Start ravel serve, or open the prepared demo.",
    );
  return response.json();
}
export const local: Repository = {
  demo: false,
  settings: () => request("/settings"),
  projects: () => request("/projects"),
  register: (root) =>
    request("/projects", "POST", { root } satisfies ProjectInput),
  project: (id) => request(`/projects/${id}`),
  remove: (id) => request(`/projects/${id}`, "DELETE"),
  features: (id) => request(`/projects/${id}/features`),
  snapshots: (id) => request(`/projects/${id}/snapshots`),
  snapshot: (id) => request(`/snapshots/${id}`),
  source: (id, path) =>
    request(`/snapshots/${id}/source?path=${encodeURIComponent(path)}`),
  refresh: (id) => request(`/projects/${id}/snapshots`, "POST"),
  compare: (a, b) => request(`/snapshots/${a}/compare/${b}`),
  investigations: (id) => request(`/projects/${id}/investigations`),
  start: (feature_id) =>
    request("/investigations", "POST", {
      feature_id,
    } satisfies InvestigationInput),
  investigation: (id) => request(`/investigations/${id}`),
  annotate: (id, payload) =>
    request(
      `/investigations/${id}`,
      "PATCH",
      payload satisfies InvestigationUpdate,
    ),
  ask: (id, question, consent) =>
    request(`/investigations/${id}/questions`, "POST", {
      question,
      consent,
    } satisfies QuestionInput),
  discoveries: (id) => request(`/investigations/${id}/discoveries`),
  save: (id, title, body) =>
    request(`/investigations/${id}/discoveries`, "POST", {
      title,
      body,
    } satisfies DiscoveryInput),
  profiles: (id) => request(`/projects/${id}/profiles`),
  trust: (id) =>
    request(`/projects/${id}/trust`, "PATCH", {
      trusted: true,
    } satisfies TrustInput),
  checks: (id) => request(`/investigations/${id}/checks`),
  check: (investigation_id, profile_id) =>
    request("/checks", "POST", {
      investigation_id,
      profile_id,
    } satisfies CheckInput),
  job: (id) => request(`/jobs/${id}`),
  cancel: (id) => request(`/jobs/${id}/cancel`, "POST"),
  export: async (id, format) => {
    const r = await fetch(`/api/investigations/${id}/export?format=${format}`);
    if (!r.ok) throw new Error("The export could not be created.");
    return r.blob();
  },
};

const KEY = "ravel-demo-notebook-v1";
function load(): { investigations: Investigation[]; discoveries: Discovery[] } {
  try {
    return JSON.parse(
      localStorage.getItem(KEY) || '{"investigations":[],"discoveries":[]}',
    );
  } catch {
    return { investigations: [], discoveries: [] };
  }
}
function persist(data: ReturnType<typeof load>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
export const demoProject: Project = {
  id: "demo",
  name: "The little writing app",
  root: "Prepared example · no installation needed",
  status: "ready",
  latest_snapshot_id: "demo-v1",
  file_count: demoFiles.length,
  feature_count: 3,
  trusted: false,
};
const snapshot: Snapshot = {
  id: "demo-v1",
  project_id: "demo",
  digest: "prepared-example",
  commit: null,
  dirty: false,
  files: demoFiles,
  excluded: [],
  analysis: { symbols: [], edges: [], routes: [], warnings: [] },
};
const unavailable = async (): Promise<never> => {
  throw new Error(
    "This action needs the local workshop. The demo only uses prepared examples.",
  );
};
export const demo: Repository = {
  demo: true,
  settings: async () => ({
    mode: "demo",
    provider: "Prepared examples",
    model: "",
    ai_connected: false,
    storage: "This browser only",
    supported: ["React", "FastAPI"],
    privacy:
      "Demo notes stay in this browser. No code or questions are sent to an AI service.",
  }),
  projects: async () => [demoProject],
  project: async () => demoProject,
  register: unavailable,
  remove: unavailable,
  features: async () => demoFeatures,
  snapshots: async () => [snapshot],
  snapshot: async () => snapshot,
  source: async (_, path) => {
    const file = demoFiles.find((f) => f.path === path);
    if (!file) throw new Error("No source found.");
    return file;
  },
  refresh: unavailable,
  compare: unavailable,
  investigations: async () => load().investigations,
  start: async (id) => {
    const data = load(),
      existing = data.investigations.find((i) => i.feature_id === id);
    if (existing) return existing;
    const f = demoFeatures.find((f) => f.id === id)!;
    const inv: Investigation = {
      id: "demo-" + id,
      project_id: "demo",
      snapshot_id: "demo-v1",
      title: f.title,
      feature_id: f.id,
      paths: f.paths,
      questions: f.questions,
      note: "",
      prediction: "",
      selected_path: f.paths[0],
      answers: [],
      outdated: false,
      updated_at: new Date().toISOString(),
    };
    data.investigations.push(inv);
    persist(data);
    return inv;
  },
  investigation: async (id) => {
    const result = load().investigations.find((i) => i.id === id);
    if (!result)
      throw new Error(
        "This investigation is not saved in this browser. Start from the demo.",
      );
    return result;
  },
  annotate: async (id, payload) => {
    const data = load(),
      index = data.investigations.findIndex((i) => i.id === id);
    data.investigations[index] = {
      ...data.investigations[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    persist(data);
    return data.investigations[index];
  },
  ask: async (id, question) => {
    const data = load(),
      inv = data.investigations.find((i) => i.id === id)!;
    inv.answers.push(
      demoAnswer(
        demoFeatures.find((f) => f.id === inv.feature_id)!,
        question,
      ),
    );
    persist(data);
    return {
      id: "demo-answer",
      kind: "explain",
      status: "completed",
      message: "Prepared explanation opened",
      result: inv.answers.at(-1),
    };
  },
  discoveries: async (id) =>
    load().discoveries.filter((d) => d.parent_id === id),
  save: async (id, title, body) => {
    const data = load(),
      note = {
        id: crypto.randomUUID(),
        title,
        body,
        parent_id: id,
        snapshot_id: "demo-v1",
        outdated: false,
        created_at: new Date().toISOString(),
      };
    data.discoveries.push(note);
    persist(data);
    return note;
  },
  profiles: async () => [],
  trust: unavailable,
  checks: async () => [],
  check: unavailable,
  job: unavailable,
  cancel: unavailable,
  export: async (id, format) => {
    const data = load(),
      inv = data.investigations.find((i) => i.id === id)!,
      notes = data.discoveries.filter((d) => d.parent_id === id);
    return new Blob(
      [
        format === "json"
          ? JSON.stringify(
              { investigation: inv, discoveries: notes, kind: "prepared-demo" },
              null,
              2,
            )
          : `# ${inv.title}\n\nPrepared Ravel demo; no live execution.\n\n${inv.note}\n\n${notes.map((n) => `## ${n.title}\n\n${n.body}`).join("\n\n")}`,
      ],
      { type: format === "json" ? "application/json" : "text/markdown" },
    );
  },
};
export const repoFor = (project: string | undefined) =>
  project === "demo" ? demo : local;
