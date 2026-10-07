import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ThemeToggle, Wordmark } from "./shared";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const location = useLocation();
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => setCompact(window.scrollY > 64);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        header.current
          ?.querySelector<HTMLButtonElement>(".mobile-menu")
          ?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <header
      ref={header}
      className={`site-header ${compact ? "is-compact" : ""} ${location.pathname.startsWith("/docs") ? "is-docs" : ""}`}
    >
      <div className="site-header-inner">
        <Wordmark />
        <button
          className="icon-button mobile-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
        <nav
          id="site-navigation"
          className={open ? "is-open" : ""}
          aria-label="Main navigation"
          onClick={() => setOpen(false)}
        >
          <Link
            to="/#how-it-works"
            aria-current={
              location.pathname === "/" && location.hash === "#how-it-works"
                ? "location"
                : undefined
            }
          >
            Product
          </Link>
          <Link
            to="/#features"
            aria-current={
              location.pathname === "/" && location.hash === "#features"
                ? "location"
                : undefined
            }
          >
            How it works
          </Link>
          <Link
            to="/docs"
            aria-current={
              location.pathname.startsWith("/docs") ? "page" : undefined
            }
          >
            Docs
          </Link>
          <Link className="mobile-workshop-link" to="/projects">
            Open Unravel <ArrowRight size={15} />
          </Link>
        </nav>
        <div className="site-header-actions">
          <ThemeToggle />
          <Link className="button secondary small" to="/projects">
            Open Unravel <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-top">
          <div className="footer-intro">
            <Wordmark />
            <p>
              Understand the app you built.{" "}
              <br />
              Make your next change with confidence.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <div>
              <span>PRODUCT</span>
              <Link to="/projects/demo">Explore the demo</Link>
              <Link to="/#features">How it works</Link>
              <Link to="/projects">Connect a project</Link>
            </div>
            <div>
              <span>DOCS</span>
              <Link to="/docs/quick-start">Get started</Link>
              <Link to="/docs/privacy">Code & privacy</Link>
              <Link to="/docs/troubleshooting">Troubleshooting</Link>
            </div>
            <div>
              <span>PROJECT</span>
              <a
                href="https://github.com/phnxsahil/byline"
                title="GitHub (opens in a new tab)"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://github.com/phnxsahil/byline/blob/main/docs/ravel/CHANGELOG.md"
                title="Changelog (opens in a new tab)"
                target="_blank"
                rel="noreferrer"
              >
                Changelog
              </a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Unravel</span>
          <span>
            Local software. A clearer picture.{" "}
            <span className="footer-version">v{__UNRAVEL_VERSION__}</span>
          </span>
          <button
            type="button"
            className="back-to-top"
            onClick={() => {
              document
                .querySelector<HTMLAnchorElement>(".site-header .wordmark")
                ?.focus({ preventScroll: true });
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              });
            }}
          >
            Back to top <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="footer-watermark" aria-hidden="true">
          <span data-wordmark="unravel" />
        </div>
      </div>
    </footer>
  );
}

export function CopyCommand({
  text,
  label = "Copy command",
}: {
  text: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }
  return (
    <span className="copy-control">
      <button className="icon-button" aria-label={label} onClick={copy}>
        {state === "copied" ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <span role="status">
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Select the text to copy"
            : ""}
      </span>
    </span>
  );
}

export function GuideLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="guide-link" to={"/docs/" + to}>
      {children} <ArrowRight size={15} />
    </Link>
  );
}
