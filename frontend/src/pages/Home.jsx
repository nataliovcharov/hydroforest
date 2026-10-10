import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { useSession } from "../lib/session";
import { useToast } from "../lib/toast";
import { DAILY_GOAL_ML, UNITS, formatAmount, nextStageFor, stageFor, toMl } from "../lib/hydration";
import { PageHeader } from "../components/Layouts";
import ProgressRing from "../components/ProgressRing";
import SegmentedControl from "../components/SegmentedControl";
import Sheet from "../components/Sheet";
import Icon from "../components/Icon";
import { ErrorState } from "../components/PageState";
import styles from "./Home.module.css";

const todayLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { unit, setUnit } = useSession();
  const toast = useToast();
  const { data, error, loading, reload, setData } = useApi("/Home/data");
  const [logging, setLogging] = useState(false);
  const [drops, setDrops] = useState([]);
  const [treeSheet, setTreeSheet] = useState(false);
  const [customSheet, setCustomSheet] = useState(false);
  const [unlocked, setUnlocked] = useState(null);
  const dropId = useRef(0);

  const intake = data?.totalIntake ?? 0;
  const stage = stageFor(intake);
  const next = nextStageFor(intake);
  const progress = intake / DAILY_GOAL_ML;
  const selected = data?.trees?.find((tree) => tree.name === data.selectedTree);

  const logWater = async (amountMl) => {
    if (logging || amountMl <= 0) return;
    setLogging(true);
    const id = ++dropId.current;
    setDrops((d) => [...d, id]);
    setTimeout(() => setDrops((d) => d.filter((x) => x !== id)), 900);
    try {
      const result = await api("/Home/log-water", { method: "POST", body: { amount: amountMl } });
      setData((current) => ({
        ...current,
        totalIntake: result.totalIntake,
        currentStage: result.currentStage,
        treeImage: result.treeImage,
        hasUnlockedTree: result.hasUnlockedTree,
      }));
      toast(`Added ${formatAmount(amountMl, unit)}`, { icon: "drop-fill" });
      if (result.justUnlocked) setTimeout(() => setUnlocked(result.selectedTree), 900);
      // Refresh in the background so the streak stays current.
      api("/Home/data")
        .then(setData)
        .catch(() => {});
    } catch (err) {
      toast(err.message, { icon: "info" });
    } finally {
      setLogging(false);
    }
  };

  const chooseTree = async (name) => {
    try {
      await api("/Home/select-tree", { method: "POST", body: { selectedTree: name } });
      const fresh = await api("/Home/data");
      setData(fresh);
      setTreeSheet(false);
      toast(`Now growing ${name}`, { icon: "leaf" });
    } catch (err) {
      toast(err.message, { icon: "info" });
    }
  };

  return (
    <div className="page">
      <PageHeader eyebrow={todayLabel.format(new Date())} title="Today" />

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <section className={styles.hero} aria-busy={loading && !data}>
            <p className="subhead">
              {greeting()}
              {data?.user?.username ? `, ${data.user.username}` : ""}
            </p>

            <div className={styles.ringWrap}>
              <ProgressRing
                progress={progress}
                size={280}
                stroke={20}
                colors={progress >= 1 ? ["#d4f5c4", "#8fd17a"] : undefined}
                label={`${Math.round(progress * 100)} percent of today's goal`}
              >
                <div className={styles.pot}>
                  <AnimatePresence mode="wait">
                    {data?.treeImage && (
                      <motion.img
                        key={data.treeImage}
                        src={data.treeImage}
                        alt={`${data.selectedTree}, ${stage.label.toLowerCase()} stage`}
                        className={styles.tree}
                        initial={{ opacity: 0, scale: 0.85, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </ProgressRing>
              <AnimatePresence>
                {drops.map((id) => (
                  <motion.span
                    key={id}
                    className={styles.drop}
                    initial={{ y: -40, opacity: 0, scale: 0.6 }}
                    animate={{ y: 90, opacity: [0, 1, 1, 0], scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeIn" }}
                    aria-hidden="true"
                  >
                    <Icon name="drop-fill" size={34} strokeWidth={1.4} />
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <p className={styles.amount}>
              <span className={`${styles.amountValue} numeric`}>{formatAmount(intake, unit, { withUnit: false })}</span>
              <span className={styles.amountGoal}>of {formatAmount(DAILY_GOAL_ML, unit)}</span>
            </p>
            <p className={styles.stage}>
              {next ? (
                <>
                  <strong>{stage.label}</strong> · {formatAmount(next.from - intake, unit)} to {next.label.toLowerCase()}
                </>
              ) : (
                <>
                  <strong>Goal reached.</strong> Your {data?.selectedTree} is fully grown.
                </>
              )}
            </p>

            <div className={styles.pills}>
              {data?.user?.currentStreak > 0 && (
                <span className="pill">
                  <Icon name="flame" size={18} className={styles.flame} />
                  {data.user.currentStreak}-day streak
                </span>
              )}
              {selected && (
                <button type="button" className="pill" onClick={() => setTreeSheet(true)}>
                  <img src={selected.stages.adultTree} alt="" className={styles.pillTree} />
                  {selected.name}
                  <Icon name="chevron-right" size={16} strokeWidth={2.2} />
                </button>
              )}
            </div>
          </section>

          <section className={`card card--padded ${styles.logCard}`} aria-labelledby="add-water">
            <div className={styles.logHeader}>
              <h2 id="add-water" className="headline">
                Add water
              </h2>
              <SegmentedControl
                label="Unit"
                value={unit}
                onChange={setUnit}
                options={Object.values(UNITS).map((u) => ({ value: u.key, label: u.label }))}
                className={styles.units}
              />
            </div>
            <div className={styles.presets}>
              {UNITS[unit].presets.map((amount, index) => (
                <button
                  key={amount}
                  type="button"
                  className={styles.preset}
                  onClick={() => logWater(toMl(amount, unit))}
                  disabled={logging || !data}
                >
                  <Icon name="drop-fill" size={18 + index * 6} strokeWidth={1.2} className={styles.presetIcon} />
                  <span className={styles.presetAmount}>+{formatAmount(toMl(amount, unit), unit)}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--plain btn--block"
              onClick={() => setCustomSheet(true)}
              disabled={!data}
            >
              <Icon name="plus" size={18} strokeWidth={2.2} />
              Other amount
            </button>
          </section>
        </>
      )}

      <TreeSheet
        open={treeSheet}
        onClose={() => setTreeSheet(false)}
        trees={data?.trees ?? []}
        selected={data?.selectedTree}
        locked={data?.hasUnlockedTree}
        onChoose={chooseTree}
      />
      <CustomAmountSheet
        open={customSheet}
        onClose={() => setCustomSheet(false)}
        unit={unit}
        onAdd={(ml) => {
          setCustomSheet(false);
          logWater(ml);
        }}
      />
      <UnlockSheet name={unlocked} tree={data?.trees?.find((t) => t.name === unlocked)} onClose={() => setUnlocked(null)} />
    </div>
  );
}

function TreeSheet({ open, onClose, trees, selected, locked, onChoose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Choose a tree">
      <p className="subhead" style={{ marginBottom: 16 }}>
        {locked
          ? "You've already grown today's tree. You can pick a new one tomorrow."
          : "This tree grows as you drink today. Reach your goal to add it to your forest."}
      </p>
      <div className={styles.treeGrid}>
        {trees.map((tree) => {
          const isSelected = tree.name === selected;
          return (
            <button
              key={tree.name}
              type="button"
              className={`${styles.treeOption} ${isSelected ? styles.treeSelected : ""}`}
              onClick={() => onChoose(tree.name)}
              disabled={locked || isSelected}
              aria-pressed={isSelected}
            >
              <span className={styles.treeThumb}>
                <img src={tree.stages.adultTree} alt="" />
              </span>
              <span className={styles.treeName}>{tree.name}</span>
              {isSelected && (
                <span className={styles.treeCheck}>
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function CustomAmountSheet({ open, onClose, unit, onAdd }) {
  const [value, setValue] = useState("");
  const amount = Number(value);
  const valid = Number.isFinite(amount) && amount > 0 && toMl(amount, unit) <= 5000;

  return (
    <Sheet open={open} onClose={onClose} title="Add water">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          onAdd(toMl(amount, unit));
          setValue("");
        }}
        style={{ display: "grid", gap: 16 }}
      >
        <label className={styles.customField}>
          <span className="visually-hidden">Amount in {UNITS[unit].many}</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`${styles.customInput} numeric`}
          />
          <span className={styles.customUnit}>{UNITS[unit].many}</span>
        </label>
        {value && !valid && <p className="footnote">Enter an amount up to {formatAmount(5000, unit)}.</p>}
        <button type="submit" className="btn btn--water btn--block" disabled={!valid}>
          <Icon name="drop-fill" size={18} strokeWidth={1.4} />
          Add {valid ? formatAmount(toMl(amount, unit), unit) : ""}
        </button>
      </form>
    </Sheet>
  );
}

function UnlockSheet({ name, tree, onClose }) {
  return (
    <Sheet open={Boolean(name)} onClose={onClose} title="Goal reached" hideTitle>
      <div className={styles.unlock}>
        <motion.div
          className={styles.unlockPot}
          initial={{ scale: 0.6, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}
        >
          {tree && <img src={tree.stages.adultTree} alt="" />}
        </motion.div>
        <p className="eyebrow">Goal reached</p>
        <h2 className="title">You grew a {name}!</h2>
        <p className="subhead">It's been planted in your forest. Come back tomorrow to grow another.</p>
        <Link to="/forest" className="btn btn--primary btn--block" onClick={onClose}>
          See your forest
        </Link>
      </div>
    </Sheet>
  );
}
