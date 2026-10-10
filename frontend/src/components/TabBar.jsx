import { NavLink, useLocation } from "react-router-dom";
import Icon from "./Icon";
import styles from "./TabBar.module.css";

const TABS = [
  { to: "/", label: "Today", icon: "drop", end: true },
  { to: "/forest", label: "Forest", icon: "tree" },
  { to: "/calendar", label: "History", icon: "calendar" },
  { to: "/social", label: "Friends", icon: "people", also: ["/leaderboard"] },
];

export default function TabBar() {
  const pathname = useLocation().pathname.toLowerCase();
  return (
    <nav className={styles.bar} aria-label="Main">
      <ul className={styles.list}>
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => {
                const active = isActive || tab.also?.some((p) => pathname.startsWith(p));
                return `${styles.tab} ${active ? styles.active : ""}`;
              }}
            >
              <Icon name={tab.icon} size={26} strokeWidth={1.9} />
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
