import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../pages/admin/lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin() {
    setMsg("");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_name", userName)
      .maybeSingle();

    if (error || !data) {
      setMsg("Usuário não encontrado");
      return;
    }

    if (data.password !== password) {
      setMsg("Senha inválida");
      return;
    }

    localStorage.setItem(
      "canguess_user",
      JSON.stringify({
        id: data.id,
        fullName: data.full_name,
        userName: data.user_name,
        phone: data.phone,
        email: data.email,
        role: data.role || "user",
      })
    );

    navigate("/");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* BOLA / ICON */}
        <div style={styles.ball}>⚽</div>

        {/* TITLE */}
        <h1 style={styles.title}>CanGuess</h1>
        <p style={styles.subtitle}>
          Eventos Preditivos Inteligentes
        </p>

        {/* INPUTS */}
        <input
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* BUTTON PRIMARY (laranja do header/busca) */}
        <button onClick={handleLogin} style={styles.primaryBtn}>
          ENTRAR
        </button>

        {/* SECONDARY */}
        <button
          onClick={() => navigate("/register")}
          style={styles.secondaryBtn}
        >
          CRIAR CONTA
        </button>

        {/* MSG */}
        {msg && <p style={styles.msg}>{msg}</p>}
      </div>
    </div>
  );
}

/* =========================
   STYLE SYSTEM CANGUESS
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0B3C49", // azul petróleo (bottom/nav)
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
    background: "#f97316", // LARANJA oficial CanGuess
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
