"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-9 w-16 items-center rounded-full border p-1 transition-all duration-500 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-500)] ${
        isDark
          ? "border-[var(--color-border)] bg-[var(--color-primary-900)]"
          : "border-slate-300 bg-slate-200"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-amber-400 transition-opacity duration-500 ease-in-out"
        style={{ opacity: isDark ? 0.3 : 1 }}
      >
        {/* Sun */}
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-indigo-300 transition-opacity duration-500 ease-in-out"
        style={{ opacity: isDark ? 1 : 0.3 }}
      >
        {/* Moon */}
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>

      {/* Sliding knob */}
      <span
        className={`h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-500 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
    </button>
  );
}
