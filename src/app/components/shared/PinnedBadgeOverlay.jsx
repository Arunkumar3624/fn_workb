import { getMilestoneByLevel, getShapeTier, SHAPE_CLIP_PATHS } from "../../lib/milestones";

// The small rank-badge overlay shown on an avatar for a worker's pinned
// milestone (WorkerMilestones.jsx's "pin one badge" action) — the exact
// same shield/hexagon/star/diamond shape + gradient system as the full
// Badges grid, just scaled down, so it reads as a real rank icon (like a
// competitive-game rank badge) instead of a plain recolored dot. Shared by
// Avatar.jsx and every worker-profile/business-card call site so they can
// never visually drift apart.
export default function PinnedBadgeOverlay({ level, size = "h-5 w-5", iconSize = "h-2.5 w-2.5", className = "" }) {
  const milestone = level ? getMilestoneByLevel(level) : null;
  if (!milestone) return null;

  const shapeTier = getShapeTier(milestone.level);
  const Icon = milestone.icon;

  return (
    <span
      title={`${milestone.name} — Level ${milestone.level} (${shapeTier.name})`}
      className={`absolute flex flex-shrink-0 items-center justify-center border-b-2 border-r-2 ${shapeTier.darkEdge} bg-gradient-to-br ${shapeTier.grad} shadow-md ${size} ${className}`}
      style={{ clipPath: SHAPE_CLIP_PATHS[shapeTier.shape] }}
    >
      <Icon className={`${iconSize} text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`} strokeWidth={2.5} />
    </span>
  );
}
