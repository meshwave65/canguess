import { useState } from "react";
import { supabase } from "./admin/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Predictions() {
  const navigate = useNavigate();

  const EVENT_ID = "dc0631b5-c7aa-4294-92e6-6d2fcc78f082";

  const jogos = [
    "QATAR x SUIÇA",
    "BRASIL x MARROCOS",
    "HAITI x ESCOCIA",
    "AUSTRALIA x TURQUIA",
    "ALEMANHA x CURAÇAO",
    "HOLANDA x JAPAO",
    "COSTA DO MARFIM x EQUADOR",
    "SUECIA x TUNISIA",
    "ESPANHA x CABO VERDE",
    "BELGICA x EGITO",
    "ARABIA SAUDITA x URUGUAI",
  ];

  const [step, setStep] = useState("form"); // form | bets | confirm
  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");

  const [bets, setBets] = useState({});
  const [showModal, setShowModal] = useState(false);

  // =========================
  // UTIL: telefone BR
  // =========================
  const formatPhone = (value) => {
    const clean = value.replace(/\D/g, "");
    return clean;
  };

  // =========================
  // VALIDAR / CRIAR USUÁRIO
  // =========================
  async function validarUsuario() {
    if (!phone) {
      setMsg("⚠️ Informe o telefone com DDD");
      return;
    }

    const cleanPhone = formatPhone(phone);

    setMsg("Validando usuário...");

    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (!user) {
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          phone: cleanPhone,
          full_name: fullName || "Usuário sem nome",
          user_name: userName || `user_${cleanPhone.slice(-4)}`,
          email: `temp_${cleanPhone}@bolao.app`,
          cpf: cleanPhone.padEnd(11, "0"),
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        setMsg("❌ Erro ao criar usuário");
        return;
      }

      user = newUser;
    }

    setMsg("✔ Usuário validado");
    setStep("bets");
  }

  // =========================
  // ESCOLHA PALPITES
  // =========================
  function escolher(i, v) {
    setBets((prev) => ({ ...prev, [i]: v }));
  }

  // =========================
  // ABRIR CONFIRMAÇÃO
  // =========================
  function abrirConfirmacao() {
    setShowModal(true);
  }

  // =========================
  // SALVAR + WHATSAPP
  // =========================
  async function confirmarEnvio() {
    try {
      setMsg("Salvando palpites...");

      const cleanPhone = formatPhone(phone);

      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("phone", cleanPhone)
        .single();

      if (!user) throw new Error("Usuário não encontrado");

      const inserts = jogos.map((_, i) => ({
        event_id: EVENT_ID,
        user_id: user.id,
        game_index: i + 1,
        prediction: bets[i] || "-",
        status: "Em validação",
      }));

      const { error } = await supabase
        .from("bolao")
        .upsert(inserts, {
          onConflict: "event_id,user_id,game_index",
        });

      if (error) throw error;

      // =========================
      // WHATSAPP (CORRIGIDO)
      // =========================

      const header = `
Palpite registrado de:

Nome: ${user.full_name}
Username: ${user.user_name}
Telefone: +55${user.phone}

Data/Hora: ${new Date().toLocaleString("pt-BR")}
Status: Em validação

SEUS PALPITES:
`;

      const body = jogos
        .map((j, i) => `${j} - ${bets[i] || "-"}`)
        .join("\n");

      const msgFinal = `${header}\n${body}`;

      const encodedMsg = encodeURIComponent(msgFinal);

      const phoneAdmin = "351914845439";

      const appUrl = `whatsapp://send?phone=${phoneAdmin}&text=${encodedMsg}`;
      const webUrl = `https://wa.me/${phoneAdmin}?text=${encodedMsg}`;

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        window.open(appUrl, "_self");

        setTimeout(() => {
          window.open(webUrl, "_blank");
        }, 1200);
      } else {
        window.open(webUrl, "_blank");
      }

      setMsg("✔ Enviado com sucesso");
      setShowModal(false);
      setStep("form");
    } catch (err) {
      console.error(err);
      setMsg("❌ Erro ao salvar palpites");
    }
  }

  // =========================
  // UI
  // =========================

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
        <strong>Bolão Zé Bangu</strong>
        <button onClick={() => navigate("/")}>🏠</button>
      </div>

      {/* FORM */}
      {step === "form" && (
        <div
          style={{
            marginTop: 15,
            background: "#fff",
            padding: 15,
            borderRadius: 10,
            lineHeight: 1.4,
          }}
        >
          <h3>Bem-vindo ao CanGuess</h3>

          <p>Seu ecossistema de palpites do <strong>Bolão do Zé Bangu</strong>.</p>

          <p>
            Você está acessando o <strong>Workspace Zé Bangu</strong>. Este é o
            primeiro evento do sistema.
          </p>

          <p>
            Estamos em desenvolvimento. Caso encontre qualquer problema, entre em contato:
          </p>

          <p>
            📞 Admin: +351 914 845 439 / +55 21 97234-1976 <br />
            📞 Zé Luiz: (21) 96490-6217
          </p>

          <hr />

          <p><strong>IMPORTANTE:</strong> Este formulário de cadastro é obrigatório apenas na primeira vez.</p>

          <p>Depois, basta usar apenas seu <strong>telefone</strong> para acessar o sistema.</p>

          <p>Formato: DDD + número (ex: 21972341965)</p>

          <hr />

          <p>Após validar, você poderá inserir seus palpites e revisar antes de confirmar.</p>

          <h4>Identificação do Palpiteiro</h4>

          <input
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Nome de usuário (nickname)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Telefone (DDD + número)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <button style={btnStyle} onClick={validarUsuario}>
            Validar e continuar
          </button>

          <p style={{ fontSize: 12 }}>{msg}</p>
        </div>
      )}

      {/* BETS */}
      {step === "bets" && (
        <div style={{ marginTop: 15, background: "#fff", padding: 10, borderRadius: 10 }}>
          <h3>Seus palpites</h3>

          {jogos.map((j, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ fontSize: 12 }}>{j}</span>

              <div style={{ display: "flex", gap: 10 }}>
                {["1", "X", "2"].map((v) => (
                  <label key={v} style={{ fontSize: 12 }}>
                    <input
                      type="radio"
                      name={`j-${i}`}
                      onChange={() => escolher(i, v)}
                    />{" "}
                    {v}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button style={btnStyle} onClick={abrirConfirmacao}>
            Revisar palpites
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={modalBg}>
          <div style={modalBox}>
            <h3>Confirmação final</h3>

            <div style={{ fontSize: 12, maxHeight: 250, overflowY: "auto" }}>
              {jogos.map((j, i) => (
                <div key={i}>
                  {j} → {bets[i] || "-"}
                </div>
              ))}
            </div>

            <button style={btnStyle} onClick={confirmarEnvio}>
              Confirmar e enviar WhatsApp
            </button>

            <button style={{ marginTop: 10 }} onClick={() => setShowModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 12 }}>{msg}</p>
    </div>
  );
}

// STYLES
const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btnStyle = {
  width: "100%",
  padding: 12,
  background: "#C1121F",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  marginTop: 10,
};

const modalBg = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  width: "90%",
};
