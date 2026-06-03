import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PLAYER_COL_WIDTH = 140;
const POINTS_COL_WIDTH = 60;
const GAME_COL_WIDTH = 80;

export default function Ranking() {
  const navigate = useNavigate(); // 🔥 FIX PRINCIPAL

  const [modo, setModo] = useState("text");

  useEffect(() => {
    document.body.setAttribute("data-mode", modo);
  }, [modo]);

  const getLogo = (time) => `/logos/${time}.svg`;

  const jogos = [
    { mandante: "FLA", visitante: "VAS", resultado: "3X1" },
    { mandante: "BOT", visitante: "FLU", resultado: "0X0" },
    { mandante: "PAL", visitante: "COR", resultado: "2X1" },
    { mandante: "SAN", visitante: "SAO", resultado: "1X0" },
    { mandante: "GRE", visitante: "INT", resultado: "2X2" },
    { mandante: "CRU", visitante: "CAM", resultado: "1X1" },
    { mandante: "BAH", visitante: "VIT", resultado: "2X0" },
    { mandante: "FOR", visitante: "CEA", resultado: "1X0" },
    { mandante: "SPT", visitante: "NAU", resultado: "3X0" },
    { mandante: "GOI", visitante: "VIL", resultado: "0X1" },
    { mandante: "CAP", visitante: "CFC", resultado: "2X1" },
  ];

  const jogadores = [
    {
      nome: "ZE BANGU",
      pontos: 8,
      palpites: [true, true, false, true, true, true, false, true, true, true, false],
    },
    {
      nome: "JUCA BALA",
      pontos: 7,
      palpites: [true, false, true, false, true, true, true, false, true, false, true],
    },
    {
      nome: "AÇOG....NH74",
      pontos: 6,
      palpites: [false, true, false, true, false, true, true, true, false, true, false],
    },
  ];

  return (
    <>
      <Header />

      {/* 🔥 NAV CORRIGIDA */}
      <div style={{ display: "flex", gap: 10, padding: 10 }}>
        <button onClick={() => navigate("/")}>🏠 Home</button>
        <button onClick={() => navigate(-1)}>🔙 Voltar</button>
      </div>

      <main style={{ padding: "8px", paddingBottom: "90px" }}>
        <h2 style={{ color: "#C1121F", fontSize: "14px", marginBottom: "10px" }}>
          Classificação Geral
        </h2>

        {/* TOGGLE */}
        <label style={{ fontSize: "12px", display: "block", marginBottom: "10px" }}>
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

                      <div className="team">
                        {modo === "text" ? (
                          <span>{jogo.mandante}</span>
                        ) : (
                          <img
                            className="team-logo"
                            src={getLogo(jogo.mandante)}
                            alt={jogo.mandante}
                            width="18"
                            height="18"
                          />
                        )}
                      </div>

                      <div>X</div>

                      <div className="team">
                        {modo === "text" ? (
                          <span>{jogo.visitante}</span>
                        ) : (
                          <img
                            className="team-logo"
                            src={getLogo(jogo.visitante)}
                            alt={jogo.visitante}
                            width="18"
                            height="18"
                          />
                        )}
                      </div>

                      <div>{jogo.resultado}</div>
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
                    {jogador.pontos}
                  </td>

                  {jogador.palpites.map((p, i) => (
                    <td key={i} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: p ? "#16a34a" : "#d1d5db",
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
