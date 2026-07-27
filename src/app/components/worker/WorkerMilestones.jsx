import { useEffect, useState } from "react";
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

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>
          Your level is real. Most rewards below are still the platform's documented plan, not fully wired up
          yet — only your Tier badge (Silver/Gold/Platinum/Diamond) and its backend fee tier are live today.
        </span>
      </div>

      <div className="space-y-3">
        {MILESTONES.map((milestone) => {
          const achieved = currentLevel >= milestone.level;
          return (
            <div
              key={milestone.level}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                achieved ? "border-[#FF6B35]/30 bg-[#FFF7F3]" : "border-slate-200 bg-white"
              } ${milestone.major ? "ring-1 ring-inset ring-slate-100" : ""}`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  achieved ? "bg-[#FF6B35] text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {achieved ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${achieved ? "text-[#0A1128]" : "text-slate-500"}`}>
                  Level {milestone.level}
                </p>
                <p className={`mt-0.5 text-xs leading-5 ${achieved ? "text-slate-600" : "text-slate-400"}`}>
                  {milestone.reward}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
