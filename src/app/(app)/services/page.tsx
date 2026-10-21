"use client";

import { useMemo, useState } from "react";
import { Stethoscope, Plus, Pencil, Clock, Users, Percent, Coins } from "lucide-react";
import { services } from "@/data/services";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { employees } from "@/data/personnel";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function ServicesPage() {
  const { showToast } = useToast();
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = services.filter((s) => s.active);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    if (category !== "Tous") list = list.filter((s) => s.category === category);
    return list;
  }, [category, search]);

  const totalServices = services.filter((s) => s.active).length;
  const avgPrice = Math.round(services.filter((s) => s.active).reduce((sum, s) => sum + s.price, 0) / totalServices);
  const minPrice = Math.min(...services.map((s) => s.price));
  const maxPrice = Math.max(...services.map((s) => s.price));

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Services" subtitle={`${services.length} services au catalogue · Tarifs en DH`}>
<button onClick={() => setOpenAdd(true)} className="btn-gold">
          <Plus size={16} /> Nouveau service
        </button>
</PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Services actifs</p>
          <p className="font-display text-xl font-bold">{totalServices}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Prix moyen</p>
          <p className="font-display text-xl font-bold">{formatCurrency(avgPrice)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Tarif min – max</p>
          <p className="font-display text-base font-bold mt-1">{formatCurrency(minPrice)} – {formatCurrency(maxPrice)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Catégories</p>
          <p className="font-display text-xl font-bold">{SERVICE_CATEGORIES.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un service..." />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["Tous", ...SERVICE_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip shrink-0 ${category === c ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid services */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const staff = employees.filter((e) => e.serviceId === s.id || e.services.includes(s.name));
          return (
            <div key={s.id} className="card p-5 flex flex-col hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center shrink-0">
                  <Stethoscope size={20} className="text-noir-950" />
                </span>
                <Badge color="zinc">{s.code}</Badge>
              </div>
              <h3 className="font-display text-lg font-semibold mt-3">{s.name}</h3>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1 flex-1">{s.description}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-[rgb(var(--text-muted))]">
                  <Clock size={13} /> {s.durationLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[rgb(var(--text-muted))]">
                  <Users size={13} /> {staff.length} prestataire{staff.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--border))]">
                <div>
                  <p className="text-[11px] text-[rgb(var(--text-muted))]">Tarif</p>
                  <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">{formatCurrency(s.price)}</p>
                </div>
                <button onClick={() => setEditId(s.id)} className="btn-ghost !px-3 !py-2">
                  <Pencil size={14} /> Modifier
                </button>
              </div>

              {staff.length > 0 && (
                <div className="flex items-center gap-1.5 mt-4 -space-x-2">
                  {staff.slice(0, 4).map((e) => (
                    <Avatar key={e.id} firstName={e.firstName} lastName={e.lastName} size="sm" className="ring-2 ring-[rgb(var(--surface))]" />
                  ))}
                  {staff.length > 4 && (
                    <span className="w-8 h-8 rounded-full bg-[rgb(var(--surface-soft))] flex items-center justify-center text-[10px] font-semibold ring-2 ring-[rgb(var(--surface))]">
                      +{staff.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Nouveau service"
        subtitle="Ajouter une offre au catalogue."
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Service créé avec succès.", "success"); }} className="btn-gold">
              <Plus size={15} /> Créer le service
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Nom du service *</label>
            <input className="input" placeholder="Ex : Oxygénothérapie" />
          </div>
          <div>
            <label className="input-label">Catégorie</label>
            <select className="input">
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Durée</label>
            <select className="input">
              <option>30 min</option>
              <option>45 min</option>
              <option selected>1h</option>
              <option>1h30</option>
              <option>2h</option>
            </select>
          </div>
          <div>
            <label className="input-label">Tarif (DH) *</label>
            <input type="number" className="input" placeholder="Ex : 450" />
          </div>
          <div>
            <label className="input-label">Code métier</label>
            <input className="input" placeholder="Ex : OXYG-ACC" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Description</label>
            <textarea className="input min-h-[60px]" placeholder="Prestation incluse, objectifs, précautions..." />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2.5">
            <input type="checkbox" className="w-4 h-4 accent-gold-500" defaultChecked />
            <span className="text-sm">Service actif et visible à la prise de rendez-vous</span>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={Boolean(editId)}
        onClose={() => setEditId(null)}
        title="Modifier le service"
        subtitle={services.find((s) => s.id === editId)?.name}
        footer={
          <>
            <button onClick={() => setEditId(null)} className="btn-outline">Annuler</button>
            <button onClick={() => { setEditId(null); showToast("Service mis à jour.", "success"); }} className="btn-gold">
              <Pencil size={15} /> Enregistrer
            </button>
          </>
        }
      >
        <p className="text-sm text-[rgb(var(--text-muted))]">
          Modification du tarif, de la durée et de la description de ce service. (Formulaire complet en démo.)
        </p>
      </Modal>
    </div>
  );
}