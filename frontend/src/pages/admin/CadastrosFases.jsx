import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosFases() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    const { data: ev } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    setEvent(ev);

    const { data: ph } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("id", { ascending: true });

    setPhases(ph || []);
  }

  function updatePhase(index, field, value) {
    const copy = [...phases];
    copy[index][field] = value;
    setPhases(copy);
  }

  async function save() {
    for (const p of phases) {
      if (!p.id) {
        await supabase.from("event_phases").insert({
          event_uuid: eventId,
          phase_name: p.phase_name || "",
          num_rounds: Number(p.num_rounds || 0),
        });
      } else {
        await supabase
          .from("event_phases")
          .update({
            phase_name: p.phase_name,
            num_rounds: Number(p.num_rounds),
          })
          .eq("id", p.id);
      }
    }

    load();
  }

  const s = {
    page: { padding: 20 },
    header: { marginBottom: 20 },
    row: { display: "flex", gap: 10, marginBottom: 10 },
    input: { padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    btn: { padding: 10, cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2>{event?.name}</h2>
        <small>{eventId}</small>
      </div>

      <h3>Fases do Evento</h3>

      {phases.map((p, i) => (
        <div key={i} style={s.row}>
          <span>Fase {i + 1}</span>

          <input
            style={s.input}
            placeholder="Nome da fase"
            value={p.phase_name || ""}
            onChange={(e) =>
              updatePhase(i, "phase_name", e.target.value)
            }
          />

          <input
            style={s.input}
            type="number"
            placeholder="Rounds"
            value={p.num_rounds || ""}
            onChange={(e) =>
              updatePhase(i, "num_rounds", e.target.value)
            }
          />
        </div>
      ))}

      <button
        style={s.btn}
        onClick={() =>
          setPhases([...phases, { phase_name: "", num_rounds: 0 }])
        }
      >
        + Adicionar fase
      </button>

      <hr />

      <button style={s.btn} onClick={save}>
        💾 Salvar
      </button>

      <button
        style={s.btn}
        onClick={() =>
          navigate(`/admin/cadastros/eventos/${eventId}/rounds`)
        }
      >
        ⚽ Ir para Rounds
      </button>
    </div>
  );
}
