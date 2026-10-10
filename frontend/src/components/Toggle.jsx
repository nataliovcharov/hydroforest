import styles from "./Toggle.module.css";

/** iOS-style switch built on a checkbox with role="switch". */
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={styles.toggle}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
      disabled={disabled}
    />
  );
}
