import React from "react";

interface TerminalBlockProps {
  label?: string;
  children: React.ReactNode;
}

export function TerminalBlock({ label, children }: TerminalBlockProps) {
  return (
    <div
      style={{
        backgroundColor: "#1A1A18",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {label && (
        <div
          style={{
            padding: "9px 16px",
            borderBottom: "0.5px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Traffic-light dot — single accent dot */}
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#E85E2C",
              opacity: 0.75,
            }}
          />
          <span
            style={{
              fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: 11,
              color: "#6B6960",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>
        </div>
      )}

      <pre
        style={{
          margin: 0,
          padding: "20px 20px",
          fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: 12,
          lineHeight: 1.75,
          color: "#D4CFC6",
          whiteSpace: "pre",
          overflowX: "auto",
        }}
      >
        {children}
      </pre>
    </div>
  );
}
