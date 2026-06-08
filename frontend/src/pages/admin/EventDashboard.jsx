import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function EventDashboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewLevel, setViewLevel] = useState("phases"); // phases | rounds | parts

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    // EVENTO
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    setEvent(eventData);

    // FASES
    const { data: phasesData } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("phase_number", { ascending: true });

    setPhases(phasesData || []);
  }

  const selectedPhase = phases.find(p => p.id === selectedPhaseId);

  const s = {
    page: {
      padding: 20,
      background: "#f5f6fa",
      minHeight: "100vh",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 10,
      borderBottom: "1px solid #e6e6e6",
    },

    title: {
      fontSize: 22,
      fontWeight: 700,
    },

    uuid: {
      fontSize: 11,
      color: "#888",
      fontFamily: "monospace",
    },

    card: {
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },

    row: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
    },

    btn: {
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: 8,
      cursor: "pointer",
      background: "#fff",
    },

    select: {
      padding: 8,
      borderRadius: 8,
      border: "1px solid #ddd",
      minWidth: 260,
    },

    input: {
      padding: 8,
      borderRadius: 8,
      border: "1px solid #ddd",
      minWidth: 160,
    },
  };

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div>
          <div style={s.title}>{event?.name || "Carregando..."}</div>
          <div style={s.uuid}>{eventId}</div>
        </div>

        <button style={s.btn} onClick={() => navigate("/")}>
          🏠 Home
        </button>
      </div>

      {/* FASES */}
      <div style={s.card}>
        <h3>Estrutura do Evento</h3>

        <p>
          Fases carregadas: <b>{phases.length}</b>
        </p>

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

          <button
            style={{
              ...s.btn,
              opacity: !selectedPhaseId ? 0.4 : 1,
              pointerEvents: !selectedPhaseId ? "none" : "auto",
            }}
            onClick={() => setViewLevel("rounds")}
          >
            ⚽ Rounds
          </button>
        </div>
      </div>

      {/* ROUNDS */}
      {viewLevel === "rounds" && selectedPhase && (
        <div style={s.card}>
            <h3>{selectedPhase.phase_name}</h3>

            <button style={s.btn} onClick={() => setViewLevel("phases")}>
                ⬅ Voltar Fases
            </button>

            <hr />

            {Array.from({ length: selectedPhase.num_rounds || 0 }, (_, i) => i + 1).map((r) => (
                <div key={r} style={s.row}>

                    <span>
                        Round {r}/{selectedPhase.num_rounds} - {selectedPhase.phase_name}
                    </span>

                    <input style={s.input} placeholder="Nome do Round" />
                    <input style={s.input} placeholder="Data" />
                    <input style={s.input} placeholder="Hora" />
                    <input style={s.input} placeholder="Local" />

                    <button
                        style={s.btn}
                        onClick={() => {
                            setSelectedRound(r);
                            setViewLevel("parts");
                    }}
                >
                        🧩 Parts
                    </button>

                 </div>
              ))}
            </div>
        )}

      {/* PARTS */}
      {viewLevel === "parts" && selectedRound && (
        <div style={s.card}>
            <h3>
                Round {selectedRound}/{selectedPhase?.num_rounds} - {selectedPhase?.phase_name}
            </h3>

            <button style={s.btn} onClick={() => setViewLevel("rounds")}>
                ⬅ Voltar Rounds
            </button>

            <hr />

            {Array.from({ length: 2 }, (_, i) => i + 1).map((p) => (
                <div key={p} style={s.row}>

              <span>
                Part {p}/2
              </span>

              <select style={s.input}>
                <option>Brasil</option>
                <option>Marrocos</option>
                <option>França</option>
              </select>

              <button style={s.btn}>💾</button>

            </div>
            ))}
        </div>
        )}

    </div>
  );
}
