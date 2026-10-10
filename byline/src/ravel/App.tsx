import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Code2,
  FileCode2,
  Folder,
  GitBranch,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { demoFeatures } from "./fixtures";
import "./ravel.css";
import "./unravel.css";
import "./grid-design.css";
import { demoProject, local, repoFor } from "./repository";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 5000 } },
});

import Landing from "./Landing";
import { GuideLink } from "./SiteChrome";
import {
  ErrorMessage,
  JobProgress,
  Loading,
  Mark,
  Pill,
  Shell,
} from "./shared";
const Docs = lazy(() => import("./Docs"));
const Studio = lazy(() => import("./Studio"));
const Workbench = lazy(() => import("./Workbench"));
function Library() {
  const cache = useQueryClient(),
    navigate = useNavigate();
  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: local.projects,
  });
  const [connecting, setConnecting] = useState(false),
    [path, setPath] = useState(""),
    [job, setJob] = useState("");
  const add = useMutation({
    mutationFn: () => local.register(path.trim()),
    onSuccess: (p) => {
      setConnecting(false);
      setJob(p.job_id || "");
      cache.invalidateQueries({ queryKey: ["projects"] });
    },
  });
  return (
    <Shell>
      <div className="page-heading">
        <div>
          <div className="section-label">A PLACE TO FOLLOW YOUR CURIOSITY</div>
          <h1>Your projects</h1>
          <p>Open a saved project or connect a folder from your computer.</p>
        </div>
        <button
          className="button primary"
          onClick={() => setConnecting(!connecting)}
        >
          <Plus size={17} />
          Connect a project
        </button>
      </div>
      {connecting && (
        <section className="connect-panel">
          <div>
            <h2>Connect a project folder</h2>
            <p>
              Use the full path to a folder on this computer. Reading source
              doesn’t execute it.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <label htmlFor="project-path">Project folder</label>
            <div className="input-row">
              <input
                id="project-path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="D:\Projects\my-project"
                required
                autoFocus
              />
              <button className="button primary" disabled={add.isPending}>
                {add.isPending ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                Explore
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Close project connection"
                onClick={() => setConnecting(false)}
              >
                <X size={17} />
              </button>
            </div>
            <details className="folder-path-help">
              <summary>How do I copy my folder path?</summary>
              <p>
                <strong>Windows:</strong> In File Explorer, open your project,
                click the address bar and copy the full path.
              </p>
              <p>
                <strong>macOS:</strong> In Finder, select the folder, hold
                Option and choose Edit → Copy as Pathname.
              </p>
              <p>
                <strong>Linux:</strong> Open the folder in your file manager and
                copy its location, or run <code>pwd</code> in that folder.
              </p>
              <p>
                Paste a path such as <code>D:\Projects\my-project</code> or{" "}
                <code>/home/you/projects/my-project</code>. Unravel reads this
                folder on the computer running the app.
              </p>
            </details>
            <ErrorMessage error={add.error} />
            {add.isError &&
              projects.data?.some(
                (p) => p.root.toLowerCase() === path.trim().toLowerCase(),
              ) && (
                <Link
                  className="guide-link"
                  to={
                    "/projects/" +
                    projects.data.find(
                      (p) => p.root.toLowerCase() === path.trim().toLowerCase(),
                    )!.id
                  }
                >
                  Open the connected project <ArrowRight size={15} />
                </Link>
              )}
          </form>
        </section>
      )}
      {job && (
        <JobProgress
          id={job}
          repo={local}
          onDone={() => {
            cache.invalidateQueries({ queryKey: ["projects"] });
          }}
        />
      )}
      <div className="list-heading">
        <h2>Connected projects</h2>
        <span className="mono">{projects.data?.length || 0} CONNECTED</span>
      </div>
      {projects.isLoading && <Loading text="Checking your local workshop…" />}
      {projects.error && (
        <div className="offline-panel">
          <AlertCircle size={20} />
          <div>
            <h3>Your local workshop isn’t running yet.</h3>
            <p>
              Start <code>ravel</code> on your computer, then refresh. You can
              explore the demo right now.
            </p>
            <button
              className="button secondary small"
              onClick={() => projects.refetch()}
            >
              Try again <RefreshCw size={14} />
            </button>
          </div>
        </div>
      )}
      {!projects.isLoading &&
        !projects.error &&
        projects.data?.length === 0 && (
          <section className="first-project-welcome">
            <span className="section-label">YOUR FIRST PROJECT</span>
            <h2>Let’s understand one feature.</h2>
            <p>
              Connect a local folder, choose a starting point and follow its
              source. Try a controlled scenario when you want to check your
              understanding.
            </p>
            <ol>
              <li>
                <span>01</span>Connect a project
              </li>
              <li>
                <span>02</span>Follow one feature
              </li>
              <li>
                <span>03</span>Understand the result
              </li>
            </ol>
            <p className="form-help">
              Start with React, JavaScript, TypeScript, Python or FastAPI. You
              can read source and take notes without an AI key.
            </p>
            <GuideLink to="quick-start">How the local app works</GuideLink>
          </section>
        )}
      <div className="project-list">
        {projects.data?.map((p) => (
          <button
            className="project-row"
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}`)}
          >
            <span className="project-icon">
              <Folder size={23} />
            </span>
            <span className="project-copy">
              <strong>{p.name}</strong>
              <span>{p.root}</span>
            </span>
            <span className="project-meta">
              {p.status === "ready"
                ? `${p.feature_count} starting points`
                : p.status === "failed"
                  ? "Capture failed — open to retry"
                  : "Capturing source…"}
            </span>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
      <Link className="demo-invitation" to="/projects/demo">
        <div className="demo-thread-art">
          <Mark />
        </div>
        <div>
          <span className="section-label">START HERE, IF YOU LIKE</span>
          <h2>Explore the sample project</h2>
          <p>
            Search fails despite a 200 OK response. Follow its source and
            inspect the changed response contract.
          </p>
          <span className="inline-link">
            Open the demo <ArrowRight size={16} />
          </span>
        </div>
        <span className="demo-stamp mono">
          NO KEY
          <br />
          NO SETUP
        </span>
      </Link>
      <div className="library-footnote">
        <Code2 size={16} />
        Your folders stay on this computer. Only selected excerpts go to your AI
        provider when you ask.
      </div>
    </Shell>
  );
}

function Overview() {
  const { projectId } = useParams(),
    repo = repoFor(projectId),
    navigate = useNavigate(),
    cache = useQueryClient();
  const project = useQuery({
    queryKey: ["project", projectId],
    initialData: repo.demo ? demoProject : undefined,
    queryFn: () => repo.project(projectId!),
    refetchInterval: (q) => (q.state.data?.status === "indexing" ? 500 : false),
  });
  const features = useQuery({
    queryKey: ["features", projectId, project.data?.latest_snapshot_id],
    initialData: repo.demo ? demoFeatures : undefined,
    queryFn: () => repo.features(projectId!),
    enabled:
      !!project.data?.latest_snapshot_id && project.data?.status !== "indexing",
  });
  const previous = useQuery({
    queryKey: ["investigations", projectId],
    queryFn: () => repo.investigations(projectId!),
  });
  const snapshots = useQuery({
    queryKey: ["snapshots", projectId, project.data?.latest_snapshot_id],
    queryFn: () => repo.snapshots(projectId!),
    enabled: project.data?.status === "ready",
  });
  const [job, setJob] = useState(""),
    [filter, setFilter] = useState("");
  const start = useMutation({
    mutationFn: (f: string) => repo.start(f),
    onSuccess: (i) => navigate(`/projects/${projectId}/explore/${i.id}`),
  });
  const refresh = useMutation({
    mutationFn: () => repo.refresh(projectId!),
    onSuccess: (j) => setJob(j.id),
  });
  const remove = useMutation({
    mutationFn: () => repo.remove(projectId!),
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
  });
  if (project.isLoading)
    return (
      <Shell demoMode={repo.demo}>
        <Loading />
      </Shell>
    );
  if (!project.data)
    return (
      <Shell>
        <ErrorMessage error={project.error} />
        <Link to="/projects">Back to projects</Link>
      </Shell>
    );
  const p = project.data,
    latest = snapshots.data?.[0];
  const recommended = [...(features.data || [])]
    .filter((f) => f.paths.length > 0 && f.category !== "Source exploration")
    .sort(
      (a, b) =>
        a.paths.length - b.paths.length || a.title.localeCompare(b.title),
    )[0];
  const fallbackOnly =
    !!features.data?.length &&
    features.data.every((f) => f.category === "Source exploration");
  const items =
    features.data?.filter((f) =>
      (f.title + f.category).toLowerCase().includes(filter.toLowerCase()),
    ) || [];
  return (
    <Shell demoMode={repo.demo}>
      <div className="project-heading">
        <Link className="back-link" to="/projects">
          <ArrowLeft size={14} />
          Your projects
        </Link>
        <div className="page-heading compact">
          <div>
            <div className="section-label">
              {repo.demo
                ? "A PREPARED PROJECT TO GET YOU STARTED"
                : "YOUR SOURCE. YOUR STARTING POINTS."}
            </div>
            <h1>{p.name}</h1>
            <p>
              {repo.demo
                ? "A prepared writing app. Choose a feature and inspect the code behind it."
                : p.root}
            </p>
          </div>
          {!repo.demo && (
            <button
              className="button secondary"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
            >
              <RefreshCw size={16} />
              Refresh source
            </button>
          )}
        </div>
        <div className="project-strip">
          <span>
            <FileCode2 size={14} />
            {p.file_count} readable files
          </span>
          <span>
            <GitBranch size={14} />
            {p.feature_count} features
          </span>
          <span>
            <Layers size={14} />
            {repo.demo
              ? "Prepared snapshot"
              : latest?.commit
                ? latest.commit.slice(0, 7) +
                  (latest.dirty ? " + local edits" : "")
                : "Content snapshot"}
          </span>
        </div>
      </div>
      {repo.demo && (
        <div className="message demo-message">
          <Sparkles size={16} />
          This is prepared source and explanation material. Explore freely; your
          notes stay in this browser.
        </div>
      )}
      <p className="message">Original exploration workspace. Your historical notes and links remain available here. <Link to={`/projects/${projectId}/overview`}>Open the current project overview</Link>.</p>
      {job && (
        <JobProgress
          id={job}
          repo={repo}
          onDone={() => {
            cache.invalidateQueries();
          }}
        />
      )}
      <ErrorMessage
        error={
          features.error ||
          start.error ||
          refresh.error ||
          remove.error ||
          (p.last_error ? new Error(p.last_error) : null)
        }
      />
      {!!previous.data?.length && (
        <section className="resume-section">
          <div className="list-heading">
            <h2>Continue an investigation</h2>
            <span className="mono">RECENT EXPLORATIONS</span>
          </div>
          <div className="resume-list">
            {previous.data.slice(0, 3).map((i) => (
              <Link key={i.id} to={`/projects/${projectId}/explore/${i.id}`}>
                <BookOpen size={17} />
                <span>{i.title}</span>
                {i.outdated && <Pill tone="warning">Source changed</Pill>}
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      )}
      {!previous.data?.length && recommended && p.status === "ready" && (
        <section className="recommended-feature">
          <div>
            <span className="section-label">A GOOD PLACE TO BEGIN</span>
            <h2>{recommended.title}</h2>
            <p>{recommended.description}</p>
            <small>
              {recommended.paths.length} source{" "}
              {recommended.paths.length === 1 ? "file" : "files"} · Start with a
              short path, then explore further.
            </small>
            {recommended.questions[0] && (
              <p className="recommended-question">
                Try asking: “{recommended.questions[0]}”
              </p>
            )}
          </div>
          <button
            className="button primary"
            disabled={start.isPending}
            onClick={() => start.mutate(recommended.id)}
          >
            Start recommended feature <ArrowRight size={17} />
          </button>
        </section>
      )}
      {p.status === "ready" && fallbackOnly && (
        <div className="empty-state source-limit">
          <GitBranch size={28} />
          <h3>No supported feature was detected.</h3>
          <p>
            This capture did not reveal a React component or Python/FastAPI
            route. You can still inspect captured files below. Check the folder
            and exclusions, connect a smaller supported project, or try the
            demo.
          </p>
          <GuideLink to="exploring">
            Understand supported starting points
          </GuideLink>
        </div>
      )}
      <div className="list-heading feature-list-heading">
        <div>
          <h2>
            {fallbackOnly ? "Explore captured files" : "Choose a feature"}
          </h2>
          <p>
            Open a feature to see its files, follow the connections, and ask a
            question.
          </p>
        </div>
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label="Find a feature"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search features…"
          />
        </label>
      </div>
      {features.isLoading || p.status === "indexing" ? (
        <Loading text="Finding supported features…" />
      ) : (
        <div className="feature-list">
          {items.map((f, index) => (
            <button
              key={f.id}
              className="feature-row"
              disabled={start.isPending}
              onClick={() => start.mutate(f.id)}
            >
              <span className="feature-index mono">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="feature-copy">
                <span className="feature-category">{f.category}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                <div className="feature-paths mono">
                  {f.paths.length}{" "}
                  {f.paths.length === 1 ? "source file" : "connected files"}
                  <span>·</span>
                  {repo.demo
                    ? "Prepared walkthrough"
                    : "Static source analysis"}
                </div>
              </div>
              <span className="explore-circle">
                <ArrowUpRight size={20} />
              </span>
            </button>
          ))}
        </div>
      )}
      {!features.isLoading && p.status !== "indexing" && !items.length && (
        <div className="empty-state">
          <GitBranch size={28} />
          <h3>
            {filter
              ? "No feature matches that search."
              : "No supported features found."}
          </h3>
          <p>
            {filter
              ? "Try a component or route name."
              : "This capture did not reveal a supported React component or Python/FastAPI route. Check the folder and exclusions, try a smaller supported project, or explore the demo."}
          </p>
          {!filter && (
            <GuideLink to="exploring">
              Understand supported starting points
            </GuideLink>
          )}
        </div>
      )}
      {latest && !repo.demo && (
        <details className="exclusion-details">
          <summary>
            What was included in this snapshot?
            <ChevronDown size={16} />
          </summary>
          <p>
            Ignored, private, generated, unsupported and oversized files are
            excluded.
          </p>
          {latest.excluded?.length ? (
            <ul>
              {latest.excluded.slice(0, 40).map((e) => (
                <li key={e.path}>
                  <code>{e.path}</code> — {e.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p>No additional exclusions were recorded.</p>
          )}
        </details>
      )}
      {!repo.demo && (
        <button
          className="quiet-danger"
          onClick={() => {
            if (
              window.confirm(
                "Disconnect this project and remove its Unravel notebook? Your source folder will stay untouched.",
              )
            )
              remove.mutate();
          }}
        >
          Disconnect project
        </button>
      )}
    </Shell>
  );
}

function Settings() {
  const settings = useQuery({
    queryKey: ["settings", false],
    queryFn: local.settings,
  });
  return (
    <Shell>
      <div className="page-heading">
        <div>
          <span className="section-label">CONFIGURATION</span>
          <h1>Workshop settings.</h1>
          <p>
            Configure AI, review source storage, and understand local checks.
          </p>
        </div>
      </div>
      <ErrorMessage error={settings.error} />
      <div className="settings-layout">
        <section>
          <h2>AI explanations</h2>
          <Pill tone={settings.data?.ai_connected ? "success" : ""}>
            {settings.data?.ai_connected ? "Connected" : "Not connected"}
          </Pill>
          <p>
            Unravel reads source locally. When you ask for an AI explanation,
            selected excerpts are sent to Anthropic after your consent.
          </p>
          <p>
            Set your key in the environment or your untracked <code>.env</code>{" "}
            file, then restart:
          </p>
          <pre>
            ANTHROPIC_API_KEY=your-own-key{"\n"}RAVEL_MODEL=claude-sonnet-4-6
          </pre>
          <p className="form-help">
            The key is never sent to your browser or included in discoveries.
            Reading, notes, snapshots, and local checks work without it.
          </p>
          <GuideLink to="explanations">
            Configure and understand AI questions
          </GuideLink>
        </section>
        <section>
          <h2>Local storage</h2>
          <p>
            Your source snapshots and investigations are stored in SQLite on
            your computer.
          </p>
          <code className="storage-path">
            {settings.data?.storage ||
              "Available when the local workshop is running"}
          </code>
          <p>
            Disconnecting a project deletes its Unravel records and leaves its
            source folder untouched.
          </p>
          <GuideLink to="privacy">Storage and source privacy</GuideLink>
        </section>
        <section>
          <h2>Supported exploration</h2>
          <div className="supported-settings">
            {["React", "JavaScript", "TypeScript", "Python", "FastAPI"].map(
              (s) => (
                <Pill key={s}>{s}</Pill>
              ),
            )}
          </div>
          <p>
            Unravel follows supported static relationships. It labels
            uncertainty and does not promise a complete runtime architecture.
          </p>
          <GuideLink to="exploring">
            Supported source and analysis limits
          </GuideLink>
        </section>
        <section>
          <h2>Check execution</h2>
          <p>
            You choose existing npm scripts or pytest checks for a trusted local
            project. They execute on your machine and are not sandboxed.
          </p>
          <p>
            Passing a check verifies that check. It is not a certificate for
            your entire application.
          </p>
          <GuideLink to="checks">How local checks work</GuideLink>
        </section>
      </div>
    </Shell>
  );
}

function LocationMemory() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.includes("/explore/"))
      try {
        localStorage.setItem("ravel-last-exploration", location.pathname);
      } catch {
        /* Storage can be disabled. */
      }
    if (location.hash)
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return null;
}

function NotFound() {
  return (
    <Shell crumb="Not found">
      <div className="empty-state">
        <Mark />
        <h1>Page not found.</h1>
        <p>
          That page doesn’t exist. Return to your projects or open the
          documentation.
        </p>
        <Link className="button primary" to="/projects">
          Back to your projects <ArrowRight size={16} />
        </Link>
      </div>
    </Shell>
  );
}
export default function UnravelApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <a
          href="#main-content"
          className="skip-link"
          onClick={() => document.querySelector("main")?.focus()}
        >
          Skip to content
        </a>
        <LocationMemory />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/docs"
            element={
              <Suspense fallback={<Loading />}>
                <Docs />
              </Suspense>
            }
          />
          <Route
            path="/docs/:slug"
            element={
              <Suspense fallback={<Loading />}>
                <Docs />
              </Suspense>
            }
          />
          <Route path="/projects" element={<Library />} />
          <Route
            path="/projects/:projectId"
            element={
              <Suspense fallback={<Loading />}>
                <Studio />
              </Suspense>
            }
          />
          <Route path="/projects/:projectId/legacy" element={<Overview />} />
          <Route
            path="/projects/:projectId/:view"
            element={
              <Suspense fallback={<Loading />}>
                <Studio />
              </Suspense>
            }
          />
          <Route
            path="/projects/:projectId/explore/:investigationId"
            element={
              <Suspense fallback={<Loading />}>
                <Workbench />
              </Suspense>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
