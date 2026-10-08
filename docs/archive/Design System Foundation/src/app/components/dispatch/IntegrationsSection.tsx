import React from "react";

// ─── Hub diagram constants ────────────────────────────────────────────────────

const CX = 270;  // Composio center X
const CY = 140;  // Composio center Y
const GAP_CENTER = 32;  // gap at the Composio end
const GAP_NODE   = 26;  // gap at the platform-node end

interface PlatformNode {
  id:       string;
  x:        number;  // rect origin
  y:        number;
  w:        number;
  h:        number;
  label:    string;
  badge:    string;
  badgeBg:  string;
  cx:       number;  // center of rect
  cy:       number;
}

const NODES: PlatformNode[] = [
  { id: "linkedin", x:  20, y:  42, w: 84, h: 40, label: "LinkedIn", badge: "in", badgeBg: "#0A66C2", cx: 62,  cy: 62  },
  { id: "x",       x: 436, y:  42, w: 84, h: 40, label: "X / Twitter", badge: "X",  badgeBg: "#0F0F0D", cx: 478, cy: 62  },
  { id: "reddit",  x:  20, y: 198, w: 84, h: 40, label: "Reddit",   badge: "r/", badgeBg: "#FF4500", cx: 62,  cy: 218 },
  { id: "threads", x: 436, y: 198, w: 84, h: 40, label: "Threads",  badge: "Th", badgeBg: "#1C1C1E", cx: 478, cy: 218 },
];

function spokeEndpoints(nodeCx: number, nodeCy: number) {
  const dx = nodeCx - CX;
  const dy = nodeCy - CY;
  const mag = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / mag;
  const uy = dy / mag;
  return {
    x1: CX + ux * GAP_CENTER,
    y1: CY + uy * GAP_CENTER,
    x2: nodeCx - ux * GAP_NODE,
    y2: nodeCy - uy * GAP_NODE,
  };
}

// ─── SVG Hub Diagram ──────────────────────────────────────────────────────────

function HubDiagram() {
  return (
    <svg
      viewBox="0 0 540 280"
      style={{ width: "100%", maxWidth: 560, height: "auto", display: "block", margin: "0 auto" }}
      aria-hidden="true"
    >
      {/* ── Dashed spokes ─────────────────────────────────────────────── */}
      {NODES.map((n) => {
        const { x1, y1, x2, y2 } = spokeEndpoints(n.cx, n.cy);
        return (
          <line
            key={n.id + "-spoke"}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke="rgba(232,94,44,0.4)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* ── Platform nodes ────────────────────────────────────────────── */}
      {NODES.map((n) => (
        <g key={n.id}>
          {/* Card background */}
          <rect
            x={n.x} y={n.y} width={n.w} height={n.h}
            rx={8}
            fill="#EDEAE2"
            stroke="rgba(15,15,13,0.08)"
            strokeWidth="0.5"
          />
          {/* Colored badge square */}
          <rect
            x={n.x + 8} y={n.y + 10}
            width={20} height={20}
            rx={4}
            fill={n.badgeBg}
          />
          <text
            x={n.x + 18} y={n.y + 21}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fontWeight="700"
            fill="white"
            fontFamily="'IBM Plex Sans', system-ui, sans-serif"
          >
            {n.badge}
          </text>
          {/* Platform label */}
          <text
            x={n.x + 35} y={n.y + 21}
            dominantBaseline="middle"
            fontSize={11}
            fill="#0F0F0D"
            fontFamily="'IBM Plex Sans', system-ui, sans-serif"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* ── Center node — Composio MCP ────────────────────────────────── */}
      {/* Outer glow ring */}
      <rect
        x={189} y={108}
        width={162} height={64}
        rx={32}
        fill="rgba(232,94,44,0.06)"
        stroke="rgba(232,94,44,0.18)"
        strokeWidth="6"
      />
      {/* Main pill */}
      <rect
        x={192} y={111}
        width={156} height={58}
        rx={29}
        fill="#F5F2EC"
        stroke="#E85E2C"
        strokeWidth="1"
      />
      {/* Composio wordmark */}
      <text
        x={270} y={133}
        textAnchor="middle"
        fontSize={12}
        fontWeight="500"
        fill="#E85E2C"
        fontFamily="'IBM Plex Sans', system-ui, sans-serif"
        letterSpacing="-0.01em"
      >
        Composio
      </text>
      {/* MCP sub-label */}
      <text
        x={270} y={151}
        textAnchor="middle"
        fontSize={9}
        fill="rgba(232,94,44,0.5)"
        fontFamily="JetBrains Mono, IBM Plex Mono, monospace"
        letterSpacing="0.1em"
      >
        MCP
      </text>
    </svg>
  );
}

// ─── Feature pills ────────────────────────────────────────────────────────────

const CAPABILITY_PILLS = [
  "✓  LinkedIn: post, comment, article",
  "✓  X: tweet, thread, reply",
  "✓  Reddit: post to subreddit, choose flair",
];

function CapabilityPill({ label }: { label: string }) {
  const checkEnd = label.indexOf("  ");
  const check = label.slice(0, checkEnd);
  const rest  = label.slice(checkEnd + 2);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        border: "0.5px solid rgba(15,15,13,0.14)",
        borderRadius: 20,
        backgroundColor: "#EDEAE2",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: "#22C55E",
        }}
      >
        {check}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: "#6B6960",
        }}
      >
        {rest}
      </span>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function IntegrationsSection() {
  return (
    <section className="dispatch-reveal" style={{ backgroundColor: "#F5F2EC", paddingBottom: 96 }}>
      <style>{`
        .dispatch-integ-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        .dispatch-integ-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 28px;
        }
        @media (max-width: 767px) {
          .dispatch-integ-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }
      `}</style>

      <div className="dispatch-integ-inner">

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
          }}
        >
          Integrations
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
            maxWidth: 560,
            margin: "0 0 12px",
            padding: 0,
          }}
        >
          No OAuth hell. Composio handles the hard part.
        </h2>

        {/* Sub */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "#6B6960",
            lineHeight: 1.65,
            maxWidth: 520,
            margin: "0 0 44px",
          }}
        >
          Composio's MCP servers connect your AI agents to LinkedIn, X, and Reddit in
          minutes — no custom OAuth flows, no API key juggling.
        </p>

        {/* Hub diagram */}
        <HubDiagram />

        {/* Capability pills */}
        <div className="dispatch-integ-pills">
          {CAPABILITY_PILLS.map((p) => (
            <CapabilityPill key={p} label={p} />
          ))}
        </div>

        {/* Footnote */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            color: "#A8A49A",
            lineHeight: 1.6,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 600,
            margin: "20px auto 0",
          }}
        >
          Threads posts via Meta Graph API directly. Composio MCP deprecation notice:
          using the stable HTTP endpoint. Fully self-hostable.
        </p>

      </div>
    </section>
  );
}
