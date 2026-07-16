import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart3, Shield, AlertTriangle, ShieldAlert, UserCog, Receipt, Zap, LogOut, Image as ImageIcon } from "lucide-react";
import AdminOverviewTab from "../components/admin/AdminOverviewTab";
import AdminVerificationsTab from "../components/admin/AdminVerificationsTab";
import AdminDisputesTab from "../components/admin/AdminDisputesTab";
import AdminSecurityTab from "../components/admin/AdminSecurityTab";
import AdminTeamTab from "../components/admin/AdminTeamTab";
import AdminTransactionsTab from "../components/admin/AdminTransactionsTab";
import AdminContentReviewTab from "../components/admin/AdminContentReviewTab";
import { useAuth } from "../context/AuthContext";
import { listVerifications, listDisputes } from "../lib/adminApi";
import { getInitials } from "../utils/formValidation";

const NAV = [
  { id: "overview", label: "Master Dashboard", icon: BarChart3 },
  { id: "verification", label: "Verification Center", icon: Shield, badgeKey: "verifications" },
  { id: "content", label: "Content Review", icon: ImageIcon },
  { id: "disputes", label: "Dispute Resolution", icon: AlertTriangle, badgeKey: "disputes" },
  { id: "transactions", label: "Transaction History", icon: Receipt },
  { id: "security", label: "Security Monitor", icon: ShieldAlert },
  { id: "team", label: "Team Access", icon: UserCog },
];

// Maps each nav id to the tab component that renders it — swap this map to
// add/remove tabs without touching the nav or layout markup below.
const TAB_COMPONENTS = {
  overview: AdminOverviewTab,
  verification: AdminVerificationsTab,
  content: AdminContentReviewTab,
  disputes: AdminDisputesTab,
  transactions: AdminTransactionsTab,
  security: AdminSecurityTab,
  team: AdminTeamTab,
};

export default function AdminPanel({ onLogout }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  // Real pending counts for the nav badges — fetched once here rather than
  // duplicated inside AdminVerificationsTab/AdminDisputesTab, which fetch
  // their own full lists independently for their actual content.
  const [badgeCounts, setBadgeCounts] = useState({ verifications: 0, disputes: 0 });

  useEffect(() => {
    Promise.all([listVerifications(), listDisputes()])
      .then(([verifications, disputes]) => {
        setBadgeCounts({ verifications: verifications.length, disputes: disputes.length });
      })
      .catch(() => {
        // Non-critical — badges just stay at 0 if this fails.
      });
  }, [activeTab]);

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
              <p className="text-xs text-slate-500">Super Administrator</p>
            </div>
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                {getInitials(currentUser?.name)}
              </div>
            )}
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Pill tab nav ── */}
        <div className="overflow-x-auto px-6 pb-3">
          <div className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1">
            {NAV.map(({ id, label, icon: Icon, badgeKey }) => {
              const active = activeTab === id;
              const count = badgeKey ? badgeCounts[badgeKey] : 0;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {count > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                        active ? "bg-[#FF6B35] text-white" : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ActiveTabComponent onNavigate={setActiveTab} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
