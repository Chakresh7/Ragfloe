export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "ragfloe.theme";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

/** Apply theme to <html> without changing stored preference. */
export function applyDocumentTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
}

export function applyTheme(preference: ThemePreference) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(preference);
  applyDocumentTheme(resolved);
  document.documentElement.dataset.themePreference = preference;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Inline boot script — keeps first paint aligned with stored preference,
 * but always forces light theme on `/login`.
 */
export const themeBootScript = `(function(){try{var path=location.pathname;if(path==="/login"){document.documentElement.dataset.theme="light";document.documentElement.dataset.themePreference="light";return;}var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="system"&&t!=="light"&&t!=="dark")t="system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.dataset.themePreference=t;}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.themePreference="system";}})();`;
