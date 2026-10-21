import { getInitialsColor } from "@/lib/utils";
import type { ReactNode } from "react";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl";
  src?: string;
  status?: "active" | "absence" | "inactive" | boolean;
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

export default function Avatar({
  firstName,
  lastName,
  size = "md",
  src,
  status,
  className = "",
}: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={`${firstName} ${lastName}`}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full ${getInitialsColor(`${firstName}${lastName}`)} flex items-center justify-center font-semibold`}
        >
          {initials}
        </div>
      )}
      {status !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[rgb(var(--surface))] ${
            status === true || status === "active"
              ? "bg-emerald-500"
              : status === "absence"
                ? "bg-amber-500"
                : status === false || status === "inactive"
                  ? "bg-zinc-400"
                  : "bg-emerald-500"
          }`}
        />
      )}
    </div>
  );
}

export function ChatAvatar({ children }: { children: ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-noir-950 flex items-center justify-center text-sm font-bold shrink-0 uppercase">
      {children}
    </div>
  );
}