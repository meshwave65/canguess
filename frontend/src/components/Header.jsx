import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const isLogged = !!user;

  // =========================
  // LOAD SESSION
  // =========================
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      setUser(JSON.parse(stored));
    }

    const sync = () => {
      const updated = localStorage.getItem("user");
      setUser(updated ? JSON.parse(updated) : null);
    };

    window.addEventListener("storage", sync);

    return () => window.removeEventListener("storage", sync);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  return (
    <>
      {/* HEADER */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "#0B3C49", // 👈 azul bottom fixado como padrão
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #FF6A00",
        }}
      >

        {/* LEFT */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src="/canguess-logo-1024.png" style={{ width: 40 }} />
          <div>
            <div style={{ fontWeight: "bold" }}>CanGuess</div>
            <div style={{ fontSize: 12 }}>Já deu seu palpite hoje?</div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

          <button
            onClick={() => setShowSearch(v => !v)}
            style={{
              background: "#FF6A00",
              border: "none",
              padding: "6px 10px",
              borderRadius: 6,
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            Buscar
          </button>

          {isLogged ? (
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #fff",
                padding: "6px 10px",
                borderRadius: 6,
                color: "#fff"
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "transparent",
                border: "1px solid #fff",
                padding: "6px 10px",
                borderRadius: 6,
                color: "#fff"
              }}
            >
              Login
            </button>
          )}

          <span style={{ fontSize: 13 }}>
            👤 {user?.user_name || "Guest User"}
          </span>

        </div>
      </header>

      {/* SEARCH (mantido simples) */}
      {showSearch && (
        <div
          style={{
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0B3C49",
            padding: 10,
            borderRadius: 10,
            width: "90%",
            maxWidth: 600,
            zIndex: 999
          }}
        >
          <input
            placeholder="Código do evento"
            style={{ width: "100%", padding: 8, borderRadius: 6 }}
          />

          <button
            onClick={() => navigate("/events")}
            style={{
              marginTop: 8,
              width: "100%",
              padding: 8,
              background: "#FF6A00",
              border: "none",
              borderRadius: 6,
              color: "#fff"
            }}
          >
            Buscar evento
          </button>
        </div>
      )}
    </>
  );
}
