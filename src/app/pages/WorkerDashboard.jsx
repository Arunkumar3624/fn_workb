import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { Coins, Flame, Sparkles, TrendingUp, X, Zap } from "lucide-react";
import DashboardLayout from "../components/common/DashboardLayout";
import WorkerSidebar from "../components/worker/WorkerSidebar";
import WorkerJobFeed from "../components/worker/WorkerJobFeed";
import NegotiationInbox from "../components/worker/WorkerNegotiationInbox";
import WorkerWorkspace from "../components/worker/WorkerWorkspace";
import WorkerWallet from "../components/worker/WorkerWallet";
import EconomyHub from "./EconomyHub";
import WorkerProfile from "../components/worker/WorkerProfile";
import SettingsPage from "./SettingsPage";
import { useAuth } from "../context/AuthContext";
import { getWallet } from "../lib/walletApi";
import { getMyCandidateStats } from "../lib/candidatesApi";
import { getInitials } from "../utils/formValidation";
import { getSocket } from "../lib/socketClient";
import EconomyInfoTooltip from "../components/shared/EconomyInfoTooltip";
import NotificationBell from "../components/shared/NotificationBell";

const GROWTH_AD_DISMISSED_KEY = "wb_growth_ad_dismissed";

// Target 3's "PLG Loop" toast — there's no real subscription_tier column
// anywhere on users (see WorkerWallet.jsx's SubscriptionTab comment: real
// billing is still deferred), so every worker today genuinely IS on the
// free/preview tier — showing this to all of them is the honest condition,
// not a placeholder. Dismissing hides it for the rest of this browser
// session (sessionStorage, not a permanent server-side preference — nothing
// backs a "don't show me this again forever" setting yet).
function GrowthAdToast({ onUpgrade, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg shadow-slate-900/20 backdrop-blur-2xl"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.82)" }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-white/50 transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="pr-5 text-sm font-semibold leading-6 text-white">
        Unlock Premium Matches and zero commission on your first ₹10,000 earned. Upgrade to Elite today! ⚡
      </p>
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#e55e1f]"
      >
        <Zap className="h-3.5 w-3.5" />
        See Elite Perks
      </button>
    </motion.div>
  );
}

export default function WorkerDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [hustleStats, setHustleStats] = useState(null);
  const [showGrowthAd, setShowGrowthAd] = useState(() => sessionStorage.getItem(GROWTH_AD_DISMISSED_KEY) !== "true");

  // Tab is driven entirely by the URL (/worker or /worker/:tab) so deep
  // links — like a "Job Invite" notification — can land directly on a tab.
  // "feed" (Job Feed) is the bare-/worker default, not "workspace" — a
  // worker's landing page should be where new jobs are, not their current
  // work, matching how BusinessDashboard's default is "overview" rather
  // than an active-projects list.
  const tab = urlTab ?? "feed";
  const setTab = (id) => navigate(id === "feed" ? "/worker" : `/worker/${id}`);
  const projectIdFromUrl = searchParams.get("invite");

  useEffect(() => {
    getWallet()
      .then((wallet) => setWalletBalance(Number(wallet.balance)))
      .catch(() => {});
  }, []);

  // The Hustle Stats card — real job_candidates counts (source='APPLICATION'
  // only), not a fabricated "momentum" number.
  useEffect(() => {
    getMyCandidateStats()
      .then(setHustleStats)
      .catch(() => {});
  }, []);

  // A brand-new invite is the one event a worker's own `projects` state
  // can't already contain (they've never seen this project before), so it's
  // handled here — mounted on every worker page — rather than inside
  // WorkerWorkspace, which only reacts to projects it already loaded. The
  // real "you have a pending invite" indicator itself lives on
  // WorkerSidebar.jsx's own Negotiations nav item (its own independent
  // fetch) — this toast is just the live, in-the-moment alert; no header
  // bell/badge duplicates it.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (event.type !== "PROJECT_CREATED") return;
      toast.info(`${event.businessName ?? "A business"} invited you to "${event.title}".`);
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
  }, []);

  return (
    <DashboardLayout
      sidebar={<WorkerSidebar tab={tab} onTabChange={setTab} onLogout={onLogout} />}
    >
      <div className="flex h-full flex-col bg-[#f8fafc]">
        <header className="flex-shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-emerald-50 to-white px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Sparkles className="h-5 w-5 text-[#ff6b35]" />
              </div>
              <p className="text-sm text-slate-700">
                No more chasing invoices.{' '}
                <span className="font-semibold text-slate-900">Once a business approves your work, the payout lands straight in your wallet.</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* The Hustle Stats card — real job_candidates counts, not a
                  fabricated "momentum" number. Glassmorphism to match the
                  HUD pill beside it, but on a light frosted panel since it
                  sits over the same bg-white/90 header either way. */}
              {hustleStats && (
                <div className="hidden items-center gap-2.5 rounded-2xl border border-white/60 bg-white/50 px-4 py-2 shadow-sm backdrop-blur-md lg:flex">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35]">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Momentum</p>
                    <p className="text-sm font-bold text-slate-900">
                      {hustleStats.thisWeek} this week
                      <span className="font-normal text-slate-400"> · {hustleStats.thisMonth} this month</span>
                    </p>
                  </div>
                </div>
              )}
              {/* MASTER_ECONOMY_PLAN.md's Dashboard HUD. This header is
                  bg-white/90 (light), so a literal bg-white/10 glass pill
                  from the design brief would be invisible — using a navy
                  tint instead so it still reads as glass, just against a
                  light backdrop, and pops as a distinct "status" pill next
                  to the plain white balance card beside it. */}
              <div className="hidden items-center gap-3 rounded-2xl border border-white/20 bg-[#0F172A]/90 px-4 py-2 shadow-sm backdrop-blur-md sm:flex">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <Flame className="h-4 w-4 text-[#FF6B35]" />
                  {currentUser?.current_streak ?? 0}
                  <span className="hidden font-normal text-slate-300 md:inline">Day Streak</span>
                </span>
                <span className="h-4 w-px bg-white/20" />
                <button
                  type="button"
                  onClick={() => navigate("/worker/economy?tab=shop")}
                  title="Go to the Token Shop"
                  className="flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-amber-300"
                >
                  <Coins className="h-4 w-4 text-amber-400" />
                  {currentUser?.bridge_tokens ?? 0}
                  <span className="hidden font-normal text-slate-300 md:inline">Tokens</span>
                </button>
                <EconomyInfoTooltip title="How Tokens work">
                  <p>Bridge Tokens are your spendable balance — use them in the Token Shop on visibility perks.</p>
                  <p className="mt-2">You earn <strong>+25 Tokens</strong> automatically every time a project you complete gets approved and paid. Nothing else grants Tokens today.</p>
                </EconomyInfoTooltip>
              </div>
              <NotificationBell />
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f172a] text-sm font-semibold text-white">
                  {getInitials(currentUser?.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">₹{walletBalance.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-500">Available balance</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {tab === "feed" && <WorkerJobFeed />}
          {tab === "negotiations" && <NegotiationInbox initialProjectId={projectIdFromUrl} />}
          {tab === "workspace" && <WorkerWorkspace />}
          {tab === "wallet" && <WorkerWallet />}
          {tab === "economy" && <EconomyHub />}
          {tab === "profile" && <WorkerProfile />}
          {tab === "settings" && <SettingsPage />}
        </div>
      </div>

      <AnimatePresence>
        {showGrowthAd && tab !== "wallet" && (
          <GrowthAdToast
            onUpgrade={() => {
              setShowGrowthAd(false);
              sessionStorage.setItem(GROWTH_AD_DISMISSED_KEY, "true");
              navigate("/worker/wallet?tab=subscription");
            }}
            onDismiss={() => {
              setShowGrowthAd(false);
              sessionStorage.setItem(GROWTH_AD_DISMISSED_KEY, "true");
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
