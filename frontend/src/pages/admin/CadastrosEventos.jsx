import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosEventos() {
  const navigate = useNavigate();

  const [eventTypes, setEventTypes] = useState([]);
  const [events, setEvents] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [workspaceId, setWorkspaceId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [numPhases, setNumPhases] = useState(1);
  const [eventTypeUuid, setEventTypeUuid] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data: tipos } = await supabase
        .from("event_types")
        .select("*")
        .order("name");

      const { data: eventos } = await supabase
        .from("events")
        .select(`
          *,
          event_types(name)
        `)
        .order("created_at", { ascending: false });

      const { data: ws } = await supabase
        .from("workspaces")
        .select("id, workspace_name")
        .order("workspace_name");

      setEventTypes(tipos || []);
      setEvents((eventos || []).map((e) => ({
        ...e,
        original_num_phases: e.num_phases,
      })));
      setWorkspaces(ws || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }

  function show(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  const handleInlineChange = (id, field, value) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev))
    );
  };

  async function salvarEdicaoInline(event) {
    try {
      const currentCount = Number(event.original_num_phases);
      const newCount = Number(event.num_phases);

      if (newCount < currentCount) {
        alert("⚠️ Não é possível reduzir o número de fases.");
        return;
      }

      const { error: updateError } = await supabase
        .from("events")
        .update({
          name: event.name,
          event_type_uuid: event.event_type_uuid,
          data_inicio: event.data_inicio,
          data_fim: event.data_fim,
          num_phases: newCount,
          description: event.description,
        })
        .eq("id", event.id);

      if (updateError) throw updateError;

      if (newCount > currentCount) {
        const { error: phaseError } = await supabase.rpc("add_event_phases", {
          p_event_id: event.id,
          p_current_phases: currentCount,
          p_new_phases: newCount,
        });
        if (phaseError) throw phaseError;
      }

      show("Evento atualizado com sucesso");
      load();
    } catch (error) {
      console.error(error);
      show("Erro ao salvar alterações");
    }
  }

  async function salvarEvento() {
    if (!name.trim()) return show("Informe o nome do evento");
    if (!workspaceId) return show("Selecione um workspace");

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          name,
          description,
          data_inicio: dataInicio || null,
          data_fim: dataFim || null,
          num_phases: Number(numPhases),
          event_type_uuid: eventTypeUuid || null,
          workspace_uuid: workspaceId,
        },
      ])
      .select()
      .single();

    if (error) {
      show(error.message);
      return;
    }

    const { error: phaseError } = await supabase.rpc("create_default_phases", {
      p_event_id: data.id,
      p_num_phases: Number(numPhases),
    });

    if (phaseError) {
      show("Evento criado, mas erro ao gerar fases");
    } else {
      show("✅ Evento e fases criados com sucesso");
    }

    // Limpar formulário
    setName("");
    setDescription("");
    setDataInicio("");
    setDataFim("");
    setNumPhases(1);
    setEventTypeUuid("");
    setWorkspaceId("");
    load();
  }

  async function excluirEvento(id) {
    if (!window.confirm("Excluir este evento?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return show(error.message);
    show("Evento excluído");
    load();
  }

  const s = {
    page: { padding: 20, background: "#f5f6fa", minHeight: "100vh" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 10,
      borderBottom: "1px solid #e6e6e6",
    },
    titleBox: { display: "flex", flexDirection: "column" },
    title: { fontSize: 18, fontWeight: 600 },
    subtitle: { fontSize: 12, color: "#777" },
    navBtn: {
      fontSize: 18,
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid #ddd",
      background: "#fff",
      cursor: "pointer",
    },
    card: {
      background: "#fff",
      padding: 16,
      borderRadius: 10,
      marginBottom: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    row: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      marginBottom: 12,
      flexWrap: "wrap",
    },
    input: {
      padding: 10,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 14,
    },
    select: {
      padding: 10,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 14,
    },
    btn: {
      padding: "10px 14px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff",
    },
    btnSave: {
      padding: "10px 14px",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      background: "#28a745",
      color: "#fff",
      fontWeight: "bold",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.titleBox}>
          <div style={s.title}>Cadastro de Eventos</div>
          <div style={s.subtitle}>Eventos e competições</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.navBtn} onClick={() => navigate(-1)}>⬅️</button>
          <button style={s.navBtn} onClick={() => navigate("/")}>🏠</button>
        </div>
      </div>

      {message && (
        <div style={{ marginBottom: 16, padding: 12, background: "#e1f5fe", borderRadius: 8 }}>
          {message}
        </div>
      )}

      {/* NOVO EVENTO */}
      <div style={s.card}>
        <h3>Novo Evento</h3>
        <div style={s.row}>
          <select
            style={s.select}
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            <option value="">Selecione um Workspace</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.workspace_name}
              </option>
            ))}
          </select>

          <input
            style={{ ...s.input, flex: 2 }}
            placeholder="Nome do evento"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            style={s.select}
            value={eventTypeUuid}
            onChange={(e) => setEventTypeUuid(e.target.value)}
          >
            <option value="">Tipo do evento</option>
            {eventTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            style={{ ...s.input, width: 80 }}
            value={numPhases}
            onChange={(e) => setNumPhases(e.target.value)}
          />
        </div>

        <div style={s.row}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={s.row}>
          <span>Início:</span>
          <input type="date" style={s.input} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          <span>Fim:</span>
          <input type="date" style={s.input} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />

          <button style={{ ...s.btn, background: "#007bff", color: "#fff" }} onClick={salvarEvento}>
            💾 Salvar Evento
          </button>
        </div>
      </div>

      {/* LISTA DE EVENTOS */}
      <div style={s.card}>
        <h3>Eventos cadastrados</h3>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd" }}>
              <th align="left">Evento</th>
              <th align="left">Tipo</th>
              <th align="center">Fases</th>
              <th align="center">Datas</th>
              <th align="center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>
                  <input
                    style={{ ...s.input, width: "95%" }}
                    value={e.event_name || e.name || ""}
                    onChange={(ev) => handleInlineChange(e.id, "name", ev.target.value)}
                  />
                </td>
                <td>
                  <select
                    style={s.select}
                    value={e.event_type_uuid || ""}
                    onChange={(ev) => handleInlineChange(e.id, "event_type_uuid", ev.target.value)}
                  >
                    <option value="">Tipo...</option>
                    {eventTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td align="center">
                  <input
                    type="number"
                    style={{ ...s.input, width: 70 }}
                    value={e.num_phases || 0}
                    onChange={(ev) => handleInlineChange(e.id, "num_phases", ev.target.value)}
                  />
                </td>
                <td align="center">
                  <input type="date" style={s.input} value={e.data_inicio || ""} onChange={(ev) => handleInlineChange(e.id, "data_inicio", ev.target.value)} />
                  <input type="date" style={s.input} value={e.data_fim || ""} onChange={(ev) => handleInlineChange(e.id, "data_fim", ev.target.value)} />
                </td>
                <td align="center">
                  <button style={s.btnSave} onClick={() => salvarEdicaoInline(e)}>💾</button>
                  <button style={s.btn} onClick={() => navigate(`/admin/cadastros/eventos/${e.id}/estrutura`)}>Estrutura</button>
                  <button style={s.btn} onClick={() => excluirEvento(e.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
