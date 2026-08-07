import { useState } from "react";
import { Info, X } from "lucide-react";

// A real "how does this work" popover — every WorkBridge economy number
// (Behavior Score, XP, Tokens) was visible somewhere already, but nowhere
// explained WHY it moves. Click-to-toggle rather than hover-only so it
// works on touch devices; `text-current` on the trigger so it reads
// correctly against both a light card and a dark glass HUD pill.
export default function EconomyInfoTooltip({ title, children, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`How ${title} works`}
        aria-expanded={open}
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-current opacity-60 transition-opacity hover:opacity-100"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          {/* Click-outside catcher — plain div, not a button, so it never
              steals tab order or reads as an interactive element itself. */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-xl">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-slate-300 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-xs leading-5 text-slate-600">{children}</div>
          </div>
        </>
      )}
    </span>
  );
}
