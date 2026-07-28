import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, Store, Trophy } from "lucide-react";
import WorkerMilestones from "../components/worker/WorkerMilestones";
import WorkerTokenShop from "../components/worker/WorkerTokenShop";
import WorkerLedger from "../components/worker/WorkerLedger";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Consolidates three previously separate sidebar pages (Ledger, Token
// Shop, Milestones) into one hub. Deliberately a composition, not a
// rewrite — each tab renders the exact same component with its own real
// API calls/loading/error states untouched; this file only owns the tab
// chrome and the switch animation.
const TABS = [
  { id: "milestones", label: "Project Milestones", icon: Trophy },
  { id: "shop", label: "Token Shop", icon: Store },
  { id: "ledger", label: "Ledger History", icon: Coins },
];

export default function EconomyHub() {
  useDocumentTitle("Economy Hub — WorkBridge");
  const [activeTab, setActiveTab] = useState("milestones");
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const rootRef = useRef(null);

  // This page renders inside DashboardLayout's own scrollable pane
  // (`.wb-scroll-clean`), not the window — so the scroll listener has to
  // attach to that ancestor, found once via the DOM rather than threaded
  // down as a prop from three layers of parent components.
  useEffect(() => {
    const scrollEl = rootRef.current?.closest(".wb-scroll-clean");
    if (!scrollEl) return undefined;

    const handleScroll = () => {
      setScrolled(scrollEl.scrollTop > 8);
      const max = scrollEl.scrollHeight - scrollEl.clientHeight;
      setScrollPct(max > 0 ? Math.min(100, (scrollEl.scrollTop / max) * 100) : 0);
    };
    handleScroll();
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={rootRef} className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Economy Hub
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your progress, your tokens, your rewards — all in one place.</p>
      </div>

      <div
        className={`sticky top-0 z-20 relative mb-6 flex flex-wrap gap-1.5 rounded-full border p-1.5 w-fit transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-xl"
            : "border-slate-200 bg-white"
        }`}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
        <div
          className="pointer-events-none absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-[#FF6B35] transition-all duration-150"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {activeTab === "milestones" && <WorkerMilestones embedded />}
          {activeTab === "shop" && <WorkerTokenShop embedded />}
          {activeTab === "ledger" && <WorkerLedger embedded />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
