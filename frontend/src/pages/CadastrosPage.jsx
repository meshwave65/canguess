import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import { useNavigate } from "react-router-dom"
export default function CadastrosPage() {
  const [tab, setTab] = useState("paises")

  return (
    <div style={{ padding: 20 }}>
      <h2>Cadastros Gerais</h2>

      <nav style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setTab("paises")}>Países</button>
        <button onClick={() => setTab("regioes")}>Regiões</button>
        <button onClick={() => setTab("cidades")}>Cidades</button>
        <button onClick={() => setTab("times")}>Times</button>
      </nav>

      {tab === "paises" && <Paises />}
      {tab === "regioes" && <Regioes />}
      {tab === "cidades" && <Cidades />}
      {tab === "times" && <Times />}
    </div>
  )
}
