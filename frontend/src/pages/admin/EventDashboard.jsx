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

  // Atualizar campos do Evento (status e is_open)
  async function updateEventField(field, value) {
    const { error } = await supabase
      .from("events")
      .update({ [field]: value })
      .eq("id", eventId);

    if (error) {
      console.error(error);
      alert("Erro ao atualizar evento");
      return;
    }
    alert(`${field} atualizado com sucesso!`);
    load();
  }

  const selectedPhase = phases.find((p) => p.id === selectedPhaseId);

  function updatePhaseField(field, value) {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === selectedPhaseId ? { ...p, [field]: value } : p
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
    if (error) return;
    setRounds(data || []);
  }

  async function syncRounds() {
    if (!selectedPhase) return;
    const { count, error } = await supabase
      .from("event_rounds")
      .select("*", { count: "exact", head: true })
      .eq("event_phase_uuid", selectedPhase.id);
    if (error) return;

    const current_count = count || 0;
    const new_rounds = Number(selectedPhase.num_rounds || 0);

    if (new_rounds > current_count) {
      const total = new_rounds - current_count;
      for (let i = 0; i < total; i++) {
        await supabase.from("event_rounds").insert({
          event_phase_uuid: selectedPhase.id,
          event_parts_count: 2,
        });
      }
    }
    await loadRounds();
    setViewLevel("rounds");
  }

  function updateRoundField(id, field, value) {
    setRounds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
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
        event_parts_count: Number(round.event_parts_count || 2),
        result_round: round.result_round || null,
      })
      .eq("id", round.id);

    if (error) {
      alert("Erro ao salvar round");
      return;
    }
    alert("✅ Round salvo!");
    loadRounds();
  }

  async function deleteRound(round) {
    await supabase.from("event_rounds").delete().eq("id", round.id);
    loadRounds();
  }

  const s = {
    page: { padding: 20, background: "#f5f6fa", minHeight: "100vh" },
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
      alignItems: "center",
      marginBottom: 10
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
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.title}>{event?.event_name || "Carregando..."}</div>
          <div style={s.uuid}>{eventId}</div>
        </div>
        <button style={s.btn} onClick={() => navigate("/")}>🏠 Home</button>
      </div>

      {/* ==================== CONTROLE GERAL DO EVENTO (TOPO) ==================== */}
      <div style={s.card}>
        <h3>Controle Geral do Evento</h3>
        <div style={s.row}>
          <div>
            <label><strong>Status do Evento:</strong></label><br />
            <select
              value={event?.status || "STRUCTURE"}
              onChange={(e) => updateEventField("status", e.target.value)}
              style={s.input}
            >
              <option value="STRUCTURE">STRUCTURE</option>
              <option value="OPEN">OPEN</option>
              <option value="PROGRESS">PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="CANCELED">CANCELED</option>
              <option value="TRANSFER">TRANSFER</option>
            </select>
          </div>

          <div>
            <label><strong>is_open (Libera palpites no Ranking):</strong></label><br />
            <select
              value={event?.is_open ? "true" : "false"}
              onChange={(e) => updateEventField("is_open", e.target.value === "true")}
              style={s.input}
            >
              <option value="false">false - Fechado</option>
              <option value="true">true - Aberto (Palpites visíveis)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estrutura do Evento */}
      <div style={s.card}>
        <h3>Estrutura do Evento</h3>
        <div style={s.row}>
          <select
            style={s.input}
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
            onChange={(e) => updatePhaseField("phase_name", e.target.value)}
            placeholder="Nome da fase"
          />
          <input
            style={s.input}
            type="number"
            value={selectedPhase?.num_rounds || 0}
            onChange={(e) => updatePhaseField("num_rounds", Number(e.target.value))}
            placeholder="Qtd Rounds"
          />
          <button style={s.btn} onClick={savePhase}>💾</button>
          <button style={s.btn} onClick={syncRounds}>⚽ Carregar Rounds</button>
        </div>
      </div>

      {/* Rounds */}
      {viewLevel === "rounds" && selectedPhase && (
        <div style={s.card}>
          <h3>Rounds - {selectedPhase.phase_name}</h3>
          <button style={s.btn} onClick={() => setViewLevel("phases")}>⬅ Voltar</button>
          <hr />

          {rounds.map((round, index) => (
            <div
              key={round.id}
              style={{
                ...s.row,
                borderBottom: "1px solid #eee",
                paddingBottom: 15,
                marginBottom: 15
              }}
            >
              <span><strong>Round {index + 1}</strong></span>

              <input
                style={s.input}
                placeholder="Nome do Round"
                value={round.round_name || ""}
                onChange={(e) => updateRoundField(round.id, "round_name", e.target.value)}
              />

              <input
                style={s.input}
                type="date"
                value={round.round_date || ""}
                onChange={(e) => updateRoundField(round.id, "round_date", e.target.value)}
              />

              <input
                style={s.input}
                type="time"
                value={round.time_round || ""}
                onChange={(e) => updateRoundField(round.id, "time_round", e.target.value)}
              />

              <input
                style={s.input}
                placeholder="Local"
                value={round.local || ""}
                onChange={(e) => updateRoundField(round.id, "local", e.target.value)}
              />

              <input
                style={s.input}
                type="number"
                min={1}
                value={round.event_parts_count || 2}
                onChange={(e) => updateRoundField(round.id, "event_parts_count", Number(e.target.value))}
              />

              <input
                style={{
                  ...s.input,
                  fontWeight: "bold",
                  width: 110,
                  textAlign: "center"
                }}
                placeholder="3x1"
                value={round.result_round || ""}
                onChange={(e) => updateRoundField(round.id, "result_round", e.target.value)}
              />

              <button onClick={() => saveRound(round)} style={s.btn}>💾</button>
              <button onClick={() => deleteRound(round)} style={s.btn}>🗑</button>
              <button style={s.btn} onClick={() =>
                    navigate(
                      `/admin/cadastros/parts?round=${round.id}`
                )  }
                >
                ⚽ Parts
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
