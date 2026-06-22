import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";
import { findUserByPhone, createGuestUser } from "../services/userService";
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

  // ======================
  // CARREGAR DO JSON
  // ======================
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
        console.log("✅ EVENTO CARREGADO:", data);

        setEngine(data);

        let normalizedRounds = Array.isArray(data.rounds) ? [...data.rounds] : [];
        normalizedRounds.sort((a, b) =>
          Number(a.round_index || a.round_order || 0) -
          Number(b.round_index || b.round_order || 0)
        );

        console.log("📋 ROUNDS:", normalizedRounds);
        setRounds(normalizedRounds);
      } catch (err) {
        console.error(err);
        setMsg("Erro ao carregar os jogos.");
      }
    }
    load();
  }, [code]);

  function formatPhone(v) {
    return v.replace(/\D/g, "");
  }

  function escolher(index, value) {
    setBets(prev => ({ ...prev, [index]: value }));
  }

  async function validarUsuario() {
    const cleanPhone = formatPhone(phone);
    if (!cleanPhone) return setMsg("Telefone obrigatório");

    setMsg("Validando...");
    let currentUser = await findUserByPhone(cleanPhone);

    if (!currentUser) {
      const result = await createGuestUser({
        fullName,
        userName,
        phone: cleanPhone,
        email
      });
      if (!result.ok) return setMsg("Erro ao criar usuário");
      currentUser = result.user;
    }

    setUser(currentUser);
    setStep("bets");
    setMsg("");
  }

  // ======================
  // SALVAR PALPITES
  // ======================
  async function confirmarEnvio() {
    if (rounds.length === 0 || !user) return;

    try {
      setMsg("Salvando...");

      const inserts = rounds.map((r, i) => ({
        event_uuid: engine.event_uuid,
        ref_workspace: engine.workspace_uuid,
        user_uuid: user.id,
        round_index: r.round_index || i + 1,
        round_uuid: r.round_uuid,
        prediction: bets[i] || "-",
        status: "Em validação"
      }));

      const { error } = await supabase
        .from("predicts")
        .upsert(inserts, {
          onConflict: "event_uuid,user_uuid,round_index"   // Colunas mais seguras
        });

      if (error) throw error;

      setShowModal(false);
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      setMsg("Erro ao salvar palpites. Tente novamente.");
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
            Você pode jogar como visitante usando apenas telefone.<br />
            Recomendamos criar conta para melhor experiência.<br />
            <button style={styles.smallBtn} onClick={() => setShowGuestHint(false)}>OK</button>
          </div>
        )}

        {step === "form" && !user && (
          <>
            <input style={styles.input} placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} />
            <input style={styles.input} placeholder="Username" value={userName} onChange={e => setUserName(e.target.value)} />
            <input style={styles.input} placeholder="Telefone *" value={phone} onChange={e => setPhone(e.target.value)} />
            <input style={styles.input} placeholder="Email (opcional)" value={email} onChange={e => setEmail(e.target.value)} />
            <button style={styles.primaryBtn} onClick={validarUsuario}>Continuar</button>
            {msg && <p style={{color:"red", textAlign:"center"}}>{msg}</p>}
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
                    {["1", "X", "2"].map(v => (
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
              <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>
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
            <pre style={{textAlign:"left", whiteSpace:"pre-wrap", background:"#f9f9f9", padding:12, borderRadius:8}}>
              {rounds.map((r, i) => `${r.round_name} → ${bets[i] || "-"}`).join("\n")}
            </pre>
            <button style={styles.primaryBtn} onClick={confirmarEnvio}>Confirmar e Enviar</button>
            <button style={styles.secondaryBtn} onClick={() => setShowModal(false)}>Voltar</button>
            {msg && <p style={{color:"red"}}>{msg}</p>}
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h2>✔ Palpites enviados com sucesso!</h2>
            <button style={styles.primaryBtn} onClick={() => window.location.reload()}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= STYLES ========================= */
const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0B3C49", padding: 16 },
  card: { width: 440, background: "#fff", borderRadius: 18, padding: 20 },
  header: { textAlign: "center", marginBottom: 16 },
  headerTitle: { fontWeight: "bold", fontSize: "1.4rem" },
  headerTag: { fontSize: 12, opacity: 0.7 },
  input: { width: "100%", padding: 12, marginBottom: 12, border: "1px solid #ddd", borderRadius: 8 },
  round: { padding: 14, borderBottom: "1px solid #eee", marginBottom: 8 },
  roundTitle: { fontWeight: "bold", marginBottom: 6, fontSize: "1.05rem" },
  gameInfo: { fontSize: "0.9rem", color: "#666", marginBottom: 10 },
  options: { display: "flex", gap: 24, justifyContent: "center" },
  label: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" },
  primaryBtn: { width: "100%", padding: 14, background: "#f97316", color: "#fff", border: 0, borderRadius: 8, fontWeight: "bold", marginTop: 20 },
  secondaryBtn: { width: "100%", padding: 14, background: "#f1f1f1", color: "#333", border: 0, borderRadius: 8, marginTop: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalCard: { background: "#fff", padding: 24, borderRadius: 16, width: 360, textAlign: "center" },
  guestHint: { fontSize: 13, background: "#fff7ed", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #fed7aa" },
  smallBtn: { marginTop: 8, padding: "6px 12px", fontSize: 12 },
  loading: { color: "#fff", fontSize: "1.1rem" }
};
