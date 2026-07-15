const TIER_STYLES = {
  Micro: "bg-slate-100 text-slate-600",
  Standard: "bg-blue-50 text-blue-700",
  Professional: "bg-purple-50 text-purple-700",
  Enterprise: "bg-amber-50 text-amber-700",
};

export default function TierBadge({ tier }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${TIER_STYLES[tier] ?? "bg-slate-100 text-slate-600"}`}>
      {tier}
    </span>
  );
}
