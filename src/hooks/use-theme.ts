import { useEffect, useState } from "react";

export type ThemeMode = "system" | "dark" | "light";

export const THEME_STORAGE_KEY = "theme";
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function normalizeTheme(value: unknown): ThemeMode {
  if (value === "dark" || value === "light" || value === "system") {
    return value;
  }
  return "system";
}

export function resolveIsDark(
  theme: ThemeMode,
  systemPrefersDark: boolean,
): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark);
}

export function getNextTheme(current: ThemeMode): ThemeMode {
  switch (current) {
    case "system":
      return "dark";
    case "dark":
      return "light";
    case "light":
      return "system";
  }
}

function getSystemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DARK_MEDIA_QUERY).matches
  );
}

export function readStoredTheme(): ThemeMode {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function writeStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors when localStorage is blocked or unavailable
  }
}

export function applyThemeToDocument(theme: ThemeMode): void {
  const isDark = resolveIsDark(theme, getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.add("no-transitions");

  // Force a reflow to ensure the transition is applied correctly
  window.getComputedStyle(document.documentElement).opacity;
  document.documentElement.classList.remove("no-transitions");
}

/**
 * Generates the synchronous inline `<head>` script required to apply `.dark`
 * on `document.documentElement` before first paint (since `<script type="module">`
 * is deferred by specification). Uses the same storage key, media query,
 * `try/catch` storage guard, and normalization rules as `useTheme()`.
 */
export function getThemeInitScript(): string {
  return `
<script>
  (function() {
    var stored = null;
    try {
      stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    } catch (e) {}
    var mode = stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
    var systemDark = typeof window.matchMedia === "function" && window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches;
    var isDark = mode === "dark" || (mode === "system" && systemDark);
    document.documentElement.classList.toggle("dark", isDark);
  })();
</script>
`;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode | null>(null);

  useEffect(() => {
    const current = readStoredTheme();
    writeStoredTheme(current);
    applyThemeToDocument(current);
    setTheme(current);
  }, []);

  useEffect(() => {
    if (theme !== "system" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = () => {
      applyThemeToDocument("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  function cycleTheme() {
    const currentTheme = theme ?? readStoredTheme();
    const nextTheme = getNextTheme(currentTheme);

    writeStoredTheme(nextTheme);
    applyThemeToDocument(nextTheme);
    setTheme(nextTheme);
  }

  return { theme, cycleTheme };
}
