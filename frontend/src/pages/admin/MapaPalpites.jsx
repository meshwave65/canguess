import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function MapaPalpites() {
  const [dados, setDados] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    try {
      const bolaoJson = await fetch("/data/bolao.json").then(r => r.json());

      setEngine(bolaoJson);

      const rounds = bolaoJson.rounds || [];
      const TOTAL = rounds.length;

      const { data: bolao } = await supabase.from("bolao").select("*");

      const { data: users } = await supabase
        .from("users")
        .select("id, user_name");

      const userMap = Object.fromEntries(
        (users || []).map(u => [u.id, u.user_name])
      );

      const grouped = {};

      (bolao || []).forEach((item) => {
        if (!grouped[item.user_id]) {
          grouped[item.user_id] = {
            user_id: item.user_id,
            user_name: userMap[item.user_id] || "-",
            status: item.status || "Em validação",
            palpites: Array(TOTAL).fill("-"),
            pontos: 0,
          };
        }

        const i = item.game_index - 1;
        grouped[item.user_id].palpites[i] = item.prediction;

        const round = rounds[i];

        const a = round?.parts?.[0]?.value;
        const b = round?.parts?.[1]?.value;

        let result = "-";

        if (a != null && b != null) {
          if (a > b) result = "A";
          else if (a < b) result = "B";
          else result = "X";
        }

        if (item.prediction === result) {
          grouped[item.user_id].pontos += 1;
        }
      });

      const arr = Object.values(grouped);

      setDados(arr);

      setStatusMap(
        Object.fromEntries(arr.map(u => [u.user_id, u.status]))
      );

    } catch (err) {
      console.error("Erro ao carregar bolao.json:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const th = {
    border: "1px solid #ddd",
    padding: 6,
    background: "#f3f4f6",
    textAlign: "center",
  };

  const td = {
    border: "1px solid #ddd",
    padding: 6,
    verticalAlign: "top",
  };

  const tdCenter = {
    border: "1px solid #ddd",
    padding: 6,
    textAlign: "center",
  };

  if (loading) return <div style={{ padding: 10 }}>Carregando...</div>;

  const rounds = engine?.rounds || [];

  return (
    <div style={{ padding: 10 }}>

      <h2>{engine?.event_name || "Evento"}</h2>
      <h4>📊 Mapa de Palpites</h4>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>

          <thead>
            <tr>
              <th style={th}>USUÁRIO</th>
              <th style={th}>PTS</th>

              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.parts?.[0]?.team_code}
                </th>
              ))}
            </tr>

            <tr>
              <th style={th}></th>
              <th style={th}></th>

              {rounds.map((_, i) => (
                <th key={i} style={th}>vs</th>
              ))}
            </tr>

            <tr>
              <th style={th}></th>
              <th style={th}></th>

              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.parts?.[1]?.team_code}
                </th>
              ))}
            </tr>

            <tr>
              <th style={th}></th>
              <th style={th}></th>

              {rounds.map((r, i) => (
                <th key={i} style={{ ...th, fontWeight: "bold" }}>
                  {r.score || "-"}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dados.map((user) => (
              <tr key={user.user_id}>

                <td style={td}>
                  <div>{user.user_name}</div>

                  <select
                    value={statusMap[user.user_id]}
                    onChange={(e) =>
                      setStatusMap((prev) => ({
                        ...prev,
                        [user.user_id]: e.target.value,
                      }))
                    }
                  >
                    <option>Em validação</option>
                    <option>Validado</option>
                    <option>Cancelado</option>
                  </select>
                </td>

                <td style={tdCenter}>{user.pontos}</td>

                {rounds.map((r, i) => {
                  const pick = user.palpites[i];

                  const a = r?.parts?.[0]?.value;
                  const b = r?.parts?.[1]?.value;

                  let result = "-";

                  if (a != null && b != null) {
                    if (a > b) result = "A";
                    else if (a < b) result = "B";
                    else result = "X";
                  }

                  const ok = pick === result;

                  return (
                    <td
                      key={i}
                      style={{
                        textAlign: "center",
                        border: "1px solid #eee",
                        background: ok ? "#22c55e" : "",
                        color: ok ? "#fff" : "#000",
                        fontWeight: ok ? "bold" : "normal",
                      }}
                    >
                      {pick}
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
