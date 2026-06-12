import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Predictions from "../pages/Predictions";
import Ranking from "../pages/Ranking";
import Admin from "../pages/Admin";

import EventDashboard from "../pages/admin/EventDashboard";
import CadastrosHome from "../pages/admin/CadastrosHome";
import CadastrosTimes from "../pages/admin/CadastrosTimes";
import CadastrosEventos from "../pages/admin/CadastrosEventos";
import CadastrosFases from "../pages/admin/CadastrosFases";
import CadastrosRodadas from "../pages/admin/CadastrosRodadas";
import CadastroRounds from "../pages/admin/CadastrosRounds";
import CadastroParts from "../pages/admin/CadastrosParts";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/palpites" element={<Predictions />} />
      <Route path="/ranking" element={<Ranking />} />

      <Route path="/admin" element={<Admin />} />

      <Route path="/admin/resultados" element={<div>Resultados</div>} />
      <Route path="/admin/usuarios" element={<div>Usuários</div>} />
      <Route path="/admin/consultas" element={<div>Consultas</div>} />

      {/* CADASTROS */}
      <Route path="/admin/cadastros" element={<CadastrosHome />} />
      <Route path="/admin/cadastros/times" element={<CadastrosTimes />} />
      <Route path="/admin/cadastros/eventos" element={<CadastrosEventos />} />
      <Route path="/admin/cadastros/fases" element={<CadastrosFases />} />
      <Route path="/admin/cadastros/rodadas" element={<CadastrosRodadas />} />

      <Route path="/cadastro-parts" element={<CadastroParts />} />

      <Route
        path="/admin/cadastros/eventos/:eventId/estrutura"
        element={<EventDashboard />}
      />

      <Route
        path="/admin/cadastros/eventos/:eventId/rounds"
        element={<CadastroRounds />}
      />

      <Route
        path="/admin/cadastros/eventos/:eventId/parts"
        element={<CadastroParts />}
      />
    </Routes>
  );
}
