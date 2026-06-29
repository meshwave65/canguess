import { Routes, Route } from "react-router-dom";

import AppShell from "../layout/AppShell";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Predictions from "../pages/Predictions";
import Ranking from "../pages/Ranking";

import EventHome from "../pages/EventHome"; // ✅ AQUI ESTÁ O FIX

import Admin from "../pages/Admin";
import AdminLogin from "../pages/AdminLogin";

import Register from "../pages/Register";

import AdminGuard from "../components/AdminGuard";

import EventDashboard from "../pages/admin/EventDashboard";
import CadastrosHome from "../pages/admin/CadastrosHome";
import CadastrosTimes from "../pages/admin/CadastrosTimes";
import CadastrosEventos from "../pages/admin/CadastrosEventos";
import CadastrosFases from "../pages/admin/CadastrosFases";
import CadastrosRodadas from "../pages/admin/CadastrosRodadas";
import CadastroRounds from "../pages/admin/CadastrosRounds";
import CadastroParts from "../pages/admin/CadastrosParts";
import MapaPalpites from "../pages/admin/MapaPalpites";

import AdminLayout from "../pages/admin/AdminLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/palpites" element={<Predictions />} />
        <Route path="/ranking" element={<Ranking />} />
     {/* ================= REGISTER ================= */}
      <Route path="/register" element={<Register />} />
        {/* ✅ FIX PRINCIPAL */}
        <Route path="/events" element={<EventHome />} />
      </Route>

      {/* ================= ADMIN LOGIN ================= */}
      <Route path="/admin-login" element={<AdminLogin />} />


      {/* ================= ADMIN PROTECTED ================= */}
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Admin />} />

        <Route path="resultados" element={<div>Resultados</div>} />
        <Route path="usuarios" element={<div>Usuários</div>} />
        <Route path="consultas" element={<div>Consultas</div>} />
        <Route path="palpites" element={<MapaPalpites />} />

        <Route path="cadastros" element={<CadastrosHome />} />
        <Route path="cadastros/times" element={<CadastrosTimes />} />
        <Route path="cadastros/eventos" element={<CadastrosEventos />} />
        <Route path="cadastros/fases" element={<CadastrosFases />} />
        <Route path="cadastros/rodadas" element={<CadastrosRodadas />} />

        <Route
          path="cadastros/eventos/:eventId/estrutura"
          element={<EventDashboard />}
        />

        <Route
          path="cadastros/eventos/:eventId/rounds"
          element={<CadastroRounds />}
        />

        <Route
          path="cadastros/eventos/:eventId/parts"
          element={<CadastroParts />}
        />
      </Route>
    </Routes>
  );
}
