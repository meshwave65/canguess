import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosRodadas() {
  const navigate = useNavigate();

  const [times, setTimes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const [jogos, setJogos] = useState(
    Array.from({ length: 11 }, () => ({
      home: "",
      away: "",
      date: "",
      time: "",
      local: ""
    }))
  );

  useEffect(() => {
    loadTimes();
  }, []);

  async function loadTimes() {
    const { data, error } = await supabase
      .from("times")
      .select("id,codigo");

    if (!error) setTimes(data || []);
  }

  function updateGame(index, field, value) {
    const copy = [...jogos];
    copy[index][field] = value;
    setJogos(copy);
  }

  function addGame() {
    setJogos([
      ...jogos,
      { home: "", away: "", date: "", time: "", local: "" }
    ]);
  }

  async function saveRound() {
    setMensagem("");

    try {
      const validos = jogos.filter(
        (j) => j.home && j.away && j.date && j.time
      );

      if (validos.length === 0) {
        setMensagem("Preencha pelo menos um jogo");
        return;
      }

      const { error } = await supabase.from("round_games").insert(
        validos.map((j) => ({
          home_team: j.home,
          away_team: j.away,
          game_date: `${j.date} ${j.time}`,
          local: j.local
        }))
      );

      if (error) {
        setMensagem("Erro ao salvar rodada");
        return;
      }

      setMensagem("Rodada salva com sucesso!");
    } catch (err) {
      setMensagem("Erro inesperado");
    }
  }

  return (
    <div style={{ padding: 12, paddingBottom: 80 }}>
      {/* HEADER PADRÃO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10
        }}
      >
        <button onClick={() => navigate("/")} style={iconBtn}>
          🏠
        </button>

        <h3 style={{ color: "#C1121F" }}>Cadastro de Rodadas</h3>

        <button onClick={() => navigate(-1)} style={iconBtn}>
          ←
        </button>
      </div>

      {/* MENSAGEM */}
      {mensagem && (
        <div style={msgBox}>{mensagem}</div>
      )}

      {/* LINHAS DOS JOGOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {jogos.map((jogo, i) => (
          <div key={i} style={row}>
            {/* CASA */}
            <select
              value={jogo.home}
              onChange={(e) => updateGame(i, "home", e.target.value)}
              style={select}
            >
              <option value="">Casa</option>
              {times.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo}
                </option>
              ))}
            </select>

            <span style={{ fontWeight: "bold" }}>x</span>

            {/* FORA */}
            <select
              value={jogo.away}
              onChange={(e) => updateGame(i, "away", e.target.value)}
              style={select}
            >
              <option value="">Fora</option>
              {times.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo}
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
          </div>
        ))}
      </div>

      {/* AÇÕES */}
      <div style={{ marginTop: 12 }}>
        <button onClick={addGame} style={btnSecondary}>
          + Adicionar jogo
        </button>

        <button onClick={saveRound} style={btnPrimary}>
          💾 Salvar Rodada
        </button>
      </div>
    </div>
  );
}

/* ===== ESTILO PADRÃO IGUAL CADASTROS ===== */

const row = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#fff",
  padding: 6,
  borderRadius: 6
};

const select = {
  flex: 1,
  padding: 4
};

const dateInput = {
  width: 110,
  padding: 4
};

const timeInput = {
  width: 80,
  padding: 4
};

const localInput = {
  flex: 2,
  padding: 4
};

const btnPrimary = {
  width: "100%",
  marginTop: 8,
  background: "#C1121F",
  color: "#fff",
  border: "none",
  padding: 12,
  borderRadius: 6,
  fontWeight: "bold"
};

const btnSecondary = {
  width: "100%",
  marginTop: 8,
  background: "#eee",
  border: "none",
  padding: 10,
  borderRadius: 6
};

const iconBtn = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer"
};

const msgBox = {
  marginBottom: 10,
  padding: 8,
  background: "#f5f5f5",
  borderRadius: 6
};
