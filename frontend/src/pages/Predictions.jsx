import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";
import { useLocation } from "react-router-dom";
import { sendWhatsApp } from "../lib/whatsapp";

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

  useEffect(() => {
    async function load() {
      if (!code) {
        setMsg("Código não encontrado");
        return;
      }

      try {
        const res = await fetch(`/data/${code}.event.json?ts=${Date.now()}`);
        if (!res.ok) throw new Error("JSON não encontrado");

        const data = await res.json();
        setEngine(data);

        let normalized = Array.isArray(data.rounds) ? [...data.rounds] : [];

        normalized.sort(
          (a, b) =>
            Number(a.round_index || a.round_order || 0) -
            Number(b.round_index || b.round_order || 0)
        );

        setRounds(normalized);
      } catch (err) {
        console.error(err);
        setMsg("Erro ao carregar evento");
      }
    }

    load();
  }, [code]);

  function formatPhone(v) {
    return v.replace(/\D/g, "");
  }

  function escolher(index, value) {
    setBets((prev) => ({ ...prev, [index]: value }));
  }

  async function validarUsuario() {
    const cleanPhone = formatPhone(phone);
    if (!cleanPhone) return setMsg("Telefone obrigatório");

    setMsg("Validando...");

    let { data: currentUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (error) {
      setMsg("Erro ao buscar usuário");
      return;
    }

    if (!currentUser) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          full_name: fullName || "Guest",
          user_name: userName || `guest_${Date.now()}`,
          phone: cleanPhone,
          email: email || "guest@local",
          is_guest: true,
        })
        .select()
        .single();

      if (insertError) {
        setMsg("Erro ao criar usuário");
        return;
      }

      currentUser = newUser;
    }

    setUser(currentUser);
    setStep("bets");
    setMsg("");
  }

  async function confirmarEnvio() {
    if (!engine || !user || rounds.length === 0) return;

    try {
      setMsg("Salvando...");

      const inserts = rounds.map((r, i) => ({
        event_uuid: engine.event_uuid,
        ref_workspace: engine.workspace_uuid,
        user_uuid: user.id,
        round_index: r.round_index || i + 1,
        round_uuid: r.round_uuid || null,
        prediction: bets[i] || "-",
        status: "Em validação",
      }));

      const { error } = await supabase.from("predicts").upsert(inserts, {
        onConflict: "event_uuid,user_uuid,round_index",
      });

      if (error) throw error;

      console.log("✔ PREDICTS SALVOS");

      const workspacePhone = engine.workspace_confirm_phone;
      console.log("📞 WORKSPACE PHONE:", workspacePhone);

      if (workspacePhone) {
        const message = `
📊 Novo palpite recebido

🏟 Evento: ${engine.event_name}
🔑 Código: ${engine.code}

👤 Usuário: ${user.full_name || user.user_name}
📱 Telefone: ${user.phone}

🎯 Palpites:
${rounds
  .map((r, i) => `${r.round_name} → ${bets[i] || "-"}`)
  .join("\n")}
        `;

        console.log("📲 ENVIANDO WHATSAPP");

        sendWhatsApp(workspacePhone, message);
      } else {
        console.warn("⚠ Workspace sem telefone configurado");
      }

      setShowModal(false);
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      setMsg("Erro ao salvar palpites");
    }
  }

  if (!engine) {
    return <div style={styles.loading}>Carregando evento...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>{engine.event_name}</h2>
        <p>{engine.workspace_name}</p>

        {step === "form" && !user && (
          <>
            <input
              placeholder="Nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <button onClick={validarUsuario} style={styles.btn}>
              Continuar
            </button>

            {msg && <p>{msg}</p>}
          </>
        )}

        {step === "bets" && (
          <>
            {rounds.map((r, i) => (
              <div key={i} style={styles.round}>
                <strong>{r.round_name}</strong>

                <div style={styles.options}>
                  {["1", "X", "2"].map((v) => (
                    <label key={v}>
                      <input
                        type="radio"
                        name={`r-${i}`}
                        checked={bets[i] === v}
                        onChange={() => escolher(i, v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={() => setShowModal(true)} style={styles.btn}>
              Revisar e enviar
            </button>
          </>
        )}
      </div>

      {/* MODAL COMPLETO RESTAURADO */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3>Confirmação dos Palpites</h3>

            <div style={{ textAlign: "left", fontSize: 12 }}>
              <strong>{engine.event_name}</strong>
              <br />
              Workspace: {engine.workspace_name}
              <br />
              Código: {engine.code}
            </div>

            <hr />

            <div style={{ textAlign: "left", fontSize: 12 }}>
              <strong>Usuário</strong>
              <br />
              {user?.full_name || fullName}
              <br />
              {user?.phone || phone}
            </div>

            <hr />

            <div style={{ textAlign: "left" }}>
              <strong>Palpites</strong>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {rounds
                  .map((r, i) => `${r.round_name} → ${bets[i] || "-"}`)
                  .join("\n")}
              </pre>
            </div>

            <button onClick={confirmarEnvio} style={styles.btn}>
              Confirmar e Enviar
            </button>

            <button onClick={() => setShowModal(false)}>Voltar</button>

            {msg && <p style={{ color: "red" }}>{msg}</p>}
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3>✔ Enviado com sucesso</h3>
            <button onClick={() => window.location.reload()}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0B3C49",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 420,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  btn: {
    width: "100%",
    padding: 12,
    background: "#f97316",
    color: "#fff",
    border: "none",
    marginTop: 10,
  },
  round: {
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  options: {
    display: "flex",
    gap: 20,
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 320,
  },
  loading: {
    color: "#fff",
  },
};
