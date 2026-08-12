/**
 * DashboardLayout — shared shell for Worker and Business dashboards.
 *
 * Provides the authenticated WorkBridge app frame: a 260px dark sidebar
 * plus a full-bleed workspace canvas. Used to inset `children` inside a
 * padded gradient backdrop as a "floating card" (rounded corners, border,
 * shadow) — that read as a boxed-in widget with a gray moat around it
 * rather than a native full-screen dashboard, so both the padding here and
 * each dashboard's own rounded/shadowed wrapper were removed; `children`
 * now fills 100% of the space next to the sidebar.
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
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {sidebar}

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
