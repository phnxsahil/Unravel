import React from "react";

interface ButtonProps {
  variant?: "primary" | "ghost";
  size?: "default" | "sm";
  dark?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  cursor: "pointer",
  transition: "opacity 0.12s ease, background-color 0.12s ease",
  outline: "none",
  whiteSpace: "nowrap",
};

export function Button({
  variant = "primary",
  size = "default",
  dark = false,
  children,
  onClick,
}: ButtonProps) {
  const fontSize = size === "sm" ? 12 : 13;
  const padding = size === "sm" ? "5px 11px" : "7px 15px";

  const variantStyle: React.CSSProperties =
    variant === "primary"
      ? {
          backgroundColor: "#E85E2C",
          color: "#F5F2EC",
          border: "0.5px solid #E85E2C",
        }
      : dark
      ? {
          backgroundColor: "transparent",
          color: "#A8A49A",
          border: "0.5px solid rgba(255,255,255,0.15)",
        }
      : {
          backgroundColor: "transparent",
          color: "#0F0F0D",
          border: "0.5px solid rgba(15,15,13,0.22)",
        };

  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variantStyle, fontSize, padding }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.opacity = "0.82";
        } else {
          e.currentTarget.style.borderColor = dark
            ? "rgba(255,255,255,0.35)"
            : "rgba(15,15,13,0.45)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.borderColor = dark
          ? "rgba(255,255,255,0.15)"
          : variant === "primary"
          ? "#E85E2C"
          : "rgba(15,15,13,0.22)";
      }}
    >
      {children}
    </button>
  );
}
