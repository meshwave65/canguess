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
      .order("phase_number", { ascending: true });


    setPhases(
      (ph || []).map((p) => ({
        ...p,

        // snapshot do banco
        current_count: Number(p.num_rounds || 0),

        // campo editável
        new_rounds: Number(p.num_rounds || 0),
      }))
    );
  }


  function updatePhase(index, field, value) {

    const copy = [...phases];
    copy[index][field] = value;
    setPhases(copy);

  }



  async function savePhase(p) {

    const { error } = await supabase
      .from("event_phases")
      .update({
        phase_name: p.phase_name,
        phase_number: p.phase_number,
      })
      .eq("id", p.id);


    if (error) {
      console.error(error);
      alert("Erro ao salvar fase");
      return;
    }


    alert("Fase salva");
    load();

  }



  async function syncRounds(p) {


    const current_count = Number(p.current_count || 0);
    const new_rounds = Number(p.new_rounds || 0);


    console.log("CRIAR ROUNDS", {
      event_phase_uuid: p.id,
      current_count,
      new_rounds
    });



    if (new_rounds === current_count) {

      alert("Nada a fazer");
      loadRounds(p);

      return;
    }



    if (new_rounds < current_count) {

      alert(
        "Não é permitido reduzir rounds pela interface"
      );

      return;

    }



    const quantidadeCriar =
      new_rounds - current_count;



    for (let i = 0; i < quantidadeCriar; i++) {


      const { error } = await supabase
        .from("event_rounds")
        .insert({

          event_phase_uuid: p.id,

          // campos opcionais
          event_parts_count: 1

        });



      if (error) {

        console.error(
          "Erro criando round",
          error
        );

        alert(error.message);
        return;

      }

    }



    await supabase
      .from("event_phases")
      .update({
        num_rounds: new_rounds
      })
      .eq("id", p.id);



    alert(
      `${quantidadeCriar} round(s) criado(s)`
    );


    loadRounds(p);
    load();

  }



  async function loadRounds(p) {


    setSelectedPhase(p);



    const { data, error } = await supabase
      .from("event_rounds")
      .select("*")
      .eq("event_phase_uuid", p.id)
      .order("round_date", {
        ascending: true
      });


    if (error) {

      console.error(error);
      return;

    }


    setRounds(data || []);

  }



  async function saveRound(round) {


    const { error } = await supabase
      .from("event_rounds")
      .update({

        round_date: round.round_date,
        time_round: round.time_round,
        local: round.local,
        event_parts_count:
          Number(round.event_parts_count || 1)

      })
      .eq("id", round.id);



    if(error){

      console.error(error);
      alert(error.message);
      return;

    }


    alert("Round salvo");

  }



  async function deleteRound(id){


    const { error } = await supabase
      .from("event_rounds")
      .delete()
      .eq("id", id);



    if(error){

      console.error(error);
      alert(error.message);
      return;

    }


    setRounds(
      rounds.filter(
        r => r.id !== id
      )
    );

  }




  const s = {

    page:{
      padding:20
    },

    row:{
      display:"flex",
      gap:10,
      marginBottom:10,
      alignItems:"center"
    },

    input:{
      padding:8,
      border:"1px solid #ccc",
      borderRadius:6
    },

    btn:{
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



      {phases.map((p,i)=>(

        <div key={p.id}>


          <div style={s.row}>


            <span>
              Fase {i+1}
            </span>


            <input
              style={s.input}
              value={p.phase_name || ""}
              onChange={(e)=>
                updatePhase(
                  i,
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
              value={p.phase_number || ""}
              onChange={(e)=>
                updatePhase(
                  i,
                  "phase_number",
                  e.target.value
                )
              }
            />



            <input
              style={{
                ...s.input,
                width:80
              }}
              type="number"
              value={p.new_rounds}
              onChange={(e)=>
                updatePhase(
                  i,
                  "new_rounds",
                  e.target.value
                )
              }
            />



            <span>
              Banco:{p.current_count}
            </span>



            <button
              style={s.btn}
              onClick={()=>
                savePhase(p)
              }
            >
              💾
            </button>



            <button
              style={s.btn}
              onClick={()=>
                syncRounds(p)
              }
            >
              ⚽ Rounds
            </button>


          </div>



        </div>

      ))}



      <hr/>



      {selectedPhase && rounds.map((r,index)=>(

        <div
          key={r.id}
          style={s.row}
        >

          <span>
            Round {index+1}
          </span>


          <input
            style={s.input}
            type="date"
            value={r.round_date || ""}
            onChange={(e)=>
              setRounds(
                rounds.map(x =>
                  x.id===r.id
                  ?
                  {
                    ...x,
                    round_date:e.target.value
                  }
                  :
                  x
                )
              )
            }
          />


          <input
            style={s.input}
            type="time"
            value={r.time_round || ""}
            onChange={(e)=>
              setRounds(
                rounds.map(x =>
                  x.id===r.id
                  ?
                  {
                    ...x,
                    time_round:e.target.value
                  }
                  :
                  x
                )
              )
            }
          />


          <input
            style={s.input}
            placeholder="Local"
            value={r.local || ""}
            onChange={(e)=>
              setRounds(
                rounds.map(x =>
                  x.id===r.id
                  ?
                  {
                    ...x,
                    local:e.target.value
                  }
                  :
                  x
                )
              )
            }
          />


          <input
            style={s.input}
            type="number"
            value={r.event_parts_count || 1}
            onChange={(e)=>
              setRounds(
                rounds.map(x =>
                  x.id===r.id
                  ?
                  {
                    ...x,
                    event_parts_count:e.target.value
                  }
                  :
                  x
                )
              )
            }
          />



          <button
            style={s.btn}
            onClick={()=>
              saveRound(r)
            }
          >
            💾
          </button>



          <button
            style={s.btn}
            onClick={()=>
              deleteRound(r.id)
            }
          >
            🗑
          </button>



          <button style={s.btn}>
            🧩 Parts
          </button>


        </div>


      ))}


      <button
        style={s.btn}
        onClick={load}
      >
        🔄 Recarregar
      </button>



      <button
        style={s.btn}
        onClick={()=>
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
