import { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import BusinessSidebar from "../components/business/BusinessSidebar";
import BusinessOverview from "../components/business/BusinessOverview";
import BusinessPostJob from "../components/business/BusinessPostJob";
import BusinessWorkers from "../components/business/BusinessWorkers";
import BusinessProjects from "../components/business/BusinessProjects";
import BusinessCompany from "../components/business/BusinessCompany";
import BusinessInboxRehire from "../components/business/BusinessInboxRehire";

export default function BusinessDashboard({ onLogout, onVerify, isVerified = false }) {
  const [tab, setTab] = useState("overview");
  const [activeThread, setActiveThread] = useState(null);
  // chatKey increments each time "Chat" is clicked so useEffect re-fires
  // even if the same worker is clicked twice in a row
  const [chatKey, setChatKey] = useState(0);

  const handlePostJob = () => {
    if (!isVerified) {
      onVerify();
    } else {
      setTab("post");
    }
  };

  const handleOpenChat = (workerName) => {
    setActiveThread(workerName);
    setChatKey((k) => k + 1);
    setTab("inbox");
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
          <BusinessPostJob onVerify={onVerify} isVerified={isVerified} />
        )}
        {tab === "workers"  && <BusinessWorkers onOpenChat={handleOpenChat} />}
        {tab === "projects" && <BusinessProjects onOpenChat={handleOpenChat} />}
        {tab === "inbox"    && <BusinessInboxRehire initialThread={activeThread} chatKey={chatKey} />}
        {tab === "company"  && <BusinessCompany />}
      </div>
    </DashboardLayout>
  );
}
