import { useId } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { getMilestoneByLevel, getRankTier, RANK_SHAPES, WING_SHAPES } from "../../lib/milestones";

const SIZE_PX = { sm: 40, md: 64, lg: 96, xl: 140 };
const ICON_RATIO = 0.34;

// A real "competitive gaming rank" badge — <svg> with a multi-stop
// <linearGradient> per tier (Bronze/Silver/Gold/Diamond), a genuinely
// different silhouette per tier (RANK_SHAPES in lib/milestones.js), wings
// from Gold up, and an infinite idle-float + pulsing glow (Framer Motion) —
// the same visual language real ladders like Free Fire/Mobile Legends use.
// One component, one `size` token (sm/md/lg/xl), used everywhere a badge
// appears — the full Badges grid, avatar overlays, the profile page — so
// they can never visually drift out of sync with each other again.
export default function RankBadge({ level, achieved = true, size = "md", className = "" }) {
  const gradId = useId();
  const milestone = level ? getMilestoneByLevel(level) : null;
  if (!milestone) return null;

  const rank = getRankTier(milestone.level);
  const shape = RANK_SHAPES[rank.shape];
  const Icon = milestone.icon;
  const boxPx = SIZE_PX[size] ?? SIZE_PX.md;
  // Wings extend the silhouette from -50..150 instead of 0..100 — render at
  // 1.7x the box width so the core shape doesn't have to shrink to fit them.
  const svgPx = rank.wings ? Math.round(boxPx * 1.7) : boxPx;
  const viewBox = rank.wings ? "-50 0 200 100" : "0 0 100 100";
  const iconPx = Math.round(boxPx * ICON_RATIO);
  const fill = achieved ? `url(#${gradId})` : "#475569";
  const stroke = achieved ? rank.stroke : "#64748B";

  const shapeEl =
    shape.kind === "polygon" ? (
      <>
        <polygon points={shape.points} transform="translate(3,4)" fill="rgba(0,0,0,0.35)" />
        <polygon points={shape.points} fill={fill} stroke={stroke} strokeWidth="2.5" />
      </>
    ) : (
      <>
        <path d={shape.d} transform="translate(3,4)" fill="rgba(0,0,0,0.35)" />
        <path d={shape.d} fill={fill} stroke={stroke} strokeWidth="2.5" />
      </>
    );

  return (
    <motion.div
      className={`relative inline-flex flex-shrink-0 items-center justify-center ${className}`}
      style={{ width: svgPx, height: boxPx }}
      animate={
        achieved
          ? {
              y: [0, -4, 0],
              filter: [
                `drop-shadow(0px 0px 4px rgba(${rank.glowRgb},0.45))`,
                `drop-shadow(0px 0px 14px rgba(${rank.glowRgb},0.85))`,
                `drop-shadow(0px 0px 4px rgba(${rank.glowRgb},0.45))`,
              ],
            }
          : undefined
      }
      transition={achieved ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : undefined}
    >
      <svg width={svgPx} height={boxPx} viewBox={viewBox} title={`${milestone.name} — Level ${milestone.level} (${rank.label})`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {rank.stops.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        {rank.wings && (
          <>
            <polygon points={WING_SHAPES.left} fill={fill} stroke={stroke} strokeWidth="2" opacity="0.95" />
            <polygon points={WING_SHAPES.right} fill={fill} stroke={stroke} strokeWidth="2" opacity="0.95" />
          </>
        )}
        {shapeEl}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {achieved ? (
          <Icon width={iconPx} height={iconPx} className="text-white" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.45))" }} />
        ) : (
          <Lock width={iconPx * 0.85} height={iconPx * 0.85} className="text-slate-300" />
        )}
      </span>
    </motion.div>
  );
}
