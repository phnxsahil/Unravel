import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

// ─── Simple fuzzy match ─────────────────────────────────────────────────────

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

// ─── Command Palette ────────────────────────────────────────────────────────

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter + group
  const filtered = query
    ? commands.filter((c) => fuzzyMatch(query, c.label))
    : commands;

  const grouped = filtered.reduce<{ group: string; items: typeof filtered }[]>(
    (acc, cmd) => {
      const last = acc[acc.length - 1];
      if (last && last.group === cmd.group) {
        last.items.push(cmd);
      } else {
        acc.push({ group: cmd.group, items: [cmd] });
      }
      return acc;
    },
    []
  );

  // Flat index for keyboard nav
  const flatItems = filtered;
  useEffect(() => { setSelectedIdx(0); }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, flatItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && flatItems[selectedIdx]) {
        flatItems[selectedIdx].action();
        onClose();
      }
    },
    [flatItems, selectedIdx, onClose]
  );

  // Click outside
  const overlayRef = useRef<HTMLDivElement>(null);
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-selected=true]") as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  let flatCounter = 0;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          backgroundColor: "#161B22",
          border: "1px solid #30363D",
          borderRadius: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
          overflow: "hidden",
          animation: "cp-scale-in 0.12s ease-out",
        }}
      >
        <style>{`
          @keyframes cp-scale-in {
            from { opacity: 0; transform: scale(0.96) translateY(-4px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes cp-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .cp-overlay { animation: cp-fade-in 0.1s ease-out; }
        `}</style>

        {/* ── Search input ──────────────────────────────── */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #21262D" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#E6EDF3",
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 14,
              lineHeight: "28px",
            }}
          />
        </div>

        {/* ── Results ───────────────────────────────────── */}
        <div
          ref={listRef}
          style={{
            maxHeight: 320,
            overflowY: "auto",
            padding: "6px 0",
          }}
        >
          {grouped.length === 0 && (
            <div style={{ padding: "20px 14px", textAlign: "center", fontFamily: "'IBM Plex Sans'", fontSize: 13, color: "#484F58" }}>
              No results for <span style={{ color: "#8B949E" }}>"{query}"</span>
            </div>
          )}
          {grouped.map((group) => (
            <div key={group.group}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  color: "#484F58",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "8px 14px 4px",
                }}
              >
                {group.group}
              </div>
              {group.items.map((cmd) => {
                const idx = flatCounter++;
                const isSelected = idx === selectedIdx;
                return (
                  <div
                    key={cmd.id}
                    data-selected={isSelected}
                    onClick={() => { cmd.action(); onClose(); }}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 14px",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "rgba(240,165,0,0.08)" : "transparent",
                      borderLeft: isSelected ? "2px solid #F0A500" : "2px solid transparent",
                      transition: "background-color 0.08s ease",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                        fontSize: 13,
                        color: isSelected ? "#E6EDF3" : "#8B949E",
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 9,
                          color: "#484F58",
                          padding: "1px 5px",
                          borderRadius: 3,
                          border: "0.5px solid #30363D",
                          backgroundColor: "rgba(255,255,255,0.03)",
                          lineHeight: "16px",
                        }}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Footer hint ───────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 14px",
            borderTop: "1px solid #21262D",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: "#484F58",
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
