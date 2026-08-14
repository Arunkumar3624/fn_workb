import { useEffect, useState } from "react";
import { Clock, Sparkles } from "lucide-react";

// Same live-recompute pattern as DeadlineCountdown.jsx, generalized for a
// perk_purchases row instead of a project deadline: no expiresAt at all
// means "active until used" (a one-time perk), not "overdue" — there's no
// red state here, since an expired/consumed purchase is simply excluded
// from the "active" list upstream (perk_purchases.repository.js's
// listActiveForUser) rather than shown crossed-out.
function getRemaining(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "< 1h left";
}

export default function PerkCountdown({ expiresAt }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const interval = setInterval(() => forceTick((n) => n + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
      {expiresAt ? <Clock className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {expiresAt ? `Active · ${getRemaining(expiresAt)}` : "Active"}
    </span>
  );
}
