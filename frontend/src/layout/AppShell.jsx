import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <>
      <Header />

      <div style={{ paddingTop: 80, paddingBottom: 80 }}>
        <Outlet />
      </div>

      <BottomNav />
    </>
  );
}
