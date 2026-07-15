import { useEffect, useState } from "react";
import { CheckCircle2, Flag, PhoneOff, Sparkles, Ban, AlertTriangle, ChevronLeft } from "lucide-react";
import { FLAGGED_THREADS } from "../../data/mockAdminData";

const SEVERITY_STYLE = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AdminSecurityTab() {
  // Starts with nothing selected so the Master→Slave slide is actually
  // visible the first time an admin picks a thread, not already open.
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [threadActions, setThreadActions] = useState({});

  const selectedThread = FLAGGED_THREADS.find((t) => t.id === selectedThreadId) ?? null;

  // Keeps the last-viewed thread's content mounted while the slave panel
  // slides shut, so it doesn't blank out mid-animation.
  const [displayThread, setDisplayThread] = useState(null);
  useEffect(() => {
    if (selectedThread) setDisplayThread(selectedThread);
  }, [selectedThread]);

  return (
    <div className="relative overflow-hidden w-full h-[600px] flex">
      {/* ── View 1: Master Inbox ─────────────────────────────────────── */}
      <div
        className={`w-full md:w-1/2 lg:w-1/3 h-full absolute left-0 top-0 bg-white overflow-y-auto transition-transform duration-500 ease-in-out ${
          selectedThread ? "-translate-x-2 opacity-90" : "translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-lg font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Security Monitor
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{FLAGGED_THREADS.length} threads flagged for review</p>
        </div>
        <div className="divide-y divide-slate-50">
          {FLAGGED_THREADS.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const resolved = threadActions[thread.id];
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`w-full text-left px-5 py-4 transition-colors relative ${
                  isSelected ? "bg-[#F4F6FF]" : "hover:bg-slate-50"
                }`}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#1B3FAB]" />}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-bold text-[#0A1128] text-sm truncate">{thread.worker}</p>
                  {resolved ? (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Resolved
                    </span>
                  ) : (
                    <span className={`flex flex-shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_STYLE[thread.severity]}`}>
                      <Flag className="w-2.5 h-2.5" />
                      {thread.severity.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{thread.business} · {thread.project}</p>
                <p className="text-[11px] text-slate-400 mt-1">Flagged {thread.flaggedAt}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── View 2: Slave Detail Wizard ──────────────────────────────── */}
      <div
        className={`absolute top-0 right-0 z-10 w-full md:w-1/2 lg:w-2/3 h-full bg-white rounded-l-3xl border-l border-slate-200 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] overflow-y-auto transition-transform duration-500 ease-in-out ${
          selectedThread ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {displayThread && (
          <div className="p-7">
            <button
              onClick={() => setSelectedThreadId(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Inbox
            </button>

            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${SEVERITY_STYLE[displayThread.severity]}`}>
                    {displayThread.severity.toUpperCase()} SEVERITY
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">{displayThread.id}</span>
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

            {/* Transcript */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 mb-6">
              {displayThread.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === "business" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    <p className={`text-[11px] font-bold text-slate-400 mb-1 ${msg.from === "business" ? "text-right mr-1" : "ml-1"}`}>
                      {msg.from === "business" ? displayThread.business : displayThread.worker}
                    </p>
                    <div
                      className={
                        msg.flagged
                          ? "relative overflow-hidden rounded-2xl border border-dashed border-red-500/50 bg-red-50 p-4 text-sm leading-relaxed text-red-800"
                          : `px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                              msg.from === "business" ? "bg-[#1B3FAB] text-white" : "bg-white text-slate-700 border border-slate-200"
                            }`
                      }
                    >
                      {msg.flagged && (
                        <div className="flex items-center gap-1.5 mb-2 text-red-600 font-bold text-xs">
                          <PhoneOff className="w-3.5 h-3.5" />
                          Contact-info leak detected
                        </div>
                      )}
                      {msg.flagged ? (
                        <span className="rounded bg-red-100 px-1 font-mono font-bold tracking-tight text-red-700">
                          {msg.text}
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                    <p className={`text-[10px] text-slate-400 mt-1 ${msg.from === "business" ? "text-right mr-1" : "ml-1"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* God-Mode Actions */}
            {threadActions[displayThread.id] ? (
              <div className="flex items-center gap-2 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {threadActions[displayThread.id] === "redacted" && "Message redacted and safely delivered — worker penalized -50 Pts."}
                {threadActions[displayThread.id] === "banned" && "User banned from the platform."}
                {threadActions[displayThread.id] === "warned" && "Formal warning sent to the worker."}
                {threadActions[displayThread.id] === "dismissed" && "Marked as a false alarm — no action taken."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "redacted" }))}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-orange-500 text-white rounded-2xl text-sm font-black ring-4 ring-orange-500/30 shadow-[0_0_15px_rgba(255,107,53,0.4)] hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4" />
                  Redact &amp; Send (-50 Pts)
                </button>
                <button
                  onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "banned" }))}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-red-600 text-white rounded-2xl text-sm font-black hover:bg-red-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-red-200"
                >
                  <Ban className="w-4 h-4" />
                  Ban User
                </button>
                <button
                  onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "warned" }))}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-amber-500 text-white rounded-2xl text-sm font-black hover:bg-amber-600 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-amber-200"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Send Formal Warning
                </button>
                <button
                  onClick={() => setThreadActions((p) => ({ ...p, [displayThread.id]: "dismissed" }))}
                  className="flex items-center justify-center gap-2 px-5 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  False Alarm (Dismiss)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
