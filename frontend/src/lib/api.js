import { clearToken, getToken } from "./token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// The backend returns errors in a few different shapes. Pick the first readable message.
function messageFrom(data) {
  if (!data || typeof data !== "object") return null;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg;
  return null;
}

/**
 * Calls the HydroForest API and returns the parsed JSON body.
 *
 * - Adds the saved login token.
 * - Throws an ApiError with a readable message when the request fails.
 * - On 401 the session is cleared and the app sends the user to the login page.
 *   Pass `logoutOn401: false` where 401 means something else (wrong current password).
 */
export async function api(path, { method = "GET", body, signal, logoutOn401 = true } = {}) {
  const token = getToken();
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Can't reach HydroForest. Check your connection and try again.", 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some errors (for example from Passport) are plain text.
  }

  if (response.status === 401 && logoutOn401) {
    clearToken();
    window.dispatchEvent(new Event("hydroforest:logout"));
    throw new ApiError("Your session has ended. Please log in again.", 401);
  }

  if (!response.ok) {
    throw new ApiError(messageFrom(data) || "Something went wrong. Please try again.", response.status);
  }

  return data;
}
