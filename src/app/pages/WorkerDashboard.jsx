import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Coins, Flame, Sparkles } from "lucide-react";
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
import { getInitials } from "../utils/formValidation";
import { getSocket } from "../lib/socketClient";

export default function WorkerDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);

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
                Stop waiting for invoices.{' '}
                <span className="font-semibold text-slate-900">Cash out in 60 seconds upon project approval.</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <Coins className="h-4 w-4 text-amber-400" />
                  {currentUser?.bridge_tokens ?? 0}
                  <span className="hidden font-normal text-slate-300 md:inline">Tokens</span>
                </span>
              </div>
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
    </DashboardLayout>
  );
}
