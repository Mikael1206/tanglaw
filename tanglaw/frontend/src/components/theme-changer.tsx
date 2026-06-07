"use client";

/**
 * Theme switcher component for the UI.
 * Uses next-themes for theme state management and applies CSS custom properties.
 * Direct toggle between Light and Dark modes.
 */
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "tanglaw-theme";

const THEMES: Record<string, { label: string; values: Record<string, string> }> = {
  light: {
    label: "Light",
    values: {
      "--theme-primary": "#1B4079",
      "--theme-primary-hover": "#16355f",
      "--theme-base-canvas": "#CBDF90",
      "--theme-component-backdrop": "#F4F9E2",
      "--theme-typography-main": "#1B4079",
      "--theme-typography-secondary": "#334155",
      "--theme-borders-system": "#7F9C96",
      "--theme-text-primary": "#1B4079",
      "--theme-canvas": "#CBDF90",
      "--theme-surface": "#F4F9E2",
      "--theme-text-body": "#334155",
      "--theme-text-muted": "#94A3B8",
      "--theme-background": "#CBDF90",
      "--theme-base-pastel": "#EAF0D8",
      "--theme-base-light": "#F7F9EF",
      "--theme-accent-muted": "#A0B4A8",
      "--theme-accent-periwinkle": "#B8C9E8",
      "--theme-accent-rose": "#E8C4C4",
      "--theme-glow-primary": "0 0 0 transparent",
      "--theme-glow-ai": "0 0 0 transparent",
    },
  },
  dark: {
    label: "Dark",
    values: {
      "--theme-primary": "#1B4079",
      "--theme-primary-hover": "#122f64",
      "--theme-base-canvas": "#0B132B",
      "--theme-component-backdrop": "#111C3A",
      "--theme-typography-main": "#E2E8F0",
      "--theme-typography-secondary": "#94A3B8",
      "--theme-borders-system": "#475569",
      "--theme-text-primary": "#E2E8F0",
      "--theme-canvas": "#0B132B",
      "--theme-surface": "#111C3A",
      "--theme-text-body": "#E2E8F0",
      "--theme-text-muted": "#94A3B8",
      "--theme-background": "#0B132B",
      "--theme-base-pastel": "#1A2744",
      "--theme-base-light": "#151F38",
      "--theme-accent-muted": "#4A5A50",
      "--theme-accent-periwinkle": "#3A4F7A",
      "--theme-accent-rose": "#5A3A3A",
      "--theme-glow-primary": "0 0 20px rgba(27,64,121,0.35)",
      "--theme-glow-ai": "0 0 20px rgba(184,201,232,0.15)",
    },
  },
};

function applyThemeCSS(themeName: string) {
  const theme = THEMES[themeName] ?? THEMES.light;
  Object.entries(theme.values).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  localStorage.setItem(THEME_KEY, themeName);
}

export default function ThemeChanger() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync CSS custom properties whenever resolvedTheme changes
  useEffect(() => {
    if (resolvedTheme) {
      applyThemeCSS(resolvedTheme);
    }
  }, [resolvedTheme]);

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  if (!mounted) {
    // Render a placeholder button with same dimensions to prevent layout shift
    return (
      <button
        disabled
        className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 shadow-lg backdrop-blur-sm"
        aria-label="Loading theme"
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 shadow-lg backdrop-blur-sm transition hover:bg-white/10 focus:outline-none"
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
      title={`Current theme: ${resolvedTheme === "light" ? "Light" : "Dark"}`}
    >
      {resolvedTheme === "light" ? (
        <Moon className="h-5 w-5 text-[#d4d8a8]" />
      ) : (
        <Sun className="h-5 w-5 text-[#facc15]" />
      )}
    </button>
  );
}
