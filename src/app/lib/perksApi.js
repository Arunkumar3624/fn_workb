import { apiFetch } from "./apiClient";

// Real purchase — debits the caller's own Bridge Tokens/Corporate Credits
// balance (server resolves cost from perksCatalog.js, never trusts the
// client) and persists a redemption row. See perks.controller.js. targetId
// is required for perks that boost a specific thing (a job post, an
// application, a dispute, a withdrawal) — perkTargets.js validates it
// server-side; omit it for account-wide perks (featured-employer,
// profile-audit).
export function purchasePerk({ perkId, tierId, targetId }) {
  return apiFetch("/api/perks/purchase", { method: "POST", body: { perkId, tierId, targetId } });
}

export function getPerkPurchases() {
  return apiFetch("/api/perks/purchases");
}

// The caller's currently-active (not expired, not consumed) purchases —
// the shop's "Active Perks" strip.
export function getActivePerkPurchases() {
  return apiFetch("/api/perks/active");
}

// The worker's own Skill Bridge Profile Audit request history — real
// admin review queue behind the "profile-audit" perk purchase.
export function getMyProfileAudits() {
  return apiFetch("/api/perks/profile-audits");
}
