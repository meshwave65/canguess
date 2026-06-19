import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { EventProvider, useEvent } from "../contexts/EventContext";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

function AppInitializer() {
  const { loadEventByCode } = useEvent();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      loadEventByCode(code);
    }
  }, [loadEventByCode]);

  return null;
}

function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <BottomNav />
    </>
  );
}

export default function AppShell() {
  return (
    <EventProvider>
      <AppInitializer />
      <AppLayout />
    </EventProvider>
  );
}
