import React, { useState, useEffect } from "react";
import {
  IconBrandGithub, IconPlus, IconX, IconSend, IconCheck,
  IconBrandLinkedin, IconBrandX, IconBrandReddit, IconBrandThreads,
  IconTrendingUp, IconTrendingDown,
} from "@tabler/icons-react";
import Avatar from "boring-avatars";
import { listProjects, listDispatches, type Project, type DispatchRead } from "../../api";

// ─── Platform helpers ───────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2", X: "#FAFAF8", Reddit: "#FF4500", Threads: "#1C1C1E",
};
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  LinkedIn: IconBrandLinkedin, X: IconBrandX, Reddit: IconBrandReddit, Threads: IconBrandThreads,
};

function PlatformIcon({ platform, size = 14 }: { platform: string; size?: number }) {
  const Ic = PLATFORM_ICONS[platform] || IconSend;
  const color = PLATFORM_COLORS[platform] || "#333";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size + 4, height: size + 4, borderRadius: 3, backgroundColor: color + "30", flexShrink: 0 }}>
      <Ic size={size - 2} color={color} stroke={2} />
    </span>
  );
}

// ─── Tag input ──────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput(""); }
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 8px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, minHeight: 30 }}>
      {tags.map((t) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 3, backgroundColor: "rgba(240,165,0,0.1)", border: "0.5px solid rgba(240,165,0,0.2)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#F0A500" }}>
          {t}
          <span onClick={() => onChange(tags.filter((x) => x !== t))} style={{ cursor: "pointer", opacity: 0.6, marginLeft: 1 }}>&times;</span>
        </span>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="Add tag…" style={{ flex: 1, minWidth: 80, background: "none", border: "none", outline: "none", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11, lineHeight: "20px" }} />
    </div>
  );
}

// ─── Key metrics ────────────────────────────────────────────────────────────

function MetricsEditor({ metrics, onChange }: { metrics: Record<string, string>; onChange: (m: Record<string, string>) => void }) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const addMetric = () => {
    const k = newKey.trim(), v = newVal.trim();
    if (k && v) { onChange({ ...metrics, [k]: v }); setNewKey(""); setNewVal(""); }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Object.entries(metrics).map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 4 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8B949E", minWidth: 80, flexShrink: 0 }}>{k}</span>
          <input value={v} onChange={(e) => onChange({ ...metrics, [k]: e.target.value })} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12 }} />
          <span onClick={() => { const { [k]: _, ...rest } = metrics; onChange(rest); }} style={{ cursor: "pointer", color: "#484F58", fontSize: 14, lineHeight: 1 }}>&times;</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 4 }}>
        <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Key" style={{ flex: 1, padding: "4px 8px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 4, outline: "none", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11 }} />
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="Value" style={{ flex: 1, padding: "4px 8px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 4, outline: "none", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11 }} />
        <button onClick={addMetric} style={{ display: "flex", alignItems: "center", padding: "4px 8px", background: "rgba(240,165,0,0.1)", border: "0.5px solid rgba(240,165,0,0.2)", borderRadius: 4, cursor: "pointer", color: "#F0A500" }}><IconPlus size={12} /></button>
      </div>
    </div>
  );
}

// ─── Project Detail Page ────────────────────────────────────────────────────

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [dispatches, setDispatches] = useState<DispatchRead[]>([]);
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState("");
  const [metrics, setMetrics] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const projects = await listProjects();
        const p = projects.find((x) => x.id === projectId);
        if (p) {
          setProject(p);
          setDescription(p.description || "");
          setStack(p.stack || []);
        }
        const all = await listDispatches();
        setDispatches(all.filter((d) => d.project_id === projectId).slice(0, 5));
      } catch { /* ignore */ }
    })();
  }, [projectId]);

  if (!project) {
    return <div style={{ padding: 40, color: "#484F58", fontFamily: "'IBM Plex Sans'", fontSize: 13 }}>Loading…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <Avatar size={48} name={project.name} variant="marble" colors={["#F0A500","#E8593C","#3FB950","#58A6FF","#8B949E"]} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", lineHeight: 1.2 }}>{project.name}</h1>
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 4, border: "0.5px solid #30363D", color: "#8B949E", textDecoration: "none", fontSize: 11, fontFamily: "'IBM Plex Sans'", gap: 4 }}>
                <IconBrandGithub size={12} stroke={1.5} /> GitHub
              </a>
            )}
          </div>
          {project.tagline && (
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: "#8B949E", marginTop: 4 }}>{project.tagline}</div>
          )}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{project.status}</div>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Left: Project context ──────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#484F58", letterSpacing: "0.1em", textTransform: "uppercase" }}>Project Context</div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Description */}
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Description</div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12, lineHeight: 1.6, resize: "vertical" }} />
            </div>

            {/* Tech stack */}
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tech Stack</div>
              <TagInput tags={stack} onChange={setStack} />
            </div>

            {/* Current milestone */}
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Current Milestone</div>
              <input value={currentMilestone} onChange={(e) => setCurrentMilestone(e.target.value)} placeholder="What are you building right now?" style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12 }} />
            </div>

            {/* Key metrics */}
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Key Metrics</div>
              <MetricsEditor metrics={metrics} onChange={setMetrics} />
            </div>

            {/* Update button */}
            <button onClick={() => { /* save + re-embed */ }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", backgroundColor: "#F0A500", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 500, color: "#0D1117", marginTop: 4 }}>
              <IconCheck size={14} stroke={2} /> Update Context
            </button>
          </div>
        </div>

        {/* ── Right: Recent bylines ──────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#484F58", letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Bylines</div>
          {dispatches.length === 0 ? (
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#484F58", padding: 20, textAlign: "center", backgroundColor: "rgba(255,255,255,0.015)", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
              No milestones logged yet for this project.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {dispatches.map((d) => {
                const platforms = d.suggested_platforms || [];
                const scoreAvg = d.stamps?.length ? (d.stamps.reduce((s, st) => s + (st.critic_score || 0), 0) / d.stamps.length) : 0;
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#E6EDF3", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.body}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        {platforms.map((p) => <PlatformIcon key={p} platform={p} size={11} />)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {scoreAvg > 0 && (
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: scoreAvg >= 8 ? "#3FB950" : scoreAvg >= 6 ? "#F0A500" : "#F85149" }}>{scoreAvg.toFixed(1)}</span>
                      )}
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: d.hold_reason ? "#F85149" : "#3FB950" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
