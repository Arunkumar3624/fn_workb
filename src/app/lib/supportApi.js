// Real-time Customer Care — a worker/business's own conversation with
// WorkBridge staff, and staff's inbox across every conversation.
import { apiFetch } from "./apiClient";

export function getMyThread() {
  return apiFetch("/api/support/thread");
}

export function sendMyMessage(body) {
  return apiFetch("/api/support/thread/messages", { method: "POST", body: { body } });
}

export function listThreadsForAdmin() {
  return apiFetch("/api/support/threads");
}

export function getThreadMessagesForAdmin(threadId) {
  return apiFetch(`/api/support/threads/${threadId}/messages`);
}

export function sendAdminMessage(threadId, body) {
  return apiFetch(`/api/support/threads/${threadId}/messages`, { method: "POST", body: { body } });
}

export function setThreadStatus(threadId, status) {
  return apiFetch(`/api/support/threads/${threadId}`, { method: "PATCH", body: { status } });
}
