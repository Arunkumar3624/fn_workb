import { useEffect, useState } from "react";
import { Briefcase, Search, Wallet, User, LogOut, ShieldCheck, Handshake, Settings, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listProjects } from "../../lib/projectsApi";
import { getInitials } from "../../utils/formValidation";
import PinnedBadgeOverlay from "../shared/PinnedBadgeOverlay";
import brandLogo from "../../assets/logo.png";

// Every one of these is fully real: Job Feed is the real Open Job Board
// (listOpenProjects/applyToProject), Negotiations is the permanent chat
// inbox spanning every project stage. Support moved into Settings (its own
// tab there) rather than sitting as a top-level item here — the global
// SupportFab is the fast path to it now, not the sidebar.
const NAV = [
  { id: "feed", label: "Job Feed", icon: Search },
  { id: "negotiations", label: "Negotiations", icon: Handshake },
  { id: "workspace", label: "Active Workspace", icon: Briefcase },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "economy", label: "Economy Hub", icon: Sparkles },
  { id: "profile", label: "My Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function WorkerSidebar({ tab, onTabChange, onLogout }) {
  const { currentUser } = useAuth();
  const [hasPendingInvites, setHasPendingInvites] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "worker", status: "INVITED" })
      .then((projects) => {
        if (!cancelled) setHasPendingInvites(projects.length > 0);
      })
      .catch(() => {
        // Non-critical badge — a failed check just leaves it hidden.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="flex h-screen w-[260px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0F172A] text-slate-100">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffffff] shadow-lg shadow-[#FF6B35]/25">
            <img src={brandLogo} alt="" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <p className="text-base font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </p>
            <p className="text-xs text-slate-400">Where freelance work gets done</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={`${currentUser?.name || "Worker"} profile`}
                className="h-11 w-11 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF6B35] text-sm font-semibold text-white">
                {getInitials(currentUser?.name)}
              </div>
            )}
            <PinnedBadgeOverlay level={currentUser?.pinned_milestone_level} size="xs" className="-bottom-1 -right-1" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{currentUser?.name || "—"}</p>
            <p className="truncate text-xs text-slate-400">{currentUser?.title || "Freelancer"}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span className="text-xs font-medium text-emerald-300">Available</span>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            {currentUser?.behavior_score ?? 0} Score
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
        <div
          className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
            currentUser?.verified ? "border-[#10B981]/20 bg-[#10B981]/10" : "border-amber-400/20 bg-amber-400/10"
          }`}
        >
          <ShieldCheck className={`h-4 w-4 ${currentUser?.verified ? "text-emerald-300" : "text-amber-300"}`} />
          <div>
            <p className="text-sm font-semibold text-white">{currentUser?.verified ? "Verified User" : "Unverified"}</p>
            <p className={`text-xs ${currentUser?.verified ? "text-emerald-200" : "text-amber-200"}`}>
              {currentUser?.verified ? "Identity & payment protected" : "Complete verification to build trust"}
            </p>
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
