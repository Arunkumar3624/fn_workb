import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// A real, live countdown against project.deadline (the DELIVERY date —
// distinct from application_deadline, see migrations/013_job_timelines.sql).
// Recomputes every minute rather than once on mount, so a page left open
// doesn't show a stale "2 days left" after those two days actually pass.
function getRemaining(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  const overdue = ms < 0;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  let label;
  if (days > 0) label = `${days}d ${hours}h`;
  else if (hours > 0) label = `${hours}h`;
  else label = "< 1h";

  return { overdue, label };
}

export default function DeadlineCountdown({ deadline, status }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline || status === "COMPLETED" || status === "CANCELLED") return null;

  const { overdue, label } = getRemaining(deadline);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        overdue ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
      }`}
    >
      <Clock className="h-3 w-3" />
      {overdue ? `Overdue by ${label}` : `${label} left`}
    </span>
  );
}
