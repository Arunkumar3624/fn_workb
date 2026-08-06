import {
  Award,
  Crown,
  Gem,
  Link2,
  Medal,
  Pin,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

// MASTER_ECONOMY_PLAN.md Part 6's Worker Reward Roadmap, verbatim — shared
// between WorkerMilestones.jsx (the full badge grid) and Avatar.jsx (the
// small pinned-badge overlay) so both always agree on which level maps to
// which icon/name, rather than keeping two lists in sync by hand. Mirrors
// backend/src/utils/gamification.js's MILESTONE_LEVELS exactly.
export const MILESTONES = [
  { level: 5, name: "First Steps", reward: 'Highlighted profile intro', icon: Sparkles, color: "cyan" },
  { level: 10, name: "Rising Talent", reward: 'Custom profile accent border color', icon: Star, color: "indigo" },
  { level: 20, name: "Momentum", reward: "Small priority boost in the matching algorithm", icon: TrendingUp, color: "blue" },
  { level: 25, name: "Verified Momentum", reward: 'Portfolio showcase reel; "Trending Talent" carousel eligibility', icon: Trophy, major: true },
  { level: 30, name: "Spotlight", reward: 'Pin one "spotlight project" at the top of your profile', icon: Pin, color: "rose" },
  { level: 40, name: "Early Access", reward: "Early-access window to new job postings", icon: Zap, color: "violet" },
  { level: 50, name: "Established Professional", reward: "Silver-Tier Fee Discount; dedicated support queue", icon: ShieldCheck, major: true },
  { level: 60, name: "Signature Banner", reward: "Custom animated profile banner", icon: Award, color: "sky" },
  { level: 75, name: "Direct Line", reward: "Limited direct proposals without an open posting", icon: Send, color: "emerald" },
  { level: 100, name: "Top Rated", reward: "Gold-Tier Fee Discount; gold-ring verification upgrade", icon: Crown, major: true },
  { level: 125, name: "Mentor", reward: "Paid mentorship sessions to newer workers", icon: Users, color: "fuchsia" },
  { level: 150, name: "Elite Circle", reward: "Platinum-Tier Fee Discount; priority dispute-resolution queue", icon: Gem, major: true },
  { level: 175, name: "Vanity URL", reward: "Custom vanity profile URL slug", icon: Link2, color: "teal" },
  { level: 200, name: "Legend of WorkBridge", reward: "Permanent hall-of-fame badge; Diamond-Tier Fee Discount for life", icon: Medal, major: true },
];

// Non-major badges get a distinct hue per milestone instead of uniform
// silver, so the collection reads as genuinely varied — major (tier)
// milestones stay gold since that gold really maps to a real fee-tier
// upgrade and shouldn't be diluted by the per-badge palette.
export const BADGE_THEMES = {
  cyan: { grad: "from-cyan-300 via-cyan-400 to-cyan-600", shadow: "shadow-[0_6px_16px_-4px_rgba(8,145,178,0.45)]", icon: "text-cyan-900", ring: "ring-cyan-500", ribbon: ["bg-cyan-600", "bg-cyan-700"] },
  indigo: { grad: "from-indigo-300 via-indigo-400 to-indigo-600", shadow: "shadow-[0_6px_16px_-4px_rgba(79,70,229,0.45)]", icon: "text-indigo-900", ring: "ring-indigo-500", ribbon: ["bg-indigo-600", "bg-indigo-700"] },
  blue: { grad: "from-blue-300 via-blue-400 to-blue-600", shadow: "shadow-[0_6px_16px_-4px_rgba(37,99,235,0.45)]", icon: "text-blue-900", ring: "ring-blue-500", ribbon: ["bg-blue-600", "bg-blue-700"] },
  rose: { grad: "from-rose-300 via-rose-400 to-rose-600", shadow: "shadow-[0_6px_16px_-4px_rgba(225,29,72,0.45)]", icon: "text-rose-900", ring: "ring-rose-500", ribbon: ["bg-rose-600", "bg-rose-700"] },
  violet: { grad: "from-violet-300 via-violet-400 to-violet-600", shadow: "shadow-[0_6px_16px_-4px_rgba(124,58,237,0.45)]", icon: "text-violet-900", ring: "ring-violet-500", ribbon: ["bg-violet-600", "bg-violet-700"] },
  sky: { grad: "from-sky-300 via-sky-400 to-sky-600", shadow: "shadow-[0_6px_16px_-4px_rgba(2,132,199,0.45)]", icon: "text-sky-900", ring: "ring-sky-500", ribbon: ["bg-sky-600", "bg-sky-700"] },
  emerald: { grad: "from-emerald-300 via-emerald-400 to-emerald-600", shadow: "shadow-[0_6px_16px_-4px_rgba(5,150,105,0.45)]", icon: "text-emerald-900", ring: "ring-emerald-500", ribbon: ["bg-emerald-600", "bg-emerald-700"] },
  fuchsia: { grad: "from-fuchsia-300 via-fuchsia-400 to-fuchsia-600", shadow: "shadow-[0_6px_16px_-4px_rgba(192,38,211,0.45)]", icon: "text-fuchsia-900", ring: "ring-fuchsia-500", ribbon: ["bg-fuchsia-600", "bg-fuchsia-700"] },
  teal: { grad: "from-teal-300 via-teal-400 to-teal-600", shadow: "shadow-[0_6px_16px_-4px_rgba(13,148,136,0.45)]", icon: "text-teal-900", ring: "ring-teal-500", ribbon: ["bg-teal-600", "bg-teal-700"] },
};

export function getMilestoneByLevel(level) {
  return MILESTONES.find((m) => m.level === level) ?? null;
}

// A "competitive gaming rank" system modeled on real mobile-game ladders
// (Mobile Legends/Free Fire) — a genuinely different SILHOUETTE per tier
// (not one shape recolored), each with an escalating METAL FRAME (bronze ->
// silver -> gold -> diamond) and wings on the top tier. Every shape is 5+
// sided on purpose — no triangles/quadrilaterals, which read as too plain/
// generic for a "rank" silhouette at badge scale. One function computes
// the shape, rank name, and frame together so they can never disagree.
function scallopClipPath(teeth = 16, outerR = 50, innerR = 41) {
  const total = teeth * 2;
  const points = [];
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = (50 + r * Math.cos(angle)).toFixed(2);
    const y = (50 + r * Math.sin(angle)).toFixed(2);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
}

export const SHAPE_CLIP_PATHS = {
  // Shield — 6 points.
  shield: "polygon(50% 0%, 90% 12%, 90% 55%, 50% 100%, 10% 55%, 10% 12%)",
  // Flat hexagon — 6 points.
  hexagon: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  // Spiked crest/star — 32 points (scallopClipPath's default).
  star: scallopClipPath(),
  // Cut-gem crystal — 5 points, replaces a plain 4-point diamond.
  crystal: "polygon(50% 0%, 85% 30%, 70% 100%, 30% 100%, 15% 30%)",
};

// A single wing "feather" — mirrored (scaleX(-1)) for the opposite side.
export const WING_CLIP_PATH = "polygon(0% 50%, 100% 0%, 78% 30%, 100% 38%, 70% 50%, 100% 62%, 78% 70%, 100% 100%)";

const RANK_TIERS = [
  { min: 0, name: "Bronze", shape: "shield", frame: "from-orange-300 via-amber-600 to-orange-800", frameEdge: "border-orange-950/60" },
  { min: 50, name: "Silver", shape: "hexagon", frame: "from-slate-100 via-slate-300 to-slate-500", frameEdge: "border-slate-600/60" },
  { min: 100, name: "Gold", shape: "star", frame: "from-amber-200 via-yellow-400 to-amber-600", frameEdge: "border-amber-900/60" },
  { min: 150, name: "Diamond", shape: "crystal", frame: "from-sky-100 via-cyan-300 to-blue-500", frameEdge: "border-blue-950/60" },
];
const ROMAN = ["I", "II", "III", "IV", "V"];
const GLOW_BY_TIER_INDEX = [
  "shadow-[0_4px_10px_-2px_rgba(15,23,42,0.32)]",
  "shadow-[0_7px_16px_-2px_rgba(100,116,139,0.42)]",
  "shadow-[0_9px_20px_-2px_rgba(217,119,6,0.5)]",
  "shadow-[0_12px_26px_-2px_rgba(56,189,248,0.55)]",
];

export function getRankTier(level) {
  let tierIndex = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (level >= RANK_TIERS[i].min) tierIndex = i;
  }
  const tier = RANK_TIERS[tierIndex];
  const isMaxRank = level >= 200;
  // Roman-numeral sub-rank, one step every 10 levels within the tier — same
  // pattern real ladders use (Bronze I..V, Silver I..V, ...). The absolute
  // Level 200 cap gets the unique label "Heroic" instead of "Diamond V" —
  // it's the single hard prestige ceiling, not just another sub-rank.
  const subIndex = Math.min(5, Math.floor((level - tier.min) / 10) + 1); // 1-5

  return {
    shape: tier.shape,
    frame: tier.frame,
    frameEdge: tier.frameEdge,
    label: isMaxRank ? "Heroic" : `${tier.name} ${ROMAN[subIndex - 1]}`,
    isMaxRank,
    wings: tierIndex >= 3, // Diamond tier (Level 150+) and up only
    // Decorative complexity escalates across the FULL 1-200 range, not just
    // within one tier, so a fresh Diamond I doesn't look plainer than a
    // maxed-out Gold V.
    rings: 1 + tierIndex,
    shimmer: level >= 60,
    sparkle: level >= 120,
    glow: isMaxRank ? GLOW_BY_TIER_INDEX[3] : GLOW_BY_TIER_INDEX[tierIndex],
  };
}
