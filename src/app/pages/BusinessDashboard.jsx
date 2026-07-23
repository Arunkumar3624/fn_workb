import { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import BusinessSidebar from "../components/business/BusinessSidebar";
import BusinessOverview from "../components/business/BusinessOverview";
import BusinessPostJob from "../components/business/BusinessPostJob";
import BusinessWorkers from "../components/business/BusinessWorkers";
import BusinessProjects from "../components/business/BusinessProjects";
import BusinessNegotiationHub from "../components/business/BusinessNegotiationHub";
import BusinessCompany from "../components/business/BusinessCompany";

export default function BusinessDashboard({ onLogout, onVerify, isVerified = false }) {
  const [tab, setTab] = useState("overview");

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
      </div>
    </DashboardLayout>
  );
}
