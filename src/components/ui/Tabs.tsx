"use client";

import type { ReactNode } from "react";

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex gap-1 p-1 rounded-xl bg-[rgb(var(--surface-soft))] w-fit max-w-full overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
            active === tab.id
              ? "bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm"
              : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active === tab.id ? "bg-gold-400/20 text-gold-700 dark:text-gold-300" : "bg-[rgb(var(--border))]"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}