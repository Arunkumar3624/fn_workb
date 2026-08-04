import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import SupportChat from "../components/shared/SupportChat";
import SettingsPage from "./SettingsPage";
import { useAuth } from "../context/AuthContext";
import { getTierData } from "../utils/gamification";
import { getInitials } from "../utils/formValidation";

export default function BusinessDashboard({ onLogout, onVerify, isVerified = false }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab ?? "overview");
  // Tab state here is local, not URL-driven (unlike WorkerDashboard) — a
  // navigate("/business-dashboard", { state: { tab: "support" } }) (see
  // SupportFab.jsx) lands on the SAME route, so the component doesn't
  // remount and the useState initializer above only ever runs once. This
  // re-syncs on every subsequent navigation that carries a tab in state.
  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab);
  }, [location.state]);
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
      <div className={`flex-1 ${tab === "negotiations" ? "overflow-hidden" : "overflow-auto"}`}>
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-xl lg:px-8">
          <div
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
              isVerified
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white"
                : "border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white"
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              {isVerified ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-[#FF6B35]" />
              )}
            </div>
            <p className="min-w-0 truncate text-sm text-slate-700">
              {isVerified ? (
                <>
                  Funds stay protected.{" "}
                  <span className="font-semibold text-slate-900">Escrow releases only after you approve the work.</span>
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
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Coins className="h-4 w-4 text-amber-400" />
                {currentUser?.bridge_tokens ?? 0}
                <span className="hidden font-normal text-slate-300 md:inline">Credits</span>
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Building2 className="h-4 w-4 text-[#FF6B35]" />
                {corporateTier}
                <span className="hidden font-normal text-slate-300 md:inline">Tier</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white ${
                  isVerified ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                {getInitials(currentUser?.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{isVerified ? "Verified" : "Unverified"}</p>
                <p className="text-xs text-slate-500">Business status</p>
              </div>
            </div>
          </div>
        </header>
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
        {tab === "support" && <SupportChat />}
        {tab === "settings" && <SettingsPage />}
      </div>
    </DashboardLayout>
  );
}
