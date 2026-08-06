import { motion } from "motion/react";
import { getMilestoneByLevel, getRankTier, SHAPE_CLIP_PATHS } from "../../lib/milestones";

// The small rank-badge overlay shown on an avatar for a worker's pinned
// milestone (WorkerMilestones.jsx's "pin one badge" action) — same
// per-tier shape + metal-frame gradient + label system as the full Badges
// grid (lib/milestones.js's getRankTier — one source of truth, so this can
// never disagree with the grid), just scaled down to a single frame-colored
// shape (no room for the nested gem layer at this size). Shared by
// Avatar.jsx and every worker-profile/business-card call site so they can
// never visually drift apart. The Level 200 "Heroic" cap keeps its
// pulsating glow even at this size — the one grid effect that reads fine
// when small (rings/shimmer/sparkle/wings don't, so those stay grid-only).
export default function PinnedBadgeOverlay({ level, size = "h-5 w-5", iconSize = "h-2.5 w-2.5", className = "" }) {
  const milestone = level ? getMilestoneByLevel(level) : null;
  if (!milestone) return null;

  const rank = getRankTier(milestone.level);
  const Icon = milestone.icon;

  return (
    <motion.span
      title={`${milestone.name} — Level ${milestone.level} (${rank.label})`}
      className={`absolute flex flex-shrink-0 items-center justify-center border-b-2 border-r-2 shadow-md ${rank.frameEdge} bg-gradient-to-br ${rank.frame} ${size} ${className}`}
      style={{ clipPath: SHAPE_CLIP_PATHS[rank.shape] }}
      animate={
        rank.isMaxRank
          ? {
              boxShadow: [
                "0 0 6px 1px rgba(34,211,238,0.5)",
                "0 0 12px 3px rgba(168,85,247,0.65)",
                "0 0 6px 1px rgba(34,211,238,0.5)",
              ],
            }
          : undefined
      }
      transition={rank.isMaxRank ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <Icon className={`${iconSize} text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`} strokeWidth={2.5} />
    </motion.span>
  );
}
