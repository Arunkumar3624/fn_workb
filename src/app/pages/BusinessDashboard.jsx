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
import { verifiedRingClass } from "../utils/verification";

// A real, local-time-of-day greeting — matches WorkerDashboard.jsx's own
// getGreeting exactly, kept as its own copy since these are two separate
// page components with no shared "dashboard chrome" module today.
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return { text: "Good Evening", emoji: "🌙" };
}

// "Lobby vs. Workroom": the big warm greeting only belongs on the landing
// tab (Overview). Every other tab is a workroom the user already knows
// they're in — it gets a slim, contextual title instead.
const TAB_TITLES = {
  post: "Post a Job",
  workers: "Find Workers",
  projects: "Active Projects",
  negotiations: "Negotiations",
  company: "Company Profile",
  perks: "Perks Shop",
  settings: "Account Settings",
};

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
  const greeting = getGreeting();

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
      <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-900/90">
        {tab === "overview" ? (
          /* Warm Greeting — the "Lobby": identity anchor + a real,
             local-time-of-day greeting, shown only on the landing tab. */
          <div className="flex flex-shrink-0 flex-col items-start gap-6 p-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex min-w-0 items-center gap-4">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className={`h-16 w-16 flex-shrink-0 rounded-full object-cover shadow-lg sm:h-20 sm:w-20 ${verifiedRingClass(isVerified)}`}
                />
              ) : (
                <div
                  className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white shadow-lg sm:h-20 sm:w-20 ${verifiedRingClass(isVerified)} ${
                    isVerified ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  {getInitials(currentUser?.name)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {greeting.text}, {currentUser?.name?.split(" ")[0] ?? "there"}! {greeting.emoji}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                  Here is what's happening with your active projects today.
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <NotificationBell />
              <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                isVerified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {isVerified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {isVerified ? "Verified" : "Unverified"}
              </span>
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
              <span className={`hidden items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm sm:inline-flex ${
                isVerified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {isVerified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        )}

        {/* Info strip — the verification banner + real HUD stats (Corporate
            Credits, Enterprise Tier), kept as their own real elements just
            below the greeting instead of crowding into it. Landing-tab only,
            same as the greeting itself. */}
        {tab === "overview" && (
        <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
          </div>
        </div>
        )}

        <div className={`flex-1 ${tab === "negotiations" ? "overflow-hidden" : "wb-scroll-clean overflow-y-auto overflow-x-hidden"}`}>
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
