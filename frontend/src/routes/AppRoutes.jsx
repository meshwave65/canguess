import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Predictions from "../pages/Predictions";
import Ranking from "../pages/Ranking";
import Admin from "../pages/Admin";

import CadastrosHome from "../pages/admin/CadastrosHome";
import CadastrosTimes from "../pages/admin/CadastrosTimes";
import CadastrosRodadas from "../pages/admin/CadastrosRodadas";

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
      <Route path="/admin" element={<Admin />} />
      {/* CADASTROS */}
      <Route path="/admin/cadastros" element={<CadastrosHome />} />
      <Route path="/admin/cadastros/times" element={<CadastrosTimes />} />
      <Route path="/admin/cadastros/rodadas" element={<CadastrosRodadas />} />
    </Routes>
  );
}
