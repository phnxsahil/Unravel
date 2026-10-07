export interface RecordBase {
  id: string;
  project_id?: string;
  snapshot_id?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}
export interface Project extends RecordBase {
  name: string;
  root: string;
  status: string;
  latest_snapshot_id: string | null;
  file_count: number;
  feature_count: number;
  trusted: boolean;
  job_id?: string;
  last_error?: string | null;
}
export interface Feature extends RecordBase {
  title: string;
  description: string;
  category: string;
  paths: string[];
  entry_line: number;
  questions: string[];
  steps?: { path: string; label: string; description: string }[];
}
export interface Citation {
  path: string;
  line: number;
  end_line: number;
}
export interface Answer {
  summary: string;
  claims: {
    text: string;
    kind: "source" | "inferred";
    citations: Citation[];
  }[];
  questions: string[];
  experiment: string;
  question?: string;
  model?: string;
  cached?: boolean;
}
export interface Investigation extends RecordBase {
  title: string;
  feature_id: string;
  paths: string[];
  questions: string[];
  note: string;
  prediction: string;
  selected_path: string;
  answers: Answer[];
  outdated: boolean;
}
export interface Discovery extends RecordBase {
  title: string;
  body: string;
  outdated: boolean;
}
export interface SourceFile {
  path: string;
  body: string;
  hash?: string;
  language: string;
  lines: number;
}
export interface Snapshot extends RecordBase {
  digest: string;
  commit: string | null;
  dirty: boolean;
  files: SourceFile[];
  excluded: { path: string; reason: string }[];
  analysis?: {
    symbols: {
      name: string;
      path: string;
      line: number;
      end_line: number;
      kind: string;
    }[];
    edges: { from: string; to: string; kind: string }[];
    routes: { route: string; method: string; path: string; line: number }[];
    warnings: string[];
  };
}
export interface Job extends RecordBase {
  kind: string;
  status: string;
  message: string;
  result: any;
}
export interface Profile extends RecordBase {
  label: string;
  kind: string;
  cwd: string;
  script: string;
  timeout: number;
}
export interface Check extends RecordBase {
  label: string;
  status: string;
  output: string;
  job_id?: string;
  duration?: number;
  source_changed: boolean;
  snapshot_outdated?: boolean;
  scope?: string;
}
export interface Comparison {
  before: string;
  after: string;
  changes: { path: string; status: string; diff: string }[];
}
export interface Settings {
  mode: string;
  provider: string;
  model: string;
  ai_connected: boolean;
  storage: string;
  supported: string[];
  privacy: string;
}

export interface Repository {
  demo: boolean;
  settings(): Promise<Settings>;
  projects(): Promise<Project[]>;
  register(root: string): Promise<Project>;
  project(id: string): Promise<Project>;
  remove(id: string): Promise<void>;
  features(id: string): Promise<Feature[]>;
  snapshots(id: string): Promise<Snapshot[]>;
  snapshot(id: string): Promise<Snapshot>;
  source(id: string, path: string): Promise<SourceFile>;
  refresh(id: string): Promise<Job>;
  compare(before: string, after: string): Promise<Comparison>;
  investigations(project: string): Promise<Investigation[]>;
  start(feature: string): Promise<Investigation>;
  investigation(id: string): Promise<Investigation>;
  annotate(id: string, payload: Partial<Investigation>): Promise<Investigation>;
  ask(id: string, question: string, consent: boolean): Promise<Job>;
  discoveries(id: string): Promise<Discovery[]>;
  save(id: string, title: string, body: string): Promise<Discovery>;
  profiles(project: string): Promise<Profile[]>;
  trust(project: string): Promise<Project>;
  checks(id: string): Promise<Check[]>;
  check(id: string, profile: string): Promise<Check>;
  job(id: string): Promise<Job>;
  cancel(id: string): Promise<Job>;
  export(id: string, format: "markdown" | "json"): Promise<Blob>;
}
