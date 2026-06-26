import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    // =========================
    // 1. AUTH LOGIN
    // =========================
    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (authError || !data?.user) {
      setError("Credenciais inválidas");
      return;
    }

    // =========================
    // 2. FETCH USER PROFILE
    // =========================
    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("role, user_name")
        .eq("auth_id", data.user.id)
        .single();

    if (profileError || !profile) {
      setError("Usuário não encontrado");
      return;
    }

    // =========================
    // 3. CHECK ADMIN ROLE
    // =========================
    if (profile.role !== "admin") {
      setError("Acesso negado");
      return;
    }

    // =========================
    // 4. STORE SESSION
    // =========================
    localStorage.setItem("session_user", JSON.stringify({
      user_id: data.user.id,
      role: profile.role,
      user_name: profile.user_name
    }));

    navigate("/admin");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, marginTop: 10 }}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 8, marginTop: 10 }}
      />

      <button onClick={handleLogin} style={{ marginLeft: 10 }}>
        Entrar
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
