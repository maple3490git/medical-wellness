import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title = "Aucun résultat",
  description = "Aucune donnée ne correspond à votre recherche.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--surface-soft))] flex items-center justify-center text-[rgb(var(--text-muted))] mb-4">
        {icon || <SearchX size={24} />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-[rgb(var(--text-muted))] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}