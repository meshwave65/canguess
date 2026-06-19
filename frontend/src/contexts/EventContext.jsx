import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../pages/admin/lib/supabase";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // LOAD EVENT BY CODE
  // =========================
  const loadEventByCode = useCallback(async (code) => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_type_uuid(name)
        `)
        .eq("event_code", code)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setCurrentEvent(null);
        setError("EVENT_NOT_FOUND");
        return;
      }

      setCurrentEvent(data);

      // opcional: persistência UX
      localStorage.setItem("last_event_code", code);

    } catch (err) {
      console.error("loadEventByCode error:", err);
      setCurrentEvent(null);
      setError("EVENT_LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // RESET EVENT
  // =========================
  const clearEvent = useCallback(() => {
    setCurrentEvent(null);
    setError(null);
    setLoading(false);
  }, []);

  // =========================
  // CONTEXT VALUE
  // =========================
  const value = {
    currentEvent,
    loading,
    error,
    loadEventByCode,
    clearEvent,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

// =========================
// SAFE HOOK (CRASH PROTECTION)
// =========================
export function useEvent() {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("useEvent must be used inside EventProvider");
  }

  return context;
}
