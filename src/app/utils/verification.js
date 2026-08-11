// The "Verification Frame" — a real, glowing ring wrapper for any verified
// user's avatar (Profile, Dashboard header, Sidebar), replacing the old
// tiny-badge-only treatment. Applied wherever a call site has a REAL
// verified flag (currentUser.verified / isVerified) — never on mock/preview
// data (e.g. BusinessCompany.jsx's still-local-only company logo, which
// already labels itself "(Preview)").
export function verifiedRingClass(isVerified, size = "md") {
  const ring = size === "sm" ? "ring-2" : "ring-4";
  return isVerified
    ? `${ring} ring-[#FF6B35] shadow-[0_0_16px_rgba(255,107,53,0.5)]`
    : `${ring} ring-white dark:ring-slate-800`;
}
