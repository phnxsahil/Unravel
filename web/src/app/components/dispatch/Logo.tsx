import React, { useState } from "react";

interface LogoProps {
  size?: number; // font size
  dark?: boolean;
}

export function Logo({ size = 14, dark = false }: LogoProps) {
  const [hovered, setHovered] = useState(false);

  const colors = {
    linkedin: "#0A66C2",
    x: dark ? "#FAFAF8" : "#0F0F0D",
    reddit: "#FF4500",
    threads: "#F59E0B",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        position: "relative",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes byline-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .byline-cursor-blink {
          animation: byline-blink 1s step-start infinite;
        }
      `}</style>
      
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "Space Grotesk, system-ui, sans-serif",
            fontSize: size,
            fontWeight: size > 16 ? 600 : 500,
            color: dark ? "#FAFAF8" : "var(--text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            transition: "color 0.3s ease",
          }}
        >
          byline
        </span>
        <span
          className="byline-cursor-blink"
          style={{
            display: "inline-block",
            width: size * 0.38,
            height: size * 0.12,
            backgroundColor: hovered ? "#E85E2C" : "rgba(232,94,44,0.75)",
            marginLeft: 2,
            transition: "background-color 0.2s ease",
          }}
        />
      </div>

      {/* Underline container */}
      <div style={{ position: "relative", width: "100%", height: 6, marginTop: 2 }}>
        {/* Baseline unified line (fades out on hover) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 2,
            height: 1,
            backgroundColor: "rgba(232,94,44,0.8)",
            transition: "opacity 0.2s ease",
            opacity: hovered ? 0 : 1,
          }}
        />

        {/* 4 platform lines that split on hover */}
        {/* LinkedIn line: slides Up & Left */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 2,
            height: 1,
            backgroundColor: colors.linkedin,
            opacity: hovered ? 0.95 : 0,
            transform: hovered ? "translate(-3px, -2px)" : "translate(0, 0)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        />

        {/* X line: slides Up & Right */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 2,
            height: 1,
            backgroundColor: colors.x,
            opacity: hovered ? 0.95 : 0,
            transform: hovered ? "translate(3px, -1px)" : "translate(0, 0)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        />

        {/* Reddit line: slides Down & Left */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 2,
            height: 1,
            backgroundColor: colors.reddit,
            opacity: hovered ? 0.95 : 0,
            transform: hovered ? "translate(-2px, 2px)" : "translate(0, 0)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        />

        {/* Threads line: slides Down & Right */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 2,
            height: 1,
            backgroundColor: colors.threads,
            opacity: hovered ? 0.95 : 0,
            transform: hovered ? "translate(2px, 1px)" : "translate(0, 0)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
