import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";
import { findUserByPhone, createGuestUser } from "../services/userService";
import { theme } from "../styles/theme";
import { useLocation } from "react-router-dom";

export default function Predictions() {

  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const code = params.get("code");

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
  const [showSuccess, setShowSuccess] = useState(false);

  const [showGuestHint, setShowGuestHint] = useState(true);

  const EVENT_ID = engine?.event_uuid || code;

  // ======================
  // LOAD EVENT BY CODE (NO HARDCODE)
  // ======================
  useEffect(() => {
    async function load() {
      if (!code) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("code", code)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setEngine(data);
      setRounds(data.rounds || []);
    }

    load();
  }, [code]);

  function formatPhone(v) {
    return v.replace(/\D/g, "");
  }

  function escolher(index, value) {
    setBets(prev => ({
      ...prev,
      [index]: value
    }));
  }

  // ======================
  // USER VALIDATION
  // ======================
  async function validarUsuario() {
    const cleanPhone = formatPhone(phone);

    if (!cleanPhone) {
      setMsg("Telefone obrigatório");
      return;
    }

    setMsg("Validando...");

    let currentUser = await findUserByPhone(cleanPhone);

    if (!currentUser) {
      const result = await createGuestUser({
        fullName,
        userName,
        phone: cleanPhone,
        email
      });

      if (!result.ok) {
        setMsg("Erro ao criar usuário");
        return;
      }

      currentUser = result.user;
    }

    setUser(currentUser);
    setStep("bets");
    setMsg("");
  }

  // ======================
  // SAVE BETS (NOW PROPER EVENT ISOLATION)
  // ======================
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
      setShowSuccess(true);

    } catch (e) {
      console.error(e);
      setMsg("Erro ao salvar palpites");
    }
  }

  // ======================
  // LOADING STATE
  // ======================
  if (!engine) {
    return <div style={styles.loading}>Carregando evento...</div>;
  }

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>{engine.event_name}</div>
          <div style={styles.headerTag}>{engine.workspace_name}</div>
        </div>

        {/* GUEST HINT */}
        {showGuestHint && !user && (
          <div style={styles.guestHint}>
            Você pode jogar como visitante usando apenas telefone.<br />
            Recomendamos criar conta para melhor experiência.<br />
            Não leva nem 1 minuto.<br />
            Clique em LOGIN e faça seu cadastro agora.<br />

            <button
              style={styles.smallBtn}
              onClick={() => setShowGuestHint(false)}
            >
              OK
            </button>
          </div>
        )}

        {/* FORM */}
        {step === "form" && !user && (
          <>
            <input
              style={styles.input}
              placeholder="Nome"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Username"
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
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <button style={styles.primaryBtn} onClick={validarUsuario}>
              Continuar
            </button>

            {msg && <p style={styles.msg}>{msg}</p>}
          </>
        )}

        {/* BETS */}
        {step === "bets" && (
          <>
            <h3 style={styles.title}>Seus palpites</h3>

            {rounds.map((r, i) => (
              <div key={i} style={styles.round}>
                <div style={styles.roundTitle}>{r.round_name}</div>

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
          </>
        )}

      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <pre style={styles.pre}>
              {rounds.map((r, i) =>
                `${r.round_name} → ${bets[i] || "-"}`
              ).join("\n")}
            </pre>

            <button style={styles.primaryBtn} onClick={confirmarEnvio}>
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

      {/* SUCCESS */}
      {showSuccess && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h2>✔ Palpites enviados</h2>
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
   STYLES (mantido seu visual)
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

  card: {
    width: 440,
    background: "#fff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  },

  header: {
    textAlign: "center",
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0B3C49",
  },

  headerTag: {
    fontSize: 12,
    color: "#6b7280",
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0B3C49",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },

  round: {
    padding: 10,
    borderBottom: "1px solid #eee",
  },

  roundTitle: {
    fontWeight: "bold",
    fontSize: 13,
  },

  options: {
    display: "flex",
    gap: 12,
    marginTop: 6,
  },

  option: {
    display: "flex",
    gap: 6,
  },

  primaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 12,
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
  },

  secondaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 8,
    background: "transparent",
    border: "1px solid #0B3C49",
    borderRadius: 10,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: 340,
    background: "#fff",
    padding: 16,
    borderRadius: 14,
  },

  pre: {
    fontSize: 12,
    whiteSpace: "pre-wrap",
  },

  guestHint: {
    fontSize: 12,
    background: "#fff7ed",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  smallBtn: {
    marginTop: 10,
    padding: 8,
    fontSize: 12,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    background: "#0B3C49",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  msg: {
    fontSize: 12,
    marginTop: 10,
  },

  loading: {
    color: "#fff",
  }
};
