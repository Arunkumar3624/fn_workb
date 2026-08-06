import RankBadge from "./RankBadge";

// The small rank-badge overlay shown on an avatar for a worker's pinned
// milestone (WorkerMilestones.jsx's "pin one badge" action) — a thin
// positioning wrapper around RankBadge.jsx (the shared shape/gradient/
// glow/float system the full Badges grid uses), so this can never visually
// drift out of sync with the grid. Shared by Avatar.jsx and every
// worker-profile/business-card call site.
export default function PinnedBadgeOverlay({ level, size = "sm", className = "" }) {
  if (!level) return null;

  return (
    <span className={`absolute ${className}`}>
      <RankBadge level={level} achieved size={size} />
    </span>
  );
}
