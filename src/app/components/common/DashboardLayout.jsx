/**
 * DashboardLayout — shared shell for Worker and Business dashboards.
 *
 * Provides the authenticated WorkBridge app frame:
 * a 260px dark sidebar plus a white, scroll-owned dashboard workspace.
 */
export default function DashboardLayout({ sidebar, children }) {
  return (
    <div
      className="flex h-screen overflow-hidden bg-white dark:bg-slate-950"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {sidebar}

      <div className="wb-scroll-clean flex h-screen flex-1 flex-col overflow-y-auto bg-white dark:bg-slate-950">
        {children}
      </div>
    </div>
  );
}
