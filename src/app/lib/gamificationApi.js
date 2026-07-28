import { apiFetch } from "./apiClient";

// The caller's own real balance + earn history (ledger_events) — never
// returns a fee percentage, only a tier name (see gamification.controller.js's
// getLedger and MASTER_ECONOMY_PLAN.md Part 5a).
export function getLedger() {
  return apiFetch("/api/gamification/ledger");
}

// Business-only Enterprise Partner Tier — a separate track from the
// worker XP/Level system, tiered by real total spend, never XP.
export function getBusinessTier() {
  return apiFetch("/api/gamification/business-tier");
}
