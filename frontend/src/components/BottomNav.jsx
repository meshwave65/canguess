import { Link, useNavigate } from "react-router-dom";
import { useEvent } from "../contexts/EventContext";

export default function BottomNav() {
  const navigate = useNavigate();
  const { currentEvent } = useEvent();

  const eventCode = currentEvent?.code || currentEvent?.event_code;

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
        <Link to="/" style={{ color: "#fff" }}>🏠 Home</Link>
        <Link to="/palpites" style={{ color: "#fff" }}>⚽ Palpites</Link>
        
        {/* Ranking - Versão Corrigida */}
        {eventCode ? (
          <Link 
            to={`/ranking/?code=${eventCode}`} 
            style={{ color: "#fff", textDecoration: "none" }}
          >
            🏆 Ranking
          </Link>
        ) : (
          <span 
            style={{ 
              color: "#888", 
              cursor: "not-allowed",
              opacity: 0.6 
            }}
            title="Selecione um evento primeiro"
          >
            🏆 Ranking
          </span>
        )}

        <Link to="/admin-login" style={{ color: "#fff" }}>⚙️ Admin</Link>
      </div>

      {/* Botões globais */}
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
