import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />

      <main
        style={{
          paddingTop: 80,
          paddingBottom: 80,
          minHeight: "100vh",
          background: "#f5f6fa",
        }}
      >
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
