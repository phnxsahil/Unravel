import React, { useState, useEffect } from "react";
import { IconCircleCheck, IconCircleX, IconClock, IconStack2 } from "@tabler/icons-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatusPill {
  label: string;
  status: "ok" | "error" | "idle";
  detail: string;
  icon?: React.ElementType;
}

// ─── Package version ────────────────────────────────────────────────────────

const APP_VERSION = "0.1.0";

// ─── Status Pill ────────────────────────────────────────────────────────────

function StatusPill({ label, detail, icon: Icon }: StatusPill) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        whiteSpace: "nowrap",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: "#8B949E",
        lineHeight: "20px",
        letterSpacing: "0.02em",
        cursor: "default",
      }}
      title={`${label}: ${detail}`}
    >
      {Icon && (
        <span style={{ display: "inline-flex", flexShrink: 0 }}>
          <Icon size={10} stroke={1.5} color="currentColor" />
        </span>
      )}
      <span>{detail}</span>
    </div>
  );
}

// ─── Relative time helper ───────────────────────────────────────────────────

function useRelativeTime(isoString: string | null): string {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isoString) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [isoString]);

  if (!isoString) return "never";

  const diff = now - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Status Bar ─────────────────────────────────────────────────────────────

export function StatusBar({ collapsed }: { collapsed: boolean }) {
  const [composioStatus, setComposioStatus] = useState<"ok" | "error">("ok");
  const [langGraphMs] = useState(186);
  const [lastPipelineRun] = useState<string | null>(
    new Date(Date.now() - 3 * 60 * 1000).toISOString()
  );
  const [queueCount] = useState(0);

  const lastRun = useRelativeTime(lastPipelineRun);

  const pills: StatusPill[] = [
    {
      label: "Composio",
      status: composioStatus,
      detail: composioStatus === "ok" ? "connected" : "disconnected",
      icon: composioStatus === "ok" ? IconCircleCheck : IconCircleX,
    },
    {
      label: "LangGraph",
      status: "ok",
      detail: `${langGraphMs}ms`,
      icon: IconCircleCheck,
    },
    {
      label: "Last pipeline",
      status: "idle",
      detail: lastRun,
      icon: IconClock,
    },
    {
      label: "Queue",
      status: queueCount > 0 ? "idle" : "idle",
      detail: queueCount > 0 ? `${queueCount} pending` : "idle",
      icon: IconStack2,
    },
  ];

  if (collapsed) return null;

  return (
    <div
      style={{
        height: 36,
        minHeight: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        borderTop: "1px solid #21262D",
        backgroundColor: "#0D1117",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: "#484F58",
        overflow: "hidden",
      }}
    >
      {/* Left: Status pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
        {pills.map((pill) => (
          <StatusPill key={pill.label} {...pill} />
        ))}
      </div>

      {/* Right: Version + ⌘K */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span
          style={{
            color: "#484F58",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.04em",
          }}
        >
          v{APP_VERSION}
        </span>
        <kbd
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            padding: "1px 5px",
            borderRadius: 3,
            border: "0.5px solid #30363D",
            backgroundColor: "rgba(255,255,255,0.03)",
            color: "#8B949E",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            lineHeight: "16px",
          }}
        >
          <span style={{ fontSize: 10 }}>⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
