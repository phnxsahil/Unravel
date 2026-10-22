import { request } from "./repository";
import type {
  FeatureMap,
  RecipeInput,
  RecipeSuggestion,
} from "./contracts.generated";
export type EvidenceMap = FeatureMap;
export interface ActionStep {
  action:
    "navigate" | "click" | "fill" | "upload" | "wait" | "reload" | "assert";
  name: string;
  role: "button" | "textbox" | "link" | "checkbox" | "combobox";
  value: string;
  milliseconds: number;
  expectation: "visible" | "hidden";
}
export interface Recipe {
  id: string;
  feature_id: string;
  label: string;
  url: string;
  approved_origins: string[];
  scenario: "ordinary" | "failure" | "slow" | "reload";
  request_path: string;
  delay_ms: number;
  steps: ActionStep[];
}
export interface ExperimentRun {
  id: string;
  recipe_id: string;
  job_id: string;
  status: string;
  message: string;
  artifact_ids: string[];
  events: { kind: string; message: string; elapsed_ms: number }[];
  requests: {
    path: string;
    method: string;
    status: number;
    elapsed_ms: number;
  }[];
  assertions: { text: string; met: boolean }[];
  duration_ms?: number;
  source_changed?: boolean;
  snapshot_outdated?: boolean;
}
export const studioApi = {
  map: (id: string) => request<EvidenceMap>(`/features/${id}/map`),
  suggestion: (id: string) =>
    request<RecipeSuggestion>(`/features/${id}/recipe-suggestion`),
  browser: () =>
    request<{ available: boolean; message: string }>("/browser/status"),
  appStatus: (url: string) =>
    request<{ reachable: boolean; message: string }>("/app/status", "POST", {
      url,
    }),
  recipes: (id: string) => request<Recipe[]>(`/projects/${id}/recipes`),
  saveRecipe: (id: string, body: RecipeInput) =>
    request<Recipe>(`/projects/${id}/recipes`, "POST", body),
  run: (id: string) =>
    request<ExperimentRun>(`/recipes/${id}/runs`, "POST", {
      approved: true,
      disposable_data: true,
    }),
  runs: (id: string) =>
    request<ExperimentRun[]>(`/projects/${id}/experiment-runs`),
  deleteArtifacts: (id: string) =>
    request(`/experiment-runs/${id}/artifacts`, "DELETE"),
};
