// The API Bridge for WorkerWallet.jsx — real balance + ledger, real withdraw.
import { apiFetch } from "./apiClient";

export function getWallet() {
  return apiFetch("/api/wallet");
}

export function withdraw({ amount, destination }) {
  return apiFetch("/api/wallet/withdraw", { method: "POST", body: { amount, destination } });
}
