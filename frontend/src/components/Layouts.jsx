import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../lib/session";
import TabBar from "./TabBar";
import Avatar from "./Avatar";

/** Pages that need a login. Without a token the user goes to /login and comes back afterwards. */
export function RequireAuth() {
  const { isLoggedIn } = useSession();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/**
 * Login and signup screens. Logged-in users skip straight to the app, back to the page
 * they originally asked for. This also handles the redirect right after logging in.
 */
export function GuestOnly() {
  const { isLoggedIn } = useSession();
  const location = useLocation();
  if (isLoggedIn) return <Navigate to={location.state?.from ?? "/"} replace />;
  return <Outlet />;
}

/** The four main tabs share the bottom tab bar. */
export function TabLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}

/** Large title header with the account button on the right, like the App Store. */
export function PageHeader({ eyebrow, title, children }) {
  const { user } = useSession();
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="large-title">{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {children}
        <Link to="/account" aria-label="Account" style={{ borderRadius: "50%" }}>
          <Avatar name={user?.username ?? ""} size={38} />
        </Link>
      </div>
    </header>
  );
}
