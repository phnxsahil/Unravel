import React from "react";
import { IconBrandGithub } from "@tabler/icons-react";

// ─── Terminal data ────────────────────────────────────────────────────────────

interface TermLine {
  type: "comment" | "prompt" | "arrow" | "success";
  text: string;
  gap?: number; // bottom margin after this line (px)
}

const LINES: TermLine[] = [
  { type: "comment", text: "# dispatch — log a milestone", gap: 14 },
  {
    type: "prompt",
    text: '$ dispatch log "shipped semantic search on fltrd.tech using pgvector"',
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
  { icon: "🔒", label: "Self-hostable" },
  { icon: "⚡", label: "LangGraph + Claude Sonnet" },
  { icon: "🔧", label: "Composio-powered distribution" },
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
        border: "0.5px solid rgba(15,15,13,0.14)",
        borderRadius: 20,
        backgroundColor: "#EDEAE2",
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
          color: "#6B6960",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        Open source · MIT License
      </span>
    </div>
  );
}

// ─── CTA buttons ──────────────────────────────────────────────────────────────

function CTAPrimary() {
  return (
    <a
      href="#demo"
      className="dispatch-cta-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#E85E2C",
        borderRadius: 8,
        textDecoration: "none",
        flexShrink: 0,
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
        See it in action
      </span>
    </a>
  );
}

function CTAGhost() {
  return (
    <a
      href="#github"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 20px",
        border: "0.5px solid rgba(15,15,13,0.2)",
        borderRadius: 8,
        textDecoration: "none",
        backgroundColor: "transparent",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        flexShrink: 0,
      }}
    >
      <IconBrandGithub size={14} color="#0F0F0D" stroke={1.75} />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: "#0F0F0D",
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
      style={{
        backgroundColor: "#1A1A18",
        borderRadius: 12,
        border: "0.5px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 4px 6px rgba(15,15,13,0.04), 0 12px 40px rgba(15,15,13,0.1), 0 32px 80px rgba(15,15,13,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 7,
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
          dispatch — zsh
        </span>
      </div>

      {/* Body — all lines pre-rendered, CSS handles the staggered reveal */}
      <div style={{ padding: "22px 22px 28px" }}>
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
                lineHeight: 1.75,
                color: LINE_COLOR[line.type],
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                display: "block",
              }}
            >
              {line.type === "prompt" ? (
                <>
                  <span style={{ color: "#E85E2C" }}>$</span>
                  {line.text.slice(1)}
                </>
              ) : (
                line.text
              )}
            </span>
          </div>
        ))}

        {/* Blinking block cursor — appears after last line via CSS delay */}
        <span
          className="dispatch-term-cursor dispatch-cursor"
          style={{
            display: "inline-block",
            width: 7,
            height: 13,
            backgroundColor: "rgba(255,255,255,0.6)",
            verticalAlign: "text-bottom",
            marginTop: 2,
          }}
        />
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {

  return (
    <section
      style={{
        backgroundColor: "#F5F2EC",
        paddingBottom: 96,
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
        @media (max-width: 767px) {
          .dispatch-hero-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
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
          <div>

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
                  fontWeight: 500,
                  color: "#1A1916",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                }}
              >
                Ship things.
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "Space Grotesk, system-ui, sans-serif",
                  fontSize: 40,
                  fontWeight: 500,
                  color: "#E85E2C",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                }}
              >
                Dispatch the rest.
              </span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                margin: "0 0 30px",
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 400,
                color: "#6B6960",
                maxWidth: 400,
                lineHeight: 1.65,
              }}
            >
              One update. Four platforms. Your voice — not AI voice. The content engine
              for founders who build in public.
            </p>

            {/* CTA row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 26,
                flexWrap: "wrap",
              }}
            >
              <CTAPrimary />
              <CTAGhost />
            </div>

            {/* Trust bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {TRUST.map(({ icon, label }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>
                    {icon}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "#A8A49A",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                </div>
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
