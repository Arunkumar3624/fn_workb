// The Job Board's apply/invite/decide step — a candidacy is either a
// worker's application to an OPEN post or a business's direct invite to one
// specific worker on their own OPEN post; source is decided server-side
// from the caller's role, never sent from here.
import { apiFetch } from "./apiClient";

export function applyToProject(projectId, message) {
  return apiFetch(`/api/projects/${projectId}/candidates`, {
    method: "POST",
    body: { message },
  });
}

export function inviteWorkerToProject(projectId, workerId, message) {
  return apiFetch(`/api/projects/${projectId}/candidates`, {
    method: "POST",
    body: { workerId, message },
  });
}

// The business reviewing every applicant/invite on one of their own OPEN posts.
export function listCandidatesForProject(projectId) {
  return apiFetch(`/api/projects/${projectId}/candidates`);
}

// A worker's own applications + invites, decided or not.
export function listMyCandidates() {
  return apiFetch("/api/candidates/mine");
}

export function respondToCandidate(candidateId, accept) {
  return apiFetch(`/api/candidates/${candidateId}`, {
    method: "PATCH",
    body: { accept },
  });
}
