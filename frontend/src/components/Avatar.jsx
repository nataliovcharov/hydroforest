import styles from "./Avatar.module.css";

// Soft gradients that sit well on the green background.
const PALETTES = [
  ["#8fd8ff", "#36a3f2"],
  ["#ffe27a", "#f4b740"],
  ["#c6ecc9", "#5da271"],
  ["#ffb3a7", "#f2786a"],
  ["#d9c2ff", "#9b7be8"],
  ["#ffd6a5", "#e9a36b"],
];

function paletteFor(name = "") {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

/** Initials on a colored circle. The same name always gets the same color. */
export default function Avatar({ name = "", size = 40, className = "" }) {
  const [from, to] = paletteFor(name);
  return (
    <span
      className={`${styles.avatar} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(160deg, ${from}, ${to})`,
      }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
