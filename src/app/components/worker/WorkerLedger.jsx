import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Coins, Gift, Loader2, Receipt, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

// Real event_type values written by ledger_events.repository.js's create()
// callers (currently projects.controller.js's completeProject and
// scripts/grant-test-gamification-credits.js) mapped to display copy +
// icon. An unrecognized type falls back to a readable version of the raw
// string and a neutral icon rather than breaking, so this never has to be
// updated in lockstep with every future trigger — RESILIENCE_BONUS (Idea.md's
// Span mechanic) isn't wired into any real code path yet, but is mapped
// here already so the day it is, this list needs zero changes.
const EVENT_META = {
  PROJECT_COMPLETED: { label: "Project Completed", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
  PROJECT_COMPLETED_NO_DISPUTE: { label: "Project Completed (No Dispute)", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
  RESILIENCE_BONUS: { label: "Resilience Bonus", icon: ShieldCheck, tone: "text-[#FF6B35] bg-orange-50" },
  TEST_GRANT: { label: "Test Grant", icon: Gift, tone: "text-slate-500 bg-slate-100" },
};

function getEventMeta(eventType) {
  return (
    EVENT_META[eventType] ?? {
      label: eventType.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      icon: Receipt,
      tone: "text-slate-500 bg-slate-100",
    }
  );
}

// A restrained count-up — the Shadow Accumulator's balance animating in on
// load, not a slot-machine reel. Skips animation entirely for
// prefers-reduced-motion, matching CelebrationOverlay.jsx's own convention.
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }

    let frameId;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
}

function timeAgo(dateString) {
  const ms = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function WorkerLedger({ embedded = false }) {
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

  // Called unconditionally, before the early loading/error returns below,
  // so hook order never changes between renders — 0 is a safe target while
  // ledger hasn't loaded yet, since these values aren't rendered until it has.
  const displayedTokens = useCountUp(ledger?.bridgeTokens ?? 0);
  const displayedXp = useCountUp(ledger?.xp ?? 0);

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
    <div className={embedded ? "" : "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10"}>
      <div className="mb-6">
        {!embedded && (
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ledger
          </h1>
        )}
        <p className={embedded ? "text-sm text-slate-500" : "mt-1 text-sm text-slate-500"}>
          Your real Bridge Token balance and earn history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            Bridge Tokens
          </p>
          <p className="mt-1 text-3xl font-black text-[#0A1128]">{displayedTokens}</p>
          <p className="mt-1 text-xs text-slate-400">+{earnedThisWeek} earned this week</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Zap className="h-3.5 w-3.5 text-[#FF6B35]" />
            {ledger.tier} Tier · Level {ledger.currentLevel}
          </p>
          <p className="mt-1 text-3xl font-black text-[#0A1128]">
            {displayedXp} <span className="text-sm font-bold text-slate-400">XP</span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${ledger.progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
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
            {ledger.events.map((event, index) => {
              const meta = getEventMeta(event.event_type);
              const Icon = meta.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1128]">{meta.label}</p>
                      <p className="text-xs text-slate-400">{timeAgo(event.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3 text-sm font-bold">
                    {event.xp_delta > 0 && <span className="text-[#FF6B35]">+{event.xp_delta} XP</span>}
                    {event.token_delta > 0 && <span className="text-amber-600">+{event.token_delta} 🪙</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
