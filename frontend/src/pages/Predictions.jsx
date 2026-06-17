import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  findUserByPhone,
  createUser
} from "../services/userService";

import { supabase } from "../pages/admin/lib/supabase";


export default function Predictions() {

  const navigate = useNavigate();


  const [engine, setEngine] = useState(null);
  const [rounds, setRounds] = useState([]);

  const [step, setStep] = useState("form");

  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [user, setUser] = useState(null);

  const [bets, setBets] = useState({});

  const [showModal, setShowModal] = useState(false);



  useEffect(() => {

    async function loadEngine(){

      try{

        const data = await fetch(
          "/data/bolao.json"
        ).then(r => r.json());


        setEngine(data);
        setRounds(data.rounds || []);


      }catch(err){

        console.error(
          "Erro carregando engine",
          err
        );

      }

    }


    loadEngine();

  }, []);





  function formatPhone(value){

    return value.replace(/\D/g,"");

  }






  async function validarUsuario(){


    if(!phone){

      setMsg(
        "Informe o telefone"
      );

      return;
    }


    try{


      const cleanPhone =
        formatPhone(phone);



      setMsg(
        "Validando usuário..."
      );



      let currentUser =
        await findUserByPhone(
          cleanPhone
        );



      if(!currentUser){


        const result =
          await createUser({

            fullName,
            userName,
            phone: cleanPhone,
            email

          });



        currentUser =
          result.user;



        /*
          Aqui futuramente:
          envio WhatsApp/SMS
          com senha provisória
        */


        console.log(
          "Senha provisória:",
          result.temporaryPassword
        );

      }



      setUser(currentUser);


      setMsg(
        "Usuário identificado"
      );


      setStep("bets");



    }catch(err){


      console.error(err);

      setMsg(
        "Erro ao validar usuário"
      );

    }

  }







  function escolher(index,value){

    setBets(prev=>({

      ...prev,
      [index]:value

    }));

  }






  function abrirConfirmacao(){

    setShowModal(true);

  }


  async function confirmarEnvio(){

    try{

      if(!user){
        throw new Error("Usuário não identificado");
      }


      if(!engine){
        throw new Error("Engine não carregada");
      }


      setMsg(
        "Salvando palpites..."
      );


      const inserts = rounds.map((r, i) => ({
        event_uuid: engine.event_uuid,   // ou event vindo do engine JSON
        user_uuid: user.id,
        round_index: i + 1,
        round_uuid: r.round_uuid,
        prediction: bets[i] || "-",
        status: "Em validação"
      }));

      const {error} =
        await supabase
          .from("predicts")
          .upsert(
            inserts,
            {
              onConflict:
              "event_uuid,user_uuid,round_index"
            }
          );


      if(error)
        throw error;



      setMsg(
        "✔ Palpites registrados"
      );


      setShowModal(false);


      setStep("form");



    }catch(err){

      console.error(
        "Erro salvar predicts",
        err
      );


      setMsg(
        "❌ Erro ao salvar palpites"
      );

    }

  }








  if(!engine){

    return (
      <div style={{padding:20}}>
        Carregando evento...
      </div>
    );

  }






  return (

    <div
      style={{
        background:"#f4f4f4",
        minHeight:"100vh",
        padding:12
      }}
    >



      {/* HEADER */}

      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          padding:10,
          background:"#C1121F",
          color:"#fff",
          borderRadius:8
        }}
      >

        <button
          onClick={()=>navigate(-1)}
        >
          ⬅
        </button>


        <strong>
          {engine.event_name}
        </strong>


        <button
          onClick={()=>navigate("/")}
        >
          🏠
        </button>


      </div>





      {/* IDENTIFICAÇÃO */}


      {step==="form" && (

        <div
          style={{
            marginTop:15,
            background:"#fff",
            padding:15,
            borderRadius:10
          }}
        >

          <h3>
            Participar do evento
          </h3>


          <p>
            Informe seus dados para participar.
          </p>



          <input
            placeholder="Nome completo"
            value={fullName}
            onChange={
              e=>setFullName(e.target.value)
            }
            style={inputStyle}
          />



          <input
            placeholder="Nome de usuário"
            value={userName}
            onChange={
              e=>setUserName(e.target.value)
            }
            style={inputStyle}
          />



          <input
            placeholder="Telefone"
            value={phone}
            onChange={
              e=>setPhone(e.target.value)
            }
            style={inputStyle}
          />



          <input
            placeholder="Email"
            value={email}
            onChange={
              e=>setEmail(e.target.value)
            }
            style={inputStyle}
          />



          <button
            style={btnStyle}
            onClick={validarUsuario}
          >
            Continuar
          </button>


          <p>
            {msg}
          </p>


        </div>

      )}







      {/* PALPITES */}



      {step==="bets" && (

        <div
          style={{
            marginTop:15,
            background:"#fff",
            padding:10,
            borderRadius:10
          }}
        >


          <h3>
            Seus palpites
          </h3>




          {rounds.map((r,i)=>(


            <div
              key={r.round_uuid}
              style={{
                display:"flex",
                justifyContent:"space-between",
                padding:8,
                borderBottom:
                "1px solid #eee"
              }}
            >


              <span
                style={{
                  fontSize:12
                }}
              >
                {r.round_name}
              </span>



              <div
                style={{
                  display:"flex",
                  gap:10
                }}
              >


                {["1","X","2"].map(v=>(


                  <label
                    key={v}
                    style={{
                      fontSize:12
                    }}
                  >


                    <input

                      type="radio"

                      name={`round-${i}`}

                      checked={
                        bets[i]===v
                      }

                      onChange={()=>
                        escolher(i,v)
                      }

                    />

                    {" "}

                    {v}


                  </label>


                ))}


              </div>



            </div>


          ))}





          <button

            style={btnStyle}

            onClick={abrirConfirmacao}

          >

            Revisar palpites

          </button>



        </div>


      )}









      {/* CONFIRMAÇÃO */}



      {showModal && (

        <div style={modalBg}>


          <div style={modalBox}>


            <h3>
              Confirmação final
            </h3>



            <div
              style={{
                fontSize:12,
                maxHeight:250,
                overflowY:"auto"
              }}
            >


              {rounds.map((r,i)=>(

                <div key={r.round_uuid}>

                  {r.round_name}

                  {" → "}

                  {bets[i] || "-"}


                </div>


              ))}


            </div>




            <button

              style={btnStyle}

              onClick={confirmarEnvio}

            >

              Confirmar

            </button>




            <button

              style={{
                marginTop:10
              }}

              onClick={()=>
                setShowModal(false)
              }

            >

              Cancelar

            </button>



          </div>


        </div>

      )}




      <p
        style={{
          textAlign:"center",
          fontSize:12
        }}
      >
        {msg}
      </p>



    </div>

  );


}






const inputStyle = {

  width:"100%",

  padding:10,

  marginBottom:10,

  borderRadius:8,

  border:"1px solid #ddd"

};





const btnStyle = {

  width:"100%",

  padding:12,

  background:"#C1121F",

  color:"#fff",

  border:"none",

  borderRadius:8,

  fontWeight:"bold",

  marginTop:10

};





const modalBg = {

  position:"fixed",

  top:0,

  left:0,

  right:0,

  bottom:0,

  background:
    "rgba(0,0,0,0.6)",

  display:"flex",

  justifyContent:"center",

  alignItems:"center"

};





const modalBox = {

  background:"#fff",

  padding:15,

  borderRadius:10,

  width:"90%"

};
