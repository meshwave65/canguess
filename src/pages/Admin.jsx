import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
export default function Admin() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Administração</h2>

        <ul>
          <li>Jogadores</li>
          <li>Times</li>
          <li>Rodadas</li>
          <li>Jogos</li>
          <li>Resultados</li>
        </ul>
      </main>
             <BottomNav />
    </>
  );
}
