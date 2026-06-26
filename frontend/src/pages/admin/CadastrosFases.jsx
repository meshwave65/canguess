import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export default function CadastrosFases() {

  const { eventId } = useParams();
  const navigate = useNavigate();


  const [event, setEvent] = useState(null);
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [rounds, setRounds] = useState([]);



  useEffect(() => {
    load();
  }, [eventId]);



  async function load() {


    const { data: ev, error: evError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();


    if (evError) {
      console.error(evError);
      return;
    }


    setEvent(ev);



    const { data: ph, error: phError } = await supabase
      .from("event_phases")
      .select("*")
      .eq("event_uuid", eventId)
      .order("phase_number", {
        ascending: true
      });



    if (phError) {
      console.error(phError);
      return;
    }



    setPhases(
      (ph || []).map((p) => ({
        ...p,

        // quantidade atual existente no banco
        current_count: Number(
          p.num_rounds || 0
        ),

        // valor que o administrador pode alterar
        new_rounds: Number(
          p.num_rounds || 0
        )
      }))
    );

  }




  function updatePhase(index, field, value) {

    const copy = [...phases];

    copy[index][field] = value;

    setPhases(copy);

  }





  async function savePhase(phase) {


    const { error } = await supabase
      .from("event_phases")
      .update({

        phase_name:
          phase.phase_name,

        phase_number:
          Number(
            phase.phase_number || 1
          )

      })
      .eq("id", phase.id);



    if (error) {

      console.error(error);

      alert(
        "Erro ao salvar fase"
      );

      return;

    }


    alert(
      "Fase salva"
    );


    load();

  }






  async function syncRounds(phase) {


    const current =
      Number(
        phase.current_count || 0
      );


    const desired =
      Number(
        phase.new_rounds || 0
      );



    if (desired <= current) {

      alert(
        "Nenhum novo round para criar"
      );

      return;

    }




    const quantity =
      desired - current;



    for (
      let i = 0;
      i < quantity;
      i++
    ) {



      const { error } =
        await supabase
          .from("event_rounds")
          .insert({

            event_phase_uuid:
              phase.id,


            // padrão futebol
            // futuramente vem de event_types
            event_parts_count: 2

          });



      if (error) {

        console.error(error);

        alert(
          error.message
        );

        return;

      }

    }




    await supabase
      .from("event_phases")
      .update({

        num_rounds:
          desired

      })
      .eq(
        "id",
        phase.id
      );



    alert(
      `${quantity} round(s) criado(s)`
    );


    load();

  }






  async function loadRounds(phase) {


    setSelectedPhase(
      phase
    );



    const { data, error } =
      await supabase
        .from("event_rounds")
        .select("*")
        .eq(
          "event_phase_uuid",
          phase.id
        )
        .order(
          "round_date",
          {
            ascending:true
          }
        );



    if (error) {

      console.error(error);

      return;

    }



    setRounds(
      data || []
    );

  }


async function saveRound(round) {
  const { error } = await supabase
    .from("event_rounds")
    .update({
      round_date: round.round_date || null,
      time_round: round.time_round || null,
      local: round.local || null,
      event_parts_count: Number(round.event_parts_count || 2),
      result_round: round.result_round || null,
    })
    .eq("id", round.id);

  if (error) {
    console.error(error);
    alert("Erro ao salvar: " + error.message);
    return;
  }

  alert("Round salvo com sucesso!");
  // Recarrega para pegar possíveis triggers do banco
  loadRounds(selectedPhase);
}




  async function deleteRound(id) {


    const { error } =
      await supabase
        .from("event_rounds")
        .delete()
        .eq(
          "id",
          id
        );



    if (error) {

      console.error(error);

      alert(
        error.message
      );

      return;

    }



    setRounds(
      rounds.filter(
        (r) =>
          r.id !== id
      )
    );

  }






  const s = {


    page: {

      padding: 20

    },


    row: {

      display:"flex",

      gap:10,

      marginBottom:10,

      alignItems:"center",

      flexWrap:"wrap"

    },


    input: {

      padding:8,

      border:"1px solid #ccc",

      borderRadius:6

    },


    btn: {

      padding:10,

      cursor:"pointer"

    }

  };





  return (

    <div style={s.page}>


      <h2>
        {event?.name}
      </h2>



      <h3>
        Fases do Evento
      </h3>





      {phases.map(
        (p,index)=>(

        <div
          key={p.id}
        >


          <div
            style={s.row}
          >


            <span>
              Fase {index + 1}
            </span>



            <input

              style={s.input}

              placeholder="Nome da fase (ex: Grupos, Final)"

              value={
                p.phase_name || ""
              }

              onChange={
                (e)=>
                  updatePhase(
                    index,
                    "phase_name",
                    e.target.value
                  )
              }

            />



            <input

              style={{
                ...s.input,
                width:80
              }}

              placeholder="Nº fase"

              value={
                p.phase_number || ""
              }

              onChange={
                (e)=>
                  updatePhase(
                    index,
                    "phase_number",
                    e.target.value
                  )
              }

            />



            <input

              style={{
                ...s.input,
                width:90
              }}

              type="number"

              placeholder="Qtd rounds"

              value={
                p.new_rounds
              }

              onChange={
                (e)=>
                  updatePhase(
                    index,
                    "new_rounds",
                    e.target.value
                  )
              }

            />



            <span>
              Banco:
              {p.current_count}
            </span>




            <button

              style={s.btn}

              onClick={
                ()=>savePhase(p)
              }

            >
              💾
            </button>




            <button

              style={s.btn}

              onClick={
                ()=>syncRounds(p)
              }

            >
              ⚽ Criar Rounds
            </button>



            <button

              style={s.btn}

              onClick={
                ()=>loadRounds(p)
              }

            >
              👁 Ver Rounds
            </button>



          </div>


        </div>

      ))}




      <hr/>





{/* === ROUNDS DA FASE SELECIONADA === */}
{selectedPhase && (
  <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
    <h3>Rounds da fase: {selectedPhase.phase_name}</h3>

    {rounds.length === 0 ? (
      <p>Nenhum round encontrado.</p>
    ) : (
      rounds.map((r, index) => (
        <div
          key={r.id}
          style={{
            padding: "15px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9"
          }}
        >
          <strong>Round {index + 1}</strong>

          <div style={s.row}>
            <label>Data:</label>
            <input
              type="date"
              value={r.round_date || ""}
              onChange={(e) =>
                setRounds((prev) =>
                  prev.map((x) =>
                    x.id === r.id ? { ...x, round_date: e.target.value } : x
                  )
                )
              }
            />
          </div>

          <div style={s.row}>
            <label>Horário:</label>
            <input
              type="time"
              value={r.time_round || ""}
              onChange={(e) =>
                setRounds((prev) =>
                  prev.map((x) =>
                    x.id === r.id ? { ...x, time_round: e.target.value } : x
                  )
                )
              }
            />
          </div>

          <div style={s.row}>
            <label>Local:</label>
            <input
              type="text"
              value={r.local || ""}
              onChange={(e) =>
                setRounds((prev) =>
                  prev.map((x) =>
                    x.id === r.id ? { ...x, local: e.target.value } : x
                  )
                )
              }
              style={s.input}
            />
          </div>

          <div style={s.row}>
            <label>Partes (ex: 2 para futebol):</label>
            <input
              type="number"
              value={r.event_parts_count || 2}
              onChange={(e) =>
                setRounds((prev) =>
                  prev.map((x) =>
                    x.id === r.id
                      ? { ...x, event_parts_count: Number(e.target.value) }
                      : x
                  )
                )
              }
              style={s.input}
            />
          </div>

          {/* CAMPO DE PLACAR - O QUE VOCÊ QUERIA */}
          <div style={s.row}>
            <label><strong>Placar (ex: 3x1, 1x1, 2x3):</strong></label>
            <input
              type="text"
              placeholder="3x1"
              value={r.result_round || ""}
              onChange={(e) =>
                setRounds((prev) =>
                  prev.map((x) =>
                    x.id === r.id
                      ? { ...x, result_round: e.target.value }
                      : x
                  )
                )
              }
              style={{ ...s.input, width: "120px", fontWeight: "bold" }}
            />
          </div>

          <div style={s.row}>
            <button onClick={() => saveRound(r)} style={{ ...s.btn, backgroundColor: "#4CAF50", color: "white" }}>
              💾 Salvar Round
            </button>
            <button onClick={() => deleteRound(r.id)} style={{ ...s.btn, backgroundColor: "#f44336", color: "white" }}>
              🗑 Excluir
            </button>
          </div>
        </div>
      ))
    )}

    <button onClick={() => loadRounds(selectedPhase)} style={s.btn}>
      🔄 Recarregar Rounds
    </button>
  </div>
)}






      <button

        style={s.btn}

        onClick={
          load
        }

      >
        🔄 Recarregar
      </button>






      <button

        style={s.btn}

        onClick={
          ()=>
            navigate(
              `/admin/cadastros/eventos/${eventId}/rounds`
            )
        }

      >
        ⚽ Ir para Rounds
      </button>




    </div>

  );

}
