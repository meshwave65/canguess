import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function CadastrosHome() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Cadastros</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <Link
            to="/admin/cadastros/times"
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            Times
          </Link>

          <Link
            to="/admin/cadastros/rodadas"
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            Rodadas
          </Link>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
