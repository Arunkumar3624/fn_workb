import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  Crown,
  Headphones,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
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
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">{children}</div>;
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
          <p className="text-sm font-bold text-[#0A1128]">Profile photo</p>
          <p className="text-xs text-slate-400">JPG or PNG, under 1.5MB.</p>
          {avatarError && <p className="mt-1 text-xs text-red-500">{avatarError}</p>}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit number"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        {saveError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Saved.
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(fullProfilePath)}
            className="text-xs font-bold text-[#1B3FAB] hover:underline"
          >
            Edit bio, skills &amp; more on your full profile →
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#0A1128] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a2547] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </form>
    </SectionCard>
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
          <ShieldCheck className={`h-4 w-4 ${currentUser?.email_verified ? "text-emerald-500" : "text-slate-300"}`} />
          <p className="text-sm font-semibold text-slate-700">
            Email {currentUser?.email_verified ? "verified" : "not verified"}
          </p>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="mb-4 text-sm font-bold text-[#0A1128]">Change Password</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/30"
          />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Password updated.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !currentPassword || !newPassword}
            className="rounded-xl bg-[#0A1128] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a2547] disabled:opacity-60"
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
  checking: { label: "Checking…", tone: "text-slate-400" },
  unsupported: { label: "Not supported on this browser", tone: "text-slate-400" },
  "not-configured": { label: "Not available yet", tone: "text-slate-400" },
  denied: { label: "Blocked — enable in your browser's site settings", tone: "text-red-500" },
  subscribed: { label: "Enabled on this device", tone: "text-emerald-600" },
  unsubscribed: { label: "Off on this device", tone: "text-slate-400" },
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
  const copy = PUSH_STATUS_COPY[status] ?? PUSH_STATUS_COPY.checking;

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F6FF] text-[#1B3FAB]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1128]">Push Notifications</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Get a real notification on this device for new messages, invites, applications, and project updates —
                even when WorkBridge isn't open in a tab.
              </p>
              <p className={`mt-2 text-xs font-semibold ${copy.tone}`}>{copy.label}</p>
              {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            </div>
          </div>
          {canToggle && (
            <button
              onClick={handleToggle}
              disabled={busy}
              role="switch"
              aria-checked={status === "subscribed"}
              className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                status === "subscribed" ? "bg-[#FF6B35]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  status === "subscribed" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function BillingTab() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isBusiness = currentUser?.role === "business";
  const tiers = isBusiness
    ? [
        { name: "Standard", price: "Free", perks: ["Post jobs", "Message workers", "Standard support"] },
        {
          name: "Growth",
          price: "₹299",
          period: "/mo",
          highlight: true,
          perks: ["Priority support", "Dispute mediation fee waiver", "Verified enterprise badge"],
        },
      ]
    : [
        { name: "Free", price: "Free", perks: ["Standard job matching", "10 proposals/week"] },
        {
          name: "Pro",
          price: "₹299",
          period: "/mo",
          highlight: true,
          perks: ["Priority in applicant lists", "Profile analytics", "Reduced platform commission"],
        },
        {
          name: "Elite",
          price: "₹599",
          period: "/mo",
          premium: true,
          perks: ["Top placement in Find Workers", "Priority badge verification", "Zero commission on first ₹10,000/mo"],
        },
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Current Plan</p>
          <p className="mt-1 text-2xl font-black text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {isBusiness ? "Standard" : "Free"}
          </p>
        </div>
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-5 ${isBusiness ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {tiers.map((tier) => {
          const cardCls = tier.premium
            ? "bg-[#0F172A] text-white border border-white/10 shadow-lg shadow-slate-900/20"
            : tier.highlight
              ? "bg-white border-2 border-[#FF6B35] shadow-md shadow-orange-500/10"
              : "bg-white border border-slate-200";

          return (
            <div key={tier.name} className={`relative flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 ${cardCls}`}>
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF6B35] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  Most Popular
                </span>
              )}
              {tier.premium && (
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#FF6B35]">
                  <Crown className="h-4 w-4" />
                </span>
              )}

              <p className={`text-xs font-bold uppercase tracking-wide ${tier.premium ? "text-slate-300" : "text-slate-400"}`}>
                {tier.name}
              </p>
              <p className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {tier.price}
                </span>
                {tier.period && <span className={`text-xs font-semibold ${tier.premium ? "text-slate-400" : "text-slate-400"}`}>{tier.period}</span>}
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs leading-5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                        tier.premium ? "bg-emerald-400/20 text-emerald-300" : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className={tier.premium ? "text-slate-300" : "text-slate-600"}>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className={`mt-6 w-full cursor-not-allowed rounded-xl py-2.5 text-xs font-bold ${
                  tier.premium ? "bg-white/10 text-slate-300" : tier.name === (isBusiness ? "Standard" : "Free") ? "bg-slate-100 text-slate-500" : "border border-slate-200 text-slate-400"
                }`}
              >
                {tier.name === (isBusiness ? "Standard" : "Free") ? "Current Plan" : "Coming soon"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-slate-400">
        Paid plans aren't live yet — this is a preview of what's coming.
      </p>
      {!isBusiness && (
        <button
          onClick={() => navigate("/worker/subscriptions")}
          className="mx-auto flex items-center gap-1 text-xs font-bold text-[#1B3FAB] hover:underline"
        >
          View full plan comparison
          <Sparkles className="h-3 w-3" />
        </button>
      )}
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-bold text-red-700">Deactivate My Account</p>
        <p className="mt-1.5 text-xs leading-relaxed text-red-600">
          Your account will be immediately signed out and blocked from signing back in. This is reversible —
          contact support if you change your mind. This does not permanently delete your data.
        </p>
        <form onSubmit={handleDeactivate} className="mt-4 space-y-3">
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder='Type "DEACTIVATE" to confirm'
            className="w-full rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
          />
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm text-red-600">
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
        <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Settings
        </h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="flex-shrink-0 md:w-1/4">
          <nav className="flex gap-1.5 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors md:w-full ${
                  activeTab === id
                    ? "bg-[#0A1128] text-white shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl sm:p-8">
          {activeTab === "general" && <GeneralProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "billing" && <BillingTab />}
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
