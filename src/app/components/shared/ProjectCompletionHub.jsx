import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, History, Zap } from "lucide-react";
import ReviewModule from "./ReviewModule";

function formatINR(amount) {
  if (!amount) return null;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

const COPY = {
  worker: {
    subheadline: (amount) =>
      amount
        ? `${formatINR(amount)} has been released to your wallet. You're a pro.`
        : "Funds have been released to your wallet. You're a pro.",
    ratingTitle: (name) => `Rate Your Experience with ${name}`,
    feedbackPlaceholder: "How was communication, clarity, and payment speed?",
  },
  business: {
    subheadline: (amount, name) =>
      amount ? `${formatINR(amount)} has been released to ${name}.` : `Funds have been released to ${name}.`,
    ratingTitle: (name) => `Rate ${name}'s Work`,
    feedbackPlaceholder: "How was quality, communication, and turnaround?",
  },
};

// Replaces the entire chat surface once a project reaches COMPLETED — the
// Victory & Growth moment: confirm the payout, capture a rating, and (for
// businesses) hand a one-click way to bring the same worker back.
export default function ProjectCompletionHub({
  perspective,
  counterpartName: rawCounterpartName,
  amount,
  review,
  onSubmit,
  onRehire,
  onViewHistory,
}) {
  // A dummy/incompletely-linked project can come back with no joined name —
  // never show the literal word "undefined" to a user.
  const counterpartName = rawCounterpartName || "this freelancer";
  const [localReview, setLocalReview] = useState(review ?? null);
  const [rehired, setRehired] = useState(false);
  const copy = COPY[perspective];

  useEffect(() => {
    setLocalReview(review ?? null);
  }, [review]);

  // Rating and rehiring are independent decisions — a business should be able
  // to leave a rating without committing to rehire, or rehire without having
  // rated yet. Each button below only ever drives its own action.
  const handleSaveReview = async (nextRating, nextFeedback) => {
    const savedReview = await onSubmit?.(nextRating, nextFeedback);
    setLocalReview(savedReview ?? { ...(localReview ?? {}), rating: nextRating, feedback: nextFeedback });
  };

  const handleRehireClick = () => {
    if (!onRehire) return;
    setRehired(true);
    onRehire();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] backdrop-blur-xl"
      >
        {/* Success Hero */}
        <div className="flex flex-col items-center px-5 py-10 text-center sm:px-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_40px_-8px_rgba(16,185,129,0.55)]">
              <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2
            className="mt-6 text-2xl font-black tracking-tight text-[#0F172A]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Project Completed Successfully!
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            {copy.subheadline(amount, counterpartName)}
          </p>
        </div>

        {/* Evaluation Card */}
        <div className="border-t border-slate-100 px-5 py-8 sm:px-12">
          <ReviewModule
            title={copy.ratingTitle(counterpartName)}
            helperText={
              localReview
                ? "Your review is saved. You can edit it without triggering duplicate actions."
                : "Leave a rating without committing to rehire."
            }
            initialRating={localReview?.rating ?? 0}
            initialFeedback={localReview?.feedback ?? ""}
            onSave={handleSaveReview}
          />
        </div>

        {/* Retention Engine — business only. Rating and rehiring are two
            separate calls to action; neither one gates the other. */}
        {perspective === "business" && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-8 sm:px-12">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Rehire for a new task</h4>
                  <p className="mt-1 text-sm text-slate-500">Choose this separately if you want to work together again.</p>
                </div>
              </div>

              <button
                onClick={handleRehireClick}
                disabled={rehired}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] py-4 text-base font-black text-white shadow-[0_10px_30px_-8px_rgba(255,107,53,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e55a2b] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Zap className="h-5 w-5" />
                {rehired ? "Invitation Sent!" : `Rehire ${counterpartName} for a New Task`}
              </button>
            </div>

            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600"
              >
                <History className="h-3.5 w-3.5" />
                View Full Project History
              </button>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
