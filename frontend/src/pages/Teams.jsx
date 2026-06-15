import { useNavigate } from "react-router-dom";

export default function Teams() {
const navigate = useNavigate()
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Cadastro de Times</h2>

        <p>Placeholder</p>
      </main>
             <BottomNav />
    </>
  );
}
