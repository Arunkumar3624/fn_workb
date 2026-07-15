import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { trackPageView } from "./lib/analytics";
import { PageShell } from "./components/common/PageShell";
import LandingPage from "./pages/LandingPage";
import FindWorkPage from "./pages/FindWorkPage";
import HireTalentPage from "./pages/HireTalentPage";
import EnterprisePage from "./pages/EnterprisePage";
import AuthPage from "./pages/AuthPage";
import InvoicePage from "./pages/InvoicePage";
import CelebrationOverlay from "./components/common/CelebrationOverlay";
import { PlatformProvider } from "./context/PlatformContext";

// Code-split the heavy, post-auth dashboard bundles — none of these are
// needed for the first paint of a marketing page or auth, so they shouldn't
// be in the initial JS payload.
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const WorkerShareableProfile = lazy(() => import("./components/worker/WorkerShareableProfile"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const BusinessVerification = lazy(() => import("./pages/BusinessVerification"));
const BusinessVerificationDrawer = lazy(() => import("./pages/BusinessVerificationDrawer"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
    </div>
  );
}

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
  const location = useLocation();
  const [userType, setUserType] = useState("worker");

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
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
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>

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
