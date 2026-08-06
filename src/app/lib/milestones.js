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

export function getMilestoneByLevel(level) {
  return MILESTONES.find((m) => m.level === level) ?? null;
}

// A "competitive gaming rank" system modeled on real mobile-game ladders
// (Mobile Legends/Free Fire) — real <svg> shapes with multi-stop gradient
// defs (not CSS clip-path approximations). Shapes are deliberately simple
// (circle/hexagon/pentagon/shield) rather than many-pointed stars — a
// sharp 8-point "shuriken" reads as noisy/jagged at badge scale and is
// exactly what made an earlier version look bad. Wings only render in
// RankBadge's non-compact mode (the full Badges grid) — at small avatar-
// overlay sizes they roughly doubled the badge's footprint and overlapped
// the avatar, which is what "not placed neatly" meant.
export const RANK_SHAPES = {
  circle: { kind: "circle" },
  hexagon: { kind: "polygon", points: "50,4 93,27 93,73 50,96 7,73 7,27" },
  pentagon: { kind: "polygon", points: "50,4 95,38 78,94 22,94 5,38" },
  shield: { kind: "path", d: "M50 4 L88 18 L88 50 Q88 80 50 97 Q12 80 12 50 L12 18 Z" },
};

// A simple, smooth wing (4 points, not a jagged multi-point zigzag),
// attached at the badge's edge (x=0 left wing, x=100 right) and extending
// outward — RankBadge.jsx widens its viewBox to -45..145 to fit both when
// rank.wings is true.
function wingPoints(side) {
  const base = [[0, 42], [42, 18], [30, 50], [42, 82], [0, 58]];
  return base.map(([x, y]) => `${side === "right" ? 100 + x : -x},${y}`).join(" ");
}
export const WING_SHAPES = { left: wingPoints("left"), right: wingPoints("right") };

// Multi-stop gradients (real <linearGradient> stops, not a 2-3 color CSS
// gradient) for a genuine metallic look, plus the glow color used by
// RankBadge's idle-float glow animation.
const RANK_TIERS = [
  { min: 0, name: "Bronze", shape: "circle", stops: [["0%", "#E8C39E"], ["45%", "#CD853F"], ["100%", "#6B3F1D"]], stroke: "#F3D9B1", glowRgb: "184,115,51" },
  { min: 50, name: "Silver", shape: "hexagon", stops: [["0%", "#FFFFFF"], ["45%", "#C7CDD6"], ["100%", "#5B6472"]], stroke: "#EDEFF2", glowRgb: "190,200,210" },
  { min: 100, name: "Gold", shape: "pentagon", stops: [["0%", "#FFF3B0"], ["40%", "#FFD700"], ["100%", "#B8790A"]], stroke: "#FFF6D0", glowRgb: "255,196,0" },
  { min: 150, name: "Diamond", shape: "shield", stops: [["0%", "#E8FFFF"], ["35%", "#00E5FF"], ["70%", "#6A5ACD"], ["100%", "#4B0082"]], stroke: "#CFFFFF", glowRgb: "0,229,255" },
];
const ROMAN = ["I", "II", "III", "IV", "V"];

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
    stops: tier.stops,
    stroke: tier.stroke,
    glowRgb: tier.glowRgb,
    label: isMaxRank ? "Heroic" : `${tier.name} ${ROMAN[subIndex - 1]}`,
    isMaxRank,
    wings: tierIndex >= 2, // Gold tier (Level 100+) and up
  };
}
