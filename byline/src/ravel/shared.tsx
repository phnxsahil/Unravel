import { useMutation, useQuery } from "@tanstack/react-query";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FileCode2,
  Folder,
  GitBranch,
  Loader2,
  Moon,
  Settings as SettingsIcon,
  Square,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import type { Repository, SourceFile } from "./types";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("json", json);
const cls = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={cls("ravel-mark", small && "small")}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M9 9v15c0 6 4 9 9 9s9-3 9-9V9h-9v12c0 2 1 3 3 3h12" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link className="wordmark" to="/" aria-label="Unravel home">
      <Mark />
      unravel
    </Link>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setDark(localStorage.getItem("ravel-theme-paper-v1") !== "light"); } catch { /* Storage may be disabled. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try { localStorage.setItem("ravel-theme-paper-v1", dark ? "dark" : "light"); } catch { /* The toggle still works without persistence. */ }
  }, [dark, ready]);
  return (
    <button
      className="icon-button"
      disabled={!ready}
      aria-label={dark ? "Use light theme" : "Use dark theme"}
      onClick={() => setDark(!dark)}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function ErrorMessage({ error }: { error: unknown }) {
  return error ? (
    <div className="message error" role="alert">
      <AlertCircle size={17} />
      <span>
        {error instanceof Error
          ? error.message
          : "Something went wrong. Try again."}
      </span>
    </div>
  ) : null;
}

export function Loading({
  text = "Opening your exploration…",
}: {
  text?: string;
}) {
  return (
    <div className="loading" role="status">
      <Loader2 size={20} className="spin" />
      {text}
    </div>
  );
}

export function Pill({
  children,
  tone = "",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={cls("pill", tone)}>{children}</span>;
}

export function Code({
  file,
  highlight,
}: {
  file: SourceFile;
  highlight?: number;
}) {
  const language = file.language === "tsx" ? "typescript" : file.language;
  const reader = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const pre = reader.current;
    const selected = highlight
      ? pre?.querySelectorAll<HTMLElement>(".code-line")[highlight - 1]
      : undefined;
    if (pre && selected)
      pre.scrollTop +=
        selected.getBoundingClientRect().top -
        pre.getBoundingClientRect().top -
        80;
  }, [file.path, highlight]);
  const lines = file.body.split("\n");
  return (
    <div className="code-reader">
      <div className="code-header">
        <FileCode2 size={15} />
        <span>{file.path}</span>
        <span className="code-language">{file.language}</span>
      </div>
      <pre ref={reader} aria-label={`Source code in ${file.path}`} tabIndex={0}>
        <code>
          {lines.map((line, index) => (
            <span
              className={cls(
                "code-line",
                highlight === index + 1 && "highlighted",
              )}
              key={index}
            >
              <span className="line-number" aria-hidden="true">
                {index + 1}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: hljs.getLanguage(language)
                    ? hljs.highlight(line || " ", {
                        language,
                        ignoreIllegals: true,
                      }).value
                    : line
                        .replaceAll("&", "&amp;")
                        .replaceAll("<", "&lt;")
                        .replaceAll(">", "&gt;"),
                }}
              />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function Shell({
  children,
  demoMode = false,
  crumb,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
  crumb?: string;
}) {
  const location = useLocation();
  return (
    <div className="workshop-shell">
      <aside className="app-rail">
        <Wordmark />
        <div className="rail-label mono">YOUR WORKSHOP</div>
        <nav aria-label="Workshop navigation">
          <NavLink to="/projects" end aria-label="Projects">
            <Folder size={17} />
            <span>Projects</span>
          </NavLink>
          <NavLink to="/projects/demo" aria-label="Explore the demo">
            <GitBranch size={17} />
            <span>Explore the demo</span>
          </NavLink>
          <NavLink to="/docs" aria-label="Documentation">
            <BookOpen size={17} />
            <span>Documentation</span>
          </NavLink>
          <NavLink to="/settings" aria-label="Settings">
            <SettingsIcon size={17} />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="rail-bottom">
          <span className="rail-thread">
            <Mark small />
          </span>
          <p>
            Source, explanations,
            <br />
            and your discoveries.
          </p>
          <Link to="/docs/exploring">
            How to explore <ArrowUpRight size={13} />
          </Link>
        </div>
      </aside>
      <div className="shell-main">
        <header className="app-topbar">
          <div className="breadcrumb">
            <Link to="/projects">Workshop</Link>
            <ChevronRight size={14} />
            <span>
              {crumb
                ? crumb
                : location.pathname.includes("explore")
                ? "Feature exploration"
                : location.pathname === "/settings"
                  ? "Settings"
                  : location.pathname === "/projects"
                    ? "Projects"
                    : "Project overview"}
            </span>
          </div>
          <div>
            {demoMode && <Pill>Prepared demo</Pill>}
            <ThemeToggle />
          </div>
        </header>
        <main id="main-content" className="app-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function JobProgress({
  id,
  repo,
  onDone,
}: {
  id: string;
  repo: Repository;
  onDone: () => void;
}) {
  const done = useRef(false);
  const query = useQuery({
    queryKey: ["job", id],
    queryFn: () => repo.job(id),
    refetchInterval: (q) =>
      ["completed", "failed", "cancelled", "interrupted"].includes(
        q.state.data?.status || "",
      )
        ? false
        : 500,
  });
  const [eventText, setEventText] = useState("");
  useEffect(() => {
    if (repo.demo) return;
    const stream = new EventSource(`/api/jobs/${id}/events`);
    stream.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "progress") setEventText(data.message);
      if (
        ["completed", "failed", "cancelled", "interrupted"].includes(
          data.status,
        )
      )
        stream.close();
    };
    return () => stream.close();
  }, [id, repo]);
  useEffect(() => {
    if (
      query.data &&
      ["completed", "failed", "cancelled", "interrupted"].includes(
        query.data.status,
      ) &&
      !done.current
    ) {
      done.current = true;
      onDone();
    }
  }, [query.data, onDone]);
  const cancel = useMutation({
    mutationFn: () => repo.cancel(id),
    onSuccess: () => query.refetch(),
  });
  return (
    <div
      className={cls(
        "job-progress",
        query.data?.status === "failed" && "is-error",
      )}
      role="status"
    >
      <Loader2
        size={17}
        className={
          ["queued", "running"].includes(query.data?.status || "queued")
            ? "spin"
            : ""
        }
      />
      <span>
        {query.data && !["queued", "running"].includes(query.data.status)
          ? query.data.message
          : eventText || query.data?.message || "Starting…"}
      </span>
      {["queued", "running"].includes(query.data?.status || "queued") && (
        <button
          className="icon-button"
          aria-label="Cancel operation"
          onClick={() => cancel.mutate()}
        >
          <Square size={13} />
        </button>
      )}
      <ErrorMessage error={query.error || cancel.error} />
    </div>
  );
}

export { cls };
