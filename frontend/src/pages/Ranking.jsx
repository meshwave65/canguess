import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PLAYER_COL_WIDTH = 140;
const POINTS_COL_WIDTH = 60;
const GAME_COL_WIDTH = 90;

// logos SEM /public (Vite serve direto da raiz)
const getLogo = (code) => `/logos/${code}.svg`;

export default function Ranking() {
  const navigate = useNavigate();
  const [modo, setModo] = useState("text");

  useEffect(() => {
    document.body.setAttribute("data-mode", modo);
  }, [modo]);

  // 🔥 fallback inteligente por lado
  const handleLogoError = (side) => (e) => {
    e.target.onerror = null;
    e.target.src =
      side === "home"
        ? "/logos/time-a.svg"
        : "/logos/time-b.svg";
  };

  // 🧠 MOCK DOS JOGOS DA COPA
  const jogos = [
    { mandante: "QAT", visitante: "SUI", resultado: "0X0" },
    { mandante: "BRA", visitante: "MAR", resultado: "0X0" },
    { mandante: "HTI", visitante: "SCO", resultado: "0X0" },
    { mandante: "AUS", visitante: "TUR", resultado: "0X0" },
    { mandante: "GER", visitante: "CUW", resultado: "0X0" },
    { mandante: "NED", visitante: "JPN", resultado: "0X0" },
    { mandante: "CIV", visitante: "ECU", resultado: "0X0" },
    { mandante: "SWE", visitante: "TUN", resultado: "0X0" },
    { mandante: "ESP", visitante: "CPV", resultado: "0X0" },
    { mandante: "BEL", visitante: "EGY", resultado: "0X0" },
    { mandante: "KSA", visitante: "URU", resultado: "0X0" },
  ];

  const jogadores = [
    {
      nome: "ZE BANGU",
      pontos: 0,
      palpites: Array(11).fill(null),
    },
    {
      nome: "JUCA BALA",
      pontos: 0,
      palpites: Array(11).fill(null),
    },
    {
      nome: "ALVA",
      pontos: 0,
      palpites: Array(11).fill(null),
    },
  ];

  return (
    <>
      <Header />

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, padding: 10 }}>
        <button onClick={() => navigate("/")}>🏠 Home</button>
        <button onClick={() => navigate(-1)}>🔙 Voltar</button>
      </div>

      <main style={{ padding: 8, paddingBottom: 90 }}>
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>
          Ranking do Bolão (MVP)
        </h2>

        {/* TOGGLE */}
        <label style={{ fontSize: 12, display: "block", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={modo === "logo"}
            onChange={(e) => setModo(e.target.checked ? "logo" : "text")}
          />
          {" "}Modo Escudos
        </label>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: PLAYER_COL_WIDTH }}>JOGADOR</th>
                <th style={{ width: POINTS_COL_WIDTH }}>PTS</th>

                {jogos.map((jogo, idx) => (
                  <th key={idx} style={{ width: GAME_COL_WIDTH }}>
                    <div className="game-grid">

                      {/* MANDANTE */}
                      <div className="team">
                        {modo === "text" ? (
                          <span>{jogo.mandante}</span>
                        ) : (
                          <img
                            src={getLogo(jogo.mandante)}
                            width="18"
                            height="18"
                            onError={handleLogoError("home")}
                            alt={jogo.mandante}
                          />
                        )}
                      </div>

                      <div>X</div>

                      {/* VISITANTE */}
                      <div className="team">
                        {modo === "text" ? (
                          <span>{jogo.visitante}</span>
                        ) : (
                          <img
                            src={getLogo(jogo.visitante)}
                            width="18"
                            height="18"
                            onError={handleLogoError("away")}
                            alt={jogo.visitante}
                          />
                        )}
                      </div>

                      <div style={{ fontSize: 10 }}>
                        {jogo.resultado}
                      </div>

                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {jogadores.map((jogador, idx) => (
                <tr key={idx}>
                  <td>{jogador.nome}</td>

                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {jogador.pontos || "-"}
                  </td>

                  {jogos.map((_, i) => (
                    <td key={i} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#d1d5db",
                          margin: "0 auto",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
