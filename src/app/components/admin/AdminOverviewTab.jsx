import { useEffect, useState } from "react";
import {
  Users, Briefcase, IndianRupee, Lock, TrendingUp, TrendingDown,
  AlertTriangle, Shield, Download, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { REVENUE, LIVE_FEED_TEMPLATE } from "../../data/mockAdminData";

const TONE_DOT = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  slate: "bg-slate-400",
  emerald: "bg-emerald-500",
  green: "bg-green-500",
  orange: "bg-[#FF6B35]",
};

// KPI cards now carry a short trend history so the dashboard reads as
// "live telemetry" rather than four static numbers.
const KPI_CARDS = [
  {
    l: "Total Users", v: "12,84,736", I: Users, c: "text-[#1B3FAB]", bg: "bg-[#1B3FAB]/5",
    spark: [11.2, 11.6, 11.9, 12.2, 12.5, 12.85], stroke: "#1B3FAB",
  },
  {
    l: "Jobs Posted Today", v: "3,842", I: Briefcase, c: "text-emerald-600", bg: "bg-emerald-50",
    spark: [3120, 3340, 3050, 3510, 3680, 3842], stroke: "#059669",
  },
  {
    l: "Revenue Today", v: "₹8,47,200", I: IndianRupee, c: "text-purple-600", bg: "bg-purple-50",
    spark: [610, 690, 720, 705, 780, 847], stroke: "#9333ea",
  },
  {
    l: "Active Funds Pool", v: "₹4.28 Cr", I: Lock, c: "text-amber-600", bg: "bg-amber-50",
    spark: [4.6, 4.5, 4.42, 4.35, 4.31, 4.28], stroke: "#d97706",
  },
];

// Mini inline sparkline — no axes, just the shape of the trend
function Sparkline({ data, stroke }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / range) * 26}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 28" className="w-full h-7" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Thresholds that flip the alerts strip on — a Panopticon should surface
// problems, not just report numbers.
const ALERTS = [
  { id: "verification", condition: 247 > 200, label: "Verification queue is elevated (247 pending) — approvals are lagging.", tab: "verification", icon: Shield, tone: "amber" },
  { id: "disputes", condition: 18 > 15, label: "Active disputes above normal (18 open) — review before escrow ages further.", tab: "disputes", icon: AlertTriangle, tone: "red" },
];

const ALERT_STYLE = {
  amber: { wrap: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: "text-amber-500", link: "text-amber-700 hover:text-amber-900" },
  red: { wrap: "bg-red-50 border-red-200", text: "text-red-800", icon: "text-red-500", link: "text-red-700 hover:text-red-900" },
};

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function AdminOverviewTab({ onNavigate }) {
  const [liveFeed, setLiveFeed] = useState(() =>
    LIVE_FEED_TEMPLATE.slice(0, 5).map((event, i) => ({ ...event, id: i, time: `${(i + 1) * 2} min ago` }))
  );
  const now = useLiveClock();

  // Simulated real-time heartbeat — a new mock event scrolls in every few seconds
  useEffect(() => {
    let cursor = 0;
    const interval = setInterval(() => {
      const template = LIVE_FEED_TEMPLATE[cursor % LIVE_FEED_TEMPLATE.length];
      cursor += 1;
      setLiveFeed((prev) => [{ ...template, id: Date.now(), time: "Just now" }, ...prev].slice(0, 14));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = ALERTS.filter((a) => a.condition);

  const dateLabel = now.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  const timeLabel = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Master Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-600 text-sm font-semibold">Platform Health: 98.4%</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-slate-500 text-xs font-semibold">{dateLabel}</div>
            <div className="text-slate-800 text-sm font-mono font-bold tabular-nums">{timeLabel} IST</div>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── System Alerts ── */}
      {activeAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {activeAlerts.map(({ id, label, tab, icon: Icon, tone }) => {
            const style = ALERT_STYLE[tone];
            return (
              <div key={id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${style.wrap}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${style.icon}`} />
                <p className={`text-sm font-semibold flex-1 ${style.text}`}>{label}</p>
                <button
                  onClick={() => onNavigate?.(tab)}
                  className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ${style.link}`}
                >
                  Review
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: KPIs + Chart (70%) ── */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-6 xl:grid-cols-4">
            {KPI_CARDS.map(({ l, v, I, c, bg, spark, stroke }) => {
              const trendPct = Math.round(((spark.at(-1) - spark[0]) / spark[0]) * 100);
              const isUp = trendPct >= 0;
              return (
                <div
                  key={l}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                      <I className={`w-5 h-5 ${c}`} />
                    </div>
                    <span className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(trendPct)}%
                    </span>
                  </div>
                  <div className={`text-2xl font-extrabold ${c}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v}</div>
                  <div className="text-slate-500 text-sm mt-1 mb-3">{l}</div>
                  <Sparkline data={spark} stroke={stroke} />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <h3 className="font-bold text-slate-800 mb-4">Weekly Revenue (₹ thousands)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={REVENUE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip content={renderRevenueTooltip} />
                  <Area type="monotone" dataKey="commission" stackId="1" stroke="#1B3FAB" fill="#1B3FAB" fillOpacity={0.12} name="Commission" />
                  <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#FF6B2C" fill="#FF6B2C" fillOpacity={0.12} name="Subscriptions" />
                  <Area type="monotone" dataKey="boosts" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.12} name="Boosts" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <h3 className="font-bold text-slate-800 mb-5">Platform KPIs</h3>
              <div className="space-y-4">
                {[
                  { l: "Verification Queue", v: 247, max: 300, c: "bg-amber-500" },
                  { l: "Active Disputes", v: 18, max: 50, c: "bg-red-500" },
                  { l: "Payment Success Rate", v: 99.2, max: 100, c: "bg-emerald-500", s: "%" },
                  { l: "Avg. Payout Speed", v: 58, max: 60, c: "bg-[#1B3FAB]", s: "s" },
                ].map(({ l, v, max, c, s }) => (
                  <div key={l}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">{l}</span>
                      <span className="font-bold text-slate-800 font-mono">{v}{s ?? ""}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${c} rounded-full`} style={{ width: `${(v / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Live Platform Feed (30%) ── */}
        <div className="lg:col-span-1">
          <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-shrink-0 items-center gap-2 pb-3 border-b border-slate-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm">Live Platform Feed</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {liveFeed.map((event) => (
                <div key={event.id} className="flex items-start gap-2 pb-3 border-b border-slate-50 last:border-0">
                  <div className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${TONE_DOT[event.tone] ?? "bg-slate-400"}`} />
                  <div className="min-w-0">
                    <p className="text-xs leading-snug text-slate-700">{event.text}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Frosted-glass Recharts tooltip for the revenue AreaChart
function renderRevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 text-white backdrop-blur-md">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-0.5 text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: ₹{entry.value}k
        </p>
      ))}
    </div>
  );
}
