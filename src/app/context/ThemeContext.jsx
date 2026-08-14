import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// theme.css already ships a complete light+dark CSS variable set and
// `@custom-variant dark (&:is(.dark *));` (shadcn's default setup) — every
// `dark:` class in components/ui/*.jsx has been waiting on this the whole
// time. This is the missing piece: a real toggle that actually applies/
// removes the .dark class on <html>, persists the choice, and resolves
// "system" against the OS preference (and keeps it live if the OS setting
// changes while "system" is selected).
const STORAGE_KEY = "wb-theme";
const VALID_THEMES = new Set(["light", "dark", "system"]);

const ThemeContext = createContext(null);

function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return VALID_THEMES.has(stored) ? stored : "system";
}

function prefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyResolvedTheme(theme) {
  const resolved = theme === "system" ? (prefersDark() ? "dark" : "light") : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => applyResolvedTheme(getStoredTheme()));

  const setTheme = useCallback((next) => {
    if (!VALID_THEMES.has(next)) return;
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  useEffect(() => {
    setResolvedTheme(applyResolvedTheme(theme));

    if (theme !== "system") return undefined;
    // Keeps a "System" choice live — if the OS preference flips while the
    // user is sitting on this tab, the app should follow it without
    // needing a manual toggle or a reload.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(applyResolvedTheme("system"));
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  // ThemeProvider sits above the router at the app root (App.jsx) — every
  // useTheme() consumer anywhere in the tree re-renders on any change to
  // this object's identity, not just a real theme change. Unmemoized here
  // meant a fresh object (and a fresh setTheme closure) on every render,
  // which also defeated any consumer's own useCallback/useEffect deps that
  // included setTheme.
  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
