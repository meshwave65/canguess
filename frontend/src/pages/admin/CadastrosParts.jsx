import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastroParts() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roundId = searchParams.get("round");

  const [event, setEvent] = useState(null);
  const [phase, setPhase] = useState(null);
  const [round, setRound] = useState(null);
  const [parts, setParts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roundId) return;
    load();
  }, [roundId]);

  async function load() {
    setLoading(true);

    // ROUND
    const { data: roundData, error: roundError } = await supabase
      .from("event_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError) {
      console.error(roundError);
      return;
    }

    setRound(roundData);

    // PHASE
    const { data: phaseData } = await supabase
      .from("event_phases")
      .select("*")
      .eq("id", roundData.event_phase_uuid)
      .single();

    setPhase(phaseData);

    // EVENT
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", phaseData.event_uuid)
      .single();

    setEvent(eventData);

    // TEAMS
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true });

    setTeams(teamsData || []);

    // PARTS
    const { data: partsData } = await supabase
      .from("event_parts")
      .select("*")
      .eq("round_uuid", roundId)
      .order("sequence_part", { ascending: true });

    let finalParts = partsData || [];

    const expected = roundData.event_parts_count || 1;

    if (finalParts.length < expected) {
      const inserts = [];

      for (let i = finalParts.length + 1; i <= expected; i++) {
        inserts.push({
          round_uuid: roundId,
          team_uuid: null,
          value: null,
          sequence_part: i
        });
      }

      await supabase
        .from("event_parts")
        .insert(inserts);

      const { data: refreshed } = await supabase
        .from("event_parts")
        .select("*")
        .eq("round_uuid", roundId)
        .order("sequence_part", { ascending: true });

      finalParts = refreshed || [];
    }

    setParts(finalParts);
    setLoading(false);
  }


  function updatePart(
    id,
    value,
    team_uuid,
    sequence_part
  ) {
    setParts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              value: value ?? p.value,
              team_uuid: team_uuid ?? p.team_uuid,
              sequence_part:
                sequence_part ?? p.sequence_part
            }
          : p
      )
    );
  }


  async function savePart(part) {
    const { error } = await supabase
      .from("event_parts")
      .update({
        value: part.value,
        team_uuid: part.team_uuid,
        sequence_part: part.sequence_part
      })
      .eq("id", part.id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar part");
    }
  }


  const s = {
    page: {
      padding: 20,
      background: "#f5f6fa",
      minHeight: "100vh"
    },

    card: {
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12
    },

    headerBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    },

    row: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 8
    },

    input: {
      padding: 8,
      border: "1px solid #ddd",
      borderRadius: 6,
      minWidth: 120
    },

    btn: {
      padding: "6px 10px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff"
    }
  };


  if (loading)
    return <div style={s.page}>Carregando...</div>;


  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.card}>

        <div style={s.headerBar}>

          <div>
            <h2>{event?.name}</h2>
            <h3>{phase?.phase_name}</h3>
            <h4>{round?.round_name}</h4>
          </div>


          <div style={{ display: "flex", gap: 8 }}>

            <button
              style={s.btn}
              onClick={() => navigate(-1)}
            >
              ← Voltar
            </button>


            <button
              style={s.btn}
              onClick={() => navigate("/")}
            >
              🏠 Home
            </button>

          </div>

        </div>

      </div>


      {/* PARTS */}
      <div style={s.card}>

        {parts.map((p, index) => (

          <div key={p.id} style={s.row}>


            <span>
              Part {index + 1}
            </span>


            {/* SEQUENCE PART */}

            <input
              style={{
                ...s.input,
                minWidth: 60
              }}
              type="number"
              value={p.sequence_part || ""}
              onChange={(e) =>
                updatePart(
                  p.id,
                  null,
                  null,
                  Number(e.target.value)
                )
              }
              placeholder="Seq"
            />


            {/* TEAM */}

            <select
              style={s.input}
              value={p.team_uuid || ""}
              onChange={(e) =>
                updatePart(
                  p.id,
                  null,
                  e.target.value,
                  null
                )
              }
            >

              <option value="">
                Selecionar team
              </option>


              {teams.map((t) => (

                <option
                  key={t.id}
                  value={t.id}
                >
                  {t.name} - {t.code}
                </option>

              ))}

            </select>


            {/* VALUE */}

            <input
              style={s.input}
              value={p.value || ""}
              onChange={(e) =>
                updatePart(
                  p.id,
                  e.target.value,
                  null,
                  null
                )
              }
              placeholder="value"
            />


            <button
              style={s.btn}
              onClick={() => savePart(p)}
            >
              💾
            </button>


          </div>

        ))}

      </div>


    </div>
  );
}
