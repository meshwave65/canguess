import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";


export default function CadastrosTimes(){

const navigate = useNavigate();


// =========================
// STATES
// =========================

const [countries,setCountries]=useState([]);
const [regions,setRegions]=useState([]);
const [cities,setCities]=useState([]);


const [filteredRegions,setFilteredRegions]=useState([]);
const [cityResults,setCityResults]=useState([]);


const [countryId,setCountryId]=useState("");
const [regionId,setRegionId]=useState("");
const [cityId,setCityId]=useState("");


const [citySearch,setCitySearch]=useState("");



const [countryCode,setCountryCode]=useState("");
const [countryName,setCountryName]=useState("");


const [regionCode,setRegionCode]=useState("");
const [regionName,setRegionName]=useState("");


const [cityName,setCityName]=useState("");



const [teamName,setTeamName]=useState("");
const [teamCode,setTeamCode]=useState("");
const [division,setDivision]=useState("");



const [message,setMessage]=useState("");




// =========================
// LOAD
// =========================

useEffect(()=>{
load();
},[]);



async function load(){

const {data:countriesData}=
await supabase
.from("countries")
.select("*");


const {data:regionsData}=
await supabase
.from("regions")
.select("*");


const {data:citiesData}=
await supabase
.from("cities")
.select("*");


setCountries(countriesData || []);
setRegions(regionsData || []);
setCities(citiesData || []);

setFilteredRegions(regionsData || []);

}



// =========================
// MESSAGE
// =========================

function show(msg){

setMessage(msg);

setTimeout(()=>{
setMessage("");
},2000);

}





// =========================
// COUNTRY CHANGE
// =========================

function handleCountryChange(id){

setCountryId(id);


// limpa dependências

setRegionId("");
setCityId("");
setCitySearch("");

}




// =========================
// REGION CHANGE
// =========================

function handleRegionChange(id){

setRegionId(id);


// limpa cidade

setCityId("");
setCitySearch("");

}




// =========================
// FILTER REGIONS
// =========================

useEffect(()=>{


let result=[...regions];


if(countryId){

result =
result.filter(
r=>r.country_uuid===countryId
);

}


setFilteredRegions(result);



},[
countryId,
regions
]);





// =========================
// CITY SEARCH
// =========================

useEffect(()=>{


let result=[...cities];



// filtro região

if(regionId){

result =
result.filter(
c=>c.region_uuid===regionId
);

}



// filtro texto

if(citySearch.trim()){

result =
result.filter(
c=>
c.name
.toLowerCase()
.includes(
citySearch.toLowerCase()
)
);

}



setCityResults(
result.slice(0,20)
);



},[
cities,
regionId,
citySearch
]);


 // =========================
 // ADD COUNTRY
 // =========================

 async function addCountry(){

   if(!countryName.trim()){
     return show("Informe o nome do país");
   }


   const {data,error}=

   await supabase
   .from("countries")
   .insert([
     {
       code:countryCode,
       country:countryName
     }
   ])
   .select();



   if(error){
     return show(error.message);
   }



   setCountries([
     ...countries,
     data[0]
   ]);


   // assume automaticamente o novo país

   setCountryId(data[0].id);


   setCountryCode("");
   setCountryName("");


   show("País salvo");

 }




 // =========================
 // ADD REGION
 // =========================

 async function addRegion(){


   if(!countryId){
     return show("Selecione o país");
   }


   if(!regionName.trim()){
     return show("Informe a região");
   }



   const {data,error}=

   await supabase
   .from("regions")
   .insert([
     {
       country_uuid:countryId,
       code:regionCode,
       region:regionName
     }
   ])
   .select();




   if(error){
     return show(error.message);
   }



   setRegions([
     ...regions,
     data[0]
   ]);


   // assume automaticamente a região criada

   setRegionId(data[0].id);



   setRegionCode("");
   setRegionName("");



   show("Região salva");


 }







 // =========================
 // ADD CITY
 // =========================

 async function addCity(){


   if(!regionId){
     return show("Selecione a região");
   }


   if(!cityName.trim()){
     return show("Informe a cidade");
   }



   const {data,error}=

   await supabase
   .from("cities")
   .insert([
     {
       region_uuid:regionId,
       name:cityName
     }
   ])
   .select();




   if(error){
     return show(error.message);
   }



   setCities([
     ...cities,
     data[0]
   ]);



   // nova cidade já fica selecionada

   setCityId(data[0].id);
   setCitySearch(data[0].name);



   setCityName("");



   show("Cidade salva");


 }








 // =========================
 // ADD TEAM
 // =========================

 async function addTeam(){



   if(!cityId){

     return show(
       "Selecione uma cidade válida"
     );

   }



   if(!teamName.trim()){

     return show(
       "Informe o nome do time"
     );

   }





   const {error}=

   await supabase
   .from("teams")
   .insert([
     {

       teams_name:teamName,

       teams_code:teamCode,

       division:division,

       city_uuid:cityId

     }
   ]);





   if(error){

     return show(error.message);

   }





   setTeamName("");
   setTeamCode("");
   setDivision("");



   show("Time salvo");


 }


const s = {

page:{
padding:20,
background:"#f5f6fa",
minHeight:"100vh"
},


header:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:15,
paddingBottom:10,
borderBottom:"1px solid #ddd"
},


title:{
fontSize:18,
fontWeight:600
},


subtitle:{
fontSize:12,
color:"#777"
},


card:{
background:"#fff",
padding:10,
borderRadius:10,
marginBottom:10
},


row:{
display:"flex",
gap:8,
alignItems:"center"
},


input:{
padding:7,
border:"1px solid #ddd",
borderRadius:6,
fontSize:13
},


select:{
padding:7,
border:"1px solid #ddd",
borderRadius:6,
fontSize:13
},


button:{
padding:"7px 12px",
borderRadius:6,
border:"1px solid #ddd",
background:"#fff",
cursor:"pointer"
}

};




return (

<div style={s.page}>


{/* HEADER */}

<div style={s.header}>


<div>

<div style={s.title}>
Cadastro de Regiões e Times
</div>


<div style={s.subtitle}>
Países, estados, cidades e clubes
</div>


</div>



<div>

<button
style={s.button}
onClick={()=>navigate(-1)}
>
⬅️
</button>


<button
style={s.button}
onClick={()=>navigate("/")}
>
🏠
</button>

</div>



</div>





{message &&

<div>
{message}
</div>

}







{/* =========================
PAÍS
========================= */}


<div style={s.card}>


<div style={s.row}>


<select

style={s.select}

value={countryId}

onChange={
e=>
handleCountryChange(
e.target.value
)
}

>

<option value="">
Selecione o país
</option>


{
countries.map(c=>(

<option
key={c.id}
value={c.id}
>

{c.country}

</option>

))
}


</select>



<input

style={s.input}

placeholder="Código"

value={countryCode}

onChange={
e=>setCountryCode(e.target.value)
}

/>



<input

style={{
...s.input,
flex:1
}}

placeholder="Novo país"

value={countryName}

onChange={
e=>setCountryName(e.target.value)
}

/>



<button
style={s.button}
onClick={addCountry}
>
💾
</button>


</div>


</div>







{/* =========================
REGIÃO
========================= */}



<div style={s.card}>


<div style={s.row}>


<select

style={s.select}

value={regionId}

onChange={
e=>
handleRegionChange(
e.target.value
)
}

>


<option value="">
Selecione a região
</option>



{
filteredRegions.map(r=>(

<option
key={r.id}
value={r.id}
>

{r.region}

</option>

))

}



</select>




<input

style={s.input}

placeholder="Código"

value={regionCode}

onChange={
e=>setRegionCode(e.target.value)
}

/>




<input

style={{
...s.input,
flex:1
}}

placeholder="Nova região"

value={regionName}

onChange={
e=>setRegionName(e.target.value)
}

/>



<button

style={s.button}

onClick={addRegion}

>
💾
</button>



</div>


</div>







{/* =========================
CIDADE
========================= */}



<div style={s.card}>


<div style={s.row}>


<div
style={{
position:"relative",
flex:1
}}
>


<input

style={{
...s.input,
width:"100%"
}}

placeholder="Buscar cidade"

value={citySearch}

onChange={
e=>{

setCitySearch(
e.target.value
);

setCityId("");

}

}

/>




{
cityResults.length>0 &&

<div

style={{

position:"absolute",
top:38,
left:0,
right:0,
background:"#fff",
border:"1px solid #ddd",
zIndex:20

}}

>


{
cityResults.map(c=>(

<div

key={c.id}

style={{
padding:8,
cursor:"pointer"
}}

onClick={()=>{

setCityId(c.id);

setCitySearch(c.name);

setCityResults([]);

}}

>


{c.name}

</div>

))

}


</div>

}



</div>






<input

style={{
...s.input,
flex:1
}}

placeholder="Nova cidade"

value={cityName}

onChange={
e=>setCityName(e.target.value)
}

/>



<button
style={s.button}
onClick={addCity}
>
💾
</button>


</div>


</div>







{/* =========================
TIME
========================= */}


<div style={s.card}>


<div style={s.row}>


<div>

{
cityId ?

<span>
🟢 {citySearch}
</span>

:

<span>
⚪ Cidade não selecionada
</span>

}

</div>



<input

style={{
...s.input,
flex:1
}}

placeholder="Nome do time"

value={teamName}

onChange={
e=>setTeamName(e.target.value)
}

/>



<input

style={{
...s.input,
width:80
}}

placeholder="Código"

value={teamCode}

onChange={
e=>setTeamCode(e.target.value)
}

/>



<input

style={{
...s.input,
width:80
}}

placeholder="Div"

value={division}

onChange={
e=>setDivision(e.target.value)
}

/>



<button

style={s.button}

onClick={addTeam}

>
💾
</button>



</div>


</div>





</div>

);


}
