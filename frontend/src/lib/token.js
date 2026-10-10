// The login token lives in localStorage so a session survives a page reload.
// Storage can be unavailable (private mode, blocked cookies), so every access is guarded.
const KEY = "token";

export function getToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // Nothing else we can do; the user stays logged in until the page reloads.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}

export function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preferences are a convenience only.
  }
}
