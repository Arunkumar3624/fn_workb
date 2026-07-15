import { useState } from "react";
import { CheckCircle2, XCircle, Eye, Sparkles } from "lucide-react";
import { VERIFY_QUEUE, AI_CONFIDENCE } from "../../data/mockAdminData";

function confidenceTone(score) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export default function AdminVerificationsTab() {
  const [verActions, setVerActions] = useState({});

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verification Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">247 documents awaiting review</p>
        </div>
        <div className="flex gap-2">
          {["All", "Freelancers", "Businesses"].map((f) => (
            <button key={f} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">{f}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-[#F4F6FF] border-b border-slate-100">
                {["Name", "Type", "Documents", "Face Match", "AI Confidence", "Submitted", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VERIFY_QUEUE.map((item) => (
                <tr key={item.id} className="bg-white shadow-sm border border-slate-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                  <td className="px-5 py-4 font-semibold text-slate-800 text-sm rounded-l-xl">{item.name}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.type === "Freelancer" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.docs.map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      item.face === "Matched" ? "text-emerald-600" : item.face === "Mismatch" ? "text-red-600" : "text-slate-400"
                    }`}>
                      {item.face === "Matched" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.face === "Mismatch" && <XCircle className="w-3.5 h-3.5" />}
                      {item.face}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${confidenceTone(AI_CONFIDENCE[item.id] ?? 0)}`}>
                      <Sparkles className="h-3 w-3" />
                      {AI_CONFIDENCE[item.id] ?? "—"}% Match
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-sm">{item.submitted}</td>
                  <td className="px-5 py-4">
                    {verActions[item.id] ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${verActions[item.id] === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {verActions[item.id] === "approved" ? "✓ Approved" : "✗ Rejected"}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === "pending" ? "bg-amber-50 text-amber-700"
                        : item.status === "flagged" ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700"
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 rounded-r-xl">
                    {!verActions[item.id] && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setVerActions((p) => ({ ...p, [item.id]: "approved" }))}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-transform hover:scale-105 active:scale-95"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setVerActions((p) => ({ ...p, [item.id]: "rejected" }))}
                          className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-transform hover:scale-105 active:scale-95"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-transform hover:scale-105 active:scale-95" title="View Docs">
                          <Eye className="w-4 h-4" />
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
    </div>
  );
}
