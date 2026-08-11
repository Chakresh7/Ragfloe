"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  applyDocumentTheme,
  applyTheme,
  getStoredThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === "/login";
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    getStoredThemePreference(),
  );
  const [systemEpoch, setSystemEpoch] = useState(0);

  const resolved: ResolvedTheme = isLoginRoute
    ? "light"
    : resolveTheme(preference);

  useEffect(() => {
    applyDocumentTheme(resolved);
    if (!isLoginRoute) {
      document.documentElement.dataset.themePreference = preference;
    }
  }, [isLoginRoute, preference, resolved, systemEpoch]);

  useEffect(() => {
    if (isLoginRoute || preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      setSystemEpoch((value) => value + 1);
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [isLoginRoute, preference]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      applyTheme(next);
      if (isLoginRoute) {
        applyDocumentTheme("light");
      }
    },
    [isLoginRoute],
  );

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
