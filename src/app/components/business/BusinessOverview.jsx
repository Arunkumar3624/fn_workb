import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, Briefcase, Calendar, CheckCircle2, Lock,
  Plus, Receipt, Shield, TrendingUp, UserCheck,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { listProjects } from "../../lib/projectsApi";
import { getInitials } from "../../utils/formValidation";
import { PROJECT_STATUS_FLOW } from "../../utils/projectStatus";
import { ApiError } from "../../lib/apiClient";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

const ACTIVE_STATUSES = new Set(["ACCEPTED", "FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);
const FUNDS_HELD_STATUSES = new Set(["FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);
const CHART_MAX_FLOOR = 1000; // avoid a div-by-zero-flavored 0-height chart on a brand-new account

// ── Micro sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const r = max - min || 1;
  const W = 64, H = 26;
  const pts = data
    .map((v, i) => `${(i / Math.max(1, data.length - 1)) * W},${H - ((v - min) / r) * (H - 2) - 1}`)
    .join(" ");
  return (
    <svg width={W} height={H} className="overflow-visible flex-shrink-0">
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={color + "18"} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Filter chip bar ───────────────────────────────────────────────────────────
function Chips({ options, active, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            active === key
              ? "bg-[#1B3FAB] text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {label}
          {count !== undefined && (
            <span className={`text-[10px] px-1.5 rounded-full font-bold ${
              active === key ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
            }`}>{count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BusinessOverview({ onPostJob, onViewProjects, isVerified }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [txFilter, setTxFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "business" })
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your projects.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // "Active Projects" here means live, non-terminal work — completed ones
  // have their own History section on the Projects page, not this widget.
  const activeProjects = useMemo(() => projects.filter((p) => ACTIVE_STATUSES.has(p.status)), [projects]);
  const heldProjects = useMemo(() => activeProjects.filter((p) => FUNDS_HELD_STATUSES.has(p.status)), [activeProjects]);
  const completedProjects = useMemo(() => projects.filter((p) => p.status === "COMPLETED"), [projects]);

  const statusGroup = (p) => (p.status === "FILES_SUBMITTED" ? "review" : "active");

  const filteredProjects = projectFilter === "all"
    ? activeProjects
    : activeProjects.filter((p) => statusGroup(p) === projectFilter);

  const securedTotal = heldProjects.reduce((s, p) => s + Number(p.budget), 0);

  // Every completed project's ledger split, computed the same way
  // completeProject does server-side (budget - platform fee).
  const completedSplits = useMemo(
    () =>
      completedProjects.map((p) => {
        const budget = Number(p.budget);
        const feePct = Number(p.platform_fee_pct ?? 8);
        const fee = round2(budget * (feePct / 100));
        return { project: p, budget, fee, delivered: round2(budget - fee) };
      }),
    [completedProjects]
  );
  const deliveredTotal = completedSplits.reduce((s, c) => s + c.delivered, 0);
  const feesTotal = completedSplits.reduce((s, c) => s + c.fee, 0);
  const workersHired = new Set(projects.filter((p) => p.status !== "INVITED").map((p) => p.worker_id)).size;
  const avgBudget = projects.length ? projects.reduce((s, p) => s + Number(p.budget), 0) / projects.length : 0;

  // Payment history feed — flattened from each project's own real `timeline`
  // (recorded server-side on every status change), not a separate ledger
  // endpoint (a business has no wallet_balance in this schema — only
  // workers do — so there's nothing else to read this from).
  const paymentFeed = useMemo(() => {
    const rows = [];
    for (const p of projects) {
      const budget = Number(p.budget);
      const feePct = Number(p.platform_fee_pct ?? 8);
      for (const event of p.timeline ?? []) {
        if (event.status === "FUNDS_SECURED") {
          rows.push({
            id: `${p.id}-secured`,
            type: "secured",
            desc: `Funds Secured – ${p.title}`,
            worker: p.worker_name,
            amount: budget,
            at: event.at,
          });
        }
        if (event.status === "COMPLETED") {
          const fee = round2(budget * (feePct / 100));
          rows.push({
            id: `${p.id}-delivered`,
            type: "delivered",
            desc: `Payment Released – ${p.title}`,
            worker: p.worker_name,
            amount: round2(budget - fee),
            at: event.at,
          });
          rows.push({
            id: `${p.id}-fee`,
            type: "fee",
            desc: `Platform Fee (${feePct}%) – ${p.title}`,
            worker: null,
            amount: fee,
            at: event.at,
          });
        }
      }
    }
    return rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [projects]);

  const filteredTxn = txFilter === "all" ? paymentFeed : paymentFeed.filter((t) => t.type === txFilter);

  const PROJECT_FILTERS = [
    { key: "all", label: "All", count: activeProjects.length },
    { key: "active", label: "In Progress", count: activeProjects.filter((p) => statusGroup(p) === "active").length },
    { key: "review", label: "In Review", count: activeProjects.filter((p) => statusGroup(p) === "review").length },
  ];
  const TX_FILTERS = [
    { key: "all", label: "All", count: paymentFeed.length },
    { key: "secured", label: "Secured", count: paymentFeed.filter((t) => t.type === "secured").length },
    { key: "delivered", label: "Delivered", count: paymentFeed.filter((t) => t.type === "delivered").length },
    { key: "fee", label: "Fees", count: paymentFeed.filter((t) => t.type === "fee").length },
  ];

  const TX_META = {
    secured: { icon: Shield, bg: "bg-emerald-50", color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-600", sign: "–" },
    delivered: { icon: CheckCircle2, bg: "bg-purple-50", color: "text-purple-600", badge: "bg-purple-50 text-purple-600", sign: "+" },
    fee: { icon: Receipt, bg: "bg-amber-50", color: "text-amber-600", badge: "bg-amber-50 text-amber-600", sign: "–" },
  };

  // Monthly activity, grouped from the same real feed — sparse/mostly-empty
  // on a new account is expected, not a bug (no fabricated history).
  const monthly = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, m: d.toLocaleDateString("en-IN", { month: "short" }), secured: 0, delivered: 0 });
    }
    for (const row of paymentFeed) {
      const d = new Date(row.at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((mo) => mo.key === key);
      if (!bucket) continue;
      if (row.type === "secured") bucket.secured += row.amount;
      if (row.type === "delivered") bucket.delivered += row.amount;
    }
    return months;
  }, [paymentFeed]);
  const chartMax = Math.max(CHART_MAX_FLOOR, ...monthly.map((m) => Math.max(m.secured, m.delivered)));

  const deliveredThisMonth = useMemo(() => {
    const now = new Date();
    return completedSplits
      .filter((c) => {
        const at = c.project.timeline?.find((e) => e.status === "COMPLETED")?.at;
        if (!at) return false;
        const d = new Date(at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, c) => s + c.delivered, 0);
  }, [completedSplits]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-7">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-7">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-[#e0e9ff] via-[#eef5ff] to-[#e9fff5] p-7 wb-tab-enter">
      <div className="pointer-events-none fixed -top-24 -left-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#1B3FAB]/25 blur-[110px]" />
      <div className="pointer-events-none fixed top-56 -right-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-emerald-400/20 blur-[110px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-96 w-96 rounded-full bg-purple-400/20 blur-[110px]" />
      <div className="relative max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1
                className="text-2xl font-extrabold text-[#0F172A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Command Center
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>
          <button
            onClick={onPostJob}
            className="flex items-center gap-2 px-5 py-3 bg-[#FF6B35] text-white rounded-xl text-sm font-bold hover:bg-[#E55E1F] hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#FF6B35]/30"
          >
            {isVerified ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            Post a Job
          </button>
        </div>

        {/* ── KPI Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Active Projects", value: String(activeProjects.length),
              icon: Briefcase, iconBg: "bg-blue-50", iconColor: "text-[#1B3FAB]", valueColor: "text-[#1B3FAB]",
              spark: monthly.map((m) => m.secured), sparkColor: "#1B3FAB",
            },
            {
              label: "Funds in Process", value: formatINR(securedTotal), sub: "Secured for active projects",
              subColor: "text-slate-600", icon: Shield,
              iconBg: "bg-emerald-50", iconColor: "text-emerald-600", valueColor: "text-emerald-600",
              spark: monthly.map((m) => m.secured), sparkColor: "#10b981",
            },
            {
              label: "Funds Delivered", value: formatINR(deliveredTotal), sub: "Paid to workers all-time",
              subColor: "text-slate-600", icon: CheckCircle2,
              iconBg: "bg-purple-50", iconColor: "text-purple-600", valueColor: "text-purple-600",
              spark: monthly.map((m) => m.delivered), sparkColor: "#9333ea",
            },
            {
              label: "Workers Hired", value: String(workersHired), sub: "All-time placements",
              subColor: "text-slate-600", icon: UserCheck,
              iconBg: "bg-orange-50", iconColor: "text-[#FF6B35]", valueColor: "text-[#FF6B35]",
              spark: monthly.map((m) => m.secured + m.delivered), sparkColor: "#FF6B35",
            },
          ].map(({ label, value, sub, subColor, icon: Icon, iconBg, iconColor, valueColor, spark, sparkColor }, i) => (
            <div
              key={label}
              className="border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-5 wb-card-enter"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <Sparkline data={spark} color={sparkColor} />
              </div>
              <div
                className={`text-2xl font-extrabold ${valueColor} leading-none mb-1`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {value}
              </div>
              <div className="text-sm font-semibold text-[#0F172A]">{label}</div>
              {sub && (
                <div className={`text-xs mt-0.5 flex items-center gap-1 ${subColor}`}>
                  {i === 0 && <TrendingUp className="w-3 h-3" />}
                  {sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Middle: Projects + Fund Flow ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Active Projects table */}
          <div
            className="lg:col-span-2 border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] overflow-hidden wb-card-enter"
            style={{ animationDelay: "240ms" }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3
                  className="font-bold text-[#0F172A] text-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Active Projects
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">{filteredProjects.length} matching</p>
              </div>
              <button
                onClick={onViewProjects}
                className="flex items-center gap-1 text-[#1B3FAB] text-xs font-semibold hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="px-5 py-3 bg-white/30 border-b border-white/50">
              <Chips options={PROJECT_FILTERS} active={projectFilter} onChange={setProjectFilter} />
            </div>

            <div className="px-5 py-2.5 grid grid-cols-12 gap-3 border-b border-slate-50">
              {[
                { label: "PROJECT", cls: "col-span-5" },
                { label: "STATUS", cls: "col-span-3 text-center" },
                { label: "PROGRESS", cls: "col-span-2 text-center" },
                { label: "BUDGET", cls: "col-span-2 text-right" },
              ].map(({ label, cls }) => (
                <span key={label} className={`${cls} text-[10px] font-black uppercase tracking-widest text-slate-600`}>
                  {label}
                </span>
              ))}
            </div>

            <div className="divide-y divide-slate-50">
              {filteredProjects.length > 0 ? filteredProjects.map((p, i) => (
                <div
                  key={p.id}
                  className="px-5 py-4 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/70 transition-colors wb-card-enter"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <Avatar initials={getInitials(p.worker_name)} size="w-8 h-8" text="text-xs" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0F172A] text-sm truncate">{p.title}</div>
                      <div className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{p.worker_name} · {p.deadline ? new Date(p.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      statusGroup(p) === "active"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {statusGroup(p) === "active" ? "In Progress" : "In Review"}
                    </span>
                  </div>

                  <div className="col-span-2 flex flex-col items-center gap-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF6B35] rounded-full wb-milestone-fill"
                        style={{ width: `${((PROJECT_STATUS_FLOW.indexOf(p.status) + 1) / PROJECT_STATUS_FLOW.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {PROJECT_STATUS_FLOW.indexOf(p.status) + 1}/{PROJECT_STATUS_FLOW.length}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold text-[#0F172A]">{formatINR(p.budget)}</span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-10 text-center text-slate-600 text-sm">
                  No projects match this filter
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Fund Flow */}
          <div className="space-y-4">

            <div
              className="border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-5 wb-card-enter"
              style={{ animationDelay: "300ms" }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Funds in Process
              </h3>
              {heldProjects.length === 0 ? (
                <p className="text-xs text-slate-600">No funds currently held in escrow.</p>
              ) : (
                <div className="space-y-4">
                  {heldProjects.map((p) => {
                    const amt = Number(p.budget);
                    const pct = securedTotal ? Math.round((amt / securedTotal) * 100) : 0;
                    return (
                      <div key={p.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar initials={getInitials(p.worker_name)} size="w-6 h-6" text="text-[9px]" />
                            <span className="text-xs font-semibold text-[#0F172A] truncate">{p.title}</span>
                          </div>
                          <span className="text-xs font-bold text-[#1B3FAB] flex-shrink-0 ml-2">{formatINR(p.budget)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1B3FAB] rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-600">{pct}% of total</span>
                          <span className={`text-[10px] font-bold ${
                            statusGroup(p) === "active" ? "text-blue-600" : "text-amber-600"
                          }`}>
                            {statusGroup(p) === "active" ? "In Progress" : "In Review"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Total Secured</span>
                <span className="text-sm font-extrabold text-emerald-600">{formatINR(securedTotal)}</span>
              </div>
            </div>

            <div
              className="border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-5 wb-card-enter"
              style={{ animationDelay: "360ms" }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Financial Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Delivered this month", value: formatINR(deliveredThisMonth), color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Total delivered", value: formatINR(deliveredTotal), color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Platform fees paid", value: formatINR(feesTotal), color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Avg. project budget", value: formatINR(avgBudget), color: "text-[#1B3FAB]", bg: "bg-[#F4F6FF]" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 truncate">{label}</span>
                    <span className={`text-xs font-bold flex-shrink-0 ${color} ${bg} px-2 py-0.5 rounded-lg`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: Transaction History + Spend Chart ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <div
            className="border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] overflow-hidden wb-card-enter"
            style={{ animationDelay: "420ms" }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3
                className="font-bold text-[#0F172A] text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Payment History
              </h3>
            </div>

            <div className="px-5 py-3 bg-white/30 border-b border-white/50">
              <Chips options={TX_FILTERS} active={txFilter} onChange={setTxFilter} />
            </div>

            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
              {filteredTxn.length > 0 ? filteredTxn.map((tx) => {
                const meta = TX_META[tx.type];
                const TxIcon = meta.icon;
                return (
                  <div
                    key={tx.id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-9 h-9 ${meta.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <TxIcon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0F172A] truncate">{tx.desc}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(tx.at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        {tx.worker && <span className="ml-1.5 text-slate-300">·</span>}
                        {tx.worker && <span className="ml-1.5 font-semibold text-slate-500">{tx.worker}</span>}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-sm font-bold ${meta.color}`}>
                        {meta.sign}{formatINR(tx.amount)}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.badge}`}>
                        {tx.type === "delivered" ? "Delivered" : tx.type === "secured" ? "Secured" : "Fee"}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="px-5 py-10 text-center text-slate-600 text-sm">
                  No transactions match this filter
                </div>
              )}
            </div>
          </div>

          {/* Monthly Spending Chart */}
          <div
            className="border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-5 wb-card-enter"
            style={{ animationDelay: "480ms" }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3
                  className="font-bold text-[#0F172A] text-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Spending Overview
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">Monthly fund activity</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="w-3 h-3 rounded-sm bg-[#1B3FAB] flex-shrink-0" /> Secured
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="w-3 h-3 rounded-sm bg-purple-400 flex-shrink-0" /> Delivered
                </span>
              </div>
            </div>

            <div className="flex items-end gap-2 mt-5 mb-3">
              {monthly.map(({ m, secured, delivered }) => {
                const sH = secured > 0 ? Math.max(4, Math.round((secured / chartMax) * 100)) : 0;
                const dH = delivered > 0 ? Math.max(4, Math.round((delivered / chartMax) * 100)) : 0;
                return (
                  <div key={m} className="flex-1">
                    <div className="flex items-end gap-px" style={{ height: "100px" }}>
                      <div
                        title={`Secured ${formatINR(secured)}`}
                        className="flex-1 bg-[#1B3FAB] hover:bg-[#1635A0] rounded-t-sm transition-colors cursor-default"
                        style={{ height: `${sH}px` }}
                      />
                      <div
                        title={`Delivered ${formatINR(delivered)}`}
                        className="flex-1 bg-purple-400 hover:bg-purple-500 rounded-t-sm transition-colors cursor-default"
                        style={{ height: `${dH}px` }}
                      />
                    </div>
                    <p className="text-[10px] text-center text-slate-600 mt-2">{m}</p>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-slate-100 my-4" />

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Total Secured", value: formatINR(monthly.reduce((s, m) => s + m.secured, 0)), color: "text-[#1B3FAB]" },
                { label: "Total Delivered", value: formatINR(monthly.reduce((s, m) => s + m.delivered, 0)), color: "text-purple-600" },
                { label: "Still Held", value: formatINR(securedTotal), color: "text-emerald-600" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-xs text-slate-600">{label}</p>
                  <p
                    className={`text-sm font-extrabold mt-0.5 ${color}`}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
