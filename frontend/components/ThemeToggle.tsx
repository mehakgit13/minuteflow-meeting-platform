"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "minuteflow-theme",
    ) as Theme | null;

    const systemPrefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

    const initialTheme: Theme =
      savedTheme ??
      (systemPrefersDark ? "dark" : "light");

    document.documentElement.setAttribute(
      "data-theme",
      initialTheme,
    );

    setTheme(initialTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute(
      "data-theme",
      nextTheme,
    );

    localStorage.setItem(
      "minuteflow-theme",
      nextTheme,
    );

    setTheme(nextTheme);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="icon-btn theme-toggle"
        aria-label="Toggle theme"
      >
        <Moon size={19} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>
  );
}