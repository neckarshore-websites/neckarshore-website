"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored || "system";
    setTheme(initial);
    applyTheme(initial);

    // Listen for system theme changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    const next = resolved === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  if (!mounted) return null;

  const resolved = theme === "system" ? getSystemTheme() : theme;

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-primary/60 transition-colors hover:text-accent dark:text-text-secondary dark:hover:text-accent"
      aria-label={resolved === "dark" ? "Zu hellem Modus wechseln" : "Zu dunklem Modus wechseln"}
    >
      {resolved === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
