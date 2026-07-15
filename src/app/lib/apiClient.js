// Thin fetch wrapper for the real backend (backend/src/server.js). Currently
// consumed only by BusinessProjects.jsx — every other page still runs on
// PlatformContext mock state (see Frontend/TECH_ROADMAP.md's migration plan).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// DEV-ONLY auth bridge. There is no real login flow yet — AuthPage.jsx is
// UI-only, and backend/src/routes/dev.routes.js only mounts outside
// production. These ids must match real rows in the local Postgres
// instance; swap this whole bridge for a real login flow before this ever
// touches production.
const DEV_USER_IDS = {
  business: "a0000000-0000-0000-0000-00000000000b", // QuickCart Retail
  worker: "a0000000-0000-0000-0000-000000000001", // Priya Sharma
};

const tokenCache = new Map(); // role -> token

async function getDevToken(role) {
  if (tokenCache.has(role)) return tokenCache.get(role);

  const userId = DEV_USER_IDS[role];
  if (!userId) throw new Error(`No dev user id configured for role "${role}".`);

  const res = await fetch(`${API_URL}/api/dev/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    throw new Error("Could not get a dev auth token — is the backend running on :4000?");
  }
  const { data } = await res.json();
  tokenCache.set(role, data.token);
  return data.token;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * apiFetch("/api/projects", { role: "business" })
 * apiFetch(`/api/projects/${id}/complete`, { method: "POST", role: "business" })
 */
export async function apiFetch(path, { method = "GET", role = "business", body } = {}) {
  const token = await getDevToken(role);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network failure (backend down, CORS, offline) — distinct from a
    // well-formed error response, since there's no res.status to report.
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, payload?.error?.message ?? `Request failed (${res.status}).`);
  }

  return payload?.data;
}
