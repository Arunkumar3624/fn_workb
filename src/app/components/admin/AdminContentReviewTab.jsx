import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Image as ImageIcon, Link2, XCircle } from "lucide-react";
import { listPendingSubmissions, reviewSubmission } from "../../lib/submissionsApi";
import { ApiError } from "../../lib/apiClient";

function detectProvider(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("drive.google")) return "Google Drive";
    if (host.includes("dropbox")) return "Dropbox";
    if (host.includes("onedrive") || host.includes("1drv")) return "OneDrive";
    if (host.includes("wetransfer")) return "WeTransfer";
    return host;
  } catch {
    return "Link";
  }
}

// The Trust Checker's moderation queue — every link/image either side of a
// project submits lands here first; nothing reaches the counterparty until
// an admin approves it (or a real reason is recorded for rejecting it).
export default function AdminContentReviewTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [decidedIds, setDecidedIds] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setLoadError("");
    listPendingSubmissions()
      .then(setItems)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load the review queue."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    setBusyId(id);
    setActionError("");
    try {
      await reviewSubmission(id, { approved: true });
      setDecidedIds((prev) => ({ ...prev, [id]: "approved" }));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not approve this submission.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    setActionError("");
    try {
      await reviewSubmission(id, { approved: false, rejectionReason: rejectionReason.trim() || undefined });
      setDecidedIds((prev) => ({ ...prev, [id]: "rejected" }));
      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not reject this submission.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Content Review
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {items.length} submission{items.length === 1 ? "" : "s"} awaiting review — nothing reaches the other side until approved here.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          Refresh
        </button>
      </div>

      {actionError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#1B3FAB]" />
        </div>
      ) : loadError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 py-16 text-center text-sm text-slate-400">
          Nothing waiting for review.
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/10">
          <div className="divide-y divide-white/5">
            {items.map((item) => {
              const decided = decidedIds[item.id];
              return (
                <div key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {item.type === "link" ? (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#7C93F5]">
                          <Link2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <img src={item.image_data} alt={item.caption ?? "Submitted image"} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100 text-sm">{item.project_title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Submitted by {item.submitted_by_name}</p>
                        {item.type === "link" ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#7C93F5] hover:underline"
                          >
                            {detectProvider(item.url)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <ImageIcon className="h-3 w-3" />
                            Image
                          </span>
                        )}
                        {item.caption && <p className="mt-1 text-xs text-slate-400">"{item.caption}"</p>}
                        <p className="mt-1 text-[11px] text-slate-500">
                          {new Date(item.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {decided ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${decided === "approved" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                          {decided === "approved" ? "✓ Approved" : "✗ Rejected"}
                        </span>
                      ) : rejectingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="w-40 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-red-400/40"
                          />
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={busyId === item.id}
                            className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-60"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={busyId === item.id}
                            className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectingId(item.id)}
                            disabled={busyId === item.id}
                            className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-300 hover:bg-red-500/20 rounded-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
