import React, { useState, useEffect, useRef } from "react";
import {
  IconCheck, IconX, IconBrandGithub, IconBrandLinkedin, IconBrandX, IconBrandReddit, IconBrandThreads,
  IconPlus, IconLoader2, IconSend, IconChevronRight, IconArrowRight, IconMicrophone,
} from "@tabler/icons-react";
import { createProject, createVoiceProfile, createDispatch, streamGeneration, type Project } from "../../api";

// ─── Steps ──────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "project",  label: "Name your project"  },
  { id: "voice",    label: "Voice training"     },
  { id: "platforms", label: "Connect platforms"  },
  { id: "milestone", label: "Log first milestone" },
  { id: "review",   label: "Review & ship"      },
];

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

// ─── Tag Input (inline, simplified) ─────────────────────────────────────────

function StackInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [val, setVal] = useState("");
  const add = () => { const v = val.trim(); if (v && !tags.includes(v)) { onChange([...tags, v]); setVal(""); } };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 8px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, minHeight: 28 }}>
      {tags.map((t) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 5px", borderRadius: 3, backgroundColor: "rgba(240,165,0,0.1)", border: "0.5px solid rgba(240,165,0,0.2)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#F0A500" }}>
          {t}
          <span onClick={() => onChange(tags.filter((x) => x !== t))} style={{ cursor: "pointer", opacity: 0.6 }}>&times;</span>
        </span>
      ))}
      <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} onBlur={add} placeholder="Add…" style={{ flex: 1, minWidth: 60, background: "none", border: "none", outline: "none", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11, lineHeight: "18px" }} />
    </div>
  );
}

// ─── Platform Card ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: IconBrandLinkedin, color: "#0A66C2" },
  { id: "x", label: "X (Twitter)", icon: IconBrandX, color: "#FAFAF8" },
  { id: "reddit", label: "Reddit", icon: IconBrandReddit, color: "#FF4500" },
  { id: "threads", label: "Threads", icon: IconBrandThreads, color: "#1C1C1E" },
];

function PlatformCard({ platform, connected, onConnect }: { platform: typeof PLATFORMS[0]; connected: boolean; onConnect: () => void }) {
  const [hov, setHov] = useState(false);
  const Icon = platform.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: connected ? "rgba(63,185,80,0.04)" : "rgba(255,255,255,0.02)", border: "0.5px solid " + (connected ? "rgba(63,185,80,0.2)" : "rgba(255,255,255,0.08)"), borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: platform.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={platform.color} stroke={1.5} />
        </div>
        <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: "#E6EDF3" }}>{platform.label}</span>
      </div>
      {connected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#3FB950" }}>
          <IconCheck size={10} stroke={2.5} /> Connected
        </div>
      ) : (
        <button onClick={onConnect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ padding: "4px 10px", backgroundColor: hov ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 4, cursor: "pointer", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11 }}>
          Connect
        </button>
      )}
    </div>
  );
}

// ─── Agent Step Indicator ───────────────────────────────────────────────────

const AGENT_STEPS = [
  { id: "strategist", label: "Strategist", color: "#F0A500" },
  { id: "linkedin", label: "LinkedIn Writer", color: "#0A66C2" },
  { id: "x", label: "X Writer", color: "#FAFAF8" },
  { id: "reddit", label: "Reddit Writer", color: "#FF4500" },
  { id: "critic", label: "Critic", color: "#3FB950" },
];

function AgentStepper({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, justifyContent: "center" }}>
      {AGENT_STEPS.map((agent, i) => (
        <React.Fragment key={agent.id}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: i < currentStep ? agent.color + "30" : i === currentStep ? agent.color + "50" : "rgba(255,255,255,0.04)", border: "1px solid " + (i <= currentStep ? agent.color + "60" : "rgba(255,255,255,0.1)"), transition: "all 0.3s ease" }}>
              {i < currentStep ? (
                <IconCheck size={10} color={agent.color} stroke={2.5} />
              ) : i === currentStep ? (
                <IconLoader2 size={10} color={agent.color} className="byline-spin" />
              ) : (
                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)" }} />
              )}
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: i === currentStep ? agent.color : "rgba(255,255,255,0.25)", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{agent.label}</span>
          </div>
          {i < AGENT_STEPS.length - 1 && (
            <div style={{ width: 24, height: 1, backgroundColor: i < currentStep ? agent.color + "40" : "rgba(255,255,255,0.06)", margin: "0 2px", marginBottom: 16 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Onboarding Wizard ──────────────────────────────────────────────────────

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectStack, setProjectStack] = useState<string[]>([]);
  const [projectRepo, setProjectRepo] = useState("");
  const [rawPosts, setRawPosts] = useState("");
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({ linkedin: false, x: false, reddit: false, threads: false });
  const [milestoneText, setMilestoneText] = useState("");
  const [agentStep, setAgentStep] = useState(-1);
  const [linkedinDraft, setLinkedinDraft] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState("");
  const [creating, setCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const advance = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const progress = ((step + 1) / STEPS.length) * 100;

  // Step 1: Create project
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setCreating(true);
    try {
      const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const p = await createProject({ name: projectName, slug, description: projectDesc, stack: projectStack.length ? projectStack : undefined, repo_url: projectRepo || undefined });
      setCreatedProjectId(p.id);
      advance();
    } catch { advance(); }
    setCreating(false);
  };

  // Step 2: Voice training
  const handleAnalyzeVoice = async () => {
    if (!rawPosts.trim()) return;
    setAnalyzing(true);
    try {
      await createVoiceProfile({ raw_posts: rawPosts });
    } catch { /* ignore */ }
    setAnalyzing(false);
    advance();
  };

  // Step 3: Connect platform
  const handleConnect = (id: string) => {
    setPlatforms((prev) => ({ ...prev, [id]: true }));
  };

  // Step 4: Run pipeline
  const handleRunPipeline = async () => {
    const text = milestoneText.trim() || "Started building with Byline";
    setIsRunning(true);
    setAgentStep(0);
    const pid = createdProjectId || (await createProject({ name: projectName || "My Project", slug: (projectName || "my-project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), description: projectDesc }).catch(() => ({} as Project)))?.id;
    try {
      const dispatch = await createDispatch({ project_id: pid, body: text });
      setAgentStep(1);
      const controller = streamGeneration(
        dispatch.id,
        (event) => {
          if (event.platform === "linkedin" && event.status === "ready") {
            setAgentStep(5);
            setLinkedinDraft(event.draft_id as string);
          } else if (event.status === "ready") {
            setAgentStep((s) => Math.min(s + 1, 5));
          } else if (event.status === "writing") {
            const idx = event.platform === "linkedin" ? 1 : event.platform === "x" ? 2 : event.platform === "reddit" ? 3 : event.platform === "threads" ? 3 : 4;
            setAgentStep(idx);
          }
        },
        () => {},
        () => { setIsRunning(false); setAgentStep(5); advance(); }
      );
    } catch {
      setIsRunning(false);
      setAgentStep(-1);
      setLinkedinDraft("Shipped " + text + "\n\nHere's what I learned building this. The hard part wasn't the code — it was deciding what to leave out.\n\nKey takeaways:\n1. Start simple, iterate fast\n2. Ship before you're ready\n3. Build in public");
      advance();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 560, backgroundColor: "#161B22", border: "1px solid #30363D", borderRadius: 12, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", overflow: "hidden", animation: "cp-scale-in 0.15s ease-out", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        <style>{`
          @keyframes cp-scale-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
          .byline-spin { animation: byline-spin-anim 0.9s linear infinite; }
          @keyframes byline-spin-anim { to { transform: rotate(360deg); } }
        `}</style>

        {/* ── Header + Progress Bar ──────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid #21262D" }}>
          <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Mono', 'IBM Plex Mono', monospace", fontSize: 13, color: "#E6EDF3" }}>byline</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58" }}>Step {step + 1} of {STEPS.length}</span>
              <button onClick={onSkip} style={{ display: "flex", alignItems: "center", padding: "3px 8px", backgroundColor: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 4, cursor: "pointer", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 10 }}>
                Skip all
              </button>
            </div>
          </div>
          <div style={{ height: 2, backgroundColor: "#21262D" }}>
            <div style={{ width: progress + "%", height: "100%", backgroundColor: "#F0A500", transition: "width 0.3s ease", borderRadius: "0 1px 1px 0" }} />
          </div>
          <div style={{ display: "flex", padding: "6px 18px 12px", gap: 0, justifyContent: "center" }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4, cursor: i <= step ? "pointer" : "default" }} onClick={() => { if (i <= step) setStep(i); }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: i < step ? "#3FB950" : i === step ? "#F0A500" : "rgba(255,255,255,0.06)" }}>
                  {i < step ? <IconCheck size={8} color="#0D1117" stroke={3} /> : <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: i === step ? "#0D1117" : "rgba(255,255,255,0.2)" }} />}
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: i <= step ? "#8B949E" : "#484F58", whiteSpace: "nowrap" }}>{s.label}</span>
                {i < STEPS.length - 1 && <div style={{ width: 12, height: 1, backgroundColor: i < step ? "#3FB950" : "#21262D", margin: "0 2px" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step Content ───────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 20px" }}>

          {/* Step 1: Name your project */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 4 }}>Name your first project</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#8B949E" }}>This is what Byline will track — you can always add more later.</div>
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Project name</div>
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. fltrd.tech" style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Description</div>
                <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="What does this project do?" rows={2} style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12, lineHeight: 1.5, resize: "vertical" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tech Stack</div>
                <StackInput tags={projectStack} onChange={setProjectStack} />
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>GitHub URL (optional)</div>
                <input value={projectRepo} onChange={(e) => setProjectRepo(e.target.value)} placeholder="https://github.com/username/repo" style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={handleCreateProject} disabled={!projectName.trim() || creating} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", backgroundColor: !projectName.trim() ? "rgba(240,165,0,0.3)" : "#F0A500", border: "none", borderRadius: 5, cursor: !projectName.trim() ? "default" : "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500 }}>
                  {creating ? <IconLoader2 size={13} className="byline-spin" /> : <IconPlus size={13} />}
                  {creating ? "Creating..." : "Create project"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Voice training */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 4 }}>Train your voice</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#8B949E" }}>Paste 3+ past posts so Byline learns your writing style.</div>
              </div>
              <textarea value={rawPosts} onChange={(e) => setRawPosts(e.target.value)} placeholder="Paste your LinkedIn, X, or Reddit posts here..." rows={6} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12, lineHeight: 1.65, resize: "vertical" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58" }}>{rawPosts.split(/\n\s*\n/).filter(Boolean).length} posts</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => advance()} style={{ padding: "6px 12px", backgroundColor: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 4, cursor: "pointer", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11 }}>
                    Skip
                  </button>
                  <button onClick={handleAnalyzeVoice} disabled={!rawPosts.trim() || analyzing} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", backgroundColor: !rawPosts.trim() ? "rgba(240,165,0,0.3)" : "#F0A500", border: "none", borderRadius: 4, cursor: !rawPosts.trim() ? "default" : "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 500 }}>
                    {analyzing ? <IconLoader2 size={12} className="byline-spin" /> : <IconMicrophone size={12} />}
                    {analyzing ? "Analyzing..." : "Train voice"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Connect platforms */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 4 }}>Connect your platforms</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#8B949E" }}>Byline will post drafts to these platforms via Composio.</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PLATFORMS.map((p) => (
                  <PlatformCard key={p.id} platform={p} connected={!!platforms[p.id]} onConnect={() => handleConnect(p.id)} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={() => advance()} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 18px", backgroundColor: "#F0A500", border: "none", borderRadius: 5, cursor: "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500 }}>
                  Continue <IconArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Log first milestone */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 4 }}>Log your first milestone</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#8B949E" }}>What did you ship today? Byline will turn this into 4 platform drafts.</div>
              </div>
              <textarea value={milestoneText} onChange={(e) => setMilestoneText(e.target.value)} placeholder="What did you ship today?" rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 13, lineHeight: 1.65, resize: "vertical" }} />
              {isRunning && (
                <div style={{ padding: "14px 0" }}>
                  <AgentStepper currentStep={agentStep} />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                {!isRunning && (
                  <button onClick={() => advance()} style={{ padding: "6px 12px", backgroundColor: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 4, cursor: "pointer", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11 }}>
                    Skip
                  </button>
                )}
                <button onClick={handleRunPipeline} disabled={isRunning} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", backgroundColor: isRunning ? "rgba(240,165,0,0.3)" : "#F0A500", border: "none", borderRadius: 5, cursor: isRunning ? "default" : "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500 }}>
                  {isRunning ? <IconLoader2 size={13} className="byline-spin" /> : <IconSend size={13} />}
                  {isRunning ? "Running pipeline..." : "Run Pipeline"}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review and ship */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 4 }}>Review & ship</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#8B949E" }}>Here's your LinkedIn draft. Edit or approve to complete onboarding.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <IconBrandLinkedin size={14} color="#0A66C2" />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#0A66C2", letterSpacing: "0.06em", textTransform: "uppercase" }}>LinkedIn Draft</span>
              </div>
              <textarea value={linkedinDraft} onChange={(e) => setLinkedinDraft(e.target.value)} rows={7} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 6, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12, lineHeight: 1.7, resize: "vertical" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <button onClick={() => advance()} style={{ padding: "6px 14px", backgroundColor: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 4, cursor: "pointer", color: "#8B949E", fontFamily: "'IBM Plex Sans'", fontSize: 11 }}>
                  Edit later
                </button>
                <button onClick={onComplete} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 18px", backgroundColor: "#F0A500", border: "none", borderRadius: 5, cursor: "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500 }}>
                  <IconCheck size={13} /> Approve & Finish
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
