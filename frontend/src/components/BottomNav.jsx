import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const eventCode = params.get("code");

  const [event, setEvent] = useState(null);
  const [hoverMsg, setHoverMsg] = useState("");

  // =========================
  // LOAD EVENT FROM ENGINE
  // =========================
  useEffect(() => {
    async function loadEvent() {
      if (!eventCode) return;

      try {
        const res = await fetch("/data/workspaces.json");
        const data = await res.json();

        const found = data.find(
          (w) => w.event?.code === eventCode
        );

        setEvent(found?.event || null);
      } catch (err) {
        console.error("[BottomNav] erro:", err);
        setEvent(null);
      }
    }

    loadEvent();
  }, [eventCode]);

  const status = event?.status;

  // =========================
  // RULES
  // =========================
  const canPredict = status === "OPEN";

  const canRanking =
    status === "OPEN" ||
    status === "PROGRESS" ||
    status === "DONE";

  // =========================
  // UX MESSAGES
  // =========================
  const getPredictMsg = () => {
    if (status === "STRUCTURE") {
      return "Evento ainda sendo estruturado. Em breve será possível apostar.";
    }

    if (status === "PROGRESS") {
      return "Evento em andamento. As apostas foram encerradas.";
    }

    if (status === "DONE") {
      return "Evento encerrado. As apostas não estão mais disponíveis.";
    }

    return "Evento indisponível no momento.";
  };

  const handleBlockedClick = (msg) => {
    alert(msg);
  };

  // =========================
  // UI
  // =========================
  return (
    <>
      <nav style={styles.nav}>
        {/* LEFT */}
        <div style={styles.left}>
          <Link to="/" style={styles.link}>
            🏠 Home
          </Link>

          {/* PALPITES */}
          {canPredict ? (
            <Link
              to={`/palpites/?code=${eventCode}`}
              style={styles.link}
            >
              ⚽ Palpites
            </Link>
          ) : (
            <span
              style={styles.disabled}
              onMouseEnter={() =>
                setHoverMsg(getPredictMsg())
              }
              onMouseLeave={() => setHoverMsg("")}
              onClick={() =>
                handleBlockedClick(getPredictMsg())
              }
            >
              ⚽ Palpites
            </span>
          )}

          {/* RANKING */}
          {canRanking ? (
            <Link
              to={`/ranking/?code=${eventCode}`}
              style={styles.link}
            >
              🏆 Ranking
            </Link>
          ) : (
            <span style={styles.disabled}>
              🏆 Ranking
            </span>
          )}

          <Link to="/admin-login" style={styles.link}>
            ⚙️ Admin
          </Link>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <button
            onClick={() => navigate(-1)}
            style={styles.btn}
          >
            ⬅️
          </button>

          <button
            onClick={() => navigate("/")}
            style={styles.btn}
          >
            🏠
          </button>
        </div>
      </nav>

      {/* TOOLTIP */}
      {hoverMsg && (
        <div style={styles.tooltip}>
          {hoverMsg}
        </div>
      )}
    </>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  nav: {
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
    zIndex: 1000,
  },

  left: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  right: {
    display: "flex",
    gap: "10px",
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },

  disabled: {
    color: "#666",
    cursor: "not-allowed",
  },

  btn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },

  tooltip: {
    position: "fixed",
    bottom: "60px",
    left: "20px",
    background: "#111",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    maxWidth: "280px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: 9999,
  },
};
