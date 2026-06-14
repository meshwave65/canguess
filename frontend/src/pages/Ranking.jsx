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
        (users || []).map((u) => [u.id, u.user_name])
      );

      const grouped = {};

      for (const item of bolao) {
        const index = item.game_index - 1;
        const round = engineRounds[index];

        if (!grouped[item.user_id]) {
          grouped[item.user_id] = {
            user_id: item.user_id,
            user_name: userMap[item.user_id] || "-",
            palpites: Array(engineRounds.length).fill(""),
            pontos: 0,
          };
        }

        grouped[item.user_id].palpites[index] = item.prediction;

        // 🔥 resultado já vem pronto do engine
        const result = round?.result || round?.score
          ? getResult(round.score)
          : null;

        if (result && item.prediction === result) {
          grouped[item.user_id].pontos += 1;
        }
      }

      const arr = Object.values(grouped);

      arr.sort((a, b) => {
        if (a.pontos !== b.pontos) return b.pontos - a.pontos;
        return a.user_name.localeCompare(b.user_name, "pt-BR");
      });

      setDados(arr);
    } catch (err) {
      console.error("Erro ranking:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 🔥 função única de inferência (caso score exista)
  function getResult(score) {
    if (!score) return null;

    const [a, b] = score.split("-").map(Number);

    if (isNaN(a) || isNaN(b)) return null;

    if (a > b) return "1";
    if (a < b) return "2";
    return "X";
  }

  return (
    <div style={{ padding: 10 }}>
      <h2>{evento?.name}</h2>
      <h4>🏆 Ranking</h4>

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
              <tr key={user.user_id}>
                <td style={td}>{user.user_name}</td>

                <td style={tdCenter}>
                  <b>{user.pontos}</b>
                </td>

                {rounds.map((r, i) => {
                  const pick = user.palpites[i];

                  const result = getResult(r.score);
                  const ok = pick === result;

                  return (
                    <td
                      key={i}
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        fontSize: 16,
                      }}
                    >
                      {ok ? "⚽" : pick}
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
