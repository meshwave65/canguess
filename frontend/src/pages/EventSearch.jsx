import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function EventsSearch() {
  const [workspaces, setWorkspaces] = useState([]);
  const [events, setEvents] = useState([]);

  const [workspaceId, setWorkspaceId] = useState("");
  const [eventCode, setEventCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // =====================
  // LOAD WORKSPACES
  // =====================
  async function loadWorkspaces() {
    const { data } = await supabase
      .from("workspaces")
      .select("id, name")
      .order("name");

    setWorkspaces(data || []);
  }

  // =====================
  // LOAD EVENTS BY WORKSPACE
  // =====================
  async function loadEvents(workspaceId) {
    if (!workspaceId) {
      setEvents([]);
      return;
    }

    const { data } = await supabase
      .from("events")
      .select("id, name, event_code, workspace_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    setEvents(data || []);
  }

  // =====================
  // QUICK SEARCH BY CODE
  // =====================
  async function searchByCode() {
    setLoading(true);
    setMsg("");

    const code = eventCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("event_code", code)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      setMsg("❌ Evento não encontrado");
      return;
    }

    window.location.href = `/palpites?event=${data.id}`;
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    loadEvents(workspaceId);
  }, [workspaceId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>🔎 Buscar Eventos</h2>

      {/* ===================== */}
      {/* CARD UI PRINCIPAL */}
      {/* ===================== */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          maxWidth: 700,
        }}
      >
        {/* WORKSPACE SELECT */}
        <label style={{ fontWeight: "bold" }}>
          Workspace
        </label>

        <select
          value={workspaceId}
          onChange={(e) => setWorkspaceId(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 6,
            marginBottom: 16,
          }}
        >
          <option value="">Selecione um workspace</option>
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* EVENTS LIST */}
        <label style={{ fontWeight: "bold" }}>
          Eventos disponíveis
        </label>

        <div style={{ marginTop: 6, marginBottom: 16 }}>
          {events.length === 0 && (
            <div style={{ opacity: 0.6 }}>
              Nenhum evento encontrado
            </div>
          )}

          {events.map((e) => (
            <div
              key={e.id}
              style={{
                padding: 10,
                border: "1px solid #eee",
                borderRadius: 8,
                marginBottom: 8,
                cursor: "pointer",
              }}
              onClick={() =>
                (window.location.href = `/palpites?event=${e.id}`)
              }
            >
              <div style={{ fontWeight: "bold" }}>
                {e.name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                Código: {e.event_code}
              </div>
            </div>
          ))}
        </div>

        {/* QUICK CODE SEARCH */}
        <hr />

        <label style={{ fontWeight: "bold" }}>
          Código rápido do evento
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            value={eventCode}
            onChange={(e) =>
              setEventCode(e.target.value)
            }
            placeholder="Ex: ZEBCOP26"
            style={{
              flex: 1,
              padding: 10,
            }}
          />

          <button
            onClick={searchByCode}
            disabled={loading}
            style={{
              padding: "10px 14px",
              background: "#FF6A00",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Buscar"}
          </button>
        </div>

        {msg && (
          <p style={{ marginTop: 10, color: "red" }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
