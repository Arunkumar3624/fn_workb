// One continuous chat thread per project — invite through completion — that
// replaced the fake seeded conversations previously local to
// WorkerNegotiationInbox.jsx / BusinessNegotiationHub.jsx. Attachments go
// through the same Trust Checker moderation queue as submissionsApi.js.
import { apiFetch } from "./apiClient";

export function listMessages(projectId) {
  return apiFetch(`/api/projects/${projectId}/messages`);
}

export function sendMessage(projectId, body) {
  return apiFetch(`/api/projects/${projectId}/messages`, {
    method: "POST",
    body: { body },
  });
}

export function sendLinkMessage({ projectId, url, caption }) {
  return apiFetch(`/api/projects/${projectId}/messages/attachment`, {
    method: "POST",
    body: { type: "link", url, caption },
  });
}

export function sendImageMessage({ projectId, imageData, caption }) {
  return apiFetch(`/api/projects/${projectId}/messages/attachment`, {
    method: "POST",
    body: { type: "image", imageData, caption },
  });
}
