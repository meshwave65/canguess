import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Predictions() {
  const jogos = [
    "FLAMENGO x VASCO",
    "BOTAFOGO x FLUMINENSE",
    "PALMEIRAS x CORINTHIANS",
    "SANTOS x SÃO PAULO",
    "GRÊMIO x INTERNACIONAL",
    "CRUZEIRO x ATLÉTICO MG",
    "BAHIA x VITÓRIA",
    "FORTALEZA x CEARÁ",
    "SPORT x NÁUTICO",
    "GOIÁS x VILA NOVA",
    "ATHLETICO x CORITIBA",
  ];

  return (
    <>
      <Header />

      <main
        style={{
          padding: "12px",
          paddingBottom: "90px",
        }}
      >
        <h2
          style={{
            color: "#C1121F",
            marginBottom: "15px",
          }}
        >
          Palpites da Rodada
        </h2>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#FFF",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#C1121F",
                  color: "#FFF",
                }}
              >
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  JOGO
                </th>

                <th>M</th>
                <th>E</th>
                <th>V</th>
              </tr>
            </thead>

            <tbody>
              {jogos.map((jogo, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #DDD",
                  }}
                >
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {jogo}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name={`jogo-${index}`}
                      value="M"
                    />
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name={`jogo-${index}`}
                      value="E"
                    />
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name={`jogo-${index}`}
                      value="V"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          style={{
            width: "100%",
            marginTop: "20px",
            background: "#C1121F",
            color: "#FFF",
            border: "none",
            padding: "14px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          SALVAR PALPITES
        </button>
      </main>

      <BottomNav />
    </>
  );
}
