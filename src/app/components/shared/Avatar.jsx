import PinnedBadgeOverlay from "./PinnedBadgeOverlay";

// pinnedLevel is a real MILESTONES level (see lib/milestones.js) the user
// chose via WorkerMilestones.jsx's "pin this badge" action, or null/
// undefined for no overlay — a small rank-badge icon in the avatar's
// bottom-right corner (PinnedBadgeOverlay, same shape system as the full
// Badges grid). When this comes from public_user_profiles (any
// business-facing call site, e.g. BusinessWorkers.jsx), it's already
// server-side masked to null until the worker's Two-Door Reveal fires, so
// this component never needs to re-check that gate itself.
// `avatarUrl` renders the real uploaded photo when present — this component
// used to be initials-only regardless of whether the person actually had one
// on file, unlike the sidebar/header avatars elsewhere in the app that
// already had their own local `{avatarUrl ? <img/> : <div>initials</div>}`
// pattern. Any real profile picture depends on the caller's own API query
// actually selecting avatar_url in the first place — a caller with a
// stripped-down row (e.g. a project list that never joined it) will still
// only ever have initials to give it.
export default function Avatar({
  initials,
  avatarUrl,
  alt,
  bg = "bg-[#1B3FAB]",
  size = "w-12 h-12",
  text = "text-sm",
  pinnedLevel = null,
  badgeSize = "xs",
}) {
  return (
    <div className={`relative inline-flex flex-shrink-0 ${size}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={alt ?? ""} className={`${size} rounded-xl object-cover flex-shrink-0`} />
      ) : (
        <div className={`${size} ${bg} rounded-xl flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
          {initials}
        </div>
      )}
      <PinnedBadgeOverlay level={pinnedLevel} size={badgeSize} className="-bottom-1 -right-1" />
    </div>
  );
}
