import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function MapaPalpites(){

  const [workspaces,setWorkspaces] = useState([]);
  const [events,setEvents] = useState([]);

  const [selectedWorkspace,setSelectedWorkspace] = useState("");
  const [selectedEventId,setSelectedEventId] = useState("");

  const [eventData,setEventData] = useState(null);

  const [columns,setColumns] = useState([]);
  const [dados,setDados] = useState([]);

  const [statusMap,setStatusMap] = useState({});

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");



  // =========================
  // WORKSPACES
  // =========================
  async function loadWorkspaces(){

    const {data,error} =
      await supabase
        .from("workspaces")
        .select("id,workspace_name")
        .order("workspace_name");

    if(error){
      console.error(error);
      setError(error.message);
      return;
    }

    setWorkspaces(data || []);
  }



  // =========================
  // EVENTS
  // =========================
  async function loadEvents(workspaceId){

    if(!workspaceId) return;

    const {data,error} =
      await supabase
        .from("events")
        .select("id,event_name,event_code,workspace_uuid")
        .eq("workspace_uuid",workspaceId)
        .order("event_name");

    if(error){
      console.error(error);
      setError(error.message);
      return;
    }

    setEvents(data || []);
  }



  // =========================
  // LOAD EVENT JSON + PREDICTS JSON
  // =========================
  async function loadEvent(eventCode,eventUuid){

    setLoading(true);
    setError("");

    try{

      const evRes = await fetch(`/data/${eventCode}.event.json`);
      const evJson = await evRes.json();

      const prRes = await fetch(`/data/${eventCode}.predicts.json`);
      const prJson = await prRes.json();

      setEventData(evJson);

      // =========================
      // COLUNAS (BRA vs MAR)
      // =========================
      const cols = (evJson.rounds || []).map(r => {

        const home = r.parts.find(p => p.sequence_part === 1);
        const away = r.parts.find(p => p.sequence_part === 2);

        return {
          index: r.round_index,
          home: home?.teams?.teams_code || "-",
          away: away?.teams?.teams_code || "-"
        };

      });

      setColumns(cols);

      // =========================
      // LINHAS (USUÁRIOS)
      // =========================
      const users = prJson.users || [];

      const rows = users.map(u => {

        const arr = Array(cols.length).fill("-");

        (u.predictions || []).forEach((p,i)=>{
          arr[i] = p;
        });

        return {
          user_uuid: u.user_uuid,
          user_name: u.user_name,
          predictions: arr
        };

      });

      setDados(rows);

      // =========================
      // STATUS (SUPABASE)
      // =========================
      const {data:statusData} =
        await supabase
          .from("predicts")
          .select("user_uuid,status")
          .eq("event_uuid",eventUuid);

      const map = Object.fromEntries(
        (statusData || []).map(s => [
          s.user_uuid,
          s.status
        ])
      );

      setStatusMap(map);

    }
    catch(err){
      console.error(err);
      setError("Erro ao carregar evento");
    }

    setLoading(false);
  }



  // =========================
  // UPDATE STATUS
  // =========================
  async function updateStatus(user_uuid,status){

    const {error} =
      await supabase
        .from("predicts")
        .update({status})
        .eq("event_uuid",eventData.event_uuid)
        .eq("user_uuid",user_uuid);

    if(error){
      console.error(error);
      setError(error.message);
      return;
    }

    setStatusMap(prev => ({
      ...prev,
      [user_uuid]: status
    }));

  }



  // =========================
  // EFFECTS
  // =========================
  useEffect(()=>{
    loadWorkspaces();
  },[]);

  useEffect(()=>{
    loadEvents(selectedWorkspace);
  },[selectedWorkspace]);

  useEffect(()=>{
    const ev = events.find(e => e.id === selectedEventId);

    if(ev){
      loadEvent(ev.event_code,ev.event_uuid);
    }
  },[selectedEventId]);



  // =========================
  // UI
  // =========================
  return (

    <div style={{padding:20}}>

      <h2>🔐 Mapa de Palpites</h2>



      {error && (
        <div style={{
          background:"#fee",
          color:"red",
          padding:10,
          marginBottom:10
        }}>
          {error}
        </div>
      )}




      {/* SELECTS */}
      <div style={{display:"flex",gap:20,marginBottom:20}}>

        <select
          value={selectedWorkspace}
          onChange={e=>{
            setSelectedWorkspace(e.target.value);
            setSelectedEventId("");
          }}
        >
          <option value="">Workspace</option>

          {workspaces.map(w=>(
            <option key={w.id} value={w.id}>
              {w.workspace_name}
            </option>
          ))}
        </select>




        <select
          value={selectedEventId}
          onChange={e=>setSelectedEventId(e.target.value)}
          disabled={!selectedWorkspace}
        >
          <option value="">Evento</option>

          {events.map(e=>(
            <option key={e.id} value={e.id}>
              {e.event_name}
            </option>
          ))}
        </select>

      </div>




      {/* HEADER EVENTO */}
      {eventData && (
        <div style={{marginBottom:20}}>

          <div style={{fontSize:20,fontWeight:"bold"}}>
            {eventData.event_name}
          </div>

          <div style={{fontSize:13,color:"#666"}}>
            Code: <b>{eventData.code}</b>
          </div>

          <div style={{fontSize:12,color:"#999"}}>
            id: {eventData.event_uuid}
          </div>

        </div>
      )}




      {loading && <p>Carregando...</p>}




      {/* TABLE */}
      {dados.length > 0 && (

        <div style={{overflowX:"auto"}}>

          <table style={{
            width:"100%",
            borderCollapse:"collapse"
          }}>

            <thead>

              <tr style={{
                background:"#0B3C49",
                color:"#fff"
              }}>

                <th>Usuário</th>
                <th>Status</th>

                {columns.map((c,i)=>(
                  <th key={i} style={{minWidth:90}}>
                    <div>{c.home}</div>
                    <div>vs</div>
                    <div>{c.away}</div>
                  </th>
                ))}

              </tr>

            </thead>




            <tbody>

              {dados.map(u=>(

                <tr key={u.user_uuid}>

                  <td style={{padding:10,border:"1px solid #ddd"}}>
                    {u.user_name}
                  </td>




                  <td style={{padding:10,border:"1px solid #ddd"}}>

                    <select
                      value={statusMap[u.user_uuid] || "Em validação"}
                      onChange={e=>updateStatus(u.user_uuid,e.target.value)}
                    >
                      <option>Em validação</option>
                      <option>Validado</option>
                      <option>Cancelado</option>
                    </select>

                  </td>




                  {u.predictions.map((p,i)=>(
                    <td
                      key={i}
                      style={{
                        padding:10,
                        border:"1px solid #ddd",
                        textAlign:"center"
                      }}
                    >
                      {p}
                    </td>
                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}
