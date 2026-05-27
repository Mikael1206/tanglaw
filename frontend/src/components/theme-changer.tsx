"use client";

/**
 * Theme switcher component for the UI.
 * Persists the selected theme to localStorage and updates CSS custom properties.
 */
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "tanglaw-theme";

const THEMES: Record<string, { label: string; icon: "sun" | "moon"; values: Record<string, string> }> = {
  light: {
    label: "Light",
    icon: "sun",
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
    },
  },
  dark: {
    label: "Dark",
    icon: "moon",
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
    },
  },
};

function applyTheme(themeName: string) {
  const theme = THEMES[themeName] ?? THEMES.light;
  Object.entries(theme.values).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  localStorage.setItem(THEME_KEY, themeName);
}

export default function ThemeChanger() {
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) || "light";
    const normalized = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    setSelectedTheme(normalized);
    applyTheme(normalized);
  }, []);

  const changeTheme = (themeName: string) => {
    setSelectedTheme(themeName);
    applyTheme(themeName);
    setIsOpen(false);
  };

  const currentTheme = THEMES[selectedTheme];
  const Icon = currentTheme.icon === "sun" ? Sun : Moon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 shadow-lg backdrop-blur-sm transition hover:bg-white/10 focus:outline-none"
        aria-label="Toggle theme"
        title={`Current theme: ${currentTheme.label}`}
      >
        <Icon className="h-5 w-5 text-[#d4d8a8]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/15 bg-[#F4F9E2]/95 backdrop-blur-sm shadow-2xl z-50">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] font-black text-[#1B4079] mb-3">Select Theme</p>
            <div className="space-y-2">
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => changeTheme(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    selectedTheme === key
                      ? "bg-[#1B4079] text-[#F4F9E2]"
                      : "bg-white/20 text-[#1B4079] hover:bg-white/40"
                  }`}
                >
                  {theme.icon === "sun" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
