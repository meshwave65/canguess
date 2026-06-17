import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function MapaPalpites() {
  const [dados, setDados] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);

  function calcResult(a, b) {
    if (a == null || b == null) return "-";
    if (a > b) return "A";
    if (a < b) return "B";
    return "X";
  }

  async function updateStatus(user_id, status) {
    try {
      await supabase
        .from("predicts")
        .update({ status })
        .eq("user_uuid", user_id);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }

  async function load() {
    setLoading(true);

    try {
      const bolaoJson = await fetch("/data/bolao.json").then((r) =>
        r.json()
      );

      setEngine(bolaoJson);

      const rounds = bolaoJson.rounds || [];
      const TOTAL = rounds.length;

      const { data: bolao } = await supabase
        .from("predicts")
        .select("*")
        .eq("event_uuid", bolaoJson.event_uuid);

      const { data: users } = await supabase
        .from("users")
        .select("id, user_name");

      const userMap = Object.fromEntries(
        (users || []).map((u) => [u.id, u.user_name])
      );

      const grouped = {};

      (bolao || []).forEach((item) => {
        const userId = item.user_id || item.user_uuid;

        if (!grouped[userId]) {
          grouped[userId] = {
            user_id: userId,
            user_name: userMap[userId] || "-",
            status: "Em validação",
            palpites: Array(TOTAL).fill("-"),
            pontos: 0,
          };
        }

        const i = item.round_index - 1;
        grouped[userId].palpites[i] = item.prediction;

        const round = rounds[i];

        const a = round?.parts?.[0]?.value;
        const b = round?.parts?.[1]?.value;

        const result = calcResult(a, b);

        if (item.prediction === result && item.status === "Validado") {
          grouped[userId].pontos += 1;
        }

        if (item.status === "Validado") {
          grouped[userId].status = "Validado";
        }
      });

      const arr = Object.values(grouped);

      setDados(arr);

      setStatusMap(
        Object.fromEntries(arr.map((u) => [u.user_id, u.status]))
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
  };

  const tdCenter = {
    border: "1px solid #ddd",
    padding: 6,
    textAlign: "center",
  };

  if (loading) {
    return <div style={{ padding: 10 }}>Carregando...</div>;
  }

  const rounds = engine?.rounds || [];

  return (
    <div style={{ padding: 10 }}>
      {/* HEADER */}
      <h2>{engine?.event_name || "Evento"}</h2>
      <h4>Tela de Validação de Apostas</h4>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: 12,
          }}
        >
          <thead>
            <tr>
              <th style={th}>USUÁRIO</th>
              <th style={th}>PTS</th>

              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.parts?.[0]?.team_code || "-"}
                </th>
              ))}
            </tr>

            <tr>
              <th style={th}></th>
              <th style={th}></th>

              {rounds.map((_, i) => (
                <th key={i} style={th}>
                  vs
                </th>
              ))}
            </tr>

            <tr>
              <th style={th}></th>
              <th style={th}></th>

              {rounds.map((r, i) => (
                <th key={i} style={th}>
                  {r.parts?.[1]?.team_code || "-"}
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

                  {/* 🔥 AUTO-SAVE AQUI */}
                  <select
                    value={statusMap[user.user_id]}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      setStatusMap((prev) => ({
                        ...prev,
                        [user.user_id]: newStatus,
                      }));

                      await updateStatus(user.user_id, newStatus);

                      // 🔥 recarrega para atualizar ranking e rounds
                      load();
                    }}
                  >
                    <option>Em validação</option>
                    <option>Validado</option>
                    <option>Cancelado</option>
                  </select>
                </td>

                <td style={tdCenter}>
                  <b>{user.pontos}</b>
                </td>

                {rounds.map((r, i) => {
                  const pick = user.palpites[i];

                  return (
                    <td key={i} style={tdCenter}>
                      {pick || "-"}
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
