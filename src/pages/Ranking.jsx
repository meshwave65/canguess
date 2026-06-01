import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
export default function Ranking() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Classificação</h2>

        <ol>
          <li>ZE BANGU - 8</li>
          <li>JUCA BALA - 7</li>
          <li>AÇOU....O 74 - 7</li>
          <li>CARLINHOS - 6</li>
        </ol>
      </main>
             <BottomNav />
    </>
  );
}
