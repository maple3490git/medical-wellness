"use client";

import { useState } from "react";
import { Camera, CheckCircle2, ShieldCheck, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const facturesHistorique = [
  { n: "FACT-2026-0240", date: "2026-09-12", montant: 1450, statut: "paid" },
  { n: "FACT-2026-0234", date: "2026-09-05", montant: 680, statut: "paid" },
  { n: "FACT-2026-0229", date: "2026-08-28", montant: 1200, statut: "paid" },
];

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"profil" | "securite">("profil");

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in-up max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold">Mon profil</h1>
        <p className="text-sm text-[rgb(var(--text-muted))]">
          Vos informations personnelles et préférences de compte
        </p>
      </div>

      {/* Carte d'identité */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="xl" status={user.status === "active"} />
            <button
              onClick={() => showToast("Sélection de photo (démo).", "info")}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold-500 text-noir-950 flex items-center justify-center shadow"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <p className="font-display text-xl font-bold">{user.firstName} {user.lastName}</p>
              <Badge color="gold">{user.roleLabel}</Badge>
            </div>
            <p className="text-sm text-[rgb(var(--text-muted))]">{user.email}</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">{user.phone}</p>
            {user.department && (
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Département : {user.department}</p>
            )}
          </div>
          <Badge color={user.status === "active" ? "emerald" : "zinc"} dot>
            {user.status === "active" ? "En ligne" : "Désactivé"}
          </Badge>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1.5 overflow-x-auto">
        {(["profil", "securite"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`chip shrink-0 ${tab === t ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
          >
            {t === "profil" ? "Informations personnelles" : "Sécurité du compte"}
          </button>
        ))}
      </div>

      {tab === "profil" ? (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Prénom</label>
              <input className="input" defaultValue={user.firstName} />
            </div>
            <div>
              <label className="input-label">Nom</label>
              <input className="input" defaultValue={user.lastName} />
            </div>
            <div>
              <label className="input-label">E-mail</label>
              <input className="input" defaultValue={user.email} />
            </div>
            <div>
              <label className="input-label">Téléphone</label>
              <input className="input" defaultValue={user.phone} />
            </div>
            <div>
              <label className="input-label">Département</label>
              <input className="input" defaultValue={user.department ?? ""} />
            </div>
            <div>
              <label className="input-label">Date de naissance</label>
              <input type="date" className="input" defaultValue="1990-01-01" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => showToast("Profil mis à jour avec succès.", "success")} className="btn-gold">
              <Save size={15} /> Enregistrer les modifications
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="font-semibold">Mot de passe</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Changez votre mot de passe régulièrement</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="input-label">Mot de passe actuel</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="input-label">Nouveau mot de passe</label>
                <input type="password" className="input" placeholder="Min. 8 caractères" />
              </div>
              <div>
                <label className="input-label">Confirmer le nouveau mot de passe</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => showToast("Mot de passe modifié.", "success")} className="btn-gold">
                <CheckCircle2 size={15} /> Changer le mot de passe
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Authentification à deux facteurs (2FA)</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Sécurité renforcée à chaque connexion</p>
              </div>
              <button onClick={() => showToast("2FA activé (prototype).", "success")} className="chip bg-emerald-500 text-white">
                Activé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activité récente */}
      <div>
        <h2 className="font-display font-bold text-lg mb-3">Activité récente</h2>
        <div className="card overflow-hidden">
          {facturesHistorique.map((f) => (
            <div key={f.n} className="flex items-center justify-between px-5 py-3.5 border-b border-[rgb(var(--border))] last:border-none">
              <div>
                <p className="text-sm font-medium">{f.n}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Émise le {formatDate(f.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{f.montant.toLocaleString("fr-MA")} DH</p>
                <Badge color={f.statut === "paid" ? "emerald" : "amber"} dot>
                  {f.statut === "paid" ? "Payée" : "En attente"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-sm font-medium">
        Se déconnecter
      </button>
    </div>
  );
}