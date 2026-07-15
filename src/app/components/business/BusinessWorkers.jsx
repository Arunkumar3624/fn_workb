import { useEffect, useMemo, useRef, useState } from "react";
import {
  Star,
  Crown,
  PauseCircle,
  Scale,
  ShieldCheck,
  Award,
  Briefcase,
  Send,
  Check,
  CheckCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Inbox,
  X,
} from "lucide-react";
import { usePlatformData } from "../../context/PlatformContext";
import VerifBadge from "../shared/VerifBadge";
import Avatar from "../shared/Avatar";
import WorkerShareableProfile from "../worker/WorkerShareableProfile";

// ── Fairness First display algorithm ─────────────────────────────────────
// Rank = (Behavior Score × Skill Match) + Elite Boost.
// The Elite boost only applies while the worker is in Good Standing (600+),
// so a highly skilled free worker always outranks a mediocre paid one.

const GOOD_STANDING = 600;
const ELITE_BOOST = 60;

const eliteBoostActive = (worker) => worker.elite && worker.behaviorScore >= GOOD_STANDING;

const blendedRank = (worker) =>
  worker.behaviorScore * (worker.matchPct / 100) + (eliteBoostActive(worker) ? ELITE_BOOST : 0);

const scoreTone = (score) => {
  if (score >= 700) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= GOOD_STANDING) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
};

// ── Invite status progression (simulated) ─────────────────────────────────
// sent → delivered → read → accepted | declined
const INVITE_STEPS = ["sent", "delivered", "read", "resolved"];
const STEP_LABELS = ["Invite Sent", "Delivered", "Seen by Worker", "Response"];

// ── WhatsApp-style tick indicator ─────────────────────────────────────────
function InviteTicks({ status, compact = false }) {
  const size = compact ? "w-3.5 h-3.5" : "w-4 h-4";

  if (status === "accepted") {
    return (
      <span className="flex items-center gap-1 text-emerald-600 font-bold">
        <CheckCircle2 className={`${size} wb-tick-pop`} />
        {!compact && "Accepted"}
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="flex items-center gap-1 text-red-500 font-bold">
        <XCircle className={`${size} wb-tick-pop`} />
        {!compact && "Declined"}
      </span>
    );
  }
  if (status === "read") {
    return (
      <span className="flex items-center gap-1 text-[#1B3FAB] font-bold">
        <CheckCheck className={`${size} wb-tick-pop wb-tick-read`} />
        {!compact && "Seen"}
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="flex items-center gap-1 text-slate-400 font-bold">
        <CheckCheck className={`${size} wb-tick-pop`} />
        {!compact && "Delivered"}
      </span>
    );
  }
  // sent
  return (
    <span className="flex items-center gap-1 text-slate-400 font-bold">
      <Check className={`${size} wb-tick-pop`} />
      {!compact && "Sent"}
    </span>
  );
}

// ── Wizard-style step tracker (same pattern as worker's Active Workspace) ──
function InviteWizard({ invite }) {
  const isResolved = invite.status === "accepted" || invite.status === "declined";
  const stepIndex = INVITE_STEPS.indexOf(
    invite.status === "sent" ? "sent"
    : invite.status === "delivered" ? "delivered"
    : invite.status === "read" ? "read"
    : "resolved"
  );

  // With 4 evenly-spaced columns, node centers sit at 12.5%/37.5%/62.5%/87.5% —
  // the line must run only between the first and last center (a 75%-wide span),
  // not the full 0–100% container width, or it overshoots past the end nodes.
  const filledGaps = isResolved ? 3 : stepIndex;
  const fillPct = (filledGaps / 3) * 75;

  return (
    <div className="px-2 py-4">
      <div className="relative z-0 grid grid-cols-4 items-center">
        <div className="absolute top-1/2 left-[12.5%] right-[12.5%] -z-10 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className={`absolute top-1/2 left-[12.5%] -z-10 h-1 -translate-y-1/2 rounded-full transition-all duration-700 ease-out ${
            invite.status === "declined" ? "bg-red-400" : "bg-emerald-500"
          }`}
          style={{ width: `${fillPct}%` }}
        />
        {STEP_LABELS.map((label, index) => {
          const done = index < stepIndex || (index === stepIndex && isResolved);
          const active = index === stepIndex && !isResolved;
          const isFinal = index === 3;
          const showDeclined = isFinal && invite.status === "declined";

          return (
            <div key={label} className="flex justify-center">
              <div
                className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-sm transition-colors duration-500 ${
                  showDeclined
                    ? "bg-red-500 text-white"
                    : done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-emerald-500 text-white ring-4 ring-emerald-200"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {showDeclined ? (
                  <XCircle className="h-4 w-4" />
                ) : done ? (
                  <Check className="h-4 w-4" />
                ) : active ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                ) : (
                  index + 1
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {STEP_LABELS.map((label, index) => {
          const isFinal = index === 3;
          const finalLabel =
            isFinal && invite.status === "accepted"
              ? "Accepted"
              : isFinal && invite.status === "declined"
              ? "Declined"
              : label;
          const done = index < stepIndex || (index === stepIndex && isResolved);
          const active = index === stepIndex && !isResolved;
          return (
            <p
              key={label}
              className={`text-center text-xs font-bold transition-colors duration-500 ${
                isFinal && invite.status === "declined"
                  ? "text-red-600"
                  : done || active
                  ? "text-emerald-700"
                  : "text-slate-400"
              }`}
            >
              {finalLabel}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function BusinessWorkers({ onOpenChat }) {
  const { workersDb } = usePlatformData();
  const [view, setView] = useState("browse"); // "browse" | "invites"
  const [invites, setInvites] = useState({}); // { [workerId]: { status, sentAt, respondedAt } }
  // CRITICAL: this holds the exact worker object the business clicked — the
  // profile portal renders whatever is here, never a fixed/hardcoded worker.
  const [selectedWorker, setSelectedWorker] = useState(null);
  const timersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timers) => timers.forEach(clearTimeout));
    };
  }, []);

  // Lock page scroll + support Escape-to-close while the profile portal is open
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

  const rankedWorkers = useMemo(
    () => [...workersDb].sort((a, b) => blendedRank(b) - blendedRank(a)),
    [workersDb]
  );

  const sendInvite = (worker) => {
    if (invites[worker.id]) return;

    setInvites((prev) => ({ ...prev, [worker.id]: { status: "sent", sentAt: Date.now() } }));

    const t1 = setTimeout(() => {
      setInvites((prev) => ({ ...prev, [worker.id]: { ...prev[worker.id], status: "delivered" } }));
    }, 1200);

    const t2 = setTimeout(() => {
      setInvites((prev) => ({ ...prev, [worker.id]: { ...prev[worker.id], status: "read" } }));
    }, 2800);

    const t3 = setTimeout(() => {
      // Simulated worker response — low skill match tends to decline
      const outcome = worker.matchPct < 50 ? "declined" : "accepted";
      setInvites((prev) => ({
        ...prev,
        [worker.id]: { ...prev[worker.id], status: outcome, respondedAt: Date.now() },
      }));
    }, 5200);

    timersRef.current[worker.id] = [t1, t2, t3];
  };

  const invitedWorkers = rankedWorkers.filter((w) => invites[w.id]);
  const acceptedCount = invitedWorkers.filter((w) => invites[w.id]?.status === "accepted").length;

  return (
    <>
    <div className="min-h-screen bg-slate-50 p-7 wb-tab-enter">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-2xl font-extrabold text-[#0F172A]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Elite Talent Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Matched to:{" "}
              <strong className="text-slate-700">AI Chatbot for Customer Support</strong>
              {" "}· Showing top {rankedWorkers.length} candidates
            </p>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setView("browse")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "browse" ? "bg-[#1B3FAB] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Browse Talent
            </button>
            <button
              onClick={() => setView("invites")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "invites" ? "bg-[#1B3FAB] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              My Invites
              {invitedWorkers.length > 0 && (
                <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                  view === "invites" ? "bg-white/25 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {invitedWorkers.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {view === "browse" ? (
          <>
            {/* Fairness Banner */}
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F6FF]">
                <Scale className="h-4 w-4 text-[#1B3FAB]" />
              </div>
              <p className="text-xs leading-5 text-slate-500">
                <span className="font-bold text-slate-700">Fairness-first ranking.</span>{" "}
                Freelancers are ordered by Behavior Score × Skill Match, with a small boost for Elite members in
                Good Standing (600+). Skill always outranks spend — nobody can buy their way past better talent.
              </p>
            </div>

            {/* ── Worker Card Grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankedWorkers.map((w, i) => {
                const boostActive = eliteBoostActive(w);
                const boostPaused = w.elite && !boostActive;
                const isTopRated = w.rating >= 4.8 && w.jobs >= 50;
                const invite = invites[w.id];

                return (
                  <div
                    key={w.id}
                    className={`flex flex-col rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md wb-card-enter ${
                      boostActive
                        ? "border-amber-200 shadow-[0_6px_24px_-8px_rgba(245,158,11,0.25)]"
                        : "border-slate-200"
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Elite accent stripe */}
                    {boostActive && (
                      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 to-amber-500" />
                    )}

                    <div className="p-5 flex flex-col flex-1">

                      {/* ── Header: Avatar + Name + Title | Badges ── */}
                      <div className="flex items-start justify-between mb-4">

                        {/* Left: Avatar + Name + Title */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {w.avatar ? (
                            <img
                              src={w.avatar}
                              alt={w.name}
                              className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <Avatar initials={w.av} size="w-12 h-12" text="text-sm" />
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <h3
                                className="font-extrabold text-[#0F172A] text-sm leading-tight"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                              >
                                {w.name}
                              </h3>
                              <VerifBadge tier={w.tier} />
                            </div>
                            <p className="text-xs text-slate-500 truncate">{w.title}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                              <span className="text-xs text-slate-700 font-semibold">{w.rating}</span>
                              <span className="text-xs text-slate-400">({w.reviews})</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Status Badges */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                          {isTopRated && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F6FF] border border-[#1B3FAB]/15 px-2 py-1 text-[10px] font-bold text-[#1B3FAB]">
                              <Award className="h-2.5 w-2.5" />
                              Top Rated
                            </span>
                          )}
                          {boostActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                              <Crown className="h-2.5 w-2.5" />
                              Elite
                            </span>
                          )}
                          {boostPaused && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500"
                              title="Elite visibility is paused until Behavior Score returns to 600+"
                            >
                              <PauseCircle className="h-2.5 w-2.5" />
                              Paused
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Middle: Score + Rate + Skills Tag Cloud ── */}
                      <div className="space-y-3 flex-1">
                        {/* Behavior Score + Match + Rate row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${scoreTone(w.behaviorScore)}`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {w.behaviorScore}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-[#1B3FAB]/15 bg-[#F4F6FF] px-2.5 py-1 text-xs font-bold text-[#1B3FAB]">
                            {w.matchPct}% match
                          </span>
                          <span className="text-xs font-bold text-slate-600 ml-auto">{w.rate}</span>
                        </div>

                        {/* Skills tag cloud */}
                        <div className="flex flex-wrap gap-1.5">
                          {w.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ── Split-Action Footer: Jobs stat | View Profile + Invite ── */}
                      <div
                        className={`border-t pt-4 mt-4 flex items-center justify-between ${
                          boostActive ? "border-amber-100" : "border-slate-100"
                        }`}
                      >
                        {/* Left: Jobs Completed */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-[#0F172A] truncate">
                            {w.jobs} Jobs Completed
                          </span>
                        </div>

                        {/* Right: Action group */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setSelectedWorker(w)}
                            className="bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                          >
                            View Profile
                          </button>

                          {!invite ? (
                            <button
                              onClick={() => sendInvite(w)}
                              className="flex items-center gap-1.5 bg-[#FF6B35] text-white hover:bg-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Invite
                            </button>
                          ) : (
                            <button
                              onClick={() => setView("invites")}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-200 ${
                                invite.status === "accepted"
                                  ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                  : invite.status === "declined"
                                  ? "bg-red-50 border-red-200 hover:bg-red-100"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <InviteTicks status={invite.status} compact />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <InvitesWizardPage
            rankedWorkers={rankedWorkers}
            invites={invites}
            invitedWorkers={invitedWorkers}
            acceptedCount={acceptedCount}
            onOpenChat={onOpenChat}
            onBrowse={() => setView("browse")}
          />
        )}

      </div>
    </div>

      {/* ── Immersive Full-Screen Profile Portal ─────────────────────────────
          Renders whichever worker is in `selectedWorker` state — never a
          fixed identity. Closing resets state to null, tearing the portal down. */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <button
            onClick={() => setSelectedWorker(null)}
            aria-label="Close profile"
            className="fixed top-6 right-6 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-[95vw] h-[90vh] max-w-6xl bg-slate-50 rounded-2xl overflow-y-auto shadow-2xl wb-panel-enter">
            <WorkerShareableProfile worker={selectedWorker} />
          </div>
        </div>
      )}
    </>
  );
}

function formatTime(ts) {
  if (!ts) return "–";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ── "My Invites" — premium feed (left) + sticky control-center sidebar (right) ──
function InvitesWizardPage({ rankedWorkers, invites, invitedWorkers, acceptedCount, onOpenChat, onBrowse }) {
  const [selectedId, setSelectedId] = useState(invitedWorkers[0]?.id ?? null);

  useEffect(() => {
    if (!invitedWorkers.some((w) => w.id === selectedId)) {
      setSelectedId(invitedWorkers[0]?.id ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitedWorkers.length]);

  const selectedWorker = rankedWorkers.find((w) => w.id === selectedId) ?? null;
  const selectedInvite = selectedId ? invites[selectedId] : null;

  if (invitedWorkers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
            <Inbox className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No invites sent yet</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Invite workers from the Talent Directory to track delivery, read receipts, and their response here.
          </p>
          <button
            onClick={onBrowse}
            className="mt-5 px-5 py-2.5 bg-[#1B3FAB] text-white rounded-xl text-sm font-bold hover:bg-[#1635A0] transition-colors"
          >
            Browse Talent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Invite feed ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sent Invites
            </h3>
            <span className="text-sm font-medium text-slate-500">
              {invitedWorkers.length} sent · {acceptedCount} accepted
            </span>
          </div>

          {invitedWorkers.map((w) => {
            const invite = invites[w.id];
            const isSelected = selectedId === w.id;
            const boostActive = eliteBoostActive(w);
            const isTopRated = w.rating >= 4.8 && w.jobs >= 50;
            const badgeLabel = boostActive ? "Elite" : isTopRated ? "Top Rated" : null;

            return (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                className={`w-full text-left bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                  isSelected ? "border-[#1B3FAB] ring-2 ring-[#1B3FAB]/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={w.av} size="w-12 h-12" text="text-sm" />
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-slate-900 truncate">{w.name}</p>
                      <p className="text-sm font-medium text-slate-500 truncate">{w.title}</p>
                    </div>
                  </div>
                  {badgeLabel && (
                    <span className="flex-shrink-0 bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {badgeLabel}
                    </span>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">{w.jobs} jobs completed</span>
                  <InviteTicks status={invite.status} compact />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right: Sticky control-center sidebar ─────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
            {selectedWorker && selectedInvite ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={selectedWorker.av} size="w-14 h-14" text="text-base" />
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 truncate">{selectedWorker.name}</h2>
                      <p className="text-sm font-medium text-slate-500 truncate">{selectedWorker.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-700">{selectedWorker.rating}</span>
                        <span className="text-xs text-slate-400">({selectedWorker.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <InviteTicks status={selectedInvite.status} compact />
                </div>

                {/* Wizard stepper */}
                <div className="py-5 border-b border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Invite Progress
                  </p>
                  <InviteWizard invite={selectedInvite} />
                </div>

                {/* Data rows */}
                <div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className="font-semibold text-slate-900 capitalize">{selectedInvite.status}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">Invite Sent</span>
                    <span className="font-semibold text-slate-900">{formatTime(selectedInvite.sentAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">Response Received</span>
                    <span className="font-semibold text-slate-900">
                      {selectedInvite.respondedAt ? formatTime(selectedInvite.respondedAt) : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Status message card */}
                <div
                  className={`mt-4 flex items-start gap-3 p-4 rounded-2xl border ${
                    selectedInvite.status === "accepted"
                      ? "bg-emerald-50 border-emerald-200"
                      : selectedInvite.status === "declined"
                      ? "bg-red-50 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {selectedInvite.status === "accepted" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : selectedInvite.status === "declined" ? (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      {selectedInvite.status === "accepted"
                        ? "Worker accepted your invitation"
                        : selectedInvite.status === "declined"
                        ? "Worker declined this invitation"
                        : selectedInvite.status === "read"
                        ? "Worker has seen your invitation"
                        : selectedInvite.status === "delivered"
                        ? "Invitation delivered — awaiting response"
                        : "Invitation sent — waiting for delivery"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedInvite.status === "accepted"
                        ? "You can now message them directly to discuss project details and next steps."
                        : selectedInvite.status === "declined"
                        ? "This worker isn't available right now. Try inviting another candidate from the directory."
                        : "You'll be notified here the moment their response comes in — no need to refresh."}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                {selectedInvite.status === "accepted" ? (
                  <button
                    onClick={() => onOpenChat?.(selectedWorker.name)}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e55a2b] text-white py-3.5 rounded-xl font-bold text-base shadow-[0_4px_14px_0_rgba(255,107,53,0.39)] transition-transform active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message {selectedWorker.name.split(" ")[0]}
                  </button>
                ) : selectedInvite.status === "declined" ? (
                  <button
                    onClick={onBrowse}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold text-base hover:bg-slate-50 transition-colors"
                  >
                    Browse Other Talent
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-100 text-slate-400 py-3.5 rounded-xl font-bold text-base cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    Waiting for Response
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-10">Select an invite to see details</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
