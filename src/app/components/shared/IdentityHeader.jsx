import { ShieldCheck, Star } from "lucide-react";
import Avatar from "./Avatar";

/**
 * The Identity Anchor — a permanent, sticky header pinned to the top of any
 * negotiation/chat pane so [Participant Name] is always visible, whether the
 * thread is still gated (Pending) or already unlocked (Accepted).
 *
 * Shared between the worker's Negotiation Inbox and the business's
 * Inbox/Rehire chat so both sides get the same identity treatment.
 */
const PILL_TONE = {
  emerald: "text-emerald-700 bg-emerald-50",
  amber: "text-amber-700 bg-amber-50",
  blue: "text-blue-600 bg-blue-50",
};

export default function IdentityHeader({
  name,
  subtitle,
  initials,
  avatarBg = "bg-[#1B3FAB]",
  avatarUrl,
  verified = true,
  rating,
  reviews,
  onNameClick,
  statusPill,
}) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
      <div className="flex w-full items-center gap-3 min-w-0 sm:w-auto">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <Avatar initials={initials} bg={avatarBg} size="w-10 h-10" text="text-sm" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {onNameClick ? (
              <button
                type="button"
                onClick={onNameClick}
                className="font-bold text-lg text-slate-900 hover:text-[#1B3FAB] transition-colors truncate text-left"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {name}
              </button>
            ) : (
              <p
                className="font-bold text-lg text-slate-900 truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {name}
              </p>
            )}
            {verified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {subtitle && <p className="text-sm text-slate-500 truncate">{subtitle}</p>}
            {rating != null && (
              <>
                <span className="text-slate-300 text-xs flex-shrink-0">·</span>
                <p className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {rating}
                  {reviews != null && ` (${reviews} jobs)`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {statusPill ? (
        <span
          className={`flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            PILL_TONE[statusPill.tone] ?? PILL_TONE.blue
          }`}
        >
          {statusPill.text}
        </span>
      ) : (
        verified && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Verified
          </span>
        )
      )}
    </div>
  );
}
