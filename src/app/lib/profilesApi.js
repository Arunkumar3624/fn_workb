// GET /api/profiles/:id is the one unguarded route in the API — public_user_
// profiles has no email/phone columns at all, so no auth/token is needed.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function getPublicProfile(userId) {
  const res = await fetch(`${API_URL}/api/profiles/${userId}`);
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error?.message ?? `Request failed (${res.status}).`);
  }
  return payload?.data;
}
