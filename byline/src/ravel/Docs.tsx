import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";
import { Children, isValidElement, useEffect, useState, memo } from "react";
import Markdown from "react-markdown";
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from "react-router";
import remarkGfm from "remark-gfm";
import productTour from "../../../docs/ravel/guides/product-tour.md?raw";
import architecture from "../../../docs/ravel/guides/architecture.md?raw";
import checks from "../../../docs/ravel/guides/checks.md?raw";
import explanations from "../../../docs/ravel/guides/explanations.md?raw";
import exploring from "../../../docs/ravel/guides/exploring.md?raw";
import notebook from "../../../docs/ravel/guides/notebook.md?raw";
import privacy from "../../../docs/ravel/guides/privacy.md?raw";
import quickStart from "../../../docs/ravel/guides/quick-start.md?raw";
import snapshots from "../../../docs/ravel/guides/snapshots.md?raw";
import troubleshooting from "../../../docs/ravel/guides/troubleshooting.md?raw";
import { CopyCommand, SiteFooter, SiteHeader } from "./SiteChrome";
import "./docs.css";

import experiments from "../../../docs/ravel/guides/experiments.md?raw";
const guideCatalog = [
  {
    slug: "experiments",
    title: "Try a controlled experiment",
    category: "USE UNRAVEL",
    description: "Approve local browser actions and inspect recorded evidence.",
    body: experiments,
  },
  {
    slug: "product-tour",
    title: "A first look at Unravel",
    category: "GET STARTED",
    description:
      "Follow a familiar action, inspect evidence and try a controlled experiment.",
    body: productTour,
  },
  {
    slug: "quick-start",
    title: "Connect a project",
    category: "GET STARTED",
    description:
      "Try the demo, install Unravel and connect your first project.",
    body: quickStart,
  },
  {
    slug: "exploring",
    title: "Explore a feature",
    category: "USE UNRAVEL",
    description:
      "Find source, follow relationships, and inspect the implementation.",
    body: exploring,
  },
  {
    slug: "explanations",
    title: "Ask with source context",
    category: "USE UNRAVEL",
    description:
      "Configure AI, ask a question, and read the evidence behind an answer.",
    body: explanations,
  },
  {
    slug: "snapshots",
    title: "Compare changes",
    category: "USE UNRAVEL",
    description:
      "Understand captured versions, dirty files, commits, and worktrees.",
    body: snapshots,
  },
  {
    slug: "checks",
    title: "Run a local check",
    category: "USE UNRAVEL",
    description:
      "Choose a trusted command and understand what its result proves.",
    body: checks,
  },
  {
    slug: "notebook",
    title: "Save what you learned",
    category: "USE UNRAVEL",
    description: "Save, resume, and export your discoveries.",
    body: notebook,
  },
  {
    slug: "privacy",
    title: "Code and privacy",
    category: "REFERENCE",
    description:
      "Understand local storage, provider requests, exclusions, and trust.",
    body: privacy,
  },
  {
    slug: "architecture",
    title: "Under the hood",
    category: "REFERENCE",
    description:
      "Follow source capture, jobs, AI context, and command execution.",
    body: architecture,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    category: "REFERENCE",
    description: "Resolve setup, source, provider, and check failures.",
    body: troubleshooting,
  },
];
export const guides = [
  "product-tour",
  "quick-start",
  "exploring",
  "explanations",
  "experiments",
  "snapshots",
  "checks",
  "notebook",
  "privacy",
  "architecture",
  "troubleshooting",
].map((slug) => guideCatalog.find((guide) => guide.slug === slug)!);
const orderedGuides = guides;

function revealWithin(element: HTMLElement, container: HTMLElement) {
  if (
    !container.getClientRects().length ||
    container.scrollHeight <= container.clientHeight
  )
    return;
  const item = element.getBoundingClientRect();
  const rail = container.getBoundingClientRect();
  if (item.top < rail.top + 12) container.scrollTop += item.top - rail.top - 12;
  else if (item.bottom > rail.bottom - 40)
    container.scrollTop += item.bottom - rail.bottom + 40;
}
function anchor(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? textOf(child.props.children)
        : String(child),
    )
    .join("");
}
function Pre({ children }: { children?: ReactNode }) {
  const text = textOf(children).trimEnd();
  const code = Children.toArray(children).find((child) =>
    isValidElement(child),
  );
  const language = isValidElement<{ className?: string }>(code)
    ? code.props.className?.replace("language-", "")
    : undefined;
  return (
    <div className="docs-code">
      <div>
        <span>{language || "text"}</span>
        <CopyCommand text={text} label="Copy code example" />
      </div>
      <pre tabIndex={0} aria-label="Code example">
        {children}
      </pre>
    </div>
  );
}

const Prose = memo(function Prose({ body }: { body: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <h2 id={anchor(textOf(children))}>{children}</h2>,
        pre: Pre,
        blockquote: ({ children }) => (
          <aside className="docs-callout" role="note">
            {children}
          </aside>
        ),
        a: ({ href, children }) =>
          href?.startsWith("/") ? (
            <Link to={href}>{children}</Link>
          ) : (
            <a href={href}>{children}</a>
          ),
      }}
    >
      {body}
    </Markdown>
  );
});

function OsInstructions({ windows, unix }: { windows: string; unix: string }) {
  const [selected, setSelected] = useState("windows");
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("ravel-docs-os") === "unix") setSelected("unix");
    } catch {
      /* Both platforms remain usable without storage. */
    }
    setEnhanced(true);
  }, []);
  function select(value: string) {
    setSelected(value);
    try {
      localStorage.setItem("ravel-docs-os", value);
    } catch {
      /* Persistence is optional. */
    }
  }
  const options = [
    { id: "windows", label: "Windows PowerShell", body: windows },
    { id: "unix", label: "macOS / Linux", body: unix },
  ];
  return (
    <div
      className="os-instructions"
      data-enhanced={enhanced ? "true" : undefined}
    >
      <div
        className="os-tabs"
        role="tablist"
        aria-label="Installation platform"
      >
        {options.map((option, index) => (
          <button
            key={option.id}
            id={`os-tab-${option.id}`}
            role="tab"
            aria-selected={selected === option.id}
            aria-controls={`os-panel-${option.id}`}
            tabIndex={selected === option.id ? 0 : -1}
            onClick={() => select(option.id)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? options[0]
                    : event.key === "End"
                      ? options[1]
                      : options[1 - index];
                select(next.id);
                document.getElementById(`os-tab-${next.id}`)?.focus();
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {options.map((option) => (
        <section
          key={option.id}
          id={`os-panel-${option.id}`}
          role={enhanced ? "tabpanel" : undefined}
          aria-labelledby={enhanced ? `os-tab-${option.id}` : undefined}
          hidden={enhanced && selected !== option.id}
        >
          <Prose body={option.body} />
        </section>
      ))}
    </div>
  );
}

const GuideBody = memo(function GuideBody({
  body,
  setup,
}: {
  body: string;
  setup: boolean;
}) {
  const content = body.replace(/^# .+\r?\n/, "");
  if (!setup) return <Prose body={content} />;
  const windows = content.indexOf("### Windows PowerShell");
  const unix = content.indexOf("### macOS / Linux");
  const end = content.indexOf("The command opens the browser", unix);
  if (windows < 0 || unix < 0 || end < 0) return <Prose body={content} />;
  return (
    <>
      <Prose body={content.slice(0, windows)} />
      <OsInstructions
        windows={content.slice(windows, unix)}
        unix={content.slice(unix, end)}
      />
      <Prose body={content.slice(end)} />
    </>
  );
});

function NavigationDisclosure({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const media = matchMedia("(min-width: 1200px)");
    const update = () => setExpanded(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [pathname]);
  useEffect(() => {
    if (!expanded) return;
    let alive = true;
    const reveal = () => {
      if (!alive) return;
      const rail = document.querySelector<HTMLElement>(".docs-navigation");
      const current = rail?.querySelector<HTMLElement>(
        'a[aria-current="page"]',
      );
      if (rail && current) revealWithin(current, rail);
    };
    const frame = requestAnimationFrame(reveal);
    void document.fonts.ready.then(reveal);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [expanded, pathname]);
  return (
    <details
      className="docs-rail"
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>Documentation</summary>
      <div>{children}</div>
    </details>
  );
}

export default function Docs() {
  const { slug } = useParams(),
    navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeHeading, setActiveHeading] = useState("");
  const [progress, setProgress] = useState(0);
  const article = slug
    ? guides.find((guide) => guide.slug === slug)
    : undefined;
  const matches = guides.filter((guide) =>
    (guide.title + " " + guide.description + " " + guide.body)
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const headings = article
    ? [...article.body.matchAll(/^## (.+)$/gm)].map((match) => match[1])
    : [];
  const index = guides.findIndex((guide) => guide === article),
    next = guides[index + 1];
  useEffect(() => {
    document.title = article
      ? article.title + " — Unravel docs"
      : slug
        ? "Guide not found — Unravel"
        : "Documentation — Unravel";
    return () => {
      document.title = "Unravel — Understand the code you built";
    };
  }, [article, slug]);
  useEffect(() => {
    setActiveHeading("");
    setProgress(0);
    if (!article) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );
    document
      .querySelectorAll(".docs-prose h2")
      .forEach((element) => observer.observe(element));
    const read = () => {
      const element = document.querySelector(".docs-article");
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight + 100);
      setProgress(Math.min(1, Math.max(0, (100 - rect.top) / distance)));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", read);
    };
  }, [article]);
  useEffect(() => {
    if (!activeHeading) return;
    const toc = document.querySelector<HTMLElement>(".docs-contents");
    const item = toc?.querySelector<HTMLElement>('a[aria-current="location"]');
    if (toc && item) revealWithin(item, toc);
  }, [activeHeading]);
  return (
    <div className="docs-page">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className={"docs-shell " + (!slug ? "docs-overview-shell" : "")}
      >
        <aside className="docs-navigation">
          <NavigationDisclosure>
            <Link to="/docs" className="docs-brand">
              <BookOpen size={16} />
              Documentation
            </Link>
            <label className="docs-search">
              <Search size={15} />
              <input
                aria-label="Search documentation"
                placeholder="Find a guide…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <nav
              className={query.trim() ? "has-search" : ""}
              aria-label="Documentation topics"
            >
              <Link
                to="/docs"
                aria-current={!slug ? "page" : undefined}
                className={
                  !slug ? "is-current docs-overview-link" : "docs-overview-link"
                }
              >
                Overview
              </Link>
              {orderedGuides.reduce<ReactNode[]>((items, guide, index) => {
                if (!matches.includes(guide)) return items;
                if (
                  index === 0 ||
                  orderedGuides[index - 1]?.category !== guide.category
                )
                  items.push(
                    <span className="mono" key={guide.category}>
                      {guide.category}
                    </span>,
                  );
                items.push(
                  <NavLink
                    key={guide.slug}
                    className={article?.slug === guide.slug ? "is-current" : ""}
                    to={"/docs/" + guide.slug}
                  >
                    {guide.title}
                  </NavLink>,
                );
                return items;
              }, [])}
            </nav>
            {!matches.length && (
              <p className="docs-search-empty" role="status">
                No guides found. Try “source”, “AI” or “checks”.
              </p>
            )}
            <div className="docs-local-note">
              Working with your own code?
              <Link to="/projects">
                Open Unravel <ArrowRight size={13} />
              </Link>
            </div>
          </NavigationDisclosure>
        </aside>
        <div className="docs-mobile-picker">
          <label htmlFor="docs-topic">Documentation</label>
          <select
            id="docs-topic"
            value={article?.slug || ""}
            onChange={(event) => navigate("/docs/" + event.target.value)}
          >
            <option value="">Choose a guide</option>
            {orderedGuides.map((guide) => (
              <option key={guide.slug} value={guide.slug}>
                {guide.title}
              </option>
            ))}
          </select>
        </div>
        {!slug ? (
          <article className="docs-article docs-home">
            <h1>Build with understanding.</h1>
            <p className="docs-home-intro">
              Connect a project, follow its source and make your next change.
              Everything you need, one guide at a time.
            </p>
            <Link className="docs-start" to="/docs/quick-start">
              <span>
                <small>START HERE</small>
                <strong>Connect a project.</strong>
                <span>
                  Install Unravel, open a local folder and find your first
                  feature.
                </span>
              </span>
              <ArrowRight size={28} />
            </Link>
            <div className="docs-home-heading">
              <h2>Find your next step.</h2>
              <span>Guides for the next small step.</span>
            </div>
            <div className="docs-guide-list">
              {orderedGuides
                .filter((guide) => guide.slug !== "quick-start")
                .map((guide, index) => (
                  <Link key={guide.slug} to={"/docs/" + guide.slug}>
                    <span className="docs-guide-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{guide.title}</strong>
                      <small>{guide.description}</small>
                    </span>
                    <ArrowRight size={18} />
                  </Link>
                ))}
            </div>
          </article>
        ) : article ? (
          <article className="docs-article">
            <div className="docs-breadcrumb">
              <Link to="/docs">Documentation</Link>
              <span>/</span>
              {article.title}
            </div>
            <div className="docs-guide-meta">
              <span>{article.category.replaceAll("_", " ")}</span>
              <span>
                {Math.max(1, Math.ceil(article.body.split(/\s+/).length / 200))}{" "}
                min read
              </span>
            </div>
            <h1>{article.title}</h1>
            <p className="docs-description">{article.description}</p>
            <details className="docs-mobile-contents">
              <summary>In this guide</summary>
              <nav aria-label="Mobile table of contents">
                {headings.map((heading) => (
                  <a href={"#" + anchor(heading)} key={heading}>
                    {heading}
                  </a>
                ))}
              </nav>
            </details>
            <div className="docs-prose">
              <GuideBody
                body={article.body}
                setup={article.slug === "quick-start"}
              />
            </div>
            <div className="docs-next">
              {index > 0 && (
                <Link to={"/docs/" + guides[index - 1].slug}>
                  <ArrowLeft size={15} />
                  <span>
                    <small>Previous guide</small>
                    {guides[index - 1].title}
                  </span>
                </Link>
              )}
              {next && (
                <Link to={"/docs/" + next.slug}>
                  <span>
                    <small>Next guide</small>
                    {next.title}
                  </span>
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </article>
        ) : (
          <article className="docs-article">
            <h1>Guide not found.</h1>
            <p>
              The guide may have moved. Choose a topic from the documentation.
            </p>
            <Link className="guide-link" to="/docs">
              Start with setup <ArrowRight size={15} />
            </Link>
          </article>
        )}
        {article && (
          <aside className="docs-contents">
            <span className="mono">IN THIS GUIDE</span>
            <div className="docs-reading-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <nav aria-label="On this page">
              {headings.map((heading) => (
                <a
                  key={heading}
                  href={"#" + anchor(heading)}
                  aria-current={
                    activeHeading === anchor(heading) ? "location" : undefined
                  }
                >
                  {heading}
                </a>
              ))}
            </nav>
            <Link className="docs-help" to="/docs/troubleshooting">
              Something not working?
              <ArrowRight size={13} />
            </Link>
          </aside>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
