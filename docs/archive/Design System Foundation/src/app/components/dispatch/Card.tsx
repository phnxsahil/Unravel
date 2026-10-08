import React from "react";

interface CardProps {
  variant?: "light" | "dark";
  meta?: string;
  title?: string;
  description?: string;
  timestamp?: string;
  children?: React.ReactNode;
}

export function Card({
  variant = "light",
  meta,
  title,
  description,
  timestamp,
  children,
}: CardProps) {
  const isDark = variant === "dark";

  const surface: React.CSSProperties = isDark
    ? {
        backgroundColor: "#1A1A18",
        border: "0.5px solid rgba(255,255,255,0.08)",
        color: "#EDEAE2",
      }
    : {
        backgroundColor: "#F5F2EC",
        border: "0.5px solid rgba(15,15,13,0.1)",
        color: "#0F0F0D",
      };

  return (
    <div
      style={{
        ...surface,
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {meta && (
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: isDark ? "#6B6960" : "#A8A49A",
            marginBottom: 10,
          }}
        >
          {meta}
        </div>
      )}

      {title && (
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.35,
            color: isDark ? "#EDEAE2" : "#0F0F0D",
            marginBottom: description ? 10 : 0,
          }}
        >
          {title}
        </div>
      )}

      {description && (
        <div
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 400,
            lineHeight: 1.6,
            color: isDark ? "#6B6960" : "#6B6960",
          }}
        >
          {description}
        </div>
      )}

      {children}

      {timestamp && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: isDark
              ? "0.5px solid rgba(255,255,255,0.06)"
              : "0.5px solid rgba(15,15,13,0.08)",
            fontFamily: "JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: 11,
            color: isDark ? "#6B6960" : "#A8A49A",
            letterSpacing: "0.02em",
          }}
        >
          {timestamp}
        </div>
      )}
    </div>
  );
}
