/**
 * WorkBridge Dynamic Point Matrix
 * ────────────────────────────────────────────────────────────────────────
 * Fairness engine that converts a job's budget tier + urgency into a
 * "Potential Points" reward, then scales the points a worker actually
 * receives by the star rating the business leaves once funds are released.
 *
 * This keeps the leaderboard honest: a 2-week React dashboard build is
 * worth far more than a 10-minute background-removal gig, and a worker
 * cannot farm points from easy tasks or bad-faith submissions.
 */

/** Base points awarded per WorkBridge budget tier. */
const BUDGET_TIER_BASE_POINTS = [
  { max: 2000, base: 25 },
  { max: 10000, base: 75 },
  { max: 50000, base: 200 },
  { max: Infinity, base: 500 },
];

/** Multiplier applied when a job is marked Urgent (24h delivery window). */
const URGENT_MULTIPLIER = 1.5;

/**
 * Calculates the "Potential Points" a worker can earn for a job, shown up
 * front on the job card/feed so workers can weigh reward against effort
 * before applying.
 *
 * @param {number} budget - The job's budget in rupees (e.g. 15000).
 * @param {boolean} isUrgent - Whether the job is flagged Urgent (24h turnaround).
 * @returns {number} The final integer potential points for this job.
 */
export function calculatePotentialPoints(budget, isUrgent) {
  const tier = BUDGET_TIER_BASE_POINTS.find(({ max }) => budget <= max);
  const base = tier ? tier.base : BUDGET_TIER_BASE_POINTS.at(-1).base;

  return isUrgent ? Math.round(base * URGENT_MULTIPLIER) : base;
}

/**
 * Calculates the points a worker actually banks once the business releases
 * funds and leaves a star rating. This is the Fairness Guarantee — points
 * are never awarded just for submitting files, only for rated, approved work.
 *
 * @param {number} potentialPoints - The value returned by calculatePotentialPoints for this job.
 * @param {1 | 2 | 3 | 4 | 5} starRating - The rating the business left on release.
 * @returns {number} The final points to add to (or subtract from) the worker's profile.
 */
export function calculateFinalEarnedPoints(potentialPoints, starRating) {
  switch (starRating) {
    case 5:
      return potentialPoints + 10; // Bonus for perfection
    case 4:
      return Math.round(potentialPoints * 0.8);
    case 3:
      return Math.round(potentialPoints * 0.5);
    case 2:
      return 0;
    case 1:
      return -50; // Penalty for failing the client
    default:
      return 0;
  }
}
