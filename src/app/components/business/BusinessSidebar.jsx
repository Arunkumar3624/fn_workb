import {
  BarChart3,
  Briefcase,
  Building2,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/formValidation";

const NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "post", label: "Post a Job", icon: Plus },
  { id: "workers", label: "Find Workers", icon: Users },
  { id: "projects", label: "Active Projects", icon: Briefcase },
  { id: "negotiations", label: "Negotiations", icon: MessageSquare },
  { id: "company", label: "Company Page", icon: Building2 },
];

export default function BusinessSidebar({
  tab,
  onTabChange,
  onPostJob,
  onVerify,
  onLogout,
  isVerified,
}) {
  const { currentUser } = useAuth();
  return (
    <aside className="flex h-screen w-[260px] flex-shrink-0 flex-col bg-[#0F172A]">
      <div className="border-b border-white/5 p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span
            className="font-extrabold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            WorkBridge
          </span>
        </div>
      </div>

      <div className="border-b border-white/5 p-5">
        <div className="flex items-center gap-3">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3FAB] text-sm font-bold text-white">
              {getInitials(currentUser?.name)}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-white">{currentUser?.name || "—"}</div>
            <div className="text-xs text-slate-400">Business Account</div>
          </div>
        </div>
        {currentUser?.verified && (
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              Verified
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => (id === "post" ? onPostJob() : onTabChange(id))}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              tab === id
                ? "bg-[#1B3FAB] text-white shadow-md shadow-[#1B3FAB]/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "post" && !isVerified && (
              <Lock className="ml-auto h-3 w-3 flex-shrink-0 text-slate-600" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4">
        {isVerified ? (
          <div className="mb-2 flex w-full items-center gap-2 rounded-lg border border-[#10B981]/20 bg-[#10B981]/15 px-4 py-2.5 text-xs font-bold text-[#10B981]">
            <ShieldCheck className="h-4 w-4" />
            Business Verified
          </div>
        ) : (
          <button
            onClick={onVerify}
            className="mb-2 flex w-full items-center gap-2 rounded-lg border border-[#FF6B35]/20 bg-[#FF6B35]/15 px-4 py-2.5 text-xs font-bold text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/25"
          >
            <ShieldCheck className="h-4 w-4" />
            Get Business Verified
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
