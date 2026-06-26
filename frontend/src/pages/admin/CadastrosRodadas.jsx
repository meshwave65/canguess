import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosRodadas() {
  const navigate = useNavigate();
  const [times, setTimes] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [jogos, setJogos] = useState(
    Array.from({ length: 10 }, () => ({
      home: "",
      away: "",
      date: "",
      time: "",
      local: "",
      score: "" // Placar
    }))
  );

  useEffect(() => {
    loadTimes();
  }, []);

  async function loadTimes() {
    const { data } = await supabase.from("times").select("id,nome,codigo");
    setTimes(data || []);
  }

  function updateGame(index, field, value) {
    const copy = [...jogos];
    copy[index][field] = value;
    setJogos(copy);
  }

  function addGame() {
    setJogos([
      ...jogos,
      { home: "", away: "", date: "", time: "", local: "", score: "" }
    ]);
  }

  async function saveRound() {
    setMensagem("");
    try {
      const validos = jogos.filter(
        (j) => j.home && j.away && j.date && j.time
      );

      if (validos.length === 0) {
        setMensagem("❌ Preencha pelo menos um jogo completo");
        return;
      }

      const { error } = await supabase.from("event_rounds").insert(
        validos.map((j) => ({
          home_team: j.home,
          away_team: j.away,
          game_date: `${j.date} ${j.time}`,
          local: j.local || null,
          result_round: j.score?.trim() || null,   // ← Placar salvo aqui
        }))
      );

      if (error) {
        console.error(error);
        setMensagem("Erro ao salvar: " + error.message);
        return;
      }

      setMensagem("✅ Rodada salva com sucesso!");
      // Limpa o formulário após salvar
      setJogos(Array.from({ length: 10 }, () => ({
        home: "", away: "", date: "", time: "", local: "", score: ""
      })));
    } catch (err) {
      setMensagem("Erro inesperado");
    }
  }

  return (
    <div style={{ padding: 15, paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15
      }}>
        <button onClick={() => navigate("/")} style={iconBtn}>🏠</button>
        <h3 style={{ color: "#C1121F", margin: 0 }}>Cadastro de Rodadas</h3>
        <button onClick={() => navigate(-1)} style={iconBtn}>←</button>
      </div>

      {/* MENSAGEM */}
      {mensagem && (
        <div style={{
          padding: 12,
          marginBottom: 15,
          background: mensagem.includes("sucesso") ? "#d4edda" : "#f8d7da",
          color: mensagem.includes("sucesso") ? "#155724" : "#721c24",
          borderRadius: 6
        }}>
          {mensagem}
        </div>
      )}

      {/* LISTA DE JOGOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {jogos.map((jogo, i) => (
          <div key={i} style={row}>
            {/* CASA */}
            <select
              value={jogo.home}
              onChange={(e) => updateGame(i, "home", e.target.value)}
              style={select}
            >
              <option value="">Time Casa</option>
              {times.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>

            <span style={{ fontWeight: "bold", fontSize: "18px" }}>x</span>

            {/* FORA */}
            <select
              value={jogo.away}
              onChange={(e) => updateGame(i, "away", e.target.value)}
              style={select}
            >
              <option value="">Time Fora</option>
              {times.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>

            {/* DATA */}
            <input
              type="date"
              value={jogo.date}
              onChange={(e) => updateGame(i, "date", e.target.value)}
              style={dateInput}
            />

            {/* HORA */}
            <input
              type="time"
              value={jogo.time}
              onChange={(e) => updateGame(i, "time", e.target.value)}
              style={timeInput}
            />

            {/* LOCAL */}
            <input
              placeholder="Local"
              value={jogo.local}
              onChange={(e) => updateGame(i, "local", e.target.value)}
              style={localInput}
            />

            {/* 🔥 PLACAR - MAIS DESTAQUE */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: 2 }}>Placar</label>
              <input
                placeholder="3x1"
                value={jogo.score}
                onChange={(e) => updateGame(i, "score", e.target.value)}
                style={scoreInput}
              />
            </div>
          </div>
        ))}
      </div>

      {/* BOTÕES */}
      <div style={{ marginTop: 20, display: "flex", gap: 10, flexDirection: "column" }}>
        <button onClick={addGame} style={btnSecondary}>
          + Adicionar Jogo
        </button>
        <button onClick={saveRound} style={btnPrimary}>
          💾 Salvar Rodada Completa
        </button>
      </div>
    </div>
  );
}

/* ========================= STYLES ========================= */
const row = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#fff",
  padding: 10,
  borderRadius: 8,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  flexWrap: "wrap",
};

const select = {
  flex: 1,
  minWidth: 140,
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const dateInput = { width: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc" };
const timeInput = { width: 90, padding: 8, borderRadius: 6, border: "1px solid #ccc" };
const localInput = { 
  flex: 1.5, 
  minWidth: 120, 
  padding: 8, 
  borderRadius: 6, 
  border: "1px solid #ccc" 
};

const scoreInput = {
  width: 90,
  padding: 8,
  fontWeight: "bold",
  fontSize: "16px",
  textAlign: "center",
  border: "2px solid #C1121F",
  borderRadius: 6,
  backgroundColor: "#fff9f9"
};

const btnPrimary = {
  width: "100%",
  padding: 14,
  background: "#C1121F",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  fontSize: 16,
};

const btnSecondary = {
  width: "100%",
  padding: 12,
  background: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};

const iconBtn = {
  background: "transparent",
  border: "none",
  fontSize: 24,
  cursor: "pointer",
};
