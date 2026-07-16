// The API Bridge for every real-data project screen (worker + business) —
// every call here hits the real backend (Postgres-backed), never
// PlatformContext mock state.
import { apiFetch } from "./apiClient";

export function listProjects({ role, status } = {}) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiFetch(`/api/projects${qs ? `?${qs}` : ""}`);
}

// Kept as a thin wrapper — BusinessProjects.jsx's existing call site.
export function listBusinessProjects() {
  return listProjects({ role: "business" });
}

export function getProject(id) {
  return apiFetch(`/api/projects/${id}`);
}

// Business creates a project by inviting a specific worker — the real
// equivalent of BusinessWorkers.jsx's "Invite" and BusinessPostJob.jsx's
// submit.
export function createProject({ workerId, title, description, budget, deadline }) {
  return apiFetch("/api/projects", {
    method: "POST",
    body: { workerId, title, description, budget, deadline },
  });
}

// Non-terminal FSM steps only — INVITED->ACCEPTED (worker),
// ACCEPTED->WORK_IN_PROGRESS/FILES_SUBMITTED (worker), CANCELLED/DISPUTED.
// FUNDS_SECURED and COMPLETED go through their own atomic endpoints below.
export function updateProjectStatus(id, status) {
  return apiFetch(`/api/projects/${id}`, { method: "PATCH", body: { status } });
}

export function secureFunds(id) {
  return apiFetch(`/api/projects/${id}/secure-funds`, { method: "POST" });
}

export function completeProject(id) {
  return apiFetch(`/api/projects/${id}/complete`, { method: "POST" });
}
