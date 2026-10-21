"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  UserCog,
  Plus,
  
  Phone,
  Mail,
  ChevronRight,
  CalendarRange,
  Clock,
  Filter,
} from "lucide-react";
import { employees } from "@/data/personnel";
import { getService } from "@/data/services";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { getDayName } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function PersonnelPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("Tous");
  const [status, setStatus] = useState("Tous");
  const [openAdd, setOpenAdd] = useState(false);
  const [planningId, setPlanningId] = useState<string | null>(null);

  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))), []);

  const filtered = useMemo(() => {
    let list = [...employees];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((e) => `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
    if (dept !== "Tous") list = list.filter((e) => e.department === dept);
    if (status !== "Tous") list = list.filter((e) => e.status === status);
    return list;
  }, [search, dept, status]);

  const planningEmployee = employees.find((e) => e.id === planningId);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Personnel" subtitle={`${employees.length} membres · Horaires et planning`}>
<button onClick={() => setOpenAdd(true)} className="btn-gold">
          <Plus size={16} /> Nouveau membre
        </button>
</PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Présents aujourd'hui</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {employees.filter((e) => e.status === "active").length + 2}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">En absence</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">
            {employees.filter((e) => e.status === "absence").length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Départements</p>
          <p className="font-display text-xl font-bold">{departments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Ouverture</p>
          <p className="font-display text-base font-bold mt-1">9h00 – 20h00</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un membre..." />
        <div className="flex flex-wrap gap-2">
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="input !w-auto !py-2.5">
            <option value="Tous">Tous les départements</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto !py-2.5">
            <option value="Tous">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="absence">En absence</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((e) => {
          const service = e.serviceId ? getService(e.serviceId) : undefined;
          return (
            <div key={e.id} className="card p-5 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar firstName={e.firstName} lastName={e.lastName} size="xl" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[rgb(var(--surface))] ${
                      e.status === "active" ? "bg-emerald-500" : e.status === "absence" ? "bg-amber-500" : "bg-zinc-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base truncate">{e.firstName} {e.lastName}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] truncate">{e.role}</p>
                  <p className="text-[11px] text-gold-600 dark:text-gold-300 mt-0.5">{e.department}</p>
                </div>
                <Badge color={e.status === "active" ? "emerald" : e.status === "absence" ? "amber" : "zinc"} dot>
                  {e.status === "active" ? "Actif" : e.status === "absence" ? "Absence" : "Inactif"}
                </Badge>
              </div>

              <div className="mt-3 flex flex-col gap-1 text-xs text-[rgb(var(--text-muted))]">
                <span className="flex items-center gap-1.5"><Phone size={12} /> {e.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={12} /> {e.email}</span>
                {service && (
                  <span className="flex items-center gap-1.5"><UserCog size={12} /> {service.name}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {e.schedule.map((d) => (
                  <span key={d} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[rgb(var(--surface-soft))]">
                    {d}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-[rgb(var(--border))]">
                <button onClick={() => setPlanningId(e.id)} className="btn-outline flex-1 !py-2 text-xs">
                  <CalendarRange size={14} /> Planning
                </button>
                <button onClick={() => showToast(`Fiche de ${e.firstName} ${e.lastName} (démo).`, "info")} className="btn-ghost flex-1 !py-2 text-xs">
                  Fiche
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Nouveau membre du personnel"
        size="lg"
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Membre ajouté avec succès.", "success"); }} className="btn-gold">
              <Plus size={15} /> Ajouter
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Prénom *</label>
            <input className="input" placeholder="Ex : Salma" />
          </div>
          <div>
            <label className="input-label">Nom *</label>
            <input className="input" placeholder="Ex : Idrissi" />
          </div>
          <div>
            <label className="input-label">Rôle</label>
            <select className="input">
              {["Esthéticienne", "Coiffeuse", "Kinésithérapeute", "Coach sportif", "Nutritionniste", "Infirmier", "Laborantin", "Réceptionniste", "Comptable"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Département</label>
            <select className="input">
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Téléphone</label>
            <input className="input" placeholder="+212 6xx xx xx xx" />
          </div>
          <div>
            <label className="input-label">E-mail</label>
            <input className="input" placeholder="nom@medical-wellness.ma" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Service associé</label>
            <select className="input">
              {["Kinésithérapie", "Esthétique & Anti-âge", "Coiffure", "SPA & Hammam", "Fitness", "Consultation Générale", "Nutrition & Accompagnement", "Amincissement & Minceur", "Bilan Bien-être Complet"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Planning modal */}
      <Modal
        open={Boolean(planningId)}
        onClose={() => setPlanningId(null)}
        title={`Planning — ${planningEmployee?.firstName} ${planningEmployee?.lastName ?? ""}`}
        subtitle="Semaine type du membre."
        size="lg"
        footer={
          <button onClick={() => { setPlanningId(null); showToast("Planning mis à jour.", "success"); }} className="btn-gold">
            Enregistrer
          </button>
        }
      >
        {planningEmployee && (
          <div className="space-y-2.5">
            {planningEmployee.schedule.map((d, i) => (
              <div key={d} className="flex items-center gap-3 p-3 rounded-xl border border-[rgb(var(--border))]">
                <span className="w-10 h-10 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {getDayName((["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].indexOf(d) + 1) % 7)}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Semaine du 14 au 20 septembre 2026</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="time" className="input !w-auto !py-1.5 text-xs" defaultValue={d === "Sam" ? "09:00" : "09:00"} />
                  <span className="text-[rgb(var(--text-muted))]">—</span>
                  <input type="time" className="input !w-auto !py-1.5 text-xs" defaultValue={d === "Sam" ? "20:00" : "19:00"} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setPlanningId(null);
                  showToast("Duplication du planning de la semaine précédente.", "success");
                }}
                className="btn-outline"
              >
                Dupliquer la semaine passée
              </button>
              <Link href="/prestations" onClick={() => setPlanningId(null)} className="text-xs text-gold-600 dark:text-gold-300 font-medium hover:underline">
                Lier au journal des prestations ▶
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}