import React, { useState, useEffect } from "react";
import { IconTerminal2, IconCopy, IconCheck, IconArrowLeft } from "@tabler/icons-react";

interface DocPage {
  id: string;
  title: string;
  category: string;
}

const DOC_PAGES: DocPage[] = [
  { id: "overview", title: "Overview", category: "Getting Started" },
  { id: "self-host", title: "Self-Hosting (Docker)", category: "Getting Started" },
  { id: "agents", title: "Agent Architecture", category: "Core Concepts" },
  { id: "composio", title: "Composio Integration", category: "Publishing" },
  { id: "changelog", title: "Changelog", category: "Publishing" },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "var(--bg-terminal)",
        borderRadius: 6,
        border: "0.5px solid var(--border)",
        padding: "14px 18px",
        margin: "16px 0",
        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.85)",
        lineHeight: 1.6,
        overflowX: "auto",
        transition: "all 0.3s ease",
      }}
    >
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{code}</pre>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(255, 255, 255, 0.05)",
          border: "0.5px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 4,
          padding: 5,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s ease",
        }}
        title="Copy code"
      >
        {copied ? (
          <IconCheck size={12} color="#22C55E" stroke={2.5} />
        ) : (
          <IconCopy size={12} color="rgba(255, 255, 255, 0.4)" stroke={1.75} />
        )}
      </button>
    </div>
  );
}

export function DocsSection() {
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#docs/")) {
        return hash.substring(6);
      }
    }
    return "overview";
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#docs/")) {
        setActivePage(hash.substring(6));
      } else if (hash === "#docs") {
        setActivePage("overview");
      }
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 32, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0 0 8px 0", transition: "color 0.3s ease" }}>
              Overview
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              Byline is a personal wire service and publishing engine for developers who build in public. It maintains a persistent memory of your software projects, watches for things worth posting about, writes platform-native drafts for LinkedIn, X (Twitter), Reddit, and Threads using a multi-agent pipeline, and posts them via Composio.
            </p>
            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Key Principles
            </h2>
            <ul style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, paddingLeft: 20, transition: "color 0.3s ease" }}>
              <li><strong>Single-user, self-hosted:</strong> Designed for individual developers. No multi-tenancy, team features, or billing overhead. You run your own server and retain full ownership of your data.</li>
              <li><strong>Your voice:</strong> Extracts structured voice profiles from 10 past posts, matching your paragraphs, vocabulary, line breaks, and avoiding generic AI slop.</li>
              <li><strong>Platform native:</strong> Different formats for different audiences. Not a plain cross-poster. The LinkedIn specialist builds narrative stories, X compresses, Reddit reframes without promotional tone, and Threads stays casual.</li>
            </ul>

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Monorepo Architecture
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              The Byline monorepo separates components clearly into distinct layers:
            </p>
            <ul style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, paddingLeft: 20, transition: "color 0.3s ease" }}>
              <li><strong>apps/web:</strong> Next.js frontend built with custom styling tokens (no generic component libraries).</li>
              <li><strong>apps/api:</strong> FastAPI backend providing async database integrations and handling REST endpoints.</li>
              <li><strong>packages/agents:</strong> The core LangGraph agents pipeline (strategist, writers, critic nodes).</li>
              <li><strong>infra:</strong> Orchestrated Docker infrastructure and SQL databases.</li>
            </ul>
          </div>
        );

      case "self-host":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 32, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0 0 8px 0", transition: "color 0.3s ease" }}>
              Self-Hosting Guide
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              Run Byline on your own infrastructure in minutes. Standard setup utilizes Docker Compose to configure the backend API, frontend web panel, and a preconfigured PostgreSQL database with the <code>pgvector</code> extension.
            </p>

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Quick Start
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, transition: "color 0.3s ease" }}>
              Clone the repository and spin up the services using Docker:
            </p>
            <CodeBlock code={`git clone https://github.com/sahil/byline.git\ncd byline\ndocker compose up -d`} />

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Environment Variables
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              Copy <code>.env.example</code> to <code>.env</code> and fill in the required keys:
            </p>
            <CodeBlock code={`# Database Configuration\nDATABASE_URL=postgresql+asyncpg://byline:byline@localhost:5432/byline\n\n# LLM API Keys\nANTHROPIC_API_KEY=your-anthropic-key-for-agents-and-critic\nOPENAI_API_KEY=your-openai-key-for-embeddings-only\n\n# Optional: Composio Key for posting\nCOMPOSIO_API_KEY=your-composio-key`} />

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Database Setup
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              The schema utilizes <code>pgvector</code> for storing semantic memories. On first startup, the database is initialized using <code>infra/postgres/init.sql</code>. All subsequent updates must be managed via Alembic migrations.
            </p>
          </div>
        );

      case "agents":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 32, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0 0 8px 0", transition: "color 0.3s ease" }}>
              Agent Architecture
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              Byline runs a multi-agent state graph built on LangGraph. This architecture orchestrates multiple specialized nodes to turn a simple developer milestone into highly polished drafts:
            </p>

            <div
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: 8,
                border: "0.5px solid var(--border)",
                padding: "16px 20px",
                margin: "12px 0",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 16, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px 0", transition: "color 0.3s ease" }}>
                Pipeline Node Flow
              </h3>
              <ol style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, paddingLeft: 20, transition: "color 0.3s ease" }}>
                <li><strong>Ingestion:</strong> Milestone log is input via CLI, dashboard, or GitHub webhook.</li>
                <li><strong>Memory Retrieval:</strong> <code>pgvector</code> retrieves the 5 most similar past bylines to ground context.</li>
                <li><strong>Strategist:</strong> Analyzes milestone relevance, selects the story angle, and flags appropriate target platforms.</li>
                <li><strong>Writers:</strong> Four concurrent platform specialists (LinkedIn, X, Reddit, Threads) draft platform-specific posts.</li>
                <li><strong>Critic:</strong> Evaluates every draft 1-10 on voice alignment, length constraints, and anti-promo checks (especially Reddit).</li>
              </ol>
            </div>

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              System Prompts
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              All agent system prompts are isolated as external text files under <code>packages/agents/prompts/</code>. This makes tweaking agent behaviors and custom voice instructions easy without touching Python graph logic.
            </p>
          </div>
        );

      case "composio":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 32, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0 0 8px 0", transition: "color 0.3s ease" }}>
              Composio Integration
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              Composio handles the complex OAuth configurations for LinkedIn, X (Twitter), and Reddit as managed connections, completely removing custom credential logic from the application.
            </p>

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Platform Connections
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, transition: "color 0.3s ease" }}>
              Run the Composio CLI tool once to connect your corporate/personal accounts:
            </p>
            <CodeBlock code={`# Connect your accounts via Composio OAuth\ncomposio add linkedin\ncomposio add twitter\ncomposio add reddit`} />

            <h2 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "24px 0 8px 0", transition: "color 0.3s ease" }}>
              Publishing Service
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              All posting calls are routed via <code>apps/api/services/publishing.py</code>:
            </p>
            <CodeBlock code={`from composio import ComposioToolSet, Action\n\ntoolset = ComposioToolSet(api_key=os.environ["COMPOSIO_API_KEY"])\n\n# Publishing is triggered only upon explicit human approval\nresponse = toolset.execute_action(\n    action=Action.LINKEDIN_CREATE_SHARE_POST,\n    params={"text": body},\n    entity_id=entity_id,\n)`} />
          </div>
        );

      case "changelog":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 32, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0 0 8px 0", transition: "color 0.3s ease" }}>
              Changelog
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, transition: "color 0.3s ease" }}>
              Recent updates and improvements to the Byline platform:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>
              <div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>v0.8.2 · June 2026</span>
                <h3 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 15, fontWeight: 500, color: "var(--text-primary)", margin: "4px 0", transition: "color 0.3s ease" }}>UI/UX Polishes & responsive improvements</h3>
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "6px 0 0 0", paddingLeft: 18, transition: "color 0.3s ease" }}>
                  <li>Fixed Navbar links hover unreadability in dark mode by introducing theme-sensitive color evaluations.</li>
                  <li>Replaced inline aspect-ratio overrides on terminal viewports to prevent layout squishing on mobile screens.</li>
                  <li>Added fully interactive side-navigation routing for documentation pages.</li>
                  <li>Integrated moon/sun icon with localStorage persistence for global dark mode.</li>
                </ul>
              </div>
              <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 16 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--text-secondary)", opacity: 0.8 }}>v0.8.0 · May 2026</span>
                <h3 style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 15, fontWeight: 500, color: "var(--text-primary)", margin: "4px 0", transition: "color 0.3s ease" }}>Multi-Agent LangGraph Pipeline</h3>
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "6px 0 0 0", paddingLeft: 18, transition: "color 0.3s ease" }}>
                  <li>Introduced concurrent writer agents specializing in LinkedIn, X, Reddit, and Threads.</li>
                  <li>Integrated the critic agent node evaluating anti-promotional and slop guidelines.</li>
                  <li>Set up pgvector DB support for semantic workspace search caching.</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section style={{ backgroundColor: "var(--bg)", minHeight: "calc(100vh - 56px)", paddingTop: 80, paddingBottom: 64, transition: "background-color 0.3s ease" }}>
      <style>{`
        .dispatch-docs-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .dispatch-docs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dispatch-docs-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dispatch-docs-group:not(:last-of-type) {
          border-bottom: 0.5px solid var(--border);
          padding-bottom: 16px;
        }
        .dispatch-docs-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }
        .dispatch-docs-btn {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 13px;
          color: var(--text-secondary);
          background: none;
          border: none;
          text-align: left;
          padding: 5px 0;
          cursor: pointer;
          transition: color 0.12s ease;
        }
        .dispatch-docs-btn:hover {
          color: var(--text-primary);
        }
        .dispatch-docs-btn.active {
          color: var(--accent);
          font-weight: 500;
        }
        .dispatch-docs-body {
          max-width: 680px;
          min-width: 0;
        }
        .dispatch-docs-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 8px;
          transition: color 0.12s ease, transform 0.12s ease;
        }
        .dispatch-docs-back:hover {
          color: var(--text-primary);
          transform: translateX(-3px);
        }
        @media (max-width: 767px) {
          .dispatch-docs-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 0 20px !important;
          }
          .dispatch-docs-sidebar {
            border-bottom: 0.5px solid var(--border);
            padding-bottom: 16px;
          }
          .dispatch-docs-group:not(:last-of-type) {
            border-bottom: none;
            padding-bottom: 0;
          }
        }
      `}</style>
      <div className="dispatch-docs-grid">
        {/* Sidebar */}
        <aside className="dispatch-docs-sidebar">
          {/* Back button */}
          <a href="#" className="dispatch-docs-back">
            <IconArrowLeft size={12} stroke={2} />
            Back to Home
          </a>

          <div className="dispatch-docs-group">
            <span className="dispatch-docs-label">Getting Started</span>
            {DOC_PAGES.filter((p) => p.category === "Getting Started").map((p) => (
              <button
                key={p.id}
                onClick={() => { window.location.hash = `#docs/${p.id}`; }}
                className={`dispatch-docs-btn ${activePage === p.id ? "active" : ""}`}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="dispatch-docs-group">
            <span className="dispatch-docs-label">Core Concepts</span>
            {DOC_PAGES.filter((p) => p.category === "Core Concepts").map((p) => (
              <button
                key={p.id}
                onClick={() => { window.location.hash = `#docs/${p.id}`; }}
                className={`dispatch-docs-btn ${activePage === p.id ? "active" : ""}`}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="dispatch-docs-group">
            <span className="dispatch-docs-label">Publishing</span>
            {DOC_PAGES.filter((p) => p.category === "Publishing").map((p) => (
              <button
                key={p.id}
                onClick={() => { window.location.hash = `#docs/${p.id}`; }}
                className={`dispatch-docs-btn ${activePage === p.id ? "active" : ""}`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Content body */}
        <article className="dispatch-docs-body">{renderContent()}</article>
      </div>
    </section>
  );
}
