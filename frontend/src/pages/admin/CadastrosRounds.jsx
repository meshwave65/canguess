import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function CadastroRounds() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [phases, setPhases] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadStructure(selectedEvent);
    }
  }, [selectedEvent]);

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents(data || []);
  }

  async function loadStructure(eventId) {
    const { data: phasesData } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("phase_number");

    const { data: roundsData } = await supabase
      .from("event_rounds")
      .select("*")
      .in(
        "event_phase_uuid",
        (phasesData || []).map((p) => p.id)
      )
      .order("round_number");

    setPhases(phasesData || []);
    setRounds(roundsData || []);
  }

  function show(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  // ==================== SALVAR ROUND ====================
  async function saveRound(round) {
    const { error } = await supabase
      .from("event_rounds")
      .update({
        round_date: round.round_date || null,
        time_round: round.time_round || null,
        local: round.local || null,
        event_parts_count: Number(round.event_parts_count || 2),
        result_round: round.result_round || null,
        round_number: round.round_number,
      })
      .eq("id", round.id);

    if (error) {
      console.error(error);
      show("Erro ao salvar: " + error.message);
      return;
    }

    show("✅ Round salvo com sucesso!");
    loadStructure(selectedEvent); // recarrega
  }

  // ==================== FUNÇÕES EXISTENTES ====================
  async function gerarRoundsAutomaticamente() {
    if (!selectedEvent) return;
    // ... (mantive sua função original)
    for (const phase of phases) {
      const existingRounds = rounds.filter(
        (r) => r.event_phase_uuid === phase.id
      );
      const missing = phase.num_rounds - existingRounds.length;
      if (missing <= 0) continue;

      const inserts = [];
      for (let i = 1; i <= missing; i++) {
        const roundNumber = existingRounds.length + i;
        inserts.push({
          event_phase_uuid: phase.id,
          round_number: roundNumber,
          event_uuid: selectedEvent,
        });
      }

      const { error } = await supabase.from("event_rounds").insert(inserts);
      if (error) {
        show(error.message);
        return;
      }
    }
    show("Rounds gerados com sucesso");
    loadStructure(selectedEvent);
  }

  async function criarRoundManual(phaseId) {
    const existing = rounds.filter((r) => r.event_phase_uuid === phaseId);
    const roundNumber = existing.length + 1;

    const { error } = await supabase.from("event_rounds").insert([
      {
        event_phase_uuid: phaseId,
        round_number: roundNumber,
        event_uuid: selectedEvent,
      },
    ]);

    if (error) return show(error.message);

    show("Round criado");
    loadStructure(selectedEvent);
  }

  const s = {
    page: { padding: 20, background: "#f5f6fa", minHeight: "100vh" },
    card: {
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    select: {
      padding: 10,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 16,
    },
    btn: {
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff",
    },
    phaseBox: {
      marginBottom: 20,
      padding: 15,
      border: "1px solid #ddd",
      borderRadius: 10,
      background: "#fff",
    },
    roundItem: {
      padding: 12,
      border: "1px solid #eee",
      borderRadius: 8,
      marginBottom: 12,
      background: "#fafafa",
    },
  };

  return (
    <div style={s.page}>
      <h2>Cadastro de Rounds - Placar</h2>

      {message && <div style={{ padding: 10, background: "#d4edda", color: "#155724", borderRadius: 6 }}>{message}</div>}

      {/* Seleção de Evento */}
      <div style={s.card}>
        <select
          style={s.select}
          onChange={(e) => setSelectedEvent(e.target.value)}
          value={selectedEvent || ""}
        >
          <option value="">Selecione um evento</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <button
          style={{ ...s.btn, marginLeft: 10, background: "#007bff", color: "white" }}
          onClick={gerarRoundsAutomaticamente}
          disabled={!selectedEvent}
        >
          ⚡ Gerar Rounds Automático
        </button>
      </div>

      {/* Fases e Rounds */}
      {phases.map((phase) => {
        const phaseRounds = rounds.filter((r) => r.event_phase_uuid === phase.id);

        return (
          <div key={phase.id} style={s.phaseBox}>
            <h4>
              Fase: {phase.phase_name || "Sem nome"} ({phase.num_rounds} rounds)
            </h4>

            <button
              style={{ ...s.btn, background: "#28a745", color: "white", marginBottom: 10 }}
              onClick={() => criarRoundManual(phase.id)}
            >
              + Adicionar Round
            </button>

            <div>
              {phaseRounds.map((r) => (
                <div key={r.id} style={s.roundItem}>
                  <strong>Round {r.round_number}</strong>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: 10 }}>
                    {/* Data */}
                    <div>
                      <label>Data:</label><br />
                      <input
                        type="date"
                        value={r.round_date || ""}
                        onChange={(e) =>
                          setRounds((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, round_date: e.target.value } : x
                            )
                          )
                        }
                      />
                    </div>

                    {/* Horário */}
                    <div>
                      <label>Horário:</label><br />
                      <input
                        type="time"
                        value={r.time_round || ""}
                        onChange={(e) =>
                          setRounds((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, time_round: e.target.value } : x
                            )
                          )
                        }
                      />
                    </div>

                    {/* Local */}
                    <div>
                      <label>Local:</label><br />
                      <input
                        type="text"
                        placeholder="Estádio..."
                        value={r.local || ""}
                        onChange={(e) =>
                          setRounds((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, local: e.target.value } : x
                            )
                          )
                        }
                      />
                    </div>

                    {/* Partes */}
                    <div>
                      <label>Partes:</label><br />
                      <input
                        type="number"
                        value={r.event_parts_count || 2}
                        onChange={(e) =>
                          setRounds((prev) =>
                            prev.map((x) =>
                              x.id === r.id
                                ? { ...x, event_parts_count: Number(e.target.value) }
                                : x
                            )
                          )
                        }
                        style={{ width: 80 }}
                      />
                    </div>

                    {/* PLACAR - CAMPO PRINCIPAL */}
                    <div>
                      <label><strong>Placar (ex: 3x1):</strong></label><br />
                      <input
                        type="text"
                        placeholder="3x1"
                        value={r.result_round || ""}
                        onChange={(e) =>
                          setRounds((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, result_round: e.target.value } : x
                            )
                          )
                        }
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          width: "130px",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => saveRound(r)}
                    style={{
                      marginTop: 12,
                      padding: "8px 16px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    💾 Salvar Round
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {!selectedEvent && <p>Selecione um evento para começar.</p>}
    </div>
  );
}
