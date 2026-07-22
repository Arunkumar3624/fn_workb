import { useState } from "react";
import { X, Shield, Check, CheckCircle2, Zap, Lock, Star, ArrowRight, Sparkles } from "lucide-react";

// ── Static data ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Identity",       done: true,   active: false },
  { id: 2, label: "Legal Docs",     done: true,   active: false },
  { id: 3, label: "Secure Payment", done: false,  active: true  },
];

const BENEFITS = [
  "Attract the top 1% of verified digital talent",
  "Post unlimited projects with zero listing fees",
  "Instant dispute protection on every job",
  "Premium company profile with Verified badge",
  "Priority support with dedicated account manager",
];

const PAYMENT_METHODS = [
  { id: "upi",        emoji: "⚡", label: "UPI",           desc: "PhonePe · Google Pay · Paytm"    },
  { id: "card",       emoji: "💳", label: "Credit / Debit", desc: "Visa · Mastercard · Rupay"       },
  { id: "netbanking", emoji: "🏛️", label: "Net Banking",    desc: "All major Indian banks"           },
];

// Background kanban columns — shown blurred beneath overlay
const BG_COLS = [
  {
    label: "🔥 Urgent",
    cards: ["React Dashboard – FinEdge", "AI Chatbot – RetailX", "API Bug Fix – ShopNow", "Payment Gateway – FashionKart"],
  },
  {
    label: "💼 Standard",
    cards: ["Brand Identity – Nourish", "SEO Articles ×20", "Social Campaign – StyleHaus", "Power BI – LogiTrack"],
  },
  {
    label: "⚡ Micro Tasks",
    cards: ["Logo Variation", "Email Template", "Copy Edit – 3 pages", "Icon Set Design"],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════════════════

export default function BusinessVerificationDrawer({ onClose, onPaymentSuccess }) {
  const [method,       setMethod]       = useState("upi");
  const [upiId,        setUpiId]        = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [upiOk,  setUpiOk]  = useState(false);
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      onPaymentSuccess?.();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Background Kanban (decorative, under the blur) ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="h-full bg-[#F8FAFC] flex gap-4 px-6 py-6 overflow-hidden">
          {BG_COLS.map((col) => (
            <div key={col.label} className="flex-1 space-y-3">
              <div className="text-xs font-bold text-slate-400 px-1 mb-3">{col.label}</div>
              {col.cards.map((c) => (
                <div key={c} className="bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm">
                  <div className="h-2.5 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="text-[11px] font-medium text-slate-700 truncate">{c}</div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="h-1.5 w-10 bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-14 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Overlay blur ── */}
      <div
        className="absolute inset-0 bg-[#0A1128]/60 backdrop-blur-[3px] cursor-pointer"
        onClick={onClose}
      />

      {/* ══════════════════════════════════════════
          THE DRAWER — slides in from right
          ══════════════════════════════════════════ */}
      <div
        className="absolute right-0 top-0 bottom-0 flex w-full shadow-2xl shadow-black/30 md:w-[54%]"
        style={{ animation: "slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0.6; }
            to   { transform: translateX(0);    opacity: 1;   }
          }
          @keyframes ping-slow {
            0%,100% { transform: scale(1); opacity: 0.7; }
            50%      { transform: scale(1.5); opacity: 0; }
          }
          .ping-slow { animation: ping-slow 1.8s ease-in-out infinite; }
        `}</style>

        {/* ── LEFT: Marketing Panel — purely decorative, hidden below md so
            the checkout panel (the actually functional half) gets the full
            drawer width instead of being squeezed on narrow screens ── */}
        <div
          className="hidden w-[38%] flex-col relative overflow-hidden md:flex"
          style={{ background: "linear-gradient(160deg, #0A1128 0%, #1e293b 100%)" }}
        >
          {/* Top badge */}
          <div className="px-8 pt-10 pb-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B2C] to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B2C]/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                WorkBridge
              </span>
            </div>

            <p className="text-[10px] font-bold text-[#FF6B2C] uppercase tracking-[0.22em] mb-2">
              One-time upgrade
            </p>
            <h2
              className="text-xl font-extrabold text-white leading-snug mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Unlock the Business<br />
              <span className="text-[#FF6B2C]">Verified Badge.</span>
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              Join 4,800+ businesses hiring India's best freelancers with full payment protection.
            </p>
          </div>

          {/* Glowing shield */}
          <div className="flex justify-center py-5 relative">
            <div className="relative">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-full bg-[#FF6B2C]/20 scale-150 blur-xl" />
              <div className="absolute inset-0 rounded-full bg-amber-400/10 scale-[2] blur-2xl" />
              {/* Shield */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF6B2C] to-amber-400 rounded-[22px] flex items-center justify-center shadow-2xl shadow-[#FF6B2C]/40">
                <Shield className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              {/* Stars */}
              <div className="absolute -top-2 -right-2 flex">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div className="px-8 flex-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              What you unlock
            </p>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-xs leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rating row */}
          <div className="px-8 py-6 border-t border-white/8">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-white text-xs font-semibold">4.9 / 5</span>
              <span className="text-slate-500 text-xs">· 2,340 reviews</span>
            </div>
            <p className="text-slate-500 text-[11px] mt-1 italic">
              "Best investment we made for hiring in India."
            </p>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#FF6B2C]/8 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 -right-8 w-24 h-24 bg-[#1B3FAB]/20 rounded-full pointer-events-none" />
        </div>

        {/* ── RIGHT: Checkout Panel ── */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
            <div>
              <p className="font-bold text-[#0A1128] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Complete Verification
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Secure checkout · One-time payment</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Horizontal stepper ── */}
          <div className="px-8 py-5 border-b border-slate-50 flex-shrink-0">
            <div className="relative flex items-center justify-between">
              {/* Connector lines */}
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-100 z-0" />
              <div className="absolute left-0 top-4 h-0.5 bg-emerald-400 z-0" style={{ width: "66%" }} />

              {STEPS.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  {step.done ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : step.active ? (
                    <div className="relative">
                      <div className="ping-slow absolute inset-0 rounded-full bg-[#FF6B2C]/40" />
                      <div className="relative w-8 h-8 rounded-full bg-[#FF6B2C] flex items-center justify-center shadow-lg shadow-[#FF6B2C]/40 ring-4 ring-[#FF6B2C]/20">
                        <span className="text-white text-xs font-bold">{step.id}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 text-xs font-bold">{step.id}</span>
                    </div>
                  )}
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${
                    step.done ? "text-emerald-500" : step.active ? "text-[#FF6B2C]" : "text-slate-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

            {/* Invoice summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Order Summary</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Business Verification Fee</span>
                  <span className="font-semibold text-[#0A1128]">₹399.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">GST (18%)</span>
                  <span className="font-semibold text-[#0A1128]">₹71.82</span>
                </div>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A1128] text-sm">Total</span>
                  <span className="font-extrabold text-[#0A1128] text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    ₹470.82
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <p className="text-[11px] text-emerald-700 font-medium">
                  One-time payment · No recurring charges · Lifetime verified status
                </p>
              </div>
            </div>

            {/* Payment method selection */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Payment Method</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => { setMethod(pm.id); setSelectedBank(null); }}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      method === pm.id
                        ? "border-[#FF6B2C] bg-orange-50/60 shadow-md shadow-orange-100 -translate-y-0.5"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {method === pm.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#FF6B2C] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-2 leading-none">{pm.emoji}</div>
                    <div className="font-bold text-[#0A1128] text-xs">{pm.label}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{pm.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI input — revealed when UPI is selected */}
            {method === "upi" && (
              <div className="space-y-3" style={{ animation: "fadeIn 0.2s ease both" }}>
                <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px);} to { opacity:1; transform:none; } }`}</style>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your UPI ID</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => { setUpiId(e.target.value); setUpiOk(false); }}
                    placeholder="name@okhdfc or 9876543210@ybl"
                    className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] transition-all"
                  />
                  <button
                    onClick={() => setUpiOk(upiId.includes("@"))}
                    className="px-5 py-3 bg-[#0A1128] hover:bg-[#1B3FAB] text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {upiOk && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> UPI ID verified successfully
                  </div>
                )}
                {upiId && !upiOk && (
                  <p className="text-xs text-slate-400">
                    Click <strong>Verify</strong> to confirm your UPI address before paying.
                  </p>
                )}
              </div>
            )}

            {/* Card details */}
            {method === "card" && (
              <div className="space-y-3" style={{ animation: "fadeIn 0.2s ease both" }}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Card Details</p>
                <input type="text" placeholder="Card number" className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM / YY" className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] transition-all" />
                  <input type="text" placeholder="CVV" className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] transition-all" />
                </div>
                <input type="text" placeholder="Name on card" className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] transition-all" />
              </div>
            )}

            {/* Net banking bank selector */}
            {method === "netbanking" && (
              <div className="space-y-3" style={{ animation: "fadeIn 0.2s ease both" }}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Bank</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {["HDFC Bank", "SBI", "ICICI", "Axis Bank", "Kotak", "Other"].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border-2 ${
                        selectedBank === bank
                          ? "border-[#FF6B2C] bg-orange-50 text-[#FF6B2C] shadow-sm shadow-orange-100"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                {selectedBank && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedBank} selected — you'll be redirected to complete login
                  </p>
                )}
              </div>
            )}

          </div>

          {/* ── Sticky footer ── */}
          <div className="flex-shrink-0 border-t border-slate-100 px-5 py-5 bg-white flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            {/* Security note */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-700">256-bit SSL Encryption</p>
                <p className="text-[10px] text-slate-400">Bank-level security · Razorpay powered</p>
              </div>
            </div>

            {/* Pay CTA */}
            <button
              onClick={handlePay}
              disabled={paying}
              className={`flex w-full items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all shadow-xl whitespace-nowrap sm:w-auto ${
                paying
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FF6B2C] to-rose-500 hover:opacity-90 shadow-orange-300/40 hover:-translate-y-0.5"
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {paying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Pay ₹470.82 &amp; Verify Account
                  <Zap className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
