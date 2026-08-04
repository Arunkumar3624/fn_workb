import { useEffect, useState } from "react";
import { HeroSection } from "../components/common/HeroSection";
import { TrustedPartners } from "../components/landing/TrustedPartners";
import { PillarSections } from "../components/common/PillarSections";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getFeaturedReviews } from "../lib/reviewsApi";
import { getInitials } from "../utils/formValidation";
import { ApiError } from "../lib/apiClient";

const ROLE_LABEL = { business: "Verified Business", worker: "Top Rated Freelancer" };

function WallOfLoveCard({ review }) {
  const roleLabel = ROLE_LABEL[review.reviewer_role] ?? review.reviewer_role;
  return (
    <div className="mb-6 break-inside-avoid rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm leading-relaxed text-slate-700">“{review.feedback}”</p>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1B3FAB] text-xs font-bold text-white">
          {getInitials(review.reviewer_name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#0F172A]">{review.reviewer_name}</p>
          <p className="truncate text-xs text-slate-500">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}

// Real reviews, pulled live (GET /api/reviews/featured) from completed,
// escrow-protected projects — nothing here is written by us. Migrated in
// from the old standalone /testimonials page onto the homepage.
function WallOfLove() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getFeaturedReviews()
      .then((data) => setReviews(data.reviews))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !loadError && reviews.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2
            className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Trusted by ambitious teams and top talent
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
            Join the businesses and freelancers already scaling on WorkBridge.
          </p>
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {loadError}
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 md:columns-3">
              {reviews.map((review) => (
                <WallOfLoveCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ onSelect }) {
  useDocumentTitle("WorkBridge — Freelance Marketplace for Verified Talent");

  return (
    <>
      <HeroSection onSelect={onSelect} />
      <TrustedPartners />
      {/* showLink={false} forces all section CTAs to call onSelect() → /auth directly */}
      <PillarSections onSelect={onSelect} showLink={false} />
      <WallOfLove />
    </>
  );
}
