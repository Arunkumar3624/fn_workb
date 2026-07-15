// The API Bridge for BusinessProjects.jsx — every call here hits the real
// backend (Postgres-backed), not PlatformContext mock state.
import { apiFetch } from "./apiClient";

export function listBusinessProjects() {
  return apiFetch("/api/projects?role=business", { role: "business" });
}

export function completeProject(id) {
  return apiFetch(`/api/projects/${id}/complete`, { method: "POST", role: "business" });
}
