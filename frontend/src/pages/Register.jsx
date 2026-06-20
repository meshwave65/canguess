import { useState } from "react";
import { AuthService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

export default function Register() {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    user_name:"",
    phone:"",
    email:"",
    password:""
  });

  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [loading,setLoading] = useState(false);


  function handleChange(e){
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  }


  async function handleSubmit(e){

    e.preventDefault();

    setError("");
    setSuccess("");

    if(!form.phone){
      return setError("Telefone obrigatório");
    }

    setLoading(true);

    const res = await AuthService.register(form);

    setLoading(false);


    if(!res.ok){
      return setError(res.error);
    }


    setSuccess("Conta criada com sucesso!");

    setTimeout(()=>{
      navigate("/login");
    },1200);

  }


return (

<div style={styles.page}>

  <div style={styles.card}>

    <div style={styles.ball}>
      ⚽
    </div>

    <h1 style={styles.title}>
      Criar conta
    </h1>

    <p style={styles.subtitle}>
      Faça parte da comunidade CanGuess
    </p>


<form onSubmit={handleSubmit}>


<input
style={styles.input}
name="name"
placeholder="Nome completo"
onChange={handleChange}
/>


<input
style={styles.input}
name="user_name"
placeholder="Username"
onChange={handleChange}
/>


<input
style={styles.input}
name="phone"
placeholder="Telefone *"
onChange={handleChange}
/>


<input
style={styles.input}
name="email"
placeholder="Email"
onChange={handleChange}
/>


<input
style={styles.input}
name="password"
type="password"
placeholder="Senha"
onChange={handleChange}
/>


<button
style={styles.primaryBtn}
disabled={loading}
>

{loading ? "CRIANDO..." : "CRIAR CONTA"}

</button>


</form>


<button
style={styles.secondaryBtn}
onClick={()=>navigate("/login")}
>
VOLTAR AO LOGIN
</button>



{error &&
<p style={styles.error}>{error}</p>
}


{success &&
<p style={styles.success}>{success}</p>
}


</div>

</div>

)

}



const styles={

page:{
minHeight:"100%",
display:"flex",
alignItems:"center",
justifyContent:"center",
padding:"20px",
background:theme.colors.background
},


card:{
width:"340px",
background:theme.colors.card,
borderRadius:theme.radius.card,
padding:theme.spacing.large,
boxShadow:theme.shadow.card,
textAlign:"center"
},


ball:{
fontSize:"44px"
},


title:{
margin:0,
color:theme.colors.primary
},


subtitle:{
fontSize:"12px",
color:theme.colors.muted,
marginBottom:"20px"
},


input:{
width:"100%",
boxSizing:"border-box",
padding:"12px",
marginBottom:"10px",
borderRadius:theme.radius.input,
border:`1px solid ${theme.colors.border}`,
fontSize:"14px"
},


primaryBtn:{
width:"100%",
padding:"12px",
background:theme.colors.accent,
color:"#fff",
border:"none",
borderRadius:theme.radius.button,
fontWeight:"bold",
cursor:"pointer"
},


secondaryBtn:{
width:"100%",
padding:"11px",
marginTop:"10px",
background:"transparent",
border:`1px solid ${theme.colors.primary}`,
color:theme.colors.primary,
borderRadius:theme.radius.button
},


error:{
color:theme.colors.danger
},


success:{
color:theme.colors.success
}

}
