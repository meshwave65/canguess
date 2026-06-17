import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../pages/admin/lib/supabase";
import { findUserByPhone, createUser } from "../services/userService";

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

  // 🔥 CONTEXTO FIXO (temporário)
  const WORKSPACE_ID = engine?.workspace_uuid || "ze_workspace";
  const EVENT_ID = engine?.event_uuid;

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

  // =========================
  // HELPERS
  // =========================
  function formatPhone(v) {
    return v.replace(/\D/g, "");
  }

  function normalizePhone(p) {
    return (p || "").replace(/\D/g, "");
  }

  function escolher(i, value) {
    setBets((prev) => ({
      ...prev,
      [i]: value,
    }));
  }

  // =========================
  // USER VALIDATION
  // =========================
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

  // =========================
  // WHATSAPP
  // =========================
  function openWhatsApp(phoneNumber, text) {
    const clean = normalizePhone(phoneNumber);

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  async function sendWhatsAppsSequential(phones, message) {
    for (const p of phones) {
      openWhatsApp(p, message);
      await new Promise((r) => setTimeout(r, 700));
    }
  }

  // =========================
  // MESSAGE BUILDER
  // =========================
  function buildMessage() {
    const now = new Date().toLocaleString("pt-BR");

    let header = `
🎯 PALPITE REGISTRADO

Nome: ${user?.fullName || "-"}
Username: ${user?.userName || "-"}
Telefone: ${user?.phone || "-"}

Workspace: ${WORKSPACE_ID}
Evento: ${EVENT_ID}

Data/Hora: ${now}
Status: Em validação

📊 SEUS PALPITES:
`;

    let body = rounds
      .map((r, i) => `${r.round_name} → ${bets[i] || "-"}`)
      .join("\n");

    return header + "\n" + body;
  }

  // =========================
  // CONFIRMAR ENVIO
  // =========================
  async function confirmarEnvio() {
    try {
      setMsg("Salvando palpites...");

      if (!user || !engine) throw new Error("Dados inválidos");

      const inserts = rounds.map((r, i) => ({
        workspace_uuid: WORKSPACE_ID,
        event_uuid: EVENT_ID,
        user_uuid: user.id,
        round_index: i + 1,
        round_uuid: r.round_uuid,
        prediction: bets[i] || "-",
        status: "Em validação",
      }));

      const { error } = await supabase
        .from("predicts")
        .upsert(inserts, {
          onConflict: "event_uuid,user_uuid,round_index",
        });

      if (error) throw error;

      const message = buildMessage();

      // =========================
      // ADMINS
      // =========================
      const admins = [
        "+351914845439",
        "+5521964906217",
      ];

      await sendWhatsAppsSequential(admins, message);

      // =========================
      // USER COPY
      // =========================
      if (user?.phone) {
        await sendWhatsAppsSequential([user.phone], message);
      }

      setMsg("✔ Palpites enviados com sucesso!");
      setShowModal(false);
      setStep("done");

    } catch (err) {
      console.error(err);
      setMsg("❌ Erro ao salvar palpites");
    }
  }

  // =========================
  // UI
  // =========================
  if (!engine) {
    return <div style={{ padding: 20 }}>Carregando evento...</div>;
  }

  return (
    <div style={{ background: "#f4f4f4", minHeight: "100vh", padding: 12 }}>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 10,
          background: "#C1121F",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        <button onClick={() => navigate(-1)}>⬅</button>
        <strong>{engine.event_name}</strong>
        <button onClick={() => navigate("/")}>🏠</button>
      </div>

      {/* FORM */}
      {step === "form" && (
        <div style={{ background: "#fff", padding: 15, marginTop: 15 }}>
          <h3>Participar do evento</h3>

          <input placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <button onClick={validarUsuario}>
            Continuar
          </button>

          <p>{msg}</p>
        </div>
      )}

      {/* BETS */}
      {step === "bets" && (
        <div style={{ background: "#fff", padding: 15, marginTop: 15 }}>
          <h3>Seus palpites</h3>

          {rounds.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 8 }}>
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

          <button onClick={() => setShowModal(true)}>
            Revisar palpites
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#fff", padding: 20, width: "90%" }}>
            <h3>Confirmação final</h3>

            <pre style={{ fontSize: 12 }}>
              {buildMessage()}
            </pre>

            <button onClick={confirmarEnvio}>
              Confirmar envio
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
