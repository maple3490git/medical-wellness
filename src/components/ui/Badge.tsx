import type { ReactNode } from "react";

type BadgeColor =
  | "emerald" | "amber" | "sky" | "rose" | "zinc" | "gold" | "violet" | "indigo" | "cyan" | "teal";

const colorClasses: Record<BadgeColor, string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300",
  gold: "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  dot?: boolean;
  className?: string;
}

export default function Badge({ children, color = "zinc", dot = false, className = "" }: BadgeProps) {
  return (
    <span className={`chip ${colorClasses[color]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}