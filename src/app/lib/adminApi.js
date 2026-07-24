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

export function listTransactions() {
  return apiFetch("/api/admin/transactions");
}

// Security Monitor — blocked_message_attempts is the only record of a
// contact-info send that got hard-blocked (see backend's
// messages.controller.js); the message itself is never stored elsewhere.
export function listBlockedAttempts() {
  return apiFetch("/api/admin/blocked-attempts");
}

// action: "redact_and_send" (editedBody required) | "ban" | "warn" | "dismiss"
export function resolveBlockedAttempt(id, action, { editedBody, note } = {}) {
  return apiFetch(`/api/admin/blocked-attempts/${id}`, {
    method: "PATCH",
    body: { action, editedBody, note },
  });
}

// Message Monitor — full-text search over every real chat message, the
// manual complement to blocked-attempts (which only shows what the
// contact-info filter auto-caught).
export function searchMessages(search) {
  const params = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return apiFetch(`/api/admin/messages${params}`);
}

// Moderates the sender of a specific message found via Message Monitor —
// the manual counterpart to resolveBlockedAttempt's actions, for anything
// that slipped past the automated contact-info filter.
// action: "ban" | "unban" | "warn" | "deduct_points" (points required for deduct_points)
export function moderateMessageSender(messageId, action, { points } = {}) {
  return apiFetch(`/api/admin/messages/${messageId}/moderate`, {
    method: "PATCH",
    body: { action, points },
  });
}
