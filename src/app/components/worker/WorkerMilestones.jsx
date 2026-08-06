import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Check, Loader2, Lock, Pin, PinOff, Sparkles } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { pinBadge } from "../../lib/profilesApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { MILESTONES, BADGE_THEMES, getRankTier, SHAPE_CLIP_PATHS, WING_CLIP_PATH } from "../../lib/milestones";

const DEFAULT_GEM_GRAD = "from-blue-400 via-blue-500 to-indigo-600";

// MASTER_ECONOMY_PLAN.md Part 6's Worker Reward Roadmap, verbatim (see
// lib/milestones.js for the actual MILESTONES/BADGE_THEMES data, shared
// with Avatar.jsx's pinned-badge overlay). Only the Level/Tier badge
// boundaries (50/100/150/200, via getTierData) and the backend-only fee
// lookup are real today; everything else here (priority boosts, featured
// placement, mentor status, etc.) is still just the design's intent,
// called out explicitly below.
export { MILESTONES };

const TABS = ["All", "Unlocked", "Locked"];

function BadgeMedal({ milestone, achieved, isNext, index, pinned, pinning, onTogglePin }) {
  const Icon = milestone.icon;
  const theme = BADGE_THEMES[milestone.color];
  // One source of truth for the shape, rank label, AND the metal frame, so
  // they can never disagree (an earlier version computed these separately —
  // Level 60 read "Gold" in text next to a Silver-colored shape). A genuinely
  // different silhouette per tier (Bronze shield, Silver hexagon, Gold
  // spiked crest, Diamond crystal — all 5+ sided on purpose), each gem
  // tinted per-badge for variety, set inside a frame whose metal escalates
  // Bronze -> Silver -> Gold -> Diamond, with wings appearing at Diamond.
  // See lib/milestones.js's getRankTier.
  const rank = getRankTier(milestone.level);
  const shapeClip = SHAPE_CLIP_PATHS[rank.shape];
  const isMaxRank = achieved && rank.isMaxRank;
  const frameGrad = !achieved ? "bg-slate-700" : `bg-gradient-to-br ${rank.frame}`;
  const gemGrad = theme?.grad ?? DEFAULT_GEM_GRAD;
  const glowClass = achieved ? rank.glow : "shadow-[0_4px_10px_-2px_rgba(15,23,42,0.35)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-5 pt-7 text-center transition-all duration-300 ${
        pinned
          ? "border-[#FF6B35] bg-gradient-to-b from-[#2a1608] to-slate-950 shadow-[0_0_0_1px_rgba(255,107,53,0.3)] hover:-translate-y-1"
          : achieved
            ? "border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg hover:-translate-y-1 hover:shadow-2xl"
            : "border-slate-800/60 bg-slate-900/40"
      }`}
    >
      {/* Ambient colored glow behind the badge — this + the dark card (not
          a small icon floating on a plain white card) is what actually
          reads as a "gaming rank" card rather than a generic reward tile. */}
      {achieved && (
        <div
          className={`pointer-events-none absolute left-1/2 top-16 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-30 blur-2xl ${gemGrad}`}
        />
      )}

      {isNext && (
        <span className="absolute -top-0.5 left-1/2 z-20 -translate-x-1/2 rounded-b-lg bg-[#FF6B35] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
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
          className={`absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors disabled:opacity-60 ${
            pinned
              ? "border-[#FF6B35] bg-[#FF6B35] text-white"
              : "border-white/15 bg-white/10 text-slate-300 backdrop-blur-sm hover:border-[#FF6B35] hover:text-[#FF6B35]"
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

      <div className="relative z-10 pb-2">
        {isNext && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#FF6B35]"
            initial={{ scale: 1, opacity: 0.45 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Concentric decorative rings — one extra ring per rank tier,
            biggest badges (Diamond) getting a visibly "thicker" medal than
            a fresh Bronze one, not just a recolor. White on the dark card
            so they read at every rank hue, not just the light ones. */}
        {achieved &&
          Array.from({ length: rank.rings - 1 }).map((_, ringIndex) => (
            <span
              key={ringIndex}
              className="absolute left-1/2 top-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
              style={{
                width: `${88 + ringIndex * 12}px`,
                height: `${88 + ringIndex * 12}px`,
                opacity: 0.22 - ringIndex * 0.05,
              }}
            />
          ))}

        {/* Shimmer sweep — a slowly rotating soft highlight, Level 60+
            only. */}
        {achieved && rank.shimmer && (
          <motion.span
            className="absolute left-1/2 top-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "80px",
              height: "80px",
              background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.6) 8%, transparent 16%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Orbiting sparkle — Level 120+ only. */}
        {achieved && rank.sparkle && (
          <motion.span
            className="absolute left-1/2 top-10 z-20"
            style={{ marginLeft: "28px", marginTop: "-38px" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.span>
        )}

        {/* Wings — Diamond tier (Level 150+) and up only, metallic to match
            the frame, mirrored on each side. */}
        {achieved && rank.wings && (
          <>
            <span
              className={`absolute left-1/2 top-10 z-0 h-9 w-7 -translate-y-1/2 bg-gradient-to-br ${rank.frame}`}
              style={{ clipPath: WING_CLIP_PATH, marginLeft: "-42px", transform: "translateY(-50%) scaleX(-1)" }}
            />
            <span
              className={`absolute left-1/2 top-10 z-0 h-9 w-7 -translate-y-1/2 bg-gradient-to-br ${rank.frame}`}
              style={{ clipPath: WING_CLIP_PATH, marginLeft: "10px" }}
            />
          </>
        )}

        {/* The rank badge — a genuinely different silhouette per tier
            (Bronze shield, Silver hexagon, Gold spiked crest, Diamond
            crystal), set inside a frame whose metal escalates Bronze ->
            Silver -> Gold -> Diamond, same language real mobile-game rank
            ladders use. border-b/border-r in a darker shade fake a 3D bevel
            on the frame; the Level 200 "Heroic" cap additionally breathes
            with a pulsating glow. CSS-only, no image asset. Locked badges
            preview the shape in flat slate. */}
        <motion.div
          className={`relative z-10 flex h-20 w-20 items-center justify-center border-b-[5px] border-r-[5px] ${
            achieved ? rank.frameEdge : "border-slate-800"
          } ${glowClass} ${frameGrad}`}
          style={{ clipPath: shapeClip }}
          animate={
            isMaxRank
              ? {
                  boxShadow: [
                    "0 0 18px 3px rgba(34,211,238,0.5)",
                    "0 0 34px 9px rgba(168,85,247,0.65)",
                    "0 0 18px 3px rgba(34,211,238,0.5)",
                  ],
                }
              : undefined
          }
          transition={isMaxRank ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          {/* The gem — per-badge tinted (BADGE_THEMES), so within one rank
              tier the collection still reads as individually varied. */}
          <div
            className={`relative flex h-14 w-14 items-center justify-center ${
              achieved ? `bg-gradient-to-br ${gemGrad}` : "bg-slate-800"
            }`}
            style={{ clipPath: shapeClip }}
          >
            {achieved && <div className="absolute -inset-y-3 left-[8%] w-1/3 -rotate-12 bg-white/35 blur-[2px]" />}
            {achieved ? (
              <Icon className="relative h-6 w-6 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
            ) : (
              <Lock className="relative h-5 w-5 text-slate-500" />
            )}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${achieved ? "text-slate-400" : "text-slate-600"}`}>
          Level {milestone.level} {achieved && `· ${rank.label}`}
        </p>
        <p className={`mt-0.5 text-sm font-extrabold leading-tight ${achieved ? "text-white" : "text-slate-500"}`}>
          {milestone.name}
        </p>
        {pinned && (
          <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#FF6B35]">
            <Check className="h-3 w-3" /> On your profile
          </p>
        )}
      </div>

      <p className={`relative z-10 text-[11px] leading-4 ${achieved ? "text-slate-400" : "text-slate-600"}`}>{milestone.reward}</p>
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
