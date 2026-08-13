// The API Bridge for review submission/display — real POST on a COMPLETED
// project, real public read of a user's received reviews.
import { apiFetch } from "./apiClient";

export function submitReview({ projectId, rating, feedback }) {
  return apiFetch("/api/reviews", { method: "POST", body: { projectId, rating, feedback } });
}

// Edits an already-submitted review — unlike submitReview this can be
// called any number of times, so a rating can be changed after the first
// save instead of being locked in.
export function updateReview({ projectId, rating, feedback }) {
  return apiFetch(`/api/reviews/${projectId}`, { method: "PATCH", body: { rating, feedback } });
}

export function listReviewsFor(userId) {
  return apiFetch(`/api/reviews?revieweeId=${userId}`);
}

export function getFeaturedReviews() {
  return apiFetch("/api/reviews/featured");
}
