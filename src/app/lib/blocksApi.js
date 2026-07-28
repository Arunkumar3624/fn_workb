// WhatsApp-style blocking — a plain user-to-user relationship (not scoped
// to one project), enforced server-side in messages.controller.js.
import { apiFetch } from "./apiClient";

export function getBlockStatus(userId) {
  return apiFetch(`/api/blocks/${userId}/status`);
}

export function blockUser(userId) {
  return apiFetch(`/api/blocks/${userId}`, { method: "POST" });
}

export function unblockUser(userId) {
  return apiFetch(`/api/blocks/${userId}`, { method: "DELETE" });
}
