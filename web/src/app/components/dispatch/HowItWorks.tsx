import React from "react";
import {
  IconTerminal2,
  IconDatabase,
  IconChessKnight,
  IconPencil,
  IconShieldCheck,
} from "@tabler/icons-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Platform {
  label: string;
  bg: string;
}

interface Step {
  num: number;
  Icon: React.FC<{ size: number; color: string; stroke: number }>;
  title: string;
  note?: string;
  platforms?: Platform[];
  border: string;
  iconColor: string;
}

const STEPS: Step[] = [
  {
    num: 1,
    Icon: IconTerminal2,
    title: "You log a milestone",
    border: "0.5px solid var(--border)",
    iconColor: "var(--text-secondary)",
  },
  {
    num: 2,
    Icon: IconDatabase,
    title: "Project memory retrieves context",
    border: "1px solid var(--accent)",
    iconColor: "var(--accent)",
  },
  {
    num: 3,
    Icon: IconChessKnight,
    title: "Strategist agent decides angle",
    note: "Is it post-worthy? What story?",
    border: "0.5px solid var(--border)",
    iconColor: "var(--text-secondary)",
  },
  {
    num: 4,
    Icon: IconPencil,
    title: "Platform writers draft",
    platforms: [
      { label: "in",  bg: "#0A66C2" },
      { label: "𝕏",  bg: "var(--bg-terminal)" },
      { label: "r/",  bg: "#FF4500" },
      { label: "Th",  bg: "var(--bg-terminal)" },
    ],
    border: "0.5px solid var(--border)",
    iconColor: "var(--text-secondary)",
  },
  {
    num: 5,
    Icon: IconShieldCheck,
    title: "Critic scores & you approve",
    border: "1px solid #22C55E",
    iconColor: "#22C55E",
  },
];

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ step }: { step: Step }) {
  const { num, Icon, title, note, platforms, border, iconColor } = step;
  const isAccent = num === 2;
  const isSuccess = num === 5;

  return (
    <div
      className="dispatch-hiw-step"
      style={{
        backgroundColor: "var(--surface)",
        border,
        borderRadius: 12,
        padding: "16px 16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        boxShadow: isAccent
          ? "0 0 0 3px rgba(232,94,44,0.06)"
          : isSuccess
          ? "0 0 0 3px rgba(34,197,94,0.06)"
          : "none",
        transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Step number */}
      <span
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 10,
          color: "var(--text-secondary)",
          opacity: 0.6,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {String(num).padStart(2, "0")}
      </span>

      {/* Icon */}
      <Icon size={22} color={iconColor} stroke={1.75} />

      {/* Title */}
      <div
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          paddingRight: 20, /* clear the number badge */
        }}
      >
        {title}
      </div>

      {/* Optional note */}
      {note && (
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {note}
        </div>
      )}

      {/* Platform badges */}
      {platforms && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
          {platforms.map(({ label, bg }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 7px",
                backgroundColor: bg,
                borderRadius: 4,
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "#F5F2EC",
                letterSpacing: "0.01em",
                lineHeight: 1.4,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Connector (horizontal on desktop, vertical on mobile) ────────────────────

function Connector() {
  return (
    <div className="dispatch-hiw-conn">
      {/* Desktop: horizontal dashed line + chevron */}
      <div className="dispatch-hiw-conn-h">
        <div
          style={{
            flex: 1,
            borderTop: "1px dashed rgba(232,94,44,0.45)",
          }}
        />
        <svg
          width="5"
          height="8"
          viewBox="0 0 5 8"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M0.5 0.5L4.5 4L0.5 7.5"
            stroke="rgba(232,94,44,0.55)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Mobile: vertical dashed line + chevron */}
      <div className="dispatch-hiw-conn-v">
        <div
          style={{
            flex: 1,
            borderLeft: "1px dashed rgba(232,94,44,0.45)",
          }}
        />
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M0.5 0.5L4 4.5L7.5 0.5"
            stroke="rgba(232,94,44,0.55)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section className="dispatch-reveal" style={{ backgroundColor: "var(--bg)", paddingBottom: 96, transition: "background-color 0.3s ease" }}>
      <style>{`
        .dispatch-hiw-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }

        /* ── Flow row ─────────────────────────────────────────────────── */
        .dispatch-hiw-outer {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }
        .dispatch-hiw-step {
          flex: 1;
          min-width: 0;
        }

        /* ── Connector: desktop ───────────────────────────────────────── */
        .dispatch-hiw-conn {
          flex-shrink: 0;
          width: 32px;
          /* Align connector line with icon center: 16px card-pad + 11px icon-half */
          margin-top: 27px;
          align-self: flex-start;
        }
        .dispatch-hiw-conn-h {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
        }
        .dispatch-hiw-conn-v {
          display: none;
        }

        /* ── Mobile overrides ─────────────────────────────────────────── */
        @media (max-width: 767px) {
          .dispatch-hiw-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-hiw-outer {
            flex-direction: column;
            align-items: stretch;
          }
          .dispatch-hiw-step {
            flex: none;
            width: 100%;
          }
          .dispatch-hiw-conn {
            width: auto;
            height: 28px;
            margin-top: 0;
            align-self: center;
            display: flex;
            align-items: center;
          }
          .dispatch-hiw-conn-h { display: none !important; }
          .dispatch-hiw-conn-v {
            display: flex !important;
            flex-direction: column;
            align-items: center;
            height: 100%;
            width: 100%;
          }
        }
      `}</style>

      <div className="dispatch-hiw-inner">

        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 400,
            color: "var(--text-secondary)",
            opacity: 0.7,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          How It Works
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "Space Grotesk, system-ui, sans-serif",
            fontSize: 28,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 12px",
            padding: 0,
            transition: "color 0.3s ease",
          }}
        >
          One signal in. Four platform-native posts out.
        </h2>

        {/* Sub */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            maxWidth: 480,
            margin: "0 0 40px",
            transition: "color 0.3s ease",
          }}
        >
          A LangGraph pipeline runs five specialized agents in sequence. You just type what
          you shipped.
        </p>

        {/* Step flow */}
        <div className="dispatch-hiw-outer">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <StepCard step={step} />
              {i < STEPS.length - 1 && <Connector />}
            </React.Fragment>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "var(--text-secondary)",
            opacity: 0.8,
            lineHeight: 1.6,
            fontStyle: "italic",
            marginTop: 24,
            margin: "24px 0 0",
            transition: "color 0.3s ease",
          }}
        >
          Phase 3: Composio posts automatically via MCP. No OAuth hell — Composio handles
          LinkedIn, X, and Reddit connections in minutes.
        </p>

      </div>
    </section>
  );
}
