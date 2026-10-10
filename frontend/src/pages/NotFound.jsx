import { Link } from "react-router-dom";
import { EmptyState } from "../components/PageState";

export default function NotFound() {
  return (
    <main className="page page--no-tabbar" style={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
      <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
        <EmptyState icon="leaf" title="Nothing grows here">
          This page doesn't exist.
        </EmptyState>
        <Link to="/" className="btn btn--primary">
          Go to Today
        </Link>
      </div>
    </main>
  );
}
