import React, { useState } from "react";
import { IconCheck, IconBrandGithub } from "@tabler/icons-react";

// ─── Feature lists ────────────────────────────────────────────────────────────

const SELF_HOSTED = [
  "Full LangGraph pipeline",
  "All 5 agents (strategist, 4 writers, critic)",
  "pgvector project memory",
  "Composio MCP integration",
  "GitHub & voice note ingestion",
  "Unlimited bylines",
];

const CLOUD = [
  "Everything in self-hosted",
  "No setup required",
  "Managed Composio credentials",
  "Team workspace",
  "Post analytics + feedback loop",
];

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({
  label,
  muted = false,
}: {
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
      }}
    >
      <IconCheck
        size={14}
        color={muted ? "var(--text-secondary)" : "var(--accent)"}
        stroke={2}
        style={{ flexShrink: 0, marginTop: 2, opacity: muted ? 0.6 : 1 }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: muted ? "var(--text-secondary)" : "var(--text-primary)",
          opacity: muted ? 0.7 : 1,
          lineHeight: 1.5,
          transition: "color 0.3s ease",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Card 1 — Self-hosted (highlighted) ───────────────────────────────────────

function SelfHostedCard() {
  const [hov, setHov] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--accent)",
        borderRadius: 14,
        padding: "28px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        boxShadow: "0 0 0 4px rgba(232,94,44,0.06), 0 4px 24px rgba(15,15,13,0.04)",
        transition: "all 0.3s ease",
      }}
    >
      {/* "MOST POPULAR" badge — top-right */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "var(--accent)",
          borderRadius: 20,
          padding: "3px 9px",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            color: "#FAFAF8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Most Popular
        </span>
      </div>

      {/* Plan name */}
      <div
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: "var(--text-primary)",
          letterSpacing: "-0.015em",
          marginBottom: 16,
          paddingRight: 100, /* clear the badge */
          transition: "color 0.3s ease",
        }}
      >
        Self-hosted
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--accent)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            transition: "color 0.3s ease",
          }}
        >
          $0
        </span>
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: "var(--text-secondary)",
          opacity: 0.8,
          marginBottom: 24,
          transition: "color 0.3s ease",
        }}
      >
        forever · MIT license
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "0.5px solid var(--border)",
          marginBottom: 20,
          transition: "border-color 0.3s ease",
        }}
      />

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
          marginBottom: 28,
        }}
      >
        {SELF_HOSTED.map((f) => (
          <FeatureRow key={f} label={f} />
        ))}
      </div>

      {/* CTA */}
      <a
        href="https://github.com/sahil/byline"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "11px 0",
          backgroundColor: hov ? "#C7501E" : "var(--accent)",
          borderRadius: 8,
          textDecoration: "none",
          transition: "background-color 0.12s ease",
          boxSizing: "border-box",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <IconBrandGithub size={14} color="#FAFAF8" stroke={2} />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#FAFAF8",
            letterSpacing: "-0.01em",
          }}
        >
          Clone on GitHub
        </span>
      </a>
    </div>
  );
}

// ─── Card 2 — Cloud (coming soon) ────────────────────────────────────────────

function CloudCard() {
  const [hov, setHov] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 14,
        padding: "28px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.3s ease",
      }}
    >
      {/* "COMING SOON" badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "var(--surface-secondary)",
          borderRadius: 20,
          padding: "3px 9px",
          border: "0.5px solid var(--border)",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            color: "var(--text-secondary)",
            opacity: 0.7,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Coming Soon
        </span>
      </div>

      {/* Plan name */}
      <div
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: "var(--text-secondary)",
          letterSpacing: "-0.015em",
          marginBottom: 16,
          paddingRight: 110,
        }}
      >
        Cloud
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--text-secondary)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          ~$9
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--text-secondary)",
            opacity: 0.7,
            marginLeft: 2,
          }}
        >
          /mo
        </span>
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: "var(--text-secondary)",
          opacity: 0.6,
          marginBottom: 24,
        }}
      >
        estimated · early access
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "0.5px solid var(--border)",
          marginBottom: 20,
        }}
      />

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
          marginBottom: 28,
        }}
      >
        {CLOUD.map((f) => (
          <FeatureRow key={f} label={f} muted />
        ))}
      </div>

      {/* CTA */}
      <a
        href="#docs"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "11px 0",
          border: "0.5px solid var(--border)",
          borderRadius: 8,
          textDecoration: "none",
          transition: "all 0.12s ease",
          backgroundColor: hov ? "var(--surface-secondary)" : "transparent",
          boxSizing: "border-box",
        } as React.CSSProperties}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: "var(--text-secondary)",
            letterSpacing: "-0.01em",
          }}
        >
          View Roadmap
        </span>
      </a>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function PricingSection() {
  return (
    <section id="pricing" className="dispatch-reveal" style={{ backgroundColor: "var(--bg)", paddingBottom: 96, transition: "background-color 0.3s ease" }}>
      <style>{`
        .dispatch-pricing-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        .dispatch-pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 720px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .dispatch-pricing-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="dispatch-pricing-inner">

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
            textAlign: "center",
          }}
        >
          Pricing
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
            margin: "0 0 40px",
            padding: 0,
            textAlign: "center",
            transition: "color 0.3s ease",
          }}
        >
          Start free. Always.
        </h2>

        {/* Cards */}
        <div className="dispatch-pricing-grid">
          <SelfHostedCard />
          <CloudCard />
        </div>

        {/* Footnote */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "var(--text-secondary)",
            opacity: 0.7,
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 500,
            margin: "24px auto 0",
            transition: "color 0.3s ease",
          }}
        >
          Byline is MIT licensed. The hosted version will be optional and will never
          replace the self-hosted option.
        </p>

      </div>
    </section>
  );
}
