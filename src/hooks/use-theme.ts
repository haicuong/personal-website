import { useEffect, useState } from "react";

export type ThemeMode = "system" | "dark" | "light";

function normalizeTheme(value: string | null): ThemeMode {
  if (value === "dark" || value === "light" || value === "system") {
    return value;
  }
  return "system";
}

function applyThemeToDocument(theme: ThemeMode) {
  const isDark =
    theme === "dark" ||
    (theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "system");
    }
    const current = normalizeTheme(localStorage.getItem("theme"));
    setTheme(current);
  }, []);

  function cycleTheme() {
    const currentTheme = localStorage.getItem("theme");
    let nextTheme: ThemeMode;

    switch (currentTheme) {
      case "dark":
        nextTheme = "light";
        break;
      case "light":
        nextTheme = "system";
        break;
      default:
        nextTheme = "dark";
        break;
    }

    localStorage.setItem("theme", nextTheme);
    applyThemeToDocument(nextTheme);
    setTheme(nextTheme);
  }

  return { theme, cycleTheme };
}

