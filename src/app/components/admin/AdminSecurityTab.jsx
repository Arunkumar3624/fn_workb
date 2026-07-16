import { useEffect, useState } from "react";
import { CheckCircle2, PhoneOff, Sparkles, Ban, AlertTriangle, ChevronLeft, Eye, Clock, ShieldAlert } from "lucide-react";
import { FLAGGED_THREADS } from "../../data/mockAdminData";

const SEVERITY = {
  high: { label: "High", dot: "bg-red-600", rail: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  medium: { label: "Medium", dot: "bg-amber-500", rail: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  low: { label: "Low", dot: "bg-slate-400", rail: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
};

export default function AdminSecurityTab() {
  // Starts with nothing selected so the Master→Slave slide is actually
  // visible the first time an admin picks a thread, not already open.
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [threadActions, setThreadActions] = useState({});
  // Redacted evidence stays hidden until an admin deliberately reveals it —
  // keyed by "threadId-messageIndex" so revealing one case never leaks into another.
  const [revealed, setRevealed] = useState({});

  const selectedThread = FLAGGED_THREADS.find((t) => t.id === selectedThreadId) ?? null;

  // Keeps the last-viewed thread's content mounted while the slave panel
  // slides shut, so it doesn't blank out mid-animation.
  const [displayThread, setDisplayThread] = useState(null);
  useEffect(() => {
    if (selectedThread) setDisplayThread(selectedThread);
  }, [selectedThread]);

  const counts = FLAGGED_THREADS.reduce(
    (acc, t) => ({ ...acc, [t.severity]: (acc[t.severity] ?? 0) + 1 }),
    {}
  );

  return (
    <div className="relative overflow-hidden w-full h-full flex">
      {/* ── View 1: Case Queue ───────────────────────────────────────── */}
      <div
        className={`w-full md:w-1/2 lg:w-1/3 h-full absolute left-0 top-0 border-r border-white/60 bg-white/60 backdrop-blur-xl overflow-y-auto transition-transform duration-500 ease-in-out ${
          selectedThread ? "-translate-x-2 opacity-90" : "translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trust &amp; Safety</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Security Monitor
          </h1>
          <div className="flex items-center gap-3 mt-2.5">
            {["high", "medium", "low"].map((sev) =>
              counts[sev] ? (
                <div key={sev} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY[sev].dot}`} />
                  <span className="text-xs font-semibold text-slate-500">
                    {counts[sev]} {SEVERITY[sev].label}
                  </span>
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {FLAGGED_THREADS.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const resolved = threadActions[thread.id];
            const sev = SEVERITY[thread.severity];
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`relative w-full text-left pl-5 pr-5 py-4 transition-colors ${
                  isSelected ? "bg-[#F4F6FF]" : "hover:bg-white/40"
                }`}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${resolved ? "bg-emerald-500" : sev.rail}`} />
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-bold text-[#0A1128] text-sm truncate">{thread.worker}</p>
                  <span className="flex-shrink-0 font-mono text-[10px] font-bold text-slate-300">{thread.id}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{thread.business} · {thread.project}</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    {thread.flaggedAt}
                  </p>
                  {resolved ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${sev.text}`}>{sev.label}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── View 2: Case File ────────────────────────────────────────── */}
      <div
        className={`absolute top-0 right-0 z-10 w-full md:w-1/2 lg:w-2/3 h-full bg-white/70 backdrop-blur-xl rounded-l-3xl border-l border-white/70 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] overflow-y-auto transition-transform duration-500 ease-in-out ${
          selectedThread ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {displayThread && (
          <div>
            <div className={`h-1.5 ${SEVERITY[displayThread.severity].rail}`} />
            <div className="p-7">
              <button
                onClick={() => setSelectedThreadId(null)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Queue
              </button>

              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Case File</span>
                    <span className="font-mono text-xs font-bold text-slate-400">{displayThread.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY[displayThread.severity].bg} ${SEVERITY[displayThread.severity].text} ${SEVERITY[displayThread.severity].border}`}>
                      {SEVERITY[displayThread.severity].label.toUpperCase()} SEVERITY
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {displayThread.project}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Worker: <span className="font-semibold text-slate-700">{displayThread.worker}</span>
                    {" · "}
                    Business: <span className="font-semibold text-slate-700">{displayThread.business}</span>
                  </p>
                </div>
              </div>

              {/* Evidence log */}
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Evidence Log</p>
              <div className="bg-white/40 rounded-2xl border border-slate-200 p-6 space-y-4 mb-6">
                {displayThread.messages.map((msg, idx) => {
                  const key = `${displayThread.id}-${idx}`;
                  const isRevealed = revealed[key];
                  return (
                    <div key={idx} className={`flex ${msg.from === "business" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <p className={`text-[11px] font-bold text-slate-400 mb-1 font-mono ${msg.from === "business" ? "text-right mr-1" : "ml-1"}`}>
                          {msg.from === "business" ? displayThread.business : displayThread.worker}
                        </p>
                        {msg.flagged ? (
                          <button
                            onClick={() => setRevealed((p) => ({ ...p, [key]: !p[key] }))}
                            className="w-full text-left rounded-2xl border border-dashed border-red-400 bg-red-50 p-4"
                          >
                            <div className="flex items-center gap-1.5 mb-2 text-red-600 font-bold text-xs">
                              <PhoneOff className="w-3.5 h-3.5" />
                              Contact-info leak detected
                            </div>
                            {isRevealed ? (
                              <span className="rounded bg-red-100 px-1 font-mono text-sm font-bold tracking-tight text-red-700">
                                {msg.text}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <span className="h-4 flex-1 rounded-sm bg-slate-900" />
                                <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-500">
                                  <Eye className="w-3 h-3" />
                                  Reveal
                                </span>
                              </span>
                            )}
                          </button>
                        ) : (
                          <div
                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                              msg.from === "business" ? "bg-[#1B3FAB] text-white" : "bg-white/80 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}
                        <p className={`text-[10px] text-slate-400 mt-1 font-mono ${msg.from === "business" ? "text-right mr-1" : "ml-1"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resolution */}
              {threadActions[displayThread.id] ? (
                <div className="flex items-center gap-2 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {threadActions[displayThread.id] === "redacted" && "Message redacted and safely delivered — worker penalized -50 Pts."}
                  {threadActions[displayThread.id] === "banned" && "User banned from the platform."}
                  {threadActions[displayThread.id] === "warned" && "Formal warning sent to the worker."}
                  {threadActions[displayThread.id] === "dismissed" && "Marked as a false alarm — no action taken."}
                </div>
              ) : (
                <>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Choose a Resolution</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "redacted" }))}
                      className="flex items-center justify-center gap-2 px-5 py-4 bg-[#FF6B35] text-white rounded-2xl text-sm font-black shadow-[0_4px_14px_0_rgba(255,107,53,0.35)] hover:bg-[#e55a2b] hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <Sparkles className="w-4 h-4" />
                      Redact &amp; Send (-50 Pts)
                    </button>
                    <button
                      onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "banned" }))}
                      className="flex items-center justify-center gap-2 px-5 py-4 bg-white/50 border-2 border-red-600 text-red-600 rounded-2xl text-sm font-black hover:bg-red-600 hover:text-white transition-all duration-200"
                    >
                      <Ban className="w-4 h-4" />
                      Ban User
                    </button>
                    <button
                      onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "warned" }))}
                      className="flex items-center justify-center gap-2 px-5 py-4 bg-white/50 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white/70 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Send Formal Warning
                    </button>
                    <button
                      onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "dismissed" }))}
                      className="flex items-center justify-center gap-2 px-5 py-4 bg-white/50 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white/70 transition-colors"
                    >
                      False Alarm (Dismiss)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
