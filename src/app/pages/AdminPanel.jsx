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
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-[#0B1023]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Ambient background (fixed, non-white — everything above it is glass) ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#0B1023] via-[#12183a] to-[#1a1030]" />
      <div className="pointer-events-none fixed -top-40 -left-32 -z-10 h-96 w-96 rounded-full bg-[#1B3FAB]/30 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-32 -z-10 h-96 w-96 rounded-full bg-[#FF6B35]/20 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 right-1/4 -z-10 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px]" />

      {/* ── Sticky glass header ── */}
      <header className="relative z-20 flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-400">Super Administrator</p>
            </div>
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                {getInitials(currentUser?.name)}
              </div>
            )}
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Pill tab nav ── */}
        <div className="overflow-x-auto px-6 pb-3">
          <div className="flex w-fit gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {NAV.map(({ id, label, icon: Icon, badgeKey }) => {
              const active = activeTab === id;
              const count = badgeKey ? badgeCounts[badgeKey] : 0;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    active ? "bg-white/15 text-white shadow-sm backdrop-blur-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {count > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                        active ? "bg-[#FF6B35] text-white" : "bg-white/10 text-slate-200"
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

      {/* ── Content (fills remaining viewport height — tabs that need h-full get a real ancestor height) ── */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <ActiveTabComponent onNavigate={setActiveTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
