import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, CheckCircle2, Receipt } from "lucide-react";
import { ADMIN_TRANSACTIONS } from "../../data/mockAdminData";

const STATUS_STYLE = {
  secured: { label: "Secured", icon: ShieldCheck, className: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  disputed: { label: "Disputed", icon: AlertTriangle, className: "bg-red-500/10 text-red-300 border-red-500/20" },
  released: { label: "Released", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
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
          <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Transaction History
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Every invoice on the platform — the legal trail for dispute resolution and audits.
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3 px-3">
            <thead>
              <tr className="bg-white/5">
                {["Invoice", "Business", "Worker", "Project", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                  <tr key={txn.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10">
                    <td className="px-5 py-4 rounded-l-xl">
                      <span className="font-mono text-xs font-bold text-slate-400">{txn.id}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{txn.date}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-200">{txn.business}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-200">{txn.worker}</td>
                    <td className="px-5 py-4 text-sm text-slate-400 max-w-[220px] truncate">{txn.project}</td>
                    <td className="px-5 py-4 font-mono text-sm font-bold text-white">{formatINR(txn.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 rounded-r-xl">
                      <button
                        onClick={() => navigate("/invoice?role=admin")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors w-fit"
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
