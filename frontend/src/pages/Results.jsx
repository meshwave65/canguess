import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Results() {
const navigate = useNavigate()
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Lançamento de Resultados</h2>

        <p>Placeholder</p>
      </main>
             <BottomNav />
    </>
  );
}
