import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function MapaPalpites() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const jogos = [
    { a: "BRA", b: "MAR", result: "1" },
    { a: "QAT", b: "SUI", result: "X" },
    { a: "GER", b: "JPN", result: "2" },
    { a: "ESP", b: "CPV", result: "1" },
    { a: "BEL", b: "EGY", result: "2" },
    { a: "URU", b: "KSA", result: "1" },
    { a: "CIV", b: "ECU", result: "X" },
    { a: "SWE", b: "TUN", result: "2" },
    { a: "AUS", b: "TUR", result: "1" },
    { a: "NED", b: "JPN", result: "X" },
    { a: "HAI", b: "SCO", result: "2" },
  ];

  const TOTAL = jogos.length;

  async function load() {
    const { data: bolao } = await supabase.from("bolao").select("*");

    const { data: users } = await supabase
      .from("users")
      .select("id, user_name");

    const userMap = Object.fromEntries(
      (users || []).map((u) => [u.id, u.user_name])
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

      grouped[item.user_id].palpites[item.game_index - 1] =
        item.prediction;

      if (item.prediction === jogos[item.game_index - 1]?.result) {
        grouped[item.user_id].pontos += 1;
      }
    });

    const arr = Object.values(grouped);

    setDados(arr);

    setStatusMap(
      Object.fromEntries(arr.map((u) => [u.user_id, u.status]))
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(user_id) {
    const status = statusMap[user_id];

    await supabase
      .from("bolao")
      .update({ status })
      .eq("user_id", user_id);

    load();
  }

  async function remove(user_id) {
    await supabase.from("bolao").delete().eq("user_id", user_id);
    load();
  }

  return (
    <div style={{ padding: 10 }}>
      <h3>📊 Evento</h3>
      <h4>Mapa de Palpites</h4>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
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
                  <div>{user.user_name}</div>

                  <select
                    value={statusMap[user.user_id]}
                    onChange={(e) =>
                      setStatusMap((prev) => ({
                        ...prev,
                        [user.user_id]: e.target.value,
                      }))
                    }
                    style={{ fontSize: 11 }}
                  >
                    <option>Em validação</option>
                    <option>Validado</option>
                    <option>Cancelado</option>
                  </select>
                </td>

                <td style={tdCenter}>{user.pontos}</td>

                {jogos.map((j, i) => {
                  const pick = user.palpites[i];
                  const ok = pick === j.result;

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

                <td style={tdCenter}>
                  <button onClick={() => updateStatus(user.user_id)}>💾</button>
                  <button onClick={() => remove(user.user_id)}>🗑️</button>
                </td>
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
  verticalAlign: "top",
};

const tdCenter = {
  border: "1px solid #ddd",
  padding: 6,
  textAlign: "center",
};
