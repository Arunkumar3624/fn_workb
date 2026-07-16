import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, CheckCircle2, Receipt } from "lucide-react";
import { ADMIN_TRANSACTIONS } from "../../data/mockAdminData";

const STATUS_STYLE = {
  secured: { label: "Secured", icon: ShieldCheck, className: "bg-blue-50 text-blue-700 border-blue-200" },
  disputed: { label: "Disputed", icon: AlertTriangle, className: "bg-red-50 text-red-700 border-red-200" },
  released: { label: "Released", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function AdminTransactionsTab() {
  const navigate = useNavigate();
  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Transaction History
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Every invoice on the platform — the legal trail for dispute resolution and audits.
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 overflow-hidden shadow-lg shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3 px-3">
            <thead>
              <tr className="bg-[#F4F6FF]">
                {["Invoice", "Business", "Worker", "Project", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMIN_TRANSACTIONS.map((txn) => {
                const status = STATUS_STYLE[txn.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={txn.id} className="bg-white/50 shadow-sm border border-white/60 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/70 hover:shadow-md">
                    <td className="px-5 py-4 rounded-l-xl">
                      <span className="font-mono text-xs font-bold text-slate-500">{txn.id}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{txn.date}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{txn.business}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{txn.worker}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[220px] truncate">{txn.project}</td>
                    <td className="px-5 py-4 font-mono text-sm font-bold text-slate-900">{formatINR(txn.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 rounded-r-xl">
                      <button
                        onClick={() => navigate("/invoice?role=admin")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white/70 transition-colors w-fit"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        View Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
