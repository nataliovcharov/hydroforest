import NavBar from "../components/NavBar";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { useSession } from "../lib/session";

const TEAM = [
  { name: "Jun Li", github: "jljune9li" },
  { name: "Natalie Ovcarov", github: "nataliovcharov" },
  { name: "Daniel Brito", github: "danny031103" },
  { name: "Nabiha Siddique", github: "ns5190" },
  { name: "Alvaro Martinez", github: "AlvaroMartinezM" },
];

export default function About() {
  const { isLoggedIn } = useSession();
  return (
    <main className="page page--no-tabbar">
      <NavBar backTo={isLoggedIn ? "/account" : "/login"} backLabel={isLoggedIn ? "Account" : "Log in"} />

      <section style={{ textAlign: "center", padding: "16px 0 8px" }}>
        <div
          style={{
            display: "grid",
            placeItems: "end center",
            width: 96,
            height: 96,
            margin: "0 auto 14px",
            borderRadius: 24,
            overflow: "hidden",
            background: "linear-gradient(180deg, #ccffcc 0%, #ffffc2 100%)",
            boxShadow: "0 12px 30px rgba(20,50,30,0.3)",
          }}
          aria-hidden="true"
        >
          <img src="/images/tree3/adult_tree.png" alt="" style={{ height: 86, width: "auto", marginBottom: -4 }} />
        </div>
        <h1 className="large-title">HydroForest</h1>
        <p className="subhead" style={{ marginTop: 6 }}>
          Drink water. Grow a forest.
        </p>
      </section>

      <section className="card card--padded section">
        <p style={{ lineHeight: 1.5 }}>
          HydroForest turns staying hydrated into a small daily ritual. Every glass you log helps today's tree
          grow, and each day you reach your goal adds a tree to your forest. Over time, your habits become
          something you can see.
        </p>
      </section>

      <h2 className="section-title section">Built at NYU by</h2>
      <ul className="card list">
        {TEAM.map((member) => (
          <li key={member.github}>
            <a className="list-row" href={`https://github.com/${member.github}`} target="_blank" rel="noreferrer">
              <Avatar name={member.name} size={36} />
              <span className="list-row__main">
                <span className="list-row__title" style={{ display: "block" }}>
                  {member.name}
                </span>
                <span className="list-row__subtitle">@{member.github}</span>
              </span>
              <Icon name="external" size={18} className="list-row__chevron" />
              <span className="visually-hidden">(opens GitHub in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="section-footer">Agile Software Development, New York University.</p>
    </main>
  );
}
