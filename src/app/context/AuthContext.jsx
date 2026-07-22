import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getToken, setToken } from "../lib/apiClient";
import { connectSocket, disconnectSocket } from "../lib/socketClient";

const AuthContext = createContext(null);

// DEV BYPASS: temporary dashboard-development auth bypass.
// Remove this block when the OTP flow is restored for production.
const DEV_BYPASS_TOKEN = "dev_bypass_token_123";
const DEV_BYPASS_USER_STORAGE_KEY = "workbridge_dev_bypass_user";

// "loading" only lasts as long as the initial /me rehydration call on first
// mount; after that it's always "authenticated" or "guest".
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = getToken();

    // DEV BYPASS: rehydrate the mock user after refresh without calling /api/auth/me.
    if (token === DEV_BYPASS_TOKEN) {
      const storedDevUser = localStorage.getItem(DEV_BYPASS_USER_STORAGE_KEY);
      if (storedDevUser) {
        try {
          setCurrentUser(JSON.parse(storedDevUser));
          setStatus("authenticated");
          return;
        } catch {
          localStorage.removeItem(DEV_BYPASS_USER_STORAGE_KEY);
        }
      }
    }

    if (!token) {
      setStatus("guest");
      return;
    }

    apiFetch("/api/auth/me")
      .then((user) => {
        connectSocket(token);
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

  const authenticate = (token, user) => {
    setToken(token);
    // The dev-bypass token is never a real JWT — the real server (and
    // socket auth, which reuses the same verify logic) would reject it.
    if (token !== DEV_BYPASS_TOKEN) connectSocket(token);
    setCurrentUser(user);
    setStatus("authenticated");
  };

  const logout = () => {
    // DEV BYPASS: clear the mock user alongside the fake token.
    localStorage.removeItem(DEV_BYPASS_USER_STORAGE_KEY);
    disconnectSocket();
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
    () => ({ currentUser, status, authenticate, logout, updateCurrentUser }),
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
