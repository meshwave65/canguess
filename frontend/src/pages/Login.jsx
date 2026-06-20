import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    if (e) e.preventDefault();

    setMsg("");
    setLoading(true);

    const identifier = userName.trim();

    try {
      console.log("🔐 Login attempt:", { identifier });

      await login(identifier, password);

      setMsg("✔ Login realizado com sucesso");

      // pequena pausa UX (sensação de sistema vivo)
      setTimeout(() => {
        navigate("/");
      }, 300);

    } catch (err) {
      console.error(err);
      setMsg(err.message || "Erro ao fazer login");
    }

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.ball}>⚽</div>

        <h1 style={styles.title}>CanGuess</h1>
        <p style={styles.subtitle}>
          Eventos Preditivos Inteligentes
        </p>

        <form onSubmit={handleLogin}>
          <input
            placeholder="User Name / Email / Telefone"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <button
            type="submit"
            style={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <button
          onClick={() => navigate("/register")}
          style={styles.secondaryBtn}
          disabled={loading}
        >
          CRIAR CONTA
        </button>

        {msg && <p style={styles.msg}>{msg}</p>}
      </div>
    </div>
  );
}

/* =========================
   ESTILO PRESERVADO 100%
========================= */

const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0B3C49",
    padding: 16,
  },

  header: {
    background: "#ffffff",
    color: "#0B3C49",
    padding: 14,
    borderRadius: 14,
    width: 340,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  headerTag: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },

  card: {
    width: 340,
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  },

  title: {
    color: "#0B3C49",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
  },

  round: {
    padding: 10,
    borderBottom: "1px solid #eee",
  },

  roundTitle: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 8,
  },

  options: {
    display: "flex",
    gap: 14,
  },

  option: {
    display: "flex",
    gap: 6,
    fontSize: 14,
  },

  primaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 14,
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },

  secondaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 8,
    background: "transparent",
    border: "1px solid #0B3C49",
    color: "#0B3C49",
    borderRadius: 10,
    fontWeight: "600",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  modalCard: {
    width: 340,
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    maxHeight: "80vh",
    overflow: "auto",
  },

  pre: {
    fontSize: 12,
    whiteSpace: "pre-wrap",
  },

  guestHint: {
    width: 340,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 12,
  },

  smallBtn: {
    marginTop: 8,
    padding: 6,
    fontSize: 12,
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },

  msg: {
    fontSize: 12,
    marginTop: 10,
    color: "#6b7280",
  },

  loading: {
    color: "#fff",
    textAlign: "center",
    padding: 20,
  }
};
