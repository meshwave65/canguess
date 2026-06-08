import { useState } from "react";
import { supabase } from "./admin/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Predictions() {
  const navigate = useNavigate();

  const jogos = [
    "FLAMENGO x VASCO",
    "BOTAFOGO x FLUMINENSE",
    "PALMEIRAS x CORINTHIANS",
    "SANTOS x SÃO PAULO",
    "GRÊMIO x INTERNACIONAL",
    "CRUZEIRO x ATLÉTICO MG",
    "BAHIA x VITÓRIA",
    "FORTALEZA x CEARÁ",
    "SPORT x NÁUTICO",
    "GOIÁS x VILA NOVA",
    "ATHLETICO x CORITIBA",
  ];

  const [senha, setSenha] = useState("");
  const [validada, setValidada] = useState(false);
  const [msg, setMsg] = useState("");

  const [bets, setBets] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  // =========================
  // VALIDAR SENHA
  // =========================
  async function validarSenha() {
    const { data, error } = await supabase
      .from("event_passw")
      .select("*")
      .eq("code_event", senha)
      .eq("status", 1)
//      .limit(1)
      .single();

    if (error || !data) {
      setValidada(false);
      setMsg("Senha inválida ou já utilizada");
      return;
    }

    setValidada(true);
    setMsg("Senha validada ✔");
  }

  // =========================
  // ESCOLHA DOS PALPITES
  // =========================
  function escolher(jogoIndex, valor) {
    setBets((prev) => ({
      ...prev,
      [jogoIndex]: valor,
    }));
  }

  // =========================
  // SALVAR (ABRE CONFIRMAÇÃO)
  // =========================
  function salvar() {
    setShowConfirm(true);
  }

  // =========================
  // CONFIRMAR SALVAMENTO
  // =========================
  async function confirmar() {
    const { error } = await supabase.from("rounds").insert([
      {
        code_event: senha,
        bets,
      },
    ]);

    if (error) {
      setMsg("Erro ao salvar aposta");
      return;
    }

    await supabase
      .from("event_passw")
      .update({ status: 0 })
      .eq("code_event", senha);

    setMsg("Aposta registrada com sucesso ✔");
    setShowConfirm(false);
  }

  return (
    <div style={{ padding: 12, paddingBottom: 90 }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
      }}>
        <button onClick={() => navigate(-1)}>⬅️</button>
        <h3>Palpites da Rodada</h3>
        <button onClick={() => navigate("/")}>🏠</button>
      </div>

      {/* SENHA */}
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Senha da aposta"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            padding: 8,
            width: "60%",
            border: "1px solid #ccc",
            borderRadius: 6
          }}
        />

        <button
          onClick={validarSenha}
          style={{
            marginLeft: 8,
            padding: "8px 10px"
          }}
        >
          Validar
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: 10, fontSize: 14 }}>
          {msg}
        </div>
      )}

      {!validada && (
        <div style={{ color: "#777", marginBottom: 10 }}>
          Informe uma senha válida para liberar os palpites
        </div>
      )}

      {/* TABELA */}
      {validada && (
        <>
          <table style={{
            width: "100%",
            background: "#fff",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr style={{ background: "#C1121F", color: "#fff" }}>
                <th style={{ padding: 8, textAlign: "left" }}>JOGO</th>
                <th>M</th>
                <th>E</th>
                <th>V</th>
              </tr>
            </thead>

            <tbody>
              {jogos.map((jogo, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{jogo}</td>

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

          <button
            onClick={salvar}
            style={{
              width: "100%",
              marginTop: 15,
              padding: 14,
              background: "#C1121F",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold"
            }}
          >
            SALVAR PALPITES
          </button>
        </>
      )}

      {/* CONFIRMAÇÃO */}
      {showConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: 20,
            width: "90%",
            borderRadius: 10
          }}>
            <h3>Confirmação</h3>

            <p style={{ marginBottom: 10 }}>
              Confira atentamente seus palpites antes de confirmar sua aposta:
            </p>

            <ul>
              {jogos.map((j, i) => (
                <li key={i}>
                  {j} → {bets[i] || "sem escolha"}
                </li>
              ))}
            </ul>

            <button onClick={confirmar} style={{ marginTop: 10 }}>
              Confirmar
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              style={{ marginTop: 10, marginLeft: 10 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
