import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Loader2,
  MessagesSquare,
  PhoneOff,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { listBlockedAttempts, resolveBlockedAttempt, searchMessages } from "../../lib/adminApi";
import { ApiError } from "../../lib/apiClient";

function formatTime(iso) {
  return new Date(iso).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// View 2: Message Monitor — full-text search over every real chat message,
// the manual complement to the blocked-attempts queue (which only shows
// what the filter's regex actually caught). Support uses this to spot-check
// conversations for anything that slipped past the automated block.
function MessageMonitor() {
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError("");
      searchMessages(search)
        .then(setMessages)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load messages."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-1.5 mb-1">
        <MessagesSquare className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trust &amp; Safety</span>
      </div>
      <h1 className="text-lg font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Message Monitor
      </h1>
      <p className="mt-2.5 text-xs font-semibold text-slate-500">
        Every real chat message, most recent first — search to spot-check anything the auto-filter missed.
      </p>

      <div className="relative mt-4 mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search message text..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : messages.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          {search ? "No messages match that search." : "No messages yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-100 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="font-bold text-[#0A1128] text-sm">
                  {m.sender_name} <span className="font-normal text-slate-400 text-xs uppercase">{m.sender_role}</span>
                </p>
                <p className="flex-shrink-0 flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(m.created_at)}
                </p>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                {m.business_name} · {m.worker_name} · {m.project_title}
              </p>
              <p className="text-sm text-slate-800 break-words">{m.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Real Security Monitor — every row is a blocked_message_attempts row (the
// only record of a contact-info send that got hard-blocked; the message
// itself was never stored anywhere). No fake severity ranking here — that
// was decorative in the mock version and there's no real signal to compute
// it from yet, so this is a flat pending queue.
export default function AdminSecurityTab() {
  const [view, setView] = useState("attempts"); // "attempts" | "messages"
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [displayAttempt, setDisplayAttempt] = useState(null);
  const [editedBody, setEditedBody] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  const selected = attempts.find((a) => a.id === selectedId) ?? null;

  // Keeps the last-viewed case's content mounted while the slave panel
  // fades out, so it doesn't blank out mid-transition.
  useEffect(() => {
    if (selected) {
      setDisplayAttempt(selected);
      setEditedBody(selected.attempted_text);
      setResolveError("");
    }
  }, [selected]);

  useEffect(() => {
    listBlockedAttempts()
      .then(setAttempts)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load Security Monitor."))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (action) => {
    if (!displayAttempt || resolving) return;
    setResolving(true);
    setResolveError("");
    try {
      await resolveBlockedAttempt(displayAttempt.id, action, { editedBody });
      setAttempts((prev) => prev.filter((a) => a.id !== displayAttempt.id));
      setSelectedId(null);
    } catch (err) {
      setResolveError(err instanceof ApiError ? err.message : "Could not resolve this case.");
    } finally {
      setResolving(false);
    }
  };

  const toggleBar = (
    <div className="absolute top-4 right-6 z-20 flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 backdrop-blur-xl">
      <button
        onClick={() => setView("attempts")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
          view === "attempts" ? "bg-[#0A1128] text-white" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Blocked Attempts
      </button>
      <button
        onClick={() => setView("messages")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
          view === "messages" ? "bg-[#0A1128] text-white" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Message Monitor
      </button>
    </div>
  );

  if (view === "messages") {
    return (
      <div className="relative overflow-y-auto w-full h-full">
        {toggleBar}
        <MessageMonitor />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative flex h-full items-center justify-center">
        {toggleBar}
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative flex h-full items-center justify-center p-7">
        {toggleBar}
        <div className="flex max-w-md items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full h-full flex">
      {toggleBar}
      {/* ── View 1: Case Queue ───────────────────────────────────────── */}
      <div className="w-full md:w-1/2 lg:w-1/3 h-full absolute left-0 top-0 border-r border-white/60 bg-white/60 backdrop-blur-xl overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trust &amp; Safety</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Security Monitor
          </h1>
          <p className="mt-2.5 text-xs font-semibold text-slate-500">
            {attempts.length} blocked contact-info attempt{attempts.length === 1 ? "" : "s"} pending review
          </p>
        </div>
        {attempts.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            Nothing to review — no blocked attempts right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {attempts.map((attempt) => {
              const isSelected = selectedId === attempt.id;
              return (
                <button
                  key={attempt.id}
                  onClick={() => setSelectedId(attempt.id)}
                  className={`relative w-full text-left pl-5 pr-5 py-4 transition-colors ${
                    isSelected ? "bg-[#F4F6FF]" : "hover:bg-white/40"
                  }`}
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-bold text-[#0A1128] text-sm truncate">{attempt.sender_name}</p>
                    <span className="flex-shrink-0 text-[10px] font-bold uppercase text-slate-400">{attempt.sender_role}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {attempt.business_name} · {attempt.project_title}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(attempt.created_at)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── View 2: Case File ── opacity fade, not a slide, per the earlier
          fix — panel entrance shouldn't feel like a cheap slide-in. ── */}
      <div
        className={`absolute top-0 right-0 z-10 w-full md:w-1/2 lg:w-2/3 h-full bg-white/70 backdrop-blur-xl rounded-l-3xl border-l border-white/70 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] overflow-y-auto transition-opacity duration-200 ease-in-out ${
          selected ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {displayAttempt && (
          <div>
            <div className="h-1.5 bg-red-600" />
            <div className="p-7">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Queue
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Case File</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-200">
                    PENDING REVIEW
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {displayAttempt.project_title}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Worker: <span className="font-semibold text-slate-700">{displayAttempt.worker_name ?? "—"}</span>
                  {" · "}
                  Business: <span className="font-semibold text-slate-700">{displayAttempt.business_name}</span>
                  {" · "}
                  Sent by: <span className="font-semibold text-slate-700">{displayAttempt.sender_name}</span>
                </p>
              </div>

              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Blocked Message</p>
              <div className="rounded-2xl border border-dashed border-red-400 bg-red-50 p-4 mb-6">
                <div className="flex items-center gap-1.5 mb-2 text-red-600 font-bold text-xs">
                  <PhoneOff className="w-3.5 h-3.5" />
                  Contact-info leak detected — never delivered to{" "}
                  {displayAttempt.sender_id === displayAttempt.worker_id
                    ? displayAttempt.business_name
                    : (displayAttempt.worker_name ?? "the other participant")}
                </div>
                <p className="font-mono text-sm text-red-800 break-words">{displayAttempt.attempted_text}</p>
              </div>

              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Redacted version to send instead (optional)
              </p>
              <textarea
                rows={3}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                placeholder="Remove the phone number/email, keep the rest of the message"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100 mb-6"
              />

              {resolveError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{resolveError}</span>
                </div>
              )}

              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Choose a Resolution</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleResolve("redact_and_send")}
                  disabled={resolving}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-[#FF6B35] text-white rounded-2xl text-sm font-black shadow-[0_4px_14px_0_rgba(255,107,53,0.35)] hover:bg-[#e55a2b] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
                >
                  {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Redact &amp; Send
                </button>
                <button
                  onClick={() => handleResolve("ban")}
                  disabled={resolving}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-white/50 border-2 border-red-600 text-red-600 rounded-2xl text-sm font-black hover:bg-red-600 hover:text-white transition-all duration-200 disabled:opacity-60"
                >
                  <Ban className="w-4 h-4" />
                  Ban User
                </button>
                <button
                  onClick={() => handleResolve("warn")}
                  disabled={resolving}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-white/50 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white/70 transition-colors disabled:opacity-60"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Send Formal Warning
                </button>
                <button
                  onClick={() => handleResolve("dismiss")}
                  disabled={resolving}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-white/50 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white/70 transition-colors disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  False Alarm (Dismiss)
                </button>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Send className="w-3 h-3" />
                Ban is real and takes effect immediately. Warning/Dismiss are logged only — there's no delivery mechanism yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
