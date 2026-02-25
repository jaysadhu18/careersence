"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-slate-200 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-500)]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon – visible in dark mode (click to go light) */}
      <svg
        className={`absolute h-5 w-5 text-amber-400 transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </svg>

      {/* Moon icon – visible in light mode (click to go dark) */}
      <svg
        className={`absolute h-5 w-5 text-indigo-500 transition-all duration-300 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
}
