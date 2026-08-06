import { getMilestoneByLevel, BADGE_THEMES } from "../../lib/milestones";

// pinnedLevel is a real MILESTONES level (see lib/milestones.js) the user
// chose via WorkerMilestones.jsx's "pin this badge" action, or null/
// undefined for no overlay — a small "verified-badge"-style icon in the
// avatar's bottom-right corner, the same pattern Instagram/X use for a
// profile check mark. When this comes from public_user_profiles (any
// business-facing call site, e.g. BusinessWorkers.jsx), it's already
// server-side masked to null until the worker's Two-Door Reveal fires, so
// this component never needs to re-check that gate itself.
export default function Avatar({
  initials,
  bg = "bg-[#1B3FAB]",
  size = "w-12 h-12",
  text = "text-sm",
  pinnedLevel = null,
  badgeSize = "h-4 w-4",
  badgeIconSize = "h-2.5 w-2.5",
}) {
  const milestone = pinnedLevel ? getMilestoneByLevel(pinnedLevel) : null;
  const theme = milestone && !milestone.major ? BADGE_THEMES[milestone.color] : null;
  const BadgeIcon = milestone?.icon;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${size}`}>
      <div className={`${size} ${bg} rounded-xl flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
        {initials}
      </div>
      {milestone && (
        <span
          title={`${milestone.name} — Level ${milestone.level}`}
          className={`absolute -bottom-1 -right-1 flex ${badgeSize} items-center justify-center rounded-full border-2 border-white shadow-sm ${
            milestone.major ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600" : `bg-gradient-to-br ${theme.grad}`
          }`}
        >
          <BadgeIcon className={`${badgeIconSize} ${milestone.major ? "text-amber-900" : theme.icon}`} strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}
