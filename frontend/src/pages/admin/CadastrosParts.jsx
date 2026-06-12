import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastroParts() {
  const [searchParams] = useSearchParams();

  const roundId = searchParams.get("round");

  const [event, setEvent] = useState(null);
  const [phase, setPhase] = useState(null);
  const [round, setRound] = useState(null);

  const [parts, setParts] = useState([]);

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

    // PARTS
    const { data: partsData } = await supabase
      .from("event_parts")
      .select("*")
      .eq("round_uuid", roundId)
      .order("created_at", { ascending: true });

    let finalParts = partsData || [];

    // AUTO CREATE PARTS SE FALTANDO
    const expected = roundData.event_parts_count || 1;

    if (finalParts.length < expected) {
      const inserts = [];

      for (let i = finalParts.length + 1; i <= expected; i++) {
        inserts.push({
          round_uuid: roundId,
          team_uuid: null, // ⚠️ obrigatório no schema atual
          value: null
        });
      }

      const { error: insertError } = await supabase
        .from("event_parts")
        .insert(inserts);

      if (insertError) {
        console.error(insertError);
        return;
      }

      const { data: refreshed } = await supabase
        .from("event_parts")
        .select("*")
        .eq("round_uuid", roundId)
        .order("created_at", { ascending: true });

      finalParts = refreshed || [];
    }

    setParts(finalParts);
    setLoading(false);
  }

  function updatePart(id, value) {
    setParts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, value } : p
      )
    );
  }

  async function savePart(part) {
    const { error } = await supabase
      .from("event_parts")
      .update({
        value: part.value
      })
      .eq("id", part.id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar part");
      return;
    }
  }

  const s = {
    page: { padding: 20, background: "#f5f6fa", minHeight: "100vh" },
    card: {
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12
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
      minWidth: 200
    },
    btn: {
      padding: "6px 10px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff"
    }
  };

  if (loading) return <div style={s.page}>Carregando...</div>;

  return (
    <div style={s.page}>

      {/* HEADER CONTEXTUAL */}
      <div style={s.card}>
        <h2>{event?.name}</h2>
        <h3>{phase?.phase_name}</h3>
        <h4>{round?.round_name}</h4>
      </div>

      {/* LISTA DE PARTS */}
      <div style={s.card}>
        {parts.map((p) => (
          <div key={p.id} style={s.row}>

            <span>Part {p.id.slice(0, 4)}</span>

            <input
              style={s.input}
              value={p.value || ""}
              onChange={(e) =>
                updatePart(p.id, e.target.value)
              }
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
