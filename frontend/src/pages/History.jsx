import { useMemo, useState } from "react";
import { useApi } from "../lib/useApi";
import { useSession } from "../lib/session";
import {
  DAILY_GOAL_ML,
  dateFromKey,
  dayKeyFromApi,
  dayKeyFromLocal,
  formatAmount,
  formatLitres,
} from "../lib/hydration";
import { PageHeader } from "../components/Layouts";
import ProgressRing from "../components/ProgressRing";
import Icon from "../components/Icon";
import { ErrorState, Skeleton } from "../components/PageState";
import styles from "./History.module.css";

const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const dayLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
const weekdayLabel = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
// Monday-first week, starting from a known Monday.
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => weekdayLabel.format(new Date(2024, 0, 1 + i)));

function monthDays(year, month) {
  const first = new Date(year, month, 1);
  const leading = (first.getDay() + 6) % 7; // Monday = 0
  const count = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: count }, (_, i) => dayKeyFromLocal(new Date(year, month, i + 1))),
  ];
}

export default function History() {
  const { unit } = useSession();
  const { data, error, reload } = useApi("/calendar");
  const todayKey = dayKeyFromLocal(new Date());
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const entry of data?.hydrationData ?? []) map.set(dayKeyFromApi(entry.date), entry);
    return map;
  }, [data]);

  const days = monthDays(cursor.year, cursor.month);
  const monthEntries = days.filter(Boolean).map((key) => byDay.get(key)).filter(Boolean);
  const goalDays = monthEntries.filter((e) => e.amount >= DAILY_GOAL_ML).length;
  const average = monthEntries.length
    ? monthEntries.reduce((sum, e) => sum + e.amount, 0) / monthEntries.length
    : 0;
  const isCurrentMonth =
    cursor.year === new Date().getFullYear() && cursor.month === new Date().getMonth();

  const move = (delta) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const selected = byDay.get(selectedKey);

  return (
    <div className="page">
      <PageHeader title="History" />

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <Skeleton rows={2} height={180} />
      ) : (
        <>
          <section className="card card--padded" aria-label="Calendar">
            <div className={styles.monthBar}>
              <h2 className="headline" aria-live="polite">
                {monthLabel.format(new Date(cursor.year, cursor.month, 1))}
              </h2>
              <div className={styles.monthNav}>
                <button type="button" onClick={() => move(-1)} aria-label="Previous month">
                  <Icon name="chevron-left" size={22} strokeWidth={2.2} />
                </button>
                <button type="button" onClick={() => move(1)} aria-label="Next month" disabled={isCurrentMonth}>
                  <Icon name="chevron-right" size={22} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            <div className={styles.grid}>
              {WEEKDAYS.map((label, i) => (
                <span key={i} className={styles.weekday} aria-hidden="true">
                  {label}
                </span>
              ))}
              {days.map((key, i) => {
                if (!key) return <span key={`empty-${i}`} />;
                const entry = byDay.get(key);
                const future = key > todayKey;
                const progress = entry ? entry.amount / DAILY_GOAL_ML : 0;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.day} ${key === selectedKey ? styles.selected : ""} ${
                      key === todayKey ? styles.today : ""
                    }`}
                    onClick={() => setSelectedKey(key)}
                    disabled={future}
                    aria-pressed={key === selectedKey}
                    aria-label={`${dayLabel.format(dateFromKey(key))}: ${
                      entry ? formatAmount(entry.amount, unit) : "nothing logged"
                    }`}
                  >
                    <ProgressRing
                      progress={progress}
                      size={36}
                      stroke={4}
                      animate={false}
                      colors={progress >= 1 ? ["#c6ecc9", "#a3da8d"] : ["#8fd8ff", "#36a3f2"]}
                    >
                      <span />
                    </ProgressRing>
                    <span className={`${styles.dayNumber} numeric`}>{Number(key.slice(8))}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="card card--padded" style={{ marginTop: 16 }} aria-live="polite">
            <p className="eyebrow">{dayLabel.format(dateFromKey(selectedKey))}</p>
            {selected ? (
              <div className={styles.detail}>
                <div>
                  <p className={`${styles.detailAmount} numeric`}>{formatAmount(selected.amount, unit)}</p>
                  <p className="subhead">
                    {selected.amount >= DAILY_GOAL_ML
                      ? "Goal reached"
                      : `${Math.round((selected.amount / DAILY_GOAL_ML) * 100)}% of your goal`}
                  </p>
                </div>
                {selected.unlockedPlant && (
                  <span className="pill">
                    <Icon name="leaf" size={16} />
                    Grew {selected.unlockedPlant}
                  </span>
                )}
              </div>
            ) : (
              <p className="subhead" style={{ marginTop: 6 }}>
                {selectedKey === todayKey ? "Nothing logged yet today." : "Nothing logged this day."}
              </p>
            )}
          </section>

          <h2 className="section-title section">This month</h2>
          <div className={styles.summary}>
            <div className="card card--padded">
              <p className={`${styles.summaryValue} numeric`}>{goalDays}</p>
              <p className="footnote">{goalDays === 1 ? "Day at goal" : "Days at goal"}</p>
            </div>
            <div className="card card--padded">
              <p className={`${styles.summaryValue} numeric`}>
                {average ? formatAmount(average, unit, { withUnit: false }) : "–"}
              </p>
              <p className="footnote">Average {unit === "cups" ? "cups" : unit} a day</p>
            </div>
            <div className="card card--padded">
              <p className={`${styles.summaryValue} numeric`}>
                {formatLitres(monthEntries.reduce((sum, e) => sum + e.amount, 0))}
              </p>
              <p className="footnote">Total</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
