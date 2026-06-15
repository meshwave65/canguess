import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

export default function AdminEntities() {
const navigate = useNavigate()

  // =========================
  // STATE
  // =========================
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [clubs, setClubs] = useState([]);

  const [countryId, setCountryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");

  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");

  const [regionCode, setRegionCode] = useState("");
  const [regionName, setRegionName] = useState("");

  const [cityName, setCityName] = useState("");

  const [clubCode, setClubCode] = useState("");
  const [clubName, setClubName] = useState("");

  // =========================
  // LOAD INITIAL DATA
  // =========================
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const { data: c1 } = await supabase.from("countries").select("*");
    const { data: r1 } = await supabase.from("regions").select("*");
    const { data: c2 } = await supabase.from("cities").select("*");
    const { data: c3 } = await supabase.from("clubs").select("*");

    setCountries(c1 || []);
    setRegions(r1 || []);
    setCities(c2 || []);
    setClubs(c3 || []);
  }

  // =========================
  // CREATE COUNTRY
  // =========================
  async function createCountry() {
    if (!countryCode || !countryName) return;

    const { data, error } = await supabase
      .from("countries")
      .insert([
        {
          code: countryCode.toUpperCase(),
          name: countryName,
          status: "active",
        },
      ])
      .select();

    if (error) return console.error(error);

    setCountries([...countries, data[0]]);
    setCountryCode("");
    setCountryName("");
  }

  // =========================
  // CREATE REGION
  // =========================
  async function createRegion() {
    if (!countryId || !regionName) return;

    const { data, error } = await supabase
      .from("regions")
      .insert([
        {
          country_id: countryId,
          code: regionCode ? regionCode.toUpperCase() : "XX",
          name: regionName,
          status: "active",
        },
      ])
      .select();

    if (error) return console.error(error);

    setRegions([...regions, data[0]]);
    setRegionCode("");
    setRegionName("");
  }

  // =========================
  // CREATE CITY
  // =========================
  async function createCity() {
    if (!regionId || !cityName) return;

    const { data, error } = await supabase
      .from("cities")
      .insert([
        {
          region_id: regionId,
          name: cityName,
          status: "active",
        },
      ])
      .select();

    if (error) return console.error(error);

    setCities([...cities, data[0]]);
    setCityName("");
  }

  // =========================
  // CREATE CLUB
  // =========================
  async function createClub() {
    if (!cityId || !clubName || !clubCode) return;

    const { data, error } = await supabase
      .from("clubs")
      .insert([
        {
          city_id: cityId,
          name: clubName,
          code: clubCode.toUpperCase(),
          status: "active",
        },
      ])
      .select();

    if (error) return console.error(error);

    setClubs([...clubs, data[0]]);
    setClubName("");
    setClubCode("");
  }

  // =========================
  // FILTERS
  // =========================
  const filteredRegions = regions.filter(r => r.country_id === countryId);
  const filteredCities = cities.filter(c => c.region_id === regionId);

  // =========================
  // UI
  // =========================
  return (
    <>
      <Header />

      <main style={{ padding: 10, paddingBottom: 90, fontSize: 12 }}>
        <h3>Admin - Estrutura de Dados</h3>

        {/* ================= COUNTRY ================= */}
        <section style={{ marginTop: 15 }}>
          <h4>País</h4>

          <select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
            <option value="">Selecionar país</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          <div>
            <input
              placeholder="BR"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            />
            <input
              placeholder="Brasil"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
            />
            <button onClick={createCountry}>Cadastrar</button>
          </div>
        </section>

        {/* ================= REGION ================= */}
        <section style={{ marginTop: 15 }}>
          <h4>Região</h4>

          <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
            <option value="">Selecionar região</option>
            {filteredRegions.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>

          <div>
            <input
              placeholder="RJ"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
            />
            <input
              placeholder="Rio de Janeiro"
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
            />
            <button onClick={createRegion}>Cadastrar</button>
          </div>
        </section>

        {/* ================= CITY ================= */}
        <section style={{ marginTop: 15 }}>
          <h4>Cidade</h4>

          <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
            <option value="">Selecionar cidade</option>
            {filteredCities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div>
            <input
              placeholder="Rio de Janeiro"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
            <button onClick={createCity}>Cadastrar</button>
          </div>
        </section>

        {/* ================= CLUB ================= */}
        <section style={{ marginTop: 15 }}>
          <h4>Clube</h4>

          <div>
            <input
              placeholder="FLA"
              value={clubCode}
              onChange={(e) => setClubCode(e.target.value)}
            />
            <input
              placeholder="Flamengo"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
            <button onClick={createClub}>Cadastrar</button>
          </div>
        </section>

        {/* DEBUG */}
        <pre style={{ marginTop: 20, fontSize: 10 }}>
          {JSON.stringify({ countries, regions, cities, clubs }, null, 2)}
        </pre>
      </main>

      <BottomNav />
    </>
  );
}
