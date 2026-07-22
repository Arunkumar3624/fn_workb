import { useEffect, useState } from "react";
import {
  AlertCircle,
  Camera,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateOwnProfile } from "../../lib/profilesApi";
import { listReviewsFor } from "../../lib/reviewsApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024; // 1.5MB — stored as a data URL in avatar_url (TEXT), no file-storage backend exists yet.

const defaultAvatarUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%231B3FAB'/%3E%3Ccircle cx='80' cy='62' r='28' fill='%23ffffff' opacity='0.95'/%3E%3Cpath d='M34 137c7-28 25-43 46-43s39 15 46 43' fill='%23ffffff' opacity='0.95'/%3E%3C/svg%3E";

function ProfileCard({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-lg bg-slate-50 p-5 ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
          {getInitials(review.reviewer_name)}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{review.reviewer_name}</h3>
          <p className="text-xs font-medium text-slate-500">
            {new Date(review.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />
        ))}
      </div>
      {review.feedback && <p className="mt-4 text-sm italic leading-6 text-slate-500">"{review.feedback}"</p>}
    </article>
  );
}

function BehaviorLevelBento({ behaviorScore, verified }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const score = behaviorScore ?? 0;
  const pct = Math.max(0, Math.min(100, Math.round((score / 1000) * 100)));
  const tier = score >= 750 ? "Elite" : score >= 500 ? "Trusted" : "Building Trust";

  return (
    <section className="mt-6 rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Trust &amp; Behavior Level</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{tier}</h2>
        </div>
        <p className="text-lg font-bold text-slate-900">{score} / 1000 Pts</p>
      </div>
      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#FF6B35] transition-all duration-1000 ease-out"
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm leading-6 text-slate-500">
        <ShieldCheck className={`h-4 w-4 flex-shrink-0 ${verified ? "text-emerald-500" : "text-slate-300"}`} />
        {verified ? "Identity verified" : "Not yet verified — verification badge coming soon"}
      </p>
    </section>
  );
}

export default function WorkerProfile() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: currentUser?.title ?? "",
    phone: currentUser?.phone ?? "",
    bio: currentUser?.profile?.bio ?? "",
    location: currentUser?.profile?.location ?? "",
    hourlyRate: currentUser?.profile?.hourlyRate ?? "",
    skillsText: (currentUser?.profile?.skills ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    listReviewsFor(currentUser.id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [currentUser?.id]);

  // A business rating this worker mid-session (this tab already open)
  // previously only showed up after a manual reload — the fetch above only
  // ever ran once, on mount.
  useEffect(() => {
    if (!currentUser?.id) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (event.type === "REVIEW_SUBMITTED" && event.revieweeId === currentUser.id) {
        listReviewsFor(currentUser.id).then(setReviews).catch(() => {});
      }
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
  }, [currentUser?.id]);

  const startEdit = () => {
    setDraft({
      title: currentUser?.title ?? "",
      phone: currentUser?.phone ?? "",
      bio: currentUser?.profile?.bio ?? "",
      location: currentUser?.profile?.location ?? "",
      hourlyRate: currentUser?.profile?.hourlyRate ?? "",
      skillsText: (currentUser?.profile?.skills ?? []).join(", "),
    });
    setSaveError("");
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const skills = draft.skillsText.split(",").map((s) => s.trim()).filter(Boolean);
      const phone = draft.phone.replace(/\D/g, "");
      if (phone && phone.length !== 10) {
        setSaveError("Phone number must be exactly 10 digits.");
        setSaving(false);
        return;
      }
      const updated = await updateOwnProfile({
        title: draft.title.trim() || undefined,
        phone: phone || undefined,
        profilePatch: {
          bio: draft.bio.trim(),
          location: draft.location.trim(),
          hourlyRate: draft.hourlyRate ? Number(draft.hourlyRate) : null,
          skills,
        },
      });
      updateCurrentUser(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Could not save your profile.");
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

  const profile = currentUser?.profile ?? {};
  const skills = profile.skills ?? [];

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC]">
      <main className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 pt-8">
          <section className="overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div className="h-32 bg-[radial-gradient(circle_at_18%_30%,rgba(255,107,53,0.28),transparent_28%),linear-gradient(120deg,#0F172A_0%,#334155_50%,#FF6B35_100%)] sm:h-40" />
            <div className="px-6 pb-7 sm:px-8">
              <div className="-mt-16 flex flex-col gap-5 rounded-lg bg-slate-950/55 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="worker-avatar-upload"
                    onChange={handleImageUpload}
                    disabled={avatarUploading}
                  />
                  <label
                    htmlFor="worker-avatar-upload"
                    className="group relative h-28 w-28 flex-none cursor-pointer"
                    aria-label={`Update profile photo for ${currentUser?.name}`}
                    title="Update profile photo"
                  >
                    {currentUser?.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={`${currentUser.name} profile`}
                        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <img
                        src={defaultAvatarUrl}
                        alt="Default profile"
                        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                    )}
                    <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.16)]" />
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {avatarUploading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </span>
                  </label>
                  <div className="pb-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{currentUser?.name}</h1>
                    <p className="mt-2 text-lg font-medium text-white/85">{currentUser?.title || "Freelancer"}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-white/75">
                      {profile.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-white/65" />
                          {profile.location}
                        </span>
                      )}
                      {currentUser?.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-white/65" />
                          +91 {currentUser.phone}
                        </span>
                      )}
                      {currentUser?.rating != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-bold text-white ring-1 ring-white/20">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {currentUser.rating} ({currentUser.reviews_count} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
              {avatarError && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {avatarError}
                </p>
              )}
            </div>
          </section>

          <BehaviorLevelBento behaviorScore={currentUser?.behavior_score} verified={currentUser?.verified} />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
            <div className="space-y-8">
              <ProfileCard>
                <h2 className="text-lg font-bold text-slate-900">About Me</h2>
                <p className="mt-4 max-w-4xl text-[15px] leading-7 text-slate-600">
                  {profile.bio || "No bio yet — click Edit Profile to add one."}
                </p>
              </ProfileCard>

              <ProfileCard>
                <h2 className="text-lg font-bold text-slate-900">Client Reviews</h2>
                {reviewsLoading ? (
                  <div className="mt-6 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">No reviews yet — they'll show up here once a project completes.</p>
                ) : (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                )}
              </ProfileCard>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <ProfileCard>
                <h2 className="text-lg font-bold text-slate-900">Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <p className="text-sm text-slate-400">No skills added yet.</p>
                  ) : (
                    skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700">
                        {skill}
                      </span>
                    ))
                  )}
                </div>
                {profile.hourlyRate && (
                  <p className="mt-4 text-sm font-bold text-slate-700">₹{Number(profile.hourlyRate).toLocaleString("en-IN")}/hr</p>
                )}
              </ProfileCard>
            </aside>
          </div>
        </div>
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              {saveError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Title</span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. Full-Stack Developer"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Mobile Number</span>
                <p className="mb-1 mt-1 text-xs text-slate-400">Kept up to date so the WorkBridge support team can reach you.</p>
                <div className="flex gap-2">
                  <span className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-600">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value.replace(/\D/g, "") }))}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Location</span>
                <input
                  value={draft.location}
                  onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  placeholder="e.g. Mumbai, India"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Hourly Rate (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={draft.hourlyRate}
                  onChange={(e) => setDraft((d) => ({ ...d, hourlyRate: e.target.value }))}
                  placeholder="850"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Skills (comma separated)</span>
                <input
                  value={draft.skillsText}
                  onChange={(e) => setDraft((d) => ({ ...d, skillsText: e.target.value }))}
                  placeholder="React, Node.js, PostgreSQL"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">About Me</span>
                <textarea
                  rows={4}
                  value={draft.bio}
                  onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B3FAB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15338d] disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
