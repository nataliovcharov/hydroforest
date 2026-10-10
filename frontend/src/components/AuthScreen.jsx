import { useState } from "react";
import { motion } from "framer-motion";
import Icon from "./Icon";
import styles from "./AuthScreen.module.css";

/** Shared frame for login, signup and password reset: the app mark, a title and a form card. */
export function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <main className={styles.screen}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className={styles.mark} aria-hidden="true">
          <img src="/images/tree3/adult_tree.png" alt="" />
        </div>
        <p className={styles.brand}>HydroForest</p>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </motion.div>
    </main>
  );
}

/** Text input inside a grouped field block. */
export function Field({ label, type = "text", ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type={isPassword && visible ? "text" : type}
        style={isPassword ? { paddingRight: 52 } : undefined}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className={styles.reveal}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      )}
    </label>
  );
}

export function SubmitButton({ busy, children, disabled }) {
  return (
    <button type="submit" className="btn btn--primary btn--block" disabled={busy || disabled}>
      {busy ? <span className="spinner" aria-label="Working" /> : children}
    </button>
  );
}
