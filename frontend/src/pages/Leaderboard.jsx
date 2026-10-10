import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApi } from "../lib/useApi";
import { formatLitres } from "../lib/hydration";
import { PageHeader } from "../components/Layouts";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { EmptyState, ErrorState, Skeleton } from "../components/PageState";
import { FriendsSwitcher } from "./Friends";
import styles from "./Leaderboard.module.css";

const PODIUM = [
  { place: 2, index: 1, height: 92, color: "var(--silver)" },
  { place: 1, index: 0, height: 124, color: "var(--gold)" },
  { place: 3, index: 2, height: 72, color: "var(--bronze)" },
];

export default function Leaderboard() {
  const { data, error, reload } = useApi("/leaderboard");
  const people = data?.leaderboard ?? [];
  const onlyMe = people.length <= 1;

  return (
    <div className="page">
      <PageHeader title="Friends" />
      <FriendsSwitcher current="leaderboard" />

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <Skeleton rows={2} height={140} />
      ) : onlyMe ? (
        <div className="card">
          <EmptyState icon="trophy" title="No one to race yet">
            Add friends to see who drinks the most water. <Link to="/social">Find friends</Link>
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="footnote" style={{ textAlign: "center", marginBottom: 8 }}>
            Ranked by total water logged
          </p>
          <div className={styles.podium}>
            {PODIUM.map(({ place, index, height, color }) => {
              const person = people[index];
              return (
                <div key={place} className={styles.spot}>
                  {person ? (
                    <>
                      <div className={styles.person}>
                        {place === 1 && <Icon name="trophy" size={22} className={styles.crown} />}
                        <Avatar
                          name={person.username}
                          size={place === 1 ? 68 : 54}
                          className={person.isSelf ? styles.selfAvatar : ""}
                        />
                        <p className={styles.name}>{person.isSelf ? "You" : person.username}</p>
                        <p className={`${styles.score} numeric`}>{formatLitres(person.totalWaterLogged ?? 0)}</p>
                      </div>
                      <motion.div
                        className={styles.block}
                        style={{ "--medal": color }}
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ type: "spring", stiffness: 120, damping: 18, delay: place * 0.08 }}
                      >
                        <span className="numeric">{place}</span>
                      </motion.div>
                    </>
                  ) : (
                    <div className={styles.block} style={{ height, opacity: 0.3 }} />
                  )}
                </div>
              );
            })}
          </div>

          {people.length > 3 && (
            <ol className="card list" style={{ marginTop: 20 }} start={4}>
              {people.slice(3).map((person, i) => (
                <li key={person._id}>
                  <div className={`list-row ${person.isSelf ? styles.selfRow : ""}`}>
                    <span className={`${styles.rank} numeric`}>{i + 4}</span>
                    <Avatar name={person.username} size={36} />
                    <span className="list-row__main list-row__title">
                      {person.username}
                      {person.isSelf && <span className={styles.youTag}>You</span>}
                    </span>
                    <span className="list-row__value numeric">{formatLitres(person.totalWaterLogged ?? 0)}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
