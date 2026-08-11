/**
 * DashboardLayout — shared shell for Worker and Business dashboards.
 *
 * Provides the authenticated WorkBridge app frame: a 260px dark sidebar
 * plus a warm, inset "floating canvas" workspace — the sidebar stays
 * full-bleed against its own dark background, but `children` (each
 * dashboard's own rounded/shadowed card) now sits inset against a soft
 * gradient backdrop instead of flush white, for spatial depth.
 *
 * overflow-hidden here (not overflow-y-auto) is deliberate — this wrapper
 * never scrolls itself. Every tab panel underneath (WorkerJobFeed,
 * WorkerNegotiationInbox, etc.) already owns its own internal scroll
 * against a bounded-height ancestor; changing this to a page-level scroll
 * would break every one of their `sticky top-0` headers, which anchor to
 * their own scroll container, not this one.
 */
export default function DashboardLayout({ sidebar, children }) {
  return (
    <div
      // A near-white backdrop under a near-white card used to read as flat
      // white-on-white (the card's border-white/60 added no contrast either)
      // — this backdrop is deliberately a shade more saturated so the
      // floating card's edge is actually visible, and the dark variant
      // deliberately goes a shade darker than the card for the same reason.
      className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/80 via-slate-100 to-slate-200 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-slate-950 dark:via-black dark:to-black"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {sidebar}

      <div className="flex h-screen flex-1 flex-col overflow-hidden p-3 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
