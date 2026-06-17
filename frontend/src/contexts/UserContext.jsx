import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "../services/authService";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // carrega usuário ao iniciar app
  useEffect(() => {
    async function load() {
      const current = await AuthService.getCurrentUser();
      setUser(current);
      setLoading(false);
    }
    load();
  }, []);

  async function login(email, password) {
    const res = await AuthService.login(email, password);
    if (res.ok) {
      setUser(res.user);
    }
    return res;
  }

  async function logout() {
    await AuthService.logout();
    setUser(null);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isGuest: !user,
        isLogged: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
