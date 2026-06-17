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
  },

  card: {
    width: 340,
    background: "#ffffff",
    borderRadius: 18,
    padding: 26,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    textAlign: "center",
  },

  ball: {
    fontSize: 44,
    marginBottom: 8,
  },

  title: {
    margin: 0,
    color: "#0B3C49",
    fontSize: "1.6rem",
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 12,
    color: "#6b7280",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
  },

  primaryBtn: {
    width: "100%",
    padding: 12,
    background: "#f97316", // 🔥 mantém CanGuess laranja
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 6,
  },

  secondaryBtn: {
    width: "100%",
    padding: 11,
    marginTop: 10,
    background: "transparent",
    border: "1px solid #0B3C49",
    color: "#0B3C49",
    borderRadius: 10,
    fontWeight: "600",
    cursor: "pointer",
  },

  msg: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
  },
};
