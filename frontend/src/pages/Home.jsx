import { useEffect, useState } from "react";
import { supabase } from "./admin/lib/supabase";
import { theme } from "../styles/theme";
import Header from "../components/Header";

export default function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [events, setEvents] = useState([]);

  const [workspaceId, setWorkspaceId] = useState("all");
  const [eventId, setEventId] = useState("");

  const [ownerName, setOwnerName] = useState("All");

  // =========================
  // LOAD WORKSPACES
  // =========================

  useEffect(() => {
    async function loadWorkspaces() {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, user_uuid");

      if (!error) {
        setWorkspaces([
          { id: "all", name: "All", user_uuid: null },
          ...(data || [])
        ]);
      }
    }

    loadWorkspaces();
  }, []);

  // =========================
  // LOAD EVENTS
  // =========================

  useEffect(() => {
    async function loadEvents() {
      if (workspaceId === "all") {
        const { data } = await supabase
          .from("events")
          .select("id, name, workspace_uuid");

        setEvents(data || []);
      } else {
        const { data } = await supabase
          .from("events")
          .select("id, name, workspace_uuid")
          .eq("workspace_uuid", workspaceId);

        setEvents(data || []);
      }
    }

    loadEvents();
    setEventId("");
  }, [workspaceId]);

  // =========================
  // OWNER (HEADER USER)
  // =========================

  useEffect(() => {
    localStorage.setItem("cg_user_name", ownerName);
  }, [ownerName]);

  useEffect(() => {
    async function loadOwner() {
      if (workspaceId === "all") {
        setOwnerName("All");
        return;
      }

      const workspace = workspaces.find(w => w.id === workspaceId);

      if (!workspace?.user_uuid) return;

      const { data } = await supabase
        .from("users")
        .select("user_name")
        .eq("id", workspace.user_uuid)
        .single();

      if (data) {
        setOwnerName(data.user_name);
      }
    }

    loadOwner();
  }, [workspaceId, workspaces]);

  return (
    <>
      {/* HEADER */}
      <Header />

      {/* BANNER */}
      <div
        style={{
          position: "fixed",
          top: "80px",
          left: 0,
          width: "100%",
          height: "clamp(120px, 18vw, 220px)",
          background: "#fff",
          zIndex: 50,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/assets/marketing/banners/Banner_patrocinado_Copa2026.png"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* CONTENT */}
      <main
        style={{
          paddingTop: "280px",
          paddingBottom: "80px",
        }}
        className="p-4 space-y-4"
      >
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h1
            className="text-2xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Descubra eventos e faça seus palpites
          </h1>
        </div>

        <div className="bg-gray-100 p-3 rounded text-sm">
          <strong>User:</strong> {ownerName}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <label>Workspace</label>

          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          >
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <label>Eventos</label>

          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          >
            <option value="">Selecione um evento</option>

            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </main>
    </>
  );
}
