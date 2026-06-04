import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";

export default function CadastrosTimes() {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);

  const [countryId, setCountryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");

  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");

  const [regionCode, setRegionCode] = useState("");
  const [regionName, setRegionName] = useState("");

  const [cityName, setCityName] = useState("");

  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [divisao, setDivisao] = useState("");

  const [message, setMessage] = useState("");

  // =========================
  // LOAD
  // =========================
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: c1 } = await supabase.from("countries").select("*");
    const { data: r1 } = await supabase.from("regions").select("*");
    const { data: c2 } = await supabase.from("cities").select("*");

    setCountries(c1 || []);
    setRegions(r1 || []);
    setCities(c2 || []);
  }

  function show(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  }

  // =========================
  // COUNTRY
  // =========================
  async function addCountry() {
    const { data, error } = await supabase
      .from("countries")
      .insert([{ code: countryCode, name: countryName }])
      .select();

    if (error) return show(error.message);

    setCountries([...countries, data[0]]);
    setCountryId(data[0].id);
    setCountryCode("");
    setCountryName("");
    show("País salvo");
  }

  // =========================
  // REGION
  // =========================
  async function addRegion() {
    const { data, error } = await supabase
      .from("regions")
      .insert([
        {
          country_id: countryId,
          code: regionCode,
          name: regionName,
        },
      ])
      .select();

    if (error) return show(error.message);

    setRegions([...regions, data[0]]);
    setRegionId(data[0].id);
    setRegionCode("");
    setRegionName("");
    show("Região salva");
  }

  // =========================
  // CITY
  // =========================
  async function addCity() {
    const { data, error } = await supabase
      .from("cities")
      .insert([
        {
          region_id: regionId,
          name: cityName,
        },
      ])
      .select();

    if (error) return show(error.message);

    setCities([...cities, data[0]]);
    setCityName("");
    show("Cidade salva");
  }

  // =========================
  // TEAM
  // =========================
  async function addTeam() {
    const { data: city } = await supabase
      .from("cities")
      .select("name")
      .eq("id", cityId)
      .single();

    const { error } = await supabase.from("times").insert([
      {
        nome: teamName,
        codigo: teamCode,
        divisao,
        cidade: city?.name || "",
      },
    ]);

    if (error) return show(error.message);

    setTeamName("");
    setTeamCode("");
    setDivisao("");
    show("Time salvo");
  }

  // =========================
  // STYLE
  // =========================
  const s = {
    page: { padding: 20, background: "#f5f6fa", minHeight: "100vh" },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 10,
      borderBottom: "1px solid #e6e6e6",
    },

    titleBox: { display: "flex", flexDirection: "column" },
    title: { fontSize: 18, fontWeight: 600 },
    subtitle: { fontSize: 12, color: "#777" },

    navBtn: {
      fontSize: 18,
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid #ddd",
      background: "#fff",
      cursor: "pointer",
    },

    card: {
      background: "#fff",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },

    row: {
      display: "flex",
      gap: 6,
      alignItems: "center",
    },

    input: {
      padding: 6,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 13,
    },

    select: {
      padding: 6,
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 13,
      minWidth: 120,
    },

    btn: {
      padding: "6px 10px",
      borderRadius: 6,
      border: "1px solid #ddd",
      background: "#fff",
      cursor: "pointer",
    },
  };

  return (
    <div style={s.page}>

      {/* HEADER PADRÃO */}
      <div style={s.header}>
        <div style={s.titleBox}>
          <div style={s.title}>Cadastro de Regiões e Times</div>
          <div style={s.subtitle}>
            Países, regiões, cidades e clubes
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.navBtn} onClick={() => navigate(-1)}>⬅️</button>
          <button style={s.navBtn} onClick={() => navigate("/")}>🏠</button>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div style={{ marginBottom: 10, fontSize: 13 }}>
          {message}
        </div>
      )}

      {/* ================= COUNTRY ================= */}
      <div style={s.card}>
        <div style={s.row}>
          <select style={s.select} value={countryId} onChange={e => setCountryId(e.target.value)}>
            <option>País</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            style={{ ...s.input, width: 70 }}
            placeholder="BR"
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
          />

          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Nome país"
            value={countryName}
            onChange={e => setCountryName(e.target.value)}
          />

          <button style={s.btn} onClick={addCountry}>💾</button>
        </div>
      </div>

      {/* ================= REGION ================= */}
      <div style={s.card}>
        <div style={s.row}>
          <select style={s.select} value={regionId} onChange={e => setRegionId(e.target.value)}>
            <option>Região</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <input
            style={{ ...s.input, width: 70 }}
            placeholder="RJ"
            value={regionCode}
            onChange={e => setRegionCode(e.target.value)}
          />

          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Nome região"
            value={regionName}
            onChange={e => setRegionName(e.target.value)}
          />

          <button style={s.btn} onClick={addRegion}>💾</button>
        </div>
      </div>

      {/* ================= CITY ================= */}
      <div style={s.card}>
        <div style={s.row}>
          <select style={s.select} value={cityId} onChange={e => setCityId(e.target.value)}>
            <option>Cidade</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Nome cidade"
            value={cityName}
            onChange={e => setCityName(e.target.value)}
          />

          <button style={s.btn} onClick={addCity}>💾</button>
        </div>
      </div>

      {/* ================= TEAM ================= */}
      <div style={s.card}>
        <div style={s.row}>
          <select style={s.select} value={cityId} onChange={e => setCityId(e.target.value)}>
            <option>Cidade time</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Nome time"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />

          <input
            style={{ ...s.input, width: 80 }}
            placeholder="COD"
            value={teamCode}
            onChange={e => setTeamCode(e.target.value)}
          />

          <input
            style={{ ...s.input, width: 80 }}
            placeholder="Div"
            value={divisao}
            onChange={e => setDivisao(e.target.value)}
          />

          <button style={s.btn} onClick={addTeam}>💾</button>
        </div>
      </div>

    </div>
  );
}
