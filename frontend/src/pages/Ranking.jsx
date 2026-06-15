import { useEffect, useState } from "react";
import { supabase } from "./admin/lib/supabase";

export default function Ranking() {
  const [dados, setDados] = useState([]);
  const [evento, setEvento] = useState(null);
  const [rounds, setRounds] = useState([]);

  async function load() {
    try {
      const engine = await fetch("/data/bolao.json").then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar bolao.json");
        return r.json();
      });

      const engineRounds = engine.rounds || [];
      setRounds(engineRounds);

      const [{ data: bolao }, { data: users }] = await Promise.all([
        supabase.from("bolao").select("*"),
        supabase.from("users").select("id, user_name"),
      ]);

      if (!bolao) return;

      setEvento({
        name: engine.event_name || "BOLÃO",
      });

      const userMap = Object.fromEntries(
        (users || []).map((u) => [u.user_id, u.user_name])
      );

      const grouped = {};

      for (const item of bolao) {
        const index = item.game_index - 1;
        const round = engineRounds[index];

        if (!grouped[item.user_uuid]) {
          grouped[item.useruuid] = {
            user_uuid: item.user_uuid,
            user_name: userMap[item.user_uuid] || "-",
            predictions: Array(engineRounds.length).fill(""),
            pontos: 0,
          };
        }

        grouped[item.user_uuid].predictions[index] = item.prediction;

        const result = round?.result;

        if (result && item.prediction === result) {
          grouped[item.user_uuid].pontos += 1;
        }
      }

      setDados(
        Object.values(grouped).sort((a, b) => {
          if (b.pontos !== a.pontos) {
            return b.pontos - a.pontos;
          }

          return a.user_name.localeCompare(b.user_name);
        })
      );

    } catch (err) {
      console.error("Erro ranking:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 10 }}>

      {/* EVENTO */}
      <h2>{evento?.name}</h2>
      <h4>🏆 Ranking</h4>


      {/* JOGOS DA RODADA */}

      <h3 style={{ marginTop: 20 }}>JOGOS DA RODADA</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>

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
                <td style={tdCenter}>
                  <b>{r.result || "-"}</b>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>


      {/* RANKING USUÁRIOS */}

      <h3 style={{ marginTop: 30 }}>RANKING</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>

          <thead>
            <tr>
              <th style={th}>USUÁRIO</th>
              <th style={th}>PTS</th>

              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.round_name}
                </th>
              ))}
            </tr>

            <tr>
              <th style={th}></th>
              <th style={th}></th>

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

                <td style={td}>
                  {user.user_name}
                </td>

                <td style={tdCenter}>
                  <b>{user.pontos}</b>
                </td>

                {rounds.map((r, i) => {

                  const pick = user.predictions[i];
                  const ok = pick === r.result;

                  return (
                    <td
                      key={i}
                      style={{ ...tdCenter, fontSize: 18 }}
                    >
                      {ok ? "⚽" : ""}
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


const th = {
  border: "1px solid #ddd",
  padding: 6,
  background: "#f3f4f6",
  textAlign: "center",
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