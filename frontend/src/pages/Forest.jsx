import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApi } from "../lib/useApi";
import { dateFromKey, dayKeyFromApi } from "../lib/hydration";
import { PageHeader } from "../components/Layouts";
import Sheet from "../components/Sheet";
import { ErrorState, Skeleton } from "../components/PageState";
import styles from "./Forest.module.css";

const GRID = 5;
const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export default function Forest() {
  const forest = useApi("/forest");
  const trees = useApi("/trees");
  const [selected, setSelected] = useState(null);

  // One plant per day the goal was reached, oldest first.
  const plants = useMemo(() => {
    if (!forest.data || !trees.data) return [];
    const images = new Map(trees.data.map((t) => [t.name.trim().toLowerCase(), t.stages.adultTree]));
    return [...forest.data.hydrationData]
      .filter((day) => day.unlockedPlant)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => ({
        name: day.unlockedPlant,
        src: images.get(day.unlockedPlant.trim().toLowerCase()),
        day: dayKeyFromApi(day.date),
      }))
      .filter((plant) => plant.src);
  }, [forest.data, trees.data]);

  // The garden shows the 25 most recent plants.
  const visible = plants.slice(-GRID * GRID);
  const tiles = Array.from({ length: GRID * GRID }, (_, i) => visible[i] ?? null);
  const error = forest.error || trees.error;
  const loading = !forest.data || !trees.data;

  return (
    <div className="page">
      <PageHeader title="Forest" />

      {error && loading ? (
        <ErrorState
          error={error}
          onRetry={() => {
            forest.reload();
            trees.reload();
          }}
        />
      ) : loading ? (
        <Skeleton rows={1} height={320} />
      ) : (
        <>
          <div className={styles.stats}>
            <div className="card card--padded">
              <p className={`${styles.statValue} numeric`}>{plants.length}</p>
              <p className="footnote">{plants.length === 1 ? "Tree grown" : "Trees grown"}</p>
            </div>
            <div className="card card--padded">
              <p className={`${styles.statValue} numeric`}>{new Set(plants.map((p) => p.name)).size}</p>
              <p className="footnote">Kinds of trees</p>
            </div>
          </div>

          <div className={styles.stage}>
            <div className={styles.grid} role="list" aria-label="Your forest">
              {tiles.map((plant, index) => {
                const row = Math.floor(index / GRID);
                const col = index % GRID;
                return (
                  <motion.div
                    key={index}
                    role="listitem"
                    className={`${styles.tile} ${plant ? styles.occupied : ""}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (row + col) * 0.05, duration: 0.4 }}
                  >
                    {plant && (
                      <button
                        type="button"
                        className={styles.plant}
                        onClick={() => setSelected(plant)}
                        aria-label={`${plant.name}, grown ${dateLabel.format(dateFromKey(plant.day))}`}
                      >
                        <img src={plant.src} alt="" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {plants.length === 0 ? (
            <div className={`card card--padded ${styles.empty}`}>
              <p className="headline">Your forest is waiting</p>
              <p className="subhead">Reach your daily goal of 8 cups and your tree is planted here.</p>
              <Link to="/" className="btn btn--primary btn--small">
                Log water
              </Link>
            </div>
          ) : (
            <p className="section-footer" style={{ textAlign: "center" }}>
              Each tree is a day you reached your goal. Tap one to see when.
              {plants.length > GRID * GRID && ` Showing your latest ${GRID * GRID}.`}
            </p>
          )}
        </>
      )}

      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected && (
          <div className={styles.detail}>
            <div className={styles.detailPot}>
              <img src={selected.src} alt="" />
            </div>
            <p className="subhead">Grown on {dateLabel.format(dateFromKey(selected.day))}</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
