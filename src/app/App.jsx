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
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Code-split the heavy, post-auth dashboard bundles — none of these are
// needed for the first paint of a marketing page or auth, so they shouldn't
// be in the initial JS payload.
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
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

// Gates a route behind real authentication. `roles`, if given, additionally
// requires the signed-in user's role to be one of the listed values —
// someone logged in as a worker who navigates straight to /business is
// redirected to their own dashboard, not shown someone else's.
function ProtectedRoute({ roles, children }) {
  const { status, currentUser } = useAuth();

  if (status === "loading") return <RouteFallback />;
  if (status === "guest") return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
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

  // Navigates by the REAL authenticated role (returned from AuthContext's
  // login/register), not just whichever tab was clicked before signing in —
  // guards against picking "Business" then logging into a worker account.
  const handleAuthSuccess = (user) => {
    const dashboardByRole = {
      worker: "/worker-dashboard",
      business: "/business-dashboard",
      admin: "/admin",
    };
    navigate(dashboardByRole[user.role] ?? "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
      <Route
        path="/worker"
        element={
          <ProtectedRoute roles={["worker"]}>
            <WorkerDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker-dashboard"
        element={
          <ProtectedRoute roles={["worker"]}>
            <WorkerDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker-dashboard/:tab"
        element={
          <ProtectedRoute roles={["worker"]}>
            <WorkerDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/:tab"
        element={
          <ProtectedRoute roles={["worker"]}>
            <WorkerDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business"
        element={
          <ProtectedRoute roles={["business"]}>
            <>
              <BusinessDashboard
                onLogout={handleLogout}
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
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-dashboard"
        element={
          <ProtectedRoute roles={["business"]}>
            <>
              <BusinessDashboard
                onLogout={handleLogout}
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
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <ProtectedRoute roles={["business"]}>
            <BusinessVerification
              onComplete={handleWizardComplete}
              onExit={() => navigate("/business")}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPanel onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
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
    <Toaster position="top-right" richColors />
    </>
  );
}
