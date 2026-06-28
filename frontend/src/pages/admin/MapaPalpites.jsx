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



  // ============================
  // WORKSPACES
  // ============================

  async function loadWorkspaces(){

    const {data,error} =
      await supabase
      .from("workspaces")
      .select("id,workspace_name")
      .order("workspace_name");


    if(error){

      console.error(error);
      setError(error.message);

    }
    else{

      setWorkspaces(data || []);

    }

  }





  // ============================
  // EVENTOS OPEN
  // ============================

  async function loadOpenEvents(workspaceId){

    if(!workspaceId)
      return;


    setLoadingEvents(true);


    const {data,error}=

      await supabase
      .from("events")
      .select(
        "id,event_name,status,is_open"
      )
      .eq(
        "workspace_uuid",
        workspaceId
      )
      .eq(
        "status",
        "OPEN"
      )
      .order(
        "event_name"
      );



    if(error){

      console.error(error);
      setError(error.message);

    }
    else{

      setEvents(data || []);

    }


    setLoadingEvents(false);

  }






  // ============================
  // PALPITES
  // ============================

  async function loadPalpites(eventId){

    if(!eventId)
      return;


    setLoading(true);
    setError("");



    try{


      // EVENTO

      const {
        data:eventData,
        error:eventError
      }

      =
      await supabase
      .from("events")
      .select("*")
      .eq(
        "id",
        eventId
      )
      .single();



      if(eventError)
        throw eventError;


      setSelectedEvent(eventData);





      // ROUNDS

      const {
        data:roundsData,
        error:roundError
      }

      =
      await supabase
      .from("event_rounds")
      .select("*")
      .eq(
        "event_uuid",
        eventId
      )
      .order(
        "round_number",
        {
          ascending:true
        }
      );



      if(roundError)
        throw roundError;



      setRounds(roundsData || []);







      // PALPITES

      const {
        data:predicts,
        error:predictError
      }

      =
      await supabase
      .from("predicts")
      .select("*")
      .eq(
        "event_uuid",
        eventId
      );



      if(predictError)
        throw predictError;



      console.log(
        "PREDICTS:",
        predicts
      );





      // USUARIOS

      const userIds =
        [
          ...new Set(
            predicts.map(
              p=>p.user_uuid
            )
          )
        ];



      const {
        data:users
      }

      =
      await supabase
      .from("users")
      .select(
        "id,user_name"
      )
      .in(
        "id",
        userIds
      );



      const userMap =
        Object.fromEntries(

          (users || [])
          .map(
            u=>[
              u.id,
              u.user_name
            ]
          )

        );








      // AGRUPAR

      const grouped = {};



      (predicts || [])
      .forEach(item=>{


        const uid =
          item.user_uuid;



        if(!grouped[uid]){


          grouped[uid]={

            user_uuid:uid,


            user_name:
              userMap[uid] ||
              "Desconhecido",



            predictions:
              Array(
                roundsData.length
              )
              .fill("-"),



            status:
              item.status ||
              "Em validação"

          };


        }





        const index =
          Number(
            item.round_index
          )
          -1;



        if(
          index >=0 &&
          index < grouped[uid].predictions.length
        ){

          grouped[uid]
          .predictions[index] =
            item.prediction;

        }



        if(item.status){

          grouped[uid]
          .status =
            item.status;

        }


      });





      const arr =
        Object.values(grouped);



      console.log(
        "MAPA:",
        arr
      );



      setDados(arr);



      setStatusMap(

        Object.fromEntries(

          arr.map(
            u=>[
              u.user_uuid,
              u.status
            ]
          )

        )

      );



    }

    catch(err){

      console.error(
        err
      );

      setError(
        "Erro ao carregar palpites"
      );

    }


    setLoading(false);

  }







  // ============================
  // STATUS
  // ============================

  async function updateStatus(
    user_uuid,
    status
  ){

    await supabase
    .from("predicts")
    .update({
      status
    })
    .eq(
      "event_uuid",
      selectedEventId
    )
    .eq(
      "user_uuid",
      user_uuid
    );



    loadPalpites(
      selectedEventId
    );

  }







  useEffect(()=>{

    loadWorkspaces();

  },[]);





  useEffect(()=>{

    if(selectedWorkspace)
      loadOpenEvents(
        selectedWorkspace
      );

  },[
    selectedWorkspace
  ]);





  useEffect(()=>{

    if(selectedEventId)
      loadPalpites(
        selectedEventId
      );

  },[
    selectedEventId
  ]);









  return (

<div style={{padding:20}}>


<h2>
🔐 Validação de Palpites
</h2>



{
error &&
<p style={{
color:"red",
background:"#fee",
padding:10
}}>
{error}
</p>
}





<div style={{
display:"flex",
gap:20,
marginBottom:25
}}>


<div>

<label>
<strong>
Workspace
</strong>
</label>


<br/>


<select

value={selectedWorkspace}

onChange={
e=>{

setSelectedWorkspace(
e.target.value
);

setSelectedEventId("");

}

}

style={{
padding:10,
width:300
}}

>


<option value="">
Selecione
</option>


{
workspaces.map(w=>(

<option
key={w.id}
value={w.id}
>

{w.workspace_name}

</option>

))
}


</select>


</div>






<div>


<label>
<strong>
Evento OPEN
</strong>
</label>

<br/>


<select

value={selectedEventId}

disabled={!selectedWorkspace}

onChange={
e=>
setSelectedEventId(
e.target.value
)
}

style={{
padding:10,
width:380
}}

>


<option value="">
Selecione
</option>


{
events.map(e=>(

<option
key={e.id}
value={e.id}
>

{e.event_name}

</option>

))
}


</select>


</div>



</div>








{
loading &&
<p>
Carregando...
</p>
}






{
selectedEventId &&
dados.length>0 &&

<div style={{
overflowX:"auto"
}}>



<table style={table}>


<thead>


<tr style={head}>


<th>
USUÁRIO
</th>


{
rounds.map(
(r,i)=>(

<th key={i}>
Jogo {i+1}
</th>

)
)
}


</tr>


</thead>





<tbody>


{

dados.map(user=>(


<tr key={user.user_uuid}>


<td style={cell}>


<strong>
{user.user_name}
</strong>


<br/>


<select

value={
statusMap[user.user_uuid]
}

onChange={
e=>
updateStatus(
user.user_uuid,
e.target.value
)
}

>


<option>
Em validação
</option>

<option>
Validado
</option>

<option>
Cancelado
</option>


</select>


</td>






{

user.predictions.map(
(pick,i)=>(

<td
key={i}
style={cellCenter}
>


<span style={{
fontWeight:"bold",
padding:"5px 12px",
background:"#f1f5f9",
borderRadius:6
}}>

{pick}

</span>


</td>

)
)

}



</tr>


))

}


</tbody>


</table>


</div>

}



</div>

  );

}






const table={
width:"100%",
borderCollapse:"collapse"
};


const head={
background:"#0B3C49",
color:"#fff"
};


const cell={
padding:10,
border:"1px solid #ddd"
};


const cellCenter={
...cell,
textAlign:"center"
};
