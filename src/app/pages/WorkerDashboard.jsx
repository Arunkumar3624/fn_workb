import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Bell, Sparkles } from "lucide-react";
import DashboardLayout from "../components/common/DashboardLayout";
import WorkerSidebar from "../components/worker/WorkerSidebar";
import WorkerJobFeed from "../components/worker/WorkerJobFeed";
import WorkerNegotiationInbox from "../components/worker/WorkerNegotiationInbox";
import WorkerWorkspace, { SECURE_CHAT_CONVERSATIONS, SecureChatEngine } from "../components/worker/WorkerWorkspace";
import WorkerWallet from "../components/worker/WorkerWallet";
import WorkerProfile from "../components/worker/WorkerProfile";
import { usePlatformData } from "../context/PlatformContext";

export default function WorkerDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();
  const { invitesDb, walletBalance } = usePlatformData();

  // Tab is driven entirely by the URL (/worker or /worker/:tab) so deep
  // links — like a "Job Invite" notification — can land directly on a tab.
  const tab = urlTab ?? "workspace";
  const setTab = (id) => navigate(id === "workspace" ? "/worker" : `/worker/${id}`);
  const inviteIdFromUrl = searchParams.get("invite");

  const hasPendingInvites = invitesDb.some((invite) => !invite.isAccepted);

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
              {/* Clicking a pending "Job Invite" notification pushes straight to Negotiations */}
              <button
                onClick={() => navigate("/worker/negotiations")}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                title={hasPendingInvites ? "You have a pending job invite" : "Notifications"}
              >
                <Bell className="h-5 w-5" />
                {hasPendingInvites && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f172a] text-sm font-semibold text-white">
                  PS
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
          {tab === "negotiations" && <WorkerNegotiationInbox initialInviteId={inviteIdFromUrl} />}
          {tab === "workspace" && <WorkerWorkspace />}
          {tab === "messages" && (
            <SecureChatEngine
              conversations={SECURE_CHAT_CONVERSATIONS}
              selectedThreadId={SECURE_CHAT_CONVERSATIONS[0]?.threadId}
              onBack={() => setTab("workspace")}
            />
          )}
          {tab === "wallet" && <WorkerWallet />}
          {tab === "profile" && <WorkerProfile />}
        </div>
      </div>
    </DashboardLayout>
  );
}
