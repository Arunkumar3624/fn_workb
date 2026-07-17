import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  Clock3,
  IndianRupee,
  LockKeyhole,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import IdentityHeader from "../shared/IdentityHeader";
import { listProjects, updateProjectStatus } from "../../lib/projectsApi";
import { getPublicProfile } from "../../lib/profilesApi";
import { ApiError } from "../../lib/apiClient";
import { getInitials } from "../../utils/formValidation";

const ACTIVE_INVITE_STATUSES = new Set([
  "INVITED",
  "ACCEPTED",
  "FUNDS_SECURED",
  "WORK_IN_PROGRESS",
  "FILES_SUBMITTED",
]);

function isActiveInvite(project) {
  return ACTIVE_INVITE_STATUSES.has(project.status);
}

function formatINR(amount) {
  if (!amount) return "Budget open";
  return `INR ${Number(amount).toLocaleString("en-IN")}`;
}

function formatDuration(deadline) {
  if (!deadline) return "Flexible timeline";
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function statusLabel(status) {
  if (status === "INVITED") return "Pending Review";
  if (status === "ACCEPTED") return "Terms Locked";
  if (status === "FUNDS_SECURED") return "Escrow Funded";
  if (status === "WORK_IN_PROGRESS") return "In Progress";
  if (status === "FILES_SUBMITTED") return "In Review";
  return status ?? "Active";
}

function seedMessages(invite) {
  return [
    {
      id: `${invite.id}-business-brief`,
      sender: "business",
      text: `Hi, we'd like to invite you to work on "${invite.title}". The budget and scope are ready for your review.`,
      time: "10:12 AM",
    },
    {
      id: `${invite.id}-worker-reply`,
      sender: "worker",
      text: "Thanks for the invite. I'm reviewing the scope and timeline now.",
      time: "10:14 AM",
    },
    {
      id: `${invite.id}-business-confirm`,
      sender: "business",
      text: "Perfect. The terms are ready to lock once you accept.",
      time: "10:16 AM",
    },
  ];
}

function InvitationCard({ invite, onReview }) {
  return (
    <button
      type="button"
      onClick={() => onReview(invite)}
      className="group flex min-h-[310px] flex-col rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B3FAB] text-base font-black text-white shadow-sm">
          {getInitials(invite.business_name)}
        </div>
        <span className="rounded-full bg-[#FF6B35] px-4 py-2 text-xs font-black text-white shadow-sm shadow-orange-200">
          {formatINR(invite.budget)}
        </span>
      </div>

      <div className="mt-7 flex-1">
        <p className="text-2xl font-black tracking-tight text-slate-900">
          {invite.business_name || "Verified Business"}
        </p>
        <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-slate-700">
          {invite.title}
        </h2>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
          {invite.description || "Review the proposal, confirm scope, and start a protected WorkBridge project."}
        </p>
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDuration(invite.deadline)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white transition group-hover:bg-[#FF6B35]">
          Review Proposal
          <Sparkles className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

function InvitationGrid({ invites, loading, loadError, onReview }) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex max-w-md items-start gap-3 rounded-2xl border border-red-100 bg-white px-5 py-4 text-sm font-semibold text-red-600 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">No active invitations yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            New business invitations will appear as big proposal cards here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-7 py-8 lg:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
            Invitation Deck
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Review your business proposals
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Pick a card to open the secure proposal drawer.
          </p>
        </div>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-[#FF6B35]">
          {invites.length} active invite{invites.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {invites.map((invite) => (
          <InvitationCard key={invite.id} invite={invite} onReview={onReview} />
        ))}
      </div>
    </div>
  );
}

function StepRow({ complete, active, title, description }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          complete
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {complete ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
      </div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function JobSpecsWizard({
  invite,
  wizardMode,
  onStartWizard,
  onBackToSpecs,
  onAccept,
  onDecline,
  actionBusy,
  actionError,
}) {
  return (
    <section className="flex min-h-0 basis-[40%] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          Job Specs
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          {invite.title}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {actionError && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {wizardMode === "specs" ? (
            <motion.div
              key="job-specs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2 text-[#FF6B35]">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-[11px] font-black uppercase tracking-wide">Budget</p>
                  </div>
                  <p className="mt-2 text-lg font-black text-slate-900">{formatINR(invite.budget)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    <p className="text-[11px] font-black uppercase tracking-wide">Duration</p>
                  </div>
                  <p className="mt-2 text-lg font-black text-slate-900">{formatDuration(invite.deadline)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {invite.description || "No additional description was provided by the business."}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B3FAB]" />
                  <div>
                    <p className="text-sm font-black text-slate-900">Terms stay protected</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Accepting locks scope, budget, and deadline into your WorkBridge workspace.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="job-wizard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="space-y-3"
            >
              <button
                type="button"
                onClick={onBackToSpecs}
                className="mb-2 inline-flex items-center gap-2 text-sm font-black text-slate-400 transition hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to specs
              </button>
              <StepRow
                complete
                title="Review Scope"
                description="Project title, description, timeline, and budget are confirmed."
              />
              <StepRow
                active
                title="Confirm Terms Lock"
                description="This project will move into your protected workspace after confirmation."
              />
              <StepRow
                title="Start Project"
                description="Open the workspace and begin delivery once the terms are locked."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-100 bg-white/90 p-5 backdrop-blur-md">
        {wizardMode === "specs" ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onStartWizard}
              disabled={actionBusy}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 text-sm font-black text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              Accept Invitation & Lock Terms
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Decline
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAccept}
            disabled={actionBusy}
            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 text-sm font-black text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {actionBusy ? "Locking terms..." : "Start Project"}
          </button>
        )}
      </div>
    </section>
  );
}

function ChatBubble({ message }) {
  const isBusiness = message.sender === "business";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`flex ${isBusiness ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[72%] px-5 py-4 shadow-sm ${
          isBusiness
            ? "rounded-3xl rounded-bl-none bg-[#FF6B35] text-white shadow-orange-200"
            : "rounded-3xl rounded-br-none border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <p className="text-sm font-medium leading-6">{message.text}</p>
        <p className={`mt-2 text-[11px] font-bold ${isBusiness ? "text-white/75" : "text-slate-400"}`}>
          {message.time}
        </p>
      </div>
    </motion.div>
  );
}

function ChatThread({ invite, messages, draft, onDraftChange, onSend }) {
  const feedRef = useRef(null);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, invite.id]);

  return (
    <section className="flex min-h-0 basis-[60%] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
      <div className="flex-shrink-0 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          Active Chat
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-900">
          Chat with {invite.business_name || "Business"}
        </h3>
      </div>

      <div ref={feedRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={onSend}
        className="sticky bottom-0 flex-shrink-0 border-t border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-200 hover:text-[#FF6B35]"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <label className="flex min-h-[52px] flex-1 items-center rounded-full border border-slate-200 bg-slate-100 px-5 transition focus-within:border-orange-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
            <input
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Write a secure message..."
              className="h-full flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </section>
  );
}

function DetailDrawer({
  invite,
  profile,
  messages,
  draft,
  wizardMode,
  actionBusy,
  actionError,
  onClose,
  onStartWizard,
  onBackToSpecs,
  onAccept,
  onDecline,
  onDraftChange,
  onSend,
}) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.section
        className="fixed bottom-0 left-0 z-50 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-slate-200 bg-white/90 p-8 shadow-[0_-28px_80px_-28px_rgba(15,23,42,0.55)] backdrop-blur-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.34, ease: "easeInOut" }}
      >
        <header className="sticky top-0 z-10 -mx-8 -mt-8 flex-shrink-0 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1 [&>div]:border-b-0 [&>div]:bg-transparent [&>div]:px-0 [&>div]:py-0">
              <IdentityHeader
                name={invite.business_name || "Verified Business"}
                subtitle={`${invite.title} · ${statusLabel(invite.status)}`}
                initials={getInitials(invite.business_name)}
                avatarUrl={invite.business_avatar_url}
                verified={profile?.verified ?? true}
                rating={profile?.rating}
                reviews={profile?.reviews_count}
                statusPill={{
                  text: statusLabel(invite.status),
                  tone: invite.status === "INVITED" ? "amber" : "emerald",
                }}
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close proposal drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 pt-6 lg:grid-cols-[40%_60%]">
          <JobSpecsWizard
            invite={invite}
            wizardMode={wizardMode}
            onStartWizard={onStartWizard}
            onBackToSpecs={onBackToSpecs}
            onAccept={onAccept}
            onDecline={onDecline}
            actionBusy={actionBusy}
            actionError={actionError}
          />
          <ChatThread
            invite={invite}
            messages={messages}
            draft={draft}
            onDraftChange={onDraftChange}
            onSend={onSend}
          />
        </div>
      </motion.section>
    </>
  );
}

export default function NegotiationInbox({ initialProjectId }) {
  const [invites, setInvites] = useState([]);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messagesByInvite, setMessagesByInvite] = useState({});
  const [draft, setDraft] = useState("");
  const [wizardMode, setWizardMode] = useState("specs");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "worker" })
      .then((data) => {
        if (cancelled) return;
        const activeInvites = data.filter(isActiveInvite);
        setInvites(activeInvites);

        const deepLinkedInvite = activeInvites.find((invite) => invite.id === initialProjectId);
        if (deepLinkedInvite) setSelectedInvite(deepLinkedInvite);
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
  }, [initialProjectId]);

  const activeInvite = useMemo(() => {
    if (!selectedInvite) return null;
    return invites.find((invite) => invite.id === selectedInvite.id) ?? selectedInvite;
  }, [invites, selectedInvite]);

  useEffect(() => {
    if (!activeInvite) return;
    setWizardMode("specs");
    setActionError("");
    setDraft("");
    setMessagesByInvite((current) => {
      if (current[activeInvite.id]) return current;
      return { ...current, [activeInvite.id]: seedMessages(activeInvite) };
    });
  }, [activeInvite?.id]);

  useEffect(() => {
    if (!activeInvite?.business_id) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    setProfile(null);
    getPublicProfile(activeInvite.business_id)
      .then((businessProfile) => {
        if (!cancelled) setProfile(businessProfile);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activeInvite?.business_id]);

  const patchInvite = (updatedInvite) => {
    setInvites((current) => current.map((invite) => (invite.id === updatedInvite.id ? { ...invite, ...updatedInvite } : invite)));
    setSelectedInvite((current) => (current?.id === updatedInvite.id ? { ...current, ...updatedInvite } : current));
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const handleAccept = async () => {
    if (!activeInvite) return;
    setActionBusy(true);
    setActionError("");

    try {
      if (activeInvite.status === "INVITED") {
        const updated = await updateProjectStatus(activeInvite.id, "ACCEPTED");
        patchInvite(updated);
      }
      showToast("Terms locked. Project moved into your workspace.");
      setWizardMode("specs");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not lock this invitation.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDecline = () => {
    setSelectedInvite(null);
    showToast("Invitation declined for now.");
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!activeInvite || !draft.trim()) return;

    const nextMessage = {
      id: `${activeInvite.id}-worker-${Date.now()}`,
      sender: "worker",
      text: draft.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesByInvite((current) => ({
      ...current,
      [activeInvite.id]: [...(current[activeInvite.id] ?? []), nextMessage],
    }));
    setDraft("");
  };

  const closeDrawer = () => {
    setSelectedInvite(null);
    setWizardMode("specs");
    setActionError("");
    setDraft("");
  };

  const messages = activeInvite ? messagesByInvite[activeInvite.id] ?? [] : [];

  return (
    <section className="relative h-full w-full overflow-hidden bg-[#F8FAFC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <InvitationGrid invites={invites} loading={loading} loadError={loadError} onReview={setSelectedInvite} />

      <AnimatePresence>
        {activeInvite && (
          <DetailDrawer
            invite={activeInvite}
            profile={profile}
            messages={messages}
            draft={draft}
            wizardMode={wizardMode}
            actionBusy={actionBusy}
            actionError={actionError}
            onClose={closeDrawer}
            onStartWizard={() => setWizardMode("wizard")}
            onBackToSpecs={() => setWizardMode("specs")}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onDraftChange={setDraft}
            onSend={handleSend}
          />
        )}
      </AnimatePresence>

      {toast && (
        <div className="absolute bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-md">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {toast}
          </span>
        </div>
      )}
    </section>
  );
}
