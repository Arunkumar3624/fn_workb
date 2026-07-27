import { useEffect, useState } from "react";
import { AlertCircle, Coins, Loader2, Receipt, Zap } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

// Real event_type values written by ledger_events.repository.js's create()
// callers (currently just projects.controller.js's completeProject) mapped
// to display copy. An unrecognized type falls back to a readable version
// of the raw string rather than breaking, so this never has to be updated
// in lockstep with every future trigger.
const EVENT_LABELS = {
  PROJECT_COMPLETED: "Project Completed",
};

function formatEventLabel(eventType) {
  return EVENT_LABELS[eventType] ?? eventType.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function timeAgo(dateString) {
  const ms = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function WorkerLedger() {
  useDocumentTitle("Ledger — WorkBridge");
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getLedger()
      .then((data) => {
        if (!cancelled) setLedger(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your ledger.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  const earnedThisWeek = ledger.events
    .filter((e) => Date.now() - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, e) => sum + e.token_delta, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Ledger
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your real Bridge Token balance and earn history.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            Bridge Tokens
          </p>
          <p className="mt-1 text-3xl font-black text-[#0A1128]">{ledger.bridgeTokens}</p>
          <p className="mt-1 text-xs text-slate-400">+{earnedThisWeek} earned this week</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Zap className="h-3.5 w-3.5 text-[#FF6B35]" />
            {ledger.tier} Tier · Level {ledger.currentLevel}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-yellow-500 transition-all duration-1000 ease-out"
              style={{ width: `${ledger.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="mb-4 text-sm font-bold text-[#0A1128]">Recent Activity</p>
        {ledger.events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Receipt className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">
              Nothing here yet — complete a project to start earning tokens and XP.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ledger.events.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#0A1128]">{formatEventLabel(event.event_type)}</p>
                  <p className="text-xs text-slate-400">{timeAgo(event.created_at)}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 text-sm font-bold">
                  {event.xp_delta > 0 && <span className="text-[#FF6B35]">+{event.xp_delta} XP</span>}
                  {event.token_delta > 0 && <span className="text-amber-600">+{event.token_delta} 🪙</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
