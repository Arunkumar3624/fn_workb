import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase, Clock3, Flame, IndianRupee, Lock, Search, ShieldCheck, Users, X } from "lucide-react";
import { listPublicOpenJobs } from "../lib/projectsApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../lib/apiClient";

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

// The read-only, logged-out counterpart to WorkerJobFeed.jsx — same real
// GET (via the unguarded /api/public/open-jobs), same card visuals, but no
// apply/invite/quiz logic at all. "Sign in to Apply" is the only action
// here; the real apply flow only exists once you're actually a worker.
function JobDetailModal({ job, onClose, onSignIn }) {
  if (!job) return null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-xl">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <Briefcase className="h-3 w-3" />
              {job.business_name}
            </p>
            <h2 className="mt-1 truncate text-xl font-black text-slate-900">{job.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              <IndianRupee className="h-3 w-3" />
              {Number(job.budget).toLocaleString("en-IN")}
            </span>
            {job.is_urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35] px-2.5 py-1 text-xs font-bold text-white">
                <Flame className="h-3 w-3" />
                Urgent
              </span>
            )}
            {job.estimated_duration && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                Est. {job.estimated_duration}
              </span>
            )}
          </div>

          {job.required_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {skill}
                </span>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {job.description || "No further details were added to this post."}
          </p>

          <div className="rounded-2xl border border-[#1B3FAB]/15 bg-[#F4F6FF] p-4">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1B3FAB]" />
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Sign in to apply</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Browsing is free for everyone — applying takes a free WorkBridge account so the business can see
                  who you are.
                </p>
              </div>
            </div>
            <button
              onClick={onSignIn}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B3FAB] py-3 text-sm font-bold text-white transition-colors hover:bg-[#15338d]"
            >
              Sign In to Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicJobFeed({ onSelect }) {
  useDocumentTitle("Browse Freelance Jobs | WorkBridge");
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // Seeded from the Hero search bar's ?q= (see HeroSection.jsx) — still a
  // normal controlled input after that, so typing here works the same way.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listPublicOpenJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load open jobs.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      job.title?.toLowerCase().includes(q) ||
      job.business_name?.toLowerCase().includes(q) ||
      job.required_skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleSignIn = () => onSelect?.("worker");

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Browse Freelance Jobs
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Every open post on WorkBridge, live — no account needed to look around.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, business, or skill"
            className="w-full text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
          </div>
        ) : loadError ? (
          <div className="mx-auto max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {loadError}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">No open jobs right now</h2>
            <p className="mt-1 text-sm text-slate-500">New posts show up here as businesses hire — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {filteredJobs.map((job) => (
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
                className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  job.is_urgent
                    ? "border-[#FF6B35]/40 bg-orange-50/50 shadow-orange-200/40"
                    : "border-white/70 bg-white/60 shadow-slate-200/40"
                }`}
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
                      {job.is_urgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35] px-2 py-0.5 text-[11px] font-bold text-white">
                          <Flame className="h-3 w-3" />
                          Urgent
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-lg font-black leading-snug text-slate-900">{job.title}</h2>
                    {job.required_skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.required_skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 4 && (
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                            +{job.required_skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
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

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedJob(job);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1B3FAB]/20 bg-[#F4F6FF] py-2.5 text-sm font-bold text-[#1B3FAB] transition-colors hover:bg-[#e8ecff]"
                >
                  <Lock className="h-3.5 w-3.5" />
                  View & Sign In to Apply
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onSignIn={handleSignIn} />
    </div>
  );
}
