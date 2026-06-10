import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosFases() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    const { data: ev } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    setEvent(ev);

    const { data: ph } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("id", { ascending: true });

    setPhases(
      (ph || []).map((p) => {
        const current_num_rounds = Number(p.num_rounds || 0);

        return {
          ...p,
          // valor editável da UI, inicia com o que está no banco ou 1 se for novo
          newRounds: current_num_rounds === 0 ? 1 : current_num_rounds,
        };
      })
    );
  }

  function updatePhase(index, field, value) {
    const copy = [...phases];
    copy[index][field] = value;
    setPhases(copy);
  }

  async function save() {
    try {
      for (const p of phases) {
        const numRounds = Number(p.newRounds || 0);

        if (p.id) {
          // 1. Atualiza os dados da fase existente
          const { error: updateError } = await supabase
            .from("event_phases")
            .update({
              phase_name: p.phase_name,
              num_rounds: numRounds,
            })
            .eq("id", p.id);

          if (updateError) {
            console.error("Erro ao atualizar fase:", updateError);
            continue;
          }

          // 2. Chama a RPC para garantir que os rounds existam
          // A lógica de "criar apenas se faltar" agora está dentro do SQL
          await supabase.rpc("add_event_rounds", {
            p_phase_id: p.id,
            p_new_rounds: numRounds,
          });

        } else {
          // Inserção de nova fase (caso tenha clicado em "+ Adicionar fase")
          const { data: inserted, error: insertError } = await supabase
            .from("event_phases")
            .insert({
              event_uuid: eventId,
              phase_name: p.phase_name || "",
              num_rounds: numRounds,
            })
            .select()
            .single();

          if (insertError) {
            console.error("Erro ao inserir fase:", insertError);
            continue;
          }

          // Chama a RPC para a nova fase criada
          await supabase.rpc("add_event_rounds", {
            p_phase_id: inserted.id,
            p_new_rounds: numRounds,
          });
        }
      }

      alert("Dados salvos com sucesso!");
      load(); // Recarrega para sincronizar o estado
    } catch (err) {
      console.error("Erro geral no salvamento:", err);
      alert("Ocorreu um erro ao salvar as alterações.");
    }
  }

  const s = {
    page: { padding: 20 },
    header: { marginBottom: 20 },
    row: { display: "flex", gap: 10, marginBottom: 10 },
    input: { padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    btn: { padding: 10, cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2>{event?.name}</h2>
        <small>{eventId}</small>
      </div>

      <h3>Fases do Evento</h3>

      {phases.map((p, i) => (
        <div key={i} style={s.row}>
          <span>Fase {i + 1}</span>

          <input
            style={s.input}
            placeholder="Nome da fase"
            value={p.phase_name || ""}
            onChange={(e) =>
              updatePhase(i, "phase_name", e.target.value)
            }
          />

          <input
            style={s.input}
            type="number"
            placeholder="Rounds"
            value={p.newRounds || ""}
            onChange={(e) =>
              updatePhase(i, "newRounds", e.target.value)
            }
          />
        </div>
      ))}

      <button
        style={s.btn}
        onClick={() =>
          setPhases([
            ...phases,
            {
              phase_name: "",
              newRounds: 1,
            },
          ])
        }
      >
        + Adicionar fase
      </button>

      <hr />

      <button style={s.btn} onClick={save}>
        💾 Salvar
      </button>

      <button
        style={s.btn}
        onClick={() =>
          navigate(`/admin/cadastros/eventos/${eventId}/rounds`)
        }
      >
        ⚽ Ir para Rounds
      </button>
    </div>
  );
}
