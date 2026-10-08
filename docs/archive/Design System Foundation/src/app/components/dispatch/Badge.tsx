import React from "react";

interface BadgeProps {
  variant?: "default" | "accent" | "success" | "dark";
  children: React.ReactNode;
}

const variants: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "#EDEAE2",
    color: "#6B6960",
    border: "0.5px solid rgba(15,15,13,0.12)",
  },
  accent: {
    backgroundColor: "rgba(232,94,44,0.07)",
    color: "#E85E2C",
    border: "0.5px solid rgba(232,94,44,0.22)",
  },
  success: {
    backgroundColor: "rgba(34,197,94,0.07)",
    color: "#16A34A",
    border: "0.5px solid rgba(34,197,94,0.22)",
  },
  dark: {
    backgroundColor: "#0F0F0D",
    color: "#A8A49A",
    border: "0.5px solid rgba(255,255,255,0.1)",
  },
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      style={{
        ...variants[variant],
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: 4,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        lineHeight: 1.5,
      }}
    >
      {children}
    </span>
  );
}
