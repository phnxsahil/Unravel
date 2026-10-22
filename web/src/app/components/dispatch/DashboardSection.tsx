import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconBrandLinkedin, IconBrandX, IconBrandReddit, IconBrandThreads,
  IconBrain, IconChessKnight, IconShieldCheck, IconSend,
  IconTrendingUp, IconTrendingDown,
  IconCheck, IconClock, IconLoader2, IconBolt,
} from "@tabler/icons-react";
import {
  listDispatches, listProjects, createDispatch, getDrafts, patchDraft, streamGeneration, getVoiceProfile, type DispatchRead, type DraftRead,
} from "../../api";
import { DashboardSidebar } from "./DashboardSidebar";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";
import { ProjectDetailPage } from "./ProjectDetailPage";
import { VoiceProfileSection } from "./VoiceProfileSection";
import { OnboardingWizard } from "./OnboardingWizard";

// ─── Types ──────────────────────────────────────────────────────────────────

type AgentStatus = "idle" | "running" | "done" | "waiting";
type PostStatus  = "posted" | "draft" | "flagged" | "pending";

// ─── Data ───────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Posts Published", value: 47, trend: +12, unit: "", icon: IconSend, color: "#E85E2C" },
  { label: "Avg Critic Score",  value: 8.4, trend: +0.3, unit: "/10", icon: IconShieldCheck, color: "#22C55E" },
  { label: "Platforms Live",    value: 4, trend: 0, unit: "", icon: IconBolt, color: "#6366F1" },
  { label: "Reach This Month",  value: "11.2K", trend: +34, unit: "", icon: IconTrendingUp, color: "#F59E0B" },
];

const AGENTS = [
  { id: "strategist", label: "Strategist",       icon: IconChessKnight, color: "#E85E2C", desc: "Decides angle & platforms" },
  { id: "linkedin",   label: "LinkedIn Writer",  icon: IconBrandLinkedin, color: "#0A66C2", desc: "Narrative, long-form depth" },
  { id: "x",         label: "X Writer",          icon: IconBrandX, color: "#FAFAF8", desc: "Compressed, thread-ready" },
  { id: "reddit",    label: "Reddit Writer",     icon: IconBrandReddit, color: "#FF4500", desc: "Anti-promo, genuine depth" },
  { id: "critic",    label: "Critic",            icon: IconShieldCheck, color: "#22C55E", desc: "Scores + voice checks" },
];

const RECENT_BYLINES = [
  { id: 1, milestone: "Shipped pgvector semantic search on fltrd.tech", platforms: ["LinkedIn","X","Reddit","Threads"], score: 8.6, status: "posted" as PostStatus, time: "2h ago" },
  { id: 2, milestone: "Fixed chunking strategy \u2014 30% error rate drop", platforms: ["LinkedIn","X"], score: 9.1, status: "posted" as PostStatus, time: "1d ago" },
  { id: 3, milestone: "Refactored auth layer to use Supabase", platforms: ["LinkedIn","Reddit"], score: 7.4, status: "draft" as PostStatus, time: "2d ago" },
  { id: 4, milestone: "Added Composio MCP integration for posting", platforms: ["LinkedIn","X","Threads"], score: 8.9, status: "posted" as PostStatus, time: "3d ago" },
  { id: 5, milestone: "Deployed voice profile extraction pipeline", platforms: ["X"], score: 6.2, status: "flagged" as PostStatus, time: "4d ago" },
  { id: 6, milestone: "First 100 users on the waitlist", platforms: ["LinkedIn","X","Reddit","Threads"], score: 9.3, status: "posted" as PostStatus, time: "5d ago" },
];

const WEEK_DATA = [
  { week: "W1", LinkedIn: 3, X: 5, Reddit: 2, Threads: 3 },
  { week: "W2", LinkedIn: 4, X: 6, Reddit: 1, Threads: 4 },
  { week: "W3", LinkedIn: 2, X: 4, Reddit: 3, Threads: 2 },
  { week: "W4", LinkedIn: 5, X: 7, Reddit: 4, Threads: 5 },
  { week: "W5", LinkedIn: 3, X: 5, Reddit: 2, Threads: 3 },
  { week: "W6", LinkedIn: 6, X: 8, Reddit: 3, Threads: 6 },
  { week: "W7", LinkedIn: 4, X: 9, Reddit: 5, Threads: 4 },
  { week: "W8", LinkedIn: 7, X: 10, Reddit: 4, Threads: 7 },
];

const SCORE_TREND = [7.1, 7.6, 7.4, 8.0, 8.2, 7.9, 8.4, 8.6];

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2", X: "#FAFAF8", Reddit: "#FF4500", Threads: "#1C1C1E",
};

const STATUS_CONFIG: Record<PostStatus, { color: string; label: string }> = {
  posted:  { color: "#22C55E", label: "Posted" },
  draft:   { color: "#F59E0B", label: "Draft" },
  flagged: { color: "#E85E2C", label: "Flagged" },
  pending: { color: "#6366F1", label: "Pending" },
};

// ─── CSS keyframes as a constant to avoid template literal issues ────────────

const DASH_STYLES = [
  "@keyframes byline-pulse-ring {",
  "  0% { transform: scale(1); opacity: 0.8; }",
  "  100% { transform: scale(2.2); opacity: 0; }",
  "}",
  ".byline-spin { animation: byline-spin-anim 0.9s linear infinite; }",
  "@keyframes byline-spin-anim { to { transform: rotate(360deg); } }",
  "@keyframes byline-pulse-glow {",
  "  0% { box-shadow: 0 0 0 0 rgba(232,94,44,0.5); }",
  "  70% { box-shadow: 0 0 0 6px rgba(232,94,44,0); }",
  "  100% { box-shadow: 0 0 0 0 rgba(232,94,44,0); }",
  "}",
  ".byline-dash-grid {",
  "  display: flex;",
  "  max-width: 100%;",
  "  min-height: calc(100vh - 60px);",
  "}",
  ".byline-dash-right { display: flex; flex-direction: column; gap: 20px; flex: 1; padding: 32px 40px; max-width: 860px; }",
  ".byline-dash-card {",
  "  background: rgba(255,255,255,0.03);",
  "  border: 0.5px solid rgba(255,255,255,0.08);",
  "  border-radius: 12px;",
  "  padding: 20px;",
  "  transition: all 0.3s ease;",
  "}",
  ".byline-stats-grid {",
  "  display: grid;",
  "  grid-template-columns: repeat(4, 1fr);",
  "  gap: 12px;",
  "}",
  "@media (max-width: 767px) {",
  "  .byline-dash-grid { grid-template-columns: 1fr !important; padding: 0 20px !important; }",
  "  .byline-stats-grid { grid-template-columns: 1fr 1fr !important; }",
  "}",
  "@media (max-width: 500px) {",
  "  .byline-stats-grid { grid-template-columns: 1fr !important; }",
  "}",
].join("\n");

// ─── Small Shared Components ─────────────────────────────────────────────────

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const icons: Record<string, React.ElementType> = {
    LinkedIn: IconBrandLinkedin, X: IconBrandX, Reddit: IconBrandReddit, Threads: IconBrandThreads,
  };
  const Ic = icons[platform] || IconSend;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size + 6, height: size + 6, borderRadius: 4,
      backgroundColor: PLATFORM_COLORS[platform] || "#333",
      flexShrink: 0,
    }}>
      <Ic size={size - 2} color="#fff" stroke={2} />
    </span>
  );
}

function MiniToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(!active); }}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: "pointer",
        backgroundColor: active ? "#E85E2C" : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background-color 0.2s ease", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: active ? 19 : 3, width: 14, height: 14,
        borderRadius: "50%", backgroundColor: "#fff",
        transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

function MiniSlider({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", cursor: "pointer" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pctClick = (e.clientX - rect.left) / rect.width;
          onChange(Math.round(min + pctClick * (max - min)));
        }}
      >
        <div style={{ width: pct + "%", height: "100%", borderRadius: 2, backgroundColor: "#E85E2C", transition: "width 0.1s ease" }} />
        <div style={{ position: "absolute", top: -4, left: pct + "%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", backgroundColor: "#E85E2C", border: "2px solid #1A1A18", transition: "left 0.1s ease" }} />
      </div>
    </div>
  );
}

// ─── Stats Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, trend, unit, icon: Icon, color }: typeof STATS[0]) {
  const [displayed, setDisplayed] = useState(0);
  const isNum = typeof value === "number";
  useEffect(() => {
    if (!isNum) return;
    const target = value as number;
    const step = target / 40;
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayed(parseFloat(current.toFixed(1)));
      if (current >= target) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [value, isNum]);

  return (
    <div style={{
      backgroundColor: "rgba(255,255,255,0.035)", borderRadius: 10,
      border: "0.5px solid rgba(255,255,255,0.08)", padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 12, transition: "all 0.2s ease",
      cursor: "default",
    }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.055)")}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.035)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={color} stroke={1.75} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: 28, fontWeight: 600, color: "#F5F4F0", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {isNum ? (Number.isInteger(value) ? displayed.toFixed(0) : displayed.toFixed(1)) : value}
        </span>
        {unit && <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{unit}</span>}
      </div>
      {trend !== 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {trend > 0 ? <IconTrendingUp size={12} color="#22C55E" stroke={2} /> : <IconTrendingDown size={12} color="#E85E2C" stroke={2} />}
          <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: trend > 0 ? "#22C55E" : "#E85E2C" }}>
            {trend > 0 ? "+" : ""}{trend}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Agent Pipeline ──────────────────────────────────────────────────────────

function AgentPipeline({
  statuses,
  step,
  onRun,
}: {
  statuses: AgentStatus[];
  step: number;
  onRun: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Agent Pipeline</span>
        <button
          onClick={onRun}
          disabled={step >= 0}
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: step >= 0 ? "rgba(255,255,255,0.3)" : "#E85E2C",
            background: "none", border: "0.5px solid currentColor", borderRadius: 4, padding: "3px 8px",
            cursor: step >= 0 ? "default" : "pointer", transition: "all 0.12s ease", display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {step >= 0 ? <><IconLoader2 size={10} className="byline-spin" /> running</> : "\u25b6 run"}
        </button>
      </div>
      {AGENTS.map((agent, i) => {
        const status = statuses[i] ?? "idle";
        const Icon = agent.icon;
        const dotColor = status === "done" ? "#22C55E" : status === "running" ? "#E85E2C" : status === "waiting" ? "#F59E0B" : "rgba(255,255,255,0.2)";
        return (
          <div key={agent.id}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
              backgroundColor: status === "running" ? "rgba(232,94,44,0.08)" : "rgba(255,255,255,0.025)",
              border: "0.5px solid " + (status === "running" ? "rgba(232,94,44,0.25)" : "rgba(255,255,255,0.06)"),
              transition: "all 0.3s ease",
            }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor, transition: "background-color 0.3s ease" }} />
                {status === "running" && (
                  <div style={{ position: "absolute", top: -3, left: -3, width: 14, height: 14, borderRadius: "50%", border: "1.5px solid rgba(232,94,44,0.4)", animation: "byline-pulse-ring 1.2s ease-out infinite" }} />
                )}
              </div>
              <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: agent.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={13} color={agent.color} stroke={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500, color: status === "idle" ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.85)", lineHeight: 1.2, transition: "color 0.3s ease" }}>{agent.label}</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1.3, marginTop: 1 }}>{agent.desc}</div>
              </div>
              {status === "done" && <IconCheck size={12} color="#22C55E" stroke={2.5} />}
              {status === "running" && <IconLoader2 size={12} color="#E85E2C" stroke={2} className="byline-spin" />}
            </div>
            {i < AGENTS.length - 1 && (
              <div style={{ marginLeft: 15, width: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Agent Customization Panel ───────────────────────────────────────────────

function AgentCustomPanel({
  platforms,
  onPlatformsChange,
}: {
  platforms: Record<string, boolean>;
  onPlatformsChange: React.Dispatch<React.SetStateAction<{
    LinkedIn: boolean;
    X: boolean;
    Reddit: boolean;
    Threads: boolean;
  }>>;
}) {
  const [expanded, setExpanded] = useState(true);
  const [voiceStrength, setVoiceStrength] = useState(7);
  const [criticFloor, setCriticFloor] = useState(7);
  const [frequency, setFrequency] = useState<"low" | "medium" | "high">("medium");

  return (
    <div style={{
      backgroundColor: "rgba(255,255,255,0.025)", borderRadius: 10,
      border: "0.5px solid rgba(255,255,255,0.08)", overflow: "hidden",
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <IconAdjustments size={13} color="#E85E2C" stroke={1.75} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Agent Config</span>
        </div>
        {expanded ? <IconChevronDown size={12} color="rgba(255,255,255,0.3)" /> : <IconChevronRight size={12} color="rgba(255,255,255,0.3)" />}
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Platform toggles */}
          <div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Platforms</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {(Object.entries(platforms) as [string, boolean][]).map(([plat, active]) => (
                <div key={plat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <PlatformIcon platform={plat} size={14} />
                    <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)" }}>{plat}</span>
                  </div>
                  <MiniToggle active={active} onChange={v => onPlatformsChange(prev => ({ ...prev, [plat]: v }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Voice strength */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Voice Strength</div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#E85E2C" }}>{voiceStrength}/10</span>
            </div>
            <MiniSlider value={voiceStrength} min={1} max={10} onChange={setVoiceStrength} />
          </div>

          {/* Critic floor */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Critic Score Floor</div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#22C55E" }}>{criticFloor}/10</span>
            </div>
            <MiniSlider value={criticFloor} min={1} max={10} onChange={setCriticFloor} />
          </div>

          {/* Posting frequency */}
          <div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Posting Frequency</div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["low", "medium", "high"] as const).map(f => (
                <button key={f} onClick={() => setFrequency(f)} style={{
                  flex: 1, padding: "5px 0", borderRadius: 5, cursor: "pointer",
                  backgroundColor: frequency === f ? "rgba(232,94,44,0.15)" : "transparent",
                  border: "0.5px solid " + (frequency === f ? "rgba(232,94,44,0.4)" : "rgba(255,255,255,0.1)"),
                  fontFamily: "'IBM Plex Sans'", fontSize: 11,
                  color: frequency === f ? "#E85E2C" : "rgba(255,255,255,0.3)",
                  transition: "all 0.12s ease",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SVG Analytics \u2014 Bar Chart ───────────────────────────────────────────────

function BarChart() {
  const maxVal = 28;
  const platformKeys: Array<keyof typeof PLATFORM_COLORS> = ["LinkedIn", "X", "Reddit", "Threads"];
  const platformColorsLocal = { LinkedIn: "#0A66C2", X: "#6366F1", Reddit: "#FF4500", Threads: "#F59E0B" };
  const barW = 6;
  const gap = 2;
  const groupW = platformKeys.length * (barW + gap);
  const chartW = WEEK_DATA.length * (groupW + 8);
  const chartH = 80;

  return (
    <div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Posts / Week by Platform</div>
      <div style={{ overflowX: "auto" }}>
        <svg width={chartW + 20} height={chartH + 20} style={{ display: "block" }}>
          {WEEK_DATA.map((week, wi) => {
            const groupX = wi * (groupW + 8) + 10;
            let barX = groupX;
            return (
              <g key={week.week}>
                {platformKeys.map((plat) => {
                  const val = week[plat as keyof typeof week] as number;
                  const h = (val / maxVal) * chartH;
                  const y = chartH - h;
                  const x = barX;
                  barX += barW + gap;
                  return (
                    <rect
                      key={plat} x={x} y={y} width={barW} height={h}
                      rx={2} fill={platformColorsLocal[plat as keyof typeof platformColorsLocal]}
                      opacity={0.75}
                    >
                      <animate attributeName="height" from="0" to={h} dur="0.6s" begin={wi * 0.08 + "s"} fill="freeze" />
                      <animate attributeName="y" from={chartH} to={y} dur="0.6s" begin={wi * 0.08 + "s"} fill="freeze" />
                    </rect>
                  );
                })}
                <text x={groupX + groupW / 2} y={chartH + 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)" fontFamily="IBM Plex Mono, monospace">{week.week}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
        {platformKeys.map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: platformColorsLocal[p as keyof typeof platformColorsLocal] }} />
            <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Analytics \u2014 Score Trend Line ───────────────────────────────────────

function ScoreTrend() {
  const W = 320; const H = 60;
  const minV = 6.5; const maxV = 9.5;
  const pts = SCORE_TREND.map((v, i) => ({
    x: (i / (SCORE_TREND.length - 1)) * (W - 20) + 10,
    y: H - ((v - minV) / (maxV - minV)) * (H - 10) - 5,
  }));
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + " " + p.x + " " + p.y).join(" ");
  const fill = path + " L " + pts[pts.length - 1].x + " " + H + " L " + pts[0].x + " " + H + " Z";
  const len = pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const pp = pts[i - 1];
    return acc + Math.sqrt((p.x - pp.x) ** 2 + (p.y - pp.y) ** 2);
  }, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Voice Score \u2014 8 Week Trend</div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#22C55E", fontWeight: 500 }}>{"\u2191"} 8.6</span>
      </div>
      <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#scoreGrad)" />
        <path d={path} fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-dashoffset" from={len} to="0" dur="1.2s" fill="freeze" />
          <animate attributeName="stroke-dasharray" from={"0 " + len} to={len + " 0"} dur="1.2s" fill="freeze" />
        </path>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1A1A18" stroke="#22C55E" strokeWidth={1.5}>
            <animate attributeName="r" from="0" to="3" dur="0.3s" begin={(0.9 + i * 0.08) + "s"} fill="freeze" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ─── Drafts Database & Fallback Generator ─────────────────────────────────

const DRAFTS_DATABASE: Record<string, Record<string, { body: string; score: number; checks: string[] }>> = {
  "Shipped pgvector semantic search on fltrd.tech": {
    LinkedIn: {
      body: "We just shipped pgvector semantic search on fltrd.tech.\n\nMost content tools write generic AI slop. To prevent this, Byline uses retrieval grounding: it searches Postgres for the 5 most similar past bylines and feeds them to the writer agent.\n\nResult: The drafts sound exactly like my past writing. Context is everything.",
      score: 8.6,
      checks: ["voice match ✓", "no AI slop detected ✓"],
    },
    X: {
      body: "Shipped pgvector semantic search on fltrd.tech.\n\nWe retrieve the top 5 past posts before generating drafts. Hallucinations dropped, voice matches. Simple Postgres index beats prompt engineering every time.",
      score: 8.4,
      checks: ["punchy ✓", "under 280 chars ✓"],
    },
    Reddit: {
      body: "I shipped pgvector semantic search on my side project, fltrd.tech. It retrieves past posts to ground our multi-agent writer pipeline. Hallucinations are down to 8%, latency added is only 80ms. Open to feedback on the architecture!",
      score: 8.8,
      checks: ["r/SideProject fit ✓", "no promo links ✓"],
    },
    Threads: {
      body: "pgvector semantic search is live on fltrd.tech. grounding the agent on past posts dropped hallucination rates from 30% to 8%. nice.",
      score: 8.5,
      checks: ["casual tone ✓"],
    }
  },
  "Fixed chunking strategy — 30% error rate drop": {
    LinkedIn: {
      body: "We just fixed our chunking strategy, leading to a 30% drop in retrieval errors.\n\nIn LLM apps, chunk size is the most critical knob. Too large and you dilute the vector; too small and you lose context. We settled on recursive character splitting with a 150-token overlap.\n\nTechnical details in comments.",
      score: 9.1,
      checks: ["voice match ✓", "high technical depth ✓"],
    },
    X: {
      body: "Recursive character chunking + 150-token overlap cut our LLM retrieval errors by 30%.\n\nDon't just change prompts. Optimize your data ingestion first.",
      score: 9.0,
      checks: ["punchy ✓"],
    }
  },
  "Refactored auth layer to use Supabase": {
    LinkedIn: {
      body: "We just refactored our auth layer to use Supabase.\n\nLegacy custom auth code was over 200 lines and prone to security edge cases. Supabase Auth cut that down to 10 lines of frontend React code. Sometimes shipping faster means deleting code, not writing it.",
      score: 7.4,
      checks: ["voice match ✓", "clean styling ✓"],
    },
    Reddit: {
      body: "Just finished refactoring our custom auth layer to Supabase. Cut 200 lines of spaghetti code. If you're building a side project in 2026, don't write custom auth. It's not worth the risk.",
      score: 7.4,
      checks: ["indie hacker voice ✓"],
    }
  },
  "Added Composio MCP integration for posting": {
    LinkedIn: {
      body: "We just integrated Composio MCP tools into Byline.\n\nInstead of managing custom API credentials and OAuth flows for X, LinkedIn, and Reddit, Composio handles authentication as a managed service. Our agent can execute posts with zero friction.\n\nSaves weeks of OAuth headache.",
      score: 8.9,
      checks: ["voice match ✓", "value add ✓"],
    },
    X: {
      body: "Added Composio MCP integration. No more managing OAuth keys for social posting. The agent executes posts via Composio toolset. Massive time saver.",
      score: 8.8,
      checks: ["punchy ✓"],
    },
    Threads: {
      body: "integrated composio for auto posting. no oauth setup needed. agents are officially distributing themselves now.",
      score: 8.9,
      checks: ["casual tone ✓"],
    }
  },
  "Deployed voice profile extraction pipeline": {
    X: {
      body: "Just deployed a voice profile extraction pipeline. It scans your 10 past posts to build a structured profile. Ensures drafts match your vocabulary and line breaks.",
      score: 6.2,
      checks: ["under 280 chars ✓"],
    }
  },
  "First 100 users on the waitlist": {
    LinkedIn: {
      body: "We just hit our first 100 users on the Byline waitlist.\n\nNo paid ads, no product hunt launch, just posting milestones in public. Building in public is the most underrated GTM channel for technical founders. Thank you to everyone who signed up!",
      score: 9.3,
      checks: ["voice match ✓", "humble ✓"],
    },
    X: {
      body: "Hit 100 waitlist signups for Byline in 48h. Zero marketing spend, just shipping in public. Let's go.",
      score: 9.2,
      checks: ["punchy ✓"],
    },
    Reddit: {
      body: "I built a tool that writes developer milestone drafts and got 100 signups on the waitlist in two days just from sharing my build updates. Here is the GTM strategy that actually worked for technical users.",
      score: 9.4,
      checks: ["r/SideProject fit ✓"],
    },
    Threads: {
      body: "100 signups on the waitlist already. building in public actually works.",
      score: 9.3,
      checks: ["casual tone ✓"],
    }
  }
};

function generateFallbackDrafts(milestone: string): Record<string, { body: string; score: number; checks: string[] }> {
  const words = milestone.trim().split(/\s+/);
  const action = words[0] || "Shipped";
  const rest = words.slice(1).join(" ") || "new updates";

  return {
    LinkedIn: {
      body: `We just ${action.toLowerCase()} ${rest}.\n\nMost content generated by AI sounds like copy-paste marketing slop. To prevent this, Byline uses pgvector semantic search over past posts to match my personal voice.\n\nHere is what we did:\n→ Logged update: "${milestone}"\n→ Retextured using multi-agent graphs.\n\nNo marketing fluff. Just technical shipping.`,
      score: 8.7,
      checks: ["voice match ✓", "no AI slop detected ✓"],
    },
    X: {
      body: `Just ${action.toLowerCase()} ${rest}.\n\nPGVector embeddings + local caching solved the hallucination issue. 30% error rates dropped to 8%.\n\nLessons learned:\n1. Prompting is weak, grounding is strong.\n2. Keep context window clean.\n\n#buildinpublic`,
      score: 8.5,
      checks: ["punchy ✓", "under 280 chars ✓"],
    },
    Reddit: {
      body: `I ${action.toLowerCase()} ${rest} on my self-hosted project, Byline.\n\nWe were seeing high hallucination rates when our agents generated drafts from simple milestone logs. Switched to pgvector similarity retrieval to ground them in past posts. Hallucinations fell from 30% to 8%. latency is +80ms. open to code reviews!`,
      score: 8.9,
      checks: ["r/SideProject fit ✓", "no direct links ✓"],
    },
    Threads: {
      body: `${milestone.toLowerCase()}. hallucination rate down to 8% using pgvector. grounding is king.`,
      score: 8.6,
      checks: ["casual tone ✓"],
    }
  };
}

// ─── Bylines Table ────────────────────────────────────────────────────────

function BylinesTable({
  bylines,
  onOpenDraft,
}: {
  bylines: typeof RECENT_BYLINES;
  onOpenDraft: (milestone: string, platform: string, id: number) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Bylines</span>
        <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{bylines.length} total</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 50px 80px 32px", gap: 8, padding: "6px 12px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
          {["Milestone","Platforms","Score","Status",""].map(h => (
            <span key={h} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {bylines.map(row => {
          const isOpen = expanded === row.id;
          const sc = STATUS_CONFIG[row.status];
          return (
            <div key={row.id} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)", transition: "background-color 0.12s ease", cursor: "pointer", backgroundColor: isOpen ? "rgba(255,255,255,0.03)" : "transparent" }}
              onClick={() => setExpanded(isOpen ? null : row.id)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 50px 80px 32px", gap: 8, padding: "10px 12px", alignItems: "center" }}>
                <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" } as React.CSSProperties}>{row.milestone}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {row.platforms.map(p => <PlatformIcon key={p} platform={p} size={12} />)}
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: row.score >= 8.5 ? "#22C55E" : row.score >= 7 ? "#F59E0B" : "#E85E2C" }}>{row.score}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: sc.color }} />
                  <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sc.label}</span>
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{row.time}</span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 12px 12px", display: "flex", gap: 6, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                  {row.platforms.map(p => (
                    <button key={p} onClick={() => onOpenDraft(row.milestone, p, row.id)} style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                      backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5,
                      fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.12s ease",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#F5F4F0"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}>
                      <PlatformIcon platform={p} size={11} /> View {p} draft
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function DashboardSection() {
  const [bylines, setBylines] = useState(RECENT_BYLINES);
  const [newMilestoneText, setNewMilestoneText] = useState("");
  const [realDispatches, setRealDispatches] = useState<DispatchRead[]>([]);
  const [realDrafts, setRealDrafts] = useState<Record<string, DraftRead[]>>({});
  const [activeSidebarItem, setActiveSidebarItem] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState("");
  const currentDispatchRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Command palette state ──────────────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const paletteCommands = [
    { id: "log-milestone", label: "Log new milestone", group: "Actions", action: () => { document.querySelector<HTMLTextAreaElement>('[placeholder*="Log a milestone"]')?.focus(); } },
    { id: "run-pipeline", label: "Run pipeline", shortcut: "⏎", group: "Actions", action: () => { startPipeline(); } },
    { id: "approve-last", label: "Approve last draft", group: "Actions", action: () => { handleApproveDraft(); } },
    { id: "go-overview", label: "Go to Overview", shortcut: "G O", group: "Navigate", action: () => setActiveSidebarItem("overview") },
    { id: "go-analytics", label: "Go to Analytics", group: "Navigate", action: () => setActiveSidebarItem("analytics") },
    { id: "go-voice", label: "Go to Voice Profile", group: "Navigate", action: () => setActiveSidebarItem("voice-profile") },
    { id: "toggle-storyteller", label: "Toggle Storyteller mode", group: "Agent skills", action: () => toggleSkill("Storyteller Mode") },
    { id: "toggle-reddit", label: "Toggle Reddit Stealth", group: "Agent skills", action: () => toggleSkill("Reddit Stealth") },
    { id: "open-integrations", label: "Open integrations", group: "Settings", action: () => setActiveSidebarItem("integrations") },
    { id: "edit-env", label: "Edit .env", group: "Settings", action: () => { /* placeholder */ } },
  ];

  // Fetch real dispatches + projects on mount
  useEffect(() => {
    (async () => {
      try {
        const projects = await listProjects();
        if (projects.length > 0) setCurrentProjectId(projects[0].id);
        const dispatches = await listDispatches();
        setRealDispatches(dispatches);
        // Fetch drafts for each dispatch
        const draftsMap: Record<string, DraftRead[]> = {};
        await Promise.all(dispatches.map(async (d) => {
          try {
            draftsMap[d.id] = await getDrafts(d.id);
          } catch { /* ignore */ }
        }));
        setRealDrafts(draftsMap);
        // Merge into bylines list
        if (dispatches.length > 0) {
          const realRows = dispatches.map((d, i) => ({
            id: 1000 + i,
            milestone: d.body,
            platforms: d.suggested_platforms?.length ? d.suggested_platforms : ["LinkedIn"],
            score: 0,
            status: (d.hold_reason ? "flagged" : "draft") as PostStatus,
            time: new Date(d.created_at).toLocaleDateString(),
          }));
          setBylines((prev) => [...realRows, ...prev]);
        }
      } catch { /* API not available, use mock data */ }
    })();
  }, []);

  // ── Onboarding check ───────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const [projectsRes, voiceRes] = await Promise.all([
          listProjects(),
          getVoiceProfile().catch(() => null),
        ]);
        if (projectsRes.length === 0 && !voiceRes) {
          setShowOnboarding(true);
        }
      } catch {
        // If API unavailable, check localStorage flag
        const dismissed = localStorage.getItem("byline-onboarding-dismissed");
        if (!dismissed) setShowOnboarding(true);
      }
    })();
  }, []);
  
  const [platforms, setPlatforms] = useState({
    LinkedIn: true,
    X: true,
    Reddit: true,
    Threads: false,
  });

  const [activeSkills, setActiveSkills] = useState<Record<string, boolean>>({
    "Storyteller Mode": true,
    "Thread Architect": false,
    "Reddit Stealth": true,
    "Ghost Mode": false,
    "Velocity Mode": false,
  });

  const [pipelineStep, setPipelineStep] = useState(-1);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(["idle", "idle", "idle", "idle", "idle"]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedDraft, setSelectedDraft] = useState<{
    id: number;
    milestone: string;
    platform: string;
    body: string;
    score: number;
    checks: string[];
    status: PostStatus;
  } | null>(null);

  const toggleSkill = (name: string) =>
    setActiveSkills(prev => ({ ...prev, [name]: !prev[name] }));

  // Decorative pipeline animation (AgentPipeline "run" button)
  const runPipelineAnimation = () => {
    if (isGenerating) return;
    setAgentStatuses(["waiting", "waiting", "waiting", "waiting", "waiting"]);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step > AGENTS.length) {
        clearInterval(interval);
        setAgentStatuses(["done", "done", "done", "done", "done"]);
        return;
      }
      setAgentStatuses(prev => prev.map((s, i) =>
        i === step - 1 ? "done" : i === step ? "running" : s
      ));
    }, 700);
  };

  const handleGenerationEvent = useCallback((event: Record<string, unknown>) => {
    const platformMap: Record<string, number> = { strategist: 0, linkedin: 1, x: 2, reddit: 3, critic: 4 };
    const node = event.node as string;
    const status = event.status as string;
    const idx = platformMap[node] ?? -1;

    if (node === "strategist") {
      setAgentStatuses(prev => prev.map((s, i) => i === 0 ? (status === "done" ? "done" : "running") : s));
      if (status === "done") {
        setTimeout(() => {
          setAgentStatuses(prev => prev.map((s, i) => i === 0 ? "done" : "running"));
        }, 300);
      }
    } else if (idx >= 1 && node !== "critic") {
      if (status === "done") {
        setAgentStatuses(prev => prev.map((s, i) => i === idx ? "done" : s));
      }
    } else if (node === "critic" && status === "done") {
      setAgentStatuses(prev => prev.map(() => "done"));
    }
  }, []);

  const startPipeline = async () => {
    if (isGenerating || !newMilestoneText.trim()) return;
    setIsGenerating(true);
    setAgentStatuses(["running", "idle", "idle", "idle", "idle"]);

    try {
      const created = await createDispatch({
        project_id: currentProjectId,
        body: newMilestoneText,
        source: "manual",
      });

      currentDispatchRef.current = created.id;

      const newRow = {
        id: Date.now(),
        milestone: newMilestoneText,
        platforms: created.suggested_platforms?.length ? created.suggested_platforms : ["LinkedIn"],
        score: 0,
        status: "draft" as PostStatus,
        time: "Just now",
      };
      setBylines(prev => [newRow, ...prev]);
      setNewMilestoneText("");

      abortRef.current = streamGeneration(
        created.id,
        (event) => handleGenerationEvent(event),
        () => { /* error */ },
        () => {
          setIsGenerating(false);
          setAgentStatuses(prev => prev.map(() => "done"));
          // Refresh drafts
          getDrafts(created.id).then(drafts => {
            setRealDrafts(prev => ({ ...prev, [created.id]: drafts }));
          }).catch(() => {});
        }
      );
    } catch {
      setIsGenerating(false);
      setAgentStatuses(["idle", "idle", "idle", "idle", "idle"]);
    }
  };

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleOpenDraft = async (milestone: string, platform: string, id: number) => {
    const matchedB = bylines.find(b => b.id === id);
    const status = matchedB ? matchedB.status : ("draft" as PostStatus);

    // Try real API drafts first
    const dispatchIdx = id >= 1000 ? id - 1000 : -1;
    const realDispatch = dispatchIdx >= 0 && dispatchIdx < realDispatches.length
      ? realDispatches[dispatchIdx] : null;

    if (realDispatch && realDrafts[realDispatch.id]) {
      const platformDraft = realDrafts[realDispatch.id].find(d =>
        d.platform.toLowerCase() === platform.toLowerCase()
      );
      if (platformDraft) {
        setSelectedDraft({
          id,
          milestone,
          platform,
          body: platformDraft.body,
          score: platformDraft.critic_score ?? 0,
          checks: [platformDraft.critic_note ? `note: ${platformDraft.critic_note}` : "generated"],
          status,
        });
        return;
      }
    }

    // Fall back to mock drafts
    const db = DRAFTS_DATABASE[milestone] || generateFallbackDrafts(milestone);
    const dft = db[platform] || generateFallbackDrafts(milestone)[platform] || {
      body: `Draft for ${platform} has been queued.`,
      score: 8.0,
      checks: ["queued ✓"],
    };

    setSelectedDraft({
      id,
      milestone,
      platform,
      body: dft.body,
      score: dft.score,
      checks: dft.checks,
      status,
    });
  };

  const handleApproveDraft = async () => {
    if (!selectedDraft) return;

    // Try to PATCH via API if we have a real draft
    const dispatchIdx = selectedDraft.id >= 1000 ? selectedDraft.id - 1000 : -1;
    const realDispatch = dispatchIdx >= 0 && dispatchIdx < realDispatches.length
      ? realDispatches[dispatchIdx] : null;

    if (realDispatch && realDrafts[realDispatch.id]) {
      const platformDraft = realDrafts[realDispatch.id].find(d =>
        d.platform.toLowerCase() === selectedDraft.platform.toLowerCase()
      );
      if (platformDraft) {
        try {
          await patchDraft(platformDraft.id, { status: "approved" });
        } catch { /* fallback */ }
      }
    }

    setBylines(prev => prev.map(b => {
      if (b.id === selectedDraft.id) {
        return { ...b, status: "posted" as PostStatus };
      }
      return b;
    }));
    setSelectedDraft(prev => prev ? { ...prev, status: "posted" } : null);
  };

  return (
    <section style={{ backgroundColor: "var(--bg-terminal)", height: "100vh", display: "flex", flexDirection: "column", transition: "background-color 0.3s ease" }}>
      <style dangerouslySetInnerHTML={{ __html: DASH_STYLES }} />

      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => { setShowOnboarding(false); localStorage.setItem("byline-onboarding-dismissed", "true"); }}
          onSkip={() => { setShowOnboarding(false); localStorage.setItem("byline-onboarding-dismissed", "true"); }}
        />
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="byline-dash-grid">

          {/* ── Left sidebar (new two-level design) ──────────────────────────────── */}
          <DashboardSidebar
            activeItem={activeSidebarItem}
            onNavigate={setActiveSidebarItem}
          />

          {/* ── Right main ────────────────────────────────────────────────────────── */}
          <div className="byline-dash-right">

          {activeSidebarItem === "voice-profile" ? (
            <VoiceProfileSection onBack={() => setActiveSidebarItem("overview")} />
          ) : /^[0-9a-f-]{36}$/.test(activeSidebarItem) ? (
            <ProjectDetailPage projectId={activeSidebarItem} onBack={() => setActiveSidebarItem("overview")} />
          ) : (
            <>

          {/* Stats row */}
          <div className="byline-stats-grid">
            {STATS.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Analytics */}
          <div className="byline-dash-card" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <BarChart />
            <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
              <ScoreTrend />
            </div>
          </div>

          {/* Recent bylines */}
          <div className="byline-dash-card" style={{ padding: "20px 0" }}>
            <div style={{ padding: "0 20px" }}>
              <BylinesTable bylines={bylines} onOpenDraft={handleOpenDraft} />
            </div>
          </div>

          {/* Quick byline input */}
          <div className="byline-dash-card">
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>New Byline</div>
            <textarea
              value={newMilestoneText}
              onChange={e => setNewMilestoneText(e.target.value)}
              placeholder="Log a milestone... e.g. 'Shipped auth refactor — switched to Supabase, cut 200 lines of auth code'"
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 8,
                color: "rgba(255,255,255,0.75)", fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 13, lineHeight: 1.65, padding: "10px 12px", resize: "none", outline: "none",
                transition: "border-color 0.12s ease",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(232,94,44,0.45)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Pipeline will auto-select best platforms</span>
              <button
                onClick={startPipeline}
                disabled={isGenerating || !newMilestoneText.trim()}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 18px",
                  backgroundColor: (isGenerating || !newMilestoneText.trim()) ? "rgba(232,94,44,0.3)" : "#E85E2C",
                  border: "none", borderRadius: 6, cursor: (isGenerating || !newMilestoneText.trim()) ? "default" : "pointer",
                  fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 500, color: "#F5F2EC",
                  transition: "background-color 0.12s ease",
                }}
                onMouseEnter={e => {
                  if (!isGenerating && newMilestoneText.trim()) {
                    e.currentTarget.style.backgroundColor = "#C7501E";
                  }
                }}
                onMouseLeave={e => {
                  if (!isGenerating && newMilestoneText.trim()) {
                    e.currentTarget.style.backgroundColor = "#E85E2C";
                  }
                }}
              >
                {isGenerating ? (
                  <IconLoader2 size={13} color="#F5F2EC" stroke={2} className="byline-spin" />
                ) : (
                  <IconSend size={13} color="#F5F2EC" stroke={2} />
                )}
                {isGenerating ? "Bylining..." : "Publish"}
              </button>
            </div>
          </div>

            </>
          )}
          </div>
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────────── */}
      <StatusBar />

      {/* ── Command Palette ────────────────────────────────────────────────── */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={paletteCommands} />

      {/* Draft View/Edit Modal */}
      {selectedDraft && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)", padding: 20
        }} onClick={() => setSelectedDraft(null)}>
          <div style={{
            backgroundColor: "#1A1A18", border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 12, width: "100%", maxWidth: 540, display: "flex",
            flexDirection: "column", overflow: "hidden", color: "#F5F4F0"
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.01)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PlatformIcon platform={selectedDraft.platform} size={14} />
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 500 }}>
                  {selectedDraft.platform} Draft
                </span>
              </div>
              <button
                onClick={() => setSelectedDraft(null)}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                  fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", width: 20, height: 20
                }}
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Milestone context */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Milestone context</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{selectedDraft.milestone}</div>
              </div>

              {/* Draft Body */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Draft Body</div>
                <textarea
                  value={selectedDraft.body}
                  onChange={e => {
                    const text = e.target.value;
                    setSelectedDraft(prev => prev ? { ...prev, body: text } : null);
                  }}
                  rows={6}
                  style={{
                    width: "100%", boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.02)",
                    border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 6,
                    color: "rgba(255,255,255,0.85)", fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 12, lineHeight: 1.6, padding: 10, outline: "none", resize: "vertical"
                  }}
                />
              </div>

              {/* Critic Score / Checks */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.025)",
                border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 6
              }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {selectedDraft.checks.map(c => (
                    <span key={c} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                      {c}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>critic score</span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
                    color: selectedDraft.score >= 8.5 ? "#22C55E" : selectedDraft.score >= 7 ? "#F59E0B" : "#E85E2C"
                  }}>{selectedDraft.score}</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
              padding: "12px 18px", borderTop: "0.5px solid rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.01)"
            }}>
              <button
                onClick={() => setSelectedDraft(null)}
                style={{
                  padding: "6px 14px", backgroundColor: "transparent",
                  border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 5,
                  fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "rgba(255,255,255,0.5)",
                  cursor: "pointer", transition: "all 0.12s ease"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#F5F4F0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Close
              </button>

              {selectedDraft.status === "posted" ? (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", backgroundColor: "#22C55E1a",
                  border: "0.5px solid #22C55E40", borderRadius: 5,
                  fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#22C55E",
                  fontWeight: 500
                }}>
                  <IconCheck size={12} stroke={2.5} /> Shipped
                </div>
              ) : (
                <button
                  onClick={handleApproveDraft}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", backgroundColor: "#E85E2C",
                    border: "none", borderRadius: 5,
                    fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#F5F2EC",
                    fontWeight: 500, cursor: "pointer", transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#C7501E")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E85E2C")}
                >
                  <IconSend size={12} stroke={2} /> Approve & Ship
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
