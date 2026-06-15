import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const isLogged = false;
  const userName = "Guest User";

  return (
    <header
      style={{
        backgroundColor: "#0B3C49",
        color: "#fff",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        borderBottom: "4px solid #FF6A00",
      }}
    >
      {/* LEFT - LOGO */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/canguess-logo-1024.png"
          style={{ width: 50, height: 50, objectFit: "contain" }}
        />

        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem" }}>
            CanGuess
          </h1>

          <p style={{ margin: 0, fontSize: "0.75rem", color: "#FFD2B3" }}>
            Já deu seu palpite hoje?
          </p>
        </div>
      </div>

      {/* RIGHT - GROUPED ACTIONS */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* BUSCAR EVENTOS */}
        <button
          onClick={() => navigate("/events")}
          style={{
            background: "#FF6A00",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          🔎 Buscar eventos
        </button>

        {/* LOGIN */}
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "transparent",
            border: "1px solid #fff",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        {/* USER */}
        <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>
          {isLogged ? userName : "Guest User"}
        </span>

      </div>
    </header>
  );
}
