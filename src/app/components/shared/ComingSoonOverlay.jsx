import { Clock } from "lucide-react";

// Wraps a real (but not-yet-launchable) section — subscriptions and the
// paid trust-tier upsells both need real payment processing that doesn't
// exist yet (same gap the fake ₹470.82 verification step had). Rather than
// leave them live-looking and clickable with nothing behind the click,
// this blurs the real content and blocks interaction with an honest
// "Coming Soon" message — the moment payment processing is real, deleting
// this wrapper (not the content underneath it) turns it back on.
export default function ComingSoonOverlay({ title = "Coming Soon", message, children }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none select-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-slate-950/60">
        <div className="mx-4 flex max-w-xs flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Clock className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {message ?? "We're finalizing this — it'll be available soon."}
          </p>
        </div>
      </div>
    </div>
  );
}
