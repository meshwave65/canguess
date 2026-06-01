import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const PLAYER_COL_WIDTH = 50;
const POINTS_COL_WIDTH = 15;
const GAME_COL_WIDTH = 15;

export default function Ranking() {
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
        palpites: [
            true, true, false, true, true,
            true, false, true, true, true, false
    ],
  },

  {
        nome: "JUCA BALA",
        pontos: 7,
        palpites: [
            true, false, true, false, true,
            true, true, false, true, false, true
    ],
  },

  {
        nome: "AÇOG....NH74",
        pontos: 6,
        palpites: [
            false, true, false, true, false,
            true, true, true, false, true, false
    ],
  },
];

  return (
    <>
      <Header />

      <main
        style={{
          padding: "8px",
          paddingBottom: "90px",
        }}
      >
        <h2
          style={{
            color: "#C1121F",
            marginBottom: "10px",
            fontSize: "14px",
          }}
        >
          Classificação Geral
        </h2>

        <div
          style={{
            overflow: "auto",
            border: "1px solid #ddd",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              minWidth: "598px",
              tableLayout: "fixed",
              fontSize: "10px",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 10,
              }}
            >
              <tr>
                <th
                  style={{
                    width: `${PLAYER_COL_WIDTH}px`,
                    minWidth: `${PLAYER_COL_WIDTH}px`,
                    maxWidth: `${PLAYER_COL_WIDTH}px`,
                    border: "1px solid #ddd",
                    background: "#C1121F",
                    color: "#fff",
                    padding: "2px",
                    fontSize: "9px",
                  }}
                >
                  JOGADOR
                </th>

                <th
                  style={{
                    width: `${POINTS_COL_WIDTH}px`,
                    minWidth: `${POINTS_COL_WIDTH}px`,
                    maxWidth: `${POINTS_COL_WIDTH}px`,
                    border: "1px solid #ddd",
                    background: "#C1121F",
                    color: "#fff",
                    padding: "2px",
                    fontSize: "9px",
                  }}
                >
                  PTS
                </th>

                {jogos.map((jogo, idx) => (
                  <th
                    key={idx}
                    style={{
                      width: `${GAME_COL_WIDTH}px`,
                      minWidth: `${GAME_COL_WIDTH}px`,
                      maxWidth: `${GAME_COL_WIDTH}px`,
                      border: "1px solid #ddd",
                      padding: "1px",
                      lineHeight: "1",
                      textAlign: "center",
                      fontSize: "9px",
                    }}
                  >
                    <div>{jogo.mandante}</div>

                    <div
                      style={{
                        color: "#666",
                      }}
                    >
                      X
                    </div>

                    <div>{jogo.visitante}</div>

                    <div
                      style={{
                        marginTop: "2px",
                        color: "#C1121F",
                        fontWeight: "bold",
                      }}
                    >
                      {jogo.resultado}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {jogadores.map((jogador, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "3px",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    {jogador.nome}
                  </td>

                  <td
                    style={{
                      border: "1px solid #ddd",
                      textAlign: "center",
                      padding: "2px",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    {jogador.pontos}
                  </td>

                  {jogador.palpites.map((acertou, pidx) => (
                    <td
                      key={pidx}
                      style={{
                        border: "1px solid #ddd",
                        textAlign: "center",
                        padding: "2px",
                        height: "22px",
                      }}
                    >
                      <div
                        title="Visualizar palpite"
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: acertou
                            ? "#16a34a"
                            : "#d1d5db",
                          margin: "0 auto",
                          cursor: "pointer",
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
