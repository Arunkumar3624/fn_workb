import { useEffect, useMemo, useState } from "react";
import {
  Star,
  ShieldCheck,
  Send,
  CheckCircle2,
  X,
  AlertCircle,
  Briefcase,
  IndianRupee,
  Loader2,
  Timer,
  Lock,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import WorkerShareableProfile from "../worker/WorkerShareableProfile";
import { listWorkers } from "../../lib/profilesApi";
import { listProjects, createProject } from "../../lib/projectsApi";
import { submitLink } from "../../lib/submissionsApi";
import { inviteWorkerToProject } from "../../lib/candidatesApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";

// ── Ranking ────────────────────────────────────────────────────────────────
// Real trust signals only — behavior score, then rating. No fake match%/elite
// boost (those were per-job/subscription concepts with no real backend).
function rank(a, b) {
  const scoreA = a.behavior_score ?? -1;
  const scoreB = b.behavior_score ?? -1;
  if (scoreB !== scoreA) return scoreB - scoreA;
  return (b.rating ?? 0) - (a.rating ?? 0);
}

const scoreTone = (score) => {
  if (score == null) return "bg-slate-50 text-slate-400 border-slate-200";
  if (score >= 700) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 500) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
};

// Small inline form for standalone "Invite" (no job draft handed in from
// BusinessPostJob) — collects just enough to create a real project.
function InviteModal({ worker, onClose, onSubmit, submitting, error }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceLink, setReferenceLink] = useState("");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Invite {worker.name}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Job Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Landing page redesign"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I need a 5-page Figma wireframe for a real estate app, including a homepage, listings grid, and contact form."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Budget (₹)</span>
              <input
                type="number"
                min="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="15000"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Reference Link (optional)</span>
            <input
              type="url"
              value={referenceLink}
              onChange={(e) => setReferenceLink(e.target.value)}
              placeholder="https://drive.google.com/… or a video/doc link for context"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
            />
            <span className="mt-1.5 block text-xs text-slate-400">
              Sent for a quick WorkBridge review before {worker.name} can see it.
            </span>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ title, description, budget, deadline, referenceLinks: referenceLink.trim() ? [referenceLink.trim()] : [] })}
            disabled={submitting || !title.trim() || !budget}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E55E1F] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Invites a specific worker directly to one of the business's OWN already-
// public OPEN job board posts — distinct from InviteModal above, which
// creates a brand-new private project. This one creates a job_candidates
// row (source=INVITE) against an EXISTING post instead; the post stays live
// on the public feed in case the invited worker declines (see
// job_candidates.controller.js).
function InviteToJobModal({ worker, openJobs, onClose, onSubmit, submitting, error }) {
  const [selectedProjectId, setSelectedProjectId] = useState(openJobs[0]?.id ?? "");
  const [message, setMessage] = useState("");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Invite {worker.name} to a job</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {openJobs.length === 0 ? (
            <p className="text-sm text-slate-500">
              You don't have any open job posts right now. Post a job first — it'll go live on the public Job Feed, and you can
              come back here to invite {worker.name} to it directly at any time while it's still open.
            </p>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Which open job?</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                >
                  {openJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} — ₹{Number(job.budget).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Note (optional)</span>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why you think they'd be a great fit for this one"
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <p className="text-xs text-slate-400">
                The job post stays live on the public feed in case {worker.name} says no — it only comes down once someone
                actually accepts.
              </p>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          {openJobs.length > 0 && (
            <button
              onClick={() => onSubmit(selectedProjectId, message)}
              disabled={submitting || !selectedProjectId}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E55E1F] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Sending…" : "Send Invite"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusinessWorkers({ pendingJob, onInviteSent, onViewProjects, isVerified = false, onVerify }) {
  const [workers, setWorkers] = useState([]);
  const [invitedWorkerIds, setInvitedWorkerIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null); // worker being invited via the standalone modal
  const [submitting, setSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [toast, setToast] = useState("");
  const [openJobs, setOpenJobs] = useState([]);
  const [jobInviteTarget, setJobInviteTarget] = useState(null); // worker being invited to an existing open post
  const [jobInviteSubmitting, setJobInviteSubmitting] = useState(false);
  const [jobInviteError, setJobInviteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([listWorkers(), listProjects({ role: "business" })])
      .then(([workerRows, projects]) => {
        if (cancelled) return;
        setWorkers(workerRows);
        setInvitedWorkerIds(new Set(projects.filter((p) => p.status !== "CANCELLED").map((p) => p.worker_id)));
        setOpenJobs(projects.filter((p) => p.status === "OPEN"));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load workers.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedWorker) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") setSelectedWorker(null); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handler);
    };
  }, [selectedWorker]);

  const rankedWorkers = useMemo(() => [...workers].sort(rank), [workers]);

  const submitInvite = async (worker, jobDetails) => {
    setSubmitting(true);
    setInviteError("");
    try {
      const project = await createProject({
        workerId: worker.id,
        title: jobDetails.title,
        description: jobDetails.description,
        budget: Number(jobDetails.budget),
        deadline: jobDetails.deadline || undefined,
      });

      // Reference material attached at invite time (BusinessPostJob's
      // "Reference Materials" card, or InviteModal's link field below) —
      // goes through the exact same moderation queue as a worker's finished
      // work, per the existing Trust Checker rule. A failure here shouldn't
      // undo the invite that already succeeded, so these are best-effort.
      const referenceLinks = (jobDetails.referenceLinks ?? []).filter(Boolean);
      if (referenceLinks.length > 0) {
        await Promise.allSettled(
          referenceLinks.map((url) =>
            submitLink({ projectId: project.id, url, caption: "Reference material shared at invite time" })
          )
        );
      }

      setInvitedWorkerIds((prev) => new Set(prev).add(worker.id));
      setInviteTarget(null);
      if (onInviteSent) {
        onInviteSent();
      } else {
        setToast(`Invitation sent to ${worker.name}.`);
        window.setTimeout(() => setToast(""), 2600);
      }
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Could not send this invite.");
    } finally {
      setSubmitting(false);
    }
  };

  // Same global, one-time isVerified gate BusinessPostJob already enforces
  // for "Post a Job" — a business shouldn't be able to invite workers
  // through this second entry point while still unverified.
  const handleInviteClick = (worker) => {
    if (!isVerified) {
      onVerify?.();
      return;
    }
    if (pendingJob) {
      submitInvite(worker, pendingJob);
    } else {
      setInviteError("");
      setInviteTarget(worker);
    }
  };

  const handleInviteToJobClick = (worker) => {
    if (!isVerified) {
      onVerify?.();
      return;
    }
    setJobInviteError("");
    setJobInviteTarget(worker);
  };

  const submitJobInvite = async (projectId, message) => {
    if (!jobInviteTarget) return;
    setJobInviteSubmitting(true);
    setJobInviteError("");
    try {
      await inviteWorkerToProject(projectId, jobInviteTarget.id, message.trim() || undefined);
      setToast(`Invite sent to ${jobInviteTarget.name}.`);
      window.setTimeout(() => setToast(""), 2600);
      setJobInviteTarget(null);
    } catch (err) {
      setJobInviteError(err instanceof ApiError ? err.message : "Could not send this invite.");
    } finally {
      setJobInviteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-7">
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
    <>
    <div className="min-h-screen bg-slate-50 p-7 wb-tab-enter">
      <div className="max-w-6xl mx-auto">

        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-2xl font-extrabold text-[#0F172A]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Talent Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">Showing {rankedWorkers.length} verified workers</p>
          </div>
        </div>

        {pendingJob && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#1B3FAB]/20 bg-[#F4F6FF] px-5 py-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white">
              <Briefcase className="h-4 w-4 text-[#1B3FAB]" />
            </div>
            <p className="text-xs leading-5 text-slate-600">
              <span className="font-bold text-slate-800">Selecting a worker for "{pendingJob.title}".</span>{" "}
              <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{Number(pendingJob.budget).toLocaleString("en-IN")}</span>
              {pendingJob.deadline && (
                <span className="ml-2 inline-flex items-center gap-1"><Timer className="h-3 w-3" />Due {new Date(pendingJob.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              )}
              {" "}— click Invite on a worker below to send this job.
            </p>
          </div>
        )}

        {!pendingJob && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F6FF]">
              <ShieldCheck className="h-4 w-4 text-[#1B3FAB]" />
            </div>
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-bold text-slate-700">Fairness-first ranking.</span>{" "}
              Workers are ordered by Behavior Score, then rating — nobody can buy their way past better talent.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedWorkers.map((w, i) => {
            const alreadyInvited = invitedWorkerIds.has(w.id);
            const skills = w.profile?.skills ?? [];
            const isTopRated = (w.rating ?? 0) >= 4.8 && (w.reviews_count ?? 0) >= 20;

            return (
              <div
                key={w.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md wb-card-enter"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {w.avatar_url ? (
                        <img src={w.avatar_url} alt={w.name} className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" />
                      ) : (
                        <Avatar initials={getInitials(w.name)} size="w-12 h-12" text="text-sm" />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <h3 className="font-extrabold text-[#0F172A] text-sm leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {w.name}
                          </h3>
                          {w.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{w.title || "Freelancer"}</p>
                        {w.rating != null && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                            <span className="text-xs text-slate-700 font-semibold">{w.rating}</span>
                            <span className="text-xs text-slate-400">({w.reviews_count})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isTopRated && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F6FF] border border-[#1B3FAB]/15 px-2 py-1 text-[10px] font-bold text-[#1B3FAB] flex-shrink-0 ml-2">
                        Top Rated
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${scoreTone(w.behavior_score)}`}>
                        <ShieldCheck className="h-3 w-3" />
                        {w.behavior_score ?? "—"}
                      </span>
                      {w.profile?.hourlyRate && (
                        <span className="text-xs font-bold text-slate-600 ml-auto">₹{Number(w.profile.hourlyRate).toLocaleString("en-IN")}/hr</span>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 6).map((s) => (
                          <span key={s} className="px-2.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedWorker(w)}
                      className="bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      View Profile
                    </button>

                    {isVerified && !pendingJob && (
                      <button
                        onClick={() => handleInviteToJobClick(w)}
                        title="Invite to one of your open job posts"
                        className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Invite to Job
                      </button>
                    )}

                    {alreadyInvited ? (
                      <button
                        onClick={() => onViewProjects?.()}
                        className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Invited
                      </button>
                    ) : isVerified ? (
                      <button
                        onClick={() => handleInviteClick(w)}
                        disabled={submitting}
                        className="flex items-center gap-1.5 bg-[#FF6B35] text-white hover:bg-[#e55e1f] px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Invite
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInviteClick(w)}
                        title="Verify your business to invite workers"
                        className="flex items-center gap-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Verify to Invite
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {selectedWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          onClick={() => setSelectedWorker(null)}
        >
          <button
            onClick={() => setSelectedWorker(null)}
            aria-label="Close profile"
            className="fixed top-6 right-6 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="wb-scroll-clean relative w-[95vw] h-[90vh] max-w-6xl bg-slate-50 rounded-2xl overflow-y-auto shadow-2xl wb-panel-enter"
            onClick={(event) => event.stopPropagation()}
          >
            <WorkerShareableProfile worker={selectedWorker} />
          </div>
        </div>
      )}

      {inviteTarget && (
        <InviteModal
          worker={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSubmit={(details) => submitInvite(inviteTarget, details)}
          submitting={submitting}
          error={inviteError}
        />
      )}

      {jobInviteTarget && (
        <InviteToJobModal
          worker={jobInviteTarget}
          openJobs={openJobs}
          onClose={() => setJobInviteTarget(null)}
          onSubmit={submitJobInvite}
          submitting={jobInviteSubmitting}
          error={jobInviteError}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-20 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {toast}
          </span>
        </div>
      )}
    </>
  );
}
