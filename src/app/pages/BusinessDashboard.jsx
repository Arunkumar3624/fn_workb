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
  // Set by BusinessPostJob's step 1 submit, consumed by BusinessWorkers'
  // "pick a worker to invite" step 2 — the real Post Job -> Get Matched ->
  // Select Worker flow from the business plan.
  const [pendingJob, setPendingJob] = useState(null);

  const handlePostJob = () => {
    if (!isVerified) {
      onVerify();
    } else {
      setTab("post");
    }
  };

  const handleContinueToWorkers = (draft) => {
    setPendingJob(draft);
    setTab("workers");
  };

  const handleInviteSent = () => {
    setPendingJob(null);
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
      <div className="flex-1 overflow-auto">
        {tab === "overview" && (
          <BusinessOverview
            onPostJob={handlePostJob}
            onViewProjects={() => setTab("projects")}
            isVerified={isVerified}
          />
        )}
        {tab === "post" && (
          <BusinessPostJob onVerify={onVerify} isVerified={isVerified} onContinueToWorkers={handleContinueToWorkers} />
        )}
        {tab === "workers" && (
          <BusinessWorkers
            pendingJob={pendingJob}
            onInviteSent={pendingJob ? handleInviteSent : undefined}
            onViewProjects={() => setTab("projects")}
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
