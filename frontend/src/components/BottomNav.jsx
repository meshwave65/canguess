import { Link } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0B3C49", // azul petróleo
        borderTop: "3px solid #FF6A00", // laranja intenso
        display: "flex",
        justifyContent: "space-around",
        padding: "12px",
        color: "#fff",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#fff",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        🏠 Home
      </Link>

      <Link
        to="/palpites"
        style={{
          color: "#fff",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        ⚽ Palpites
      </Link>

      <Link
        to="/ranking"
        style={{
          color: "#fff",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        🏆 Ranking
      </Link>

      <Link
        to="/admin-login"
        style={{
          color: "#fff",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        ⚙️ Admin
      </Link>
    </nav>
  );
}
