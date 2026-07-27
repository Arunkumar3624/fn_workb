// MASTER_ECONOMY_PLAN.md Part 2 — the Exponential XP Math Engine.
// Mirrors backend/src/utils/gamification.js exactly — there's no shared
// package between the two apps in this repo, so this is a deliberate,
// verified duplicate, not an independent implementation. If the BASE/
// GROWTH constants or formula ever change, update both files together.

const BASE = 10;
const GROWTH = 1.85;
const MAX_LEVEL = 200;

function totalXpForLevel(level) {
  return (BASE / (GROWTH + 1)) * Math.pow(level, GROWTH + 1);
}

// calculateLevel(xp) — given cumulative XP, returns the current level and
// the XP thresholds on either side of it.
export function calculateLevel(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);

  const rawLevel = Math.pow(safeXp / (BASE / (GROWTH + 1)), 1 / (GROWTH + 1));
  const currentLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(rawLevel)));

  const xpForCurrentLevel = totalXpForLevel(currentLevel);
  const xpForNextLevel = currentLevel >= MAX_LEVEL ? xpForCurrentLevel : totalXpForLevel(currentLevel + 1);

  return { currentLevel, xpForCurrentLevel, xpForNextLevel };
}

// getTierData(level) — the UI Abstraction Ladder (MASTER_ECONOMY_PLAN.md
// Part 5a). Returns ONLY a display name and color theme — never a fee
// percentage. The real platform_fee_pct lives exclusively in the
// backend's gamification_config table and is never sent to the client.
export function getTierData(level) {
  const safeLevel = Math.max(1, Number(level) || 1);

  if (safeLevel >= 200) return { tier: "Diamond", colorTheme: "blue" };
  if (safeLevel >= 150) return { tier: "Platinum", colorTheme: "teal" };
  if (safeLevel >= 100) return { tier: "Gold", colorTheme: "yellow" };
  if (safeLevel >= 50) return { tier: "Silver", colorTheme: "gray" };
  return { tier: "Standard", colorTheme: "slate" };
}

// The next NAMED tier up from the current one — drives "X XP to [Tier]"
// micro-copy. Returns null once already at Diamond (nothing higher).
const TIER_LEVELS = [
  { level: 50, tier: "Silver" },
  { level: 100, tier: "Gold" },
  { level: 150, tier: "Platinum" },
  { level: 200, tier: "Diamond" },
];

export function getNextTier(currentLevel) {
  return TIER_LEVELS.find((t) => t.level > currentLevel) ?? null;
}

// calculateProgressBar(xp) — 0–100 percentage of the way from the current
// level's floor to the next level's floor. A maxed-out (Level 200) user
// gets a flat 100 rather than a division by zero.
export function calculateProgressBar(xp) {
  const { currentLevel, xpForCurrentLevel, xpForNextLevel } = calculateLevel(xp);

  if (currentLevel >= MAX_LEVEL || xpForNextLevel === xpForCurrentLevel) {
    return 100;
  }

  const safeXp = Math.max(0, Number(xp) || 0);
  const progress = ((safeXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return Math.min(100, Math.max(0, progress));
}
