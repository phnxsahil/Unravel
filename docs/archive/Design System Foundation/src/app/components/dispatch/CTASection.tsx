import React, { useState } from "react";

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
              DISPATCH
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
        color: "#0F0F0D",
        letterSpacing: "-0.022em",
        lineHeight: 1.2,
        textAlign: "center",
        margin: "0 0 16px",
        padding: 0,
      }}
    >
      Stop choosing between
      <br />
      <em
        style={{
          fontFamily: "Instrument Serif, Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
          color: "#E85E2C",
        }}
      >
        shipping
      </em>
      {" "}
      <span style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontWeight: 500, color: "#0F0F0D" }}>
        and being visible.
      </span>
    </h2>
  );
}

// ─── Email form ───────────────────────────────────────────────────────────────

function EmailForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hovBtn, setHovBtn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          maxWidth: 360,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "11px 20px",
          backgroundColor: "rgba(34,197,94,0.07)",
          border: "0.5px solid rgba(34,197,94,0.25)",
          borderRadius: 8,
        }}
      >
        <span style={{ color: "#22C55E", fontSize: 14 }}>★</span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#16A34A",
          }}
        >
          You're on the list. We'll be in touch.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 360,
        margin: "0 auto",
        display: "flex",
        gap: 8,
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex: 1,
          minWidth: 0,
          padding: "10px 14px",
          backgroundColor: "#EDEAE2",
          border: "0.5px solid rgba(15,15,13,0.14)",
          borderRadius: 8,
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: "#0F0F0D",
          outline: "none",
          transition: "border-color 0.12s ease",
          boxSizing: "border-box",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "rgba(232,94,44,0.45)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(15,15,13,0.14)")
        }
      />
      <button
        type="submit"
        className="dispatch-cta-btn"
        style={{
          padding: "10px 20px",
          backgroundColor: hovBtn ? "#D14E23" : "#E85E2C",
          border: "none",
          borderRadius: 8,
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: "#F5F2EC",
          letterSpacing: "-0.01em",
          cursor: "pointer",
          transition: "background-color 0.12s ease",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
        onMouseEnter={() => setHovBtn(true)}
        onMouseLeave={() => setHovBtn(false)}
      >
        Get early access
      </button>
    </form>
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
                color: "#0F0F0D",
                letterSpacing: "-0.01em",
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 400,
                color: "#A8A49A",
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
                backgroundColor: "rgba(15,15,13,0.15)",
                display: "inline-block",
                flexShrink: 0,
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
      href="https://github.com/sahil/dispatch"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        color: hov ? "#0F0F0D" : "#6B6960",
        textDecoration: "none",
        transition: "color 0.12s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={{ color: "#F59E0B" }}>★</span>
      <span>View source on GitHub</span>
      <span style={{ color: "#A8A49A" }}>→</span>
      <span
        style={{
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 11,
          color: "#A8A49A",
        }}
      >
        github.com/sahil/dispatch
      </span>
    </a>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function CTASection() {
  return (
    <section
      style={{
        backgroundColor: "#F5F2EC",
        paddingTop: 96,
        paddingBottom: 96,
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
            color: "#6B6960",
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 420,
            margin: "0 auto 32px",
          }}
        >
          Open source. Self-hostable. Built in public, for builders who build in public.
        </p>

        {/* Email form */}
        <div style={{ width: "100%", marginBottom: 24 }}>
          <EmailForm />
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
