import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../pages/admin/lib/supabase";
import { findUserByPhone, createUser } from "../services/userService";

export default function Predictions() {
  const navigate = useNavigate();

  const [engine, setEngine] = useState(null);
  const [rounds, setRounds] = useState([]);

  const [step, setStep] = useState("intro");

  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [user, setUser] = useState(null);
  const [bets, setBets] = useState({});
  const [showModal, setShowModal] = useState(false);

  // =========================
  // LOAD ENGINE
  // =========================
  useEffect(() => {
    async function load() {
      const data = await fetch("/data/bolao.json").then((r) => r.json());
      setEngine(data);
      setRounds(data.rounds || []);
    }

    load();
  }, []);

  function formatPhone(v) {
    return v.replace(/\D/g, "");
  }

  function validatePhone(p) {
    return p && p.length >= 10;
  }

  // =========================
  // VALIDAR USUÁRIO
  // =========================
  async function validarUsuario() {
    const cleanPhone = formatPhone(phone);

    if (!validatePhone(cleanPhone)) {
      setMsg("❌ Informe um telefone válido com DDD");
      return;
    }

    setMsg("Validando usuário...");

    let currentUser = await findUserByPhone(cleanPhone);

    if (!currentUser) {
      const result = await createUser({
        fullName: fullName || "Guest User",
        userName:
          userName ||
          `user_${Date.now().toString().slice(0, 8)}`,
        phone: cleanPhone,
        email,
      });

      currentUser = result.user;
    }

    setUser(currentUser);
    setStep("bets");
    setMsg("");
  }

  function escolher(i, value) {
    setBets((prev) => ({
      ...prev,
      [i]: value,
    }));
  }

  // =========================
// INTRO COM TEXTO ORIGINAL (SEM MUTILAR)
// =========================
if (step === "intro") {
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2>🎯 Bem-vindos</h2>

        <h3>Como funciona o Bolão</h3>

        <p>
          Esta é a tela de cadastro de palpites.
        </p>

        <p>
          Antes de tudo é necessário validar o usuário. Se você já possui um telefone cadastrado basta inserí-lo e clicar em começar.
        </p>

        <p>
          Se ainda não tem cadastro faça este cadastro simplificado preenchendo seu Nome, um nome de usuário que o identificará nos jogos (por exemplo Juca Bala, Zé Bangu...) um telefone com DDD no formato 21999999999 (apenas numeros sem espaços) e um e-mail.
        </p>

        <p>
          O telefone é obrigatório e caso não preencha os outros dados será atribuido um user_name para que vocêe possa ser identificado. Depois solicite aos administradores a alteração se necessário.
        </p>

        <p>
          Ao clicar em "Começar" você será levado para o formulário de cadastro de palpites.
        </p>

        <p>
          Preencha as opções de sua preferencia e clique em "Revisar Palpites". Serão apresentadas suas opções. Caso esteja de acordo clique em "Confirmar".
        </p>

        <p>
          Pronto, seu jogo foi inserido e irá aguardar validação.
        </p>

        <p>
          BOA SORTE!!!
        </p>

        <hr />

        <p>
          Qualquer dúvida pode entrar em contato com os administradores pelos contatos abeixo:
        </p>

        <p>🇵🇹 +351 914 845 439 (Whatsapp)</p>
        <p>🇧🇷 +55 21 96490 6217 (Whatsapp)</p>

        <p>www.canguess.com</p>
        <p>info@canguess.com</p>

        <button style={styles.button} onClick={() => setStep("form")}>
          Começar
        </button>

      </div>
    </div>
  );
}

  // =========================
  // FORM
  // =========================
  if (step === "form") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <h3>👤 Validação de usuário</h3>

          <input
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Username (opcional)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Telefone (DDD obrigatório)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button} onClick={validarUsuario}>
            Começar
          </button>

          {msg && <p>{msg}</p>}

        </div>
      </div>
    );
  }

  // =========================
  // PALPITES
  // =========================
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h3>📊 Seus palpites</h3>

        {rounds.map((r, i) => (
          <div key={i} style={styles.round}>
            <span>{r.round_name}</span>

            <div>
              {["1", "X", "2"].map((v) => (
                <label key={v} style={{ marginLeft: 10 }}>
                  <input
                    type="radio"
                    checked={bets[i] === v}
                    onChange={() => escolher(i, v)}
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          style={styles.button}
          onClick={() => setShowModal(true)}
        >
          Revisar palpites
        </button>

      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>

            <h3>📋 Confirmação</h3>

            {rounds.map((r, i) => (
              <p key={i}>
                {r.round_name} → {bets[i] || "-"}
              </p>
            ))}

            <button
              style={styles.button}
              onClick={() => {
                setMsg("✔ Palpites enviados com sucesso!");
                setShowModal(false);
                setStep("done");
              }}
            >
              Confirmar
            </button>

            <button onClick={() => setShowModal(false)}>
              Cancelar
            </button>

          </div>
        </div>
      )}

      <p style={{ textAlign: "center" }}>{msg}</p>
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  page: {
    padding: 16,
    background: "#f4f4f4",
    minHeight: "100vh",
  },

  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 12,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  button: {
    width: "100%",
    padding: 14,
    background: "#C1121F",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    marginTop: 10,
  },

  round: {
    display: "flex",
    justifyContent: "space-between",
    padding: 8,
    borderBottom: "1px solid #eee",
  },

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBox: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
};
