import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getToken, setToken, getImpersonatorStash, setImpersonatorStash } from "../lib/apiClient";
import { connectSocket, disconnectSocket } from "../lib/socketClient";

const AuthContext = createContext(null);

// A stale dev-bypass token/user object from before this app moved to real
// auth may still be sitting in a browser's localStorage from earlier
// testing — clear it out unconditionally so it can never again grant
// access without a real backend check. Not just cleanup: this was a live
// access-control hole (a locally-stored fake "role: admin" object was
// enough to reach the Admin Panel, no server involved).
const STALE_DEV_BYPASS_USER_KEY = "workbridge_dev_bypass_user";

// The "Stealth Mode" verification-frame toggle — a real, working display
// preference (it actually hides/shows the ring everywhere instantly), but
// device-local rather than backend-persisted since there's no DB column for
// it yet. Keyed per-user id so switching accounts on the same browser
// doesn't leak one user's choice onto another's session.
const FRAME_PREF_PREFIX = "wb-show-verification-frame:";

function readFramePreference(userId) {
  if (typeof window === "undefined" || !userId) return true;
  const stored = window.localStorage.getItem(FRAME_PREF_PREFIX + userId);
  return stored === null ? true : stored === "true";
}

function hydrateFramePreference(user) {
  if (!user) return user;
  return { ...user, showVerificationFrame: readFramePreference(user.id) };
}

// "loading" only lasts as long as the initial /me rehydration call on first
// mount; after that it's always "authenticated" or "guest".
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("loading");
  // Mirrors whether an admin-impersonation stash exists (see
  // startImpersonation/endImpersonation below) — survives a page refresh
  // mid-impersonation since it's read from the same localStorage key.
  const [isImpersonating, setIsImpersonating] = useState(() => Boolean(getImpersonatorStash()));

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
        setCurrentUser(hydrateFramePreference(user));
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
    setCurrentUser(hydrateFramePreference(user));
    setStatus("authenticated");
  };

  const logout = () => {
    disconnectSocket();
    setToken(null);
    setImpersonatorStash(null);
    setIsImpersonating(false);
    setCurrentUser(null);
    setStatus("guest");
  };

  // Called right after POST /api/admin/impersonate succeeds — stashes the
  // real admin's own session (so "End Session" can restore it with no
  // re-login) and swaps the active session to the target user's short-lived
  // token. adminUser/adminToken are the CALLER's own session, captured
  // before this swap — never derived from anything the impersonated
  // session could influence.
  const startImpersonation = (impersonationToken, targetUser, adminToken, adminUser) => {
    setImpersonatorStash({ token: adminToken, user: adminUser });
    setIsImpersonating(true);
    authenticate(impersonationToken, targetUser);
  };

  // Restores the stashed admin session directly — no API call, no
  // re-login. Returns the restored admin user so the caller (
  // ImpersonationBanner.jsx) can navigate back to /admin.
  const endImpersonation = () => {
    const stash = getImpersonatorStash();
    setImpersonatorStash(null);
    setIsImpersonating(false);
    if (stash) {
      authenticate(stash.token, stash.user);
      return stash.user;
    }
    logout();
    return null;
  };

  // Called with the fresh row returned by PATCH /api/profiles/me so an
  // edit (avatar, title, skills/bio) is reflected everywhere that reads
  // currentUser (sidebar, header) without a full page reload/refetch.
  // hydrateFramePreference re-applies the local showVerificationFrame
  // choice, since the server response has no column for it and would
  // otherwise silently drop it on every profile save.
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(hydrateFramePreference(updatedUser));
  };

  // The "Stealth Mode" toggle itself — gated by the caller (only rendered/
  // enabled when the user is actually verified, see WorkerProfile.jsx and
  // BusinessCompany.jsx's edit sections) so there's nothing to toggle for
  // someone who hasn't earned a frame yet.
  const setShowVerificationFrame = (enabled) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      window.localStorage.setItem(FRAME_PREF_PREFIX + prev.id, String(enabled));
      return { ...prev, showVerificationFrame: enabled };
    });
  };

  const value = useMemo(
    () => ({
      currentUser,
      status,
      authenticate,
      logout,
      updateCurrentUser,
      setShowVerificationFrame,
      isImpersonating,
      startImpersonation,
      endImpersonation,
    }),
    [currentUser, status, isImpersonating]
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
