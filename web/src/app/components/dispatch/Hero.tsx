import React, { useState } from "react";
import { IconBrandGithub, IconServer, IconCpu, IconPlug } from "@tabler/icons-react";

// ─── Terminal data ────────────────────────────────────────────────────────────

interface TermLine {
  type: "comment" | "prompt" | "arrow" | "success";
  text: string;
  gap?: number; // bottom margin after this line (px)
}

const LINES: TermLine[] = [
  { type: "comment", text: "# byline — log a milestone", gap: 14 },
  {
    type: "prompt",
    text: '$ byline log "shipped semantic search on fltrd.tech using pgvector"',
    gap: 14,
  },
  {
    type: "arrow",
    text: '→ Strategist: post-worthy · angle: "the caching problem nobody talks about"',
  },
  { type: "arrow", text: "→ Writing for: linkedin · x · r/webdev · threads", gap: 14 },
  { type: "success", text: "✓ 4 drafts ready · critic score 8.6/10 · awaiting review" },
];

const LINE_COLOR: Record<TermLine["type"], string> = {
  comment: "rgba(255,255,255,0.38)",
  prompt: "rgba(255,255,255,0.92)",
  arrow: "rgba(255,255,255,0.45)",
  success: "#22C55E",
};

const TRUST = [
  { Icon: IconServer, label: "Self-hostable" },
  { Icon: IconCpu, label: "LangGraph + Claude" },
  { Icon: IconPlug, label: "Composio-powered distribution" },
];

// ─── Eyebrow pill ─────────────────────────────────────────────────────────────

function EyebrowPill() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 12px 4px 8px",
        border: "0.5px solid var(--border)",
        borderRadius: 20,
        backgroundColor: "var(--surface-secondary)",
      }}
    >
      <span
        className="dispatch-pulse-dot"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "#22C55E",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          color: "var(--text-secondary)",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        Your byline. Everywhere you ship.
      </span>
    </div>
  );
}

// ─── CTA buttons ──────────────────────────────────────────────────────────────

function CTAPrimary() {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="#docs"
      className="dispatch-cta-btn"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: hov ? "#C7501E" : "#E85E2C",
        borderRadius: 4,
        textDecoration: "none",
        transition: "background-color 0.12s ease",
        flexShrink: 0,
        boxShadow: hov ? "0 4px 12px rgba(232,94,44,0.18)" : "none",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: "#F5F2EC",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        Read the Docs
      </span>
    </a>
  );
}

function CTAGhost() {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="https://github.com/sahil/byline"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 20px",
        border: hov ? "0.5px solid var(--text-primary)" : "0.5px solid var(--border)",
        borderRadius: 4,
        textDecoration: "none",
        backgroundColor: hov ? "var(--surface)" : "transparent",
        transition: "all 0.12s ease",
        flexShrink: 0,
      }}
    >
      <IconBrandGithub size={14} color="var(--text-primary)" stroke={1.75} />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        Star on GitHub
      </span>
    </a>
  );
}

// ─── Terminal card ────────────────────────────────────────────────────────────
// Lines are always rendered; each gets .dispatch-term-line + .dispatch-term-line-N
// so animations.css drives the staggered fadeInUp entirely in CSS.

function TerminalCard() {
  return (
    <div
      className="dispatch-hero-terminal"
      style={{
        backgroundColor: "var(--bg-terminal)",
        borderRadius: 12,
        border: "0.5px solid var(--border)",
        boxShadow:
          "0 20px 50px rgba(15,15,13,0.12), 0 4px 10px rgba(15,15,13,0.05)",
        overflow: "hidden",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
        }}
      >
        {(["#E85E2C", "#F5A623", "#22C55E"] as const).map((c) => (
          <div
            key={c}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: c,
              opacity: 0.88,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 8,
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.04em",
          }}
        >
          byline — zsh
        </span>
      </div>

      {/* Body — all lines pre-rendered, CSS handles the staggered reveal */}
      <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {LINES.map((line, i) => (
            <div
              key={i}
              className={`dispatch-term-line dispatch-term-line-${i}`}
              style={{ marginBottom: line.gap ?? 0 }}
            >
              <span
                style={{
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: LINE_COLOR[line.type],
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  display: "block",
                }}
              >
                {line.text}
              </span>
            </div>
          ))}
        </div>

        {/* Cursor / prompt input line */}
        <div className="dispatch-term-cursor" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            $ byline
          </span>
          <span
            className="dispatch-cursor"
            style={{
              display: "inline-block",
              width: 6,
              height: 12,
              backgroundColor: "#E85E2C",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {

  return (
    <section
      style={{
        backgroundColor: "var(--bg)",
        paddingBottom: 96,
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Keyframe animations */}
      <style>{`
        @keyframes dispatch-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(34, 197, 94, 0.6); }
          70%  { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0   rgba(34, 197, 94, 0); }
        }
        .dispatch-pulse-dot {
          animation: dispatch-pulse 2.4s ease-out infinite;
        }

        @keyframes dispatch-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .dispatch-cursor {
          animation: dispatch-blink 1s step-end infinite;
        }

        .dispatch-hero-inner {
          padding-left: 40px;
          padding-right: 40px;
        }
        .dispatch-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .dispatch-hero-terminal {
          aspect-ratio: 16 / 10.5;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 767px) {
          .dispatch-hero-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .dispatch-hero-terminal {
            aspect-ratio: auto !important;
            min-height: 250px;
          }
        }
      `}</style>

      <div
        className="dispatch-hero-inner"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          paddingTop: 108, /* 52px fixed nav + 56px breathing room */
        }}
      >
        <div className="dispatch-hero-grid">

          {/* ── Left column ───────────────────────────────────────────────── */}
          <div className="dispatch-hero-content">

            {/* Eyebrow */}
            <div style={{ marginBottom: 22 }}>
              <EyebrowPill />
            </div>

            {/* Headline */}
            <h1 style={{ margin: "0 0 18px", padding: 0, lineHeight: 1 }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "Space Grotesk, system-ui, sans-serif",
                  fontSize: 40,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                  transition: "color 0.3s ease",
                }}
              >
                Your byline.
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "Space Grotesk, system-ui, sans-serif",
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#E85E2C",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                }}
              >
                Everywhere you ship.
              </span>
            </h1>

            {/* Sub + watcher line */}
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 400,
                color: "var(--text-secondary)",
                maxWidth: 400,
                lineHeight: 1.65,
                transition: "color 0.3s ease",
              }}
            >
              One milestone. Five specialized agents. Your voice — published natively across LinkedIn, X, Reddit, and Threads.
            </p>
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: "var(--text-tertiary, var(--text-secondary))",
                maxWidth: 400,
                lineHeight: 1.6,
                opacity: 0.72,
                transition: "color 0.3s ease",
              }}
            >
              Or connect your GitHub — Byline watches your commits and surfaces drafts before you even think to post.
            </p>

            {/* CTA row — Fix #5: 18px gap to trust badges (was 26px) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              <CTAPrimary />
              <CTAGhost />
            </div>

            {/* Trust bar — Fix #6: mid-dot separators instead of faint icons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                flexWrap: "wrap",
              }}
            >
              {TRUST.map(({ label }, idx) => (
                <React.Fragment key={label}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {label}
                  </span>
                  {idx < TRUST.length - 1 && (
                    <span style={{ margin: "0 8px", color: "var(--border)", fontSize: 14 }}>·</span>
                  )}
                </React.Fragment>
              ))}
            </div>

          </div>

          {/* ── Right column ──────────────────────────────────────────────── */}
          <div>
            <TerminalCard />
          </div>

        </div>
      </div>
    </section>
  );
}
