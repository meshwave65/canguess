import { useEffect, useState } from "react";
import { supabase } from "./admin/lib/supabase";

export default function Ranking() {
  const [dados, setDados] = useState([]);
  const [engine, setEngine] = useState(null);
  const [rounds, setRounds] = useState([]);

  async function load() {
    try {
      const res = await fetch("/data/bolao.json");
      if (!res.ok) throw new Error("Falha ao carregar bolao.json");

      const data = await res.json();

      setEngine(data);
      setRounds(data.rounds || []);

      const eventId = data.event_uuid || data.id;

      const [{ data: bolao }, { data: users }] = await Promise.all([
        supabase
          .from("predicts")
          .select("*")
          .eq("event_uuid", eventId)
          .eq("status", "validado"),

        supabase.from("users").select("id, user_name"),
      ]);

      if (!bolao) return;

      const userMap = Object.fromEntries(
        (users || []).map((u) => [u.id, u.user_name])
      );

      const grouped = {};

      for (const item of bolao) {
        const index = item.round_index - 1;

        const round = data.rounds?.[index];

        const isFinished =
          round?.status === "encerrado" ||
          round?.status === "disputa penaltis";

        if (!grouped[item.user_uuid]) {
          grouped[item.user_uuid] = {
            user_uuid: item.user_uuid,
            user_name: userMap[item.user_uuid] || "-",
            predictions: Array(data.rounds.length).fill(""),
            pontos: 0,
          };
        }

        grouped[item.user_uuid].predictions[index] = item.prediction;

        if (
          isFinished &&
          round?.result &&
          item.prediction === round.result
        ) {
          grouped[item.user_uuid].pontos += 1;
        }
      }

      const ranking = Object.values(grouped).sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        return a.user_name.localeCompare(b.user_name);
      });

      setDados(ranking);

    } catch (err) {
      console.error("Erro ranking:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 🔒 BLOQUEIO DO RANKING
  if (engine && engine.is_open === true) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
        🔒 Ranking ainda não disponível. Ele será liberado após o encerramento das apostas.
      </div>
    );
  }

  return (
    <div style={{ padding: 10 }}>

      {/* HEADER */}
      <div style={headerBox}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>
          {engine?.event_name || "EVENTO"}
        </div>

        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          Workspace {engine?.workspace_name || "-"}
        </div>
      </div>

      {/* JOGOS DA RODADA */}
      <h3 style={{ marginTop: 20 }}>JOGOS DA RODADA</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>JOGO</th>
              <th style={th}>DATA</th>
              <th style={th}>HORA</th>
              <th style={th}>LOCAL</th>
              <th style={th}>PLACAR</th>
              <th style={th}>RESULT</th>
            </tr>
          </thead>

          <tbody>
            {rounds.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.round_name}</td>
                <td style={tdCenter}>{r.round_date || "-"}</td>
                <td style={tdCenter}>{r.time_round || "-"}</td>
                <td style={td}>{r.local || "-"}</td>
                <td style={tdCenter}>{r.score || "-"}</td>
                <td style={tdCenter}><b>{r.result || "-"}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RANKING */}
      <h3 style={{ marginTop: 30 }}>RANKING</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>

          <thead>
            <tr>
              <th rowSpan={4} style={th}>USUÁRIO</th>
              <th rowSpan={4} style={th}>PTS</th>

              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.parts?.[0]?.team_code || "-"}
                </th>
              ))}
            </tr>

            <tr>
              {rounds.map((_, i) => (
                <th key={i} style={th}>vs</th>
              ))}
            </tr>

            <tr>
              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.parts?.[1]?.team_code || "-"}
                </th>
              ))}
            </tr>

            <tr>
              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.score || "-"}
                </th>
              ))}
            </tr>

          </thead>

          <tbody>
            {dados.map((user) => (
              <tr key={user.user_uuid}>
                <td style={td}>{user.user_name}</td>
                <td style={tdCenter}><b>{user.pontos}</b></td>

                {rounds.map((r, i) => {
                  const pick = user.predictions[i];
                  const ok = pick === r.result;

                  return (
                    <td key={i} style={{ ...tdCenter, fontSize: 14 }}>
                      {pick || "-"}
                      {ok && <span style={{ fontSize: 16 }}> ⚽</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const headerBox = {
  background: "#0B3C49",
  color: "#fff",
  padding: "12px 14px",
  borderRadius: 8,
  textAlign: "center",
};

const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  fontSize: 12,
};

const th = {
  border: "1px solid #ddd",
  padding: 6,
  background: "#f3f4f6",
  textAlign: "center",
  verticalAlign: "middle",
};

const td = {
  border: "1px solid #ddd",
  padding: 6,
};

const tdCenter = {
  border: "1px solid #ddd",
  padding: 6,
  textAlign: "center",
};
