"use client";

import Link from "next/link";
import { type ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  UserCog,
  ClipboardList,
  HandCoins,
  Receipt,
  CreditCard,
  Package,
  Truck,
  FlaskConical,
  FolderOpen,
  StickyNote,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  KeyRound,
  History,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getRolePermissions } from "@/data/roles";
import { ALL_NAV, SECTIONS } from "@/lib/navigation";

const icons: Record<string, ComponentType<{ size?: number }>> = {
  LayoutDashboard, Users, CalendarDays, Stethoscope, UserCog, ClipboardList,
  HandCoins, Receipt, CreditCard, Package, Truck, FlaskConical, FolderOpen,
  StickyNote, BarChart3, Bell, ShieldCheck, Settings, KeyRound, History,
};

export default function PlusPage() {
  const { user } = useAuth();
  if (!user) return null;

  const perms = user.role === "admin" ? [] : getRolePermissions(user.role);
  const filtered = ALL_NAV.filter(
    (item) => user.role === "admin" || item.permissions.some((p) => perms.includes(p))
  );

  const sections = SECTIONS.map((s) => ({
    ...s,
    items: filtered.filter((item) => item.section === s.id),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="p-4 pb-10 space-y-5 animate-fade-in-up lg:hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center">
          <HeartPulse size={20} className="text-noir-950" />
        </div>
        <div>
          <p className="font-display font-bold">Tous les modules</p>
          <p className="text-xs text-[rgb(var(--text-muted))]">Accès rapide à l'administration</p>
        </div>
      </div>

      {sections.map((s) => (
        <div key={s.id}>
          <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--text-muted))]">{s.label}</p>
          <div className="grid grid-cols-3 gap-2.5">
            {s.items.map((item) => {
              const Icon = icons[item.icon] ?? LayoutDashboard;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card p-3.5 flex flex-col items-center gap-2 text-center hover:border-gold-400/60"
                >
                  <span className="w-9 h-9 rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                    <Icon size={16} />
                  </span>
                  <span className="text-[11px] font-medium leading-tight">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <Link href="/profil" className="card p-4 flex items-center justify-center text-sm text-[rgb(var(--text-muted))] hover:border-gold-400/60">
        Mon profil
      </Link>
    </div>
  );
}