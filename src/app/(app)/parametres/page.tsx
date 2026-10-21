"use client";

import { useState } from "react";
import {
  Building2,
  Briefcase,
  BellRing,
  Palette,
  Lock,
  CheckCircle2,
  FileWarning,
  Store,
} from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";

const tabs = [
  { id: "etablissement", label: "Établissement", icon: <Building2 size={15} /> },
  { id: "activite", label: "Activité", icon: <Briefcase size={15} /> },
  { id: "notifications", label: "Notifications", icon: <BellRing size={15} /> },
  { id: "apparence", label: "Apparence", icon: <Palette size={15} /> },
  { id: "securite", label: "Sécurité", icon: <Lock size={15} /> },
  { id: "conformite", label: "Conformité", icon: <FileWarning size={15} /> },
];

export default function ParametresPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("etablissement");

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Paramètres" subtitle={`Configuration générale du logiciel · ${BUSINESS.name}`}>
<button onClick={() => showToast("Paramètres enregistrés avec succès.", "success")} className="btn-gold">
          <CheckCircle2 size={15} /> Enregistrer
        </button>
</PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Onglets */}
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-gold-400/15 text-gold-700 dark:text-gold-300"
                  : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="lg:col-span-3 card p-6 space-y-5">
          {tab === "etablissement" && (
            <>
              <SectionTitle title="Identité de l'établissement" subtitle="Visible sur les factures, devis et documents officiels." />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center shrink-0">
                  <Store size={26} className="text-noir-950" />
                </div>
                <button onClick={() => showToast("Sélection de logo (démo).", "info")} className="btn-outline !py-2 text-xs">
                  Changer le logo
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom de l'établissement" defaultValue={BUSINESS.name} />
                <Field label="Slogan" defaultValue="Là où la Science Rencontre la Sérénité" />
                <div className="sm:col-span-2"><Field label="Adresse" defaultValue={BUSINESS.address} /></div>
                <Field label="Téléphone" defaultValue={BUSINESS.phone} />
                <Field label="E-mail de contact" defaultValue="contact@medical-wellness.ma" />
                <Field label="Horaires d'ouverture" defaultValue="Lun – Sam : 9h00 – 20h00" />
                <Field label="Taux TVA (%)" defaultValue="20" type="number" />
              </div>
            </>
          )}

          {tab === "activite" && (
            <>
              <SectionTitle title="Configuration de l'activité" subtitle="Services proposés, numérotations et préférences métier." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Préfixe factures" defaultValue="FACT-2026" />
                <Field label="Préfixe prestations" defaultValue="PREST-2026" />
                <Field label="Monnaie par défaut" defaultValue="Dirham marocain (DH)" />
                <Field label="Délai de paiement (jours)" defaultValue="15" type="number" />
              </div>
              <ToggleRow label="Numérotation automatique des documents" defaultChecked />
              <ToggleRow label="Validation obligatoire des prestations" defaultChecked />
              <ToggleRow label="Rappel automatique des rendez-vous (SMS)" defaultChecked />
              <ToggleRow label="Facturation des abonnements au 1er du mois" />
            </>
          )}

          {tab === "notifications" && (
            <>
              <SectionTitle title="Préférences de notifications" subtitle="Choisissez comment votre équipe est alertée." />
              <ToggleRow label="Notifications des nouvelles prestations" defaultChecked />
              <ToggleRow label="Alertes stock bas" defaultChecked />
              <ToggleRow label="Notification des impayés (J+2)" defaultChecked />
              <ToggleRow label="Synthèse hebdomadaire par e-mail" />
              <ToggleRow label="Rappel des rendez-vous du jour (9h)" defaultChecked />
              <div className="pt-3 border-t border-[rgb(var(--border))]">
                <label className="input-label">E-mail de réception des alertes</label>
                <input className="input" defaultValue="direction@medical-wellness.ma" />
              </div>
            </>
          )}

          {tab === "apparence" && (
            <>
              <SectionTitle title="Apparence" subtitle="Thème, langue et fuseau du compte." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "Clair", desc: "Ivoire & or", cls: "bg-[#fdf8e8] border-gold-400" },
                  { name: "Sombre", desc: "Noir & or", cls: "bg-[#1a1813] border-gold-400" },
                  { name: "Automatique", desc: "Suit l'appareil", cls: "bg-gradient-to-br from-[#fdf8e8] to-[#1a1813] border-gold-400" },
                ].map((o) => (
                  <button key={o.name} onClick={() => showToast(`Thème «${o.name}» sélectionné (prototype).`, "info")} className={`rounded-xl p-4 text-left border-2 ${o.cls} ${tab === "apparence" && o.name === "Clair" ? "ring-2 ring-gold-400" : "border-[rgb(var(--border))]"}`}>
                    <div className="mt-2">
                      <p className="text-sm font-semibold">{o.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{o.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Field label="Langue de l'interface" defaultValue="Français (FR)" />
                <Field label="Fuseau horaire" defaultValue="Afrique/Casablanca (GMT+1)" />
              </div>
            </>
          )}

          {tab === "securite" && (
            <>
              <SectionTitle title="Sécurité du compte" subtitle="Protégez l'accès à votre espace d'administration." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="E-mail administrateur" defaultValue="admin@medical-wellness.ma" />
                <Field label="Téléphone administrateur" defaultValue="+212 600 00 00 00" />
              </div>
              <ToggleRow label="Authentification à deux facteurs (2FA)" defaultChecked />
              <ToggleRow label="Expiration de session après inactivité (15 min)" defaultChecked />
              <ToggleRow label="Connexions simultanées interdites" />
              <div className="pt-2">
                <button onClick={() => showToast("Invitation de mot de passe envoyée (démo).", "info")} className="btn-outline !py-2 text-xs">
                  Réinitialiser le mot de passe du compte courant
                </button>
              </div>
            </>
          )}

          {tab === "conformite" && (
            <>
              <SectionTitle title="Conformité & traçabilité" subtitle="RGPD / Loi 09-08 marocaine, rétention et audit." />
              <ToggleRow label="Conservation des journaux d'audit (5 ans)" defaultChecked />
              <ToggleRow label="Journalisation automatique des connexions" defaultChecked />
              <ToggleRow label="Anonymisation après clôture du dossier" defaultChecked />
              <ToggleRow label="Consentement patient obligatoire (documents)" defaultChecked />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Field label="Durée de rétention des dossiers (mois)" defaultValue="60" type="number" />
                <Field label="Délégué à la protection des données" defaultValue="Dr. Mehdi Mernissi" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display font-bold text-lg">{title}</h2>
      <p className="text-xs text-[rgb(var(--text-muted))]">{subtitle}</p>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <input type={type} defaultValue={defaultValue} className="input" />
    </div>
  );
}

function ToggleRow({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2.5 border-b border-[rgb(var(--border))] last:border-none cursor-pointer">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-[rgb(var(--surface-soft))] text-gold-600 dark:text-gold-300 flex items-center justify-center">
          <CheckCircle2 size={14} />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-[#d4af37] w-5 h-5" />
    </label>
  );
}