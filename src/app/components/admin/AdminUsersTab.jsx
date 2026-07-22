import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { listAllUsers } from "../../lib/adminApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";

function RoleBadge({ role }) {
  if (role === "business") {
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Business</span>;
  }
  if (role === "worker") {
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">Freelancer</span>;
  }
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Admin</span>;
}

function StatusPill({ ok, trueLabel, falseLabel }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
    }`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {ok ? trueLabel : falseLabel}
    </span>
  );
}

export default function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    listAllUsers()
      .then(setUsers)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load the user directory."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Freelancers") return item.role === "worker";
    if (filter === "Businesses") return item.role === "business";
    return item.role === "admin";
  });

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} account{users.length === 1 ? "" : "s"} on the platform</p>
        </div>
        <div className="flex gap-2">
          {["All", "Freelancers", "Businesses", "Admins"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-slate-900 text-white" : "bg-white/50 backdrop-blur-sm border border-white/60 text-slate-600 hover:bg-white/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
        </div>
      ) : loadError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 py-16 text-center text-sm text-slate-400">
          No users match this filter.
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/70 overflow-hidden shadow-lg shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/40 border-b border-slate-200">
                  {["Name", "Email", "Phone", "Role", "Email Verified", "ID Verified", "Joined"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {getInitials(item.name)}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{item.email}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{item.phone ? `+91 ${item.phone}` : "—"}</td>
                    <td className="px-5 py-4"><RoleBadge role={item.role} /></td>
                    <td className="px-5 py-4">
                      <StatusPill ok={item.email_verified} trueLabel="Verified" falseLabel="Pending" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill ok={item.verified} trueLabel="Verified" falseLabel="Pending" />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
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
