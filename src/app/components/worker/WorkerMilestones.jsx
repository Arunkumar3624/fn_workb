import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Check, Loader2, Lock, Pin, PinOff } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { pinBadge } from "../../lib/profilesApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { MILESTONES, BADGE_THEMES } from "../../lib/milestones";

// MASTER_ECONOMY_PLAN.md Part 6's Worker Reward Roadmap, verbatim (see
// lib/milestones.js for the actual MILESTONES/BADGE_THEMES data, shared
// with Avatar.jsx's pinned-badge overlay). Only the Level/Tier badge
// boundaries (50/100/150/200, via getTierData) and the backend-only fee
// lookup are real today; everything else here (priority boosts, featured
// placement, mentor status, etc.) is still just the design's intent,
// called out explicitly below.
export { MILESTONES };

const TABS = ["All", "Unlocked", "Locked"];

// A real scalloped rosette outline (the classic "award ribbon" edge), built
// once as a clip-path polygon rather than an image asset — alternates
// between an outer and inner radius around the circle to cut the pointed
// teeth, same trick real CSS rosette badges use.
function scallopClipPath(teeth = 16, outerR = 50, innerR = 41) {
  const total = teeth * 2;
  const points = [];
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = (50 + r * Math.cos(angle)).toFixed(2);
    const y = (50 + r * Math.sin(angle)).toFixed(2);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
}
const SCALLOP_CLIP_PATH = scallopClipPath();
const RIBBON_CLIP_PATH = "polygon(0% 0%, 100% 0%, 100% 72%, 50% 100%, 0% 72%)";

function BadgeMedal({ milestone, achieved, isNext, index, pinned, pinning, onTogglePin }) {
  const Icon = milestone.icon;
  const theme = BADGE_THEMES[milestone.color];
  const ringGrad = !achieved
    ? "bg-slate-300"
    : milestone.major
      ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600"
      : `bg-gradient-to-br ${theme.grad}`;
  const ribbonColors = !achieved ? ["bg-slate-300", "bg-slate-400"] : milestone.major ? ["bg-amber-500", "bg-amber-600"] : theme.ribbon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className={`relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 ${
        pinned
          ? "border-[#FF6B35]/40 bg-orange-50/40 shadow-sm hover:-translate-y-1 hover:shadow-md"
          : achieved
            ? "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md"
            : "border-slate-100 bg-slate-50/60"
      }`}
    >
      {isNext && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF6B35] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
          Next
        </span>
      )}

      {/* Pin-to-profile — exactly ONE badge at a time, unlike a 3-badge
          loadout; clicking the currently-pinned badge unpins it. */}
      {achieved && (
        <button
          type="button"
          onClick={onTogglePin}
          disabled={pinning}
          title={pinned ? "Unpin from profile" : "Show this badge on your profile avatar"}
          className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors disabled:opacity-60 ${
            pinned
              ? "border-[#FF6B35] bg-[#FF6B35] text-white"
              : "border-slate-200 bg-white text-slate-400 hover:border-[#FF6B35] hover:text-[#FF6B35]"
          }`}
        >
          {pinning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : pinned ? (
            <PinOff className="h-3.5 w-3.5" />
          ) : (
            <Pin className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      <div className="relative pb-2">
        {isNext && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#FF6B35]"
            initial={{ scale: 1, opacity: 0.45 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Ribbon tails sit behind the rosette disc, V-cut like a real
            award ribbon — colored per milestone so the collection reads as
            genuinely varied, not one repeated silver medal. */}
        <div className="absolute left-1/2 top-9 z-0 flex -translate-x-1/2 gap-1">
          <div className={`h-6 w-4 -rotate-6 ${ribbonColors[0]}`} style={{ clipPath: RIBBON_CLIP_PATH }} />
          <div className={`h-6 w-4 rotate-6 ${ribbonColors[1]}`} style={{ clipPath: RIBBON_CLIP_PATH }} />
        </div>

        {/* The rosette itself — a scalloped colored disc (gold for major
            tier milestones, a distinct hue per badge otherwise) with a
            glossy medallion center, CSS-only so it never depends on an
            external image asset. Locked ones desaturate to slate. */}
        <div
          className={`relative z-10 flex h-16 w-16 items-center justify-center shadow-[0_4px_10px_-2px_rgba(15,23,42,0.35)] ${ringGrad}`}
          style={{ clipPath: SCALLOP_CLIP_PATH }}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-inner ${
              achieved ? "bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200" : "bg-slate-100"
            }`}
          >
            {achieved ? (
              <Icon className={`h-5 w-5 ${milestone.major ? "text-amber-700" : theme.icon}`} />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-1.5">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${achieved ? "text-slate-400" : "text-slate-300"}`}>
          Level {milestone.level}
        </p>
        <p className={`mt-0.5 text-sm font-extrabold leading-tight ${achieved ? "text-slate-900" : "text-slate-400"}`}>
          {milestone.name}
        </p>
        {pinned && (
          <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#FF6B35]">
            <Check className="h-3 w-3" /> On your profile
          </p>
        )}
      </div>

      <p className={`text-[11px] leading-4 ${achieved ? "text-slate-500" : "text-slate-300"}`}>{milestone.reward}</p>
    </motion.div>
  );
}

export default function WorkerMilestones({ embedded = false }) {
  useDocumentTitle("Badges — WorkBridge");
  const { currentUser, updateCurrentUser } = useAuth();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [pinningLevel, setPinningLevel] = useState(null);
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getLedger()
      .then((data) => {
        if (!cancelled) setLedger(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your progress.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Optimistic-free: waits for the server's real confirmation (it
  // re-validates current_level itself) before reflecting the change
  // everywhere Avatar.jsx reads currentUser.pinned_milestone_level from.
  const handleTogglePin = async (level) => {
    const nextLevel = currentUser?.pinned_milestone_level === level ? null : level;
    setPinningLevel(level);
    setPinError("");
    try {
      const result = await pinBadge(nextLevel);
      updateCurrentUser({ ...currentUser, pinned_milestone_level: result.pinnedMilestoneLevel });
    } catch (err) {
      setPinError(err instanceof ApiError ? err.message : "Could not update your pinned badge.");
    } finally {
      setPinningLevel(null);
    }
  };

  const currentLevel = ledger?.currentLevel ?? 0;
  const nextMilestone = useMemo(() => MILESTONES.find((m) => m.level > currentLevel), [currentLevel]);
  const unlockedCount = useMemo(() => MILESTONES.filter((m) => currentLevel >= m.level).length, [currentLevel]);

  const visibleMilestones = useMemo(() => {
    if (activeTab === "Unlocked") return MILESTONES.filter((m) => currentLevel >= m.level);
    if (activeTab === "Locked") return MILESTONES.filter((m) => currentLevel < m.level);
    return MILESTONES;
  }, [activeTab, currentLevel]);

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

  return (
    <div className={embedded ? "" : "mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10"}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {!embedded && (
            <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Badges
            </h1>
          )}
          <p className={embedded ? "text-sm text-slate-500" : "mt-1 text-sm text-slate-500"}>
            {unlockedCount} of {MILESTONES.length} earned — Level {currentLevel} ({ledger.tier}).
            {nextMilestone
              ? ` ${nextMilestone.level - currentLevel} level${nextMilestone.level - currentLevel === 1 ? "" : "s"} to ${nextMilestone.name}.`
              : " You've earned every badge."}
          </p>
        </div>

        <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                activeTab === t ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t} Badges
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>
          Your level is real. Most rewards below are still the platform's documented plan, not fully wired up
          yet — only your Tier badge (Silver/Gold/Platinum/Diamond) and its backend fee tier are live today. Pin one
          earned badge (top-right pin icon) to show it on your profile avatar — businesses can see it too, once
          your profile has been revealed.
        </span>
      </div>

      {pinError && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{pinError}</span>
        </div>
      )}

      {visibleMilestones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 py-16 text-center text-sm text-slate-400">
          {activeTab === "Unlocked" ? "No badges earned yet — complete jobs to start unlocking them." : "Every badge is unlocked."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visibleMilestones.map((milestone, index) => (
            <BadgeMedal
              key={milestone.level}
              milestone={milestone}
              achieved={currentLevel >= milestone.level}
              isNext={milestone.level === nextMilestone?.level}
              index={index}
              pinned={currentUser?.pinned_milestone_level === milestone.level}
              pinning={pinningLevel === milestone.level}
              onTogglePin={() => handleTogglePin(milestone.level)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
