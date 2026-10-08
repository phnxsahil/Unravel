import React, { useState } from "react";
import { IconCheck, IconBrandGithub } from "@tabler/icons-react";

// ─── Feature lists ────────────────────────────────────────────────────────────

const SELF_HOSTED = [
  "Full LangGraph pipeline",
  "All 5 agents (strategist, 4 writers, critic)",
  "pgvector project memory",
  "Composio MCP integration",
  "GitHub & voice note ingestion",
  "Unlimited dispatches",
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
        color={muted ? "#A8A49A" : "#E85E2C"}
        stroke={2}
        style={{ flexShrink: 0, marginTop: 2 }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: muted ? "#A8A49A" : "#0F0F0D",
          lineHeight: 1.5,
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
        backgroundColor: "#F5F2EC",
        border: "1px solid rgba(232,94,44,0.28)",
        borderRadius: 14,
        padding: "28px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        boxShadow:
          "0 0 0 4px rgba(232,94,44,0.06), 0 4px 24px rgba(15,15,13,0.06)",
      }}
    >
      {/* "MOST POPULAR" badge — top-right */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "#E85E2C",
          borderRadius: 20,
          padding: "3px 9px",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            color: "#F5F2EC",
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
          color: "#0F0F0D",
          letterSpacing: "-0.015em",
          marginBottom: 16,
          paddingRight: 100, /* clear the badge */
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
            color: "#E85E2C",
            letterSpacing: "-0.03em",
            lineHeight: 1,
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
          color: "#A8A49A",
          marginBottom: 24,
        }}
      >
        forever · MIT license
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "0.5px solid rgba(15,15,13,0.08)",
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
        {SELF_HOSTED.map((f) => (
          <FeatureRow key={f} label={f} />
        ))}
      </div>

      {/* CTA */}
      <a
        href="#github"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "11px 0",
          backgroundColor: hov ? "#D14E23" : "#E85E2C",
          borderRadius: 8,
          textDecoration: "none",
          transition: "background-color 0.12s ease",
          boxSizing: "border-box",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <IconBrandGithub size={14} color="#F5F2EC" stroke={2} />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#F5F2EC",
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
        backgroundColor: "#EDEAE2",
        border: "0.5px solid rgba(15,15,13,0.08)",
        borderRadius: 14,
        padding: "28px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* "COMING SOON" badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "rgba(15,15,13,0.06)",
          borderRadius: 20,
          padding: "3px 9px",
          border: "0.5px solid rgba(15,15,13,0.1)",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            color: "#A8A49A",
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
          color: "#6B6960",
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
            color: "#6B6960",
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
            color: "#A8A49A",
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
          color: "#A8A49A",
          marginBottom: 24,
        }}
      >
        estimated · early access
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "0.5px solid rgba(15,15,13,0.07)",
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
        href="#waitlist"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "11px 0",
          backgroundColor: "transparent",
          border: `0.5px solid ${hov ? "rgba(15,15,13,0.35)" : "rgba(15,15,13,0.18)"}`,
          borderRadius: 8,
          textDecoration: "none",
          transition: "border-color 0.12s ease, background-color 0.12s ease",
          backgroundColor: hov ? "#EEECE8" : "transparent",
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
            color: "#6B6960",
            letterSpacing: "-0.01em",
          }}
        >
          Join waitlist
        </span>
      </a>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function PricingSection() {
  return (
    <section className="dispatch-reveal" style={{ backgroundColor: "#F5F2EC", paddingBottom: 96 }}>
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
            color: "#A8A49A",
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
            color: "#0F0F0D",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 40px",
            padding: 0,
            textAlign: "center",
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
            color: "#A8A49A",
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 500,
            margin: "24px auto 0",
          }}
        >
          Dispatch is MIT licensed. The hosted version will be optional and will never
          replace the self-hosted option.
        </p>

      </div>
    </section>
  );
}
