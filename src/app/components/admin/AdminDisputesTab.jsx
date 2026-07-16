import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowUpRight, CheckCircle2, Receipt } from "lucide-react";
import { listDisputes, resolveDispute } from "../../lib/adminApi";
import { PROJECT_STATUS_META } from "../../utils/projectStatus";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function AdminDisputesTab() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [resolved, setResolved] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    listDisputes()
      .then(setItems)
      .catch((err) => setLoadError(err.message || "Could not load disputes."))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id, resolution) => {
    setBusyId(id);
    setActionError("");
    try {
      await resolveDispute(id, resolution);
      setResolved((prev) => ({ ...prev, [id]: resolution }));
    } catch (err) {
      setActionError(err.message || "Could not resolve this dispute.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dispute Resolution</h1>
        <p className="text-slate-400 text-sm mt-0.5">{items.length} active dispute{items.length === 1 ? "" : "s"} — funds frozen until resolved</p>
      </div>

      {actionError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#FF6B35]" />
        </div>
      ) : loadError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 py-16 text-center text-sm text-slate-400">
          No active disputes.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((d) => {
            const decision = resolved[d.id];
            return (
              <div key={d.id} className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-xl shadow-black/10">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      {d.id.slice(0, 8).toUpperCase()}
                    </span>
                    <h3 className="mt-1.5 font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{d.title}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">No reason recorded — review the activity timeline below.</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-semibold text-rose-300" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {formatINR(d.budget)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">In Dispute</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5"><span className="text-slate-500 text-xs">Freelancer:</span><span className="font-medium text-slate-200 text-xs">{d.worker_name}</span></div>
                  <span className="text-white/10">·</span>
                  <div className="flex items-center gap-1.5"><span className="text-slate-500 text-xs">Business:</span><span className="font-medium text-slate-200 text-xs">{d.business_name}</span></div>
                </div>

                {/* Real activity timeline (project.timeline), not fabricated events */}
                {d.timeline?.length > 0 && (
                  <div className="ml-3 mt-4 flex flex-col gap-3 border-l-2 border-white/10 pl-4">
                    {d.timeline.map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-[#12183a] bg-slate-400 shadow-sm" />
                        <p className="text-xs font-semibold text-slate-200">{PROJECT_STATUS_META[event.status]?.label ?? event.status}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(event.at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {decision ? (
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mt-4">
                    <CheckCircle2 className="w-4 h-4" />
                    {decision === "refund" ? "Refunded to business" : "Released to freelancer"}
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap mt-4">
                    <button
                      onClick={() => navigate(`/invoice?id=${d.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />View Invoice
                    </button>
                    <button
                      onClick={() => handleResolve(d.id, "refund")}
                      disabled={busyId === d.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors disabled:opacity-60"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Refund Business
                    </button>
                    <button
                      onClick={() => handleResolve(d.id, "release")}
                      disabled={busyId === d.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Release to Freelancer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
