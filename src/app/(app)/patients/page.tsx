"use client";

import { useMemo, useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Users, Phone, Mail, CalendarDays, ChevronRight, Filter, UserPlus } from "lucide-react";
import { patientsService } from "@/services/patients.service";
import type { Patient } from "@/lib/types";
import { getAppointmentsForDate } from "@/data/appointments";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate, calculateAge } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";

const tags = ["Esthétique", "SPA", "Fitness", "Kiné", "Coiffure", "Nutrition", "VIP", "Amincissement"];

export default function PatientsPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [tag, setTag] = useState<string>("Tous");
  const [status, setStatus] = useState<string>("Tous");
  const [sort, setSort] = useState<"recent" | "spent" | "name">("recent");
  const [openAdd, setOpenAdd] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    patientsService.list().then((data) => {
      if (mounted) { setAllPatients(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...allPatients];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }
    if (tag !== "Tous") list = list.filter((p) => p.tags?.includes(tag));
    if (status !== "Tous") list = list.filter((p) => (status === "av" ? p.status === "actif" : p.status === "inactif"));
    switch (sort) {
      case "recent":
        list.sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
        break;
      case "spent":
        list.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "name":
        list.sort((a, b) => a.lastName.localeCompare(b.lastName));
        break;
    }
    return list;
  }, [allPatients, query, tag, status, sort]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Patients" subtitle={`${allPatients.length} patients inscrits · Gestion du fichier clients`}>
<button onClick={() => setOpenAdd(true)} className="btn-gold">
          <Plus size={16} /> Nouveau patient
        </button>
</PageHeader>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 lg:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, téléphone ou e-mail..."
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto !py-2.5">
            <option value="Tous">Tous les statuts</option>
            <option value="av">Actifs</option>
            <option value="in">Inactifs</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input !w-auto !py-2.5">
            <option value="recent">Tri : Visite récente</option>
            <option value="spent">Tri : Plus dépensés</option>
            <option value="name">Tri : Nom A→Z</option>
          </select>
          <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 w-full lg:w-auto">
            {["Tous", ...tags].slice(0, 8).map((t) => (
              <button
                key={t}
                onClick={() => { setTag(t); setPage(1); }}
                className={`chip shrink-0 ${tag === t ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Total clients</p>
          <p className="font-display text-xl font-bold">{allPatients.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Nouveaux (30 j)</p>
          <p className="font-display text-xl font-bold">05</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">RDV aujourd'hui</p>
          <p className="font-display text-xl font-bold">{getAppointmentsForDate("2026-09-17").length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">CA généré</p>
          <p className="font-display text-xl font-bold">{formatCurrency(allPatients.reduce((s, p) => s + p.totalSpent, 0))}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 text-[rgb(var(--text-muted))]">
          <span className="animate-spin mr-2">⟳</span> Chargement des patients...
        </div>
      ) : (
      <div className="card overflow-hidden">
        {pageItems.length === 0 ? (
          <EmptyState
            title="Aucun patient trouvé"
            description="Aucun patient ne correspond à votre recherche. Essayez de modifier les filtres."
            action={<button onClick={() => { setQuery(""); setTag("Tous"); setStatus("Tous"); }} className="btn-outline">Réinitialiser les filtres</button>}
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table
                headers={["Patient", "Contact", "Age", "Dernière visite", "Prochain RDV", "Total dépensé", "Statut", ""]}
              >
                {pageItems.map((p) => (
                  <TableRow key={p.id}>
                    <Td>
                      <Link href={`/patients/${p.id}`} className="flex items-center gap-3">
                        <Avatar firstName={p.firstName} lastName={p.lastName} />
                        <div>
                          <p className="font-medium text-sm">{p.firstName} {p.lastName}</p>
                          <div className="flex gap-1 mt-0.5">
                            {p.tags?.slice(0, 2).map((t) => (
                              <span key={t} className="text-[10px] bg-gold-400/15 text-gold-700 dark:text-gold-300 px-1.5 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </Td>
                    <Td>
                      <p className="text-sm flex items-center gap-1.5"><Phone size={12} className="text-[rgb(var(--text-muted))]" />{p.phone}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1.5 mt-0.5"><Mail size={12} />{p.email}</p>
                    </Td>
                    <Td>{calculateAge(p.birthDate)} ans</Td>
                    <Td>{formatDate(p.lastVisit)}</Td>
                    <Td>{p.nextAppointment ? formatDate(p.nextAppointment) : "—"}</Td>
                    <Td className="font-semibold">{formatCurrency(p.totalSpent)}</Td>
                    <Td>
                      <Badge color={p.status === "actif" ? "emerald" : "zinc"} dot>
                        {p.status === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </Td>
                    <Td align="right">
                      <Link href={`/patients/${p.id}`} className="text-gold-600 dark:text-gold-300">
                        <ChevronRight size={17} />
                      </Link>
                    </Td>
                  </TableRow>
                ))}
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
              {pageItems.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-3 p-4">
                  <Avatar firstName={p.firstName} lastName={p.lastName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1 mt-0.5"><Phone size={11} />{p.phone}</p>
                    <p className="text-xs text-gold-600 dark:text-gold-300 mt-1">{formatCurrency(p.totalSpent)}</p>
                  </div>
                  <ChevronRight size={16} className="text-[rgb(var(--text-muted))]" />
                </Link>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-[rgb(var(--border))]">
              <Pagination total={total} pageSize={pageSize} current={page} onChange={setPage} />
            </div>
          </>
        )}
      </div>
      )}

      {/* Add patient modal */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Nouveau patient" subtitle="Les champs marqués * sont obligatoires." size="lg">
        <AddPatientForm
          onSuccess={() => { setOpenAdd(false); showToast("Patient créé avec succès.", "success"); }}
          onCancel={() => setOpenAdd(false)}
        />
      </Modal>
    </div>
  );
}

function AddPatientForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "", gender: "F" as "M" | "F",
    birthDate: "", address: "", notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await patientsService.create({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      gender: form.gender,
      birthDate: form.birthDate,
      address: form.address,
      notes: form.notes,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Prénom *</label>
          <input className="input" value={form.firstName} onChange={setField("firstName")} placeholder="Ex : Sara" required />
        </div>
        <div>
          <label className="input-label">Nom *</label>
          <input className="input" value={form.lastName} onChange={setField("lastName")} placeholder="Ex : El Amrani" required />
        </div>
        <div>
          <label className="input-label">Téléphone *</label>
          <input className="input" value={form.phone} onChange={setField("phone")} placeholder="+212 6xx xx xx xx" required />
        </div>
        <div>
          <label className="input-label">E-mail *</label>
          <input className="input" value={form.email} onChange={setField("email")} placeholder="exemple@email.com" required />
        </div>
        <div>
          <label className="input-label">Sexe</label>
          <select className="input" value={form.gender} onChange={setField("gender")}>
            <option value="F">Femme</option>
            <option value="M">Homme</option>
          </select>
        </div>
        <div>
          <label className="input-label">Date de naissance *</label>
          <input type="date" className="input" value={form.birthDate} onChange={setField("birthDate")} required />
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Adresse *</label>
          <input className="input" value={form.address} onChange={setField("address")} placeholder="Adresse à Tanger..." required />
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Notes médicales / allergies</label>
          <textarea className="input min-h-[70px]" value={form.notes} onChange={setField("notes")} placeholder="Allergies, antécédents..." />
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 6).map((t) => (
              <span key={t} className="chip border border-[rgb(var(--border))]">{t} <span className="text-gold-600">+</span></span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Annuler</button>
        <button type="submit" disabled={submitting} className="btn-gold">
          <UserPlus size={15} /> {submitting ? "Création..." : "Créer le patient"}
        </button>
      </div>
    </form>
  );
}
