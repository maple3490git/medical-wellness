import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  padding?: string;
}

export default function Card({
  children,
  className = "",
  title,
  subtitle,
  icon,
  action,
  padding = "p-5",
}: CardProps) {
  return (
    <div className={`card ${padding} ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-gold-400/15 text-gold-600 dark:text-gold-300 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}