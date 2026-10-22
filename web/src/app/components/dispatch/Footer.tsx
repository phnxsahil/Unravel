import React, { useState } from "react";
import { Logo } from "./Logo";

// ─── Nav links ────────────────────────────────────────────────────────────────

const LINKS = [
  { label: "GitHub",      href: "https://github.com/sahil/byline" },
  { label: "Docs",        href: "#docs" },
  { label: "Changelog",   href: "#docs/changelog" },
  { label: "Twitter / X",  href: "https://x.com" },
];

function FooterLink({ label, href }: { label: string; href: string }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 400,
        color: hov ? "var(--text-footer-primary)" : "var(--text-footer-secondary)",
        textDecoration: "none",
        transition: "color 0.12s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </a>
  );
}

// ─── Tech badge (right column) ────────────────────────────────────────────────

function TechBadge({
  label,
  color,
  abbr,
}: {
  label: string;
  color: string;
  abbr: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        border: "0.5px solid var(--border-footer)",
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 9,
          color: "var(--text-footer-secondary)",
          letterSpacing: "0.04em",
        }}
      >
        {abbr}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 9,
          color: "var(--text-footer-secondary)",
          opacity: 0.7,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const TECH = [
  { label: "Anthropic",  color: "#E85E2C", abbr: "Claude"    },
  { label: "Composio",   color: "#22C55E", abbr: "MCP"       },
  { label: "LangGraph",  color: "#6366F1", abbr: "LG"        },
];

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--bg)", paddingBottom: 40, paddingTop: 8, transition: "background-color 0.3s ease" }}>
      <style>{`
        .byline-footer-inner {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          align-items: stretch;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background-color: var(--bg-footer);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0,0,0,0.03);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .byline-footer-col {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 0.5px solid var(--border-footer);
          transition: border-color 0.3s ease;
        }

        .byline-footer-col:last-child {
          border-right: none;
        }

        .byline-footer-center {
          align-items: center;
          gap: 16px;
        }

        .byline-footer-right {
          align-items: flex-end;
          gap: 12px;
        }

        .byline-footer-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        @media (max-width: 767px) {
          .byline-footer-inner {
            margin: 0 16px;
            grid-template-columns: 1fr !important;
            border-radius: 8px;
          }
          .byline-footer-col {
            border-right: none !important;
            border-bottom: 0.5px solid var(--border-footer);
            padding: 20px 24px;
            align-items: flex-start !important;
          }
          .byline-footer-col:last-child {
            border-bottom: none;
          }
          .byline-footer-badges {
            justify-content: flex-start !important;
          }
        }
      `}</style>

      <div className="byline-footer-inner">
        {/* Column 1: Brand & License */}
        <div className="byline-footer-col">
          <div style={{ marginBottom: 12 }}>
            <Logo size={14} dark={true} />
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "var(--text-footer-secondary)",
              lineHeight: 1.5,
              transition: "color 0.3s ease",
            }}
          >
            MIT License · Built in public by{" "}
            <a
              href="https://github.com/sahil/byline"
              style={{
                color: "var(--text-footer-primary)",
                textDecoration: "none",
                borderBottom: "1px dashed var(--text-footer-secondary)",
                transition: "color 0.3s ease, border-color 0.3s ease",
              }}
            >
              @sahil
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="byline-footer-col byline-footer-center">
          <div
            style={{
              fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: 9,
              color: "var(--text-footer-secondary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.3s ease",
            }}
          >
            navigation
          </div>
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {LINKS.map((l) => (
              <FooterLink key={l.label} {...l} />
            ))}
          </nav>
        </div>

        {/* Column 3: Stack Badges */}
        <div className="byline-footer-col byline-footer-right">
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "var(--text-footer-secondary)",
              lineHeight: 1.5,
              textAlign: "right",
              transition: "color 0.3s ease",
            }}
          >
            Engine: LangGraph + Claude
          </div>
          <div className="byline-footer-badges">
            {TECH.map((t) => (
              <TechBadge key={t.abbr} {...t} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
