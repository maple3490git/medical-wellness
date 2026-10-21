"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-noir-950/50 backdrop-blur-sm animate-scale-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-[rgb(var(--surface))] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[rgb(var(--border))] animate-fade-in-up max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-[rgb(var(--border))] shrink-0">
          <div>
            {title && <h3 className="font-display text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))] hover:text-[rgb(var(--text))] -mr-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto grow">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[rgb(var(--border))] flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}