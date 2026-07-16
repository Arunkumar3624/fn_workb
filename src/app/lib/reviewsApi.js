// The API Bridge for review submission/display — real POST on a COMPLETED
// project, real public read of a user's received reviews.
import { apiFetch } from "./apiClient";

export function submitReview({ projectId, rating, feedback }) {
  return apiFetch("/api/reviews", { method: "POST", body: { projectId, rating, feedback } });
}

export function listReviewsFor(userId) {
  return apiFetch(`/api/reviews?revieweeId=${userId}`);
}
