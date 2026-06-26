import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function MapaPalpites() {
  const [workspaces, setWorkspaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dados, setDados] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState("");

  // ==================== CARREGAR WORKSPACES ====================
  async function loadWorkspaces() {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, workspace_name")
      .order("workspace_name");

    if (error) {
      console.error("Erro workspaces:", error);
      setError("Erro ao carregar workspaces: " + error.message);
    } else {
      setWorkspaces(data || []);
      console.log("Workspaces carregados:", data);
    }
  }

  // ==================== CARREGAR EVENTOS OPEN ====================
  async function loadOpenEvents(workspaceId) {
    if (!workspaceId) return;
    setLoadingEvents(true);
    setError("");

    const { data, error } = await supabase
      .from("events")
      .select("id, event_name, status, is_open")
      .eq("workspace_uuid", workspaceId)
      .eq("status", "OPEN")
      .order("event_name");

    if (error) {
      console.error("Erro eventos:", error);
      setError("Erro ao carregar eventos");
    } else {
      setEvents(data || []);
    }
    setLoadingEvents(false);
  }

  // ==================== CARREGAR PALPITES + ROUNDS ====================
  async function loadPalpites(eventId) {
    if (!eventId) return;
    setLoading(true);

    try {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      setSelectedEvent(eventData);

      // Rounds
      const { data: roundsData } = await supabase
        .from("event_rounds")
        .select("*")
        .eq("event_uuid", eventId)
        .order("round_number", { ascending: true });

      setRounds(roundsData || []);

      // Palpites
      const { data: predicts } = await supabase
        .from("predicts")
        .select("*")
        .eq("event_uuid", eventId);

      const userIds = [...new Set(predicts?.map(p => p.user_id || p.user_uuid))];

      const { data: users } = await supabase
        .from("users")
        .select("id, user_name")
        .in("id", userIds);

      const userMap = Object.fromEntries((users || []).map(u => [u.id, u.user_name]));

      const grouped = {};
      (predicts || []).forEach((item) => {
        const userId = item.user_id || item.user_uuid;
        if (!grouped[userId]) {
          grouped[userId] = {
            user_id: userId,
            user_name: userMap[userId] || "Desconhecido",
            palpites: Array(roundsData?.length || 0).fill("-"),
            pontos: 0,
            status: item.status || "Em validação"
          };
        }

        const index = (item.round_index || 1) - 1;
        if (index >= 0 && index < grouped[userId].palpites.length) {
          grouped[userId].palpites[index] = item.prediction;
        }

        if (item.status === "Validado" && item.prediction === item.result) {
          grouped[userId].pontos += 1;
        }
        if (item.status) grouped[userId].status = item.status;
      });

      const arr = Object.values(grouped);
      setDados(arr);
      setStatusMap(Object.fromEntries(arr.map(u => [u.user_id, u.status])));
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar palpites");
    }
    setLoading(false);
  }

  async function updateStatus(user_id, status) {
    if (!selectedEventId) return;
    await supabase
      .from("predicts")
      .update({ status })
      .eq("event_uuid", selectedEventId)
      .eq("user_id", user_id);

    loadPalpites(selectedEventId);
  }

  useEffect(() => { loadWorkspaces(); }, []);
  useEffect(() => { if (selectedWorkspace) loadOpenEvents(selectedWorkspace); }, [selectedWorkspace]);
  useEffect(() => { if (selectedEventId) loadPalpites(selectedEventId); }, [selectedEventId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔐 Validação de Palpites</h2>

      {error && <p style={{ color: "red", background: "#fee", padding: 10 }}>{error}</p>}

      <div style={{ display: "flex", gap: 20, marginBottom: 25, flexWrap: "wrap" }}>
        <div>
          <label><strong>Workspace:</strong></label><br />
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            style={{ padding: 10, width: 300 }}
          >
            <option value="">Selecione um Workspace</option>
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>
                {w.workspace_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label><strong>Evento (Status = OPEN):</strong></label><br />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={!selectedWorkspace}
            style={{ padding: 10, width: 380 }}
          >
            <option value="">Selecione um evento OPEN</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.event_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Carregando palpites...</p>}

      {selectedEventId && dados.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={th}>USUÁRIO</th>
                <th style={th}>PTS</th>
                {rounds.map((_, i) => (
                  <th key={i} style={th}>Jogo {i+1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.map((user) => (
                <tr key={user.user_id}>
                  <td style={td}>
                    <strong>{user.user_name}</strong><br />
                    <select
                      value={statusMap[user.user_id] || "Em validação"}
                      onChange={(e) => updateStatus(user.user_id, e.target.value)}
                      style={{ padding: 6, marginTop: 4, minWidth: 140 }}
                    >
                      <option value="Em validação">Em validação</option>
                      <option value="Validado">Validado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td style={tdCenter}><b>{user.pontos}</b></td>
                  {user.palpites.map((pick, i) => (
                    <td key={i} style={tdCenter}>{pick || "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEventId && dados.length === 0 && <p>Nenhum palpite encontrado para este evento.</p>}
    </div>
  );
}

const th = { border: "1px solid #ddd", padding: 10, background: "#f3f4f6", textAlign: "center" };
const td = { border: "1px solid #ddd", padding: 10 };
const tdCenter = { border: "1px solid #ddd", padding: 10, textAlign: "center" };
