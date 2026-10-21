"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CalendarCheck2,
  ClipboardList,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { BUSINESS } from "@/lib/constants";
import { LOGIN_HINTS } from "@/data/users";
import type { Role } from "@/lib/types";
import { Moon, Sun } from "lucide-react";

function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-[440px] xl:w-[480px] shrink-0 p-10 text-ivory overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-noir-900 via-noir-950 to-noir-950" />
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-gold-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-gold-500/10 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center">
          <HeartPulse size={22} className="text-noir-950" />
        </div>
        <div>
          <p className="font-display font-bold text-lg tracking-wider">MEDICAL WELLNESS</p>
          <p className="text-xs text-gold-300/80">Bien-Être Médical de Luxe · Tanger</p>
        </div>
      </div>

      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-300 font-medium mb-3">Portail d'administration</p>
        <h1 className="font-display text-4xl xl:text-5xl font-semibold leading-[1.1]">
          La gestion de votre
          <br />
          centre, <span className="italic text-gold-300">sereinement.</span>
        </h1>
        <p className="mt-4 text-sm text-ivory/70 leading-relaxed max-w-sm">
          Patients, rendez-vous, prestations, caisse, facturation, stock et rapports — toute l'activité du centre réunie dans une seule interface.
        </p>

        <div className="mt-8 space-y-3">
          {[
            { icon: ClipboardList, text: "Fini le WhatsApp : vos prestations centralisées" },
            { icon: CalendarCheck2, text: "Planning et rendez-vous en temps réel" },
            { icon: ShieldCheck, text: "Accès sécurisé selon votre rôle" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-sm text-ivory/85">
              <span className="w-8 h-8 rounded-lg bg-gold-400/15 text-gold-300 flex items-center justify-center shrink-0">
                <f.icon size={15} />
              </span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-ivory/40">{BUSINESS.address} · {BUSINESS.phone}</p>
    </div>
  );
}

export default function LoginPage() {
  const { user, login, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Veuillez renseigner votre e-mail et votre mot de passe.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setError(res.error || "Erreur de connexion.");
        setLoading(false);
      }
    }, 500);
  };

  const fill = (account: { email: string; password: string; role: string }) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const quickLogin = (role: keyof typeof LOGIN_HINTS) => {
    const acc = LOGIN_HINTS[role];
    fill(acc);
    setTimeout(() => demoLogin(role as Role), 300);
  };

  return (
    <div className="min-h-screen flex bg-[rgb(var(--bg-app))]">
      <BrandPanel />

      {/* Form side */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-end p-5 gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-gold-500"
            title={theme === "light" ? "Mode sombre" : "Mode clair"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-16 sm:pb-10">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center">
                <HeartPulse size={26} className="text-noir-950" />
              </div>
              <p className="font-display font-bold text-xl tracking-wider mt-3">MEDICAL WELLNESS</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">Bien-Être Médical de Luxe · Tanger</p>
            </div>

            <div className="card p-6 sm:p-8 animate-fade-in-up">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-700 dark:text-gold-300 bg-gold-400/15 rounded-full px-2.5 py-1 mb-3">
                  <ShieldCheck size={12} />
                  Espace équipe
                </span>
                <h2 className="font-display text-2xl font-bold">Bon retour 👋</h2>
                <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
                  Connectez-vous avec votre e-mail professionnel.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="input-label">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@medical-wellness.ma"
                      autoComplete="username"
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="input-label !mb-0">Mot de passe</label>
                    <Link href="/forgot-password" className="text-xs font-medium text-gold-600 dark:text-gold-300 hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="input pl-10 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded accent-gold-500"
                  />
                  <span className="text-sm text-[rgb(var(--text-muted))]">Se souvenir de moi</span>
                </label>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-gold w-full !py-3 justify-center">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Se connecter"}
                  {!loading && <ChevronRight size={16} />}
                </button>
              </form>

              {/* Demo access */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px flex-1 bg-[rgb(var(--border))]" />
                  <span className="text-[10px] uppercase tracking-widest text-[rgb(var(--text-muted))] font-medium">
                    Accès démo
                  </span>
                  <span className="h-px flex-1 bg-[rgb(var(--border))]" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["admin", "Admin"],
                      ["directeur", "Directeur"],
                      ["comptabilite", "Compta"],
                      ["reception", "Réception"],
                      ["medecin", "Médecin"],
                      ["employe", "Employé"],
                    ] as [keyof typeof LOGIN_HINTS, string][]
                  ).map(([role, label]) => (
                    <button
                      key={role}
                      onClick={() => quickLogin(role)}
                      className="px-2 py-2 rounded-xl border border-[rgb(var(--border))] text-xs font-medium text-[rgb(var(--text-muted))] hover:border-gold-400 hover:text-gold-600 dark:hover:text-gold-300 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[rgb(var(--text-muted))] mt-3 text-center">
                  Cliquez sur un rôle pour vous connecter instantanément en démo.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-[rgb(var(--text-muted))] mt-6">
              © 2026 {BUSINESS.name} · {BUSINESS.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}