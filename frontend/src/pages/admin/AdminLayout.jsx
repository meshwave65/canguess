import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR FUTURA (pode evoluir depois) */}
      <aside
        style={{
          width: 220,
          background: "#111",
          color: "#fff",
          padding: 15,
        }}
      >
        <h3>Admin</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="/admin" style={{ color: "#fff" }}>Dashboard</a>
          <a href="/admin/usuarios" style={{ color: "#fff" }}>Usuários</a>
          <a href="/admin/palpites" style={{ color: "#fff" }}>Palpites</a>
          <a href="/admin/cadastros" style={{ color: "#fff" }}>Cadastros</a>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main style={{ flex: 1, padding: 20, background: "#f4f4f4" }}>
        <Outlet />
      </main>
    </div>
  );
}
