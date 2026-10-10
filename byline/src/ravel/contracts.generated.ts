// Generated from Ravel FastAPI OpenAPI. Run python -m scripts.generate_contracts.
export type AppStatusInput = { "url": string };
export type CheckInput = { "profile_id": string; "investigation_id": string };
export type CheckResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "label": string; "status": string; "output": string; "source_changed": boolean; [key: string]: unknown };
export type Citation = { "path": string; "line": number; "end_line": number };
export type DiscoveryInput = { "title": string; "body": string };
export type DiscoveryResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "title": string; "body": string; "outdated": boolean; [key: string]: unknown };
export type FeatureMap = { "version": number; "snapshot_id": string; "digest": string; "feature_id": string; "title": string; "nodes": Array<MapNode>; "edges": Array<MapEdge>; "questions": Array<string>; "limitations": Array<string> };
export type FeatureResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "title": string; "description": string; "category": string; "paths": Array<string>; "questions": Array<string>; "entry_line": number; "edge_count"?: number; [key: string]: unknown };
export type HTTPValidationError = { "detail"?: Array<ValidationError> };
export type InvestigationInput = { "feature_id": string };
export type InvestigationResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "title": string; "feature_id": string; "paths": Array<string>; "questions": Array<string>; "note": string; "prediction": string; "selected_path": string; "answers": Array<{ [key: string]: unknown }>; "outdated": boolean; [key: string]: unknown };
export type InvestigationUpdate = { "note"?: string | null; "prediction"?: string | null; "selected_path"?: string | null };
export type JobResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "kind": string; "status": string; "message": string; "result"?: { [key: string]: unknown } | null; [key: string]: unknown };
export type MapEdge = { "id": string; "label": string; "kind": "source" | "inferred"; "citations": Array<Citation>; "to": string; "from": string };
export type MapNode = { "id": string; "label": string; "role": "action" | "source" | "route"; "kind": "source" | "inferred"; "citations": Array<Citation> };
export type ProfileResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "label": string; "kind": string; "script": string; "cwd": string; "timeout": number; [key: string]: unknown };
export type ProjectInput = { "root": string; "name"?: string };
export type ProjectResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "name": string; "root": string; "status": string; "trusted": boolean; "latest_snapshot_id"?: string | null; "file_count": number; "feature_count": number; "job_id"?: string | null; [key: string]: unknown };
export type QuestionInput = { "question": string; "consent"?: boolean };
export type RecipeInput = { "feature_id": string; "label": string; "url": string; "approved_origins"?: Array<string>; "scenario"?: "ordinary" | "failure" | "slow" | "reload"; "request_path"?: string; "delay_ms"?: number; "steps": Array<Step> };
export type RecipeSuggestion = { "feature_id": string; "snapshot_id": string; "title": string; "request_paths": Array<string>; "steps": Array<Step>; "citations": Array<Citation>; "limitations": Array<string> };
export type RunInput = { "approved"?: boolean; "disposable_data"?: boolean };
export type SnapshotResource = { "id": string; "created_at": string; "updated_at": string; "project_id"?: string | null; "snapshot_id"?: string | null; "parent_id"?: string | null; "digest": string; "commit": string | null; "dirty": boolean; "excluded": Array<{ [key: string]: unknown }>; [key: string]: unknown };
export type Step = { "action": "navigate" | "click" | "fill" | "upload" | "wait" | "reload" | "assert"; "name"?: string; "role"?: "button" | "textbox" | "link" | "checkbox" | "combobox"; "value"?: string; "milliseconds"?: number; "expectation"?: "visible" | "hidden" };
export type TrustInput = { "trusted": boolean };
export type ValidationError = { "loc": Array<string | number>; "msg": string; "type": string; "input"?: unknown; "ctx"?: Record<string, unknown> };

export const endpoints = {
  "/api/settings": {
    "get": {
      "operationId": "settings_api_settings_get"
    }
  },
  "/api/projects": {
    "get": {
      "operationId": "projects_api_projects_get"
    },
    "post": {
      "operationId": "register_api_projects_post"
    }
  },
  "/api/projects/{project_id}": {
    "get": {
      "operationId": "project_api_projects__project_id__get"
    },
    "delete": {
      "operationId": "remove_api_projects__project_id__delete"
    }
  },
  "/api/projects/{project_id}/trust": {
    "patch": {
      "operationId": "trust_api_projects__project_id__trust_patch"
    }
  },
  "/api/projects/{project_id}/snapshots": {
    "post": {
      "operationId": "refresh_api_projects__project_id__snapshots_post"
    },
    "get": {
      "operationId": "snapshots_api_projects__project_id__snapshots_get"
    }
  },
  "/api/snapshots/{snapshot_id}": {
    "get": {
      "operationId": "snapshot_api_snapshots__snapshot_id__get"
    }
  },
  "/api/snapshots/{snapshot_id}/source": {
    "get": {
      "operationId": "source_api_snapshots__snapshot_id__source_get"
    }
  },
  "/api/snapshots/{snapshot_id}/compare/{other_id}": {
    "get": {
      "operationId": "compare_api_snapshots__snapshot_id__compare__other_id__get"
    }
  },
  "/api/projects/{project_id}/features": {
    "get": {
      "operationId": "features_api_projects__project_id__features_get"
    }
  },
  "/api/projects/{project_id}/investigations": {
    "get": {
      "operationId": "investigations_api_projects__project_id__investigations_get"
    }
  },
  "/api/investigations": {
    "post": {
      "operationId": "start_api_investigations_post"
    }
  },
  "/api/investigations/{investigation_id}": {
    "get": {
      "operationId": "investigation_api_investigations__investigation_id__get"
    },
    "patch": {
      "operationId": "annotate_api_investigations__investigation_id__patch"
    }
  },
  "/api/investigations/{investigation_id}/questions": {
    "post": {
      "operationId": "ask_api_investigations__investigation_id__questions_post"
    }
  },
  "/api/investigations/{investigation_id}/discoveries": {
    "get": {
      "operationId": "discoveries_api_investigations__investigation_id__discoveries_get"
    },
    "post": {
      "operationId": "save_api_investigations__investigation_id__discoveries_post"
    }
  },
  "/api/projects/{project_id}/profiles": {
    "get": {
      "operationId": "profiles_api_projects__project_id__profiles_get"
    }
  },
  "/api/checks": {
    "post": {
      "operationId": "check_api_checks_post"
    }
  },
  "/api/investigations/{investigation_id}/checks": {
    "get": {
      "operationId": "checks_api_investigations__investigation_id__checks_get"
    }
  },
  "/api/jobs/{job_id}": {
    "get": {
      "operationId": "job_api_jobs__job_id__get"
    }
  },
  "/api/jobs/{job_id}/cancel": {
    "post": {
      "operationId": "cancel_api_jobs__job_id__cancel_post"
    }
  },
  "/api/jobs/{job_id}/events": {
    "get": {
      "operationId": "events_api_jobs__job_id__events_get"
    }
  },
  "/api/investigations/{investigation_id}/export": {
    "get": {
      "operationId": "export_api_investigations__investigation_id__export_get"
    }
  },
  "/api/browser/status": {
    "get": {
      "operationId": "browser_api_browser_status_get"
    }
  },
  "/api/app/status": {
    "post": {
      "operationId": "app_status_api_app_status_post"
    }
  },
  "/api/features/{feature_id}/map": {
    "get": {
      "operationId": "map_for_feature_api_features__feature_id__map_get"
    }
  },
  "/api/projects/{project_id}/recipes": {
    "get": {
      "operationId": "recipes_api_projects__project_id__recipes_get"
    },
    "post": {
      "operationId": "create_recipe_api_projects__project_id__recipes_post"
    }
  },
  "/api/features/{feature_id}/recipe-suggestion": {
    "get": {
      "operationId": "suggest_recipe_api_features__feature_id__recipe_suggestion_get"
    }
  },
  "/api/recipes/{recipe_id}/runs": {
    "post": {
      "operationId": "execute_api_recipes__recipe_id__runs_post"
    }
  },
  "/api/projects/{project_id}/experiment-runs": {
    "get": {
      "operationId": "runs_api_projects__project_id__experiment_runs_get"
    }
  },
  "/api/experiment-runs/{run_id}": {
    "get": {
      "operationId": "run_api_experiment_runs__run_id__get"
    }
  },
  "/api/artifacts/{artifact_id}": {
    "get": {
      "operationId": "artifact_api_artifacts__artifact_id__get"
    }
  },
  "/api/experiment-runs/{run_id}/artifacts": {
    "delete": {
      "operationId": "delete_artifacts_api_experiment_runs__run_id__artifacts_delete"
    }
  },
  "/api/projects/{project_id}/walkthrough": {
    "get": {
      "operationId": "walkthrough_api_projects__project_id__walkthrough_get"
    }
  },
  "/healthz": {
    "get": {
      "operationId": "health_healthz_get"
    }
  },
  "/{path}": {
    "get": {
      "operationId": "frontend__path__get"
    }
  }
} as const;
