import {
  IconDatabase,
  IconFingerprint,
  IconChessKnight,
  IconShieldCheck,
  IconTerminal2,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandReddit,
  IconBrandThreads,
} from "@tabler/icons-react";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Tag({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 10,
        fontWeight: 400,
        color: dark ? "var(--text-secondary)" : "var(--text-secondary)",
        opacity: dark ? 0.6 : 0.7,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
  );
}

function CardTitle({
  children,
  dark,
  size = 14,
}: {
  children: React.ReactNode;
  dark?: boolean;
  size?: number;
}) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: size,
        fontWeight: 500,
        color: "var(--text-primary)",
        letterSpacing: "-0.015em",
        lineHeight: 1.25,
        marginBottom: 8,
        transition: "color 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}

function CardBody({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        color: "var(--text-secondary)",
        lineHeight: 1.6,
        margin: 0,
        transition: "color 0.3s ease",
      }}
    >
      {children}
    </p>
  );
}

// ─── Platform preview (for Card 3) ───────────────────────────────────────────

const PLATFORMS = [
  {
    Icon: IconBrandLinkedin,
    bg: "#0A66C2",
    name: "LinkedIn",
    text: "Shipped semantic search on fltrd.tech using pgvector. The part nobody talks about: caching the right queries before users feel the lag.",
  },
  {
    Icon: IconBrandX,
    bg: "var(--bg-terminal)",
    name: "X",
    text: "postgres → pgvector → shipped. skipped the dedicated vector db. turns out you didn't need it.",
  },
  {
    Icon: IconBrandReddit,
    bg: "#FF4500",
    name: "Reddit",
    text: "Built semantic search without a vector service — what I wish I knew about pgvector indexing (no promo, just the caveats)",
  },
  {
    Icon: IconBrandThreads,
    bg: "#1C1C1E",
    name: "Threads",
    text: "added semantic search to fltrd.tech lol. pgvector is genuinely underrated. fast as hell.",
  },
];

function PlatformPreview({
  Icon,
  bg,
  name,
  text,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  bg: string;
  name: string;
  text: string;
}) {
  const isX = name === "X";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        backgroundColor: "var(--surface)",
        borderRadius: 8,
        border: "0.5px solid var(--border)",
        alignItems: "flex-start",
        transition: "all 0.3s ease",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: 5,
          backgroundColor: bg,
          color: "#fff",
          marginTop: 1,
        }}
      >
        <Icon size={12} />
      </span>
      <p
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          margin: 0,
          transition: "color 0.3s ease",
          /* clamp to 2 lines */
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Card 3 — One dispatch. Four formats. (dark, wide) ───────────────────────

function CardThree({ "data-index": dataIndex }: { "data-index"?: number }) {
  return (
    <div
      className="dispatch-bento-card dispatch-feat-3"
      data-index={dataIndex}
      style={{
        backgroundColor: "var(--bg-terminal)",
        borderRadius: 14,
        border: "0.5px solid var(--border)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.3s ease",
      }}
    >
      <Tag label="Distribution" dark />
      <CardTitle dark size={17}>
        One milestone. Four formats.
      </CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
        {PLATFORMS.map((p) => (
          <PlatformPreview key={p.name} {...p} />
        ))}
      </div>
      <p
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          color: "var(--text-secondary)",
          opacity: 0.6,
          lineHeight: 1.55,
          fontStyle: "italic",
          margin: "14px 0 0",
        }}
      >
        Not copy-paste — each one is genuinely reframed for the platform.
      </p>
    </div>
  );
}

// ─── Card 6 — Capture from anywhere (wide, with terminal) ────────────────────

function CardSix({ "data-index": dataIndex }: { "data-index"?: number }) {
  return (
    <div
      className="dispatch-bento-card dispatch-feat-6"
      data-index={dataIndex}
      style={{
        backgroundColor: "var(--surface)",
        borderRadius: 14,
        border: "0.5px solid var(--border)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.3s ease",
      }}
    >
      <Tag label="Ingestion" />
      <div style={{ marginBottom: 8 }}>
        <IconTerminal2 size={20} color="var(--accent)" stroke={1.75} />
      </div>
      <CardTitle>Capture from anywhere</CardTitle>
      <CardBody>
        Dashboard quick-capture, voice note via Whisper, or GitHub webhook — auto-detects
        releases and significant PRs. Or just type what you shipped.
      </CardBody>

      {/* Mini terminal */}
      <div
        style={{
          marginTop: 16,
          backgroundColor: "var(--bg-terminal)",
          borderRadius: 8,
          overflow: "hidden",
          border: "0.5px solid var(--border)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "7px 12px",
            borderBottom: "0.5px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "border-color 0.3s ease",
          }}
        >
          {(["#E85E2C", "#F5A623", "#22C55E"] as const).map((c) => (
            <div
              key={c}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: c,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        <div style={{ padding: "12px 14px" }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>$</span>
            {" byline log "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              "added waitlist to fltrd.tech, 47 signups in 6h"
            </span>
          </span>
          <br />
          <span
            style={{
              fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: "#22C55E",
            }}
          >
            ✓ logged · strategist queued
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Generic light card ───────────────────────────────────────────────────────

interface LightCardProps {
  className: string;
  tag: string;
  Icon: React.FC<{ size: number; color: string; stroke: number }>;
  title: string;
  body: string;
  "data-index"?: number;
}

function LightCard({ className, tag, Icon, title, body, "data-index": dataIndex }: LightCardProps) {
  return (
    <div
      className={`dispatch-bento-card ${className}`}
      data-index={dataIndex}
      style={{
        backgroundColor: "var(--surface-secondary)",
        borderRadius: 14,
        border: "0.5px solid var(--border)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.3s ease",
      }}
    >
      <Tag label={tag} />
      <div style={{ marginBottom: 10 }}>
        <Icon size={20} color="var(--accent)" stroke={1.75} />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardBody>{body}</CardBody>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function FeatureSection() {
  return (
    <section id="features" className="dispatch-reveal" style={{ backgroundColor: "var(--bg)", paddingBottom: 96, transition: "background-color 0.3s ease" }}>
      <style>{`
        .dispatch-feat-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }

        /* 6-column bento grid */
        .dispatch-feat-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        /* Row 1: equal halves (3 + 3) */
        .dispatch-feat-1 { grid-column: span 3; }
        .dispatch-feat-2 { grid-column: span 3; }

        /* Row 2: wide + narrow (4 + 2) */
        .dispatch-feat-3 { grid-column: span 4; }
        .dispatch-feat-4 { grid-column: span 2; }

        /* Row 3: narrow + wide (2 + 4) */
        .dispatch-feat-5 { grid-column: span 2; }
        .dispatch-feat-6 { grid-column: span 4; }

        /* Mobile: single column */
        @media (max-width: 767px) {
          .dispatch-feat-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-feat-grid {
            grid-template-columns: 1fr !important;
          }
          .dispatch-feat-1,
          .dispatch-feat-2,
          .dispatch-feat-3,
          .dispatch-feat-4,
          .dispatch-feat-5,
          .dispatch-feat-6 {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      <div className="dispatch-feat-inner">

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
          Features
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
          A wire room for everything you ship.
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
            margin: "0 0 32px",
            transition: "color 0.3s ease",
          }}
        >
          All the context, none of the copy-paste.
        </p>

        {/* Bento grid */}
        <div className="dispatch-feat-grid">

          {/* Row 1 — equal halves */}
          <LightCard
            className="dispatch-feat-1"
            tag="Memory Layer"
            Icon={IconDatabase}
            title="Persistent project memory"
            body="pgvector store of all your projects — stacks, milestones, metrics. Every draft draws on real context, not a blank slate."
            data-index={0}
          />
          <LightCard
            className="dispatch-feat-2"
            tag="Voice Profile"
            Icon={IconFingerprint}
            title="Your voice, not AI voice"
            body="Feed it 10 of your old posts. It learns your open structure, what you'd never say, how long your paragraphs run. Critic flags generic phrasing."
            data-index={1}
          />

          {/* Row 2 — wide dark card + narrow */}
          <CardThree data-index={2} />
          <LightCard
            className="dispatch-feat-4"
            tag="Strategy"
            Icon={IconChessKnight}
            title="Strategist agent"
            body="Decides whether something is even worth posting, what angle, which platforms. Not every commit needs a LinkedIn post."
            data-index={3}
          />

          {/* Row 3 — narrow + wide card with terminal */}
          <LightCard
            className="dispatch-feat-5"
            tag="Quality"
            Icon={IconShieldCheck}
            title="Critic agent"
            body="Scores every draft 1–10. Checks voice match. For Reddit, checks if it reads as self-promo — if so, rewrites the framing."
            data-index={4}
          />
          <CardSix data-index={5} />

        </div>
      </div>
    </section>
  );
}
