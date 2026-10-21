"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "gold" | "dark" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "icon";
}

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  icon: "p-2.5 rounded-xl",
};

const variants: Record<ButtonVariant, string> = {
  gold: "bg-gold-400 text-noir-950 hover:bg-gold-300 font-semibold shadow-gold",
  dark: "bg-noir-900 text-white hover:bg-noir-800 font-semibold dark:bg-noir-100 dark:text-noir-950 dark:hover:bg-white",
  outline: "border border-[rgb(var(--border))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-soft))]",
  ghost: "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-soft))]",
  danger: "bg-red-600 text-white hover:bg-red-500 font-semibold",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "gold", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = "Button";

export default Button;