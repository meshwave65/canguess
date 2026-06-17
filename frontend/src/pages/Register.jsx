import { useState } from "react";
import { AuthService } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    user_name: "",
    phone: "",
    email: "",
    password: "", // opcional agora
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.phone) {
      return setError("Telefone obrigatório");
    }

    setLoading(true);

    const res = await AuthService.register(form);

    setLoading(false);

    if (!res.ok) {
      return setError(res.error);
    }

    setSuccess("Conta criada com sucesso!");

    setTimeout(() => navigate("/login"), 1200);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2>Criar conta</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input name="name" placeholder="Nome" onChange={handleChange} />
          <input name="user_name" placeholder="Username" onChange={handleChange} />
          <input name="phone" placeholder="Telefone *" onChange={handleChange} />
          <input name="email" placeholder="Email (opcional)" onChange={handleChange} />
          <input name="password" placeholder="Senha (opcional)" onChange={handleChange} />

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <button disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0B3C49",
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 400,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
