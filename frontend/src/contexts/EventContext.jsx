import { createContext, useContext, useState } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [event, setEvent] = useState(null);
  const [workspace, setWorkspace] = useState(null);

  // entrada por código
  function loadEventByCode(code) {
    // futuramente: fetch no supabase
    setEvent({
      id: code,
      name: "Evento carregado",
      status: "active",
    });
  }

  function clearEvent() {
    setEvent(null);
    setWorkspace(null);
  }

  return (
    <EventContext.Provider
      value={{
        event,
        setEvent,
        workspace,
        setWorkspace,
        loadEventByCode,
        clearEvent,
        hasEvent: !!event,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}
