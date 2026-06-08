import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function CadastroParts() {
  const [events, setEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [phases, setPhases] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [parts, setParts] = useState([]);

  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedRound, setSelectedRound] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadPhases(selectedEvent);
      setSelectedPhase("");
      setSelectedRound("");
      setRounds([]);
      setParts([]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedPhase) {
      loadRounds(selectedPhase);
      setSelectedRound("");
      setParts([]);
    }
  }, [selectedPhase]);

  useEffect(() => {
    if (selectedRound) {
      loadParts(selectedRound);
    }
  }, [selectedRound]);

  function show(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    setEvents(data || []);
  }

  async function loadPhases(eventId) {
    const { data } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("id");

    setPhases(data || []);
  }

  async function loadRounds(phaseId) {
    const { data } = await supabase
      .from("event_rounds")
      .select("*")
      .eq("event_phase_uuid", phaseId)
      .order("round_number");

    setRounds(data || []);
  }

  async function loadParts(roundId) {
    const { data } = await supabase
      .from("event_parts")
      .select("*")
      .eq("round_uuid", roundId)
      .order("part_number");

    setParts(data || []);
  }

  async function gerarPartsAutomaticamente() {
    if (!selectedRound) return;

    const round = rounds.find((r) => r.id === selectedRound);

    if (!round) return;

    const existing = parts.length;
    const expected = round.event_parts_count || 1;

    if (existing >= expected) {
      return show("Parts já estão completos para este round");
    }

    const inserts = [];

    for (let i = existing + 1; i <= expected; i++) {
      inserts.push({
        round_uuid: selectedRound,
        part_number: i,
        value: null,
      });
    }

    const { error } = await supabase
      .from("event_parts")
      .insert(inserts);

    if (error) return show(error.message);

    show("Parts gerados com sucesso");
    loadParts(selectedRound);
  }

  async function criarPartManual() {
    if (!selectedRound) return;

    const round = rounds.find((r) => r.id === selectedRound);
    const nextNumber = parts.length + 1;

    if (round && nextNumber > round.event_parts_count) {
      return show("Limite de parts atingido para este round");
    }

    const { error } = await supabase
      .from("event_parts")
      .insert([
        {
          round_uuid: selectedRound,
          part_number: nextNumber,
          value: null,
        },
      ]);

    if (error) return show(error.message);

    show("Part criada");
    loadParts(selectedRound);
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
      marginRight: 8,
    },
    btn: {
      padding: "6px 10px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff",
      fontSize: 12,
      marginRight: 6,
    },
    row: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    box: {
      padding: 10,
      border: "1px solid #eee",
      borderRadius: 8,
      marginTop: 10,
    },
    partItem: {
      padding: 6,
      borderBottom: "1px solid #eee",
      fontSize: 13,
    },
  };

  return (
    <div style={s.page}>
      <h2>Cadastro de Parts</h2>

      {message && <div style={{ marginBottom: 10 }}>{message}</div>}

      {/* SELECTS */}
      <div style={s.card}>
        <div style={s.row}>
          <select
            style={s.select}
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Evento</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <select
            style={s.select}
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            disabled={!selectedEvent}
          >
            <option value="">Fase</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.phase_name || "Fase"}
              </option>
            ))}
          </select>

          <select
            style={s.select}
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            disabled={!selectedPhase}
          >
            <option value="">Round</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                Round {r.round_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button style={s.btn} onClick={gerarPartsAutomaticamente}>
            ⚡ Gerar Parts Automático
          </button>

          <button style={s.btn} onClick={criarPartManual}>
            ➕ Criar Part
          </button>
        </div>
      </div>

      {/* PARTS LIST */}
      {selectedRound && (
        <div style={s.card}>
          <h4>Parts do Round</h4>

          <div style={s.box}>
            {parts.map((p) => (
              <div key={p.id} style={s.partItem}>
                Part {p.part_number} → {p.value || "sem valor"}
              </div>
            ))}

            {parts.length === 0 && (
              <div>Nenhuma part criada ainda</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
