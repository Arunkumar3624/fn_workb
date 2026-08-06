import { useId } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { getMilestoneByLevel, getRankTier, ROSETTE_POINTS, RIBBON_SHAPES } from "../../lib/milestones";

const SIZE_PX = { xs: 22, sm: 36, md: 56, lg: 92, xl: 132 };
const ICON_RATIO = 0.34;

// A classic medal — one consistent scalloped-rosette shape throughout (not
// a different silhouette per tier), a solid inner face, and a ribbon tail
// on the top two tiers. Real <svg> with a multi-stop <linearGradient> per
// tier (Bronze/Silver/Gold/Diamond) — same gradient drives the outer ring,
// inner face, AND ribbon, so it reads as one solid medal, not mismatched
// parts. Infinite idle-float + pulsing glow (Framer Motion). One
// component, one `size` token (xs/sm/md/lg/xl), used everywhere a badge
// appears — the full Badges grid, avatar overlays, the profile page.
//
// The glow is a separate, statically-blurred layer with only its OPACITY
// animated — animating the CSS `filter` property directly on the same
// element being transformed (translateY) is what made an earlier version
// look blurry/soft, since the browser has to re-rasterize the whole
// filtered layer every frame. Keeping the glow on its own layer means the
// actual badge SVG stays crisp throughout.
//
// `compact` (avatar overlays) suppresses the ribbon tail — at small sizes
// it made the badge taller than the avatar it sits on and overlapped the
// photo, the same "not placed neatly" problem wings caused before. It only
// renders in the full grid / larger contexts, where there's room.
export default function RankBadge({ level, achieved = true, size = "md", compact = false, className = "" }) {
  const gradId = useId();
  const milestone = level ? getMilestoneByLevel(level) : null;
  if (!milestone) return null;

  const rank = getRankTier(milestone.level);
  const showRibbon = rank.ribbon && !compact;
  const Icon = milestone.icon;
  const boxPx = SIZE_PX[size] ?? SIZE_PX.md;
  // The ribbon extends below y=100 — render taller so it doesn't get
  // squeezed into the same box the rosette alone would use.
  const svgH = showRibbon ? Math.round(boxPx * 1.32) : boxPx;
  const viewBox = showRibbon ? "0 0 100 132" : "0 0 100 100";
  const iconPx = Math.round(boxPx * ICON_RATIO);
  const fill = achieved ? `url(#${gradId})` : "#475569";
  const stroke = achieved ? rank.stroke : "#64748B";
  // The inner face stays the SAME fixed navy for every badge — only the
  // outer ring/ribbon change color by tier — so the collection reads as
  // one consistent medal design, not a differently-styled badge per level.
  const faceFill = achieved ? "#1E293B" : "#3F4A5A";
  const faceStroke = achieved ? "#64748B" : "#5B6472";

  return (
    <motion.div
      className={`relative inline-flex flex-shrink-0 items-start justify-center ${className}`}
      style={{ width: boxPx, height: svgH }}
      animate={achieved ? { y: [0, -3, 0] } : undefined}
      transition={achieved ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : undefined}
    >
      {achieved && (
        <motion.span
          aria-hidden="true"
          className="absolute left-0 top-0 rounded-full blur-md"
          style={{ width: boxPx, height: boxPx, background: `radial-gradient(circle, rgba(${rank.glowRgb},0.7) 0%, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
      )}
      <svg width={boxPx} height={svgH} viewBox={viewBox} className="relative">
        <title>{`${milestone.name} — Level ${milestone.level} (${rank.label})`}</title>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {rank.stops.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        </defs>

        {/* Ribbon legs rotate outward from their shared attachment point
            (50,94) into a natural V-splay — two straight parallel strips
            read as stiff/artificial. */}
        {showRibbon && (
          <>
            <polygon points={RIBBON_SHAPES.left} fill={fill} stroke={stroke} strokeWidth="1.5" transform="rotate(-16 50 94)" />
            <polygon points={RIBBON_SHAPES.right} fill={fill} stroke={stroke} strokeWidth="1.5" opacity="0.82" transform="rotate(16 50 94)" />
          </>
        )}

        {/* Shadow disc — a slight dark offset behind the rosette for depth. */}
        <polygon points={ROSETTE_POINTS} transform="translate(2,3)" fill="rgba(0,0,0,0.3)" />
        {/* The scalloped outer ring — the real "award medal" edge; this is
            the ONLY part that changes color by tier. */}
        <polygon points={ROSETTE_POINTS} fill={fill} stroke={stroke} strokeWidth="2.5" />
        {/* The inner face — a fixed navy disc, same on every badge
            regardless of tier, with a bezel ring between it and the
            scalloped edge so the two read as one solid medal. */}
        <circle cx="50" cy="50" r="33" fill={faceFill} stroke={faceStroke} strokeWidth="2" />
      </svg>
      <span className="absolute inset-x-0 top-0 flex items-center justify-center" style={{ height: boxPx }}>
        {achieved ? (
          <Icon width={iconPx} height={iconPx} className="text-white" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }} />
        ) : (
          <Lock width={iconPx * 0.85} height={iconPx * 0.85} className="text-slate-300" />
        )}
      </span>
    </motion.div>
  );
}
