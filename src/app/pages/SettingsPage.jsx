import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  AlertCircle,
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Headphones,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateOwnProfile } from "../lib/profilesApi";
import { changePassword, deactivateAccount } from "../lib/authApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getInitials } from "../utils/formValidation";
import { ApiError } from "../lib/apiClient";
import { getPushStatus, subscribeToPush, unsubscribeFromPush } from "../lib/pushNotifications";
import SupportChat from "../components/shared/SupportChat";
import ThemeToggle from "../components/shared/ThemeToggle";
import VerificationFeesTable from "../components/shared/VerificationFeesTable";

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;

const TABS = [
  { id: "general", label: "General Profile", icon: User },
  { id: "security", label: "Security & Auth", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Subscriptions", icon: Sparkles },
  { id: "support", label: "Support", icon: Headphones },
  { id: "danger", label: "Danger Zone", icon: ShieldAlert },
];

function SectionCard({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      {children}
    </div>
  );
}

function GeneralProfileTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const updated = await updateOwnProfile({ name: name.trim(), phone: phone.trim() || undefined });
      updateCurrentUser(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError("");
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image is too large — please choose one under 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setAvatarUploading(true);
      try {
        const updated = await updateOwnProfile({ avatarUrl: reader.result });
        updateCurrentUser(updated);
      } catch (err) {
        setAvatarError(err instanceof ApiError ? err.message : "Could not upload photo.");
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const fullProfilePath = currentUser?.role === "business" ? "/business/company" : "/worker/profile";

  return (
    <div className="space-y-6">
    <SectionCard>
      <div>
        <p className="text-sm font-bold text-[#0A1128] dark:text-white">Appearance</p>
        <p className="mt-1 text-xs text-slate-400">Choose how WorkBridge looks on this device.</p>
      </div>
      <div className="mt-4">
        <ThemeToggle />
      </div>
    </SectionCard>
    <SectionCard>
      <div className="mb-6 flex items-center gap-4">
        <label className="relative flex-shrink-0 cursor-pointer">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B3FAB] text-lg font-bold text-white">
              {getInitials(currentUser?.name)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            {avatarUploading ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" /> : <Camera className="h-3 w-3 text-slate-500" />}
          </span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={avatarUploading} />
        </label>
        <div>
          <p className="text-sm font-bold text-[#0A1128] dark:text-white">Profile photo</p>
          <p className="text-xs text-slate-400">JPG or PNG, under 1.5MB.</p>
          {avatarError && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{avatarError}</p>}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit number"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {saveError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Saved.
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(fullProfilePath)}
            className="text-xs font-bold text-[#1B3FAB] hover:underline dark:text-blue-400"
          >
            Edit bio, skills &amp; more on your full profile →
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#0A1128] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a2547] disabled:opacity-60 dark:bg-white dark:text-[#0A1128] dark:hover:bg-slate-200"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </form>
    </SectionCard>
    </div>
  );
}

function SecurityTab() {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex items-center gap-2">
          <ShieldCheck className={`h-4 w-4 ${currentUser?.email_verified ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`} />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Email {currentUser?.email_verified ? "verified" : "not verified"}
          </p>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="mb-4 text-sm font-bold text-[#0A1128] dark:text-white">Change Password</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Password updated.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !currentPassword || !newPassword}
            className="rounded-xl bg-[#0A1128] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a2547] disabled:opacity-60 dark:bg-white dark:text-[#0A1128] dark:hover:bg-slate-200"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

// "unsupported" (no Push API — Safari <16.4, most in-app browsers),
// "not-configured" (backend has no VAPID keys set), "denied" (blocked at
// the browser level — only fixable from the browser's own site settings),
// "subscribed", "unsubscribed", or "checking" while getPushStatus resolves.
const PUSH_STATUS_COPY = {
  checking: { label: "Checking…", dot: "bg-slate-300", tone: "text-slate-400 bg-slate-50 border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700" },
  unsupported: { label: "Not supported on this browser", dot: "bg-slate-300", tone: "text-slate-400 bg-slate-50 border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700" },
  "not-configured": { label: "Not available yet", dot: "bg-slate-300", tone: "text-slate-400 bg-slate-50 border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700" },
  denied: { label: "Blocked in browser settings", dot: "bg-red-500", tone: "text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/40" },
  subscribed: { label: "Enabled on this device", dot: "bg-emerald-500", tone: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40" },
  unsubscribed: { label: "Off on this device", dot: "bg-slate-300", tone: "text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700" },
};

function NotificationsTab() {
  const [status, setStatus] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshStatus = () => {
    getPushStatus()
      .then(setStatus)
      .catch(() => setStatus("unsupported"));
  };

  useEffect(refreshStatus, []);

  const handleToggle = async () => {
    setBusy(true);
    setError("");
    try {
      if (status === "subscribed") {
        await unsubscribeFromPush();
      } else {
        const granted = await subscribeToPush();
        if (!granted) {
          setStatus("denied");
          return;
        }
      }
      refreshStatus();
    } catch (err) {
      setError(err.message || "Could not update your notification settings.");
    } finally {
      setBusy(false);
    }
  };

  const canToggle = status === "subscribed" || status === "unsubscribed";
  const isOn = status === "subscribed";
  const copy = PUSH_STATUS_COPY[status] ?? PUSH_STATUS_COPY.checking;

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 text-[#FF6B35] ring-1 ring-orange-100 dark:from-orange-500/10 dark:to-amber-500/10 dark:ring-orange-500/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1128] dark:text-white">Push Notifications</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Get a real notification on this device for new messages, invites, applications, and project updates —
                even when WorkBridge isn't open in a tab.
              </p>
              <span
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${copy.tone}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${copy.dot} ${status === "subscribed" ? "animate-pulse" : ""}`} />
                {copy.label}
              </span>
              {error && <p className="mt-2 text-xs font-semibold text-red-500 dark:text-red-400">{error}</p>}
            </div>
          </div>
          {canToggle && (
            <button
              onClick={handleToggle}
              disabled={busy}
              role="switch"
              aria-checked={isOn}
              aria-label="Toggle push notifications"
              className={`relative h-8 w-14 flex-shrink-0 rounded-full shadow-inner transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                isOn ? "bg-[#FF6B35]" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ${
                  isOn ? "translate-x-6" : "translate-x-1"
                }`}
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                ) : (
                  <Bell className={`h-3 w-3 ${isOn ? "text-[#FF6B35]" : "text-slate-300"}`} />
                )}
              </span>
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// Business-only now — the worker-facing subscription preview moved to
// WorkerWallet.jsx's own tab (Target 3's consolidation), so this settings
// tab is hidden entirely for workers (see the isWorker guard where this is
// rendered). Nothing worker-specific is left to branch on here.
//
// Yearly prices are the real, exact figures WorkBridge is pricing these at
// (2 months free — 10 months' worth of monthly billing) — not a computed
// discount approximation, matching WorkerWallet.jsx's own SUBSCRIPTION_TIERS
// pattern for the same reason.
const BUSINESS_TIERS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: ShieldCheck,
    perks: ["2 job posts/month", "Standard matching"],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    icon: TrendingUp,
    highlight: true,
    perks: ["20 posts/month", "Smart matching", "Dashboard"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 1499,
    yearlyPrice: 14999,
    icon: Building2,
    premium: true,
    perks: ["Unlimited posts", "Bulk hiring", "Dedicated manager"],
  },
];

function formatBusinessTierPrice(tier, isYearly) {
  if (tier.monthlyPrice === 0) return { amount: "₹0", period: "/mo" };
  if (!isYearly) return { amount: `₹${tier.monthlyPrice.toLocaleString("en-IN")}`, period: "/mo" };
  return { amount: `₹${tier.yearlyPrice.toLocaleString("en-IN")}`, period: "/year (2 months free)" };
}

// Same real, controlled Monthly/Yearly toggle as WorkerWallet.jsx's
// BillingToggle — kept as its own small copy here rather than a shared
// import, since a business page reaching into a worker component folder for
// a 20-line pill would be a stranger dependency than just repeating it.
function BillingToggle({ isYearly, onChange }) {
  return (
    <div className="relative inline-flex items-center rounded-full bg-slate-100 p-1 dark:bg-slate-800">
      <motion.span
        className="absolute inset-y-1 left-1 w-24 rounded-full bg-white shadow-sm dark:bg-slate-700"
        animate={{ x: isYearly ? 96 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`relative z-10 w-24 rounded-full py-2 text-sm transition-colors ${
          !isYearly ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`relative z-10 w-24 rounded-full py-2 text-sm transition-colors ${
          isYearly ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        Yearly
      </button>
      {/* Pushed clear above the pill (was -top-3, which sat right on top of
          the Yearly label and overlapped it) so it reads as its own badge,
          not a smear across the toggle. */}
      <span className="absolute -right-2 -top-7 whitespace-nowrap rounded-full bg-[#FF6B35]/10 px-2 py-1 text-[11px] font-bold text-[#FF6B35]">
        2 Months Free
      </span>
    </div>
  );
}

function BillingTab() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 dark:border-slate-800 dark:from-slate-800/60 dark:to-slate-900">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Current Plan</p>
          <p className="mt-1 text-2xl font-black text-[#0A1128] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Free
          </p>
        </div>
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
      </div>

      <div className="flex justify-center">
        <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {BUSINESS_TIERS.map((tier) => {
          const Icon = tier.icon;
          const { amount, period } = formatBusinessTierPrice(tier, isYearly);
          const cardCls = tier.premium
            ? "bg-[#0F172A] text-white border border-white/10 shadow-lg shadow-slate-900/20"
            : tier.highlight
              ? "bg-white border-2 border-[#FF6B35] shadow-md shadow-orange-500/10 dark:bg-slate-900"
              : "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800";

          return (
            <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 ${cardCls}`}>
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF6B35] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  Most Popular
                </span>
              )}
              <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tier.premium ? "bg-white/10 text-[#FF6B35]" : "bg-slate-100 text-[#1B3FAB] dark:bg-slate-800"}`}>
                <Icon className="h-4 w-4" />
              </span>

              <p className={`text-xs font-bold uppercase tracking-wide ${tier.premium ? "text-slate-300" : "text-slate-400"}`}>
                {tier.name}
              </p>
              <p className="mt-1.5 flex items-baseline gap-1">
                <span className={`text-2xl font-black ${tier.premium ? "" : "text-[#0A1128] dark:text-white"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {amount}
                </span>
                <span className={`text-xs font-semibold ${tier.premium ? "text-slate-400" : "text-slate-400"}`}>{period}</span>
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs leading-5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                        tier.premium ? "bg-emerald-400/20 text-emerald-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className={tier.premium ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className={`mt-6 w-full cursor-not-allowed rounded-xl py-2.5 text-xs font-bold ${
                  tier.premium
                    ? "bg-white/10 text-slate-300"
                    : tier.id === "free"
                      ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      : "border border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500"
                }`}
              >
                {tier.id === "free" ? "Current Plan" : "Coming soon"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-slate-400">
        Paid plans aren't live yet — this is a preview of what's coming.
      </p>

      <VerificationFeesTable />
    </div>
  );
}

function DangerZoneTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDeactivate = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await deactivateAccount(confirmation.trim());
      logout();
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not deactivate your account.");
      setSubmitting(false);
    }
  };

  return (
    <SectionCard>
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-bold text-red-700 dark:text-red-400">Deactivate My Account</p>
        <p className="mt-1.5 text-xs leading-relaxed text-red-600 dark:text-red-400/80">
          Your account will be immediately signed out and blocked from signing back in. This is reversible —
          contact support if you change your mind. This does not permanently delete your data.
        </p>
        <form onSubmit={handleDeactivate} className="mt-4 space-y-3">
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder='Type "DEACTIVATE" to confirm'
            className="w-full rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-900/40 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm text-red-600 dark:border-red-900/40 dark:bg-slate-900 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={confirmation.trim() !== "DEACTIVATE" || submitting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Deactivate my account
          </button>
        </form>
      </div>
    </SectionCard>
  );
}

export default function SettingsPage() {
  useDocumentTitle("Settings — WorkBridge");
  const location = useLocation();
  const { currentUser } = useAuth();
  // Target 3's consolidation moved the worker-facing subscription preview
  // into WorkerWallet.jsx's own tab — this settings tab would otherwise be
  // a second, redundant path to the same thing. Business's Billing tab
  // (Standard/Growth) isn't part of that consolidation and stays put.
  const isWorker = currentUser?.role === "worker";
  const visibleTabs = isWorker ? TABS.filter((tab) => tab.id !== "billing") : TABS;
  // settingsTab lets a caller (SupportFab.jsx) deep-link straight to a
  // specific tab here — e.g. navigate("/worker/settings", { state: {
  // settingsTab: "support" } }). The effect below re-syncs on every
  // subsequent navigation carrying it, since a navigate() to a route this
  // component is already mounted on doesn't remount it (the useState
  // initializer only runs once) — same pattern as BusinessDashboard.jsx's
  // own outer-tab sync.
  const [activeTab, setActiveTab] = useState(location.state?.settingsTab ?? "general");

  useEffect(() => {
    if (location.state?.settingsTab) setActiveTab(location.state.settingsTab);
  }, [location.state]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0A1128] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Settings
        </h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="flex-shrink-0 md:w-1/4">
          <nav className="wb-scroll-clean flex gap-1.5 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {visibleTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors md:w-full ${
                  activeTab === id
                    ? "bg-[#0A1128] text-white shadow-sm dark:bg-white dark:text-[#0A1128]"
                    : "text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
          {activeTab === "general" && <GeneralProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "billing" && !isWorker && <BillingTab />}
          {activeTab === "support" && (
            // SupportChat's internals rely on `h-full` cascading from an
            // ancestor with a definite height (it previously lived inside
            // DashboardLayout's viewport-filling flex chain) — this card has
            // no fixed height of its own, so without this wrapper the chat
            // feed/composer would collapse to a sliver instead of a real
            // chat window.
            <div className="-m-6 h-[640px] sm:-m-8 sm:h-[640px]">
              <SupportChat />
            </div>
          )}
          {activeTab === "danger" && <DangerZoneTab />}
        </div>
      </div>
    </div>
  );
}
