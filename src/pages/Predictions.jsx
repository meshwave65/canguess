import Header from "../components/Header";

export default function Predictions() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Palpites da Rodada</h2>

        <div>
          <h3>FLAMENGO x VASCO</h3>

          <label>
            <input type="radio" name="jogo1" />
            Flamengo
          </label>

          <br />

          <label>
            <input type="radio" name="jogo1" />
            Empate
          </label>

          <br />

          <label>
            <input type="radio" name="jogo1" />
            Vasco
          </label>
        </div>
      </main>
    </>
  );
}
