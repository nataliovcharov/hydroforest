import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { useToast } from "../lib/toast";
import { formatLitres } from "../lib/hydration";
import { PageHeader } from "../components/Layouts";
import SegmentedControl from "../components/SegmentedControl";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import Sheet from "../components/Sheet";
import { EmptyState, ErrorState, Skeleton } from "../components/PageState";
import styles from "./Friends.module.css";

/** Switches between the Friends list and the Leaderboard. */
export function FriendsSwitcher({ current }) {
  const navigate = useNavigate();
  return (
    <SegmentedControl
      label="Friends view"
      value={current}
      onChange={(value) => navigate(value === "friends" ? "/social" : "/leaderboard")}
      options={[
        { value: "friends", label: "Friends" },
        { value: "leaderboard", label: "Leaderboard" },
      ]}
      className={styles.switcher}
    />
  );
}

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Friends() {
  const toast = useToast();
  const { data, error, loading, reload, setData } = useApi("/social");
  const [query, setQuery] = useState("");
  const search = useDebounced(query.trim(), 250);
  const [results, setResults] = useState({ query: "", items: [] });
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const friends = useMemo(() => data?.friends ?? [], [data]);
  const friendIds = useMemo(() => new Set(friends.map((f) => f._id)), [friends]);

  useEffect(() => {
    if (!search) return;
    const controller = new AbortController();
    api(`/social/suggestions?q=${encodeURIComponent(search)}`, { signal: controller.signal })
      .then((res) => setResults({ query: search, items: res.suggestions ?? [] }))
      .catch((err) => {
        if (err.name !== "AbortError") setResults({ query: search, items: [] });
      });
    return () => controller.abort();
  }, [search]);

  // Hide people who are already friends, in case the server includes them.
  const suggestions = results.items.filter((u) => !friendIds.has(u._id));
  const showResults = Boolean(query.trim());

  const add = async (user) => {
    setBusyId(user._id);
    try {
      await api("/social/add", { method: "POST", body: { friendId: user._id } });
      setData((d) => ({ ...d, friends: [...(d?.friends ?? []), user] }));
      setQuery("");
      toast(`Added ${user.username}`, { icon: "people" });
    } catch (err) {
      toast(err.message, { icon: "info" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (user) => {
    setConfirm(null);
    setBusyId(user._id);
    try {
      await api("/social/remove", { method: "POST", body: { friendId: user._id } });
      setData((d) => ({ ...d, friends: d.friends.filter((f) => f._id !== user._id) }));
      toast(`Removed ${user.username}`, { icon: "check" });
    } catch (err) {
      toast(err.message, { icon: "info" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Friends" />
      <FriendsSwitcher current="friends" />

      <label className={styles.search}>
        <Icon name="search" size={18} className={styles.searchIcon} />
        <span className="visually-hidden">Find people by username</span>
        <input
          type="search"
          placeholder="Find people by username"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 20))}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => setQuery("")} aria-label="Clear search">
            <Icon name="close" size={12} strokeWidth={3} />
          </button>
        )}
      </label>

      <AnimatePresence initial={false}>
        {showResults && (
          <motion.section
            className="card"
            style={{ marginTop: 12, overflow: "hidden" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            aria-live="polite"
            aria-label="Search results"
          >
            {results.query !== search ? (
              <p className={styles.searchNote}>Searching…</p>
            ) : suggestions.length === 0 ? (
              <p className={styles.searchNote}>No one called “{search}”.</p>
            ) : (
              <ul className="list">
                {suggestions.map((user) => (
                  <li key={user._id}>
                    <div className="list-row">
                      <Avatar name={user.username} size={36} />
                      <span className="list-row__main list-row__title">{user.username}</span>
                      <button
                        type="button"
                        className="btn btn--primary btn--small"
                        onClick={() => add(user)}
                        disabled={busyId === user._id}
                      >
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <h2 className="section-title section">Your friends</h2>
      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton rows={3} height={60} />
      ) : friends.length === 0 ? (
        <div className="card">
          <EmptyState icon="people" title="Hydrate together">
            Search for friends by username to compare progress on the leaderboard.
          </EmptyState>
        </div>
      ) : (
        <ul className="card list">
          <AnimatePresence initial={false}>
            {friends.map((friend) => (
              <motion.li
                key={friend._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="list-row">
                  <Avatar name={friend.username} size={42} />
                  <div className="list-row__main">
                    <p className="list-row__title">{friend.username}</p>
                    <p className="list-row__subtitle">{formatLitres(friend.totalWaterLogged ?? 0)} logged</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--plain btn--small"
                    onClick={() => setConfirm(friend)}
                    disabled={busyId === friend._id}
                    aria-label={`Remove ${friend.username}`}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Remove
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Sheet open={Boolean(confirm)} onClose={() => setConfirm(null)} title={`Remove ${confirm?.username ?? ""}?`}>
        <p className="subhead" style={{ marginBottom: 20 }}>
          They won't be on your leaderboard anymore. You can add them again any time.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <button type="button" className="btn btn--primary btn--block btn--danger-text" onClick={() => remove(confirm)}>
            Remove friend
          </button>
          <button type="button" className="btn btn--glass btn--block" onClick={() => setConfirm(null)}>
            Cancel
          </button>
        </div>
      </Sheet>
    </div>
  );
}
