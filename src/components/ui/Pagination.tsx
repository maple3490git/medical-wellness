"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  pageSize: number;
  current?: number;
  onChange?: (page: number) => void;
}

export default function Pagination({ total, pageSize, current = 1, onChange }: PaginationProps) {
  const [page, setPage] = useState(current);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const go = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    setPage(clamped);
    onChange?.(clamped);
  };

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== -1) pages.push(-1);
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <p className="text-xs text-[rgb(var(--text-muted))]">
        Page {page} sur {totalPages} · {total} éléments
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === -1 ? (
            <span key={i} className="px-1.5 text-[rgb(var(--text-muted))]">…</span>
          ) : (
            <button
              key={i}
              onClick={() => go(p)}
              className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                p === page
                  ? "bg-gold-400 text-noir-950 font-semibold"
                  : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}