import React, { useState } from "react";

// ─── Nav links ────────────────────────────────────────────────────────────────

const LINKS = [
  { label: "GitHub",     href: "#github" },
  { label: "Docs",       href: "#docs" },
  { label: "Changelog",  href: "#changelog" },
  { label: "Twitter / X", href: "#twitter" },
];

function FooterLink({ label, href }: { label: string; href: string }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        color: hov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)",
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
        border: "0.5px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Color dot */}
      <span
        style={{
          display: "inline-block",
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.04em",
        }}
      >
        {abbr}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
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
    <footer
      style={{
        backgroundColor: "#0F0F0D",
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
      }}
    >
      <style>{`
        .dispatch-footer-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 32px 40px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
        }
        .dispatch-footer-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .dispatch-footer-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        @media (max-width: 767px) {
          .dispatch-footer-inner {
            padding: 32px 20px !important;
            grid-template-columns: 1fr !important;
            justify-items: start;
            gap: 28px;
          }
          .dispatch-footer-right {
            align-items: flex-start !important;
          }
          .dispatch-footer-badges {
            justify-content: flex-start !important;
          }
        }
      `}</style>

      <div className="dispatch-footer-inner">

        {/* ── Left — wordmark + license ────────────────────────────────── */}
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            DISPATCH
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.5,
            }}
          >
            MIT License · Built in public by{" "}
            <a
              href="#twitter"
              style={{
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
              }}
            >
              @sahil
            </a>
          </div>
        </div>

        {/* ── Center — nav links ───────────────────────────────────────── */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {LINKS.map((l) => (
            <FooterLink key={l.label} {...l} />
          ))}
        </nav>

        {/* ── Right — tech stack ───────────────────────────────────────── */}
        <div className="dispatch-footer-right">
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.5,
              textAlign: "right",
            }}
          >
            Made with LangGraph + Claude + Composio
          </div>
          <div className="dispatch-footer-badges">
            {TECH.map((t) => (
              <TechBadge key={t.abbr} {...t} />
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
