import { apiFetch } from "./apiClient";

// Real purchase — debits the caller's own Bridge Tokens/Corporate Credits
// balance (server resolves cost from perksCatalog.js, never trusts the
// client) and persists a redemption row. See perks.controller.js.
export function purchasePerk({ perkId, tierId }) {
  return apiFetch("/api/perks/purchase", { method: "POST", body: { perkId, tierId } });
}

export function getPerkPurchases() {
  return apiFetch("/api/perks/purchases");
}
