import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { ShieldCheck, Trophy, Wallet, X, Zap } from "lucide-react";

// One celebration system, three tuned moments.
// Layer 3 of the Z-Index Master Protocol: overlay sits at z-[70],
// confetti canvas rains above the card at z-90.

const VARIANTS = {
  verified: {
    Icon: ShieldCheck,
    eyebrow: "Verification complete",
    iconBg: "bg-[#FF6B35]",
    iconShadow: "shadow-[0_0_70px_-8px_rgba(255,107,53,0.7)]",
    ring: "border-[#FF6B35]",
    button: "bg-[#FF6B35] shadow-orange-200 hover:bg-[#f05b24]",
    confetti: ["#FF6B35", "#FBBF24", "#0F172A", "#FDE68A", "#FFFFFF"],
  },
  paid: {
    Icon: Wallet,
    eyebrow: "Payment released",
    iconBg: "bg-emerald-500",
    iconShadow: "shadow-[0_0_70px_-8px_rgba(16,185,129,0.7)]",
    ring: "border-emerald-500",
    button: "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700",
    confetti: ["#10B981", "#34D399", "#FBBF24", "#0F172A", "#FFFFFF"],
  },
  milestone: {
    Icon: Trophy,
    eyebrow: "Milestone complete",
    iconBg: "bg-[#1B3FAB]",
    iconShadow: "shadow-[0_0_70px_-8px_rgba(27,63,171,0.6)]",
    ring: "border-[#1B3FAB]",
    button: "bg-[#0F172A] shadow-slate-300 hover:bg-slate-800",
    confetti: ["#1B3FAB", "#60A5FA", "#FF6B35", "#10B981"],
  },
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) return undefined;
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
}

export default function CelebrationOverlay({
  variant = "milestone",
  title,
  message,
  amount,
  primaryLabel = "Continue",
  onPrimary,
  onClose,
}) {
  const cfg = VARIANTS[variant] ?? VARIANTS.milestone;
  const Icon = cfg.Icon;
  const amountValue = amount ? Number(String(amount).replace(/[^\d]/g, "")) : 0;
  const displayAmount = useCountUp(amountValue);

  // Global scroll lock while the moment is on screen
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Confetti choreography: one center burst, then side cannons for the big moments
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const colors = cfg.confetti;
    confetti({
      particleCount: variant === "milestone" ? 90 : 150,
      spread: 80,
      startVelocity: 42,
      origin: { y: 0.55 },
      colors,
      zIndex: 90,
    });

    if (variant === "milestone") return undefined;

    const end = Date.now() + 1600;
    const cannons = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(cannons);
        return;
      }
      confetti({ particleCount: 26, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors, zIndex: 90 });
      confetti({ particleCount: 26, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors, zIndex: 90 });
    }, 250);

    return () => clearInterval(cannons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Dismiss celebration"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.section
        initial={{ opacity: 0, scale: 0.82, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Seal stamp + ripple rings */}
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          {[0, 0.55].map((delay) => (
            <motion.span
              key={delay}
              className={`absolute inset-0 rounded-full border-2 ${cfg.ring}`}
              initial={{ scale: 1, opacity: 0.45 }}
              animate={{ scale: 1.85, opacity: 0 }}
              transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
          <motion.div
            initial={{ scale: 1.7, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-white ${cfg.iconBg} ${cfg.iconShadow}`}
          >
            <Icon className="h-11 w-11" />
          </motion.div>
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
          {cfg.eyebrow}
        </p>
        <h2
          className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {title}
        </h2>

        {variant === "paid" && amountValue > 0 && (
          <p
            className="mt-4 text-5xl font-black tracking-tight text-emerald-600"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ₹{displayAmount.toLocaleString("en-IN")}
          </p>
        )}

        {message && (
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-500">{message}</p>
        )}

        <button
          type="button"
          onClick={onPrimary ?? onClose}
          className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${cfg.button}`}
        >
          {variant === "paid" && <Zap className="h-5 w-5" />}
          {primaryLabel}
        </button>
      </motion.section>
    </div>,
    document.body
  );
}
