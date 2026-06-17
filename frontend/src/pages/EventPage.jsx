import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";

export default function EventPage() {
  const [senha, setSenha] = useState("");
  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);
  const [rounds, setRounds] = useState([]);

  const [validado, setValidado] = useState(false);
  const [msg, setMsg] = useState("");

  const [guesses, setGuesses] = useState({});

  // =========================
  // VALIDAR CÓDIGO DO EVENTO
  // =========================
  async function validarEvento() {
    const code = senha.trim();

    const { data: pass, error } = await supabase
      .from("event_passw")
      .select("*")
      .eq("code_event", code)
      .eq("status", 1)
      .maybeSingle();

    if (error || !pass) {
      setMsg("Código inválido ou já usado");
      return;
    }

    await carregarEvento(pass.event_uuid);
    setValidado(true);
    setMsg("Evento liberado ✔");
  }

  // =========================
  // CARREGAR EVENTO COMPLETO
  // =========================
  async function carregarEvento(eventId) {
    const { data: ev } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    const { data: ph } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("phase_number");

    const { data: rd } = await supabase
      .from("rounds")
      .select("*")
      .eq("event_uuid", eventId)
      .order("round_date", { ascending: true });

    setEvent(ev);
    setPhases(ph || []);
    setRounds(rd || []);
  }

  // =========================
  // SALVAR PALPITE
  // =========================
  async function salvarGuess(roundId, value) {
    const code = senha.trim();

    const { data: pass } = await supabase
      .from("event_passw")
      .select("event_uuid")
      .eq("code_event", code)
      .single();

    await supabase.from("guesses").insert([
      {
        user_uuid: "anonymous", // depois liga ao auth real
        event_round_id: roundId,
        event_guess: value,
        event_uuid: pass.event_uuid,
      },
    ]);

    setMsg("Palpite salvo ✔");
  }

  // =========================
  // RENDER ROUNDS
  // =========================
  function renderRounds() {
    if (!rounds.length) return <p>Nenhum round encontrado</p>;

    return rounds.map((r, index) => (
      <div
        key={r.id}
        style={{
          padding: 12,
          marginBottom: 10,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <strong>Round {r.round_order ?? index + 1}</strong>
        </div>

        {/* Futebol */}
        {event?.event_type === "team_vs_team" && (
          <input
            placeholder="Palpite (ex: 1x0, M/E/V etc)"
            onBlur={(e) => salvarGuess(r.id, e.target.value)}
            style={{
              padding: 8,
              width: "100%",
              marginBottom: 6,
            }}
          />
        )}

        {/* Individual */}
        {event?.event_type === "individual" && (
          <input
            placeholder="Escolha do vencedor"
            onBlur={(e) => salvarGuess(r.id, e.target.value)}
            style={{
              padding: 8,
              width: "100%",
            }}
          />
        )}

        {/* Métrico */}
        {event?.event_type === "metric" && (
          <input
            type="number"
            placeholder="Valor estimado"
            onBlur={(e) => salvarGuess(r.id, e.target.value)}
            style={{
              padding: 8,
              width: "100%",
            }}
          />
        )}
      </div>
    ));
  }

  return (
    <div style={{ padding: 16 }}>
      {/* LOGIN EVENTO */}
      {!validado && (
        <div>
          <h3>Entrar no Evento</h3>

          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Código do evento"
            style={{
              padding: 8,
              width: "70%",
              marginRight: 8,
            }}
          />

          <button onClick={validarEvento}>Entrar</button>

          {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        </div>
      )}

      {/* EVENTO ATIVO */}
      {validado && event && (
        <>
          <h2>{event.name}</h2>
          <p>{event.description}</p>

          <hr />

          <h3>Rounds</h3>

          {renderRounds()}

          {msg && (
            <p style={{ marginTop: 10, color: "green" }}>
              {msg}
            </p>
          )}
        </>
      )}
    </div>
  );
}
