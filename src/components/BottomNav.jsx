import { Link } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#C1121F",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px",
        color: "#fff",
      }}
    >
      <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
        🏠 Home
      </Link>

      <Link to="/palpites" style={{ color: "#fff", textDecoration: "none" }}>
        ⚽ Palpites
      </Link>

      <Link to="/ranking" style={{ color: "#fff", textDecoration: "none" }}>
        🏆 Ranking
      </Link>

      <Link to="/admin" style={{ color: "#fff", textDecoration: "none" }}>
        ⚙️ Admin
      </Link>
    </nav>
  );
}
