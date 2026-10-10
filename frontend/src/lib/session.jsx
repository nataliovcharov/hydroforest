import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { clearToken, getToken, readPreference, setToken, writePreference } from "./token";
import { UNITS } from "./hydration";

const SessionContext = createContext(null);

/**
 * Holds who is logged in, their profile and app-wide preferences (water unit).
 * Pages read it with useSession().
 */
export function SessionProvider({ children }) {
  const [token, setTokenState] = useState(getToken);
  const [user, setUser] = useState(null);
  const [unit, setUnitState] = useState(() => {
    const saved = readPreference("unit", "cups");
    return UNITS[saved] ? saved : "cups";
  });

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken) => {
    setToken(newToken);
    setTokenState(newToken);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api("/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  // Load the profile whenever we get a token.
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    api("/auth/me", { signal: controller.signal })
      .then((data) => setUser(data.user))
      .catch(() => {});
    return () => controller.abort();
  }, [token]);

  // The API client fires this when the server rejects the token.
  useEffect(() => {
    window.addEventListener("hydroforest:logout", logout);
    return () => window.removeEventListener("hydroforest:logout", logout);
  }, [logout]);

  const setUnit = useCallback((next) => {
    setUnitState(next);
    writePreference("unit", next);
  }, []);

  const value = useMemo(
    () => ({ token, user, isLoggedIn: Boolean(token), login, logout, refreshUser, unit, setUnit }),
    [token, user, login, logout, refreshUser, unit, setUnit]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>");
  return value;
}
