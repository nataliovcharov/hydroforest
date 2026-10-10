import { useId } from "react";
import { motion } from "framer-motion";
import styles from "./SegmentedControl.module.css";

/** iOS-style segmented control. Built on radio inputs, so it works with a keyboard and screen readers. */
export default function SegmentedControl({ label, options, value, onChange, className = "" }) {
  const name = useId();
  return (
    <div className={`${styles.control} ${className}`} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label key={option.value} className={`${styles.segment} ${checked ? styles.checked : ""}`}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="visually-hidden"
            />
            {checked && (
              <motion.span
                layoutId={`thumb-${name}`}
                className={styles.thumb}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className={styles.text}>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
