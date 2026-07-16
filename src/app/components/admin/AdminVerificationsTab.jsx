import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { listVerifications, reviewVerification } from "../../lib/adminApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";

export default function AdminVerificationsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("All");
  const [decided, setDecided] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    listVerifications()
      .then(setItems)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load the verification queue."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Freelancers") return item.role === "worker";
    return item.role === "business";
  });

  const handleDecision = async (id, approved) => {
    setBusyId(id);
    setActionError("");
    try {
      await reviewVerification(id, approved);
      setDecided((prev) => ({ ...prev, [id]: approved ? "approved" : "rejected" }));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not record this decision.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verification Center</h1>
          <p className="text-slate-400 text-sm mt-0.5">{items.length} account{items.length === 1 ? "" : "s"} awaiting verification</p>
        </div>
        <div className="flex gap-2">
          {["All", "Freelancers", "Businesses"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
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
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 py-16 text-center text-sm text-slate-400">
          Nothing waiting for verification.
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  {["Name", "Role", "Title", "Requested", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-200">
                          {getInitials(item.name)}
                        </div>
                        <span className="font-medium text-slate-100 text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.role === "worker" ? "bg-blue-500/15 text-blue-300" : "bg-purple-500/15 text-purple-300"}`}>
                        {item.role === "worker" ? "Freelancer" : "Business"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{item.title || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      {decided[item.id] ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${decided[item.id] === "approved" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                          {decided[item.id] === "approved" ? "✓ Approved" : "✗ Rejected"}
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(item.id, true)}
                            disabled={busyId === item.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition-colors disabled:opacity-60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(item.id, false)}
                            disabled={busyId === item.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
