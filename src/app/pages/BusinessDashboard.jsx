import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Building2, Coins, ShieldAlert, ShieldCheck } from "lucide-react";
import DashboardLayout from "../components/common/DashboardLayout";
import BusinessSidebar from "../components/business/BusinessSidebar";
import BusinessOverview from "../components/business/BusinessOverview";
import BusinessPostJob from "../components/business/BusinessPostJob";
import BusinessWorkers from "../components/business/BusinessWorkers";
import BusinessProjects from "../components/business/BusinessProjects";
import BusinessNegotiationHub from "../components/business/BusinessNegotiationHub";
import BusinessCompany from "../components/business/BusinessCompany";
import BusinessPerksShop from "../components/business/BusinessPerksShop";
import SettingsPage from "./SettingsPage";
import { useAuth } from "../context/AuthContext";
import { getTierData } from "../utils/gamification";
import { getInitials } from "../utils/formValidation";
import EconomyInfoTooltip from "../components/shared/EconomyInfoTooltip";
import NotificationBell from "../components/shared/NotificationBell";
import OnboardingWizard from "../components/common/OnboardingWizard";

const BUSINESS_TAB_IDS = new Set([
  "overview",
  "post",
  "workers",
  "projects",
  "negotiations",
  "company",
  "perks",
  "settings",
]);

export default function BusinessDashboard({ onLogout, onVerify, isVerified = false }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  // ?tab= lets a plain URL string (realtime/events.js's businessDashboardUrl
  // — what NotificationBell.jsx actually navigates to) land on the right
  // tab, same convention as EconomyHub.jsx/WorkerWallet.jsx. location.state
  // stays the mechanism for in-app navigate() calls that already have a
  // location object to attach state to (SupportFab.jsx, BusinessProjects.jsx's
  // "Open Chat").
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState(
    location.state?.tab ?? (BUSINESS_TAB_IDS.has(requestedTab) ? requestedTab : "overview")
  );
  // Tab state here is local, not URL-driven (unlike WorkerDashboard) — a
  // navigate("/business-dashboard", { state: { tab: "support" } }) (see
  // SupportFab.jsx) lands on the SAME route, so the component doesn't
  // remount and the useState initializer above only ever runs once. This
  // re-syncs on every subsequent navigation that carries a tab in state or
  // search params.
  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab);
  }, [location.state]);

  useEffect(() => {
    if (BUSINESS_TAB_IDS.has(requestedTab)) setTab(requestedTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab]);
  // Set right before switching to the Negotiations tab (see
  // BusinessProjects.jsx's "Open Chat in Negotiations" button) so the right
  // thread is already focused when BusinessNegotiationHub mounts — Projects
  // no longer embeds its own chat, per the permanent-chat-history upgrade.
  const [negotiationFocusId, setNegotiationFocusId] = useState(null);
  // MASTER_ECONOMY_PLAN.md's business-side Ledger reuses the same
  // xp/current_level/bridge_tokens columns as the worker track (no
  // separate schema exists yet — see migrations/012_gamification_foundation.sql's
  // own comment) — "Corporate Credits"/"Corporate Tier" here are just the
  // business-facing label on top of the same real, currently-zero-until-
  // earned columns, not a fabricated number.
  const { tier: corporateTier } = getTierData(currentUser?.current_level ?? 1);

  const handlePostJob = () => {
    if (!isVerified) {
      onVerify();
    } else {
      setTab("post");
    }
  };

  // BusinessPostJob now posts an OPEN job directly (no forced worker
  // selection) — land on Projects, where the new post shows up right away.
  const handleJobPosted = () => {
    setTab("projects");
  };

  return (
    <DashboardLayout
      sidebar={
        <BusinessSidebar
          tab={tab}
          onTabChange={setTab}
          onPostJob={handlePostJob}
          onVerify={onVerify}
          onLogout={onLogout}
          isVerified={isVerified}
        />
      }
    >
      <div className="flex h-full flex-col bg-white dark:bg-slate-950">
        <header className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
          <div
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
              isVerified
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900"
                : "border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white dark:border-amber-900/40 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900"
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              {isVerified ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-[#FF6B35]" />
              )}
            </div>
            <p className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-300">
              {isVerified ? (
                <>
                  Funds stay protected.{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">Escrow releases only after you approve the work.</span>
                </>
              ) : (
                <>
                  Verify your business to start hiring.{" "}
                  <button type="button" onClick={onVerify} className="font-semibold text-[#FF6B35] hover:underline">
                    Takes just a few minutes →
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-2xl border border-white/20 bg-[#0F172A]/90 px-4 py-2 shadow-sm backdrop-blur-md sm:flex">
              <button
                type="button"
                onClick={() => setTab("perks")}
                title="Go to the Perks Shop"
                className="flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-amber-300"
              >
                <Coins className="h-4 w-4 text-amber-400" />
                {currentUser?.bridge_tokens ?? 0}
                <span className="hidden font-normal text-slate-300 md:inline">Credits</span>
              </button>
              <EconomyInfoTooltip title="How Corporate Credits work">
                <p>Corporate Credits are your spendable balance — use them in the Perks Shop on hiring visibility boosts.</p>
                <p className="mt-2">You earn <strong>+15 Credits</strong> automatically every time a project you posted completes with no dispute. Your Enterprise Tier below is separate — based on your total real spend, not Credits.</p>
              </EconomyInfoTooltip>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Building2 className="h-4 w-4 text-[#FF6B35]" />
                {corporateTier}
                <span className="hidden font-normal text-slate-300 md:inline">Tier</span>
              </span>
            </div>
            <NotificationBell />
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white ${
                  isVerified ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                {getInitials(currentUser?.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{isVerified ? "Verified" : "Unverified"}</p>
                <p className="text-xs text-slate-500">Business status</p>
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 ${tab === "negotiations" ? "overflow-hidden" : "overflow-auto"}`}>
          {tab === "overview" && (
            <BusinessOverview
              onPostJob={handlePostJob}
              onViewProjects={() => setTab("projects")}
              isVerified={isVerified}
            />
          )}
          {tab === "post" && (
            <BusinessPostJob onVerify={onVerify} isVerified={isVerified} onJobPosted={handleJobPosted} />
          )}
          {tab === "workers" && (
            <BusinessWorkers
              onViewProjects={() => setTab("projects")}
              isVerified={isVerified}
              onVerify={onVerify}
            />
          )}
          {tab === "projects" && (
            <BusinessProjects
              onOpenChat={(projectId) => {
                setNegotiationFocusId(projectId);
                setTab("negotiations");
              }}
            />
          )}
          {tab === "negotiations" && (
            <BusinessNegotiationHub
              initialProjectId={negotiationFocusId}
              onFindTalent={() => setTab("workers")}
              onViewContractTerms={() => setTab("projects")}
            />
          )}
          {tab === "company" && <BusinessCompany />}
          {tab === "perks" && <BusinessPerksShop />}
          {tab === "settings" && <SettingsPage />}
        </div>
      </div>

      <OnboardingWizard />
    </DashboardLayout>
  );
}
