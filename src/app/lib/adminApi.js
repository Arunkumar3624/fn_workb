// The API Bridge for the admin console's real tabs (Master Dashboard,
// Verification Center, Dispute Resolution) — every call here hits the real
// backend, guarded to role: admin server-side.
import { apiFetch } from "./apiClient";

export function getStats() {
  return apiFetch("/api/admin/stats");
}

export function listVerifications() {
  return apiFetch("/api/admin/verify");
}

export function listAllUsers() {
  return apiFetch("/api/admin/users");
}

export function reviewVerification(id, approved) {
  return apiFetch(`/api/admin/verify/${id}`, { method: "PATCH", body: { approved } });
}

export function listDisputes() {
  return apiFetch("/api/admin/disputes");
}

export function resolveDispute(id, resolution) {
  return apiFetch(`/api/admin/disputes/${id}/resolve`, { method: "POST", body: { resolution } });
}
