"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  width?: string;
}

export default function Dropdown({ trigger, children, align = "right", width = "w-56" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 ${width} bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl shadow-lg shadow-noir-950/10 z-50 py-1.5 animate-scale-in overflow-hidden`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2 text-sm flex items-center gap-2.5 hover:bg-[rgb(var(--surface-soft))] ${
        danger ? "text-rose-500" : "text-[rgb(var(--text))]"
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownTrigger({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2">{children}</span>;
}

export { ChevronDown };