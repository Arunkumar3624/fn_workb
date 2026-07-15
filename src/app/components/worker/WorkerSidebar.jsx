import { Briefcase, Search, Wallet, User, LogOut, ShieldCheck, Zap, MessageSquare, Handshake } from "lucide-react";
import { usePlatformData } from "../../context/PlatformContext";

// "Negotiations" sits between Job Feed and Active Workspace — it's the
// bridge between finding work and doing work.
const NAV = [
  { id: "feed", label: "Job Feed", icon: Search },
  { id: "negotiations", label: "Negotiations", icon: Handshake },
  { id: "workspace", label: "Active Workspace", icon: Briefcase },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "My Profile", icon: User },
];

export default function WorkerSidebar({ tab, onTabChange, onLogout }) {
  const { currentUser, invitesDb } = usePlatformData();
  const hasPendingInvites = invitesDb.some((invite) => !invite.isAccepted);

  return (
    <aside className="flex h-screen w-[260px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0F172A] text-slate-100">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35] shadow-lg shadow-[#FF6B35]/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </p>
            <p className="text-xs text-slate-400">Premium freelance OS</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          {currentUser?.avatar ? (
            <img
              src={currentUser?.avatar || "/default-avatar.png"}
              alt={`${currentUser?.name || "Worker"} profile`}
              className="h-11 w-11 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF6B35] text-sm font-semibold text-white">
              {currentUser?.av || "PS"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{currentUser?.name || "Priya Sharma"}</p>
            <p className="truncate text-xs text-slate-400">{currentUser?.title || "Full-Stack Developer"}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span className="text-xs font-medium text-emerald-300">Available</span>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            847 pts
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
                active
                  ? "border-l-4 border-[#FF6B35] bg-[#17233f] text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-[#FF6B35]" : "text-slate-400"}`} />
              <span className="flex items-center gap-2">
                {label}
                {id === "negotiations" && hasPendingInvites && (
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-3">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <div>
            <p className="text-sm font-semibold text-white">Verified User</p>
            <p className="text-xs text-emerald-200">Identity & payment protected</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
