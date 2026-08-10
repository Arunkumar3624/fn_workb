import { motion } from "motion/react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Laptop },
];

const PILL_WIDTH = 92;

// The real Light/Dark/System switch — reused by SettingsPage.jsx's
// Appearance card and the Onboarding Wizard's final step (both call sites
// share the exact same control rather than each owning a copy). Backed by
// ThemeContext.jsx, which actually applies/removes .dark on <html> and
// persists the choice — this is only the UI.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const activeIndex = Math.max(0, OPTIONS.findIndex((option) => option.id === theme));

  return (
    <div className="relative inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
      <motion.span
        className="absolute inset-y-1 left-1 rounded-full bg-slate-900 shadow-sm dark:bg-white"
        style={{ width: PILL_WIDTH }}
        animate={{ x: activeIndex * PILL_WIDTH }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      />
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            style={{ width: PILL_WIDTH }}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${
              active ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
