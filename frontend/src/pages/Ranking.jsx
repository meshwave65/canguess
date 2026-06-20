import { useEffect, useState } from "react";

export default function Ranking() {

  const [event, setEvent] = useState(null);
  const [predicts, setPredicts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const code = new URLSearchParams(window.location.search).get("code");


  useEffect(() => {

    async function load() {

      try {

        const eventRes = await fetch(
          `/data/${code}.event.json?ts=${Date.now()}`
        );

        if (!eventRes.ok)
          throw new Error("event.json não encontrado");


        const eventData = await eventRes.json();

        setEvent(eventData);



        const predRes = await fetch(
          `/data/${code}.predicts.json?ts=${Date.now()}`
        );

        if (!predRes.ok)
          throw new Error("predicts.json não encontrado");


        const predData = await predRes.json();

        setPredicts(predData);


      } catch(err){

        console.error(err);
        setError(err.message);

      } finally {

        setLoading(false);

      }

    }


    if(code)
      load();


  },[code]);



  if(loading)
    return <div style={box}>Carregando Ranking...</div>;


  if(error)
    return <div style={{...box,color:"red"}}>{error}</div>;


  if(!event || !predicts)
    return <div style={box}>Sem dados</div>;



  /*
    Mantém ordem oficial da competição
  */

  const rounds = [...(event.rounds || [])]
    .sort(
      (a,b)=>
        Number(a.round_order || 0) -
        Number(b.round_order || 0)
    );



  /*
     NÃO ordenar aqui.
     Engine já entrega a classificação correta.
  */

  const ranking = predicts.users || [];



  return (

    <div style={{
      padding:20,
      maxWidth:1400,
      margin:"0 auto"
    }}>


      {/* CABEÇALHO */}

      <h1 style={{
        textAlign:"center",
        color:"#0B3C49",
        marginBottom:5
      }}>
        {event.event_name || "Evento"}
      </h1>


      <h3 style={{
        textAlign:"center",
        margin:0,
        color:"#555"
      }}>
        Workspace {event.workspace_name || "-"}
      </h3>


      <div style={{
        textAlign:"center",
        marginTop:8,
        marginBottom:25,
        color:"#777"
      }}>
        Event Code: {event.code}
      </div>




      {/* =======================
            JOGOS
      ======================== */}

      <h3>Jogos da Rodada</h3>


      <table style={table}>

        <thead>

          <tr style={head}>

            <th>Jogo</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Local</th>
            <th>Placar</th>
            <th>Resultado</th>

          </tr>

        </thead>


        <tbody>

        {
          rounds.map((r,i)=>(

            <tr key={i}>

              <td style={cell}>
                {r.round_name}
              </td>

              <td style={cellCenter}>
                {r.round_date || "-"}
              </td>

              <td style={cellCenter}>
                {r.time_round || "-"}
              </td>


              <td style={cell}>
                {r.local || "-"}
              </td>


              <td style={cellCenter}>
                {r.score || "-"}
              </td>


              <td style={cellCenter}>
                <b>{r.result || "-"}</b>
              </td>

            </tr>

          ))
        }

        </tbody>

      </table>





      {/* =======================
            RANKING
      ======================== */}


      <h3 style={{marginTop:35}}>
        Ranking
      </h3>



      <div style={{overflowX:"auto"}}>

      <table style={table}>


        <thead>


          <tr style={head}>


            <th>
              Pos
            </th>


            <th>
              Participante
            </th>


            <th>
              Pontos
            </th>



            {
              rounds.map((r,i)=>{


                const parts = r.parts || [];


                const team1 =
                  parts[0]?.teams?.teams_code ||
                  parts[0]?.teams_code ||
                  "-";


                const team2 =
                  parts[1]?.teams?.teams_code ||
                  parts[1]?.teams_code ||
                  "-";


                return (

                  <th key={i}>

                    <div>
                      {team1}
                    </div>

                    <div style={{
                      fontSize:11
                    }}>
                      vs
                    </div>

                    <div>
                      {team2}
                    </div>

                    <div style={{
                      marginTop:4,
                      fontSize:11
                    }}>
                      {r.score || "-"}
                    </div>


                  </th>

                )

              })
            }


          </tr>

        </thead>



        <tbody>


        {

        ranking.map((user,idx)=>(


          <tr key={user.user_uuid}>


            <td style={cellCenter}>
              {user.position || idx+1}
            </td>


            <td style={{
              ...cell,
              fontWeight:600
            }}>
              {user.user_name}
            </td>



            <td style={{
              ...cellCenter,
              fontSize:18,
              fontWeight:"bold",
              color:"#f97316"
            }}>
              {user.points}
            </td>




            {
              rounds.map((r,i)=>{


                const pick =
                  user.predictions?.[i];


                const ok =
                  pick &&
                  pick === r.result;



                return (

                  <td key={i}
                    style={cellCenter}
                  >

                    <span style={{
                      padding:"4px 10px",
                      borderRadius:6,
                      background:
                        ok
                        ? "#dcfce7"
                        : "#f1f5f9",
                      fontWeight:700
                    }}>

                      {pick || "-"}

                      {
                        ok &&
                        <span style={{
                          marginLeft:5
                        }}>
                          ⚽
                        </span>
                      }

                    </span>


                  </td>

                )


              })
            }



          </tr>


        ))

        }


        </tbody>


      </table>


      </div>


    </div>

  );

}




const box={
  padding:40,
  textAlign:"center",
  fontSize:18
};


const table={
  width:"100%",
  borderCollapse:"collapse",
  marginTop:10
};


const head={
  background:"#0B3C49",
  color:"white"
};


const cell={
  padding:8,
  borderBottom:"1px solid #eee"
};


const cellCenter={
  ...cell,
  textAlign:"center"
};
