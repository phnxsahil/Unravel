import React, { useState } from "react";
import {
  IconBrain,
  IconMicrophoneOff,
  IconLayoutGrid,
  IconAlertCircle,
} from "@tabler/icons-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CARDS = [
  {
    Icon: IconBrain,
    title: "The memory gap",
    body: "Every social media tool forgets your project context the moment you close the tab. You re-explain fltrd.tech in every prompt.",
  },
  {
    Icon: IconMicrophoneOff,
    title: "Voice decay",
    body: "AI rewrites strip your personality. Posts start sounding like a press release about your own project. You sound like everyone else.",
  },
  {
    Icon: IconLayoutGrid,
    title: "Format fatigue",
    body: "LinkedIn storytelling, X threads, Reddit depth, Threads casual — the same update needs a different frame four times. Nobody does all four.",
  },
  {
    Icon: IconAlertCircle,
    title: "The Reddit trap",
    body: "Self-promo blindness gets you removed before you've said anything useful. Reddit needs a genuinely different approach, not just shorter copy.",
  },
];

// ─── Problem card ─────────────────────────────────────────────────────────────

function ProblemCard({
  Icon,
  title,
  body,
}: {
  Icon: React.FC<{ size: number; color: string; stroke: number }>;
  title: string;
  body: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: hov ? "var(--surface-secondary)" : "var(--surface)",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 180,
        border: `0.5px solid ${hov ? "var(--text-primary)" : "var(--border)"}`,
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov ? "0 8px 20px rgba(15,15,13,0.04)" : "none",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Icon size={18} color="#E85E2C" stroke={1.75} />
      <div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 6,
            transition: "color 0.2s ease",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            transition: "color 0.2s ease",
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function ProblemSection() {
  return (
    <section className="dispatch-reveal" style={{ backgroundColor: "var(--bg)", paddingBottom: 96, transition: "background-color 0.3s ease" }}>
      <style>{`
        .dispatch-problem-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        .dispatch-problem-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: stretch;
        }
        @media (max-width: 767px) {
          .dispatch-problem-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-problem-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="dispatch-problem-inner">

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
            marginBottom: 8,
            transition: "color 0.3s ease",
          }}
        >
          The Problem
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
            maxWidth: 560,
            margin: "0 0 14px",
            padding: 0,
            transition: "color 0.3s ease",
          }}
        >
          Building in public shouldn't be a second job.
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
          You ship. You forget to post. Or you post the same thing everywhere and get buried.
        </p>

        {/* 2×2 card grid */}
        <div className="dispatch-problem-grid">
          {CARDS.map((card) => (
            <ProblemCard key={card.title} {...card} />
          ))}
        </div>

      </div>
    </section>
  );
}
