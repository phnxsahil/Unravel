import React, { useEffect } from "react";
import "./components/dispatch/animations.css";
import { Navbar } from "./components/dispatch/Navbar";
import { Hero } from "./components/dispatch/Hero";
import { ProblemSection } from "./components/dispatch/ProblemSection";
import { HowItWorksSection } from "./components/dispatch/HowItWorks";
import { FeatureSection } from "./components/dispatch/FeatureSection";
import { DemoSection } from "./components/dispatch/DemoSection";
import { IntegrationsSection } from "./components/dispatch/IntegrationsSection";
import { SocialProofSection } from "./components/dispatch/SocialProofSection";
import { PricingSection } from "./components/dispatch/PricingSection";
import { CTASection } from "./components/dispatch/CTASection";
import { Footer } from "./components/dispatch/Footer";
import { Stamp } from "./components/dispatch/Stamp";
import { Button } from "./components/dispatch/Button";
import { Badge } from "./components/dispatch/Badge";
import { Card } from "./components/dispatch/Card";
import { TerminalBlock } from "./components/dispatch/TerminalBlock";

// ─── Token data ──────────────────────────────────────────────────────────────

const colorTokens = [
  { name: "--dispatch-bg-primary", value: "#FAFAF8", label: "Background Primary", border: true },
  { name: "--dispatch-bg-secondary", value: "#F2F0EC", label: "Background Secondary", border: true },
  { name: "--dispatch-bg-dark", value: "#0F0F0D", label: "Background Dark", dark: true },
  { name: "--dispatch-bg-terminal", value: "#1A1A18", label: "Background Terminal", dark: true },
  { name: "--dispatch-text-primary", value: "#0F0F0D", label: "Text Primary", dark: true },
  { name: "--dispatch-text-secondary", value: "#6B6960", label: "Text Secondary", dark: true },
  { name: "--dispatch-text-tertiary", value: "#A8A49A", label: "Text Tertiary", dark: true },
  { name: "--dispatch-accent", value: "#E85E2C", label: "Accent / Stamp", dark: true },
  { name: "--dispatch-success", value: "#22C55E", label: "Success", dark: true },
];

// ─── Local helpers ────────────────────────────────────────────────────────────

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 28,
        paddingBottom: 14,
        borderBottom: "0.5px solid rgba(15,15,13,0.1)",
      }}
    >
      <span
        style={{
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 10,
          color: "#A8A49A",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {index}
      </span>
      <span
        style={{
          width: 1,
          height: 10,
          backgroundColor: "rgba(15,15,13,0.15)",
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: "#6B6960",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Section({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <SectionLabel index={index} label={label} />
      {children}
    </section>
  );
}

function ColorSwatch({
  name,
  value,
  label,
  border,
  dark,
}: {
  name: string;
  value: string;
  label: string;
  border?: boolean;
  dark?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          height: 52,
          borderRadius: 8,
          backgroundColor: value,
          border: border ? "0.5px solid rgba(15,15,13,0.12)" : "none",
        }}
      />
      <div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: "#0F0F0D",
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 10,
            color: "#A8A49A",
            marginTop: 3,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 10,
            color: "#C4C0B8",
            marginTop: 1,
            wordBreak: "break-all",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Scroll-triggered reveals ──────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Unobserve after first reveal so it doesn't flicker on scroll-back
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all section-reveal and bento-card targets
    document
      .querySelectorAll(".dispatch-reveal, .dispatch-bento-card")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#F5F2EC",
        minHeight: "100vh",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        /* ── Global editorial overrides ────────────────────────────────── */

        /* Warm body font */
        body {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: #F5F2EC;
          color: #1A1916;
        }

        /* Display headings use Space Grotesk */
        h1, h2, h3 {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          letter-spacing: -0.04em;
        }

        /* Sharper inputs/buttons — editorial, not SaaS-rounded */
        input, textarea, button, select {
          border-radius: 2px !important;
        }

        /* Monospace labels keep their stack */
        .dispatch-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        @media (max-width: 767px) {
          .dispatch-main { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <ProblemSection />

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <FeatureSection />

      {/* ── Demo ───────────────────────────────────────────────────────────── */}
      <DemoSection />

      {/* ── Integrations ───────────────────────────────────────────────────── */}
      <IntegrationsSection />

      {/* ── Social proof ───────────────────────────────────────────────────── */}
      <SocialProofSection />

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <CTASection />

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── Design system reference ────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "0.5px solid rgba(15,15,13,0.08)",
          margin: "0 40px",
        }}
      />
      <div
        className="dispatch-main"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "72px 40px 120px",
        }}
      >

        {/* Hero */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 88,
            gap: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <Badge variant="accent">Open-source · AI Content Engine</Badge>
            <div
              style={{
                fontFamily: "Instrument Serif, Georgia, serif",
                fontStyle: "italic",
                fontSize: 58,
                fontWeight: 400,
                color: "#0F0F0D",
                letterSpacing: "-0.01em",
                lineHeight: 1.05,
                margin: "18px 0 20px",
              }}
            >
              Foundation
            </div>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 400,
                color: "#6B6960",
                lineHeight: 1.65,
                maxWidth: 500,
                margin: 0,
              }}
            >
              Visual primitives for Dispatch — the tokens, type scale, and component
              patterns that hold the product together. Wire service meets hacker terminal.
            </p>

            {/* Layout specs */}
            <div
              style={{
                marginTop: 32,
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              {[
                ["Max width", "1080px"],
                ["Padding", "40px / 20px"],
                ["Section pad", "72px"],
                ["Card radius", "12px"],
                ["Border weight", "0.5px"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                      fontSize: 10,
                      color: "#A8A49A",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                      fontSize: 12,
                      color: "#0F0F0D",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stamp hero placement */}
          <div
            style={{
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Stamp size={88} />
            <span
              style={{
                fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                fontSize: 10,
                color: "#C4C0B8",
                letterSpacing: "0.06em",
              }}
            >
              8s rotation
            </span>
          </div>
        </div>

        {/* 01 / Color ──────────────────────────────────────────────────────── */}
        <Section index="01" label="Color Tokens">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
              gap: 20,
            }}
          >
            {colorTokens.map((t) => (
              <ColorSwatch key={t.name} {...t} />
            ))}
            {/* Border token — special case */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  height: 52,
                  borderRadius: 8,
                  backgroundColor: "#F5F2EC",
                  border: "4px solid rgba(15,15,13,0.1)",
                  boxSizing: "border-box",
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#0F0F0D",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  Border
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 10,
                    color: "#A8A49A",
                    marginTop: 3,
                  }}
                >
                  rgba(15,15,13,0.1)
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 10,
                    color: "#C4C0B8",
                    marginTop: 1,
                  }}
                >
                  --dispatch-border
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 02 / Typography ─────────────────────────────────────────────────── */}
        <Section index="02" label="Typography">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Display */}
            <div
              style={{
                padding: "28px 32px",
                backgroundColor: "#EDEAE2",
                borderRadius: 12,
                border: "0.5px solid rgba(15,15,13,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#A8A49A",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}
              >
                Display — Instrument Serif italic · one-word hero moments only
              </div>
              <div
                style={{
                  fontFamily: "Instrument Serif, Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 56,
                  fontWeight: 400,
                  color: "#0F0F0D",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.0,
                }}
              >
                Publish.
              </div>
            </div>

            {/* Headings */}
            <div
              style={{
                padding: "28px 32px",
                backgroundColor: "#EDEAE2",
                borderRadius: 12,
                border: "0.5px solid rgba(15,15,13,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#A8A49A",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Headings — Inter 500 · tracking -0.02em
              </div>
              {[
                { size: 36, spec: "Inter 500 / 36px / -0.02em" },
                { size: 28, spec: "Inter 500 / 28px / -0.02em" },
                { size: 22, spec: "Inter 500 / 22px / -0.02em" },
              ].map(({ size, spec }) => (
                <div
                  key={size}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 20,
                    paddingTop: 10,
                    borderTop: "0.5px solid rgba(15,15,13,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                      fontSize: size,
                      fontWeight: 500,
                      color: "#0F0F0D",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                      flex: 1,
                    }}
                  >
                    Automated. Fast. Yours.
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                      fontSize: 10,
                      color: "#A8A49A",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {spec}
                  </div>
                </div>
              ))}
            </div>

            {/* Body + Mono side by side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  padding: "28px 32px",
                  backgroundColor: "#EDEAE2",
                  borderRadius: 12,
                  border: "0.5px solid rgba(15,15,13,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 10,
                    color: "#A8A49A",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Body — Inter 400 · 14px / 1.65
                </div>
                <p
                  style={{
                    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#0F0F0D",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Dispatch turns your GitHub commits, changelogs, and release
                  notes into polished content — on schedule, in your voice,
                  sent to every channel at once.
                </p>
              </div>

              <div
                style={{
                  padding: "28px 32px",
                  backgroundColor: "#1A1A18",
                  borderRadius: 12,
                  border: "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 10,
                    color: "#6B6960",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Mono — JetBrains Mono · 12–13px / 1.75
                </div>
                <p
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 12,
                    fontWeight: 400,
                    color: "#D4CFC6",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {"$ dispatch generate --source git\n"}
                  {"  ✓ 12 commits analyzed\n"}
                  {"  → 3 drafts queued\n"}
                  {"  → publishing in 4h"}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* 03 / Buttons ────────────────────────────────────────────────────── */}
        <Section index="03" label="Button">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Light surface */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                padding: "24px 28px",
                backgroundColor: "#EDEAE2",
                borderRadius: 12,
                border: "0.5px solid rgba(15,15,13,0.08)",
              }}
            >
              <Button variant="primary">Publish now</Button>
              <Button variant="primary" size="sm">Generate draft</Button>
              <Button variant="ghost">View changelog</Button>
              <Button variant="ghost" size="sm">Settings</Button>
              <div
                style={{
                  marginLeft: "auto",
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#A8A49A",
                  letterSpacing: "0.04em",
                }}
              >
                primary · ghost · size sm
              </div>
            </div>

            {/* Dark surface */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                padding: "24px 28px",
                backgroundColor: "#0F0F0D",
                borderRadius: 12,
                border: "0.5px solid rgba(255,255,255,0.06)",
              }}
            >
              <Button variant="primary">Publish now</Button>
              <Button variant="ghost" dark>View changelog</Button>
              <Button variant="ghost" dark size="sm">Settings</Button>
              <div
                style={{
                  marginLeft: "auto",
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#6B6960",
                  letterSpacing: "0.04em",
                }}
              >
                on dark bg
              </div>
            </div>
          </div>
        </Section>

        {/* 04 / Badge ──────────────────────────────────────────────────────── */}
        <Section index="04" label="Badge / Pill">
          <div
            style={{
              padding: "28px 28px",
              backgroundColor: "#EDEAE2",
              borderRadius: 12,
              border: "0.5px solid rgba(15,15,13,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Light bg */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Badge variant="default">Open Source</Badge>
              <Badge variant="accent">New Release</Badge>
              <Badge variant="success">Published</Badge>
              <Badge variant="dark">Beta</Badge>
              <Badge variant="default">AI Content Engine</Badge>
              <Badge variant="accent">v2.4.0</Badge>
              <div
                style={{
                  marginLeft: "auto",
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#A8A49A",
                }}
              >
                default · accent · success · dark
              </div>
            </div>

            {/* On dark strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                padding: "16px 20px",
                backgroundColor: "#0F0F0D",
                borderRadius: 8,
              }}
            >
              <Badge variant="accent">New Release</Badge>
              <Badge variant="success">Published</Badge>
              <Badge variant="dark">Beta</Badge>
            </div>
          </div>
        </Section>

        {/* 05 / Card ───────────────────────────────────────────────────────── */}
        <Section index="05" label="Card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <Card
              variant="light"
              meta="Content Engine"
              title="Weekly changelog published to 3 channels"
              description="Dispatch analyzed 12 commits and 4 merged PRs to generate a polished update. No edits required."
              timestamp="2 minutes ago"
            />
            <Card
              variant="dark"
              meta="Performance"
              title="Your most-read post hit 4.2k views"
              description="The thread on your new auth system performed 3× better than your trailing average. Dispatch queued a follow-up."
              timestamp="Just now"
            />
          </div>

          {/* Anatomy note */}
          <div
            style={{
              marginTop: 14,
              padding: "14px 20px",
              backgroundColor: "#EDEAE2",
              borderRadius: 8,
              border: "0.5px solid rgba(15,15,13,0.08)",
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            {[
              ["border-radius", "12px"],
              ["padding", "20px 24px"],
              ["border", "0.5px rgba(15,15,13,0.1)"],
              ["dark surface", "#1A1A18"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 10,
                    color: "#A8A49A",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {k}
                </span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: 10,
                    color: "#0F0F0D",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 06 / Terminal Block ─────────────────────────────────────────────── */}
        <Section index="06" label="Terminal Block">
          <TerminalBlock label="dispatch.sh">
            {`$ dispatch init\n\n  ✓  Connected to GitHub (8 repos detected)\n  ✓  AI model configured — claude-sonnet-4-6\n  ✓  Channels set — linkedin, twitter, ghost\n\n  → Ready. Run 'dispatch generate' to draft your first post.\n\n$ dispatch generate --source git --since 7d\n\n  Analyzing commits........  done (12 commits, 4 PRs)\n  Drafting post.............  done\n  Estimated read time......  2 min\n\n  Draft saved → .dispatch/drafts/2026-06-16.md`}
          </TerminalBlock>

          <div
            style={{
              marginTop: 14,
              padding: "14px 20px",
              backgroundColor: "#EDEAE2",
              borderRadius: 8,
              border: "0.5px solid rgba(15,15,13,0.08)",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                fontSize: 10,
                color: "#A8A49A",
                letterSpacing: "0.04em",
              }}
            >
              bg #1A1A18 · font JetBrains Mono 12px / 1.75 · border 0.5px rgba(255,255,255,0.08) · radius 12px
            </span>
          </div>
        </Section>

        {/* 07 / Stamp ──────────────────────────────────────────────────────── */}
        <Section index="07" label="Stamp Badge">
          <div
            style={{
              padding: "52px 28px",
              backgroundColor: "#EDEAE2",
              borderRadius: 12,
              border: "0.5px solid rgba(15,15,13,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 56,
              flexWrap: "wrap",
            }}
          >
            {/* 64px on light */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Stamp size={64} />
              <span
                style={{
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#A8A49A",
                  letterSpacing: "0.06em",
                }}
              >
                64px · light bg
              </span>
            </div>

            {/* 96px on light */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Stamp size={96} />
              <span
                style={{
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#A8A49A",
                  letterSpacing: "0.06em",
                }}
              >
                96px · large
              </span>
            </div>

            {/* 64px on dark */}
            <div
              style={{
                padding: "28px 32px",
                backgroundColor: "#0F0F0D",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Stamp size={64} />
              <span
                style={{
                  fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                  fontSize: 10,
                  color: "#6B6960",
                  letterSpacing: "0.06em",
                }}
              >
                64px · dark bg
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "16px 20px",
              backgroundColor: "#EDEAE2",
              borderRadius: 8,
              border: "0.5px solid rgba(15,15,13,0.08)",
            }}
          >
            <p
              style={{
                fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
                fontSize: 11,
                color: "#6B6960",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              The Stamp is the product's most recognizable mark. Used in hero and CTA sections
              only. 64px default · dashed accent border · 8s linear rotation on load · circular
              text around rim in Inter 600.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}
