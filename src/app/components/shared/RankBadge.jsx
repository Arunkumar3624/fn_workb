import { useId } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { getMilestoneByLevel, getRankTier, RANK_SHAPES, WING_SHAPES } from "../../lib/milestones";

const SIZE_PX = { sm: 36, md: 56, lg: 92, xl: 132 };
const ICON_RATIO = 0.36;

// A real "competitive gaming rank" badge — <svg> with a multi-stop
// <linearGradient> per tier (Bronze/Silver/Gold/Diamond), a genuinely
// different silhouette per tier (RANK_SHAPES in lib/milestones.js), and an
// infinite idle-float + pulsing glow (Framer Motion). One component, one
// `size` token (sm/md/lg/xl), used everywhere a badge appears — the full
// Badges grid, avatar overlays, the profile page — so they can never
// visually drift out of sync with each other again.
//
// `compact` (avatar overlays) suppresses wings — at small sizes the wings
// roughly doubled the badge's footprint and visibly overlapped the
// avatar; they only render in the full grid, where there's room for them.
//
// The glow is a separate, statically-blurred layer with only its OPACITY
// animated — animating the CSS `filter` property directly on the same
// element being transformed (translateY) is what made the badge itself
// look blurry/soft in an earlier version, since the browser has to
// re-rasterize the whole filtered layer every frame. Keeping the glow on
// its own layer means the actual badge SVG stays crisp throughout.
export default function RankBadge({ level, achieved = true, size = "md", compact = false, className = "" }) {
  const gradId = useId();
  const milestone = level ? getMilestoneByLevel(level) : null;
  if (!milestone) return null;

  const rank = getRankTier(milestone.level);
  const shape = RANK_SHAPES[rank.shape];
  const showWings = rank.wings && !compact;
  const Icon = milestone.icon;
  const boxPx = SIZE_PX[size] ?? SIZE_PX.md;
  const svgPx = showWings ? Math.round(boxPx * 1.5) : boxPx;
  const viewBox = showWings ? "-45 0 190 100" : "0 0 100 100";
  const iconPx = Math.round(boxPx * ICON_RATIO);
  const fill = achieved ? `url(#${gradId})` : "#475569";
  const stroke = achieved ? rank.stroke : "#64748B";

  const shapeEl =
    shape.kind === "circle" ? (
      <>
        <circle cx="52" cy="53" r="45" fill="rgba(0,0,0,0.32)" />
        <circle cx="50" cy="50" r="45" fill={fill} stroke={stroke} strokeWidth="3" />
      </>
    ) : shape.kind === "polygon" ? (
      <>
        <polygon points={shape.points} transform="translate(2,3)" fill="rgba(0,0,0,0.32)" />
        <polygon points={shape.points} fill={fill} stroke={stroke} strokeWidth="3" />
      </>
    ) : (
      <>
        <path d={shape.d} transform="translate(2,3)" fill="rgba(0,0,0,0.32)" />
        <path d={shape.d} fill={fill} stroke={stroke} strokeWidth="3" />
      </>
    );

  return (
    <motion.div
      className={`relative inline-flex flex-shrink-0 items-center justify-center ${className}`}
      style={{ width: svgPx, height: boxPx }}
      animate={achieved ? { y: [0, -3, 0] } : undefined}
      transition={achieved ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : undefined}
    >
      {achieved && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: `radial-gradient(circle, rgba(${rank.glowRgb},0.7) 0%, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
      )}
      <svg width={svgPx} height={boxPx} viewBox={viewBox} className="relative">
        <title>{`${milestone.name} — Level ${milestone.level} (${rank.label})`}</title>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {rank.stops.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        {showWings && (
          <>
            <polygon points={WING_SHAPES.left} fill={fill} stroke={stroke} strokeWidth="2" />
            <polygon points={WING_SHAPES.right} fill={fill} stroke={stroke} strokeWidth="2" />
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
