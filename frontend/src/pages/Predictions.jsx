import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";
import {
  findUserByPhone,
  createGuestUser,
} from "../services/userService";
import { theme } from "../styles/theme";

export default function Predictions() {

  const [engine, setEngine] = useState(null);
  const [rounds, setRounds] = useState([]);

  const [step, setStep] = useState("form");

  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [user, setUser] = useState(null);

  const [bets, setBets] = useState({});

  const [showModal, setShowModal] = useState(false);

  // ✅ NOVO: modal de sucesso
  const [showSuccess, setShowSuccess] = useState(false);

  const WORKSPACE_ID = engine?.workspace_uuid;
  const EVENT_ID = engine?.event_uuid;

  useEffect(() => {
    async function load() {
      const data = await fetch("/data/bolao.json").then(r => r.json());
      setEngine(data);
      setRounds(data.rounds || []);
    }

    load();
  }, []);

  function formatPhone(v) {
    return v.replace(/\D/g, "");
  }

  function escolher(index, value) {
    setBets(prev => ({
      ...prev,
      [index]: value
    }));
  }

  async function validarUsuario() {
    const cleanPhone = formatPhone(phone);

    if (!cleanPhone) {
      setMsg("Telefone obrigatório");
      return;
    }

    setMsg("Validando usuário...");

    let currentUser = await findUserByPhone(cleanPhone);

    if (!currentUser) {
      const result = await createGuestUser({
        fullName,
        userName,
        phone: cleanPhone,
        email
      });

      if (!result.ok) {
        setMsg("Erro criando convidado");
        return;
      }

      currentUser = result.user;
    }

    setUser(currentUser);
    setStep("bets");
    setMsg("");
  }

  function buildMessage() {
    const now = new Date().toLocaleString("pt-BR");

    return `🎯 PALPITE REGISTRADO

👤 Nome:
${user?.full_name || "-"}

🔖 Username:
${user?.user_name || "-"}

📱 Telefone:
${user?.phone || "-"}

📧 Email:
${user?.email || "-"}

🕒 Data:
${now}

🏆 Evento:
${engine?.event_name || "-"}

ID:
${EVENT_ID}

📊 PALPITES:

${rounds.map((r, i) =>
  `${r.round_name} → ${bets[i] || "-"}`
).join("\n")}
`;
  }

  async function confirmarEnvio() {
    try {
      setMsg("Salvando...");

      const inserts = rounds.map((r, i) => ({
        event_uuid: EVENT_ID,
        user_uuid: user.id,
        round_index: i + 1,
        round_uuid: r.round_uuid,
        prediction: bets[i] || "-",
        status: "Em validação"
      }));

      const { error } = await supabase
        .from("predicts")
        .upsert(inserts, {
          onConflict: "event_uuid,user_uuid,round_index"
        });

      if (error) throw error;

      setShowModal(false);

      // ❌ antigo: setStep("done")
      // ❌ antigo: setMsg("✔ Palpites enviados!")

      // ✅ novo fluxo forte
      setShowSuccess(true);

    } catch (e) {
      console.error(e);
      setMsg("❌ Erro ao salvar palpites");
    }
  }

  if (!engine) {
    return <div style={styles.loading}>Carregando evento...</div>;
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          {engine.event_name}
        </div>
        <div style={styles.headerTag}>
          {engine.workspace_name}
        </div>
      </div>

      {/* FORM */}
      {step === "form" && (
        <div style={styles.card}>
          <h3 style={styles.title}>Participar do evento</h3>

          <p style={styles.subtitle}>
            Informe telefone para participar.
          </p>

          <input
            style={styles.input}
            placeholder="Nome (opcional)"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Username (opcional)"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Telefone *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email (opcional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <button
            style={styles.primaryBtn}
            onClick={validarUsuario}
          >
            Continuar
          </button>

          {msg && <p style={styles.msg}>{msg}</p>}
        </div>
      )}

      {/* BETS */}
      {step === "bets" && (
        <div style={styles.card}>
          <h3 style={styles.title}>Seus palpites</h3>

          {rounds.map((r, i) => (
            <div key={i} style={styles.round}>
              <div style={styles.roundTitle}>
                {r.round_name}
              </div>

              <div style={styles.options}>
                {["1", "X", "2"].map(v => (
                  <label key={v} style={styles.option}>
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
            style={styles.primaryBtn}
            onClick={() => setShowModal(true)}
          >
            Revisar e enviar
          </button>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h3>Confirmar envio</h3>

            <pre style={styles.pre}>
              {buildMessage()}
            </pre>

            <button
              style={styles.primaryBtn}
              onClick={confirmarEnvio}
            >
              Confirmar
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => setShowModal(false)}
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS MODAL */}
      {showSuccess && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h2>✔ Palpites enviados</h2>

            <p>
              Seu registro foi confirmado com sucesso.
            </p>

            <button
              style={styles.primaryBtn}
              onClick={() => window.location.reload()}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* =========================
   STYLES
========================= */

const styles = {

  page: {
    minHeight: "100vh",
    background: theme.colors.background,
    padding: 12,
    fontFamily: "Arial",
    color: theme.colors.text
  },

  header: {
    background: theme.colors.primary,
    padding: 14,
    borderRadius: 12,
    color: "#fff"
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold"
  },

  headerTag: {
    marginTop: 5,
    fontSize: 12
  },

  card: {
    background: theme.colors.card,
    marginTop: 14,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`
  },

  title: {
    color: theme.colors.primary
  },

  subtitle: {
    fontSize: 13,
    color: theme.colors.muted
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: `1px solid ${theme.colors.border}`
  },

  round: {
    padding: 10,
    borderBottom: `1px solid ${theme.colors.border}`
  },

  roundTitle: {
    fontWeight: "bold",
    marginBottom: 8
  },

  options: {
    display: "flex",
    gap: 15
  },

  option: {
    display: "flex",
    gap: 5
  },

  primaryBtn: {
    width: "100%",
    marginTop: 14,
    padding: 12,
    background: theme.colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer"
  },

  secondaryBtn: {
    width: "100%",
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    background: "#fff",
    border: `1px solid ${theme.colors.border}`
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },

  modalCard: {
    background: theme.colors.card,
    width: "100%",
    maxWidth: 420,
    padding: 16,
    borderRadius: 12,
    maxHeight: "80vh",
    overflow: "auto"
  },

  pre: {
    whiteSpace: "pre-wrap",
    fontSize: 12,
    background: theme.colors.background,
    padding: 10,
    borderRadius: 8
  },

  msg: {
    fontSize: 12,
    marginTop: 10
  },

  loading: {
    padding: 20
  }
};
