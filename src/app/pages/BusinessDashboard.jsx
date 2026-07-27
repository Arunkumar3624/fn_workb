import { useState } from "react";
import { Building2 } from "lucide-react";
import DashboardLayout from "../components/common/DashboardLayout";
import BusinessSidebar from "../components/business/BusinessSidebar";
import BusinessOverview from "../components/business/BusinessOverview";
import BusinessPostJob from "../components/business/BusinessPostJob";
import BusinessWorkers from "../components/business/BusinessWorkers";
import BusinessProjects from "../components/business/BusinessProjects";
import BusinessNegotiationHub from "../components/business/BusinessNegotiationHub";
import BusinessCompany from "../components/business/BusinessCompany";
import SettingsPage from "./SettingsPage";
import { useAuth } from "../context/AuthContext";
import { getTierData } from "../utils/gamification";

export default function BusinessDashboard({ onLogout, onVerify, isVerified = false }) {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("overview");
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
        <div className="flex justify-end border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#0F172A]/90 px-3 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-md">
            <Building2 className="h-4 w-4 text-[#FF6B35]" />
            {currentUser?.bridge_tokens ?? 0} Credits
            <span className="h-4 w-px bg-white/20" />
            {corporateTier} Tier
          </div>
        </div>
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
        {tab === "projects" && <BusinessProjects />}
        {tab === "negotiations" && (
          <BusinessNegotiationHub
            onFindTalent={() => setTab("workers")}
            onViewContractTerms={() => setTab("projects")}
          />
        )}
        {tab === "company" && <BusinessCompany />}
        {tab === "settings" && <SettingsPage />}
      </div>
    </DashboardLayout>
  );
}
