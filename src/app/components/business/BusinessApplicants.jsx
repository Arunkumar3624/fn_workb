import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Crown, Target, Star, ShieldCheck, ChevronDown, ChevronUp,
  MessageSquare, UserCheck, Sparkles,
} from "lucide-react";
import { usePlatformData } from "../../context/PlatformContext";
import Avatar from "../shared/Avatar";

// ── Review Applicants drawer ──────────────────────────────────────────────
// Layer 2 of the Z-Index Protocol: backdrop z-40, drawer content z-50.
// Merit comes first: "Top Skill Matches" is ranked purely by score × match.
// Elite members get a featured card with their proposal expanded by default —
// the pitch gets read first, but nobody is hidden below them.

const GOOD_STANDING = 600;

const meritRank = (worker) => worker.behaviorScore * (worker.matchPct / 100);

const scoreTone = (score) => {
  if (score >= 700) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= GOOD_STANDING) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
};

export default function BusinessApplicants({ project, onClose }) {
  const { workersDb } = usePlatformData();
  const [expanded, setExpanded] = useState(new Set());
  const [decided, setDecided] = useState({});

  const isOpen = Boolean(project);

  // Global scroll lock while the drawer is open
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const { eliteApplicants, meritApplicants } = useMemo(() => {
    const elite = [];
    const merit = [];
    for (const worker of workersDb) {
      // Elite feature slot requires Good Standing — paused members compete on merit only
      if (worker.elite && worker.behaviorScore >= GOOD_STANDING) elite.push(worker);
      else merit.push(worker);
    }
    elite.sort((a, b) => meritRank(b) - meritRank(a));
    merit.sort((a, b) => meritRank(b) - meritRank(a));
    return { eliteApplicants: elite, meritApplicants: merit };
  }, [workersDb]);

  const toggleExpanded = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const decide = (id, decision) =>
    setDecided((prev) => ({ ...prev, [id]: decision }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40">
          <motion.button
            type="button"
            aria-label="Close applicants drawer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-slate-50 shadow-2xl"
          >
            {/* Header */}
            <header className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Review Applicants
                </p>
                <h2
                  className="mt-1.5 text-xl font-extrabold text-[#0F172A]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {project?.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {eliteApplicants.length + meritApplicants.length} proposals · ranked by skill first
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Scrollable body */}
            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              {/* Section 1 — Meritocratic matches */}
              <section>
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F6FF] text-[#1B3FAB]">
                    <Target className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">Top Skill Matches</h3>
                    <p className="text-xs text-slate-400">Purely merit-based · Behavior Score × Skill Match</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {meritApplicants.map((worker) => {
                    const isExpanded = expanded.has(worker.id);
                    return (
                      <article
                        key={worker.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <ApplicantHeader worker={worker} />
                        <div className="mt-3 rounded-xl bg-slate-50 p-4">
                          <p className={`text-sm leading-6 text-slate-600 ${isExpanded ? "" : "line-clamp-2"}`}>
                            {worker.proposal}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleExpanded(worker.id)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1B3FAB] hover:underline"
                          >
                            {isExpanded ? (
                              <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
                            ) : (
                              <>Read more <ChevronDown className="h-3.5 w-3.5" /></>
                            )}
                          </button>
                        </div>
                        <ApplicantActions
                          worker={worker}
                          decision={decided[worker.id]}
                          onDecide={decide}
                        />
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Section 2 — Elite featured applicants */}
              <section>
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                    <Crown className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">Elite Applicants</h3>
                    <p className="text-xs text-slate-400">Featured members in Good Standing · full pitch shown</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {eliteApplicants.map((worker) => (
                    <article
                      key={worker.id}
                      className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-white p-5 shadow-[0_10px_36px_-10px_rgba(245,158,11,0.4)]"
                    >
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_0_16px_rgba(251,191,36,0.55)]">
                        <Sparkles className="h-3 w-3" />
                        Featured Applicant
                      </span>
                      <ApplicantHeader worker={worker} elite />
                      {/* Elite advantage: the proposal is fully expanded — it gets read first */}
                      <div className="mt-3 rounded-xl border border-amber-100 bg-white/80 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                          Proposal / Pitch
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{worker.proposal}</p>
                      </div>
                      <ApplicantActions
                        worker={worker}
                        decision={decided[worker.id]}
                        onDecide={decide}
                        elite
                      />
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function ApplicantHeader({ worker, elite = false }) {
  return (
    <div className="flex items-start gap-3">
      {worker.avatar ? (
        <img
          src={worker.avatar}
          alt={`${worker.name} profile`}
          className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
        />
      ) : (
        <Avatar initials={worker.av} size="w-12 h-12" text="text-xs" />
      )}
      <div className="min-w-0 flex-1">
        <h4
          className="font-extrabold text-[#0F172A]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {worker.name}
        </h4>
        <p className="text-xs text-slate-500">{worker.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${scoreTone(worker.behaviorScore)}`}>
            <ShieldCheck className="h-3 w-3" />
            Score {worker.behaviorScore}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#1B3FAB]/15 bg-[#F4F6FF] px-2.5 py-0.5 text-[11px] font-bold text-[#1B3FAB]">
            {worker.matchPct}% match
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {worker.rating} ({worker.reviews})
          </span>
        </div>
      </div>
      <div className={`flex-shrink-0 text-right ${elite ? "mt-7" : ""}`}>
        <p
          className="font-extrabold text-[#1B3FAB]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {worker.bid}
        </p>
        <p className="text-[11px] text-slate-400">Bid</p>
      </div>
    </div>
  );
}

function ApplicantActions({ worker, decision, onDecide, elite = false }) {
  return (
    <div className={`mt-4 flex gap-2.5 border-t pt-4 ${elite ? "border-amber-100" : "border-slate-100"}`}>
      <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">
        <MessageSquare className="h-3.5 w-3.5" />
        Message
      </button>
      <button
        type="button"
        onClick={() => onDecide(worker.id, "shortlisted")}
        disabled={decision === "hired"}
        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
          decision === "shortlisted"
            ? "border-sky-200 bg-sky-50 text-sky-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <UserCheck className="h-3.5 w-3.5" />
        {decision === "shortlisted" ? "Shortlisted" : "Shortlist"}
      </button>
      <button
        type="button"
        onClick={() => onDecide(worker.id, "hired")}
        className={`ml-auto rounded-xl px-5 py-2 text-xs font-bold transition-all duration-200 ${
          decision === "hired"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "bg-[#FF6B35] text-white shadow-sm shadow-[#FF6B35]/25 hover:-translate-y-0.5 hover:bg-[#E55E1F] hover:shadow-md"
        }`}
      >
        {decision === "hired" ? "✓ Hired" : "Hire Now"}
      </button>
    </div>
  );
}
