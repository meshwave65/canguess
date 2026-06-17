import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // ======================
  // LOAD USER (LOCAL STORAGE)
  // ======================
  useEffect(() => {
    function loadUser() {
      const stored = localStorage.getItem("canguess_user");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch (e) {
          console.error("Erro ao ler user do storage", e);
          setUser(null);
        }
      }
    }

    loadUser();

    // escuta mudanças de login em outras abas
    const sync = () => loadUser();
    window.addEventListener("storage", sync);

    return () => window.removeEventListener("storage", sync);
  }, []);

  const userName = user?.userName || "Guest User";
  const isLogged = userName !== "Guest User";

  // ======================
  // LOGOUT
  // ======================
  function logout() {
    localStorage.removeItem("canguess_user");
    setUser(null);
    navigate("/login");
  }

  return (
    <>
      <header style={styles.header}>
        {/* LEFT */}
        <div style={styles.left}>
          <img src="/canguess-logo-1024.png" style={styles.logo} />

          <div>
            <h1 style={styles.title}>CanGuess</h1>
            <p style={styles.subtitle}>Já deu seu palpite hoje?</p>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <button
            style={styles.btnAccent}
            onClick={() => setShowSearch(v => !v)}
          >
            🔎 Buscar eventos
          </button>

          <button
            style={styles.btnOutline}
            onClick={() => isLogged ? logout() : navigate("/login")}
          >
            {isLogged ? "Logout" : "Login"}
          </button>

          {/* 👇 AQUI ESTÁ O OBJETIVO */}
          <span style={styles.user}>
            👤 {userName}
          </span>
        </div>
      </header>

      {/* SEARCH */}
      {showSearch && (
        <div style={styles.searchCard}>
          <div style={styles.searchTitle}>BUSCA EVENTOS</div>

          <div style={styles.searchRow}>
            <select style={styles.input}>
              <option>BUSCA AVANÇADA</option>
              <option>Workspace CanGuess</option>
            </select>

            <input
              placeholder="CÓDIGO DO EVENTO"
              style={styles.input}
            />

            <button
              style={styles.btnGreen}
              onClick={() => {
                setShowSearch(false);
                navigate("/events");
              }}
            >
              BUSCAR
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================= */
const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,

    background: "#0B3C49",
    color: "#fff",
    padding: "12px 16px",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottom: "3px solid #f97316",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 42,
    height: 42,
  },

  title: {
    margin: 0,
    fontSize: "1.1rem",
  },

  subtitle: {
    margin: 0,
    fontSize: "0.75rem",
    opacity: 0.8,
  },

  user: {
    marginLeft: 10,
    fontSize: "0.9rem",
    fontWeight: "bold",
  },

  btnAccent: {
    background: "#f97316",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  btnOutline: {
    background: "transparent",
    border: "1px solid #fff",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },

  btnGreen: {
    background: "#22c55e",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    fontWeight: "bold",
    cursor: "pointer",
  },

  searchCard: {
    position: "fixed",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: 700,
    background: "#0f2f3a",
    border: "1px solid #f97316",
    borderRadius: 10,
    padding: 12,
    zIndex: 999,
  },

  searchTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },

  searchRow: {
    display: "flex",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "none",
  },
};
