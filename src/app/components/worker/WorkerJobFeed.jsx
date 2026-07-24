import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { listOpenProjects } from "../../lib/projectsApi";
import { applyToProject, listMyCandidates, respondToCandidate } from "../../lib/candidatesApi";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function timeAgo(dateString) {
  const ms = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// The real apply flow — a proposal note + submit, straight to
// POST /api/projects/:id/candidates. No quiz/points system here since
// there's no backend for either; this is the actual apply action.
function JobDetailModal({ job, onClose, onApply, applying, applyError, alreadyApplied }) {
  const [message, setMessage] = useState("");

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{job.business_name}</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{job.title}</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="wb-scroll-clean min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Budget</p>
              <p className="mt-1 text-sm font-black text-slate-900">{formatINR(job.budget)}</p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-xs text-slate-500">Applicants</p>
              <p className="mt-1 text-sm font-black text-slate-900">{job.applicant_count ?? 0}</p>
            </div>
            <div className="border-r border-slate-200">
              <p className="text-xs text-slate-500">Posted</p>
              <p className="mt-1 text-sm font-black text-slate-900">{timeAgo(job.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Deadline</p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Flexible"}
              </p>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-bold text-slate-900">Brief</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
            {job.description || "No further details were added to this post."}
          </p>

          {!alreadyApplied && (
            <>
              <h3 className="mt-6 text-sm font-bold text-slate-900">Your proposal note (optional)</h3>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Briefly say why you're a good fit, and any questions about scope or timeline."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
              />
            </>
          )}

          {applyError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{applyError}</span>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Close
          </button>
          {alreadyApplied ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Already applied
            </span>
          ) : (
            <button
              onClick={() => onApply(message)}
              disabled={applying}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E55E1F] disabled:opacity-60"
            >
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {applying ? "Submitting…" : "Apply Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// A direct invite from a business, waiting on this worker's Accept/Decline —
// distinct from an application the worker sent out themselves.
function InviteCard({ candidate, onRespond, responding }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1B3FAB]/20 bg-[#F4F6FF] px-5 py-4">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1B3FAB]">
          <Sparkles className="h-3.5 w-3.5" />
          Direct invite from {candidate.business_name}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">{candidate.project_title}</p>
        <p className="text-xs text-slate-500">{formatINR(candidate.budget)}</p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <button
          onClick={() => onRespond(candidate.id, false)}
          disabled={responding}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Decline
        </button>
        <button
          onClick={() => onRespond(candidate.id, true)}
          disabled={responding}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B3FAB] px-3.5 py-2 text-sm font-bold text-white hover:bg-[#15338d] disabled:opacity-60"
        >
          {responding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Accept
        </button>
      </div>
    </div>
  );
}

export default function WorkerJobFeed() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [myCandidates, setMyCandidates] = useState([]);
  const [respondingId, setRespondingId] = useState(null);

  const loadJobs = () => {
    listOpenProjects()
      .then(setJobs)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load the job feed."))
      .finally(() => setLoading(false));
  };

  const loadMyCandidates = () => {
    listMyCandidates().then(setMyCandidates).catch(() => {});
  };

  useEffect(() => {
    loadJobs();
    loadMyCandidates();
  }, []);

  // Applications/invites move fast (someone else can fill a job at any
  // moment) — refetch both the feed and "my candidates" on any candidate
  // lifecycle event, rather than only reacting to ones this tab caused.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (!["CANDIDATE_CREATED", "CANDIDATE_ACCEPTED", "CANDIDATE_DECLINED", "JOB_FILLED"].includes(event.type)) return;
      loadMyCandidates();
      if (event.type === "CANDIDATE_ACCEPTED" || event.type === "JOB_FILLED") loadJobs();
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
  }, []);

  const pendingInvites = myCandidates.filter((c) => c.source === "INVITE" && c.status === "PENDING");
  const appliedProjectIds = new Set(myCandidates.filter((c) => c.source === "APPLICATION").map((c) => c.project_id));

  const filteredJobs = jobs.filter((job) => {
    if (!query.trim()) return true;
    const searchable = `${job.title} ${job.description ?? ""} ${job.business_name}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  });

  const handleApply = async (message) => {
    if (!selectedJob) return;
    setApplying(true);
    setApplyError("");
    try {
      await applyToProject(selectedJob.id, message.trim() || undefined);
      toast.success("Application submitted.");
      setSelectedJob(null);
      loadMyCandidates();
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.message : "Could not submit your application.");
    } finally {
      setApplying(false);
    }
  };

  const handleRespond = async (candidateId, accept) => {
    setRespondingId(candidateId);
    try {
      await respondToCandidate(candidateId, accept);
      toast.success(accept ? "Invitation accepted — check Active Workspace." : "Invitation declined.");
      loadMyCandidates();
      loadJobs();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not respond to this invite.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="relative h-full min-h-screen overflow-y-auto bg-gradient-to-br from-[#dbe4ff] via-[#eef1ff] to-[#ffe4d2] pb-20 text-slate-900">
      <section className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">WorkBridge Job Feed</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Open jobs, live right now</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Every job here is real and unassigned — apply, and the business decides who to bring on. A business can also
            invite you directly to one of these while it's still open.
          </p>

          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, business, or skill"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {pendingInvites.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Invites for you</h2>
            {pendingInvites.map((candidate) => (
              <InviteCard
                key={candidate.id}
                candidate={candidate}
                onRespond={handleRespond}
                responding={respondingId === candidate.id}
              />
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
          </div>
        ) : loadError ? (
          <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-white/70 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-10 text-center shadow-lg shadow-slate-200/40">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">No open jobs right now</h2>
            <p className="mt-1 text-sm text-slate-500">New public postings will show up here as soon as a business creates one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {filteredJobs.map((job) => {
              const alreadyApplied = appliedProjectIds.has(job.id);

              return (
                <article
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedJob(job)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedJob(job);
                    }
                  }}
                  className="cursor-pointer rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          <Briefcase className="h-3 w-3" />
                          {job.business_name}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          <IndianRupee className="h-3 w-3" />
                          {Number(job.budget).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-black leading-snug text-slate-900">{job.title}</h2>
                    </div>
                    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {job.description || "No further details were added to this post."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/20 bg-white/40 backdrop-blur-md p-3 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Applicants</p>
                      <p className="mt-1 flex items-center justify-center gap-1 text-sm font-black text-slate-900">
                        <Users className="h-3.5 w-3.5" />
                        {job.applicant_count ?? 0}
                      </p>
                    </div>
                    <div className="border-l border-slate-200">
                      <p className="text-xs text-slate-500">Posted</p>
                      <p className="mt-1 flex items-center justify-center gap-1 text-sm font-black text-slate-900">
                        <Clock3 className="h-3.5 w-3.5" />
                        {timeAgo(job.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedJob(job);
                      }}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-slate-200"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      disabled={alreadyApplied}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedJob(job);
                      }}
                      className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition-all duration-300 ${
                        alreadyApplied
                          ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                          : "bg-[#FF6B35] text-white shadow-orange-200 hover:-translate-y-0.5 hover:bg-[#e95c25] hover:shadow-lg"
                      }`}
                    >
                      {alreadyApplied ? "Applied" : "Apply Now"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <JobDetailModal
        job={selectedJob}
        onClose={() => {
          setSelectedJob(null);
          setApplyError("");
        }}
        onApply={handleApply}
        applying={applying}
        applyError={applyError}
        alreadyApplied={selectedJob ? appliedProjectIds.has(selectedJob.id) : false}
      />
    </div>
  );
}
