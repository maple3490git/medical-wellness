"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Plus,
  HeartPulse,
  ChevronDown,
  UserRound,
  LogOut,
  ClipboardList,
  Users,
  CalendarDays,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { notifications } from "@/data/extras";
import Avatar from "@/components/ui/Avatar";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    showToast("Vous avez été déconnecté.", "success");
    router.push("/login");
  };

  const quickActions = [
    { label: "Nouvelle prestation", href: "/prestations", icon: ClipboardList },
    { label: "Nouveau patient", href: "/patients", icon: Users },
    { label: "Nouveau rendez-vous", href: "/rendez-vous", icon: CalendarDays },
    { label: "Encaissement", href: "/caisse", icon: Plus },
  ];

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/patients?q=${encodeURIComponent(q)}`);
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 px-4 sm:px-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-app))]/85 backdrop-blur-md">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))] -ml-1"
      >
        <Menu size={21} />
      </button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center">
          <HeartPulse size={15} className="text-noir-950" />
        </div>
        <span className="font-display font-bold text-sm tracking-wide">MEDICAL WELLNESS</span>
      </Link>

      {/* Search */}
      <form
        onSubmit={submitSearch}
        className={`${searchOpen ? "flex" : "hidden md:flex"} items-center flex-1 max-w-xl ml-2`}
      >
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un patient, rendez-vous, facture..."
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] pl-10 pr-4 py-2.5 text-sm placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
          />
        </div>
      </form>

      <button
        onClick={() => setSearchOpen((o) => !o)}
        className="md:hidden p-2 rounded-xl text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))] ml-auto"
      >
        <Search size={19} />
      </button>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto md:ml-0">
        {/* Quick action */}
        <Dropdown
          trigger={
            <span className="hidden sm:inline-flex items-center gap-2 bg-gold-400 text-noir-950 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gold-300 transition-all">
              <Plus size={16} />
              Action rapide
            </span>
          }
          width="w-60"
        >
          {(close) => (
            <>
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <DropdownItem
                    key={a.href}
                    onClick={() => {
                      close();
                      router.push(a.href);
                    }}
                  >
                    <Icon size={16} />
                    {a.label}
                  </DropdownItem>
                );
              })}
            </>
          )}
        </Dropdown>

        <button
          onClick={toggleTheme}
          className="relative w-10 h-10 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-gold-500 transition-all shrink-0"
          title={theme === "light" ? "Mode sombre" : "Mode clair"}
        >
          <span className="transition-all duration-200 absolute">{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</span>
        </button>

        {/* Notifications */}
        <Dropdown
          trigger={
            <span className="relative p-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-all shrink-0 inline-flex">
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </span>
          }
          width="w-80"
        >
          {() => (
            <>
              <div className="px-4 py-2 border-b border-[rgb(var(--border))] flex items-center justify-between">
                <p className="text-sm font-semibold">Notifications</p>
                <Link href="/notifications" className="text-xs text-gold-600 dark:text-gold-300 font-medium">
                  Tout voir
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <Link
                    key={n.id}
                    href="/notifications"
                    className={`block px-4 py-3 border-b border-[rgb(var(--border))] last:border-0 hover:bg-[rgb(var(--surface-soft))] ${!n.read ? "bg-gold-400/[0.04]" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? "bg-transparent" : "bg-gold-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))] line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Dropdown>

        {/* Profile */}
        <Dropdown
          trigger={
            <span className="inline-flex items-center gap-2 p-1 rounded-xl hover:bg-[rgb(var(--surface-soft))] transition-all">
              <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" status={user.status === "active"} />
              <span className="hidden sm:block text-left">
                <span className="block text-sm font-semibold leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block text-[10px] text-[rgb(var(--text-muted))] leading-tight">
                  {user.roleLabel}
                </span>
              </span>
              <ChevronDown size={14} className="hidden sm:block text-[rgb(var(--text-muted))]" />
            </span>
          }
          width="w-60"
        >
          {(close) => (
            <>
              <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{user.email}</p>
              </div>
              <DropdownItem
                onClick={() => {
                  close();
                  router.push("/profil");
                }}
              >
                <UserRound size={16} />
                Mon profil
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  router.push("/parametres");
                }}
              >
                <Settings size={16} />
                Paramètres
              </DropdownItem>
              <div className="my-1 border-t border-[rgb(var(--border))]" />
              <DropdownItem onClick={handleLogout} className="!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20">
                <LogOut size={16} />
                Déconnexion
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}