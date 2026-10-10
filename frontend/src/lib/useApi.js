import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/**
 * Loads data from an API path and keeps loading and error state.
 * `reload()` fetches again, `setData()` updates the cached result after a change.
 */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError") setState((s) => ({ ...s, error, loading: false }));
      });
    return () => controller.abort();
  }, [path, attempt]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setAttempt((n) => n + 1);
  }, []);

  const setData = useCallback((update) => {
    setState((s) => ({ ...s, data: typeof update === "function" ? update(s.data) : update }));
  }, []);

  return { ...state, reload, setData };
}
