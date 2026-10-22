import React, { useState } from "react";
import { IconTerminal2, IconCopy, IconCheck } from "@tabler/icons-react";

// ─── Stamp ────────────────────────────────────────────────────────────────────
// Two absolutely stacked divs driven by CSS @keyframes (animations.css):
//   .dispatch-stamp-ring  → dispatch-spin-cw  10s linear infinite
//   .dispatch-stamp-text  → dispatch-spin-ccw 10s linear infinite
// Net effect: dashes rotate, "DISPATCH" text stays readable.

function CTAStamp() {
  const SIZE = 72;
  const R_RING = 33;
  const R_TEXT = 27;
  const textPath = `M 36 ${36 - R_TEXT} a ${R_TEXT} ${R_TEXT} 0 1 1 -0.001 0`;

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      {/* Layer 1 — rotating dashed ring */}
      <div className="dispatch-stamp-ring" style={{ position: "absolute", inset: 0 }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="36" cy="36" r={R_RING}
            stroke="#E85E2C"
            strokeWidth="2"
            strokeDasharray="4 2.8"
          />
        </svg>
      </div>

      {/* Layer 2 — counter-rotating text (net effect: text is stationary) */}
      <div className="dispatch-stamp-text" style={{ position: "absolute", inset: 0 }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <path id="cta-stamp-arc" d={textPath} />
          </defs>
          <text
            fill="#E85E2C"
            fontSize="6.5"
            fontFamily="'IBM Plex Sans', system-ui, sans-serif"
            fontWeight="600"
          >
            <textPath href="#cta-stamp-arc" letterSpacing="17">
              BYLINE
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}

// ─── Heading ──────────────────────────────────────────────────────────────────

function CTAHeading() {
  return (
    <h2
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 32,
        fontWeight: 500,
        color: "var(--text-primary)",
        letterSpacing: "-0.022em",
        lineHeight: 1.2,
        textAlign: "center",
        margin: "0 0 16px",
        padding: 0,
        transition: "color 0.3s ease",
      }}
    >
      Stop choosing between
      <br />
      <em
        style={{
          fontFamily: "Instrument Serif, Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
          color: "var(--accent)",
        }}
      >
        shipping
      </em>
      {" "}
      <span style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontWeight: 500, color: "var(--text-primary)", transition: "color 0.3s ease" }}>
        and being visible.
      </span>
    </h2>
  );
}

// ─── Quick Start Box ─────────────────────────────────────────────────────────

function QuickStart() {
  const [copied, setCopied] = useState(false);
  const code = "git clone https://github.com/sahil/byline.git\ncd byline && docker compose up -d";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        maxWidth: 380,
        width: "100%",
        margin: "0 auto",
        backgroundColor: "var(--bg-terminal)",
        borderRadius: 8,
        border: "0.5px solid var(--border)",
        padding: "12px 16px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <IconTerminal2 size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span
          style={{
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.85)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.5,
          }}
        >
          git clone https://github.com/sahil/byline...
        </span>
      </div>
      <button
        onClick={handleCopy}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "0.5px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 4,
          padding: 6,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s ease",
          marginLeft: 8,
          flexShrink: 0,
        }}
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

// ─── Stats row ────────────────────────────────────────────────────────────────

const STATS = [
  { value: "4",   label: "platforms" },
  { value: "5",   label: "agents"    },
  { value: "MIT", label: "license"   },
  { value: "0",   label: "lock-in"   },
];

function StatsRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        flexWrap: "wrap",
      }}
    >
      {STATS.map(({ value, label }, i) => (
        <React.Fragment key={label}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                transition: "color 0.3s ease",
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.3s ease",
              }}
            >
              {label}
            </span>
          </div>
          {i < STATS.length - 1 && (
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "var(--border)",
                display: "inline-block",
                flexShrink: 0,
                transition: "background-color 0.3s ease",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── GitHub link ──────────────────────────────────────────────────────────────

function GitHubLink() {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="https://github.com/sahil/byline"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        color: hov ? "var(--text-primary)" : "var(--text-secondary)",
        textDecoration: "none",
        transition: "color 0.12s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={{ color: "#F59E0B" }}>★</span>
      <span>View source on GitHub</span>
      <span style={{ color: "var(--text-secondary)", opacity: 0.8 }}>→</span>
      <span
        style={{
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 11,
          color: "var(--text-secondary)",
          opacity: 0.8,
        }}
      >
        github.com/sahil/byline
      </span>
    </a>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function CTASection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg)",
        paddingTop: 96,
        paddingBottom: 96,
        transition: "background-color 0.3s ease",
      }}
    >
      <style>{`
        .dispatch-cta-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        @media (max-width: 767px) {
          .dispatch-cta-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }
      `}</style>

      <div className="dispatch-cta-inner">

        {/* Stamp */}
        <div style={{ marginBottom: 28 }}>
          <CTAStamp />
        </div>

        {/* Heading */}
        <CTAHeading />

        {/* Sub */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 420,
            margin: "0 auto 32px",
            transition: "color 0.3s ease",
          }}
        >
          Open source. Self-hostable. Built in public, for builders who build in public.
        </p>

        {/* Quick start code copy box */}
        <div style={{ width: "100%", marginBottom: 32 }}>
          <QuickStart />
        </div>

        {/* Stats row */}
        <div style={{ marginBottom: 20 }}>
          <StatsRow />
        </div>

        {/* GitHub link */}
        <GitHubLink />

      </div>
    </section>
  );
}
