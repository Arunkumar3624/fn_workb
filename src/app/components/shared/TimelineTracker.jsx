import { PROJECT_STATUS_FLOW, PROJECT_STATUS_META } from "../../utils/projectStatus";

const TONE_FILLED = {
  emerald: "bg-emerald-500 border-emerald-500",
  blue: "bg-blue-500 border-blue-500",
  amber: "bg-amber-500 border-amber-500",
};

// Slim (32px) stepper pinned directly under IdentityHeader on any surface
// tracking a funded, in-flight project. Renders nothing until funds are
// actually secured — pre-payment threads have no status to show yet.
export default function TimelineTracker({ status }) {
  const activeIdx = PROJECT_STATUS_FLOW.indexOf(status);
  if (activeIdx === -1) return null;

  return (
    <div className="flex-shrink-0 flex items-center gap-1.5 bg-slate-50 border-b border-slate-200 px-3 h-8 overflow-hidden sm:gap-2 sm:px-6">
      {PROJECT_STATUS_FLOW.map((step, idx) => {
        const meta = PROJECT_STATUS_META[step];
        const isDone = idx < activeIdx;
        const isCurrent = idx === activeIdx;
        return (
          <div key={step} className="flex items-center gap-1.5 flex-1 last:flex-none sm:gap-2">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className={`h-2.5 w-2.5 rounded-full border-2 transition-colors ${
                  isDone || isCurrent ? TONE_FILLED[meta.tone] : "bg-white border-slate-300"
                } ${isCurrent ? "animate-pulse" : ""}`}
              />
              <span
                className={`hidden text-[10px] font-bold whitespace-nowrap sm:inline ${
                  isCurrent ? "text-slate-700" : isDone ? "text-slate-400" : "text-slate-300"
                }`}
              >
                {meta.shortLabel}
              </span>
            </div>
            {idx < PROJECT_STATUS_FLOW.length - 1 && (
              <div className={`h-px flex-1 ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
