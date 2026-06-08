import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosEventos() {
  const navigate = useNavigate();

  const [eventTypes, setEventTypes] = useState([]);
  const [events, setEvents] = useState([]);

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

    setEventTypes(tipos || []);
    setEvents(eventos || []);
  }

  function show(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function salvarEvento() {
    if (!name.trim()) {
      return show("Informe o nome do evento");
    }

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
        },
      ])
      .select()
      .single();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      show(error.message);
      return;
    }

    // ✅ CRIA FASES AUTOMATICAMENTE
    const { error: phaseError } = await supabase.rpc(
      "create_default_phases",
      {
        p_event_id: data.id,
        p_num_phases: Number(numPhases),
      }
    );

    if (phaseError) {
      console.log("PHASE ERROR:", phaseError);
      show("Evento criado, mas erro ao gerar fases");
    } else {
      show("Evento e fases criados com sucesso");
    }

    setName("");
    setDescription("");
    setDataInicio("");
    setDataFim("");
    setNumPhases(1);
    setEventTypeUuid("");

    load();
  }

  async function excluirEvento(id) {
    if (!window.confirm("Excluir evento?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      return show(error.message);
    }

    show("Evento excluído");
    load();
  }

  const s = {
    page: {
      padding: 20,
      background: "#f5f6fa",
      minHeight: "100vh",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 10,
      borderBottom: "1px solid #e6e6e6",
    },

    titleBox: {
      display: "flex",
      flexDirection: "column",
    },

    title: {
      fontSize: 18,
      fontWeight: 600,
    },

    subtitle: {
      fontSize: 12,
      color: "#777",
    },

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
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },

    row: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginBottom: 8,
      flexWrap: "wrap",
    },

    input: {
      padding: 8,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 13,
    },

    select: {
      padding: 8,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 13,
    },

    btn: {
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      background: "#fff",
      fontSize: 13,
    },

    statusOpen: {
      color: "green",
      fontWeight: "bold",
    },

    statusClosed: {
      color: "#d97706",
      fontWeight: "bold",
    },

    statusEnded: {
      color: "#dc2626",
      fontWeight: "bold",
    },
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.titleBox}>
          <div style={s.title}>Cadastro de Eventos</div>
          <div style={s.subtitle}>Eventos e competições</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.navBtn} onClick={() => navigate(-1)}>
            ⬅️
          </button>

          <button style={s.navBtn} onClick={() => navigate("/")}>
            🏠
          </button>
        </div>
      </div>

      {message && <div style={{ marginBottom: 12 }}>{message}</div>}

      {/* NOVO EVENTO */}
      <div style={s.card}>
        <h3>Novo Evento</h3>

        <div style={s.row}>
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
            style={{ ...s.input, width: 90 }}
            value={numPhases}
            onChange={(e) => setNumPhases(e.target.value)}
          />
        </div>

        <div style={s.row}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={s.row}>
          <span>Início:</span>

          <input
            type="date"
            style={s.input}
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <span>Fim:</span>

          <input
            type="date"
            style={s.input}
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />

          <button style={s.btn} onClick={salvarEvento}>
            💾 Salvar Evento
          </button>
        </div>
      </div>

      {/* EVENTOS */}
      <div style={s.card}>
        <h3>Eventos cadastrados</h3>

        <table width="100%" cellPadding="6">
          <thead>
            <tr>
              <th align="left">Evento</th>
              <th align="left">Tipo</th>
              <th align="center">Fases</th>
              <th align="center">Status</th>
              <th align="center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {events.map((e) => {
              let statusTexto = "Fechado";
              let statusStyle = s.statusClosed;

              if (e.encerrada) {
                statusTexto = "Encerrado";
                statusStyle = s.statusEnded;
              } else if (e.is_open) {
                statusTexto = "Aberto";
                statusStyle = s.statusOpen;
              }

              return (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    <br />
                    <small>{e.description}</small>
                  </td>

                  <td>{e.event_types?.name || "-"}</td>

                  <td align="center">{e.num_phases}</td>

                  <td align="center" style={statusStyle}>
                    {statusTexto}
                  </td>

                  <td align="center">
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        style={s.btn}
                        onClick={() =>
                          navigate(`/admin/cadastros/eventos/${e.id}/estrutura`)
                        }
                      >
                        Estrutura
                      </button>

                      <button
                        style={s.btn}
                        onClick={() =>
                          navigate(`/admin/cadastros/eventos/${e.id}/editar`)
                        }
                      >
                        Editar
                      </button>

                      <button style={s.btn} onClick={() => excluirEvento(e.id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
