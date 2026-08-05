import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Award,
  Crown,
  Gem,
  Link2,
  Loader2,
  Lock,
  Medal,
  Pin,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

// MASTER_ECONOMY_PLAN.md Part 6's Worker Reward Roadmap, verbatim — this
// page's whole purpose is to show real progress (currentLevel from the
// actual gamification_config-backed ledger) against the documented plan,
// not to claim these rewards are all functioning yet. Only the Level/Tier
// badge boundaries (50/100/150/200, via getTierData) and the backend-only
// fee lookup are real today; everything else here (priority boosts,
// featured placement, mentor status, etc.) is still just the design's
// intent, called out explicitly below. Icon per milestone is presentation
// only — picked to match the reward's theme, not stored anywhere.
export const MILESTONES = [
  { level: 5, name: "First Steps", reward: 'Highlighted profile intro', icon: Sparkles },
  { level: 10, name: "Rising Talent", reward: 'Custom profile accent border color', icon: Star },
  { level: 20, name: "Momentum", reward: "Small priority boost in the matching algorithm", icon: TrendingUp },
  { level: 25, name: "Verified Momentum", reward: 'Portfolio showcase reel; "Trending Talent" carousel eligibility', icon: Trophy, major: true },
  { level: 30, name: "Spotlight", reward: 'Pin one "spotlight project" at the top of your profile', icon: Pin },
  { level: 40, name: "Early Access", reward: "Early-access window to new job postings", icon: Zap },
  { level: 50, name: "Established Professional", reward: "Silver-Tier Fee Discount; dedicated support queue", icon: ShieldCheck, major: true },
  { level: 60, name: "Signature Banner", reward: "Custom animated profile banner", icon: Award },
  { level: 75, name: "Direct Line", reward: "Limited direct proposals without an open posting", icon: Send },
  { level: 100, name: "Top Rated", reward: "Gold-Tier Fee Discount; gold-ring verification upgrade", icon: Crown, major: true },
  { level: 125, name: "Mentor", reward: "Paid mentorship sessions to newer workers", icon: Users },
  { level: 150, name: "Elite Circle", reward: "Platinum-Tier Fee Discount; priority dispute-resolution queue", icon: Gem, major: true },
  { level: 175, name: "Vanity URL", reward: "Custom vanity profile URL slug", icon: Link2 },
  { level: 200, name: "Legend of WorkBridge", reward: "Permanent hall-of-fame badge; Diamond-Tier Fee Discount for life", icon: Medal, major: true },
];

const TABS = ["All", "Unlocked", "Locked"];

function BadgeMedal({ milestone, achieved, isNext, index }) {
  const Icon = milestone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className={`relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 ${
        achieved
          ? "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md"
          : "border-slate-100 bg-slate-50/60"
      }`}
    >
      {isNext && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF6B35] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
          Next
        </span>
      )}

      <div className="relative">
        {isNext && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#FF6B35]"
            initial={{ scale: 1, opacity: 0.45 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {/* The "medal" — a metallic-gradient disc (gold for major
            milestones, silver otherwise), CSS-only so it never depends on
            an external image asset. Locked ones desaturate to slate. */}
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${
            !achieved
              ? "bg-slate-200"
              : milestone.major
                ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-[0_6px_16px_-4px_rgba(217,119,6,0.55)]"
                : "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[0_6px_16px_-4px_rgba(100,116,139,0.45)]"
          }`}
        >
          <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 ${achieved ? "border-white/50" : "border-white/30"}`}>
            {achieved ? (
              <Icon className={`h-6 w-6 ${milestone.major ? "text-amber-900" : "text-slate-700"}`} />
            ) : (
              <Lock className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
        {/* Ribbon tails — two small trapezoids under the medal disc. */}
        <div className="absolute left-1/2 top-[52px] flex -translate-x-1/2 gap-1">
          <div className={`h-3 w-3 -skew-x-6 ${achieved ? (milestone.major ? "bg-amber-600" : "bg-slate-500") : "bg-slate-300"}`} />
          <div className={`h-3 w-3 skew-x-6 ${achieved ? (milestone.major ? "bg-amber-700" : "bg-slate-600") : "bg-slate-300"}`} />
        </div>
      </div>

      <div className="mt-1.5">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${achieved ? "text-slate-400" : "text-slate-300"}`}>
          Level {milestone.level}
        </p>
        <p className={`mt-0.5 text-sm font-extrabold leading-tight ${achieved ? "text-slate-900" : "text-slate-400"}`}>
          {milestone.name}
        </p>
      </div>

      <p className={`text-[11px] leading-4 ${achieved ? "text-slate-500" : "text-slate-300"}`}>{milestone.reward}</p>
    </motion.div>
  );
}

export default function WorkerMilestones({ embedded = false }) {
  useDocumentTitle("Badges — WorkBridge");
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

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
          yet — only your Tier badge (Silver/Gold/Platinum/Diamond) and its backend fee tier are live today.
        </span>
      </div>

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
