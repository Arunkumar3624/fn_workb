import { useEffect, useState } from "react";
import { Briefcase, Search, Wallet, User, LogOut, ShieldCheck, Handshake, Settings, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listProjects } from "../../lib/projectsApi";
import { getInitials } from "../../utils/formValidation";
import PinnedBadgeOverlay from "../shared/PinnedBadgeOverlay";
import brandLogo from "../../assets/logo.png";
import { verifiedRingClass } from "../../utils/verification";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={`relative flex h-screen flex-shrink-0 flex-col border-r border-white/10 bg-[#0F172A] text-slate-100 transition-[width] duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-[260px]"
      }`}
    >
      <div
        onClick={() => setIsCollapsed((v) => !v)}
        title="Click to collapse/expand"
        className={`cursor-pointer select-none border-b border-white/10 py-6 ${isCollapsed ? "px-0" : "px-5"}`}
      >
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 flex-shrink-0 cursor-default items-center justify-center rounded-lg bg-[#ffffff] shadow-lg shadow-[#FF6B35]/25"
          >
            <img src={brandLogo} alt="" className="h-6 w-6 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                WorkBridge
              </p>
              <p className="truncate text-xs text-slate-400">Where freelance work gets done</p>
            </div>
          )}
        </div>
      </div>

      <div className={`border-b border-white/10 py-5 ${isCollapsed ? "px-0" : "px-5"}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="relative flex-shrink-0">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={`${currentUser?.name || "Worker"} profile`}
                className={`h-11 w-11 rounded-lg object-cover ${currentUser?.verified ? verifiedRingClass(true, "sm", "emerald") : ""}`}
              />
            ) : (
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF6B35] text-sm font-semibold text-white ${currentUser?.verified ? verifiedRingClass(true, "sm", "emerald") : ""}`}>
                {getInitials(currentUser?.name)}
              </div>
            )}
            <PinnedBadgeOverlay level={currentUser?.pinned_milestone_level} size="xs" className="-bottom-1 -right-1" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentUser?.name || "—"}</p>
              <p className="truncate text-xs text-slate-400">{currentUser?.title || "Freelancer"}</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
              <span className="text-xs font-medium text-emerald-300">Available</span>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              {currentUser?.behavior_score ?? 0} Score
            </span>
          </div>
        )}
      </div>

      <nav
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsCollapsed((v) => !v);
        }}
        title="Click empty space to collapse/expand"
        className={`flex-1 cursor-pointer space-y-1 py-4 ${isCollapsed ? "px-2" : "px-3"}`}
      >
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={isCollapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-2xl py-3 text-left text-sm font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center px-0" : "px-3"
              } ${
                active
                  ? "border-l-4 border-[#FF6B35] bg-[#17233f] text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="relative flex-shrink-0">
                <Icon className={`h-4 w-4 ${active ? "text-[#FF6B35]" : "text-slate-400"}`} />
                {isCollapsed && id === "negotiations" && hasPendingInvites && (
                  <span className="absolute -right-1 -top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </span>
              {!isCollapsed && (
                <span className="flex items-center gap-2">
                  {label}
                  {id === "negotiations" && hasPendingInvites && (
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 py-4 ${isCollapsed ? "px-2" : "px-4"}`}>
        <div
          title={isCollapsed ? (currentUser?.verified ? "Verified User" : "Unverified") : undefined}
          className={`flex items-center gap-3 rounded-lg border py-3 ${isCollapsed ? "justify-center px-0" : "px-3"} ${
            currentUser?.verified ? "border-[#10B981]/20 bg-[#10B981]/10" : "border-amber-400/20 bg-amber-400/10"
          }`}
        >
          <ShieldCheck className={`h-4 w-4 flex-shrink-0 ${currentUser?.verified ? "text-emerald-300" : "text-amber-300"}`} />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentUser?.verified ? "Verified User" : "Unverified"}</p>
              <p className={`truncate text-xs ${currentUser?.verified ? "text-emerald-200" : "text-amber-200"}`}>
                {currentUser?.verified ? "Identity & payment protected" : "Complete verification to build trust"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          title={isCollapsed ? "Sign out" : undefined}
          className={`mt-3 flex w-full items-center gap-3 rounded-2xl py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white ${
            isCollapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
