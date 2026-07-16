import { useEffect, useState } from "react";
import { Users, Briefcase, IndianRupee, Lock, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStats } from "../../lib/adminApi";
import { ApiError } from "../../lib/apiClient";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatCompact(amount) {
  const n = Number(amount || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return formatINR(n);
}

function renderRevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 text-white backdrop-blur-md">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-[#FF6B35]">Revenue: ₹{payload[0].value}</p>
    </div>
  );
}

export default function AdminOverviewTab({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load platform stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (loadError || !stats) {
    return (
      <div className="p-7">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError || "No stats available."}</span>
        </div>
      </div>
    );
  }

  const weekly = stats.weeklyRevenue ?? [];
  const revenueTrend = weekly.length >= 2
    ? Math.round(((weekly.at(-1).revenue - weekly.at(-2).revenue) / (weekly.at(-2).revenue || 1)) * 100)
    : null;

  const KPI_CARDS = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString("en-IN"), icon: Users, color: "text-[#1B3FAB]", bg: "bg-[#1B3FAB]/5" },
    { label: "Jobs Posted Today", value: stats.jobsToday.toLocaleString("en-IN"), icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Platform Revenue (all-time)", value: formatCompact(stats.platformRevenue), icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50", trend: revenueTrend, trendLabel: "vs yesterday" },
    { label: "Escrow Pool", value: formatCompact(stats.fundsSecuredPool), icon: Lock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const verificationBacklogPct = stats.totalUsers > 0 ? Math.round((stats.pendingVerifications / stats.totalUsers) * 100) : 0;
  const disputeRatePct = stats.totalProjects > 0 ? Math.round((stats.openDisputes / stats.totalProjects) * 100) : 0;

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Master Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">Live platform metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-6 xl:grid-cols-4">
            {KPI_CARDS.map(({ label, value, icon: Icon, color, bg, trend, trendLabel }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  {trend != null && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(trend)}%
                    </span>
                  )}
                </div>
                <div className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
                <div className="text-slate-500 text-sm mt-1">{label}</div>
                {trendLabel && trend != null && <div className="text-[11px] text-slate-400 mt-0.5">{trendLabel}</div>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Weekly Revenue</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={renderRevenueTooltip} />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} fill="url(#revenueGradient)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-5">Platform KPIs</h3>
              <div className="space-y-4">
                {[
                  { label: "Verification Backlog", value: verificationBacklogPct, color: "bg-amber-500", onClick: () => onNavigate?.("verification"), count: stats.pendingVerifications },
                  { label: "Dispute Rate", value: disputeRatePct, color: "bg-rose-500", onClick: () => onNavigate?.("disputes"), count: stats.openDisputes },
                ].map(({ label, value, color, onClick, count }) => (
                  <button key={label} onClick={onClick} className="block w-full text-left">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-800 font-mono">{count} · {value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, value)}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">At a Glance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Total Projects</span>
                <span className="font-semibold text-slate-900">{stats.totalProjects.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Pending Verifications</span>
                <span className="font-semibold text-slate-900">{stats.pendingVerifications.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Open Disputes</span>
                <span className="font-semibold text-slate-900">{stats.openDisputes.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
