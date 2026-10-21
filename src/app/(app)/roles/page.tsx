"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Plus, Users, Lock, CheckCircle2 } from "lucide-react";
import { roles } from "@/data/roles";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";

const groups: { label: string; regex: RegExp }[] = [
  { label: "Tableau de bord", regex: /^dashboard/ },
  { label: "Patients", regex: /^patients/ },
  { label: "Rendez-vous", regex: /^appointments/ },
  { label: "Prestations", regex: /^prestations/ },
  { label: "Caisse", regex: /^caisse/ },
  { label: "Facturation & paiements", regex: /^(invoices|payments)/ },
  { label: "Stock & fournisseurs", regex: /^(stock|suppliers)/ },
  { label: "Analyses", regex: /^analyses/ },
  { label: "Documents", regex: /^documents/ },
  { label: "Notes internes", regex: /^notes/ },
  { label: "Rapports", regex: /^reports/ },
  { label: "Utilisateurs & rôles", regex: /^(users|roles)/ },
  { label: "Paramètres & audit", regex: /^(settings|audit)/ },
  { label: "Notifications", regex: /^notifications/ },
];

const permLabels: Record<string, string> = {
  view: "Consulter",
  create: "Créer",
  edit: "Modifier",
  delete: "Supprimer",
  export: "Exporter",
  transact: "Encaisser",
  close: "Clôturer caisse",
  refund: "Rembourser",
  print: "Imprimer",
  upload: "Importer",
  send: "Envoyer",
  manage: "Gérer",
};

export default function RolesPage() {
  const { showToast } = useToast();
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const current = roles.find((r) => r.id === openRole) ?? null;

  const grouped = useMemo(() => {
    if (!current) return [];
    return groups
      .map((g) => ({
        label: g.label,
        perms: current.permissions.filter((p) => g.regex.test(p)),
      }))
      .filter((g) => g.perms.length > 0);
  }, [current]);

  const pretty = (p: string) => {
    const [, action] = p.split(".");
    return permLabels[action] ?? action;
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Rôles & permissions" subtitle={`${roles.length} rôles · Contrôle d'accès basé sur les permissions`}>
<button onClick={() => setOpenNew(true)} className="btn-gold">
          <Plus size={15} /> Créer un rôle
        </button>
</PageHeader>

      {/* Cartes rôles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => {
          const memberCount = 1;
          return (
            <button
              key={r.id}
              onClick={() => setOpenRole(r.id)}
              className="card p-5 text-left hover:border-gold-400/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className={`w-10 h-10 rounded-xl ${r.color} text-white flex items-center justify-center`}>
                  <ShieldCheck size={18} />
                </span>
                <Badge color={r.isCustom ? "amber" : "zinc"}>{r.isCustom ? "Personnalisé" : "Système"}</Badge>
              </div>
              <p className="font-display font-bold text-lg mt-3">{r.label}</p>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1 leading-relaxed">{r.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgb(var(--border))] text-xs text-[rgb(var(--text-muted))]">
                <span>{r.permissions.length} permissions</span>
                <span className="inline-flex items-center gap-1 text-gold-600 dark:text-gold-300 font-medium">
                  <Users size={12} /> {memberCount} membre{r.permissions.length > 1 ? "s" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Détail rôle */}
      <Modal
        open={Boolean(current)}
        onClose={() => setOpenRole(null)}
        title={current ? current.label : ""}
        subtitle={current ? current.description : ""}
        size="xl"
        footer={
          <>
            <button onClick={() => setOpenRole(null)} className="btn-outline">Fermer</button>
            <button onClick={() => setOpenRole(null)} className="btn-outline">
              <Lock size={15} /> Dupliquer
            </button>
            <button onClick={() => { setOpenRole(null); showToast("Permissions mises à jour.", "success"); }} className="btn-gold">
              <CheckCircle2 size={15} /> Enregistrer
            </button>
          </>
        }
      >
        {current && (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {grouped.map((g) => (
              <div key={g.label} className="rounded-xl border border-[rgb(var(--border))] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-300 mb-2.5">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {g.perms.map((p) => (
                    <label key={p} className="flex items-center gap-1.5 chip border border-[rgb(var(--border))] cursor-pointer hover:border-gold-400">
                      <input type="checkbox" defaultChecked className="accent-[#d4af37] w-3.5 h-3.5" />
                      <span>{pretty(p)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="text-sm text-[rgb(var(--text-muted))]">Aucune permission pour ce rôle.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Nouveau rôle */}
      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="Créer un rôle personnalisé"
        subtitle="Copiez un rôle existant comme point de départ."
        footer={
          <>
            <button onClick={() => setOpenNew(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenNew(false); showToast("Rôle personnalisé créé.", "success"); }} className="btn-gold">
              <Plus size={15} /> Créer le rôle
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">Nom du rôle *</label>
            <input className="input" placeholder="Ex : Réceptionniste senior" />
          </div>
          <div>
            <label className="input-label">Basé sur (modèle)</label>
            <select className="input">
              {roles.map((r) => <option key={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea rows={2} className="input resize-none" placeholder="Décrivez le périmètre de ce rôle..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}