import { useLocation, useNavigate } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// A global, always-reachable floating help button ("MNC-style" corner
// bubble) — one click straight to the caller's real support thread
// (SupportChat.jsx, backed by support_threads/support_messages), not a
// decorative link. Hidden for admins (they ARE the support team, reached
// via AdminSupportTab instead) and during the business verification
// wizard (a focused flow that shouldn't be interrupted mid-step).
const HIDDEN_PATH_PREFIXES = ["/verify"];

export default function SupportFab() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser || currentUser.role === "admin") return null;
  if (HIDDEN_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))) return null;

  const goToSupport = () => {
    if (currentUser.role === "worker") {
      // Worker dashboard tabs are URL-driven (/worker/:tab) — a plain
      // navigate is enough, see WorkerDashboard.jsx.
      navigate("/worker/support");
    } else {
      // Business dashboard tabs are local component state, not URL-driven —
      // BusinessDashboard.jsx reads this router state to jump straight to
      // the Support tab.
      navigate("/business-dashboard", { state: { tab: "support" } });
    }
  };

  return (
    <button
      type="button"
      onClick={goToSupport}
      aria-label="Get help — go to Support"
      title="Get help"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-[0_10px_30px_-8px_rgba(255,107,53,0.55)] transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <LifeBuoy className="h-6 w-6" />
    </button>
  );
}
