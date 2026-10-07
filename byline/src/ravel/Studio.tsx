import { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileCode2,
  GitBranch,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { local } from "./repository";
import {
  studioApi,
  type ActionStep,
  type Recipe,
  type EvidenceMap,
} from "./studio-api";
import {
  Code,
  ErrorMessage,
  JobProgress,
  Loading,
  ThemeToggle,
  Wordmark,
} from "./shared";
import SearchJourney, {
  searchFiles,
  searchMap,
  SearchChanges,
  SearchNotebook,
} from "./SearchJourney";
import type { Investigation } from "./types";
import "./unravel.css";
const views = ["Overview", "Explore", "Experiments", "Changes", "Notebook"];
const newStep = (action: ActionStep["action"] = "click"): ActionStep => ({
  action,
  name: "",
  role: "button",
  value: "",
  milliseconds: 500,
  expectation: "visible",
});
export default function Studio() {
  const { projectId = "demo", view = "overview" } = useParams();
  const prepared = projectId === "demo";
  const cache = useQueryClient();
  const [selected, setSelected] = useState(() => {
      try {
        return sessionStorage.getItem(`unravel:feature:${projectId}`) || "";
      } catch {
        return "";
      }
    }),
    [node, setNode] = useState(""),
    [job, setJob] = useState(""),
    [consent, setConsent] = useState(false),
    [question, setQuestion] = useState(""),
    [note, setNote] = useState("");
  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => local.project(projectId),
    enabled: !prepared,
    refetchInterval: (q) => (q.state.data?.status === "indexing" ? 500 : false),
  });
  const features = useQuery({
    queryKey: ["features", projectId, project.data?.latest_snapshot_id],
    queryFn: () => local.features(projectId),
    enabled: !prepared && !!project.data?.latest_snapshot_id,
  });
  const ordered = [...(features.data || [])].sort(
    (a, b) =>
      Number(b.category === "Interface") - Number(a.category === "Interface"),
  );
  const feature = ordered.find((f) => f.id === selected) || ordered[0];
  const featureId = feature?.id || "";
  useEffect(() => {
    if (featureId) {
      try {
        sessionStorage.setItem(`unravel:feature:${projectId}`, featureId);
      } catch {
        /* Storage is optional. */
      }
    }
  }, [featureId, projectId]);
  const map = useQuery({
    queryKey: ["map", featureId],
    queryFn: () => studioApi.map(featureId),
    enabled: !prepared && !!featureId,
  });
  const evidence: EvidenceMap | undefined = prepared ? searchMap : map.data;
  const activeNode =
    evidence?.nodes.find((n) => n.id === node) || evidence?.nodes[0];
  const source = useQuery({
    queryKey: ["source", evidence?.snapshot_id, activeNode?.id],
    queryFn: () =>
      local.source(evidence!.snapshot_id, activeNode!.citations[0].path),
    enabled: !prepared && !!activeNode,
  });
  const file = prepared
    ? searchFiles.find((f) => f.path === activeNode?.id)
    : source.data;
  const questionLine =
    question && file
      ? file.body
          .split("\n")
          .findIndex((line) =>
            question.includes("fails")
              ? /catch|except|!response\.ok/.test(line)
              : question.includes("changing")
                ? /response\.json|fetch\(|axios\./.test(line)
                : /async function|onClick|onSubmit/.test(line),
          ) + 1
      : 0;
  const investigations = useQuery({
    queryKey: ["investigations", projectId],
    queryFn: () => local.investigations(projectId),
    enabled: !prepared,
  });
  const inv = investigations.data?.find((i) => i.feature_id === featureId);
  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: local.settings,
    enabled: !prepared,
  });
  const snapshots = useQuery({
    queryKey: ["snapshots", projectId],
    queryFn: () => local.snapshots(projectId),
    enabled: !prepared,
  });
  const comparison = useQuery({
    queryKey: ["comparison", snapshots.data?.[1]?.id, snapshots.data?.[0]?.id],
    queryFn: () => local.compare(snapshots.data![1].id, snapshots.data![0].id),
    enabled: !!snapshots.data?.[1],
  });
  const discoveries = useQuery({
    queryKey: ["discoveries", inv?.id],
    queryFn: () => local.discoveries(inv!.id),
    enabled: !!inv,
  });
  const captured = useQuery({
    queryKey: ["capture-details", project.data?.latest_snapshot_id],
    queryFn: () => local.snapshot(project.data!.latest_snapshot_id!),
    enabled: !prepared && !!project.data?.latest_snapshot_id,
  });
  const refreshAll = () => {
    cache.invalidateQueries();
  };
  const refresh = useMutation({
    mutationFn: () => local.refresh(projectId),
    onSuccess: (j) => setJob(j.id),
  });
  const getInvestigation = async (): Promise<Investigation> =>
    inv || (await local.start(featureId));
  const follow = useMutation({
    mutationFn: getInvestigation,
    onSuccess: refreshAll,
  });
  const ask = useMutation({
    mutationFn: async () => {
      const investigation = await getInvestigation();
      return local.ask(investigation.id, question, consent);
    },
    onSuccess: (j) => {
      setJob(j.id);
      refreshAll();
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      const investigation = await getInvestigation();
      return local.save(investigation.id, feature!.title, note);
    },
    onSuccess: () => {
      setNote("");
      refreshAll();
    },
  });
  useEffect(() => {
    setNode("");
    setQuestion("");
  }, [featureId]);
  return (
    <div className="studio">
      <aside className="studio-nav">
        <Wordmark />
        <Link className="studio-back" to="/projects">
          <ArrowLeft size={15} /> Projects
        </Link>
        <div className="studio-project">
          {prepared
            ? "Search contract demo"
            : project.data?.name || "Your project"}
        </div>
        <nav aria-label="Project navigation">
          {views.map((v) => (
            <NavLink
              key={v}
              end
              to={`/projects/${projectId}/${v.toLowerCase()}`}
              className={view === v.toLowerCase() ? "selected" : ""}
            >
              {v}
            </NavLink>
          ))}
        </nav>
        <div className="studio-nav-bottom">
          <Link to="/docs">Documentation</Link>
          <Link to="/settings">Settings</Link>
          <ThemeToggle />
        </div>
      </aside>
      <main id="main-content" className="studio-main" tabIndex={-1}>
        <div className="studio-top">
          <span>
            {prepared
              ? "Prepared example · no live execution"
              : "Local project · captured source"}
          </span>
          {!prepared && (
            <button
              className="button"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
            >
              <RefreshCw size={15} />
              Check for changes
            </button>
          )}
        </div>
        <ErrorMessage
          error={project.error || features.error || map.error || refresh.error}
        />
        {job && (
          <JobProgress key={job} id={job} repo={local} onDone={refreshAll} />
        )}
        {!prepared && project.isLoading && <Loading />}
        {!prepared &&
          project.data?.status === "indexing" &&
          project.data.job_id && (
            <JobProgress
              id={project.data.job_id}
              repo={local}
              onDone={refreshAll}
            />
          )}
        {(view === "overview" || view === "explore") && (
          <>
            <header className="studio-heading">
              <div className="micro-label">
                {view === "overview"
                  ? "START WITH SOMETHING YOU RECOGNIZE"
                  : "FOLLOW THE EVIDENCE"}
              </div>
              <h1>
                {view === "overview"
                  ? "Explore your app"
                  : evidence?.title || "Choose a starting point"}
              </h1>
              <p>
                Start with a part you can see. Follow its code, then find out
                what happens outside the happy path.
              </p>
            </header>
            {prepared && view === "overview" ? (
              <>
                <SearchJourney />
                <Link className="button primary" to="/projects/demo/explore">
                  Inspect the source <ArrowRight size={16} />
                </Link>
              </>
            ) : null}
            {!prepared && project.data?.last_error && (
              <p className="message error">
                {project.data.last_error} Use Check for changes to retry, or
                return to Projects and choose another folder.
              </p>
            )}
            {!prepared && view === "overview" && captured.data && (
              <details className="capture-details">
                <summary>
                  {captured.data.files.length} source files · {ordered.length}{" "}
                  starting points · {captured.data.excluded.length} exclusions
                </summary>
                <p>
                  React/JS/TS and Python/FastAPI have initial discovery support.
                  Literal action labels are used when available; other titles
                  retain their source name. This is a partial static map.
                </p>
                <ul>
                  {captured.data.analysis?.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {captured.data.excluded.slice(0, 50).map((e) => (
                    <li key={e.path}>
                      <code>{e.path}</code> · {e.reason}
                    </li>
                  ))}
                </ul>
                {captured.data.excluded.length > 50 && (
                  <p>Showing the first 50 exclusions.</p>
                )}
              </details>
            )}
            {!prepared && (
              <div className="feature-choices" aria-label="Starting features">
                {ordered.map((f) => (
                  <button
                    key={f.id}
                    className={featureId === f.id ? "selected" : ""}
                    onClick={() => setSelected(f.id)}
                  >
                    <span>{f.title}</span>
                    <code>{f.paths[0]}</code>
                  </button>
                ))}
                {!features.isLoading && !ordered.length && (
                  <p>
                    No supported starting point found. Check the capture
                    exclusions or connect React, JavaScript, TypeScript or
                    FastAPI source. Other frameworks have partial source
                    browsing support.
                  </p>
                )}
              </div>
            )}
            {(view === "explore" || !prepared) && evidence && (
              <>
                <div className="evidence-layout">
                  <section
                    className="feature-map"
                    aria-label="Feature source map"
                  >
                    <div className="panel-heading">
                      <GitBranch size={16} />
                      <h2>How it connects</h2>
                      <span>Snapshot {evidence.digest.slice(0, 8)}</span>
                    </div>
                    <ol className="source-path">
                      {evidence.nodes.map((n, index) => (
                        <li key={n.id}>
                          <button
                            aria-pressed={n.id === activeNode?.id}
                            onClick={() => setNode(n.id)}
                          >
                            <span className="thread-node">{index + 1}</span>
                            <span>
                              <strong>{n.label}</strong>
                              <small>Found in code</small>
                              <code>
                                {n.citations[0].path}:{n.citations[0].line}
                              </code>
                            </span>
                          </button>
                          {evidence.edges
                            .filter((e) => e.from === n.id)
                            .map((e) => (
                              <button
                                className="connection-evidence"
                                key={e.id}
                                onClick={() => setNode(e.to)}
                              >
                                {e.label} ·{" "}
                                {e.kind === "inferred"
                                  ? "Inferred"
                                  : "Found in code"}
                                <ArrowRight size={14} />
                              </button>
                            ))}
                        </li>
                      ))}
                    </ol>
                    <p className="map-limitation">
                      {evidence.limitations.join(" ")}
                    </p>
                  </section>
                  <section
                    className="source-inspector"
                    aria-label="Source evidence"
                  >
                    <div className="panel-heading">
                      <FileCode2 size={16} />
                      <h2>Source evidence</h2>
                    </div>
                    {file ? (
                      <Code
                        file={file}
                        highlight={
                          questionLine || activeNode?.citations[0].line
                        }
                      />
                    ) : (
                      <Loading text="Reading captured source…" />
                    )}
                    <ErrorMessage error={source.error} />
                  </section>
                </div>
                <section className="understand-panel">
                  <h2>What would you like to understand?</h2>
                  {!prepared && (
                    <>
                      <button
                        className="button"
                        disabled={!featureId || !!inv || follow.isPending}
                        onClick={() => follow.mutate()}
                      >
                        {inv ? "Following this feature" : "Follow this feature"}
                      </button>
                      <p>
                        Keep this source version for your next visit. Changes
                        will flag it for review after an affected edit. No AI
                        key or note is required.
                      </p>
                      <ErrorMessage error={follow.error} />
                    </>
                  )}
                  <div className="question-choices">
                    {evidence.questions.slice(0, 3).map((q) => (
                      <button
                        key={q}
                        className="button"
                        onClick={() => {
                          setQuestion(q);
                          setNode(evidence.nodes[0]?.id || "");
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  {question && (
                    <p className="rule-suggestion">
                      <strong>Source-first suggestion:</strong>{" "}
                      {question.includes("fails")
                        ? "Inspect error handling and loading state, then try a failed-request scenario."
                        : question.includes("changing")
                          ? "Identify the action handler and request contract. Review dependent code before editing."
                          : "Start at the action handler, follow its imports, then inspect the matching route."}{" "}
                      This suggestion is rule based.
                      {questionLine > 0 && (
                        <>
                          {" "}
                          Highlighted{" "}
                          <code>
                            {file?.path}:{questionLine}
                          </code>
                          . Read the surrounding branch before drawing a
                          conclusion.
                        </>
                      )}
                    </p>
                  )}
                  {prepared ? (
                    <p>
                      This demo does not call an AI provider. Connect your
                      project to ask about its captured source.
                    </p>
                  ) : settings.data?.ai_connected ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        ask.mutate();
                      }}
                    >
                      <label htmlFor="source-question">Your question</label>
                      <input
                        id="source-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                      />
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        I allow the question and bounded source context from
                        this project capture to be sent to Anthropic for this
                        answer.
                      </label>
                      <button
                        className="button primary"
                        disabled={!consent || ask.isPending}
                      >
                        Ask with source
                      </button>
                    </form>
                  ) : (
                    <p>
                      No AI key connected. You can explore source and save
                      notes. <Link to="/settings">Configure optional AI</Link>.
                    </p>
                  )}
                  <ErrorMessage error={ask.error} />
                  {inv?.outdated && (
                    <p className="message">
                      This explanation belongs to an earlier source version.
                      Revisit the feature before relying on it.
                    </p>
                  )}
                  {inv?.answers.map((a, i) => (
                    <article className="answer-evidence" key={i}>
                      <h3>{a.question}</h3>
                      <p>{a.summary}</p>
                      {a.claims.map((c, j) => (
                        <p key={j}>
                          <strong>
                            {c.kind === "source" ? "Found in code" : "Inferred"}
                            :
                          </strong>{" "}
                          {c.text}
                          <small>
                            {c.citations
                              .map((c) => `${c.path}:${c.line}–${c.end_line}`)
                              .join(" · ")}
                          </small>
                        </p>
                      ))}
                    </article>
                  ))}
                  <Link
                    className="button"
                    to={`/projects/${projectId}/experiments`}
                  >
                    Try a controlled experiment <ArrowRight size={16} />
                  </Link>
                </section>
              </>
            )}
          </>
        )}
        {view === "experiments" && (
          <Experiments
            projectId={projectId}
            featureId={featureId}
            prepared={prepared}
            onJob={setJob}
          />
        )}
        {view === "changes" && (
          <>
            <header className="studio-heading">
              <h1>Return with context.</h1>
              <p>
                Capture external edits without replacing the evidence you
                explored earlier.
              </p>
            </header>
            {prepared ? (
              <SearchChanges />
            ) : (
              <>
                <ErrorMessage error={snapshots.error || comparison.error} />
                {comparison.data?.changes.map((c) => (
                  <details className="change-entry" key={c.path}>
                    <summary>
                      {c.status} · {c.path}
                    </summary>
                    <pre>{c.diff}</pre>
                  </details>
                ))}
                {!comparison.data && (
                  <p>
                    Capture another version to compare. Your first snapshot is
                    preserved.
                  </p>
                )}
                {investigations.data
                  ?.filter((i) => i.outdated)
                  .map((i) => (
                    <div className="change-entry" key={i.id}>
                      <h3>{i.title}</h3>
                      <p>
                        Potentially outdated. Revisit its source and approve a
                        new experiment.
                      </p>
                      <Link
                        to={`/projects/${projectId}/explore`}
                        onClick={() => {
                          const current = ordered.find((f) =>
                            f.paths.some((p) => i.paths.includes(p)),
                          );
                          if (current) setSelected(current.id);
                        }}
                      >
                        Revisit this feature
                      </Link>
                      <Link
                        className="button"
                        to={`/projects/${projectId}/explore/${i.id}`}
                      >
                        Read the preserved explanation
                      </Link>
                      <Link
                        className="button"
                        to={`/projects/${projectId}/experiments`}
                      >
                        Review saved experiments
                      </Link>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
        {view === "notebook" && (
          <>
            <header className="studio-heading">
              <h1>Keep what clicked.</h1>
              <p>
                Notes are optional. Your source versions and experiment results
                remain available without writing one.
              </p>
            </header>
            {prepared ? (
              <SearchNotebook />
            ) : (
              <>
                <label htmlFor="discovery-note">
                  A discovery about {feature?.title || "your project"}
                </label>
                <textarea
                  id="discovery-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
                <button
                  className="button primary"
                  disabled={!note.trim() || !feature || save.isPending}
                  onClick={() => save.mutate()}
                >
                  Save a discovery
                </button>
                <ErrorMessage error={save.error} />
                {discoveries.data?.map((d) => (
                  <article className="change-entry" key={d.id}>
                    <h3>{d.title}</h3>
                    <p>{d.body}</p>
                    {d.outdated && (
                      <small>From an earlier source version</small>
                    )}
                  </article>
                ))}
                <h2>Your explorations</h2>
                {investigations.data?.map((i) => (
                  <Link
                    className="notebook-link"
                    key={i.id}
                    to={`/projects/${projectId}/explore/${i.id}`}
                  >
                    {i.title} ·{" "}
                    {i.outdated ? "Review source changes" : "Captured evidence"}{" "}
                    <ArrowRight size={14} />
                  </Link>
                ))}
                <a
                  className="button"
                  href={`/api/projects/${projectId}/walkthrough`}
                >
                  Export project walkthrough
                </a>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
function Experiments({
  projectId,
  featureId,
  prepared,
  onJob,
}: {
  projectId: string;
  featureId: string;
  prepared: boolean;
  onJob: (id: string) => void;
}) {
  const cache = useQueryClient();
  const browser = useQuery({
    queryKey: ["browser"],
    queryFn: studioApi.browser,
    enabled: !prepared,
  });
  const recipes = useQuery({
    queryKey: ["recipes", projectId],
    queryFn: () => studioApi.recipes(projectId),
    enabled: !prepared,
  });
  const runs = useQuery({
    queryKey: ["runs", projectId],
    queryFn: () => studioApi.runs(projectId),
    enabled: !prepared,
    refetchInterval: (q) =>
      q.state.data?.some((r) => ["queued", "running"].includes(r.status))
        ? 600
        : false,
  });
  const suggestion = useQuery({
    queryKey: ["recipe-suggestion", featureId],
    queryFn: () => studioApi.suggestion(featureId),
    enabled: !prepared && !!featureId,
  });
  const [url, setUrl] = useState(""),
    [extraOrigins, setExtraOrigins] = useState(""),
    [target, setTarget] = useState(""),
    [scenario, setScenario] = useState<Recipe["scenario"]>("failure"),
    [steps, setSteps] = useState<ActionStep[]>([]),
    [approvedRecipe, setApprovedRecipe] = useState(""),
    [approve, setApprove] = useState(false),
    [disposable, setDisposable] = useState(false);
  useEffect(() => {
    setTarget(suggestion.data?.request_paths[0] || "");
    setSteps(
      (suggestion.data?.steps || []).map((s) => ({
        ...newStep(s.action),
        ...s,
      })),
    );
    setApprove(false);
    setDisposable(false);
  }, [featureId, suggestion.data]);
  useEffect(() => {
    setApprove(false);
    setDisposable(false);
  }, [url, target, scenario, steps, extraOrigins]);
  const create = useMutation({
    mutationFn: () =>
      studioApi.saveRecipe(projectId, {
        feature_id: featureId,
        label: `${(suggestion.data?.title || "Custom action").slice(0, 90)} · ${scenario}`,
        url,
        approved_origins: extraOrigins.split(/[\s,]+/).filter(Boolean),
        scenario,
        request_path: target,
        delay_ms: 2000,
        steps,
      }),
    onSuccess: (recipe) => {
      setApprovedRecipe(recipe.id);
      setApprove(false);
      setDisposable(false);
      cache.invalidateQueries({ queryKey: ["recipes", projectId] });
    },
  });
  const run = useMutation({
    mutationFn: async (id: string) => {
      await local.trust(projectId);
      return studioApi.run(id);
    },
    onSuccess: (r) => {
      onJob(r.job_id);
      cache.invalidateQueries({ queryKey: ["runs", projectId] });
    },
  });
  const remove = useMutation({
    mutationFn: studioApi.deleteArtifacts,
    onSuccess: () => cache.invalidateQueries({ queryKey: ["runs", projectId] }),
  });
  return (
    <>
      <header className="studio-heading">
        <div className="micro-label">
          CHANGE THE CONDITIONS. OBSERVE THE RESULT.
        </div>
        <h1>Try the other path.</h1>
        <p>
          Fail a request, slow it down, or reload after an action. See what the
          app actually does.
        </p>
      </header>
      {prepared ? (
        <>
          <SearchJourney experiment />
          <p>
            This is a prepared simulation. For a real browser run, connect your
            project and start its development app locally.
          </p>
          <Link className="button primary" to="/projects">
            Connect a project
          </Link>
        </>
      ) : (
        <>
          <p className="experiment-prerequisite">
            {browser.data?.message || "Checking optional browser support…"}{" "}
            <Link to="/docs/experiments">
              Browser setup and experiment guide
            </Link>
          </p>
          <ErrorMessage error={browser.error} />
          <ErrorMessage error={suggestion.error} />
          <form
            className="recipe-editor"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <h2>1. Open your development app</h2>
            <p>
              Your development app must already be running. Use its own port,
              not Unravel’s port.
            </p>
            <div className="form-columns">
              <label>
                Local app URL
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="http://localhost:5173"
                />
              </label>
            </div>
            <details className="recipe-action" open={!!url}>
              <summary>2. Review the suggested action</summary>
              <p>
                Enter your app URL above, then review the source-based
                suggestions and add the result you expect.
              </p>
              <div className="form-columns">
                <label>
                  Target request path
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Scenario
                  <select
                    value={scenario}
                    onChange={(e) =>
                      setScenario(e.target.value as Recipe["scenario"])
                    }
                  >
                    <option value="ordinary">
                      Observe without changing the request
                    </option>
                    <option value="failure">
                      Fail the selected request (503)
                    </option>
                    <option value="slow">
                      Delay the selected request (2 seconds)
                    </option>
                    <option value="reload">Reload after the action</option>
                  </select>
                </label>
              </div>

              <p>
                {suggestion.data
                  ? `Suggestions for ${suggestion.data.title}, from snapshot ${suggestion.data.snapshot_id.slice(0, 8)}.`
                  : "Choose a captured feature to get source-based suggestions."}
              </p>
              {suggestion.data?.limitations.map((text) => (
                <p key={text}>{text}</p>
              ))}
              {!!suggestion.data?.citations.length && (
                <details>
                  <summary>Supporting source</summary>
                  <ul>
                    {suggestion.data.citations.map((c, i) => (
                      <li key={i}>
                        <code>
                          {c.path}:{c.line}
                        </code>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <label>
                Additional local origins (optional)
                <input
                  value={extraOrigins}
                  onChange={(e) => setExtraOrigins(e.target.value)}
                  placeholder="http://127.0.0.1:8001"
                  aria-describedby="origins-help"
                />
              </label>
              <p id="origins-help">
                If your API runs on another port, approve its origin here.
                Separate up to two additional local origins with commas.
                Redirects and external services are unsupported.
              </p>
              <p>
                Match controls by their accessible names. Upload uses a bundled
                tiny PNG; assertions match exact visible text. Add an explicit
                reload step for the reload scenario.
              </p>
              <ol className="step-editor">
                {steps.map((s, i) => (
                  <li key={i}>
                    <span>{i + 1}</span>
                    <label>
                      Action
                      <select
                        value={s.action}
                        onChange={(e) =>
                          setSteps(
                            steps.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    action: e.target
                                      .value as ActionStep["action"],
                                  }
                                : x,
                            ),
                          )
                        }
                      >
                        {[
                          "navigate",
                          "click",
                          "fill",
                          "upload",
                          "wait",
                          "reload",
                          "assert",
                        ].map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </label>
                    {!["reload", "wait", "navigate"].includes(s.action) && (
                      <label>
                        Accessible name / expected text
                        <input
                          value={s.name}
                          onChange={(e) =>
                            setSteps(
                              steps.map((x, j) =>
                                j === i ? { ...x, name: e.target.value } : x,
                              ),
                            )
                          }
                          required
                        />
                      </label>
                    )}
                    {s.action === "click" && (
                      <label>
                        Control role
                        <select
                          value={s.role}
                          onChange={(e) =>
                            setSteps(
                              steps.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      role: e.target
                                        .value as ActionStep["role"],
                                    }
                                  : x,
                              ),
                            )
                          }
                        >
                          {[
                            "button",
                            "textbox",
                            "link",
                            "checkbox",
                            "combobox",
                          ].map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    {["navigate", "fill"].includes(s.action) && (
                      <label>
                        {s.action === "navigate"
                          ? "Relative path"
                          : "Text value"}
                        <input
                          value={s.value}
                          onChange={(e) =>
                            setSteps(
                              steps.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </label>
                    )}
                    {s.action === "wait" && (
                      <label>
                        Wait in milliseconds
                        <input
                          type="number"
                          min={0}
                          max={10000}
                          value={s.milliseconds}
                          onChange={(e) =>
                            setSteps(
                              steps.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      milliseconds: Number(e.target.value),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                    )}
                    {s.action === "assert" && (
                      <label>
                        Expected state
                        <select
                          value={s.expectation}
                          onChange={(e) =>
                            setSteps(
                              steps.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      expectation: e.target
                                        .value as ActionStep["expectation"],
                                    }
                                  : x,
                              ),
                            )
                          }
                        >
                          <option value="visible">Visible</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </label>
                    )}
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Remove step ${i + 1}`}
                      onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="button"
                disabled={steps.length >= 20}
                onClick={() => setSteps([...steps, newStep()])}
              >
                <Plus size={15} />
                Add step
              </button>
              <button
                className="button primary"
                disabled={!featureId || !steps.length || create.isPending}
              >
                Save experiment recipe
              </button>
              <ErrorMessage error={create.error} />
            </details>
          </form>
          <section className="experiment-approval">
            <h2>3. Approve one saved recipe</h2>
            <p>
              A fresh browser isolates browser state, not backend data. Actions
              can create or change records in your app. External destinations
              and authentication flows are blocked.
            </p>
            <label>
              Recipe to run
              <select
                value={approvedRecipe}
                onChange={(e) => {
                  setApprovedRecipe(e.target.value);
                  setApprove(false);
                  setDisposable(false);
                }}
              >
                <option value="">Choose a saved recipe</option>
                {recipes.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} · {r.request_path} · {r.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={approve}
                onChange={(e) => setApprove(e.target.checked)}
              />
              I approve the recipe’s local URL, steps, target request and
              expected result.
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={disposable}
                onChange={(e) => setDisposable(e.target.checked)}
              />
              I am using disposable development data.
            </label>
            {recipes.data?.map((r) => (
              <details className="saved-recipe" key={r.id} open>
                <summary>{r.label}</summary>
                <code>
                  {r.url} · {r.request_path}
                </code>
                <p>Approved origins: {r.approved_origins.join(", ")}</p>
                <ol>
                  {r.steps.map((s, i) => (
                    <li key={i}>
                      {s.action} {s.name || s.value}{" "}
                      {s.action === "assert" ? `(${s.expectation})` : ""}
                    </li>
                  ))}
                </ol>
                <button
                  className="button primary"
                  disabled={
                    approvedRecipe !== r.id ||
                    !approve ||
                    !disposable ||
                    !browser.data?.available ||
                    run.isPending ||
                    runs.data?.some((x) =>
                      ["queued", "running"].includes(x.status),
                    )
                  }
                  onClick={() => run.mutate(r.id)}
                >
                  Run this experiment
                </button>
              </details>
            ))}
            <ErrorMessage error={run.error || recipes.error} />
          </section>
          <section>
            <h2>4. What was observed</h2>
            {!runs.data?.length && (
              <p>
                Your approved runs appear here, including unsuccessful and
                interrupted runs.
              </p>
            )}
            {runs.data?.map((r) => (
              <article className="run-result" key={r.id}>
                <div className="panel-heading">
                  <h3>{r.status.replaceAll("_", " ")}</h3>
                  <span>Observed in this run</span>
                </div>
                <p>{r.message}</p>
                {(r.source_changed || r.snapshot_outdated) && (
                  <p className="message">
                    Source changed or differs from the recipe. Revisit the map;
                    this result does not establish what the earlier code did.
                  </p>
                )}
                <ul>
                  {r.assertions?.map((a, i) => (
                    <li key={i}>
                      {a.met ? "✓" : "×"} {a.text}
                    </li>
                  ))}
                </ul>
                <details>
                  <summary>Request evidence and timeline</summary>
                  <ul>
                    {r.requests?.map((q, i) => (
                      <li key={i}>
                        <code>
                          {q.method} {q.path}
                        </code>{" "}
                        · {q.status}
                      </li>
                    ))}
                    {r.events?.map((e, i) => (
                      <li key={i}>
                        {e.elapsed_ms}ms · {e.message}
                      </li>
                    ))}
                  </ul>
                </details>
                {r.artifact_ids?.map((id) => (
                  <a
                    key={id}
                    href={`/api/artifacts/${id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`/api/artifacts/${id}`}
                      alt="Final browser state from this experiment"
                      loading="lazy"
                    />
                  </a>
                ))}
                {!!r.artifact_ids?.length && (
                  <button
                    className="button"
                    onClick={() => remove.mutate(r.id)}
                  >
                    Delete local screenshots
                  </button>
                )}
                <small>
                  One controlled run is evidence about this recipe, not proof
                  that the whole app works.
                </small>
              </article>
            ))}
            <ErrorMessage error={runs.error || remove.error} />
          </section>
        </>
      )}
    </>
  );
}
