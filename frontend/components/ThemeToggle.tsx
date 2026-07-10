"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(
      "minuteflow-theme",
    ) as Theme | null;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const initialTheme: Theme =
      storedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.dataset.theme =
      initialTheme;
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    localStorage.setItem(
      "minuteflow-theme",
      nextTheme,
    );
    document.documentElement.dataset.theme =
      nextTheme;
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="icon-btn"
        aria-label="Loading theme"
        disabled
      >
        <Sun size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        theme === "dark"
          ? "Light mode"
          : "Dark mode"
      }
    >
      {theme === "dark" ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}