import { useEffect, useState } from "react";
import { supabase } from "./admin/lib/supabase";

export default function Ranking() {
  const [dados, setDados] = useState([]);
  const [evento, setEvento] = useState(null);

  const jogos = [
    { a: "QAT", b: "SUI", result: "-" },
    { a: "BRA", b: "MAR", result: "-" },
    { a: "HAI", b: "SCO", result: "-" },
    { a: "AUS", b: "TUR", result: "-" },
    { a: "GER", b: "CUR", result: "-" },
    { a: "NED", b: "JPN", result: "-" },
    { a: "CIV", b: "ECU", result: "-" },
    { a: "SWE", b: "TUN", result: "-" },
    { a: "ESP", b: "CPV", result: "-" },
    { a: "BEL", b: "EGY", result: "-" },
    { a: "KSA", b: "URU", result: "-" },
  ];

  const TOTAL = jogos.length;

  async function load() {
    const [{ data: bolao }, { data: users }] =
      await Promise.all([
        supabase.from("bolao").select("*"),
        supabase.from("users").select("id, user_name"),
      ]);

    if (!bolao || bolao.length === 0) {
      setDados([]);
      return;
    }

    // 👇 pega event_id a partir do bolão
    const eventId = bolao[0].event_id;

    // 👇 event_phases → event_uuid
    const { data: phase } = await supabase
      .from("event_phases")
      .select("event_uuid")
      .eq("id", eventId)
      .single();

    // 👇 events → name
    const { data: eventData } = await supabase
      .from("events")
      .select("name")
      .eq("id", phase?.event_uuid)
      .single();

    setEvento(eventData);

    const userMap = Object.fromEntries(
      (users || []).map((u) => [u.id, u.user_name])
    );

    const grouped = {};

    (bolao || []).forEach((item) => {
      if (!grouped[item.user_id]) {
        grouped[item.user_id] = {
          user_id: item.user_id,
          user_name: userMap[item.user_id] || "-",
          palpites: Array(TOTAL).fill(""),
          pontos: 0,
        };
      }

      grouped[item.user_id].palpites[item.game_index - 1] =
        item.prediction;

      if (item.prediction === jogos[item.game_index - 1]?.result) {
        grouped[item.user_id].pontos += 1;
      }
    });

    const arr = Object.values(grouped);

    // 🏆 ranking correto
    arr.sort((a, b) => {
      if (a.pontos !== b.pontos) return b.pontos - a.pontos;
      return a.user_name.localeCompare(b.user_name, "pt-BR");
    });

    setDados(arr);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 10 }}>

      {/* 🏟️ EVENTO */}
      <h2 style={{ marginBottom: 4 }}>
        {evento?.name || "BOLÃO DO ZÉ COPA 2026"}
      </h2>

      <h4 style={{ marginTop: 0 }}>
        🏆 Ranking
      </h4>

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
              <th rowSpan={4} style={th}>USUÁRIO</th>
              <th rowSpan={4} style={th}>PTS</th>

              {jogos.map((j, i) => (
                <th key={i} style={th}>{j.a}</th>
              ))}
            </tr>

            <tr>
              {jogos.map((_, i) => (
                <th key={i} style={th}>vs</th>
              ))}
            </tr>

            <tr>
              {jogos.map((j, i) => (
                <th key={i} style={th}>{j.b}</th>
              ))}
            </tr>

            <tr>
              {jogos.map((j, i) => (
                <th key={i} style={{ ...th, fontWeight: "bold" }}>
                  {j.result}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dados.map((user) => (
              <tr key={user.user_id}>

                <td style={td}>
                  {user.user_name}
                </td>

                <td style={tdCenter}>
                  <b>{user.pontos}</b>
                </td>

                {jogos.map((j, i) => {
                  const pick = user.palpites[i];
                  const ok = pick === j.result;

                  return (
                    <td
                      key={i}
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        fontSize: 14,
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
