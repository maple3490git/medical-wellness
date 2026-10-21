"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-gold-500 transition-all"
      title={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
    >
      <Sun size={17} className={`transition-all duration-200 ${theme === "dark" ? "opacity-0 scale-50 absolute" : "opacity-100 scale-100"}`} />
      <Moon size={17} className={`transition-all duration-200 ${theme === "light" ? "opacity-0 scale-50 absolute" : "opacity-100 scale-100"}`} />
    </button>
  );
}