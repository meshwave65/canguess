import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Admin() {
const navigate = useNavigate()
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Administração</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <Link
            to="/admin/cadastros"
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            Cadastros
          </Link>

          <Link
            to="/admin/resultados"
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            Resultados
          </Link>

          <Link
            to="/admin/usuarios"
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            Usuários
          </Link>

          <Link
            to="/admin/consultas"
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            Consultas
          </Link>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
