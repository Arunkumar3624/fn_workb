// The "Verification Frame" system — real, glowing ring treatments for a
// verified user's avatar, replacing the old tiny-badge-only treatment.
// Four variants, matching the four real tiers in VerificationFeesTable.jsx:
//
//   emerald ("ID Verified — Trust Guard")   — Worker ID Verified, currentUser.verified
//   glass   ("Company Verified — Minimalist Pro") — Business Verified, isVerified
//   gold    ("Elite — Gold Standard")       — Full Trust Frame (₹699) — PREVIEW ONLY,
//                                              no real per-user "bought full trust" flag
//                                              exists yet, so this never renders on a
//                                              live avatar, only in the pricing table.
//   orange  ("Enterprise — Signature Glow") — spare/default, brand-primary fallback.
//
// Applied wherever a call site has a REAL verified flag — never on mock/
// preview data (e.g. BusinessCompany.jsx's still-local-only company logo,
// which already labels itself "(Preview)").
const VARIANTS = {
  emerald: "ring-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15),0_0_16px_rgba(16,185,129,0.45)]",
  glass: "ring-slate-200 dark:ring-slate-300/60 shadow-[0_0_16px_rgba(226,232,240,0.4)]",
  gold: "ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.55)]",
  orange: "ring-[#FF6B35] shadow-[0_0_16px_rgba(255,107,53,0.5)]",
};

export function verifiedRingClass(isVerified, size = "md", variant = "orange") {
  const ring = size === "sm" ? "ring-2" : "ring-4";
  if (!isVerified) return `${ring} ring-white dark:ring-slate-800`;
  return `${ring} ${VARIANTS[variant] ?? VARIANTS.orange}`;
}
