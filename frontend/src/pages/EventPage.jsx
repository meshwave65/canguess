import { useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";

export default function EventPage() {
  const [senha, setSenha] = useState("");
  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [validado, setValidado] = useState(false);

  const [toast, setToast] = useState(null);

  function showToast(text, type = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  // =====================
  // VALIDAR EVENTO
  // =====================
  async function validarEvento() {
    const code = senha.trim();

    const { data: pass } = await supabase
      .from("event_passw")
      .select("*")
      .eq("code_event", code)
      .eq("status", 1)
      .maybeSingle();

    if (!pass) {
      showToast("Código inválido ou usado", "error");
      return;
    }

    await carregarEvento(pass.event_uuid);

    setValidado(true);
    showToast("Evento liberado ✔");
  }

  // =====================
  // CARREGAR EVENTO
  // =====================
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

  // =====================
  // SALVAR PALPITE
  // =====================
  async function salvarGuess(roundId, value) {
    const code = senha.trim();

    const { data: pass } = await supabase
      .from("event_passw")
      .select("event_uuid")
      .eq("code_event", code)
      .single();

    await supabase.from("guesses").insert([
      {
        user_uuid: "anonymous",
        event_round_id: roundId,
        event_guess: value,
        event_uuid: pass.event_uuid,
      },
    ]);

    showToast("✔ Palpite salvo com sucesso! Boa sorte 🍀");

    // 🔥 HOOK FUTURO NOTIFICAÇÃO
    await supabase.functions.invoke("notify-guess", {
      body: {
        event_round_id: roundId,
        guess: value,
      },
    });
  }

  // =====================
  // ROUNDS
  // =====================
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
          background: "#fff",
        }}
      >
        <strong>Round {r.round_order ?? index + 1}</strong>

        <input
          placeholder="Seu palpite"
          onBlur={(e) => salvarGuess(r.id, e.target.value)}
          style={{
            marginTop: 8,
            width: "100%",
            padding: 10,
          }}
        />
      </div>
    ));
  }

  return (
    <div style={{ padding: 16 }}>
      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 90,
            right: 20,
            background:
              toast.type === "error" ? "#dc2626" : "#16a34a",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            zIndex: 9999,
          }}
        >
          {toast.text}
        </div>
      )}

      {/* LOGIN EVENTO */}
      {!validado && (
        <div>
          <h3>Entrar no Evento</h3>

          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Código do evento"
            style={{ padding: 10, width: "70%" }}
          />

          <button
            onClick={validarEvento}
            style={{
              marginLeft: 10,
              padding: 10,
              background: "#FF6A00",
              color: "#fff",
              border: "none",
            }}
          >
            Entrar
          </button>
        </div>
      )}

      {/* EVENTO */}
      {validado && event && (
        <>
          <h2>{event.name}</h2>
          <p>{event.description}</p>

          <h3>Rounds</h3>
          {renderRounds()}
        </>
      )}
    </div>
  );
}
