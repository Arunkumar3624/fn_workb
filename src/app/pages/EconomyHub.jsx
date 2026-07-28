import { useState } from "react";
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Economy Hub
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your progress, your tokens, your rewards — all in one place.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 w-fit">
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
