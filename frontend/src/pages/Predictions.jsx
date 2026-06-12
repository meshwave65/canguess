import { useState } from "react";
import { supabase } from "./admin/lib/supabase";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

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

  const [form, setForm] = useState({
    full_name: "",
    user_name: "",
    phone: "",
  });

  const [validatedUser, setValidatedUser] = useState(null);
  const [bets, setBets] = useState({});
  const [msg, setMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  function handleFormChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function escolher(i, value) {
    setBets((prev) => ({
      ...prev,
      [i]: value,
    }));
  }

  // =========================
  // VALIDAR / CRIAR USUÁRIO
  // =========================
  async function validarUsuario() {
    try {
      if (!form.phone) {
        setMsg("Telefone obrigatório");
        return;
      }

      const phone = form.phone.replace(/\D/g, "");

      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      let user = existing;

      if (!existing) {
        const { data: created, error } = await supabase
          .from("users")
          .insert({
            full_name: form.full_name,
            user_name: form.user_name,
            phone,
          })
          .select()
          .single();

        if (error) throw error;
        user = created;
      }

      setValidatedUser(user);
      setMsg("Usuário validado ✔");
    } catch (err) {
      console.error(err);
      setMsg("Erro ao validar usuário");
    }
  }

  // =========================
  // ABRIR CONFIRMAÇÃO (NÃO SALVA)
  // =========================
  function salvar() {
    setShowConfirm(true);
  }

  // =========================
  // CONFIRMAR: SALVA + WHATSAPP
  // =========================
  async function confirmar() {
    try {
      setMsg("Salvando palpites...");

      if (!validatedUser) {
        setMsg("Valide o usuário primeiro");
        return;
      }

      const inserts = jogos.map((_, i) => ({
        event_id: EVENT_ID,
        user_id: validatedUser.id,
        game_index: i + 1,
        prediction: bets[i] || null,
        status: "Em validação",
      }));

      const { error } = await supabase
        .from("bolao")
        .upsert(inserts, {
          onConflict: "event_id,user_id,game_index",
        });

      if (error) throw error;

      const now = new Date().toLocaleString();

      const linhas = jogos.map((j, i) => `${j} - ${bets[i] || "-"}`);

      const msgWhats = `
Palpite registrado de:

Nome: ${validatedUser.full_name}
Username: ${validatedUser.user_name}
Telefone: +55${validatedUser.phone}

Data/Hora: ${now}
Status: Em validação

SEUS PALPITES:

${linhas.join("\n")}
`;

      const url = `https://wa.me/5521972341965?text=${encodeURIComponent(
        msgWhats
      )}`;

      setShowConfirm(false);

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      setMsg("Erro ao salvar palpites");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 12, paddingBottom: 90 }}>

        {/* NAV */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button onClick={() => navigate(-1)}>⬅️</button>
          <h3 style={{ margin: 0 }}>CanGuess - Bolão do Zé</h3>
          <button onClick={() => navigate("/")}>🏠</button>
        </div>

        {/* INTRO */}
        <div style={{
          fontSize: 12,
          lineHeight: 1.4,
          background: "#fff",
          padding: 10,
          borderRadius: 8,
          marginBottom: 12
        }}>
          <strong>Bem vindos ao CanGuess</strong><br /><br />
          Sistema de bolões em desenvolvimento.<br />
          Use seu telefone como identificação única.<br />
        </div>

        {/* FORM */}
        {!validatedUser && (
          <div style={{
            background: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <input
              name="full_name"
              placeholder="Nome completo"
              value={form.full_name}
              onChange={handleFormChange}
              style={input}
            />

            <input
              name="user_name"
              placeholder="Username"
              value={form.user_name}
              onChange={handleFormChange}
              style={input}
            />

            <input
              name="phone"
              placeholder="Telefone (DDD + número)"
              value={form.phone}
              onChange={handleFormChange}
              style={input}
            />

            <button onClick={validarUsuario} style={btn}>
              Validar
            </button>

            {msg && <p style={{ fontSize: 12 }}>{msg}</p>}
          </div>
        )}

        {/* PALPITES */}
        {validatedUser && (
          <div style={{
            background: "#fff",
            padding: 10,
            borderRadius: 8
          }}>
            <table style={{ width: "100%", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#C1121F", color: "#fff" }}>
                  <th>JOGO</th>
                  <th>M</th>
                  <th>E</th>
                  <th>V</th>
                </tr>
              </thead>

              <tbody>
                {jogos.map((jogo, i) => (
                  <tr key={i}>
                    <td>{jogo}</td>

                    {["M", "E", "V"].map((v) => (
                      <td key={v} style={{ textAlign: "center" }}>
                        <input
                          type="radio"
                          name={`jogo-${i}`}
                          onChange={() => escolher(i, v)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={salvar} style={btn}>
              SALVAR PALPITES
            </button>
          </div>
        )}
      </div>

      <BottomNav />

      {/* MODAL CONFIRMAÇÃO */}
      {showConfirm && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Confirmar palpites</h3>

            <p style={{ fontSize: 12 }}>
              Revise seus palpites antes de confirmar.
            </p>

            <ul style={{ fontSize: 12, maxHeight: 200, overflow: "auto" }}>
              {jogos.map((j, i) => (
                <li key={i}>
                  {j} → {bets[i] || "-"}
                </li>
              ))}
            </ul>

            <button onClick={confirmar} style={btn}>
              Confirmar
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              style={{ ...btn, background: "#999", marginTop: 8 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// =========================
// styles
// =========================
const input = {
  display: "block",
  width: "100%",
  marginBottom: 8,
  padding: 8,
  border: "1px solid #ddd",
  borderRadius: 6,
};

const btn = {
  width: "100%",
  padding: 12,
  background: "#C1121F",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  marginTop: 10,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#fff",
  padding: 16,
  borderRadius: 10,
  width: "90%",
};
