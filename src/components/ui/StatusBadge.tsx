import { STATUS } from "@/lib/constants";
import Badge from "./Badge";

interface StatusBadgeProps {
  module: "appointment" | "payment" | "invoice" | "employee" | "stock" | "prestation";
  status: string;
}

const colorMap: Record<string, "emerald" | "amber" | "sky" | "rose" | "zinc" | "gold" | "violet" | "indigo" | "cyan" | "teal"> = {
  emerald: "emerald",
  amber: "amber",
  sky: "sky",
  rose: "rose",
  zinc: "zinc",
  gold: "gold",
  violet: "violet",
  indigo: "indigo",
  cyan: "cyan",
  teal: "teal",
};

export default function StatusBadge({ module, status }: StatusBadgeProps) {
  const group = STATUS[module] as Record<string, { label: string; color: string }> | undefined;
  const config = group?.[status];
  if (!config) return <Badge color="zinc">{status}</Badge>;

  const color = colorMap[config.color] ?? "zinc";
  return (
    <Badge color={color} dot>
      {config.label}
    </Badge>
  );
}