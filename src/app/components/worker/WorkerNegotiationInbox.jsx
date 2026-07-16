import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle, Briefcase, CheckCircle2, IndianRupee, MessageSquare,
  ShieldCheck, Sparkles, Star, Timer, Trophy, X,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import IdentityHeader from "../shared/IdentityHeader";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import { useAuth } from "../../context/AuthContext";
import { listProjects, updateProjectStatus } from "../../lib/projectsApi";
import { getPublicProfile } from "../../lib/profilesApi";
import { submitReview, listReviewsFor } from "../../lib/reviewsApi";
import { getInitials } from "../../utils/formValidation";
import { calculatePotentialPoints } from "../../utils/pointMatrix";
import { PROJECT_STATUS_META, nextProjectStatus } from "../../utils/projectStatus";
import { ApiError } from "../../lib/apiClient";

// Real projects come from GET /api/projects?role=worker — INVITED status is
// the Acceptance Gate; every other status unlocks the detail/status view.
// Chat is deliberately not part of this phase (no messages table yet) — see
// the plan notes; this used to be a full chat surface per invite.

// ─── Thread list item ────────────────────────────────────────────────────────

function ProjectItem({ project, isSelected, onClick }) {
  const accepted = project.status !== "INVITED";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 border-b border-slate-100 transition-colors relative ${
        isSelected ? "bg-[#F4F6FF]" : "hover:bg-slate-50"
      }`}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#1B3FAB]" />}
      <div className="flex items-center gap-3">
        <Avatar initials={getInitials(project.business_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0F172A] text-sm truncate">{project.business_name}</p>
          <p className="text-xs text-slate-500 truncate">{project.title}</p>
        </div>
        {accepted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

// ─── Business Quick View — stays inside the negotiation flow ────────────────

function BusinessQuickView({ project, businessProfile, loading, onClose }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar initials={getInitials(project.business_name)} bg="bg-[#1B3FAB]" size="w-12 h-12" text="text-base" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {project.business_name}
                </p>
                {businessProfile?.verified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </div>
              {loading ? (
                <p className="text-xs text-slate-400 mt-0.5">Loading…</p>
              ) : (
                businessProfile?.rating != null && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {businessProfile.rating} · {businessProfile.reviews_count} reviews
                  </p>
                )
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-500">Currently hiring for</span>
            <span className="text-xs font-bold text-slate-900 text-right">{project.title}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-500">Verification</span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                businessProfile?.verified ? "text-blue-600 bg-blue-50" : "text-slate-500 bg-slate-100"
              }`}
            >
              {businessProfile?.verified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ─── State 1: The Acceptance Gate ────────────────────────────────────────────
// Renders ONLY the job offer. Nothing about status/action is reachable until
// the worker accepts (INVITED -> ACCEPTED).

function InvitationGateView({ project, onAccept, onNameClick, accepting }) {
  const potentialPoints = calculatePotentialPoints(Number(project.budget), false);

  return (
    <>
      <IdentityHeader
        name={project.business_name}
        subtitle="Business"
        initials={getInitials(project.business_name)}
        verified
        onNameClick={onNameClick}
      />

      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-5 sm:px-7">
        <p className="text-sm italic text-slate-500">
          You've been invited by {project.business_name} to work on this project…
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
          {project.title}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified client
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <main className="flex flex-col gap-6 lg:col-span-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1B3FAB] ring-1 ring-blue-100">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Project context</p>
                  <h3 className="text-lg font-black text-slate-900">Role Overview</h3>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-7 text-slate-600">
                {project.description || "No additional description was provided."}
              </p>
            </section>
          </main>

          <aside className="self-start lg:sticky lg:top-0 lg:col-span-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.10)]">
              <div className="border-b border-slate-100 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Invitation terms</p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">Ready to accept?</h3>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                    <Trophy size={12} />
                    {potentialPoints} PTS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-5">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <IndianRupee className="h-5 w-5 text-[#1B3FAB]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Budget</p>
                    <p className="text-sm font-black text-slate-900">₹{Number(project.budget).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <Timer className="h-5 w-5 text-[#1B3FAB]" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Deadline</p>
                      <p className="text-sm font-black text-slate-900">
                        {new Date(project.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 p-5">
                <button
                  onClick={onAccept}
                  disabled={accepting}
                  className="w-full rounded-2xl bg-[#FF6B35] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#e95c25] hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100"
                >
                  {accepting ? "Accepting…" : "Accept Invitation"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// ─── State 2: Project Detail / Status View ───────────────────────────────────

function ProjectDetailView({ project, onNameClick, onAdvance, advancing }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const status = project.status;
  const meta = PROJECT_STATUS_META[status];
  const nextStatus = nextProjectStatus(status);
  const [existingReview, setExistingReview] = useState(undefined); // undefined = loading, null = none
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (status !== "COMPLETED") return;
    let cancelled = false;
    setExistingReview(undefined);
    listReviewsFor(project.business_id)
      .then((reviews) => {
        if (cancelled) return;
        const mine = reviews.find((r) => r.project_id === project.id && r.reviewer_id === currentUser?.id);
        setExistingReview(mine ?? null);
      })
      .catch(() => {
        if (!cancelled) setExistingReview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [status, project.id, project.business_id, currentUser?.id]);

  if (status === "COMPLETED") {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <IdentityHeader
          name={project.business_name}
          subtitle={project.title}
          initials={getInitials(project.business_name)}
          statusPill={{ text: "Completed", tone: "emerald" }}
          onNameClick={onNameClick}
        />
        {existingReview === undefined ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
          </div>
        ) : (
          <>
            {reviewError && (
              <div className="flex-shrink-0 mx-6 mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{reviewError}</span>
              </div>
            )}
            <ProjectCompletionHub
              perspective="worker"
              counterpartName={project.business_name}
              amount={Number(project.budget)}
              review={existingReview}
              onSubmit={async (rating, feedback) => {
                setReviewError("");
                try {
                  const created = await submitReview({ projectId: project.id, rating, feedback });
                  setExistingReview(created);
                } catch (err) {
                  setReviewError(err instanceof ApiError ? err.message : "Could not submit review.");
                }
              }}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <IdentityHeader
        name={project.business_name}
        subtitle={project.title}
        initials={getInitials(project.business_name)}
        onNameClick={onNameClick}
      />

      <TimelineTracker status={status} />

      {status === "FUNDS_SECURED" || status === "WORK_IN_PROGRESS" || status === "FILES_SUBMITTED" ? (
        <div className="flex-shrink-0 bg-emerald-50 border-b border-emerald-100 px-6 py-1.5 flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-emerald-700">Funds secured for this project</p>
          </span>
          <button
            onClick={() => navigate(`/invoice?role=worker&id=${project.id}`)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 flex-shrink-0"
          >
            View Invoice
          </button>
        </div>
      ) : (
        <div className="flex-shrink-0 bg-slate-100 border-b border-slate-200 px-6 py-1.5 flex items-center gap-1.5">
          <Timer className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-slate-500">Awaiting payment confirmation from {project.business_name}</p>
        </div>
      )}

      {meta?.actionBy === "worker" && nextStatus && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-2.5 flex justify-end">
          <button
            onClick={() => onAdvance(nextStatus)}
            disabled={advancing}
            className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {advancing ? "Updating…" : meta.nextActionLabel}
          </button>
        </div>
      )}
      {status === "FILES_SUBMITTED" && (
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-6 py-1.5">
          <p className="text-[11px] font-semibold text-amber-700">Awaiting business approval &amp; fund release</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-8 bg-slate-50 flex items-start justify-center">
        <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Brief</p>
              <h3 className="text-lg font-black text-slate-900">{project.title}</h3>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-600">{project.description || "No additional description was provided."}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function WorkerNegotiationInbox({ initialProjectId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(initialProjectId ?? null);
  const [toast, setToast] = useState("");
  const [actionError, setActionError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [businessProfileLoading, setBusinessProfileLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "worker" })
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
        setSelectedId((current) => current ?? initialProjectId ?? data[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your invitations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialProjectId && projects.some((p) => p.id === initialProjectId)) {
      setSelectedId(initialProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  const patchProject = (updated) => {
    setProjects((current) => current.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  };

  const handleAccept = async () => {
    if (!selectedProject) return;
    setAccepting(true);
    setActionError("");
    try {
      const updated = await updateProjectStatus(selectedProject.id, "ACCEPTED");
      patchProject(updated);
      setToast(`Invitation accepted — ${selectedProject.business_name} has been notified.`);
      window.setTimeout(() => setToast(""), 2600);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not accept this invitation.");
    } finally {
      setAccepting(false);
    }
  };

  const handleAdvance = async (nextStatus) => {
    if (!selectedProject) return;
    setAdvancing(true);
    setActionError("");
    try {
      const updated = await updateProjectStatus(selectedProject.id, nextStatus);
      patchProject(updated);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not update this project.");
    } finally {
      setAdvancing(false);
    }
  };

  const openQuickView = () => {
    setShowQuickView(true);
    if (!selectedProject) return;
    setBusinessProfileLoading(true);
    getPublicProfile(selectedProject.business_id)
      .then(setBusinessProfile)
      .catch(() => setBusinessProfile(null))
      .finally(() => setBusinessProfileLoading(false));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-7">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Left: Invitation Inbox (w-1/3) ──────────────────────────────── */}
      <div className="w-1/3 min-w-[280px] max-w-[360px] flex flex-col border-r border-slate-200 bg-white flex-shrink-0">
        <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h1 className="font-extrabold text-[#0F172A] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Invitations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {projects.filter((p) => p.status === "INVITED").length} pending · {projects.filter((p) => p.status !== "INVITED").length} accepted
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 px-4">No invitations yet.</p>
          ) : (
            projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isSelected={selectedId === project.id}
                onClick={() => setSelectedId(project.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right: Dynamic Gate / Detail (w-2/3) ────────────────────────── */}
      <div className="w-2/3 flex-1 flex flex-col min-h-0 bg-slate-50 relative">
        {actionError && (
          <div className="flex-shrink-0 m-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}
        {!selectedProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Select an invitation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedProject.status === "INVITED" ? (
              <motion.div
                key={`gate-${selectedProject.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                <InvitationGateView
                  project={selectedProject}
                  onAccept={handleAccept}
                  onNameClick={openQuickView}
                  accepting={accepting}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`detail-${selectedProject.id}`}
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                <ProjectDetailView
                  project={selectedProject}
                  onNameClick={openQuickView}
                  onAdvance={handleAdvance}
                  advancing={advancing}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {toast && (
          <div className="absolute bottom-6 right-6 z-20 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {toast}
            </span>
          </div>
        )}
      </div>

      {showQuickView && (
        <BusinessQuickView
          project={selectedProject}
          businessProfile={businessProfile}
          loading={businessProfileLoading}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
}
