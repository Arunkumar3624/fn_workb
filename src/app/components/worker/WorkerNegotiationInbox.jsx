import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Briefcase, Check, CheckCircle2, IndianRupee, MapPin, MessageSquare,
  Send, ShieldCheck, Sparkles, Star, Timer, Trophy, X,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import IdentityHeader from "../shared/IdentityHeader";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import { usePlatformData } from "../../context/PlatformContext";
import { calculatePotentialPoints } from "../../utils/pointMatrix";
import { PROJECT_STATUS_META, nextProjectStatus } from "../../utils/projectStatus";

// Invitation data now lives in PlatformContext (invitesDb) so the sidebar's
// pending badge and this inbox always agree on what's outstanding.

function parseBudget(budgetString) {
  return Number(String(budgetString).replace(/[^0-9]/g, "")) || 0;
}

// ─── Thread list item ────────────────────────────────────────────────────────

function InviteItem({ invite, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 border-b border-slate-100 transition-colors relative ${
        isSelected ? "bg-[#F4F6FF]" : "hover:bg-slate-50"
      }`}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#1B3FAB]" />}
      <div className="flex items-center gap-3">
        <Avatar initials={invite.businessInitials} bg={invite.businessBg} size="w-10 h-10" text="text-xs" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0F172A] text-sm truncate">{invite.businessName}</p>
          <p className="text-xs text-slate-500 truncate">{invite.jobTitle}</p>
        </div>
        {invite.isAccepted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

// ─── Chat bubble — "Escrow Terminal" tone: gray for business, orange for worker ──

function ChatBubble({ message }) {
  const isWorker = message.from === "worker";
  return (
    <div className={`flex ${isWorker ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[76%]">
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isWorker ? "bg-[#FF6B35] text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"
          }`}
        >
          {message.text}
        </div>
        <p className={`text-[10px] text-slate-400 mt-1 ${isWorker ? "text-right mr-1" : "ml-1"}`}>{message.time}</p>
      </div>
    </div>
  );
}

// ─── Business Quick View — stays inside the negotiation flow ────────────────

function BusinessQuickView({ invite, onClose }) {
  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar initials={invite.businessInitials} bg={invite.businessBg} size="w-12 h-12" text="text-base" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {invite.businessName}
                </p>
                <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </div>
              {invite.businessRating != null && (
                <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {invite.businessRating} · {invite.businessJobsPosted} jobs posted
                </p>
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
            <span className="text-xs font-bold text-slate-900 text-right">{invite.jobTitle}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-500">Verification</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          Back to Invitation
        </button>
      </div>
    </div>
  );
}

// ─── State 1: The Acceptance Gate ────────────────────────────────────────────
// Renders ONLY the job offer. No chat input, no message history exist in the
// DOM here — they cannot be reached until the worker accepts.

function InvitationGateView({ invite, onAccept, onNameClick }) {
  const potentialPoints = calculatePotentialPoints(parseBudget(invite.budget), Boolean(invite.urgent));

  return (
    <>
      {/* Identity Anchor — white "cover page" zone of the contract document */}
      <IdentityHeader
        name={invite.businessName}
        subtitle="Business"
        initials={invite.businessInitials}
        avatarBg={invite.businessBg}
        verified
        rating={invite.businessRating}
        reviews={invite.businessJobsPosted}
        onNameClick={onNameClick}
      />

      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-5 sm:px-7">
        <p className="text-sm italic text-slate-500">
          You've been invited by {invite.businessName} to discuss this project…
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
          {invite.jobTitle}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1.5">{invite.duration}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified client
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <main className="flex flex-col gap-6 lg:col-span-8">
            {/* Role overview */}
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
              <p className="mt-5 text-[15px] leading-7 text-slate-600">{invite.description}</p>
            </section>

            {/* Key deliverables */}
            {invite.deliverables?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">What success means</p>
                    <h3 className="text-lg font-black text-slate-900">Key Deliverables</h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {invite.deliverables.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                      <div className="flex gap-3 text-sm leading-relaxed text-slate-600">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tech stack */}
            {invite.techStack?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-100">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Required stack</p>
                    <h3 className="text-lg font-black text-slate-900">Skills Matched to Brief</h3>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {invite.techStack.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Terms + single Accept action */}
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
                    <p className="text-sm font-black text-slate-900">{invite.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <Timer className="h-5 w-5 text-[#1B3FAB]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Duration</p>
                    <p className="text-sm font-black text-slate-900">{invite.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <MapPin className="h-5 w-5 text-[#1B3FAB]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Location</p>
                    <p className="text-sm font-black text-slate-900">{invite.location}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-5">
                <button
                  onClick={onAccept}
                  className="w-full rounded-2xl bg-[#FF6B35] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#e95c25] hover:shadow-xl active:scale-[0.98]"
                >
                  Accept Work &amp; Start Chat
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Chat unlocks only after you accept.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// ─── State 2: The Chat Interface ─────────────────────────────────────────────
// Only mounted once isAccepted is true — message history and the input live
// exclusively inside this component.

function ChatInterfaceView({ invite, input, onInputChange, onSend, messagesEndRef, onNameClick }) {
  const navigate = useNavigate();
  const { advanceInviteStatus, submitRating } = usePlatformData();
  const status = invite.projectStatus;
  const meta = status ? PROJECT_STATUS_META[status] : null;
  const nextStatus = status ? nextProjectStatus(status) : null;

  if (status === "COMPLETED") {
    // Project Completion & Retention Hub — replaces the active chat surface
    // entirely once a project is done and paid out.
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <IdentityHeader
          name={invite.businessName}
          subtitle={invite.jobTitle}
          initials={invite.businessInitials}
          avatarBg={invite.businessBg}
          statusPill={{ text: "Completed", tone: "emerald" }}
          onNameClick={onNameClick}
        />
        <ProjectCompletionHub
          perspective="worker"
          counterpartName={invite.businessName}
          amount={parseBudget(invite.budget)}
          review={invite.review}
          onSubmit={(rating, feedback) => submitRating(invite.id, rating, feedback)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Identity Anchor — pinned at the top while the chat scrolls beneath it */}
      <IdentityHeader
        name={invite.businessName}
        subtitle={invite.jobTitle}
        initials={invite.businessInitials}
        avatarBg={invite.businessBg}
        verified={!status}
        onNameClick={onNameClick}
      />

      {/* Slim Timeline Header — only once funds are actually secured */}
      {status && <TimelineTracker status={status} />}

      {status ? (
        <div className="flex-shrink-0 bg-emerald-50 border-b border-emerald-100 px-6 py-1.5 flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-emerald-700">Funds secured for this project</p>
          </span>
          <button
            onClick={() => navigate("/invoice?role=worker")}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 flex-shrink-0"
          >
            View Invoice
          </button>
        </div>
      ) : (
        <div className="flex-shrink-0 bg-slate-100 border-b border-slate-200 px-6 py-1.5 flex items-center gap-1.5">
          <Timer className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-slate-500">Awaiting payment confirmation from {invite.businessName}</p>
        </div>
      )}

      {/* Primary Action — only rendered when it's the worker's turn to act */}
      {meta?.actionBy === "worker" && nextStatus && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-2.5 flex justify-end">
          <button
            onClick={() => advanceInviteStatus(invite.id, nextStatus)}
            className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {meta.nextActionLabel}
          </button>
        </div>
      )}
      {status === "FILES_SUBMITTED" && (
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-6 py-1.5">
          <p className="text-[11px] font-semibold text-amber-700">Awaiting business approval &amp; fund release</p>
        </div>
      )}

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-slate-50">
        {invite.messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Message securely via WorkBridge…"
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-colors"
          />
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 ${
              input.trim()
                ? "bg-[#FF6B35] text-white hover:bg-[#e55a2b] shadow-md shadow-[#FF6B35]/20 hover:-translate-y-0.5"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          256-bit secured · External contact info is monitored and blocked
        </p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function WorkerNegotiationInbox({ initialInviteId }) {
  const { invitesDb: invites, acceptInvitation, sendInviteMessage } = usePlatformData();
  const [selectedId, setSelectedId] = useState(initialInviteId ?? invites[0]?.id ?? null);
  const [input, setInput] = useState("");
  const [toast, setToast] = useState("");
  const [showQuickView, setShowQuickView] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedInvite = invites.find((i) => i.id === selectedId) ?? null;

  // Deep-link support: a "Job Invite" notification elsewhere can push
  // /worker/negotiations?invite=<id> and land directly on that offer.
  useEffect(() => {
    if (initialInviteId && invites.some((i) => i.id === initialInviteId)) {
      setSelectedId(initialInviteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInviteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, invites]);

  const handleAcceptInvitation = () => {
    if (!selectedInvite) return;
    acceptInvitation(selectedInvite.id);
    setToast(`Invitation accepted — ${selectedInvite.businessName} has been notified.`);
    window.setTimeout(() => setToast(""), 2600);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !selectedInvite) return;
    sendInviteMessage(selectedInvite.id, text);
    setInput("");
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Left: Invitation Inbox (w-1/3) ──────────────────────────────── */}
      <div className="w-1/3 min-w-[280px] max-w-[360px] flex flex-col border-r border-slate-200 bg-white flex-shrink-0">
        <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h1 className="font-extrabold text-[#0F172A] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Invitations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {invites.filter((i) => !i.isAccepted).length} pending · {invites.filter((i) => i.isAccepted).length} accepted
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {invites.map((invite) => (
            <InviteItem
              key={invite.id}
              invite={invite}
              isSelected={selectedId === invite.id}
              onClick={() => setSelectedId(invite.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Right: Dynamic Gate / Chat (w-2/3) ──────────────────────────── */}
      <div className="w-2/3 flex-1 flex flex-col min-h-0 bg-slate-50 relative">
        {!selectedInvite ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Select an invitation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!selectedInvite.isAccepted ? (
              <motion.div
                key={`gate-${selectedInvite.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                <InvitationGateView
                  invite={selectedInvite}
                  onAccept={handleAcceptInvitation}
                  onNameClick={() => setShowQuickView(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`chat-${selectedInvite.id}`}
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                <ChatInterfaceView
                  invite={selectedInvite}
                  input={input}
                  onInputChange={setInput}
                  onSend={sendMessage}
                  messagesEndRef={messagesEndRef}
                  onNameClick={() => setShowQuickView(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Accept toast */}
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
        <BusinessQuickView invite={selectedInvite} onClose={() => setShowQuickView(false)} />
      )}
    </div>
  );
}
