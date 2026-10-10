import { Link } from "react-router-dom";
import Icon from "./Icon";
import styles from "./NavBar.module.css";

/** Top bar for pushed screens: a back link on the left, like an iOS navigation bar. */
export default function NavBar({ backTo, backLabel = "Back", children }) {
  return (
    <div className={styles.bar}>
      <Link to={backTo} className={styles.back}>
        <Icon name="chevron-left" size={24} strokeWidth={2.4} />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}
