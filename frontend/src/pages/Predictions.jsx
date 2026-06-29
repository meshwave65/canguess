import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";
import { findUserByPhone, createGuestUser } from "../services/userService";
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
  const [showGuestHint, setShowGuestHint] = useState(true);

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

        let normalizedRounds = Array.isArray(data.rounds) ? [...data.rounds] : [];
        normalizedRounds.sort(
          (a, b) =>
            Number(a.round_index || a.round_order || 0) -
            Number(b.round_index || b.round_order || 0)
        );

        setRounds(normalizedRounds);
      } catch (err) {
        setMsg("Erro ao carregar os jogos.");
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
    if (rounds.length === 0 || !user) return;

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

      setShowModal(false);

        // 🔥 monta mensagem
      const message =
          `✔ Confirmação de Palpites\n\n` +
          `Evento: ${engine.event_name}\n` +
          `Workspace: ${engine.workspace_name}\n` +
          `Usuário: ${user.full_name || fullName}\n` +
          `Telefone: ${user.phone || phone}\n\n` +
          `Palpites:\n` +
          rounds.map((r, i) => `${r.round_name} → ${bets[i] || "-"}`).join("\n");

    // 🔥 pega telefone do workspace (confirm_phone)
      const workspacePhone = engine.confirm_phone;

    // dispara whatsapp para admin do workspace
    if (workspacePhone) {
        sendWhatsApp(workspacePhone, message);
    }

    // (opcional futuro: copiar também pro usuário)
    // sendWhatsApp(user.phone, message);

    setShowSuccess(true);

    } catch (e) {
      // 🔴 ÚNICA ALTERAÇÃO REAL
      console.error("ERRO AO SALVAR PREDICTS:", e);
      setMsg(e.message || "Erro ao salvar palpites. Tente novamente.");
    }
  }

  if (!engine) {
    return <div style={styles.loading}>Carregando evento...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>{engine.event_name}</div>
          <div style={styles.headerTag}>{engine.workspace_name}</div>
        </div>

        {showGuestHint && !user && (
          <div style={styles.guestHint}>
            Você pode jogar como visitante usando apenas telefone.
            <br />
            Recomendamos criar conta para melhor experiência.
            <br />
            <button
              style={styles.smallBtn}
              onClick={() => setShowGuestHint(false)}
            >
              OK
            </button>
          </div>
        )}

        {step === "form" && !user && (
          <>
            <input
              style={styles.input}
              placeholder="Nome Completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Username"
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
            {msg && <p style={{ color: "red", textAlign: "center" }}>{msg}</p>}
          </>
        )}

        {step === "bets" && (
          <>
            <h3>Seus palpites</h3>

            {rounds.length === 0 ? (
              <p style={{ color: "red", textAlign: "center", padding: 40 }}>
                Nenhum jogo encontrado.
              </p>
            ) : (
              rounds.map((r, i) => (
                <div key={i} style={styles.round}>
                  <div style={styles.roundTitle}>{r.round_name}</div>
                  <div style={styles.gameInfo}>
                    {r.round_date} {r.time_round && `• ${r.time_round}`}
                  </div>

                  <div style={styles.options}>
                    {["1", "X", "2"].map((v) => (
                      <label key={v} style={styles.label}>
                        <input
                          type="radio"
                          name={`round-${i}`}
                          checked={bets[i] === v}
                          onChange={() => escolher(i, v)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}

            {rounds.length > 0 && (
              <button
                style={styles.primaryBtn}
                onClick={() => setShowModal(true)}
              >
                Revisar e enviar palpites
              </button>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h3>Confirmação dos Palpites</h3>

            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <strong>{engine.event_name}</strong>
              <br />
              Workspace: {engine.workspace_name}
              <br />
              Event Code: {engine.code}
            </div>

            <hr />

            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <strong>Usuário</strong>
              <br />
              Nome: {user?.full_name || fullName}
              <br />
              Username: {user?.user_name || userName}
              <br />
              Telefone: {user?.phone || phone}
            </div>

            <hr />

            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <strong>Informações</strong>
              <br />
              Data/Hora: {new Date().toLocaleString()}
              <br />
              IP: (captura futura)
            </div>

            <hr />

            <div style={{ textAlign: "left", marginTop: 12 }}>
              <strong>Palpites</strong>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#f9f9f9",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 8,
                }}
              >
                {rounds.map((r, i) => `${r.round_name} → ${bets[i] || "-"}`).join("\n")}
              </pre>
            </div>

            <hr />

            <p style={{ fontSize: 12, marginTop: 12, textAlign: "left" }}>
              Não esqueça de enviar a confirmação por WhatsApp para manter uma
              cópia acessível do seu palpite.
              <br />
              <br />
              Caso o evento necessite validação de pagamento, envie o mais
              rápido possível.
            </p>

            <button style={styles.primaryBtn} onClick={confirmarEnvio}>
              Confirmar e Enviar
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => setShowModal(false)}
            >
              Voltar
            </button>

            {msg && <p style={{ color: "red" }}>{msg}</p>}
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h2>✔ Palpites enviados com sucesso!</h2>
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

/* ========================= STYLES ========================= */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0B3C49",
    padding: 16,
  },
  card: {
    width: 440,
    background: "#fff",
    borderRadius: 18,
    padding: 20,
  },
  header: { textAlign: "center", marginBottom: 16 },
  headerTitle: { fontWeight: "bold", fontSize: "1.4rem" },
  headerTag: { fontSize: 12, opacity: 0.7 },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
  },
  round: {
    padding: 14,
    borderBottom: "1px solid #eee",
    marginBottom: 8,
  },
  roundTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: "1.05rem",
  },
  gameInfo: { fontSize: "0.9rem", color: "#666", marginBottom: 10 },
  options: { display: "flex", gap: 24, justifyContent: "center" },
  label: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
  },
  primaryBtn: {
    width: "100%",
    padding: 14,
    background: "#f97316",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    fontWeight: "bold",
    marginTop: 20,
  },
  secondaryBtn: {
    width: "100%",
    padding: 14,
    background: "#f1f1f1",
    color: "#333",
    border: 0,
    borderRadius: 8,
    marginTop: 8,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalCard: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    width: 360,
    textAlign: "center",
  },
  guestHint: {
    fontSize: 13,
    background: "#fff7ed",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid #fed7aa",
  },
  smallBtn: {
    marginTop: 8,
    padding: "6px 12px",
    fontSize: 12,
  },
  loading: {
    color: "#fff",
    fontSize: "1.1rem",
  },
};
