import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Players() {
const navigate = useNavigate()
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Cadastro de Jogadores</h2>

        <p>Placeholder</p>
      </main>
             <BottomNav />
    </>
  );
}
