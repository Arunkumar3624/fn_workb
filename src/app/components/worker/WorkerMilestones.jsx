import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, Lock, Loader2 } from "lucide-react";
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
// intent, called out explicitly below.
const MILESTONES = [
  { level: 5, reward: '"First Steps" badge; highlighted profile intro' },
  { level: 10, reward: 'Custom profile accent border color; "Rising Talent" tag' },
  { level: 20, reward: "Small priority boost in the matching/recommendation algorithm" },
  { level: 25, reward: '"Verified Momentum" badge; portfolio showcase reel; "Trending Talent" carousel eligibility', major: true },
  { level: 30, reward: 'Pin one "spotlight project" at the top of the profile' },
  { level: 40, reward: "Early-access window to new job postings before the general feed" },
  { level: 50, reward: '"Established Professional" badge; Silver-Tier Fee Discount unlocked; dedicated support queue', major: true },
  { level: 60, reward: "Custom animated profile banner" },
  { level: 75, reward: "Limited direct proposals without an open posting" },
  { level: 100, reward: '"Top Rated" badge; guaranteed weekly featured-talent digest placement; Gold-Tier Fee Discount unlocked; gold-ring verification upgrade', major: true },
  { level: 125, reward: '"Mentor" status — paid mentorship sessions to newer workers' },
  { level: 150, reward: '"Elite Circle" badge; Platinum-Tier Fee Discount unlocked; invite-only high-budget project board; priority dispute-resolution queue', major: true },
  { level: 175, reward: "Custom vanity profile URL slug" },
  { level: 200, reward: '"Legend of WorkBridge" permanent hall-of-fame badge; annual platform-wide spotlight; Diamond-Tier Fee Discount locked in for life', major: true },
];

// A connected path with restraint, not a game board — MASTER_ECONOMY_PLAN.md
// Part 10 is explicit that this system must read as a premium SaaS trust
// signal, not a mobile-game mechanic ("no cheap mobile game aesthetics").
// So: one subtle pulse ring, reserved only for the single next milestone
// (not every unlocked node), reusing the exact ripple pattern
// CelebrationOverlay.jsx already established — not a new "radar ping"
// language, and no animated dashed SVG track.
function MilestoneNode({ milestone, achieved, isNext, align, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className={`relative flex items-center gap-5 ${align === "right" ? "sm:flex-row-reverse" : ""}`}
    >
      <div className="relative flex-shrink-0">
        {isNext && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#FF6B35]"
            initial={{ scale: 1, opacity: 0.45 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <div
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white shadow-sm ${
            achieved ? "bg-[#FF6B35] text-white" : isNext ? "bg-white text-[#FF6B35] ring-2 ring-[#FF6B35]" : "bg-slate-100 text-slate-400"
          }`}
        >
          {achieved ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
      </div>

      <div
        className={`min-w-0 flex-1 rounded-2xl border p-4 transition-colors ${
          achieved
            ? "border-[#FF6B35]/25 bg-[#FFF7F3]"
            : isNext
            ? "border-[#FF6B35]/40 bg-white shadow-[0_8px_24px_-8px_rgba(255,107,53,0.25)]"
            : "border-slate-200 bg-slate-50/80 opacity-80"
        } ${milestone.major ? "ring-1 ring-inset ring-slate-100" : ""}`}
      >
        <p className={`text-sm font-bold ${achieved || isNext ? "text-[#0A1128]" : "text-slate-500"}`}>
          Level {milestone.level}
          {isNext && <span className="ml-2 rounded-full bg-[#FF6B35]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35]">NEXT</span>}
        </p>
        <p className={`mt-1 text-xs leading-5 ${achieved || isNext ? "text-slate-600" : "text-slate-400"}`}>{milestone.reward}</p>
      </div>
    </motion.div>
  );
}

export default function WorkerMilestones() {
  useDocumentTitle("Milestones — WorkBridge");
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
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your progress.");
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

  const currentLevel = ledger.currentLevel;
  const nextMilestone = MILESTONES.find((m) => m.level > currentLevel);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Milestones
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          You're Level {currentLevel} ({ledger.tier}).
          {nextMilestone ? ` ${nextMilestone.level - currentLevel} levels to your next milestone.` : " You've reached every milestone."}
        </p>
      </div>

      <div className="mb-8 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>
          Your level is real. Most rewards below are still the platform's documented plan, not fully wired up
          yet — only your Tier badge (Silver/Gold/Platinum/Diamond) and its backend fee tier are live today.
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-[#FF6B35]/30 via-slate-200 to-slate-200 sm:left-1/2 sm:-translate-x-1/2" />
        <div className="space-y-6">
          {MILESTONES.map((milestone, index) => (
            <MilestoneNode
              key={milestone.level}
              milestone={milestone}
              achieved={currentLevel >= milestone.level}
              isNext={milestone.level === nextMilestone?.level}
              align={index % 2 === 0 ? "left" : "right"}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
