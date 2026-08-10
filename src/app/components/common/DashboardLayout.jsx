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
      className="flex h-screen overflow-hidden bg-gradient-to-br from-[#FFF5F0] via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {sidebar}

      <div className="flex h-screen flex-1 flex-col overflow-hidden p-3 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
