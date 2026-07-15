import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { PageShell } from "./components/common/PageShell";
import LandingPage from "./pages/LandingPage";
import FindWorkPage from "./pages/FindWorkPage";
import HireTalentPage from "./pages/HireTalentPage";
import EnterprisePage from "./pages/EnterprisePage";
import AuthPage from "./pages/AuthPage";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerShareableProfile from "./components/worker/WorkerShareableProfile";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessVerification from "./pages/BusinessVerification";
import BusinessVerificationDrawer from "./pages/BusinessVerificationDrawer";
import AdminPanel from "./pages/AdminPanel";
import InvoicePage from "./pages/InvoicePage";
import CelebrationOverlay from "./components/common/CelebrationOverlay";
import { PlatformProvider } from "./context/PlatformContext";

export default function App() {
  return (
    <PlatformProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </PlatformProvider>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("worker");
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);
  const [showPayDrawer, setShowPayDrawer] = useState(false);
  const [showVerifiedCelebration, setShowVerifiedCelebration] = useState(false);

  const handleSelect = (type) => {
    setUserType(type);
    navigate("/auth");
  };

  const handleAuthSuccess = () => {
    navigate(`/${userType}`);
  };

  const handleWizardComplete = () => {
    navigate("/business");
    setShowPayDrawer(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayDrawer(false);
    setIsBusinessVerified(true);
    setShowVerifiedCelebration(true);
  };

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <PageShell onSelect={handleSelect}>
            <LandingPage onSelect={handleSelect} />
          </PageShell>
        }
      />
      <Route
        path="/find-work"
        element={
          <PageShell onSelect={handleSelect}>
            <FindWorkPage onSelect={handleSelect} />
          </PageShell>
        }
      />
      <Route
        path="/hire-talent"
        element={
          <PageShell onSelect={handleSelect}>
            <HireTalentPage onSelect={handleSelect} />
          </PageShell>
        }
      />
      <Route
        path="/enterprise"
        element={
          <PageShell onSelect={handleSelect}>
            <EnterprisePage onSelect={handleSelect} />
          </PageShell>
        }
      />
      <Route
        path="/auth"
        element={
          <AuthPage
            userType={userType}
            onSuccess={handleAuthSuccess}
            onBack={() => navigate("/")}
          />
        }
      />
      <Route path="/worker" element={<WorkerDashboard onLogout={() => navigate("/")} />} />
      <Route path="/worker/:tab" element={<WorkerDashboard onLogout={() => navigate("/")} />} />
      <Route path="/p/priya-sharma" element={<WorkerShareableProfile />} />
      <Route
        path="/business"
        element={
          <>
            <BusinessDashboard
              onLogout={() => navigate("/")}
              onVerify={() => navigate("/verify")}
              isVerified={isBusinessVerified}
            />
            {showPayDrawer && (
              <BusinessVerificationDrawer
                onClose={() => setShowPayDrawer(false)}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
          </>
        }
      />
      <Route
        path="/verify"
        element={
          <BusinessVerification
            onComplete={handleWizardComplete}
            onExit={() => navigate("/business")}
          />
        }
      />
      <Route path="/admin" element={<AdminPanel onLogout={() => navigate("/")} />} />
      <Route path="/invoice" element={<InvoicePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {showVerifiedCelebration && (
      <CelebrationOverlay
        variant="verified"
        title="Your business is verified"
        message="Your company now carries the Verified badge across WorkBridge. Job posting is unlocked — freelancers can trust every brief you publish."
        primaryLabel="Post your first job"
        onPrimary={() => setShowVerifiedCelebration(false)}
        onClose={() => setShowVerifiedCelebration(false)}
      />
    )}
    </>
  );
}
