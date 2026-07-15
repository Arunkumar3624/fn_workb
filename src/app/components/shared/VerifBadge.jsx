export default function VerifBadge({ tier }) {
  if (tier === "gold")
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
        ★ Gold
      </span>
    );
  if (tier === "blue")
    return (
      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
        ✓ Verified
      </span>
    );
  if (tier === "green")
    return (
      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
        ✓ Trusted
      </span>
    );
  return null;
}
