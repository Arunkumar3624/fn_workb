import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, CheckCircle2, Quote, ShieldCheck, Star, Users } from "lucide-react";
import { getFeaturedReviews } from "../lib/reviewsApi";
import { getInitials } from "../utils/formValidation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../lib/apiClient";

const ROLE_LABEL = { business: "Business Owner", worker: "Freelancer" };

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/70 p-6 text-center shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B35]/10">
        <Icon className="h-5 w-5 text-[#FF6B35]" />
      </div>
      <p className="mt-3 text-2xl font-black text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function ReviewCard({ review }) {
  const roleLabel = ROLE_LABEL[review.reviewer_role] ?? review.reviewer_role;
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
        ))}
      </div>
      <Quote className="mt-4 h-6 w-6 text-slate-200" />
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">{review.feedback}</p>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1B3FAB] text-xs font-bold text-white">
          {getInitials(review.reviewer_name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#0F172A]">{review.reviewer_name}</p>
          <p className="truncate text-xs text-slate-500">
            {roleLabel} · {review.project_title}
          </p>
        </div>
      </div>
    </div>
  );
}

// Real reviews, pulled live (GET /api/reviews/featured) from completed,
// escrow-protected projects — filtered to substantive feedback text so the
// many blank test reviews don't show up, but nothing here is written by
// us. Same for the stats strip: real counts, however small they are today,
// never backfilled with invented numbers (see reviews.repository.js).
export default function TestimonialsPage({ onSelect }) {
  useDocumentTitle("Testimonials — WorkBridge");
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getFeaturedReviews()
      .then((data) => {
        setReviews(data.reviews);
        setStats(data.stats);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F8FAFC]">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur-md sm:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#FF6B35] opacity-20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#1B3FAB] opacity-15 blur-3xl" aria-hidden="true" />
          <div className="relative text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B35]/20 bg-[#FF6B35]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
              Real Reviews
            </span>
            <h1
              className="mt-5 text-4xl font-black tracking-tight text-[#0F172A] sm:text-6xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              What People Say After Working on WorkBridge
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Every review below is real — pulled live from completed, escrow-protected projects on the platform.
              Nothing here is written by our marketing team.
            </p>
          </div>
        </div>
      </section>

      {/* ── Live stats ─────────────────────────────────────────────────── */}
      {stats && (
        <section className="px-4 pb-4 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={CheckCircle2} value={stats.completedProjects} label="Projects Completed" />
            <StatCard icon={Briefcase} value={stats.totalWorkers} label="Freelancers" />
            <StatCard icon={Users} value={stats.totalBusinesses} label="Businesses" />
            <StatCard icon={Star} value={stats.averageRating > 0 ? `${stats.averageRating}/5` : "—"} label="Average Rating" />
          </div>
        </section>
      )}

      {/* ── Reviews grid ───────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {loadError}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 py-16 text-center text-sm text-slate-400">
              No public reviews yet — check back soon as more projects wrap up.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl border border-white/50 bg-white/70 p-10 text-center shadow-sm backdrop-blur-md">
          <ShieldCheck className="h-10 w-10 text-[#1B3FAB]" />
          <h2
            className="text-2xl font-black text-[#0F172A]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ready to be the next one?
          </h2>
          <p className="max-w-md text-sm text-slate-600">
            Post a job or find your next gig — every project is escrow-protected from the first payment.
          </p>
          <button
            onClick={() => onSelect?.("business")}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-8 py-4 text-base font-bold text-white shadow-[0_10px_30px_-8px_rgba(255,107,53,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e55a2b] hover:shadow-xl"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
