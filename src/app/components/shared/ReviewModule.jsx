import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Edit3, Save, Star } from "lucide-react";

const STAR_COUNT = 5;

export default function ReviewModule({
  title = "Review",
  helperText = "Share a short rating for this completed project.",
  initialRating = 0,
  initialFeedback = "",
  onSave,
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRating(initialRating);
    setFeedback(initialFeedback);
    setHoverRating(0);
    setIsEditing(false);
    setError("");
  }, [initialRating, initialFeedback]);

  const handleSave = async () => {
    if (rating === 0 || saving) return;

    setSaving(true);
    setError("");
    try {
      await onSave?.(rating, feedback.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err?.message ?? "Could not save this review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <motion.section
      layout
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      transition={{ duration: 0.22, ease: "easeInOut" }}
    >
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{helperText}</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!isEditing ? (
          <motion.div
            key="review-view"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <div className="mt-5 flex items-center gap-1.5" aria-label={`${rating} out of 5 stars`}>
              {Array.from({ length: STAR_COUNT }, (_, index) => {
                const starValue = index + 1;
                return (
                  <Star
                    key={starValue}
                    className={`h-6 w-6 ${
                      starValue <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"
                    }`}
                  />
                );
              })}
              {rating === 0 && <span className="ml-2 text-xs font-semibold text-slate-400">No rating yet</span>}
            </div>

            <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              {feedback || "No feedback added yet."}
            </p>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-1 text-sm font-bold text-slate-400 transition hover:text-slate-700"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="review-edit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <div className="mt-5 flex items-center gap-1.5">
              {Array.from({ length: STAR_COUNT }, (_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starValue)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                    aria-label={`Rate ${starValue} out of 5`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        starValue <= displayRating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              placeholder="Write a short note about communication, quality, and delivery..."
              className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10"
            />

            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}

            <button
              type="button"
              onClick={handleSave}
              disabled={rating === 0 || saving}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-black text-white shadow-sm shadow-orange-200 transition hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
