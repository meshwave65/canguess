import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../pages/admin/lib/supabase";

const AuthContext = createContext();

/**
 * 🧠 CONTEXTO CANGUESS
 * - Supabase Auth = sessão real
 * - users table = resolução de identidade (username/phone/email)
 * - workspace = contexto operacional do sistema
 */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const [workspace, setWorkspace] = useState("CanGuess");

  const [loading, setLoading] = useState(true);

  // ======================
  // INIT SESSION
  // ======================
  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();

      setSession(data?.session || null);
      setUser(data?.session?.user || null);

      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ======================
  // RESOLVE IDENTITY
  // (username | phone | email → email)
  // ======================
  async function resolveIdentity(identifier) {
    const clean = identifier.trim();

    const { data, error } = await supabase
      .from("users")
      .select("email, user_name, phone")
      .or(
        `user_name.eq.${clean},phone.eq.${clean},email.eq.${clean}`
      )
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  // ======================
  // LOGIN (CANGUESS FLOW)
  // ======================
  async function login(identifier, password) {
    if (!identifier || !password) {
      throw new Error("Credenciais inválidas");
    }

    // 1. resolver identidade
    const identity = await resolveIdentity(identifier);

    if (!identity?.email) {
      throw new Error("Usuário não encontrado");
    }

    // 2. login real no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identity.email,
      password,
    });

    if (error) throw error;

    setSession(data.session);
    setUser(data.user);

    // 3. workspace padrão (pode evoluir depois)
    setWorkspace("CanGuess");

    return data.user;
  }

  // ======================
  // LOGOUT
  // ======================
  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setWorkspace("CanGuess");
  }

  // ======================
  // WORKSPACE SWITCH
  // ======================
  function switchWorkspace(ws) {
    setWorkspace(ws);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,

        workspace,
        setWorkspace: switchWorkspace,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
