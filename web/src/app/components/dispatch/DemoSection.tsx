import React, { useState, useRef } from "react";
import { IconChevronDown, IconArrowRight, IconLoader2, IconCheck, IconBrandLinkedin, IconBrandX, IconBrandReddit, IconBrandThreads } from "@tabler/icons-react";

// ─── Types & data ─────────────────────────────────────────────────────────────

type Platform = "LinkedIn" | "X" | "Reddit" | "Threads";
const PLATFORMS: Platform[] = ["LinkedIn", "X", "Reddit", "Threads"];

const PLATFORM_BADGE: Record<Platform, string> = {
  LinkedIn: "in",
  X:        "𝕏",
  Reddit:   "r/",
  Threads:  "Th",
};
const PLATFORM_COLOR: Record<Platform, string> = {
  LinkedIn: "#0A66C2",
  X:        "#141414",
  Reddit:   "#FF4500",
  Threads:  "#1C1C1E",
};

interface Draft {
  paragraphs: string[];
  score: string;
  checks: string[];
}

const DRAFTS: Record<Platform, Draft> = {
  LinkedIn: {
    paragraphs: [
      "Spent 3 days on semantic search and the embeddings were the easiest part.",
      "It was the chunking strategy that kept breaking.",
      "Here's what finally worked on fltrd.tech:\n→ chunk size > model choice\n→ 15% overlap for technical content\n→ pgvector cosine sim is fast enough for prod",
    ],
    score: "8.4",
    checks: ["voice match ✓", "no AI slop detected ✓"],
  },
  X: {
    paragraphs: [
      "pgvector semantic search: 3 days.",
      "embeddings: easy.\nchunking strategy: broke everything.",
      "what finally worked on fltrd.tech 🧵",
    ],
    score: "7.9",
    checks: ["punchy ✓", "under 280 chars ✓"],
  },
  Reddit: {
    paragraphs: [
      "I added semantic search to my app without a dedicated vector service.",
      "Used pgvector on existing Postgres. The embeddings docs are everywhere — but nobody talks about chunk overlap for technical content.",
      "Sharing what I actually learned (not a product pitch, just the caveats):",
    ],
    score: "9.1",
    checks: ["reddit-safe ✓", "no promo detected ✓"],
  },
  Threads: {
    paragraphs: [
      "3 days for semantic search and the hard part wasn't what I expected",
      "pgvector + good chunking > any dedicated vector service for this use case tbh",
    ],
    score: "7.6",
    checks: ["casual tone ✓", "under 500 chars ✓"],
  },
};

// ─── Small shared primitives ──────────────────────────────────────────────────

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 10,
        fontWeight: 400,
        color: "rgba(255,255,255,0.28)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 10,
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 5,
      }}
    >
      {children}
    </div>
  );
}

function FakeSelect({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <InputLabel>{label}</InputLabel>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 11px",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 6,
          cursor: "default",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {value}
        </span>
        <IconChevronDown size={11} color="rgba(255,255,255,0.3)" stroke={1.5} />
      </div>
    </div>
  );
}

// ─── Title bar ────────────────────────────────────────────────────────────────

function TitleBar() {
  return (
    <div
      style={{
        height: 36,
        backgroundColor: "rgba(255,255,255,0.035)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["#E85E2C", "#F5A623", "#22C55E"] as const).map((c) => (
          <div
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: c,
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* App title */}
      <span
        style={{
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.02em",
          userSelect: "none",
        }}
      >
        byline · the wire · localhost:3000
      </span>
    </div>
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel({
  milestone,
  onMilestoneChange,
  dispatchState,
  onDispatch,
}: {
  milestone: string;
  onMilestoneChange: (v: string) => void;
  dispatchState: "idle" | "loading" | "done";
  onDispatch: () => void;
}) {
  return (
    <div
      className="dispatch-demo-left"
      style={{
        width: "35%",
        flexShrink: 0,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflowY: "auto",
      }}
    >
      <PanelLabel>The Wire</PanelLabel>

      {/* Milestone input */}
      <div>
        <InputLabel>Log a milestone</InputLabel>
        <textarea
          value={milestone}
          onChange={(e) => onMilestoneChange(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            boxSizing: "border-box",
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.78)",
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 12,
            lineHeight: 1.65,
            padding: "10px 12px",
            resize: "none",
            outline: "none",
            transition: "border-color 0.12s ease",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(232,94,44,0.45)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
          }
        />
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "0.5px solid rgba(255,255,255,0.07)",
          margin: "0 -16px",
          width: "calc(100% + 32px)",
        }}
      />

      <FakeSelect label="Project" value="fltrd.tech" />
      <FakeSelect label="Narrative arc" value="build in public" />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Byline action button — idle / loading / done */}
      <button
        onClick={onDispatch}
        disabled={dispatchState !== "idle"}
        style={{
          width: "100%",
          padding: "10px 16px",
          backgroundColor:
            dispatchState === "done"
              ? "#22C55E"
              : dispatchState === "loading"
              ? "rgba(232,94,44,0.6)"
              : "#E85E2C",
          border: "none",
          borderRadius: 8,
          cursor: dispatchState !== "idle" ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          transition: "background-color 0.25s ease",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#F5F2EC",
            letterSpacing: "-0.01em",
          }}
        >
          {dispatchState === "loading"
            ? "Publishing"
            : dispatchState === "done"
            ? "Done"
            : "Publish"}
        </span>
        {dispatchState === "loading" && (
          <IconLoader2 size={13} color="#F5F2EC" stroke={2} className="dispatch-spin" />
        )}
        {dispatchState === "done" && (
          <IconCheck size={13} color="#F5F2EC" stroke={2.5} />
        )}
        {dispatchState === "idle" && (
          <IconArrowRight size={13} color="#F5F2EC" stroke={2} />
        )}
      </button>
    </div>
  );
}

// ─── Draft preview ────────────────────────────────────────────────────────────

function SmallBadge({ platform }: { platform: Platform }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: 5,
        backgroundColor: PLATFORM_COLOR[platform],
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {platform === "LinkedIn" && <IconBrandLinkedin size={12} stroke={2} />}
      {platform === "X" && <IconBrandX size={10} stroke={2.5} />}
      {platform === "Reddit" && <IconBrandReddit size={12} stroke={2} />}
      {platform === "Threads" && <IconBrandThreads size={12} stroke={2} />}
    </span>
  );
}

function SkeletonLine({ width, dim }: { width: string | number; dim?: boolean }) {
  return (
    <div
      className="dispatch-skeleton"
      style={{
        height: 10,
        width,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 4,
        opacity: dim ? 0.4 : 0.7,
      }}
    />
  );
}

function DraftContent({
  activeTab,
  draft,
  dispatching,
  animKey,
  loadingStep,
}: {
  activeTab: Platform;
  draft: Draft;
  dispatching: boolean;
  animKey: number;
  loadingStep: number;
}) {
  if (dispatching) {
    const stepLabels = [
      "Strategist Agent: analyzing milestone...",
      "Writers: drafting LinkedIn, X, Reddit, and Threads posts...",
      "Critic Agent: scoring drafts & checking anti-promo tone...",
      "Finishing review desk..."
    ];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "4px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div
            className="dispatch-skeleton"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <SkeletonLine width={90} />
            <SkeletonLine width={60} dim />
          </div>
        </div>
        <SkeletonLine width="92%" />
        <SkeletonLine width="78%" />
        <SkeletonLine width="85%" />
        <SkeletonLine width="60%" dim />
        <div style={{ marginTop: 4 }}>
          <SkeletonLine width="70%" />
          <div style={{ height: 6 }} />
          <SkeletonLine width="55%" dim />
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 10,
            color: "#E85E2C",
            letterSpacing: "0.04em",
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <IconLoader2 size={11} className="dispatch-spin" style={{ flexShrink: 0 }} />
          <span>{stepLabels[loadingStep] || "generating drafts…"}</span>
        </div>
      </div>
    );
  }

  return (
    <div key={animKey} className="dispatch-draft-panel" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Post header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#E85E2C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#F5F2EC",
            }}
          >
            S
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.3,
            }}
          >
            Sahil
            <span
              style={{
                fontWeight: 400,
                color: "rgba(255,255,255,0.35)",
                marginLeft: 4,
              }}
            >
              · just now
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 3,
            }}
          >
            <SmallBadge platform={activeTab} />
            <span
              style={{
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.28)",
              }}
            >
              {activeTab}
            </span>
          </div>
        </div>
      </div>

      {/* Post body */}
      <div
        style={{
          padding: "12px 14px",
          backgroundColor: "rgba(255,255,255,0.04)",
          borderRadius: 8,
          border: "0.5px solid rgba(255,255,255,0.07)",
          marginBottom: 12,
        }}
      >
        {draft.paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 400,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.65,
              margin: i < draft.paragraphs.length - 1 ? "0 0 10px" : "0",
              whiteSpace: "pre-line",
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Critic score */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          padding: "8px 12px",
          backgroundColor: "rgba(255,255,255,0.025)",
          borderRadius: 6,
          border: "0.5px solid rgba(255,255,255,0.06)",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 11,
            color: "#F59E0B",
            letterSpacing: "0.02em",
          }}
        >
          ★ {draft.score}/10
        </span>
        {draft.checks.map((c) => (
          <span
            key={c}
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 11,
              color: "#22C55E",
            }}
          >
            · {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RightPanel({
  activeTab,
  onTabChange,
  draft,
  dispatching,
  animKey,
  approveState,
  onApprove,
  loadingStep,
}: {
  activeTab: Platform;
  onTabChange: (p: Platform) => void;
  draft: Draft;
  dispatching: boolean;
  animKey: number;
  approveState: "idle" | "posted";
  onApprove: () => void;
  loadingStep: number;
}) {
  return (
    <div
      className="dispatch-demo-right"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Panel label */}
      <div
        style={{
          padding: "18px 18px 0",
        }}
      >
        <PanelLabel>The Desk</PanelLabel>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "0.5px solid rgba(255,255,255,0.09)",
          padding: "0 18px",
          gap: 0,
          flexShrink: 0,
        }}
      >
        {PLATFORMS.map((p) => {
          const active = p === activeTab;
          return (
            <button
              key={p}
              onClick={() => onTabChange(p)}
              style={{
                background: "none",
                border: "none",
                borderBottom: active
                  ? "1.5px solid #E85E2C"
                  : "1.5px solid transparent",
                padding: "8px 14px",
                cursor: "pointer",
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)",
                transition: "color 0.12s ease, border-color 0.12s ease",
                letterSpacing: "-0.01em",
                marginBottom: -1, /* sit on the border */
                flexShrink: 0,
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Draft area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 18px 0",
        }}
      >
        <DraftContent
          activeTab={activeTab}
          draft={draft}
          dispatching={dispatching}
          animKey={animKey}
          loadingStep={loadingStep}
        />
      </div>

      {/* Action row */}
      {!dispatching && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 18px",
            flexShrink: 0,
          }}
        >
          <button
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.18)",
              borderRadius: 6,
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              cursor: "pointer",
              transition: "border-color 0.12s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)")
            }
          >
            Edit
          </button>
          <button
            onClick={onApprove}
            disabled={approveState === "posted"}
            style={{
              padding: "6px 14px",
              backgroundColor: approveState === "posted" ? "#22C55E" : "#E85E2C",
              border: "none",
              borderRadius: 6,
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "#F5F2EC",
              cursor: approveState === "posted" ? "default" : "pointer",
              letterSpacing: "-0.01em",
              transition: "background-color 0.25s ease",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {approveState === "posted" ? (
              <>
                <IconCheck size={12} color="#F5F2EC" stroke={2.5} />
                Shipped ✓
              </>
            ) : (
              "Approve & Ship"
            )}
          </button>
        </div>
      )}

      {/* Composio status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px 12px",
          borderTop: "0.5px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {/* Connected dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 0 2px rgba(34,197,94,0.22)",
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.02em",
            }}
          >
            Composio connected:
          </span>
        </div>

        {/* Platform badges */}
        <div style={{ display: "flex", gap: 5 }}>
          {(["LinkedIn", "X", "Reddit"] as Platform[]).map((p) => (
            <span
              key={p}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: 4,
                backgroundColor: PLATFORM_COLOR[p],
                color: "#fff",
                opacity: 0.8,
              }}
            >
              {p === "LinkedIn" && <IconBrandLinkedin size={11} stroke={2} />}
              {p === "X" && <IconBrandX size={9} stroke={2.5} />}
              {p === "Reddit" && <IconBrandReddit size={11} stroke={2} />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

// Helper function to generate mock drafts based on milestone text input
function generateDraftsForMilestone(milestoneText: string): Record<Platform, Draft> {
  const text = milestoneText.trim() || "Shipped pgvector semantic search.";

  // Normalize text for simple templates
  const action = (text.match(/^(shipped|built|fixed|added|refactored|launched|created|solved|resolved)/i)?.[0] || "Shipped").toLowerCase();
  let rest = text.replace(/^(shipped|built|fixed|added|refactored|launched|created|solved|resolved)\s+/i, "");
  if (rest.toLowerCase().startsWith("on ") || rest.toLowerCase().startsWith("to ")) {
    rest = rest.slice(3);
  }
  rest = rest.replace(/\.$/, "");
  const actionPast = action.endsWith("ed") || action === "built" ? action : action + "ed";

  return {
    LinkedIn: {
      paragraphs: [
        `We just ${actionPast} ${rest.toLowerCase()}.`,
        "Most LLM models generate content that sounds like standard AI marketing slop — generic hooks, fake enthusiasm, and zero details.",
        `Here is the technical reality of how we built this:\n→ Retrieval Grounding: pgvector index in Postgres retrieves the top 5 most similar past bylines.\n→ Memory-First Prompting: The strategist agent selects the story angle before drafting.\n→ Caching: pgvector searches are cached locally to keep latency low.`,
        "Grounding beats prompting. Every time."
      ],
      score: "8.8",
      checks: ["voice match ✓", "no AI slop detected ✓"],
    },
    X: {
      paragraphs: [
        `Just ${actionPast} ${rest.toLowerCase()}.\n\nPGVector embeddings + local caching solved the hallucination issues. 30% error rates dropped to 8%.\n\n3 key lessons learned:`,
      ],
      score: "8.1",
      checks: ["punchy ✓", "under 280 chars ✓"],
    },
    Reddit: {
      paragraphs: [
        `I ${actionPast} ${rest.toLowerCase()} without a dedicated vector service.`,
        "Used pgvector on our existing database. The basic setup guides are simple, but real-world retrieval grounding requires careful chunking and query caching to stay performant.",
        "Sharing my findings (no sales pitches, just the technical details and what broke):",
        "1. Vector databases are often overkill if you already run Postgres.\n2. Caching similar queries drops latency by over 50%.\n3. Grounding retrieve chunks beats writing larger context prompts."
      ],
      score: "8.9",
      checks: ["reddit-safe ✓", "no promo detected ✓"],
    },
    Threads: {
      paragraphs: [
        `pgvector + local caching > dedicated vector database.`,
        `Just ${actionPast} ${rest.toLowerCase()} on the project. Grounding beats prompting. 12ms latency hits are live now.`
      ],
      score: "7.9",
      checks: ["casual tone ✓", "under 500 chars ✓"],
    },
  };
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<Platform>("LinkedIn");
  // "animKey" increments on tab change — React re-mounts DraftContent, triggering CSS in-animation
  const [animKey, setAnimKey] = useState(0);

  // Dispatch button: idle | loading | done
  const [dispatchState, setDispatchState] = useState<"idle" | "loading" | "done">("idle");
  const dispatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Approve & Post button: idle | posted
  const [approveState, setApproveState] = useState<"idle" | "posted">("idle");
  const approveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [milestone, setMilestone] = useState(
    "Shipped semantic search on fltrd.tech using pgvector. Took 3 days. The tricky part was chunking strategy, not the embeddings."
  );

  const [drafts, setDrafts] = useState<Record<Platform, Draft>>(DRAFTS);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleTabChange = (p: Platform) => {
    if (p === activeTab) return;
    setActiveTab(p);
    setAnimKey((k) => k + 1);
    // Reset approve state when switching tabs
    setApproveState("idle");
  };

  const handleDispatch = () => {
    if (dispatchState !== "idle") return;
    setDispatchState("loading");
    setLoadingStep(0);

    const t1 = setTimeout(() => setLoadingStep(1), 400);
    const t2 = setTimeout(() => setLoadingStep(2), 850);
    const t3 = setTimeout(() => setLoadingStep(3), 1300);

    dispatchTimer.current = setTimeout(() => {
      const generated = generateDraftsForMilestone(milestone);
      setDrafts(generated);
      setDispatchState("done");
      setAnimKey((k) => k + 1);
      setApproveState("idle");

      dispatchTimer.current = setTimeout(() => setDispatchState("idle"), 1500);
    }, 1800);
  };

  const handleApprove = () => {
    if (approveState !== "idle") return;
    setApproveState("posted");
    approveTimer.current = setTimeout(() => setApproveState("idle"), 2000);
  };

  const dispatching = dispatchState === "loading";
  const draft = drafts[activeTab];
  return (
    <section id="demo" className="dispatch-reveal" style={{ backgroundColor: "var(--bg)", paddingBottom: 96, transition: "background-color 0.3s ease" }}>
      <style>{`
        .dispatch-demo-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }

        /* Custom scrollbars inside the dark demo panel */
        .dispatch-demo-left::-webkit-scrollbar,
        .dispatch-demo-shell *::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .dispatch-demo-left::-webkit-scrollbar-thumb,
        .dispatch-demo-shell *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        .dispatch-demo-left::-webkit-scrollbar-track,
        .dispatch-demo-shell *::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Aspect ratio lock on desktop */
        .dispatch-demo-shell {
          aspect-ratio: 16 / 9.5;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Draft panel entrance — triggered by React key remount on tab change */
        @keyframes dispatch-draft-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .dispatch-draft-panel {
          animation: dispatch-draft-in 0.2s ease forwards;
        }

        /* Loading spinner */
        @keyframes dispatch-spin {
          to { transform: rotate(360deg); }
        }
        .dispatch-spin {
          animation: dispatch-spin 0.9s linear infinite;
        }

        /* Skeleton pulse */
        @keyframes dispatch-skeleton-pulse {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.5; }
        }
        .dispatch-skeleton {
          animation: dispatch-skeleton-pulse 1.4s ease-in-out infinite;
        }

        /* Shell content layout */
        .dispatch-demo-content {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .dispatch-demo-left {
          width: 35%;
          height: 100%;
        }
        .dispatch-demo-vdivider {
          width: 0.5px;
          background-color: rgba(255,255,255,0.12);
          flex-shrink: 0;
        }
        .dispatch-demo-right {
          flex: 1;
          height: 100%;
        }

        @media (max-width: 767px) {
          .dispatch-demo-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .dispatch-demo-shell {
            aspect-ratio: auto !important;
            height: auto !important;
          }
          .dispatch-demo-content {
            flex-direction: column !important;
            height: auto !important;
            overflow: visible !important;
          }
          .dispatch-demo-left {
            width: 100% !important;
            height: auto !important;
            border-bottom: 0.5px solid rgba(255,255,255,0.12) !important;
          }
          .dispatch-demo-vdivider {
            display: none !important;
          }
          .dispatch-demo-right {
            height: 480px !important;
          }
        }
      `}</style>

      <div className="dispatch-demo-inner">

        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 400,
            color: "var(--text-secondary)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 20,
            transition: "color 0.3s ease",
          }}
        >
          Demo
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
          Type a milestone. See four drafts. Approve and ship.
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
          A LangGraph pipeline that runs in seconds. Edit any draft, approve, and
          Composio handles the posting — no OAuth setup on your end.
        </p>

        {/* ── App shell ─────────────────────────────────────────────────────── */}
        <div
          className="dispatch-demo-shell"
          style={{
            backgroundColor: "var(--bg-terminal)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow:
              "0 2px 4px rgba(15,15,13,0.04), 0 16px 48px rgba(15,15,13,0.14), 0 48px 80px rgba(15,15,13,0.06)",
            border: "0.5px solid var(--border)",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          <TitleBar />

          <div className="dispatch-demo-content">
            <LeftPanel
              milestone={milestone}
              onMilestoneChange={setMilestone}
              dispatchState={dispatchState}
              onDispatch={handleDispatch}
            />

            {/* Vertical divider */}
            <div className="dispatch-demo-vdivider" />

            <RightPanel
              activeTab={activeTab}
              onTabChange={handleTabChange}
              draft={draft}
              dispatching={dispatching}
              animKey={animKey}
              approveState={approveState}
              onApprove={handleApprove}
              loadingStep={loadingStep}
            />
          </div>
        </div>

        {/* Below-shell footnote */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            color: "var(--text-secondary)",
            opacity: 0.7,
            lineHeight: 1.6,
            fontStyle: "italic",
            marginTop: 14,
            textAlign: "center",
            transition: "color 0.3s ease",
          }}
        >
          Try typing your own milestone in the left panel, then hit Publish →
        </p>
      </div>
    </section>
  );
}
