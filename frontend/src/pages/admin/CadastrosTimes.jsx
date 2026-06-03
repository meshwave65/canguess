import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function CadastrosTimes() {
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

  async function addCountry() {
    const { data } = await supabase
      .from("countries")
      .insert([{ code: countryCode, name: countryName }])
      .select();

    setCountries([...countries, data[0]]);
  }

  async function addRegion() {
    const { data } = await supabase
      .from("regions")
      .insert([{ country_id: countryId, code: regionCode, name: regionName }])
      .select();

    setRegions([...regions, data[0]]);
  }

  async function addCity() {
    const { data } = await supabase
      .from("cities")
      .insert([{ region_id: regionId, name: cityName }])
      .select();

    setCities([...cities, data[0]]);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Cadastro de Times</h2>

      {/* PAÍS */}
      <h3>País</h3>
      <select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
        <option value="">Selecionar</option>
        {countries.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input placeholder="BR" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
      <input placeholder="Brasil" value={countryName} onChange={(e) => setCountryName(e.target.value)} />
      <button onClick={addCountry}>Salvar País</button>

      {/* REGIÃO */}
      <h3>Região</h3>
      <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
        <option value="">Selecionar</option>
        {regions.filter(r => r.country_id === countryId).map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <input placeholder="RJ" value={regionCode} onChange={(e) => setRegionCode(e.target.value)} />
      <input placeholder="Rio de Janeiro" value={regionName} onChange={(e) => setRegionName(e.target.value)} />
      <button onClick={addRegion}>Salvar Região</button>

      {/* CIDADE */}
      <h3>Cidade</h3>
      <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
        <option value="">Selecionar</option>
        {cities.filter(c => c.region_id === regionId).map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input placeholder="Cidade" value={cityName} onChange={(e) => setCityName(e.target.value)} />
      <button onClick={addCity}>Salvar Cidade</button>
    </div>
  );
}
