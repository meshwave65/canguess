import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function EventDashboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);
  const [rounds, setRounds] = useState([]);

  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewLevel, setViewLevel] = useState("phases");

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    setEvent(eventData);

    const { data: phasesData } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("phase_number", { ascending: true });

    setPhases(phasesData || []);
  }

  const selectedPhase = phases.find(
    (p) => p.id === selectedPhaseId
  );

  function updatePhaseField(field, value) {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === selectedPhaseId
          ? { ...p, [field]: value }
          : p
      )
    );
  }

  async function savePhase() {
    if (!selectedPhase) return;

    const { error } = await supabase
      .from("event_phases")
      .update({
        phase_name: selectedPhase.phase_name,
        num_rounds: selectedPhase.num_rounds,
        phase_number: selectedPhase.phase_number,
      })
      .eq("id", selectedPhase.id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar fase");
      return;
    }

    alert("Fase salva");
  }

  async function loadRounds() {
    if (!selectedPhase) return;

    const { data, error } = await supabase
      .from("event_rounds")
      .select("*")
      .eq("event_phase_uuid", selectedPhase.id)
      .order("round_date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setRounds(data || []);
  }

  async function syncRounds() {
    if (!selectedPhase) return;

    const { count, error } = await supabase
      .from("event_rounds")
      .select("*", { count: "exact", head: true })
      .eq("event_phase_uuid", selectedPhase.id);

    if (error) {
      console.error(error);
      return;
    }

    const current_count = count || 0;
    const new_rounds = Number(selectedPhase.num_rounds || 0);

    if (new_rounds < current_count) {
      alert("Não é permitido reduzir rounds pela interface.");
      return;
    }

    if (new_rounds > current_count) {
      const total = new_rounds - current_count;

      for (let i = 0; i < total; i++) {
        const { error } = await supabase
          .from("event_rounds")
          .insert({
            event_phase_uuid: selectedPhase.id,
            event_parts_count: 1
          });

        if (error) {
          console.error(error);
          alert("Erro ao criar round");
          return;
        }
      }
    }

    await loadRounds();
    setViewLevel("rounds");
  }

  function updateRoundField(id, field, value) {
    setRounds((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: value }
          : r
      )
    );
  }

  async function saveRound(round) {
    const { error } = await supabase
      .from("event_rounds")
      .update({
        round_name: round.round_name,
        round_date: round.round_date,
        time_round: round.time_round,
        local: round.local,
        event_parts_count: Number(round.event_parts_count || 1)
      })
      .eq("id", round.id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar round");
      return;
    }

    alert("Round salvo");
  }

  async function deleteRound(round) {
    const { error } = await supabase
      .from("event_rounds")
      .delete()
      .eq("id", round.id);

    if (error) {
      console.error(error);
      alert("Erro ao excluir round");
      return;
    }

    loadRounds();
  }

  const s = {
    page: {
      padding: 20,
      background: "#f5f6fa",
      minHeight: "100vh"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 10,
      borderBottom: "1px solid #ddd"
    },
    title: { fontSize: 22, fontWeight: 700 },
    uuid: { fontSize: 11, color: "#888", fontFamily: "monospace" },
    card: {
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12
    },
    row: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center"
    },
    btn: {
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: 8,
      cursor: "pointer",
      background: "#fff"
    },
    input: {
      padding: 8,
      borderRadius: 8,
      border: "1px solid #ddd"
    },
    select: {
      padding: 8,
      borderRadius: 8,
      border: "1px solid #ddd",
      minWidth: 260
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.title}>
            {event?.name || "Carregando..."}
          </div>
          <div style={s.uuid}>{eventId}</div>
        </div>

        <button style={s.btn} onClick={() => navigate("/")}>
          🏠 Home
        </button>
      </div>

      <div style={s.card}>
        <h3>Estrutura do Evento</h3>

        <div style={s.row}>
          <select
            style={s.select}
            value={selectedPhaseId || ""}
            onChange={(e) => {
              setSelectedPhaseId(e.target.value);
              setViewLevel("phases");
            }}
          >
            <option value="">Selecione uma fase</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                Fase {p.phase_number} - {p.phase_name}
              </option>
            ))}
          </select>

          <input
            style={s.input}
            value={selectedPhase?.phase_name || ""}
            onChange={(e) =>
              updatePhaseField("phase_name", e.target.value)
            }
          />

          <input
            style={s.input}
            type="number"
            value={selectedPhase?.num_rounds || 0}
            onChange={(e) =>
              updatePhaseField("num_rounds", Number(e.target.value))
            }
          />

          <input
            style={s.input}
            type="number"
            value={selectedPhase?.phase_number || 0}
            onChange={(e) =>
              updatePhaseField("phase_number", Number(e.target.value))
            }
          />

          <button style={s.btn} onClick={savePhase}>💾</button>

          <button style={s.btn} onClick={syncRounds}>⚽ Rounds</button>
        </div>
      </div>

      {viewLevel === "rounds" && (
        <div style={s.card}>
          <h3>{selectedPhase?.phase_name}</h3>

          <button style={s.btn} onClick={() => setViewLevel("phases")}>
            ⬅ Voltar
          </button>

          <hr />

          {rounds.map((round, index) => (
            <div key={round.id} style={s.row}>
              <span>Round {index + 1}/{rounds.length}</span>

              <input
                style={s.input}
                placeholder="Nome do Round"
                value={round.round_name || ""}
                onChange={(e) =>
                  updateRoundField(round.id, "round_name", e.target.value)
                }
              />

              <input
                style={s.input}
                type="date"
                value={round.round_date || ""}
                onChange={(e) =>
                  updateRoundField(round.id, "round_date", e.target.value)
                }
              />

              <input
                style={s.input}
                type="time"
                value={round.time_round || ""}
                onChange={(e) =>
                  updateRoundField(round.id, "time_round", e.target.value)
                }
              />

              <input
                style={s.input}
                placeholder="Local"
                value={round.local || ""}
                onChange={(e) =>
                  updateRoundField(round.id, "local", e.target.value)
                }
              />

              <input
                style={s.input}
                type="number"
                min={1}
                value={round.event_parts_count || 1}
                onChange={(e) =>
                  updateRoundField(
                    round.id,
                    "event_parts_count",
                    Number(e.target.value)
                  )
                }
              />

              <button onClick={() => saveRound(round)} style={s.btn}>
                💾
              </button>

              <button onClick={() => deleteRound(round)} style={s.btn}>
                🗑
              </button>

              <button
                style={s.btn}
                onClick={() => {
                    setSelectedRound(round);
                    navigate(`/admin/cadastros/eventos/${eventId}/parts?round=${round.id}`);
                }}
              >
                🧩 Parts
              </button>

            </div>
          ))}
        </div>
      )}

      {viewLevel === "parts" && selectedRound && (
        <div style={s.card}>
          <h3>Parts do Round</h3>

          <button style={s.btn} onClick={() => setViewLevel("rounds")}>
            ⬅ Voltar Rounds
          </button>
        </div>
      )}
    </div>
  );
}
