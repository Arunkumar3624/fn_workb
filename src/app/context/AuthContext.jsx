import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getToken, setToken } from "../lib/apiClient";
import { connectSocket, disconnectSocket } from "../lib/socketClient";

const AuthContext = createContext(null);

// A stale dev-bypass token/user object from before this app moved to real
// auth may still be sitting in a browser's localStorage from earlier
// testing — clear it out unconditionally so it can never again grant
// access without a real backend check. Not just cleanup: this was a live
// access-control hole (a locally-stored fake "role: admin" object was
// enough to reach the Admin Panel, no server involved).
const STALE_DEV_BYPASS_USER_KEY = "workbridge_dev_bypass_user";

// "loading" only lasts as long as the initial /me rehydration call on first
// mount; after that it's always "authenticated" or "guest".
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    localStorage.removeItem(STALE_DEV_BYPASS_USER_KEY);
    const token = getToken();

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
    connectSocket(token);
    setCurrentUser(user);
    setStatus("authenticated");
  };

  const logout = () => {
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
