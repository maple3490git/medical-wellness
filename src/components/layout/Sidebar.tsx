"use client";

import { useMemo, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronLeft,
  HeartPulse,
  LogOut,
  UserRound,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getRolePermissions } from "@/data/roles";
import { navForPermissions, SECTIONS } from "@/lib/navigation";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/context/ToastContext";

const icons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Users, CalendarDays, Stethoscope, UserCog, ClipboardList,
  HandCoins, Receipt, CreditCard, Package, Truck, FlaskConical, FolderOpen,
  StickyNote, BarChart3, Bell, ShieldCheck, Settings, KeyRound, History,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, onNavigate, mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();
  const { showToast } = useToast();

  if (!user) return null;

  const perms = user.role === "admin" ? [] : getRolePermissions(user.role);
  const filtered = navForPermissions(perms, user.role === "admin");
  const sections = SECTIONS.map((s) => ({
    ...s,
    items: filtered.filter(({ item }) => item.section === s.id),
  })).filter((s) => s.items.length > 0);

  const handleLogout = () => {
    logout();
    showToast("Vous avez été déconnecté.", "success");
  };

  return (
    <>
      {/* Desktop sidebar / Mobile drawer */}
      <aside
        className={`${
          mobile ? "flex w-[280px]" : `hidden lg:flex fixed ${collapsed ? "w-[76px]" : "w-[264px]"}`
        } flex-col shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))] transition-all duration-300 inset-y-0 left-0 z-40`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-[rgb(var(--border))] ${collapsed ? "justify-center px-2" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center shrink-0">
            <HeartPulse size={18} className="text-noir-950" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display font-bold text-sm leading-tight tracking-wide">
                MEDICAL WELLNESS
              </p>
              <p className="text-[10px] text-gold-600 dark:text-gold-300 font-medium">
                Administration
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.id}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--text-muted))]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ item, index }) => {
                  const Icon = icons[item.icon] || LayoutGrid;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.name : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-gold-400/15 text-gold-700 dark:text-gold-300"
                          : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))] hover:text-[rgb(var(--text))]"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gold-500" />
                      )}
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                      {collapsed && active && <span className="sr-only">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse + user */}
        <div className="border-t border-[rgb(var(--border))] p-3 space-y-2">
          {!collapsed && !mobile && (
            <button
              onClick={onToggle}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]"
            >
              <ChevronLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              Réduire le menu
            </button>
          )}
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""} rounded-xl p-2 hover:bg-[rgb(var(--surface-soft))] transition-colors`}>
            <Link href="/profil" className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar firstName={user.firstName} lastName={user.lastName} size="md" status={user.status === "active"} />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] text-[rgb(var(--text-muted))] truncate">{user.roleLabel}</p>
                </div>
              )}
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/profil"
                onClick={onNavigate}
                title="Profil"
                className={`p-2 rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-soft))] ${collapsed ? "-mt-8" : ""}`}
              >
                <UserRound size={15} />
              </Link>
              <button
                onClick={handleLogout}
                title="Déconnexion"
                className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}