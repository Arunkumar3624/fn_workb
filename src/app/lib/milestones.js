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
