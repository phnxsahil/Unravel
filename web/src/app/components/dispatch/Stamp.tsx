import { motion } from "motion/react";

interface StampProps {
  size?: number;
}

export function Stamp({ size = 64 }: StampProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ width: size, height: size, display: "inline-flex", flexShrink: 0 }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Full circle starting at top (32,5), going clockwise */}
          <path id="stamp-ring" d="M 32 6 a 26 26 0 1 1 -0.001 0" />
        </defs>

        {/* Dashed border ring */}
        <circle
          cx="32"
          cy="32"
          r="30"
          stroke="#E85E2C"
          strokeWidth="1"
          strokeDasharray="3 2.2"
        />

        {/* Inner hairline ring */}
        <circle
          cx="32"
          cy="32"
          r="26.5"
          stroke="#E85E2C"
          strokeWidth="0.4"
          strokeOpacity="0.35"
        />

        {/* Text around the rim */}
        <text
          fill="#E85E2C"
          fontSize="6.5"
          fontFamily="'IBM Plex Sans', system-ui, sans-serif"
          fontWeight="600"
        >
          <textPath href="#stamp-ring" letterSpacing="21">
            BYLINE
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
}
