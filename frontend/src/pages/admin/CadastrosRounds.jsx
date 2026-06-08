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
      .order("id");

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

  async function gerarRoundsAutomaticamente() {
    if (!selectedEvent) return;

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

      const { error } = await supabase
        .from("event_rounds")
        .insert(inserts);

      if (error) {
        show(error.message);
        return;
      }
    }

    show("Rounds gerados com sucesso");
    loadStructure(selectedEvent);
  }

  async function criarRoundManual(phaseId) {
    const existing = rounds.filter(
      (r) => r.event_phase_uuid === phaseId
    );

    const roundNumber = existing.length + 1;

    const { error } = await supabase
      .from("event_rounds")
      .insert([
        {
          event_phase_uuid: phaseId,
          round_number: roundNumber,
          event_uuid: selectedEvent,
        },
      ]);

    if (error) {
      return show(error.message);
    }

    show("Round criado");
    loadStructure(selectedEvent);
  }

  const s = {
    page: { padding: 20, background: "#f5f6fa", minHeight: "100vh" },
    card: {
      background: "#fff",
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    select: {
      padding: 8,
      border: "1px solid #ddd",
      borderRadius: 6,
    },
    btn: {
      padding: "6px 10px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff",
      fontSize: 12,
    },
    phaseBox: {
      marginBottom: 12,
      padding: 10,
      border: "1px solid #eee",
      borderRadius: 8,
    },
    roundItem: {
      padding: 6,
      borderBottom: "1px solid #eee",
      fontSize: 13,
    },
  };

  return (
    <div style={s.page}>
      <h2>Cadastro de Rounds</h2>

      {message && <div>{message}</div>}

      {/* EVENT SELECT */}
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
          style={{ ...s.btn, marginLeft: 10 }}
          onClick={gerarRoundsAutomaticamente}
          disabled={!selectedEvent}
        >
          ⚡ Gerar Rounds Automático
        </button>
      </div>

      {/* STRUCTURE */}
      {phases.map((phase) => {
        const phaseRounds = rounds.filter(
          (r) => r.event_phase_uuid === phase.id
        );

        return (
          <div key={phase.id} style={s.phaseBox}>
            <h4>
              Fase: {phase.phase_name || "Sem nome"} (
              {phase.num_rounds} rounds esperados)
            </h4>

            <button
              style={s.btn}
              onClick={() => criarRoundManual(phase.id)}
            >
              + Adicionar Round
            </button>

            <div style={{ marginTop: 10 }}>
              {phaseRounds.map((r) => (
                <div key={r.id} style={s.roundItem}>
                  Round {r.round_number}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
