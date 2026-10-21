import type { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
  empty?: ReactNode;
  className?: string;
}

export default function Table({ headers, children, empty, className = "" }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-[rgb(var(--border))]">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`text-left font-medium text-xs uppercase tracking-wider text-[rgb(var(--text-muted))] px-4 py-3 ${i === 0 ? "pl-5" : ""} ${i === headers.length - 1 ? "pr-5 text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--border))]">{children}</tbody>
      </table>
      {empty && <div className="py-8">{empty}</div>}
    </div>
  );
}

export function TableRow({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-[rgb(var(--surface-soft))] transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = "", align = "left" }: { children?: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return (
    <td className={`px-4 py-3 text-[rgb(var(--text))] ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}