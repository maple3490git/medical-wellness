"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import type { ReactNode } from "react";

interface FieldProps {
  label?: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, icon, hint, error, className = "", ...props }, ref) => (
  <div className="w-full">
    {label && <label className="input-label">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] flex">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`input ${icon ? "pl-10" : ""} ${error ? "border-red-500 focus:ring-red-500/40" : ""} ${className}`}
        {...props}
      />
    </div>
    {hint && !error && <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
));
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & FieldProps
>(({ label, icon, hint, error, className = "", children, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="input-label">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] flex">
          {icon}
        </span>
      )}
      <select
        ref={ref}
        className={`input ${icon ? "pl-10" : ""} appearance-none cursor-pointer ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
    {hint && !error && <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
));
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, hint, error, className = "", ...props }, ref) => (
  <div className="w-full">
    {label && <label className="input-label">{label}</label>}
    <textarea ref={ref} className={`input min-h-[90px] resize-y ${error ? "border-red-500" : ""} ${className}`} {...props} />
    {hint && !error && <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";