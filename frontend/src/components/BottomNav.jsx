import { Link, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0B3C49",
        borderTop: "3px solid #FF6A00",
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 14px",
        color: "#fff",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* LEFT - NAV CONTEXTUAL (LEGADO) */}
      <div style={{ display: "flex", gap: "14px" }}>
        <Link to="/" style={{ color: "#fff" }}>🏠 Home</Link>
        <Link to="/palpites" style={{ color: "#fff" }}>⚽ Palpites</Link>
        <Link to="/ranking" style={{ color: "#fff" }}>🏆 Ranking</Link>
        <Link to="/admin-login" style={{ color: "#fff" }}>⚙️ Admin</Link>
      </div>

      {/* RIGHT - FIXO GLOBAL */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ⬅️
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          🏠
        </button>
      </div>
    </nav>
  );
}
