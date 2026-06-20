import { Link, useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 pega sempre da URL
  const params = new URLSearchParams(location.search);
  const eventCode = params.get("code");

  return (
    <nav style={{
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
    }}>

      <div style={{ display: "flex", gap: "14px" }}>

        <Link to="/" style={{ color: "#fff" }}>
          🏠 Home
        </Link>

        <Link
          to={eventCode ? `/palpites/?code=${eventCode}` : "#"}
          style={{ color: "#fff" }}
        >
          ⚽ Palpites
        </Link>

        <Link
          to={eventCode ? `/ranking/?code=${eventCode}` : "#"}
          style={{ color: "#fff", textDecoration: "none" }}
        >
          🏆 Ranking
        </Link>

        <Link to="/admin-login" style={{ color: "#fff" }}>
          ⚙️ Admin
        </Link>

      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: "#fff" }}>
          ⬅️
        </button>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: "#fff" }}>
          🏠
        </button>
      </div>

    </nav>
  );
}
