// Project Lifecycle FSM — the single vocabulary both chat surfaces (Worker
// Negotiation Inbox, Business Inbox) and IdentityHeader read from, so a
// project's status can only ever be one of these four steps, in this order.

export const PROJECT_STATUS_FLOW = [
  "INVITED",
  "ACCEPTED",
  "FUNDS_SECURED",
  "WORK_IN_PROGRESS",
  "FILES_SUBMITTED",
  "COMPLETED",
];

export const PROJECT_STATUS_META = {
  // triggeredBy: who causes entry INTO this state.
  // actionBy/nextActionLabel: who clicks the Primary Action *while in* this
  // state, and what it's labeled — that click causes the next transition.
  INVITED: {
    label: "Invitation Sent",
    shortLabel: "Invited",
    tone: "slate",
    triggeredBy: "business",
    actionBy: "worker",
    nextActionLabel: "Accept Invitation",
  },
  ACCEPTED: {
    label: "Accepted — Awaiting Funds",
    shortLabel: "Accepted",
    tone: "blue",
    triggeredBy: "worker",
    actionBy: "business",
    nextActionLabel: "Secure Funds",
  },
  FUNDS_SECURED: {
    label: "Funds Secured",
    shortLabel: "Secured",
    tone: "emerald",
    triggeredBy: "business",
    actionBy: "worker",
    nextActionLabel: "Start Work",
  },
  WORK_IN_PROGRESS: {
    label: "In Progress",
    shortLabel: "In Progress",
    tone: "blue",
    triggeredBy: "worker",
    actionBy: "worker",
    nextActionLabel: "Submit Work",
  },
  FILES_SUBMITTED: {
    label: "Approval Pending",
    shortLabel: "Pending",
    tone: "amber",
    triggeredBy: "worker",
    actionBy: "business",
    nextActionLabel: "Approve & Release",
  },
  COMPLETED: {
    label: "Completed",
    shortLabel: "Completed",
    tone: "emerald",
    triggeredBy: "business",
    actionBy: null,
    nextActionLabel: null,
  },
  // Terminal states reachable from any non-completed status (see backend's
  // canTransition) — not part of PROJECT_STATUS_FLOW's happy-path sequence,
  // but real values every status-label lookup needs to handle.
  DISPUTED: {
    label: "Disputed",
    shortLabel: "Disputed",
    tone: "red",
    triggeredBy: "either party",
    actionBy: "admin",
    nextActionLabel: null,
  },
  CANCELLED: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    tone: "slate",
    triggeredBy: "either party",
    actionBy: null,
    nextActionLabel: null,
  },
};

export function nextProjectStatus(currentStatus) {
  const idx = PROJECT_STATUS_FLOW.indexOf(currentStatus);
  if (idx === -1 || idx === PROJECT_STATUS_FLOW.length - 1) return null;
  return PROJECT_STATUS_FLOW[idx + 1];
}

export function makeTimelineEvent(status) {
  return { status, timestamp: new Date().toISOString() };
}

// Platform's cut on every completed project — deducted before funds hit
// the worker's wallet. Kept in one place so the Invoice page, the
// completeProject payout, and any celebration UI agree on the number.
export const PLATFORM_FEE_PCT = 8;

export function parseAmount(value) {
  return Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;
}

export function calculateEarnings(budget) {
  const budgetNum = parseAmount(budget);
  const fee = Math.round(budgetNum * (PLATFORM_FEE_PCT / 100));
  return { budgetNum, fee, earnings: budgetNum - fee };
}
