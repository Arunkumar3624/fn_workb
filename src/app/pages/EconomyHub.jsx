import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Coins, Store, Trophy } from "lucide-react";
import WorkerMilestones from "../components/worker/WorkerMilestones";
import WorkerTokenShop from "../components/worker/WorkerTokenShop";
import WorkerLedger from "../components/worker/WorkerLedger";
import WorkerLevelRing from "../components/worker/WorkerLevelRing";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getLedger } from "../lib/gamificationApi";

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

const TAB_IDS = new Set(TABS.map((t) => t.id));

export default function EconomyHub() {
  useDocumentTitle("Economy Hub — WorkBridge");
  const [searchParams] = useSearchParams();
  // Lets the dashboard header's Tokens HUD chip link straight to
  // /worker/economy?tab=shop instead of always landing on the default
  // "milestones" tab and making the worker click again.
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(TAB_IDS.has(requestedTab) ? requestedTab : "milestones");
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const rootRef = useRef(null);
  // Fetched once here (not inside WorkerMilestones/WorkerTokenShop, which
  // already fetch their own copies independently) so the ring at the top
  // of the page can show real level/XP data regardless of which tab is
  // active. A failed fetch just hides the ring — it's a HUD, not blocking.
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getLedger()
      .then((data) => {
        if (!cancelled) setLedger(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // WorkerDashboard.jsx wraps every tab body in a `flex-1 overflow-hidden`
  // div — each tab is expected to own its own scrolling (WorkerWallet.jsx
  // does the same). This page's root IS that scroll container, so the
  // listener attaches directly to it rather than searching for an
  // ancestor pane that, for this tab, never actually scrolls.
  useEffect(() => {
    const scrollEl = rootRef.current;
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
    <div ref={rootRef} className="wb-scroll-clean h-full min-h-0 overflow-y-auto overflow-x-hidden bg-[#f8fafc] dark:bg-slate-950">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-[#0A1128] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Economy Hub
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Everything you've earned so far — level, tokens, and rewards — lives here.</p>
        </div>

        {ledger && (
          <div className="mb-8 flex justify-center">
            <WorkerLevelRing
              level={ledger.currentLevel}
              currentXp={Math.max(0, ledger.xp - ledger.xpForCurrentLevel)}
              nextLevelXp={Math.max(0, ledger.xpForNextLevel - ledger.xpForCurrentLevel)}
              progressPct={ledger.progressPct}
            />
          </div>
        )}

        <div
          className={`sticky top-0 z-20 mb-6 flex w-fit flex-wrap gap-1.5 rounded-full border p-1.5 transition-all duration-300 ${
            scrolled
              ? "border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                activeTab === id ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
    </div>
  );
}
