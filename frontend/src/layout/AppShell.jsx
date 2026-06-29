import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { EventProvider, useEvent } from "../contexts/EventContext";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";


export default function AppShell() {
 return (
 <>
 <AppInitializer />
 <AppLayout />
 </>
 );
}

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

    <div
      style={{
        minHeight: "100vh",
        paddingTop: "70px",     // espaço reservado para Header
        paddingBottom: "75px",  // espaço reservado para BottomNav
        boxSizing: "border-box",
      }}
    >

      <Header />


      <main>

        <Outlet />

      </main>


      <BottomNav />

    </div>

  );

}

