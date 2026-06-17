import { createContext, useContext, useState } from "react";

const EventEngineContext = createContext();

export function EventEngineProvider({ children }) {
  const [state, setState] = useState({
    event: null,
    workspace: null,
    user: null,
    guest: null,
    mode: "public", // public | guest | user | owner
    participation: null,
  });

  // =========================
  // EVENT
  // =========================
  function setEvent(event) {
    setState((prev) => ({
      ...prev,
      event,
      mode: event ? prev.mode : "public",
    }));
  }

  // =========================
  // USER
  // =========================
  function setUser(user) {
    setState((prev) => ({
      ...prev,
      user,
      guest: null,
      mode: user?.type || "user",
    }));
  }

  // =========================
  // GUEST MODE
  // =========================
  function setGuest(phone, eventId) {
    setState((prev) => ({
      ...prev,
      guest: {
        id: `guest_${phone}`,
        phone,
        eventId,
      },
      mode: "guest",
    }));
  }

  // =========================
  // OWNER MODE
  // =========================
  function setOwner(user) {
    setState((prev) => ({
      ...prev,
      user,
      mode: "owner",
    }));
  }

  // =========================
  // PARTICIPATION CONTEXT
  // =========================
  function setParticipation(data) {
    setState((prev) => ({
      ...prev,
      participation: data,
    }));
  }

  return (
    <EventEngineContext.Provider
      value={{
        ...state,
        setEvent,
        setUser,
        setGuest,
        setOwner,
        setParticipation,
      }}
    >
      {children}
    </EventEngineContext.Provider>
  );
}

export function useEventEngine() {
  return useContext(EventEngineContext);
}
