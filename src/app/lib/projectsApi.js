// The API Bridge for every real-data project screen (worker + business) —
// every call here hits the real backend (Postgres-backed), never
// PlatformContext mock state.
import { apiFetch } from "./apiClient";

export function listProjects({ role, status, pageSize } = {}) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  if (pageSize) params.set("pageSize", String(pageSize));
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

// The Job Board feed — every OPEN, unassigned post, browsable by any
// worker. Registered server-side before GET /:id so "open" is never
// mistaken for a project id.
export function listOpenProjects() {
  return apiFetch("/api/projects/open");
}

// Business creates a project. Passing workerId keeps the original
// direct-invite behavior (project starts INVITED); omitting it posts an
// OPEN job board listing instead — see BusinessPostJob.jsx.
export function createProject({
  workerId,
  title,
  description,
  budget,
  deadline,
  applicationWindow,
  estimatedDuration,
  minExperienceYears,
  maxExperienceYears,
  educationLevel,
  educationNotes,
  requiredSkills,
}) {
  return apiFetch("/api/projects", {
    method: "POST",
    body: {
      workerId,
      title,
      description,
      budget,
      deadline,
      applicationWindow,
      estimatedDuration,
      minExperienceYears,
      maxExperienceYears,
      educationLevel,
      educationNotes,
      requiredSkills,
    },
  });
}

// Non-terminal FSM steps only — INVITED->ACCEPTED (worker),
// ACCEPTED->WORK_IN_PROGRESS/FILES_SUBMITTED (worker), CANCELLED/DISPUTED.
// FUNDS_SECURED and COMPLETED go through their own atomic endpoints below.
export function updateProjectStatus(id, status, note) {
  return apiFetch(`/api/projects/${id}`, { method: "PATCH", body: note ? { status, note } : { status } });
}

export function secureFunds(id) {
  return apiFetch(`/api/projects/${id}/secure-funds`, { method: "POST" });
}

// Business's "Approve & Release" click — only requests the release
// (FILES_SUBMITTED -> PENDING_RELEASE), no money moves yet. WorkBridge
// staff complete the actual payout from the Admin Panel (see below).
export function requestRelease(id) {
  return apiFetch(`/api/projects/${id}/request-release`, { method: "POST" });
}

// Admin-only — the real payout (PENDING_RELEASE -> COMPLETED).
export function completeProject(id) {
  return apiFetch(`/api/projects/${id}/complete`, { method: "POST" });
}

// The Ghosting Failsafe — instant, business-only, only reachable once
// project.deadline has passed with no delivery. No admin gate, by design.
export function cancelAndRefund(id) {
  return apiFetch(`/api/projects/${id}/cancel-refund`, { method: "POST" });
}
