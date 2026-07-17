import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getToken, setToken } from "../lib/apiClient";

const AuthContext = createContext(null);

// "loading" only lasts as long as the initial /me rehydration call on first
// mount; after that it's always "authenticated" or "guest".
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!getToken()) {
      setStatus("guest");
      return;
    }

    apiFetch("/api/auth/me")
      .then((user) => {
        setCurrentUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        // Expired/invalid token left over from a previous session.
        setToken(null);
        setCurrentUser(null);
        setStatus("guest");
      });
  }, []);

  const register = async ({ role, name, email, phone, password }) => {
    const { token, user } = await apiFetch("/api/auth/register", {
      method: "POST",
      body: { role, name, email, phone, password },
    });
    setToken(token);
    setCurrentUser(user);
    setStatus("authenticated");
    return user;
  };

  const authenticate = (token, user) => {
    setToken(token);
    setCurrentUser(user);
    setStatus("authenticated");
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setStatus("guest");
  };

  // Called with the fresh row returned by PATCH /api/profiles/me so an
  // edit (avatar, title, skills/bio) is reflected everywhere that reads
  // currentUser (sidebar, header) without a full page reload/refetch.
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const value = useMemo(
    () => ({ currentUser, status, register, authenticate, logout, updateCurrentUser }),
    [currentUser, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
