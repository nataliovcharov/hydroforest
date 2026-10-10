import { useId } from "react";
import { motion } from "framer-motion";

/**
 * Circular progress like the Activity rings. `progress` is 0..1 (values above 1 show a full ring).
 * Children are drawn in the middle.
 */
export default function ProgressRing({
  progress,
  size = 260,
  stroke = 18,
  track = "rgba(255,255,255,0.18)",
  colors = ["#8fd8ff", "#36a3f2"],
  label,
  children,
  animate = true,
}) {
  // useId output can contain characters that break SVG url(#id) references.
  const gradientId = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <div
      style={{ position: "relative", width: size, maxWidth: "100%", aspectRatio: "1 / 1" }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference, opacity: 0 } : false}
          // A round line cap still draws a dot at 0%, so hide the arc until there is progress.
          animate={{ strokeDashoffset: circumference * (1 - clamped), opacity: clamped === 0 ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </svg>
      {children && (
        <div
          style={{
            position: "absolute",
            inset: `${((stroke + 8) / size) * 100}%`,
            display: "grid",
            placeItems: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
