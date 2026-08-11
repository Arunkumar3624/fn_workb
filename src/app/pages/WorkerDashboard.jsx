import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Coins, Flame, Sparkles, TrendingUp } from "lucide-react";
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
import OnboardingWizard from "../components/common/OnboardingWizard";
import { shouldShowFrame, verifiedRingClass } from "../utils/verification";

// A real, local-time-of-day greeting — not a fixed "Welcome back" — so the
// new warm header actually reads as personalized rather than static copy.
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return { text: "Good Evening", emoji: "🌙" };
}

// "Lobby vs. Workroom": the big warm greeting only belongs on the landing
// tab (Job Feed). Every other tab is a workroom the user already knows
// they're in — it gets a slim, contextual title instead so the greeting
// doesn't repeat itself (and eat vertical space) on every navigation.
const TAB_TITLES = {
  negotiations: "Negotiations",
  workspace: "Active Workspace",
  wallet: "Wallet & Subscription",
  economy: "Economy Hub",
  profile: "My Profile",
  settings: "Account Settings",
};

export default function WorkerDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [hustleStats, setHustleStats] = useState(null);

  // Tab is driven entirely by the URL (/worker or /worker/:tab) so deep
  // links — like a "Job Invite" notification — can land directly on a tab.
  // "feed" (Job Feed) is the bare-/worker default, not "workspace" — a
  // worker's landing page should be where new jobs are, not their current
  // work, matching how BusinessDashboard's default is "overview" rather
  // than an active-projects list.
  const tab = urlTab ?? "feed";
  const setTab = (id) => navigate(id === "feed" ? "/worker" : `/worker/${id}`);
  const projectIdFromUrl = searchParams.get("invite");
  const greeting = getGreeting();

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
      <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.14)] backdrop-blur-2xl dark:border-slate-700/60 dark:bg-slate-900/90">
        {tab === "feed" ? (
          /* Warm Greeting — the "Lobby". Both the identity row and the
             promo/HUD row live in ONE padded block now (no divider, no
             separate bg-slate-50/50 section) — that split used to nearly
             double this header's height for no real reason. */
          <div className="flex flex-shrink-0 flex-col gap-4 p-5 dark:border-slate-800 md:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className={`h-14 w-14 flex-shrink-0 rounded-full object-cover shadow-lg ${verifiedRingClass(shouldShowFrame(currentUser?.verified, currentUser), "md", "emerald")}`}
                  />
                ) : (
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-lg font-semibold text-white shadow-lg ${verifiedRingClass(shouldShowFrame(currentUser?.verified, currentUser), "md", "emerald")}`}>
                    {getInitials(currentUser?.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                    {greeting.text}, {currentUser?.name?.split(" ")[0] ?? "there"}! {greeting.emoji}
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Ready to crush some goals today? Here are your top matches.
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-3">
                <NotificationBell />
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{walletBalance.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-500">Available balance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-emerald-50 to-white px-4 py-2.5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-slate-900">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                  <Sparkles className="h-4 w-4 text-[#ff6b35]" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  No more chasing invoices.{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">Once a business approves your work, the payout lands straight in your wallet.</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* The Hustle Stats card — real job_candidates counts, not a
                    fabricated "momentum" number. */}
                {hustleStats && (
                  <div className="hidden items-center gap-2.5 rounded-2xl border border-white/60 bg-white/50 px-4 py-2 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/50 lg:flex">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-500/10">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Momentum</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {hustleStats.thisWeek} this week
                        <span className="font-normal text-slate-400"> · {hustleStats.thisMonth} this month</span>
                      </p>
                    </div>
                  </div>
                )}
                {/* MASTER_ECONOMY_PLAN.md's Dashboard HUD. */}
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
              </div>
            </div>
          </div>
        ) : (
          /* Slim Contextual Header — the "Workroom": the user already knows
             they navigated here, so just name the page, no repeated greeting. */
          <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 md:px-8">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {TAB_TITLES[tab] ?? "Dashboard"}
            </h1>
            <div className="flex flex-shrink-0 items-center gap-3">
              <NotificationBell />
              <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{walletBalance.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-500">Available balance</p>
                </div>
              </div>
            </div>
          </div>
        )}

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

      <OnboardingWizard />
    </DashboardLayout>
  );
}
