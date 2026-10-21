"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType } from "react";
import { Home, CalendarDays, Users, HandCoins, LayoutGrid, ClipboardList, X, UserRound, Settings, LogOut, Receipt, CreditCard, Package, Truck, FlaskConical, FolderOpen, StickyNote, BarChart3, Bell, ShieldCheck, Stethoscope, UserCog } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { navForPermissions } from "@/lib/navigation";
import { getRolePermissions } from "@/data/roles";
import { useToast } from "@/context/ToastContext";

const primaryTabs = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "RDV", href: "/rendez-vous", icon: CalendarDays },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Caisse", href: "/caisse", icon: HandCoins },
  { label: "Menu", href: "", icon: LayoutGrid, isMenu: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const perms = user.role === "admin" ? [] : getRolePermissions(user.role);
  const items = navForPermissions(perms, user.role === "admin").map(({ item }) => item);

  // For employees, primary tabs should center on prestations
  const primary = user.role === "employe"
    ? [
        { label: "Saisie", href: "/prestations", icon: ClipboardList },
        { label: "Mes paiements", href: "/prestations", icon: HandCoins },
        { label: "Menu", href: "", icon: LayoutGrid, isMenu: true },
      ]
    : primaryTabs;

  const allLinks = items.map((i) => ({
    label: i.name,
    href: i.href,
    icon: i.icon,
  }));

  const menuLinks = [
    ...allLinks,
  ];

  const handleLogout = () => {
    logout();
    showToast("Vous avez été déconnecté.", "success");
    router.push("/login");
  };

  return (
    <>
      {/* Desktop fallback: hide */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {primary.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.isMenu) {
                    setMenuOpen(true);
                  } else {
                    router.push(tab.href);
                  }
                }}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 ${
                  !tab.isMenu && isActive(tab.href)
                    ? "text-gold-600 dark:text-gold-300"
                    : "text-[rgb(var(--text-muted))]"
                }`}
              >
                <span className="relative">
                  <Icon size={20} />
                  {!tab.isMenu && isActive(tab.href) && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-500" />
                  )}
                </span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Full menu sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div className="absolute inset-0 bg-noir-950/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-[rgb(var(--surface))] rounded-t-3xl animate-fade-in-up max-h-[80vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="sticky top-0 bg-[rgb(var(--surface))] px-5 py-4 border-b border-[rgb(var(--border))] flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center">
                  <Home size={16} className="text-noir-950" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">MEDICAL WELLNESS</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{user.roleLabel}</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg text-[rgb(var(--text-muted))]">
                <X size={20} />
              </button>
            </div>

            <div className="p-3">
              {menuLinks.map((l) => {
                const Icon = (() => {
                  const map: Record<string, ComponentType<{ size?: number }>> = {
                    LayoutDashboard: Home,
                    Users,
                    CalendarDays,
                    HandCoins,
                    ClipboardList,
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
                    Stethoscope,
                    UserCog,
                  };
                  return map[l.icon] || Home;
                })();
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(l.href)
                        ? "bg-gold-400/15 text-gold-700 dark:text-gold-300"
                        : "text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-soft))]"
                    }`}
                  >
                    <Icon size={18} />
                    {l.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-[rgb(var(--border))]" />
              <Link
                href="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-[rgb(var(--surface-soft))]"
              >
                <UserRound size={18} />
                Mon profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}