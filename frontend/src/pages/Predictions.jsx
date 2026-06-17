import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../pages/admin/lib/supabase";
import { findUserByPhone, createUser } from "../services/userService";
import { theme } from "../styles/theme";

export default function Predictions() {
  const navigate = useNavigate();

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

  const WORKSPACE_ID = engine?.workspace_uuid || "ze_workspace";
  const EVENT_ID = engine?.event_uuid;

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

  function escolher(i, value) {
    setBets((prev) => ({ ...prev, [i]: value }));
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
      const result = await createUser({
        fullName: fullName || "Guest User",
        userName: userName || `user_${cleanPhone.slice(0, 6)}`,
        phone: cleanPhone,
        email,
      });

      currentUser = result.user;
    }

    setUser(currentUser);
    setStep("bets");
    setMsg("");
  }

  function buildMessage() {
    return `
🎯 PALPITE REGISTRADO

Nome: ${user?.fullName || "-"}
Username: ${user?.userName || "-"}
Telefone: ${user?.phone || "-"}

Evento: ${EVENT_ID}

📊 PALPITES:
${rounds.map((r, i) => `${r.round_name} → ${bets[i] || "-"}`).join("\n")}
`;
  }

  async function confirmarEnvio() {
    try {
      setMsg("Salvando...");

      const inserts = rounds.map((r, i) => ({
        workspace_uuid: WORKSPACE_ID,
        event_uuid: EVENT_ID,
        user_uuid: user.id,
        round_index: i + 1,
        round_uuid: r.round_uuid,
        prediction: bets[i] || "-",
        status: "Em validação",
      }));

      const { error } = await supabase.from("predicts").upsert(inserts, {
        onConflict: "event_uuid,user_uuid,round_index",
      });

      if (error) throw error;

      setShowModal(false);
      setStep("done");
      setMsg("✔ Palpites enviados com sucesso!");
    } catch (e) {
      setMsg("❌ Erro ao salvar palpites");
    }
  }

  if (!engine) {
    return <div style={styles.loading}>Carregando evento...</div>;
  }

  return (
    <div style={styles.page}>

      {/* HEADER (SEM NAVIGATION BUTTONS) */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>{engine.event_name}</div>
        <div style={styles.headerTag}>{engine.workspace_name}</div>
      </div>

      {/* FORM GUEST */}
      {step === "form" && (
        <div style={styles.card}>
          <h3 style={styles.title}>Participar do evento</h3>

          <p style={styles.subtitle}>
            Informe telefone + username para participar.
            <br />
            Cadastro leva menos de 1 minuto.
          </p>

          <input
            style={styles.input}
            placeholder="Nome (opcional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Username (opcional)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Telefone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button style={styles.primaryBtn} onClick={validarUsuario}>
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
              <div style={styles.roundTitle}>{r.round_name}</div>

              <div style={styles.options}>
                {["1", "X", "2"].map((v) => (
                  <label key={v} style={styles.option}>
                    <input
                      type="radio"
                      checked={bets[i] === v}
                      onChange={() => escolher(i, v)}
                    />
                    <span>{v}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>
            Revisar e enviar
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3>Confirmação</h3>

            <pre style={styles.pre}>{buildMessage()}</pre>

            <button style={styles.primaryBtn} onClick={confirmarEnvio}>
              Confirmar envio
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
    </div>
  );
}

/* =========================
   THEME DRIVEN UI
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.colors.background,
    padding: 12,
    fontFamily: "Arial",
    color: theme.colors.text,
  },

  header: {
    background: theme.colors.primary,
    padding: 14,
    borderRadius: 12,
    color: "#fff",
  },

  headerTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  headerTag: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },

  card: {
    background: theme.colors.card,
    marginTop: 14,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`,
  },

  title: {
    color: theme.colors.primary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 12,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: `1px solid ${theme.colors.border}`,
  },

  round: {
    padding: 10,
    borderBottom: `1px solid ${theme.colors.border}`,
  },

  roundTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  options: {
    display: "flex",
    gap: 12,
  },

  option: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  primaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 14,
    background: theme.colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },

  secondaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
  },

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    background: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    width: "90%",
  },

  pre: {
    fontSize: 12,
    background: theme.colors.background,
    padding: 10,
    borderRadius: 8,
  },

  msg: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 10,
  },

  loading: {
    padding: 20,
  },
};
