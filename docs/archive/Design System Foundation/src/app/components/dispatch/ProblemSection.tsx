import React from "react";
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
  return (
    <div
      style={{
        backgroundColor: "#EDEAE2",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Icon size={18} color="#E85E2C" stroke={1.75} />
      <div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#0F0F0D",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "#6B6960",
            lineHeight: 1.6,
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
    <section className="dispatch-reveal" style={{ backgroundColor: "#F5F2EC", paddingBottom: 96 }}>
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
            color: "#A8A49A",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 20,
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
            color: "#0F0F0D",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            maxWidth: 560,
            margin: "0 0 14px",
            padding: 0,
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
            color: "#6B6960",
            lineHeight: 1.65,
            maxWidth: 480,
            margin: "0 0 40px",
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
