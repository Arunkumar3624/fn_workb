import { useState } from "react";
import { BarChart3, Shield, AlertTriangle, ShieldAlert, UserCog, Receipt, Zap, LogOut } from "lucide-react";
import AdminOverviewTab from "../components/admin/AdminOverviewTab";
import AdminVerificationsTab from "../components/admin/AdminVerificationsTab";
import AdminDisputesTab from "../components/admin/AdminDisputesTab";
import AdminSecurityTab from "../components/admin/AdminSecurityTab";
import AdminTeamTab from "../components/admin/AdminTeamTab";
import AdminTransactionsTab from "../components/admin/AdminTransactionsTab";

const NAV = [
  { id: "overview", label: "Master Dashboard", icon: BarChart3 },
  { id: "verification", label: "Verification Center", icon: Shield, badge: "247" },
  { id: "disputes", label: "Dispute Resolution", icon: AlertTriangle, badge: "18" },
  { id: "transactions", label: "Transaction History", icon: Receipt },
  { id: "security", label: "Security Monitor", icon: ShieldAlert, badge: "3" },
  { id: "team", label: "Team Access", icon: UserCog },
];

// Maps each nav id to the tab component that renders it — swap this map to
// add/remove tabs without touching the sidebar or layout markup below.
const TAB_COMPONENTS = {
  overview: AdminOverviewTab,
  verification: AdminVerificationsTab,
  disputes: AdminDisputesTab,
  transactions: AdminTransactionsTab,
  security: AdminSecurityTab,
  team: AdminTeamTab,
};

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen flex bg-[#F4F6FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-[#0A1128] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FF6B2C] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>WorkBridge</span>
          </div>
          <div className="mt-1.5 px-0.5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Admin Console</span>
          </div>
        </div>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Platform Admin</div>
              <div className="text-slate-400 text-xs">Super Administrator</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{label}</span>
              {badge && activeTab !== id && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">!</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto">
        <ActiveTabComponent onNavigate={setActiveTab} />
      </div>
    </div>
  );
}
