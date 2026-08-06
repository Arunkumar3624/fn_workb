import PinnedBadgeOverlay from "./PinnedBadgeOverlay";

// pinnedLevel is a real MILESTONES level (see lib/milestones.js) the user
// chose via WorkerMilestones.jsx's "pin this badge" action, or null/
// undefined for no overlay — a small rank-badge icon in the avatar's
// bottom-right corner (PinnedBadgeOverlay, same shape system as the full
// Badges grid). When this comes from public_user_profiles (any
// business-facing call site, e.g. BusinessWorkers.jsx), it's already
// server-side masked to null until the worker's Two-Door Reveal fires, so
// this component never needs to re-check that gate itself.
export default function Avatar({
  initials,
  bg = "bg-[#1B3FAB]",
  size = "w-12 h-12",
  text = "text-sm",
  pinnedLevel = null,
  badgeSize = "sm",
}) {
  return (
    <div className={`relative inline-flex flex-shrink-0 ${size}`}>
      <div className={`${size} ${bg} rounded-xl flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
        {initials}
      </div>
      <PinnedBadgeOverlay level={pinnedLevel} size={badgeSize} className="-bottom-2 -right-2" />
    </div>
  );
}
