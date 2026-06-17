import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../pages/admin/lib/supabase";
import { theme } from "../styles/theme";

export default function Header() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("Guest User");
  const [showSearch, setShowSearch] = useState(false);

  const isLogged = userName !== "Guest User";

  // ======================
  // AUTH LISTENER
  // ======================
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user?.email) {
        setUserName(user.email);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUserName(session?.user?.email || "Guest User");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        {/* LEFT */}
        <div style={styles.left}>
          <img
            src="/canguess-logo-1024.png"
            alt="logo"
            style={styles.logo}
          />

          <div>
            <h1 style={styles.title}>CanGuess</h1>
            <p style={styles.subtitle}>Já deu seu palpite hoje?</p>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <button
            style={styles.btnAccent}
            onClick={() => setShowSearch((v) => !v)}
          >
            🔎 Buscar eventos
          </button>

          <button
            style={styles.btnOutline}
            onClick={() => navigate("/login")}
          >
            {isLogged ? "Logout" : "Login"}
          </button>

          <span style={styles.user}>
            👤 {userName}
          </span>
        </div>
      </header>

      {/* ================= SEARCH CARD ================= */}
      {showSearch && (
        <div style={styles.searchCard}>
          <div style={styles.searchTitle}>BUSCA EVENTOS</div>

          <div style={styles.searchRow}>
            <select style={styles.input}>
              <option>BUSCA AVANÇADA</option>
              <option>Workspace 1</option>
              <option>Workspace 2</option>
            </select>

            <input
              placeholder="CÓDIGO DO EVENTO (ex: ZEBCOP26)"
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

/* =========================
   STYLES (USANDO THEME)
========================= */

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,

    background: theme.colors.primary,
    color: "#fff",
    padding: "12px 16px",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottom: `4px solid ${theme.colors.accent}`,
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
    width: 48,
    height: 48,
    objectFit: "contain",
  },

  title: {
    margin: 0,
    fontSize: "1.2rem",
  },

  subtitle: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#FFD2B3",
  },

  user: {
    fontSize: "0.9rem",
    opacity: 0.9,
  },

  btnAccent: {
    background: theme.colors.accent,
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: "bold",
    color: "#fff",
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

    background: theme.colors.primaryHover,
    border: `1px solid ${theme.colors.accent}`,
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
