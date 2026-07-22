// GET /api/profiles/:id and /api/profiles?role= are the two unguarded
// routes in the API — public_user_profiles has no email/phone columns at
// all, so no auth/token is needed for either.
import { apiFetch, getDevBypassPublicProfile } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function getPublicProfile(userId) {
  // DEV BYPASS: avoid live backend calls while using dev_bypass_token_123.
  const devProfile = getDevBypassPublicProfile(userId);
  if (devProfile) return devProfile;

  const res = await fetch(`${API_URL}/api/profiles/${userId}`);
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error?.message ?? `Request failed (${res.status}).`);
  }
  return payload?.data;
}

// BusinessWorkers.jsx's real browse-workers listing.
export function listWorkers() {
  return apiFetch("/api/profiles?role=worker");
}

// The caller's own profile edit — avatar upload, title, phone, and a shallow
// profile-JSONB patch (skills/rate/bio). Guarded server-side to self only.
export function updateOwnProfile({ avatarUrl, title, phone, profilePatch }) {
  return apiFetch("/api/profiles/me", {
    method: "PATCH",
    body: { avatarUrl, title, phone, profilePatch },
  });
}
