import { useState } from "react";
import {
  ArrowRight, Briefcase, Calendar, CheckCircle2, Lock,
  Plus, Receipt, Shield, TrendingUp, UserCheck,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { usePlatformData } from "../../context/PlatformContext";
import { PROJECT_STATUS_FLOW } from "../../utils/projectStatus";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

// ── Local business transaction log ───────────────────────────────────────────
const BUSI_TXN = [
  { id: "TXN-9015", desc: "Payment Released – Brand Identity Design",      amount: 5500,  date: "Jul 2, 2026",  type: "delivered", worker: "Arjun Mehta"  },
  { id: "TXN-9008", desc: "Funds Secured – SEO Content – 20 Articles",      amount: 11000, date: "Jun 25, 2026", type: "secured",   worker: "Rohit Verma"  },
  { id: "TXN-8982", desc: "Payment Released – React Dashboard",              amount: 15300, date: "Jun 22, 2026", type: "delivered", worker: "Priya Sharma" },
  { id: "TXN-8965", desc: "Funds Secured – E-Commerce Platform Dev",         amount: 22000, date: "Jun 20, 2026", type: "secured",   worker: "Priya Sharma" },
  { id: "TXN-8948", desc: "Payment Released – SEO Articles Batch 1",         amount: 11200, date: "Jun 18, 2026", type: "delivered", worker: "Rohit Verma"  },
  { id: "TXN-8930", desc: "Platform Fee – E-Commerce Project (8%)",          amount: 1760,  date: "Jun 20, 2026", type: "fee",       worker: null           },
  { id: "TXN-8921", desc: "Boost Pack – Premium Listing (30 days)",          amount: 2499,  date: "Jun 15, 2026", type: "fee",       worker: null           },
  { id: "TXN-8910", desc: "Payment Released – Logo Design Project",          amount: 4200,  date: "Jun 10, 2026", type: "delivered", worker: "Sneha Patil"  },
];

// Monthly fund activity for the bar chart
const MONTHLY = [
  { m: "Feb", secured: 5000,  delivered: 0     },
  { m: "Mar", secured: 8500,  delivered: 5000  },
  { m: "Apr", secured: 12000, delivered: 8500  },
  { m: "May", secured: 9500,  delivered: 12000 },
  { m: "Jun", secured: 33000, delivered: 26700 },
  { m: "Jul", secured: 5500,  delivered: 5500  },
];
const CHART_MAX = 35000;

// ── Micro sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const r = max - min || 1;
  const W = 64, H = 26;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / r) * (H - 2) - 1}`)
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
              active === key ? "bg-white/25 text-white" : "bg-slate-200 text-slate-400"
            }`}>{count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BusinessOverview({ onPostJob, onViewProjects, isVerified }) {
  const { businessThreadsDb } = usePlatformData();
  const [projectFilter, setProjectFilter] = useState("all");
  const [txFilter, setTxFilter]           = useState("all");

  // "Active Projects" here means live, funded work — completed ones have
  // their own History section on the Projects page, not this widget.
  const PROJECTS = businessThreadsDb.filter((t) => t.type === "active" && t.projectStatus !== "COMPLETED");
  const statusGroup = (p) => (p.projectStatus === "FILES_SUBMITTED" ? "review" : "active");

  const filteredProjects = projectFilter === "all"
    ? PROJECTS
    : PROJECTS.filter((p) => statusGroup(p) === projectFilter);

  const filteredTxn = txFilter === "all"
    ? BUSI_TXN
    : BUSI_TXN.filter((t) => t.type === txFilter);

  const deliveredTotal = BUSI_TXN.filter((t) => t.type === "delivered").reduce((s, t) => s + t.amount, 0);
  const feesTotal      = BUSI_TXN.filter((t) => t.type === "fee").reduce((s, t) => s + t.amount, 0);
  const securedTotal   = PROJECTS.reduce((s, p) => s + Number(p.budget || 0), 0);

  const PROJECT_FILTERS = [
    { key: "all",    label: "All",         count: PROJECTS.length },
    { key: "active", label: "In Progress", count: PROJECTS.filter((p) => statusGroup(p) === "active").length },
    { key: "review", label: "In Review",   count: PROJECTS.filter((p) => statusGroup(p) === "review").length },
  ];
  const TX_FILTERS = [
    { key: "all",       label: "All",       count: BUSI_TXN.length },
    { key: "secured",   label: "Secured",   count: BUSI_TXN.filter((t) => t.type === "secured").length },
    { key: "delivered", label: "Delivered", count: BUSI_TXN.filter((t) => t.type === "delivered").length },
    { key: "fee",       label: "Fees",      count: BUSI_TXN.filter((t) => t.type === "fee").length },
  ];

  const TX_META = {
    secured:   { icon: Shield,       bg: "bg-emerald-50", color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-600", sign: "–" },
    delivered: { icon: CheckCircle2, bg: "bg-purple-50",  color: "text-purple-600",  badge: "bg-purple-50 text-purple-600",  sign: "+" },
    fee:       { icon: Receipt,      bg: "bg-amber-50",   color: "text-amber-600",   badge: "bg-amber-50 text-amber-600",    sign: "–" },
  };

  return (
    <div className="bg-slate-50 p-7 wb-tab-enter">
      <div className="max-w-6xl mx-auto">

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
            <p className="text-slate-500 text-sm">Good morning, RetailX team · Jul 2, 2026</p>
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
              label: "Active Projects", value: "3", sub: "+1 this week",
              subColor: "text-emerald-600", icon: Briefcase,
              iconBg: "bg-blue-50", iconColor: "text-[#1B3FAB]", valueColor: "text-[#1B3FAB]",
              spark: [1, 2, 1, 2, 3, 3], sparkColor: "#1B3FAB",
            },
            {
              label: "Funds in Process", value: `₹${securedTotal.toLocaleString("en-IN")}`, sub: "Secured for active projects",
              subColor: "text-slate-400", icon: Shield,
              iconBg: "bg-emerald-50", iconColor: "text-emerald-600", valueColor: "text-emerald-600",
              spark: [5200, 8400, 12000, 9800, 22000, securedTotal], sparkColor: "#10b981",
            },
            {
              label: "Funds Delivered", value: `₹${deliveredTotal.toLocaleString("en-IN")}`, sub: "Paid to workers all-time",
              subColor: "text-slate-400", icon: CheckCircle2,
              iconBg: "bg-purple-50", iconColor: "text-purple-600", valueColor: "text-purple-600",
              spark: [4200, 5000, 12000, 8000, 26700, deliveredTotal], sparkColor: "#9333ea",
            },
            {
              label: "Workers Hired", value: "28", sub: "All-time placements",
              subColor: "text-slate-400", icon: UserCheck,
              iconBg: "bg-orange-50", iconColor: "text-[#FF6B35]", valueColor: "text-[#FF6B35]",
              spark: [8, 12, 17, 20, 25, 28], sparkColor: "#FF6B35",
            },
          ].map(({ label, value, sub, subColor, icon: Icon, iconBg, iconColor, valueColor, spark, sparkColor }, i) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200 p-5 wb-card-enter"
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
              <div className={`text-xs mt-0.5 flex items-center gap-1 ${subColor}`}>
                {i === 0 && <TrendingUp className="w-3 h-3" />}
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Middle: Projects + Fund Flow ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Active Projects table */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden wb-card-enter"
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
                <p className="text-xs text-slate-400 mt-0.5">{filteredProjects.length} matching</p>
              </div>
              <button
                onClick={onViewProjects}
                className="flex items-center gap-1 text-[#1B3FAB] text-xs font-semibold hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Filter chips */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <Chips options={PROJECT_FILTERS} active={projectFilter} onChange={setProjectFilter} />
            </div>

            {/* Column headers */}
            <div className="px-5 py-2.5 grid grid-cols-12 gap-3 border-b border-slate-50">
              {[
                { label: "PROJECT",  cls: "col-span-5" },
                { label: "STATUS",   cls: "col-span-3 text-center" },
                { label: "PROGRESS", cls: "col-span-2 text-center" },
                { label: "BUDGET",   cls: "col-span-2 text-right" },
              ].map(({ label, cls }) => (
                <span key={label} className={`${cls} text-[10px] font-black uppercase tracking-widest text-slate-400`}>
                  {label}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {filteredProjects.length > 0 ? filteredProjects.map((p, i) => (
                <div
                  key={p.id}
                  className="px-5 py-4 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/70 transition-colors wb-card-enter"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <Avatar initials={p.workerInitials} size="w-8 h-8" text="text-xs" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0F172A] text-sm truncate">{p.projectName}</div>
                      <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{p.workerName} · {p.deadline ?? "—"}</span>
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
                        style={{ width: `${((PROJECT_STATUS_FLOW.indexOf(p.projectStatus) + 1) / PROJECT_STATUS_FLOW.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {PROJECT_STATUS_FLOW.indexOf(p.projectStatus) + 1}/{PROJECT_STATUS_FLOW.length}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold text-[#0F172A]">{formatINR(p.budget)}</span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">
                  No projects match this filter
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Fund Flow */}
          <div className="space-y-4">

            {/* Breakdown by project */}
            <div
              className="bg-white rounded-2xl border border-slate-200 p-5 wb-card-enter"
              style={{ animationDelay: "300ms" }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Funds in Process
              </h3>
              <div className="space-y-4">
                {PROJECTS.map((p) => {
                  const amt = Number(p.budget || 0);
                  const pct = Math.round((amt / securedTotal) * 100);
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar initials={p.workerInitials} size="w-6 h-6" text="text-[9px]" />
                          <span className="text-xs font-semibold text-[#0F172A] truncate">{p.projectName}</span>
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
                        <span className="text-[10px] text-slate-400">{pct}% of total</span>
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
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Total Secured</span>
                <span className="text-sm font-extrabold text-emerald-600">
                  ₹{securedTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Financial summary */}
            <div
              className="bg-white rounded-2xl border border-slate-200 p-5 wb-card-enter"
              style={{ animationDelay: "360ms" }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Financial Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Delivered this month",   value: "₹5,500",   color: "text-purple-600",  bg: "bg-purple-50"   },
                  { label: "Total delivered",         value: `₹${deliveredTotal.toLocaleString("en-IN")}`, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Platform fees paid",      value: `₹${feesTotal.toLocaleString("en-IN")}`,      color: "text-amber-600",   bg: "bg-amber-50"   },
                  { label: "Avg. project budget",     value: "₹23,400",  color: "text-[#1B3FAB]",   bg: "bg-[#F4F6FF]"  },
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

          {/* Transaction History */}
          <div
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden wb-card-enter"
            style={{ animationDelay: "420ms" }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3
                className="font-bold text-[#0F172A] text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Payment History
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Last 30 days
              </span>
            </div>

            {/* Filter chips */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
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
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tx.date}
                        {tx.worker && (
                          <span className="ml-1.5 text-slate-300">·</span>
                        )}
                        {tx.worker && (
                          <span className="ml-1.5 font-semibold text-slate-500">{tx.worker}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-sm font-bold ${meta.color}`}>
                        {meta.sign}₹{tx.amount.toLocaleString("en-IN")}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.badge}`}>
                        {tx.type === "delivered" ? "Delivered" : tx.type === "secured" ? "Secured" : "Fee"}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">
                  No transactions match this filter
                </div>
              )}
            </div>
          </div>

          {/* Monthly Spending Chart */}
          <div
            className="bg-white rounded-2xl border border-slate-200 p-5 wb-card-enter"
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
                <p className="text-xs text-slate-400 mt-0.5">Monthly fund activity · Feb–Jul 2026</p>
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

            {/* Bar chart */}
            <div className="flex items-end gap-2 mt-5 mb-3">
              {MONTHLY.map(({ m, secured, delivered }) => {
                const sH = Math.max(4, Math.round((secured  / CHART_MAX) * 100));
                const dH = Math.max(4, Math.round((delivered / CHART_MAX) * 100));
                return (
                  <div key={m} className="flex-1">
                    <div className="flex items-end gap-px" style={{ height: "100px" }}>
                      <div
                        title={`Secured ₹${secured.toLocaleString("en-IN")}`}
                        className="flex-1 bg-[#1B3FAB] hover:bg-[#1635A0] rounded-t-sm transition-colors cursor-default"
                        style={{ height: `${sH}px` }}
                      />
                      <div
                        title={`Delivered ₹${delivered.toLocaleString("en-IN")}`}
                        className="flex-1 bg-purple-400 hover:bg-purple-500 rounded-t-sm transition-colors cursor-default"
                        style={{ height: `${dH}px` }}
                      />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 mt-2">{m}</p>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 my-4" />

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Total Secured",   value: `₹${MONTHLY.reduce((s, m) => s + m.secured, 0).toLocaleString("en-IN")}`,   color: "text-[#1B3FAB]"   },
                { label: "Total Delivered", value: `₹${MONTHLY.reduce((s, m) => s + m.delivered, 0).toLocaleString("en-IN")}`, color: "text-purple-600" },
                { label: "Still Held",      value: `₹${securedTotal.toLocaleString("en-IN")}`,                                 color: "text-emerald-600" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400">{label}</p>
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
