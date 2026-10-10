import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { useSession } from "../lib/session";
import { useToast } from "../lib/toast";
import { UNITS, formatLitres } from "../lib/hydration";
import NavBar from "../components/NavBar";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import Toggle from "../components/Toggle";
import Sheet from "../components/Sheet";
import SegmentedControl from "../components/SegmentedControl";
import { ErrorState, Skeleton } from "../components/PageState";
import styles from "./Account.module.css";

function RowIcon({ name, color }) {
  return (
    <span className="list-row__icon" style={{ background: color }}>
      <Icon name={name} size={18} strokeWidth={2} />
    </span>
  );
}

export default function Account() {
  const { logout, unit, setUnit } = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error, reload, setData } = useApi("/MyAccount/account");
  const [help, setHelp] = useState(false);
  const account = data?.data;

  const toggleNotifications = async (enabled) => {
    setData((d) => ({ ...d, data: { ...d.data, notificationsEnabled: enabled } }));
    try {
      await api("/MyAccount/account/notifications", { method: "POST", body: { notificationsEnabled: enabled } });
    } catch (err) {
      setData((d) => ({ ...d, data: { ...d.data, notificationsEnabled: !enabled } }));
      toast(err.message, { icon: "info" });
    }
  };

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="page page--no-tabbar">
      <NavBar backTo="/" backLabel="Today" />
      <h1 className="large-title" style={{ margin: "4px 0 20px" }}>
        Account
      </h1>

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !account ? (
        <Skeleton rows={3} height={90} />
      ) : (
        <>
          <section className={styles.profile}>
            <Avatar name={account.username} size={84} />
            <div>
              <h2 className="title">{account.username}</h2>
              <p className="subhead">{account.email}</p>
            </div>
          </section>

          <div className={styles.stats}>
            <Stat icon="flame" color="#ffb44d" value={account.currentStreak} label="Day streak" />
            <Stat icon="sparkles" color="var(--sun)" value={account.longestStreak} label="Best streak" />
            <Stat icon="drop-fill" color="var(--water-light)" value={formatLitres(account.totalWaterLogged)} label="Total water" />
            <Stat
              icon="leaf"
              color="var(--green-300)"
              value={account.hydrationData.filter((d) => d.unlockedPlant).length}
              label="Trees grown"
            />
          </div>

          <h2 className="section-title section">Account</h2>
          <div className="card list">
            <Link to="/change-email" className="list-row">
              <RowIcon name="envelope" color="#36a3f2" />
              <span className="list-row__main list-row__title">Email</span>
              <span className="list-row__value">{account.email}</span>
              <Icon name="chevron-right" size={18} strokeWidth={2.2} className="list-row__chevron" />
            </Link>
            <Link to="/change-password" className="list-row">
              <RowIcon name="lock" color="#8e8e93" />
              <span className="list-row__main list-row__title">Password</span>
              <Icon name="chevron-right" size={18} strokeWidth={2.2} className="list-row__chevron" />
            </Link>
          </div>

          <h2 className="section-title section">Preferences</h2>
          <div className="card list">
            <div className="list-row">
              <RowIcon name="bell" color="#ff6b5e" />
              <span className="list-row__main list-row__title">
                Reminders
              </span>
              <Toggle
                label="Reminders"
                checked={Boolean(account.notificationsEnabled)}
                onChange={toggleNotifications}
              />
            </div>
            <div className="list-row">
              <RowIcon name="ruler" color="#5da271" />
              <span className="list-row__main list-row__title">Units</span>
              <SegmentedControl
                label="Units"
                value={unit}
                onChange={setUnit}
                options={Object.values(UNITS).map((u) => ({ value: u.key, label: u.label }))}
                className={styles.units}
              />
            </div>
          </div>

          <h2 className="section-title section">HydroForest</h2>
          <div className="card list">
            <button type="button" className="list-row" onClick={() => setHelp(true)}>
              <RowIcon name="info" color="#36a3f2" />
              <span className="list-row__main list-row__title">How it works</span>
              <Icon name="chevron-right" size={18} strokeWidth={2.2} className="list-row__chevron" />
            </button>
            <Link to="/about" className="list-row">
              <RowIcon name="people" color="#9b7be8" />
              <span className="list-row__main list-row__title">About the team</span>
              <Icon name="chevron-right" size={18} strokeWidth={2.2} className="list-row__chevron" />
            </Link>
          </div>

          <div className="card list section">
            <button type="button" className={`list-row ${styles.logout}`} onClick={signOut}>
              <span className="list-row__main list-row__title">Log out</span>
              <Icon name="logout" size={20} />
            </button>
          </div>
        </>
      )}

      <Sheet open={help} onClose={() => setHelp(false)} title="How HydroForest works">
        <ol className={styles.steps}>
          <li>
            <span>1</span>
            <div>
              <p className="headline">Log your water</p>
              <p className="subhead">Tap a quick amount on the Today screen every time you drink.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <p className="headline">Watch your tree grow</p>
              <p className="subhead">
                It grows from a seed to a sprout, seedling and sapling with every 2 cups.
              </p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <p className="headline">Reach 8 cups</p>
              <p className="subhead">Hit your daily goal and the grown tree is planted in your forest.</p>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <p className="headline">Keep your streak</p>
              <p className="subhead">Log water every day and compare progress with friends.</p>
            </div>
          </li>
        </ol>
      </Sheet>
    </main>
  );
}

function Stat({ icon, color, value, label }) {
  return (
    <div className={`card ${styles.stat}`}>
      <span className={styles.statIcon} style={{ color }}>
        <Icon name={icon} size={20} strokeWidth={1.6} />
      </span>
      <p className={`${styles.statValue} numeric`}>{value}</p>
      <p className="footnote">{label}</p>
    </div>
  );
}
