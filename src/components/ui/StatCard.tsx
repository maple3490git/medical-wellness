import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: ReactNode;
  iconClass?: string;
  onClick?: () => void;
}

export default function StatCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon,
  iconClass = "bg-gold-400/15 text-gold-600 dark:text-gold-300",
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-4 sm:p-5 transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </p>
          <p className="font-display text-xl sm:text-2xl font-bold mt-1 truncate">{value}</p>
          {delta && (
            <p className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${deltaPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              <span>{deltaPositive ? "▲" : "▼"}</span>
              {delta}
              <span className="text-[rgb(var(--text-muted))] font-normal">vs période pré</span>
            </p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}