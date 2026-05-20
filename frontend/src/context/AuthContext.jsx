import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  demoLogin,
  getCurrentUser,
  loadAuthToken,
  setAuthToken,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function restoreSession() {
      const token = loadAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch {
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function loginAsDemo() {
    setError("");
    const data = await demoLogin();
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
    setError("");
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      setError,
      loginAsDemo,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
