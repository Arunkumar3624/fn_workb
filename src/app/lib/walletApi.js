// The API Bridge for WorkerWallet.jsx — real balance + ledger, real withdraw.
import { apiFetch } from "./apiClient";

export function getWallet() {
  return apiFetch("/api/wallet");
}

// Only ever requests a withdrawal now — wallet_balance is debited
// immediately, but the money doesn't actually reach payoutDetails until
// WorkBridge staff resolve it from the Admin Panel's Withdrawals tab.
export function withdraw({ amount, payoutMethod, payoutDetails }) {
  return apiFetch("/api/wallet/withdraw", { method: "POST", body: { amount, payoutMethod, payoutDetails } });
}

export function listWithdrawals() {
  return apiFetch("/api/wallet/withdrawals");
}
