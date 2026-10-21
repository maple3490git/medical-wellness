"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Cake,
  CalendarDays,
  Pencil,
  Coins,
  ClipboardList,
  FileText,
  AlertCircle,
  UserRound,
  ChevronRight,
  Plus,
} from "lucide-react";
import { getPatient } from "@/data/patients";
import { appointments } from "@/data/appointments";
import { prestations } from "@/data/prestations";
import { invoices } from "@/data/billing";
import { healthMetrics, documents } from "@/data/extras";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { formatDate, formatCurrency, calculateAge } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";

const docCategories = ["Tous", "Ordonnance", "Résultat", "Analyse", "Administratif"];

export default function PatientDetail({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const patient = getPatient(id);
  const [editOpen, setEditOpen] = useState(false);
  const [docCat, setDocCat] = useState("Tous");

  const related = useMemo(() => {
    if (!patient) return { rdvs: [], prests: [], factures: [], docs: [] };
    const rdvs = appointments.filter((a) => a.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));
    const key = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const prests = prestations.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase() === key);
    const factures = invoices.filter((f) => f.clientName.toLowerCase().includes(patient.lastName.toLowerCase()));
    const docs = documents.filter((d) => d.patientName?.toLowerCase().includes(patient.lastName.toLowerCase()));
    return { rdvs, prests, factures, docs };
  }, [patient]);

  if (!patient) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <UserRound size={32} className="text-[rgb(var(--text-muted))]" />
        <h2 className="font-display text-xl font-semibold mt-3">Patient introuvable</h2>
        <button onClick={() => router.push("/patients")} className="btn-outline mt-4">
          <ArrowLeft size={15} /> Retour aux patients
        </button>
      </div>
    );
  }

  const docFiltered = docCat === "Tous" ? related.docs : related.docs.filter((d) => d.category === docCat);
  const metrics = healthMetrics.filter(
    (m) =>
      m.patientName.toLowerCase().includes(patient.firstName.toLowerCase()) ||
      m.patientName.toLowerCase().includes(patient.lastName.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
      >
        <ArrowLeft size={15} /> Retour aux patients
      </Link>

      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Avatar firstName={patient.firstName} lastName={patient.lastName} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold">
                {patient.firstName} {patient.lastName}
              </h1>
              <Badge color={patient.status === "actif" ? "emerald" : "zinc"} dot>
                {patient.status === "actif" ? "Patient actif" : "Inactif"}
              </Badge>
              {patient.tags?.map((t) => (
                <span key={t} className="chip bg-gold-400/15 text-gold-700 dark:text-gold-300">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-sm text-[rgb(var(--text-muted))]">
              <span className="flex items-center gap-1.5">
                <Phone size={13} />
                {patient.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={13} />
                {patient.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {patient.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Cake size={13} />
                {formatDate(patient.birthDate, { day: "2-digit", month: "long", year: "numeric" })} ({calculateAge(patient.birthDate)} ans)
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
              Client depuis le {formatDate(patient.createdAt)}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => showToast("Appel initié (démo).", "info")} className="btn-outline">
              <Phone size={15} /> Appeler
            </button>
            <button onClick={() => setEditOpen(true)} className="btn-gold">
              <Pencil size={15} /> Modifier
            </button>
          </div>
        </div>

        {patient.notes && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 p-3.5 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>
              <strong>Note importante :</strong> {patient.notes}
            </p>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total dépensé"
          value={formatCurrency(patient.totalSpent)}
          icon={<Coins size={18} />}
          iconClass="bg-gold-400/15 text-gold-600 dark:text-gold-300"
        />
        <StatCard label="Dernière visite" value={formatDate(patient.lastVisit)} icon={<ClipboardList size={18} />} />
        <StatCard label="Prochain RDV" value={patient.nextAppointment ? formatDate(patient.nextAppointment) : "—"} icon={<CalendarDays size={18} />} />
        <StatCard label="Prestations" value={String(related.prests.length)} icon={<UserRound size={18} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Historique RDV */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Historique des rendez-vous</h2>
            <Link href="/rendez-vous" className="text-xs font-medium text-gold-600 dark:text-gold-300 flex items-center gap-1 hover:underline">
              Planifier <Plus size={13} />
            </Link>
          </div>
          {related.rdvs.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">Aucun rendez-vous enregistré.</p>
          ) : (
            <div className="space-y-2.5">
              {related.rdvs.map((rdv) => (
                <div key={rdv.id} className="flex items-center gap-3 p-3 rounded-xl border border-[rgb(var(--border))]">
                  <div className="w-16 shrink-0 text-center bg-gold-400/10 rounded-lg py-1.5">
                    <p className="text-xs font-semibold text-gold-700 dark:text-gold-300">
                      {formatDate(rdv.date, { day: "2-digit", month: "short" })}
                    </p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{rdv.startTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rdv.serviceName}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {rdv.staffName} · {rdv.room}
                    </p>
                  </div>
                  <Badge
                    color={
                      rdv.status === "confirmed"
                        ? "emerald"
                        : rdv.status === "pending"
                          ? "amber"
                          : rdv.status === "completed"
                            ? "sky"
                            : "zinc"
                    }
                    dot
                  >
                    {rdv.status === "confirmed"
                      ? "Confirmé"
                      : rdv.status === "pending"
                        ? "En attente"
                        : rdv.status === "completed"
                          ? "Effectué"
                          : rdv.status === "absent"
                            ? "Absent"
                            : "Annulé"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infos + notes */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold mb-3">Informations</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[rgb(var(--text-muted))]">Sexe</span>
                <span className="font-medium">{patient.gender === "F" ? "Femme" : "Homme"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[rgb(var(--text-muted))]">Naissance</span>
                <span className="font-medium">{formatDate(patient.birthDate)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[rgb(var(--text-muted))]">Adresse</span>
                <span className="font-medium text-right">{patient.address}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[rgb(var(--text-muted))]">Statut</span>
                <Badge color={patient.status === "actif" ? "emerald" : "zinc"}>
                  {patient.status === "actif" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold mb-3">Factures récentes</h2>
            {related.factures.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))]">Aucune facture.</p>
            ) : (
              <div className="space-y-2">
                {related.factures.slice(0, 3).map((f) => (
                  <Link key={f.id} href="/facturation" className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-[rgb(var(--surface-soft))]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.number}</p>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]">{formatDate(f.date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(f.total)}</p>
                      <Badge color={f.status === "paid" ? "emerald" : f.status === "partial" ? "amber" : "rose"}>
                        {f.status === "paid" ? "Payée" : f.status === "partial" ? "Partielle" : "Impayée"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prestations + Documents + Analyses */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <ClipboardList size={17} className="text-gold-500" /> Prestations réalisées
          </h2>
          {related.prests.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">Aucune prestation.</p>
          ) : (
            <div className="space-y-2">
              {related.prests.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[rgb(var(--border))]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.serviceName}</p>
                    <p className="text-[11px] text-[rgb(var(--text-muted))]">
                      {formatDate(p.date)} · {p.timeIn}–{p.timeOut} · {p.employeeName}
                    </p>
                  </div>
                  <span className="font-semibold text-sm shrink-0">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <FileText size={17} className="text-gold-500" /> Documents
            </h2>
            <span className="text-xs text-[rgb(var(--text-muted))]">{docFiltered.length}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
            {docCategories.map((c) => (
              <button
                key={c}
                onClick={() => setDocCat(c)}
                className={`chip shrink-0 ${docCat === c ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))]"}`}
              >
                {c}
              </button>
            ))}
          </div>
          {docFiltered.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">Aucun document.</p>
          ) : (
            <div className="space-y-2">
              {docFiltered.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[rgb(var(--border))]">
                  <span className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold">
                    {d.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-[11px] text-[rgb(var(--text-muted))]">
                      {d.category} · {d.size}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[rgb(var(--text-muted))]" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Résultats d'analyses</h2>
          {metrics.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">Aucune analyse pour ce patient.</p>
          ) : (
            <div className="space-y-2">
              {metrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[rgb(var(--border))]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.test}</p>
                    <p className="text-[11px] text-[rgb(var(--text-muted))]">{m.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{m.result}</p>
                    <Badge color={m.status === "normal" ? "emerald" : m.status === "attention" ? "amber" : "rose"}>
                      {m.status === "normal" ? "Normal" : m.status === "attention" ? "À surveiller" : "Critique"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le patient"
        size="lg"
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-outline">
              Annuler
            </button>
            <button
              onClick={() => {
                setEditOpen(false);
                showToast("Informations du patient mises à jour.", "success");
              }}
              className="btn-gold"
            >
              <Pencil size={15} /> Enregistrer
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Prénom</label>
            <input className="input" defaultValue={patient.firstName} />
          </div>
          <div>
            <label className="input-label">Nom</label>
            <input className="input" defaultValue={patient.lastName} />
          </div>
          <div>
            <label className="input-label">Téléphone</label>
            <input className="input" defaultValue={patient.phone} />
          </div>
          <div>
            <label className="input-label">E-mail</label>
            <input className="input" defaultValue={patient.email} />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Adresse</label>
            <input className="input" defaultValue={patient.address} />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Notes / allergies</label>
            <textarea className="input min-h-[60px]" defaultValue={patient.notes} />
          </div>
        </div>
      </Modal>
    </div>
  );
}