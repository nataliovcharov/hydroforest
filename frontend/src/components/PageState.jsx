import Icon from "./Icon";

/** Loading placeholders that roughly match the page layout. */
export function Skeleton({ rows = 3, height = 64 }) {
  return (
    <div style={{ display: "grid", gap: 12 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}

/** Shown when a page could not load, with a way to try again. */
export function ErrorState({ error, onRetry }) {
  return (
    <div className="card card--padded" role="alert" style={{ textAlign: "center", display: "grid", gap: 12 }}>
      <Icon name="info" size={32} />
      <p className="headline">Couldn't load this</p>
      <p className="subhead">{error?.message}</p>
      {onRetry && (
        <button type="button" className="btn btn--glass btn--small" onClick={onRetry} style={{ justifySelf: "center" }}>
          Try again
        </button>
      )}
    </div>
  );
}

/** Friendly empty screen with an icon and a short explanation. */
export function EmptyState({ icon, title, children }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 16px", display: "grid", gap: 8, justifyItems: "center" }}>
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--glass-strong)",
        }}
      >
        <Icon name={icon} size={28} />
      </span>
      <p className="headline">{title}</p>
      <p className="subhead">{children}</p>
    </div>
  );
}
