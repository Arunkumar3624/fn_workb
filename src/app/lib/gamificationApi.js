import { apiFetch } from "./apiClient";

// The caller's own real balance + earn history (ledger_events) — never
// returns a fee percentage, only a tier name (see gamification.controller.js's
// getLedger and MASTER_ECONOMY_PLAN.md Part 5a).
export function getLedger() {
  return apiFetch("/api/gamification/ledger");
}
