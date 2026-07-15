import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Download, ArrowUpRight, CheckCircle2, Receipt } from "lucide-react";
import { DISPUTES } from "../../data/mockAdminData";

export default function AdminDisputesTab() {
  const navigate = useNavigate();
  const [dispActions, setDispActions] = useState({});

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dispute Resolution</h1>
          <p className="text-slate-500 text-sm mt-0.5">18 active disputes · Funds frozen until resolved</p>
        </div>
      </div>
      <div className="space-y-4">
        {DISPUTES.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_0_rgba(239,68,68,0.08)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{d.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    d.status === "open" ? "bg-red-50 text-red-700"
                    : d.status === "investigating" ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{d.project}</h3>
                <p className="text-slate-500 text-sm mt-1">{d.reason}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div
                  className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {d.amount}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">In Dispute</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
              <div className="flex items-center gap-1.5"><span className="text-slate-400 text-xs">Freelancer:</span><span className="font-semibold text-slate-700 text-xs">{d.worker}</span></div>
              <span className="text-slate-200">·</span>
              <div className="flex items-center gap-1.5"><span className="text-slate-400 text-xs">Business:</span><span className="font-semibold text-slate-700 text-xs">{d.business}</span></div>
              <span className="text-slate-200">·</span>
              <div className="flex items-center gap-1.5"><span className="text-slate-400 text-xs">Filed:</span><span className="font-semibold text-slate-700 text-xs">{d.filed}</span></div>
            </div>

            {/* Forensic audit trail */}
            <div className="ml-3 mt-4 flex flex-col gap-3 border-l-2 border-slate-200 pl-4">
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                <p className="text-xs font-semibold text-slate-700">Escrow Funded</p>
                <p className="text-[11px] text-slate-400">2 days before filing</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                <p className="text-xs font-semibold text-slate-700">Files Submitted</p>
                <p className="text-[11px] text-slate-400">1 day before filing</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow-sm" />
                <p className="text-xs font-semibold text-slate-700">Dispute Raised ({d.filed})</p>
                <p className="text-[11px] text-slate-400">Reason: {d.reason}</p>
              </div>
            </div>

            {d.status !== "resolved" ? (
              <div className="flex gap-3 flex-wrap mt-4">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />View Chat Logs
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  <Download className="w-3.5 h-3.5" />Download Files
                </button>
                <button
                  onClick={() => navigate("/invoice?role=admin")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />View Invoice
                </button>
                <button
                  onClick={() => setDispActions((p) => ({ ...p, [d.id]: "refunded" }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    dispActions[d.id] === "refunded"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100"
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {dispActions[d.id] === "refunded" ? "✓ Refund Issued" : "Refund Business"}
                </button>
                <button
                  onClick={() => setDispActions((p) => ({ ...p, [d.id]: "released" }))}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 ${
                    dispActions[d.id] === "released"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-gradient-to-r from-orange-500 to-[#FF6B35] hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {dispActions[d.id] === "released" ? "✓ Funds Released" : "Release to Freelancer"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold mt-4">
                <CheckCircle2 className="w-4 h-4" />
                Dispute resolved — Funds released to freelancer on Jun 23, 2026
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
