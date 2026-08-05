import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// The mandatory UX safety net for POST /api/admin/impersonate — impossible
// to miss, always on top (z-[100], above SupportFab's z-50), and the only
// way this ever goes away is the explicit button below or the token's own
// 30-minute expiry. `fixed` (not `sticky`, not normal flow) on purpose: a
// banner that occupies real document-flow space would push every nested
// `h-screen` dashboard layout below it out of the viewport — the exact bug
// class already found and fixed in BusinessNegotiationHub.jsx. Overlaying
// the very top ~40px of the page for this rare, high-alert state is the
// right trade-off, not a regression.
export default function ImpersonationBanner() {
  const { currentUser, isImpersonating, endImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const handleEnd = () => {
    endImpersonation();
    navigate("/admin");
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-red-600 px-4 py-2 text-white shadow-lg">
      <ShieldAlert className="h-4 w-4 flex-shrink-0" />
      <p className="text-xs font-bold sm:text-sm">
        YOU ARE IMPERSONATING {currentUser?.name ?? "this user"}. ALL ACTIONS ARE LOGGED.
      </p>
      <button
        type="button"
        onClick={handleEnd}
        className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700 transition-transform active:scale-95 hover:bg-red-50"
      >
        End Session &amp; Return to Admin
      </button>
    </div>
  );
}
