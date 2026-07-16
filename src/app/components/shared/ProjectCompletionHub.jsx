import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, History, Star, Zap } from "lucide-react";

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
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(review?.feedback ?? "");
  const [rehired, setRehired] = useState(false);
  const copy = COPY[perspective];
  const submitted = Boolean(review);

  useEffect(() => {
    if (review) {
      setRating(review.rating ?? 0);
      setFeedback(review.feedback ?? "");
    } else {
      setRating(0);
      setFeedback("");
    }
    setHoverRating(0);
  }, [review?.rating, review?.feedback]);

  // Rating and rehiring are independent decisions — a business should be able
  // to leave a rating without committing to rehire, or rehire without having
  // rated yet. Each button below only ever drives its own action.
  const handleSubmitReview = () => {
    if (!submitted && rating > 0) {
      onSubmit(rating, feedback.trim());
    }
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{copy.ratingTitle(counterpartName)}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {submitted
                    ? "Your rating is saved. You can still rehire them separately if you want."
                    : "Leave a rating without committing to rehire."}
                </p>
              </div>
              {submitted && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Rated
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={submitted}
                  onMouseEnter={() => !submitted && setHoverRating(n)}
                  onMouseLeave={() => !submitted && setHoverRating(0)}
                  onClick={() => !submitted && setRating(n)}
                  aria-label={`Rate ${n} out of 5`}
                  className="flex h-11 w-11 items-center justify-center transition-transform disabled:cursor-default enabled:hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      n <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={submitted}
              placeholder={copy.feedbackPlaceholder}
              rows={3}
              className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 transition-colors focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 disabled:bg-slate-100 disabled:text-slate-500"
            />

            {!submitted ? (
              <button
                onClick={handleSubmitReview}
                disabled={rating === 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Submit Rating
              </button>
            ) : (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Review submitted — thanks for the feedback
              </p>
            )}
          </div>
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

        {/* Worker perspective: submit-only, no rehire engine */}
        {perspective === "worker" && !submitted && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-12">
            <button
              onClick={() => rating > 0 && onSubmit(rating, feedback.trim())}
              disabled={rating === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Submit Rating
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
