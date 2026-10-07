import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Download,
  FileCode2,
  FlaskConical,
  GitBranch,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { GuideLink } from "./SiteChrome";
import { repoFor } from "./repository";
import type { Answer, Investigation, Repository } from "./types";

import {
  Code,
  ErrorMessage,
  JobProgress,
  Loading,
  Pill,
  Shell,
  cls,
} from "./shared";
function Explanation({
  answer,
  onSource,
}: {
  answer: Answer;
  onSource: (path: string, line: number) => void;
}) {
  return (
    <div className="explanation">
      <div className="explanation-heading">
        <Sparkles size={17} />
        <span>Follow the idea</span>
        {answer.cached && <Pill>Saved explanation</Pill>}
      </div>
      <p className="answer-summary">{answer.summary}</p>
      <div className="claims">
        {answer.claims.map((claim, index) => (
          <div className="claim" key={index}>
            <Pill tone={claim.kind === "inferred" ? "warning" : ""}>
              {claim.kind === "source" ? "From the source" : "Inferred"}
            </Pill>
            <p>{claim.text}</p>
            <div className="citations">
              {claim.citations.map((c) => (
                <button
                  key={c.path + c.line}
                  onClick={() => onSource(c.path, c.line)}
                >
                  <FileCode2 size={12} />
                  {c.path.split("/").at(-1)}:{c.line}
                  <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="answer-limit">
        Source citations show where to look. They do not prove the explanation
        is correct or that the behavior was observed.
      </p>
    </div>
  );
}

function Notebook({ repo, inv }: { repo: Repository; inv: Investigation }) {
  const cache = useQueryClient();
  const discoveries = useQuery({
    queryKey: ["discoveries", inv.id],
    queryFn: () => repo.discoveries(inv.id),
  });
  const [title, setTitle] = useState(""),
    [body, setBody] = useState("");
  const save = useMutation({
    mutationFn: () => repo.save(inv.id, title, body),
    onSuccess: () => {
      setTitle("");
      setBody("");
      cache.invalidateQueries({ queryKey: ["discoveries", inv.id] });
    },
  });
  const exportFile = useMutation({
    mutationFn: async (format: "markdown" | "json") => {
      const blob = await repo.export(inv.id, format),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `ravel-discovery.${format === "json" ? "json" : "md"}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  });
  return (
    <section className="notebook">
      <div className="tab-intro">
        <span className="section-label">YOUR OWN WORDS MATTER</span>
        <h2>Keep the part that clicked.</h2>
        <p>A small note you can revisit, explain, or build on later.</p>
      </div>
      <form
        className="discovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label htmlFor="discovery-title">What did you discover?</label>
        <input
          id="discovery-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Saving and updating the screen are different things"
          required
          maxLength={200}
        />
        <label htmlFor="discovery-body">The idea, in your own words</label>
        <textarea
          id="discovery-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="I followed… I expected… The source showed… I still want to explore…"
          rows={5}
          required
        />
        <button className="button primary" disabled={save.isPending}>
          <Bookmark size={16} />
          Save discovery
        </button>
        <ErrorMessage error={save.error} />
      </form>
      {!!discoveries.data?.length && (
        <p className="discovery-complete" role="status">
          <Check size={17} /> Your discovery is saved. You can reopen it after
          restarting Ravel.
        </p>
      )}
      <div className="list-heading">
        <h3>Saved discoveries</h3>
        <div className="export-actions">
          <button
            className="button secondary small"
            onClick={() => exportFile.mutate("markdown")}
          >
            <Download size={14} />
            Markdown
          </button>
          <button
            className="button text-button small"
            onClick={() => exportFile.mutate("json")}
          >
            JSON
          </button>
        </div>
      </div>
      <ErrorMessage error={discoveries.error || exportFile.error} />
      {discoveries.data?.length ? (
        discoveries.data.map((d) => (
          <article className="discovery" key={d.id}>
            <div>
              <Bookmark size={17} />
              <span className="mono">
                {d.created_at
                  ? new Date(d.created_at).toLocaleDateString()
                  : "Saved here"}
              </span>
              {d.outdated && <Pill tone="warning">Source changed</Pill>}
            </div>
            <h3>{d.title}</h3>
            <p>{d.body}</p>
          </article>
        ))
      ) : (
        <div className="notebook-empty">
          <BookOpen size={24} />
          <p>
            Your first discovery belongs here.
            <br />A question you sharpened counts, too.
          </p>
        </div>
      )}
    </section>
  );
}

function Experiment({ repo, inv }: { repo: Repository; inv: Investigation }) {
  const cache = useQueryClient();
  const [prediction, setPrediction] = useState(inv.prediction),
    [job, setJob] = useState(""),
    [profile, setProfile] = useState("");
  const snapshots = useQuery({
    queryKey: ["snapshots", inv.project_id],
    queryFn: () => repo.snapshots(inv.project_id!),
  });
  const project = useQuery({
    queryKey: ["project", inv.project_id],
    queryFn: () => repo.project(inv.project_id!),
  });
  const profiles = useQuery({
    queryKey: ["profiles", inv.project_id],
    queryFn: () => repo.profiles(inv.project_id!),
  });
  const checks = useQuery({
    queryKey: ["checks", inv.id],
    queryFn: () => repo.checks(inv.id),
  });
  const save = useMutation({
    mutationFn: () => repo.annotate(inv.id, { prediction }),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: ["investigation", inv.id] }),
  });
  const refresh = useMutation({
    mutationFn: () => repo.refresh(inv.project_id!),
    onSuccess: (j) => setJob(j.id),
  });
  const trust = useMutation({
    mutationFn: () => repo.trust(inv.project_id!),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: ["project", inv.project_id] }),
  });
  const run = useMutation({
    mutationFn: () => repo.check(inv.id, profile),
    onSuccess: (c) => {
      setJob(c.job_id || "");
      cache.invalidateQueries({ queryKey: ["checks", inv.id] });
    },
  });
  const latest = snapshots.data?.[0];
  const comparison = useQuery({
    queryKey: ["comparison", inv.snapshot_id, latest?.id],
    queryFn: () => repo.compare(inv.snapshot_id!, latest!.id),
    enabled: !repo.demo && !!latest && latest.id !== inv.snapshot_id,
  });
  return (
    <section className="experiment">
      <div className="tab-intro">
        <span className="section-label">AN OPTIONAL DETOUR</span>
        <h2>What happens if…?</h2>
        <p>
          Predict something. Try a small change in your editor. Inspect what
          happened.
        </p>
      </div>
      <div className="experiment-prompt">
        <FlaskConical size={20} />
        <p>
          {inv.answers.at(-1)?.experiment ||
            "Pick one branch or state in this feature. Predict what happens if its input changes or a request fails. Then follow the relevant source."}
        </p>
      </div>
      <label className="field-label" htmlFor="prediction">
        My prediction
      </label>
      <textarea
        id="prediction"
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
        placeholder="I think… because…"
        rows={3}
      />
      <button
        className="button secondary small"
        onClick={() => save.mutate()}
        disabled={save.isPending}
      >
        <Check size={14} />
        {save.isSuccess ? "Prediction saved" : "Keep this prediction"}
      </button>
      {repo.demo ? (
        <div className="message demo-message">
          <CircleHelp size={17} />
          <span>
            The demo doesn’t execute code. Use the local workshop to compare
            your own changes and run checks.
          </span>
        </div>
      ) : (
        <>
          <div className="experiment-divider" />
          <div className="list-heading">
            <div>
              <h3>Inspect your change</h3>
              <p>Make the edit externally, then take a new source snapshot.</p>
            </div>
            <button
              className="button secondary small"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
            >
              <RefreshCw size={14} />
              Capture changes
            </button>
          </div>
          {comparison.data &&
            (comparison.data.changes.length ? (
              comparison.data.changes.map((c) => (
                <details className="diff-item" key={c.path} open>
                  <summary>
                    <Pill>{c.status}</Pill>
                    <code>{c.path}</code>
                    <ChevronDown size={14} />
                  </summary>
                  <pre>{c.diff}</pre>
                </details>
              ))
            ) : (
              <p className="subtle">
                No source differences between these snapshots.
              </p>
            ))}
          {latest?.id === inv.snapshot_id && (
            <p className="subtle">
              This investigation still matches the latest captured source.
            </p>
          )}
          <div className="list-heading">
            <div>
              <h3>Check the result</h3>
              <p>Choose an existing project check. Ravel doesn’t invent one.</p>
            </div>
          </div>
          <label className="field-label" htmlFor="check-profile">
            Check profile
          </label>
          <div className="input-row">
            <select
              id="check-profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            >
              <option value="">Choose a check…</option>
              {profiles.data?.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              className="button primary"
              onClick={() => run.mutate()}
              disabled={!profile || !project.data?.trusted || run.isPending}
            >
              <Play size={15} />
              Run check
            </button>
          </div>
          {!project.data?.trusted && (
            <div className="trust-box">
              <p>
                Checks execute this project’s code on your computer. They are
                not sandboxed. Only enable them for a project you trust.
              </p>
              <button
                className="button secondary small"
                onClick={() => trust.mutate()}
                disabled={trust.isPending}
              >
                I trust this project
              </button>
            </div>
          )}
          {profiles.data?.length === 0 && (
            <p className="subtle">
              No supported npm scripts or pytest configuration were found. You
              can still inspect changes and record what you tried.
            </p>
          )}
          {job && (
            <JobProgress
              id={job}
              repo={repo}
              onDone={() => cache.invalidateQueries()}
            />
          )}
          {checks.data?.map((c) => (
            <div className="check-result" key={c.id}>
              <div>
                <strong>{c.label}</strong>
                <Pill tone={c.status === "passed" ? "success" : "warning"}>
                  {c.status}
                </Pill>
                {c.duration !== undefined && (
                  <span className="mono">{c.duration}s</span>
                )}
              </div>
              {(c.source_changed || c.snapshot_outdated) && (
                <div className="message">
                  Source differs from this investigation or changed during
                  execution. This result does not verify its original snapshot.
                </div>
              )}
              <pre>{c.output || "Waiting for output…"}</pre>
              <p>
                {c.scope ||
                  "Only this configured check is run; it does not certify the whole app."}
              </p>
            </div>
          ))}
        </>
      )}
      <ErrorMessage
        error={
          save.error ||
          refresh.error ||
          run.error ||
          trust.error ||
          profiles.error ||
          checks.error ||
          comparison.error
        }
      />
    </section>
  );
}

function Workbench() {
  const { projectId, investigationId } = useParams(),
    repo = repoFor(projectId),
    cache = useQueryClient();
  const query = useQuery({
    queryKey: ["investigation", investigationId],
    queryFn: () => repo.investigation(investigationId!),
  });
  const features = useQuery({
    queryKey: ["features", projectId],
    queryFn: () => repo.features(projectId!),
  });
  const settings = useQuery({
    queryKey: ["settings", repo.demo],
    queryFn: repo.settings,
  });
  const discoveries = useQuery({
    queryKey: ["discoveries", investigationId],
    queryFn: () => repo.discoveries(investigationId!),
    enabled: !!investigationId,
  });
  const [tab, setTab] = useState<"explore" | "experiment" | "notebook">(() => {
      const saved = sessionStorage.getItem("ravel-tab-" + investigationId);
      return saved === "experiment" || saved === "notebook" ? saved : "explore";
    }),
    [path, setPath] = useState(""),
    [line, setLine] = useState<number | undefined>(),
    [question, setQuestion] = useState(""),
    [job, setJob] = useState(""),
    [note, setNote] = useState(""),
    [showEvidence, setShowEvidence] = useState(false),
    [expanded, setExpanded] = useState(false),
    [consent, setConsent] = useState(
      () => sessionStorage.getItem("ravel-ai-consent") === "yes",
    );
  const inv = query.data;
  useEffect(() => {
    if (inv && !path) {
      setPath(inv.selected_path || inv.paths[0]);
      setNote(inv.note);
    }
  }, [inv, path]);
  const source = useQuery({
    queryKey: ["source", inv?.snapshot_id, path],
    queryFn: () => repo.source(inv!.snapshot_id!, path),
    enabled: !!inv && !!path,
  });
  const snapshot = useQuery({
    queryKey: ["snapshot", inv?.snapshot_id],
    queryFn: () => repo.snapshot(inv!.snapshot_id!),
    enabled: !!inv,
  });
  const ask = useMutation({
    mutationFn: () => repo.ask(inv!.id, question, consent),
    onSuccess: (j) => {
      if (j.status === "completed")
        cache.invalidateQueries({
          queryKey: ["investigation", investigationId],
        });
      else setJob(j.id);
    },
  });
  const annotate = useMutation({
    mutationFn: () => repo.annotate(inv!.id, { note }),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: ["investigation", investigationId] }),
  });
  const selection = useMutation({
    mutationFn: (p: string) => repo.annotate(inv!.id, { selected_path: p }),
  });
  if (query.isLoading)
    return (
      <Shell demoMode={repo.demo}>
        <Loading />
      </Shell>
    );
  if (!inv)
    return (
      <Shell>
        <ErrorMessage error={query.error} />
        <Link to={`/projects/${projectId}`}>Back to project</Link>
      </Shell>
    );
  const feature = features.data?.find((f) => f.id === inv.feature_id),
    selectedIndex = inv.paths.indexOf(path),
    steps =
      feature?.steps ||
      inv.paths.map((p) => ({
        path: p,
        label: p.split("/").at(-1)!,
        description:
          "Inspect this source file and follow its direct relationships.",
      }));
  const showSource = (p: string, n?: number) => {
    setPath(p);
    setLine(n);
    setShowEvidence(true);
    if (inv.paths.includes(p)) selection.mutate(p);
  };
  const sourceSymbols =
    snapshot.data?.analysis?.symbols
      .filter((s) => s.path === path)
      .slice(0, 6) || [];
  const sourceEdges =
    snapshot.data?.analysis?.edges.filter((e) => e.from === path) || [];
  return (
    <Shell demoMode={repo.demo}>
      <p className="message">Saved exploration workspace: this historical view preserves your original source and notes. <Link to={`/projects/${projectId}/explore`}>Open the current feature map</Link>.</p>
      <div className="workbench-heading">
        <Link className="back-link" to={`/projects/${projectId}`}>
          <ArrowLeft size={14} />
          Back to project
        </Link>
        <div className="workbench-title">
          <div>
            <span className="section-label">
              EXPLORE A FEATURE /{" "}
              {feature?.category.toUpperCase() || "SOURCE EXPLORATION"}
            </span>
            <h1>{inv.title}</h1>
          </div>
          <span className="snapshot-label mono">
            <Layers size={13} />
            {repo.demo ? "PREPARED EXAMPLE" : inv.snapshot_id!.slice(0, 8)}
          </span>
        </div>
      </div>
      <section
        className="first-exploration"
        aria-label="Your first exploration"
      >
        <div>
          <span className="section-label">
            {discoveries.data?.length
              ? "DISCOVERY SAVED"
              : "YOUR FIRST EXPLORATION"}
          </span>
          <p>
            {discoveries.data?.length
              ? "You’ve kept an idea with its source. Return whenever you want to explore further."
              : "Follow a source step, ask a question if you want, then keep an idea in your own words."}
          </p>
        </div>
        <div>
          <button
            className="button secondary small"
            onClick={() => {
              setTab("explore");
              sessionStorage.setItem("ravel-tab-" + investigationId, "explore");
              setShowEvidence(true);
            }}
          >
            See the source <Code2 size={15} />
          </button>
          <button
            className="button secondary small"
            onClick={() => {
              setTab("notebook");
              sessionStorage.setItem(
                "ravel-tab-" + investigationId,
                "notebook",
              );
            }}
          >
            {discoveries.data?.length
              ? "Revisit your discovery"
              : "Save what clicked"}
            <BookOpen size={15} />
          </button>
        </div>
      </section>
      {inv.outdated && (
        <div className="message warning-message">
          <AlertCircle size={17} />
          Related source has changed. This investigation still shows its
          original snapshot. Open a new starting point to explore the latest
          version.
        </div>
      )}
      <div className="workbench-tabs">
        <div role="tablist" aria-label="Investigation views">
          {[
            { id: "explore", icon: GitBranch, label: "Explore" },
            { id: "experiment", icon: FlaskConical, label: "Compare & check" },
            { id: "notebook", icon: BookOpen, label: "Your notebook" },
          ].map((t) => (
            <button
              role="tab"
              tabIndex={tab === t.id ? 0 : -1}
              onKeyDown={(e) => {
                const ids = ["explore", "experiment", "notebook"] as const;
                const index = ids.indexOf(tab);
                const next =
                  e.key === "ArrowRight"
                    ? ids[(index + 1) % 3]
                    : e.key === "ArrowLeft"
                      ? ids[(index + 2) % 3]
                      : e.key === "Home"
                        ? ids[0]
                        : e.key === "End"
                          ? ids[2]
                          : undefined;
                if (next) {
                  e.preventDefault();
                  setTab(next);
                  sessionStorage.setItem("ravel-tab-" + investigationId, next);
                  document.getElementById("tab-" + next)?.focus();
                }
              }}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              className={cls(tab === t.id && "active")}
              key={t.id}
              onClick={() => {
                setTab(t.id as typeof tab);
                sessionStorage.setItem("ravel-tab-" + investigationId, t.id);
              }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
        <span className="tabs-note">
          <GuideLink
            to={
              tab === "experiment"
                ? "checks"
                : tab === "notebook"
                  ? "notebook"
                  : "exploring"
            }
          >
            How this works
          </GuideLink>
        </span>
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "explore" ? (
          <div className="workbench-grid">
            <div className="exploration">
              <div className="flow-heading">
                <span className="mono">THE IMPLEMENTATION PATH</span>
                <Pill>
                  {repo.demo ? "Prepared walkthrough" : "Static relationships"}
                </Pill>
              </div>
              <div className="feature-flow">
                {steps
                  .slice(0, expanded ? steps.length : 7)
                  .map((step, index) => (
                    <button
                      key={step.path}
                      className={cls(
                        "flow-step",
                        path === step.path && "selected",
                      )}
                      onClick={() => showSource(step.path)}
                      aria-pressed={path === step.path}
                    >
                      <span className="flow-node mono">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>{step.label}</strong>
                        <small>{step.path}</small>
                      </span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
              </div>
              {steps.length > 7 && (
                <button
                  className="button text-button small"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show less" : "Follow more connections"}
                  <ChevronDown size={14} />
                </button>
              )}
              <div className="selected-story">
                <span className="section-label">
                  {String(Math.max(selectedIndex, 0) + 1).padStart(2, "0")} / A
                  CLOSER LOOK
                </span>
                <h2>
                  {steps.find((s) => s.path === path)?.label ||
                    "Supporting source"}
                </h2>
                <p>
                  {steps.find((s) => s.path === path)?.description ||
                    "This excerpt supports a claim in the explanation."}
                </p>
                {!repo.demo && sourceSymbols.length > 0 && (
                  <div className="symbol-summary">
                    <span>Defined here</span>
                    {sourceSymbols.map((s) => (
                      <button
                        key={s.name + s.line}
                        onClick={() => showSource(path, s.line)}
                      >
                        <code>{s.name}</code>
                        <span>:{s.line}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!repo.demo && sourceEdges.length > 0 && (
                  <p className="subtle">
                    Direct imports connect this file to {sourceEdges.length}{" "}
                    other indexed {sourceEdges.length === 1 ? "file" : "files"}.
                    Runtime behavior has not been observed.
                  </p>
                )}
                <button
                  className="mobile-evidence-button button secondary small"
                  onClick={() => setShowEvidence(!showEvidence)}
                >
                  <Code2 size={15} />
                  {showEvidence ? "Hide evidence" : "Show evidence"}
                </button>
              </div>
              {inv.answers.length > 0 && (
                <Explanation
                  answer={inv.answers.at(-1)!}
                  onSource={showSource}
                />
              )}
              <section className="curiosity">
                <div className="curiosity-heading">
                  <Sparkles size={17} />
                  <h3>Questions to explore</h3>
                </div>
                <div className="question-list">
                  {(inv.answers.at(-1)?.questions || inv.questions).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuestion(q);
                        document.getElementById("curiosity-question")?.focus();
                      }}
                    >
                      <span>{q}</span>
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask.mutate();
                  }}
                >
                  <label htmlFor="curiosity-question">
                    Ask about this feature
                  </label>
                  <div className="question-input">
                    <input
                      id="curiosity-question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="What happens if…?"
                      minLength={3}
                      required
                    />
                    <button
                      className="icon-button"
                      type="submit"
                      aria-label={
                        repo.demo
                          ? "Open prepared explanation"
                          : "Ask about this source"
                      }
                      disabled={ask.isPending || (!!job && !repo.demo)}
                    >
                      {ask.isPending ? (
                        <Loader2 size={17} className="spin" />
                      ) : (
                        <ArrowRight size={18} />
                      )}
                    </button>
                  </div>
                  {repo.demo ? (
                    <p className="form-help">
                      Demo questions open a prepared explanation about this
                      feature, not a live AI answer.
                    </p>
                  ) : (
                    <>
                      <label className="consent">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => {
                            setConsent(e.target.checked);
                            sessionStorage.setItem(
                              "ravel-ai-consent",
                              e.target.checked ? "yes" : "no",
                            );
                          }}
                        />
                        <span>
                          Allow selected source excerpts to be sent to my AI
                          provider.
                        </span>
                      </label>
                      {!settings.data?.ai_connected && (
                        <p className="form-help">
                          Live explanations need your own API key.{" "}
                          <Link to="/settings">See setup</Link>. Reading code
                          and saving notes still work.
                        </p>
                      )}
                    </>
                  )}
                  <ErrorMessage error={ask.error} />
                </form>
                {job && (
                  <JobProgress
                    id={job}
                    repo={repo}
                    onDone={() => {
                      cache.invalidateQueries({
                        queryKey: ["investigation", investigationId],
                      });
                      setJob("");
                    }}
                  />
                )}
              </section>
              <div className="quick-note">
                <label htmlFor="quick-note">Your notes</label>
                <textarea
                  id="quick-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Something clicked. Or something is still a mystery…"
                  rows={3}
                />
                <div>
                  <span className="form-help">
                    Saved with this investigation.
                  </span>
                  <button
                    className="button secondary small"
                    onClick={() => annotate.mutate()}
                    disabled={annotate.isPending}
                  >
                    {annotate.isSuccess ? (
                      <Check size={14} />
                    ) : (
                      <Bookmark size={14} />
                    )}
                    {annotate.isSuccess ? "Saved" : "Save note"}
                  </button>
                </div>
                <ErrorMessage error={annotate.error} />
              </div>
            </div>
            <aside
              className={cls("evidence-panel", showEvidence && "show-mobile")}
            >
              <div className="evidence-top">
                <span className="mono">THE SOURCE, BESIDE THE IDEA</span>
                <span className="evidence-dot" />
              </div>
              {source.isLoading ? (
                <Loading text="Opening source…" />
              ) : source.data ? (
                <Code
                  file={source.data}
                  highlight={
                    line ||
                    (selectedIndex === 0 ? feature?.entry_line : undefined)
                  }
                />
              ) : (
                <ErrorMessage error={source.error} />
              )}
              <div className="evidence-info">
                <div>
                  <Layers size={15} />
                  <span>Immutable source snapshot</span>
                </div>
                <p>
                  {repo.demo
                    ? "Prepared code for exploring this example. It is not connected to a running application."
                    : "This is the captured source, not a live editor. Refresh your project after making a change."}
                </p>
                <div className="evidence-separator" />
                <span className="mono">A SMALL INVITATION</span>
                <p>
                  Before opening the next step, predict what it needs from this
                  one.
                </p>
                <button
                  className="button secondary small"
                  onClick={() => setTab("experiment")}
                >
                  <FlaskConical size={14} />
                  Try a little experiment
                </button>
              </div>
            </aside>
          </div>
        ) : tab === "experiment" ? (
          <Experiment key={inv.id} repo={repo} inv={inv} />
        ) : (
          <Notebook repo={repo} inv={inv} />
        )}
      </div>
    </Shell>
  );
}

export default Workbench;
