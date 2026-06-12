import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASSWORD = "991521"; // 🔐 MVP HARDCODED

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "true");
      navigate("/admin");
    } else {
      setError("Senha inválida");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <input
        type="password"
        placeholder="Senha admin"
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
