import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const [selectedEventCode, setSelectedEventCode] = useState("");
  const [manualCode, setManualCode] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // ======================
  // LOAD USER
  // ======================
  useEffect(() => {
    const stored = localStorage.getItem("canguess_user");

    if (!stored) return;

    try {
      setUser(JSON.parse(stored));
    } catch (e) {
      console.error("[Header] user inválido");
      localStorage.removeItem("canguess_user");
    }
  }, []);

  const userName = user?.userName || "Guest User";

  // ======================
  // LOAD ENGINE JSON (SEM SUPABASE)
  // ======================
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await fetch("/data/workspaces.json");
        const json = await res.json();

        setWorkspaces(json || []);
      } catch (err) {
        console.error("[Header] erro ao carregar engine JSON:", err);
        setWorkspaces([]);
      }

      setLoading(false);
    }

    load();
  }, []);

  // ======================
  // LOGOUT
  // ======================
  function logout() {
    localStorage.removeItem("canguess_user");
    setUser(null);
    navigate("/login");
  }

  // ======================
  // NAVIGATE
  // ======================
  function handleOpen() {
    const codeToUse = manualCode.trim() || selectedEventCode;

    if (!codeToUse) {
      alert("Selecione ou digite um código de evento");
      return;
    }

    setShowSearch(false);
    setManualCode("");

    navigate(`/events?code=${codeToUse}`);
  }

  // ======================
  // UI
  // ======================
  return (
    <>
      <header style={styles.header}>
        {/* LEFT */}
        <div style={styles.left}>
          <img
            src="/canguess-logo-1024.png"
            style={styles.logo}
            alt="logo"
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
            onClick={() => setShowSearch(v => !v)}
          >
            🔎 Eventos
          </button>

          <button
            style={styles.btnOutline}
            onClick={() => (user ? logout() : navigate("/login"))}
          >
            {user ? "Logout" : "Login"}
          </button>

          <span style={styles.user}>👤 {userName}</span>
        </div>
      </header>

      {/* DROPDOWN */}
      {showSearch && (
        <div style={styles.searchCard}>
          <div style={styles.searchTitle}>
            🔍 SELECIONAR EVENTO
          </div>

          <div style={styles.searchRow}>
            <select
              style={styles.input}
              value={selectedEventCode}
              onChange={(e) => setSelectedEventCode(e.target.value)}
            >
              <option value="">
                {loading ? "Carregando..." : "Selecione um evento"}
              </option>

              {workspaces.map((ws) => (
                <option
                  key={ws.workspace_id}
                  value={ws.event?.code || ""}
                  disabled={!ws.event}
                >
                  {ws.workspace}
                  {ws.event ? ` → ${ws.event.name}` : " (SEM EVENTO)"}
                </option>
              ))}
            </select>

            <input
              placeholder="Ou digite código manual"
              style={styles.input}
              value={manualCode}
              onChange={(e) =>
                setManualCode(e.target.value.toUpperCase())
              }
            />

            <button
              style={styles.btnGreen}
              onClick={handleOpen}
            >
              ABRIR
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================
   ESTILOS
========================= */
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

  left: { display: "flex", alignItems: "center", gap: 12 },
  right: { display: "flex", alignItems: "center", gap: 10 },

  logo: { width: 42, height: 42 },
  title: { margin: 0, fontSize: "1.1rem" },
  subtitle: { margin: 0, fontSize: "0.75rem", opacity: 0.8 },

  user: { marginLeft: 10, fontSize: "0.9rem", fontWeight: "bold" },

  btnAccent: {
    background: "#f97316",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  btnOutline: {
    background: "transparent",
    border: "1px solid #fff",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },

  btnGreen: {
    background: "#22c55e",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: "bold",
    cursor: "pointer",
  },

  searchCard: {
    position: "fixed",
    top: 78,
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: 720,
    background: "#0f2f3a",
    border: "2px solid #f97316",
    borderRadius: 12,
    padding: 16,
    zIndex: 999,
  },

  searchTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
  },

  searchRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "none",
    minWidth: 180,
  },
};
