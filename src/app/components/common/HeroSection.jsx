import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const JAKARTA = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const INTER = { fontFamily: "'Inter', sans-serif" };

const TABS = [
  { key: "business", label: "Business Overview" },
  { key: "worker", label: "Worker Job Feed" },
];

const KPIS = [
  { label: "Match Rate", value: "96%", icon: TrendingUp },
  { label: "Time to Hire", value: "<24h", icon: Clock },
  { label: "Active Talent", value: "18", icon: Users },
  { label: "Escrow Secured", value: "₹4.2L", icon: ShieldCheck },
];

const KANBAN = {
  Urgent: [
    { title: "Fix Checkout Bug", pay: "₹8,000", due: "2h left" },
    { title: "Landing Page Copy", pay: "₹3,500", due: "Today" },
  ],
  Standard: [
    { title: "Automation Specialist", pay: "₹22,000", due: "3 days" },
    { title: "Product Designer", pay: "₹18,000", due: "5 days" },
  ],
  Micro: [
    { title: "Logo Tweak", pay: "₹800", due: "30 min" },
    { title: "Data Entry (50 rows)", pay: "₹500", due: "1h" },
  ],
};

const spring = { type: "spring", stiffness: 300, damping: 30 };

export function HeroSection({ onSelect }) {
  const [view, setView] = useState("business");

  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-28 sm:pt-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-600 backdrop-blur-sm">
          <Sparkles size={14} /> The New Standard for Digital Work
        </span>

        <h1
          style={JAKARTA}
          className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
        >
          Your Ambition.
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            Instantly Rewarded.
          </span>
        </h1>

        <p style={INTER} className="mt-6 max-w-2xl text-lg text-slate-500">
          WorkBridge pairs you with verified talent and verified businesses,
          then moves funds through instant escrow the moment work is approved
          — no invoices, no chasing, no waiting.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => onSelect("business")}
            style={JAKARTA}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_-3px_rgba(255,107,53,0.4)] transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_0_30px_-3px_rgba(255,107,53,0.55)]"
          >
            Start Hiring <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => onSelect("worker")}
            style={JAKARTA}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
          >
            Earn Money
          </button>
        </div>
      </div>

      <div className="relative mx-auto mt-20 max-w-5xl">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 scale-110 bg-gradient-to-r from-orange-400/30 to-blue-400/30 blur-3xl"
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>

          <div className="flex justify-center pt-6">
            <div className="relative inline-flex rounded-full bg-slate-100 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setView(tab.key)}
                  style={JAKARTA}
                  className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    view === tab.key ? "text-white" : "text-slate-500"
                  }`}
                >
                  {view === tab.key && (
                    <motion.span
                      layoutId="hero-toggle-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-slate-900"
                      transition={spring}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[340px] overflow-hidden px-6 py-8 sm:px-10">
            <AnimatePresence mode="wait">
              {view === "business" ? (
                <motion.div
                  key="business"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={spring}
                >
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {KPIS.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left"
                      >
                        <Icon size={16} className="text-orange-500" />
                        <p style={JAKARTA} className="mt-2 text-2xl font-bold text-slate-900">
                          {value}
                        </p>
                        <p style={INTER} className="text-xs text-slate-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-100 p-5 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={JAKARTA} className="font-semibold text-slate-900">
                          Senior React Developer
                        </p>
                        <p style={INTER} className="text-sm text-slate-500">
                          Verified · Payment Ready
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                        92% Match
                      </span>
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="worker"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={spring}
                  className="grid gap-4 sm:grid-cols-3"
                >
                  {Object.entries(KANBAN).map(([column, jobs]) => (
                    <div key={column} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left">
                      <p style={JAKARTA} className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {column}
                      </p>
                      <div className="mt-3 flex flex-col gap-3">
                        {jobs.map((job) => (
                          <div key={job.title} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                            <p style={JAKARTA} className="text-sm font-semibold text-slate-900">
                              {job.title}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span style={INTER} className="text-xs font-medium text-orange-600">
                                {job.pay}
                              </span>
                              <span style={INTER} className="text-xs text-slate-400">
                                {job.due}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
