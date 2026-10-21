"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ClipboardList,
  Plus,
  FileSpreadsheet,
  Search,
  Clock,
  CheckCircle2,
  ChevronDown,
  CalendarDays,
  Euro,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { prestations as initialPrestations, PRESTATION_SERVICES } from "@/data/prestations";
import { employees } from "@/data/personnel";
import { getService } from "@/data/services";
import type { Prestation } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatCurrency, todayISO } from "@/lib/utils";
import { exportPrestations } from "@/lib/excel-export";
import PageHeader from "@/components/ui/PageHeader";

export default function PrestationsPage() {
  const { user, hasPermission } = useAuth();
  const [list, setList] = useState<Prestation[]>(initialPrestations);
  const [tab, setTab] = useState<"saisie" | "journal">("journal");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { showToast } = useToast();

  const isEmployee = user?.role === "employe";
  const canSeeAll = user ? hasPermission("prestations.view") && user.role !== "employe" : false;
  const canExport = user ? hasPermission("prestations.export") : false;
  const canValidate = user
    ? ["admin", "directeur", "comptabilite", "responsable"].includes(user.role)
    : false;

  const myEmployee = useMemo(() => {
    if (!user) return undefined;
    return employees.find(
      (e) => `${e.firstName} ${e.lastName}`.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase()
    );
  }, [user]);

  const myService = myEmployee?.serviceId
    ? PRESTATION_SERVICES.find((s) => s.id === myEmployee.serviceId)
    : undefined;

  const visible = useMemo(() => {
    let rows = isEmployee && myEmployee ? list.filter((p) => p.employeeId === myEmployee.id) : list;
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.employeeName.toLowerCase().includes(q)
      );
    }
    if (serviceFilter !== "Tous") rows = rows.filter((p) => p.serviceId === serviceFilter);
    if (statusFilter !== "Tous") rows = rows.filter((p) => p.status === statusFilter);
    if (dateFrom) rows = rows.filter((p) => p.date >= dateFrom);
    if (dateTo) rows = rows.filter((p) => p.date <= dateTo);
    return [...rows].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [list, isEmployee, myEmployee, search, serviceFilter, statusFilter, dateFrom, dateTo]);

  const totalCa = useMemo(() => visible.reduce((s, p) => s + p.price, 0), [visible]);
  const remaining = useMemo(() => visible.filter((p) => p.status === "submitted"), [visible]);

  const handleExport = () => {
    exportPrestations(visible, `prestations_${todayISO()}`);
    showToast("Export Excel généré avec succès.", "success");
  };

  const handleNewPrestation = (p: Omit<Prestation, "id" | "createdAt" | "status" | "employeeId" | "employeeName" | "serviceId" | "serviceName"> & { serviceId?: string }) => {
    if (!user) return;
    const serviceId = p.serviceId || myEmployee?.serviceId || PREstationDefault;
    const service = getService(serviceId);
    const newPres: Prestation = {
      id: `pres-${Date.now()}`,
      date: p.date,
      lastName: p.lastName,
      firstName: p.firstName,
      timeIn: p.timeIn,
      timeOut: p.timeOut,
      price: p.price,
      serviceId,
      serviceName: service?.name ?? myService?.name ?? "Prestation",
      employeeId: myEmployee?.id ?? user.id,
      employeeName: myEmployee ? `${myEmployee.firstName} ${myEmployee.lastName}` : `${user.firstName} ${user.lastName}`,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    setList((l) => [newPres, ...l]);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <PageHeader title="Prestations" subtitle={isEmployee
              ? "Saisissez vos prestations du jour — elles remplacent le message WhatsApp."
              : "Journal des prestations réalisées par l'équipe."}>
<div className="flex gap-2">
          {canExport && (
            <button onClick={handleExport} className="btn-outline">
              <FileSpreadsheet size={16} /> Exporter Excel
            </button>
          )}
          <button onClick={() => setTab("saisie")} className="btn-gold">
            <Plus size={16} /> Nouvelle saisie
          </button>
        </div>
</PageHeader>

      {/* Info employé */}
      {isEmployee && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-gold-400/40 bg-gold-400/[0.07] p-4">
          <div className="w-10 h-10 rounded-xl bg-gold-400 text-noir-950 flex items-center justify-center shrink-0">
            <UserRound size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {user.firstName} {user.lastName} · {myService?.name ?? "Employé"}
            </p>
            <p className="text-xs text-[rgb(var(--text-muted))]">
              Votre service est préréglé : {myService?.name}. Les champs Nom/Prénom/Heures/Prix suffisent.
            </p>
          </div>
          <Badge color="gold" dot>
            {visible.length} saisie{visible.length > 1 ? "s" : ""} ce mois
          </Badge>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[rgb(var(--surface-soft))] w-fit">
        <button
          onClick={() => setTab("journal")}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${tab === "journal" ? "bg-[rgb(var(--surface))] shadow-sm" : "text-[rgb(var(--text-muted))]"}`}
        >
          <ClipboardList size={15} /> Journal
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold-400/20 text-gold-700 dark:text-gold-300">
            {visible.length}
          </span>
        </button>
        <button
          onClick={() => setTab("saisie")}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${tab === "saisie" ? "bg-[rgb(var(--surface))] shadow-sm" : "text-[rgb(var(--text-muted))]"}`}
        >
          <Plus size={15} /> Saisie rapide
        </button>
      </div>

      {tab === "saisie" ? (
        <SaisieForm
          key={String(list.length)}
          myService={myService}
          isEmployee={Boolean(isEmployee)}
          onSubmit={handleNewPrestation}
        />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="relative flex-1 lg:max-w-xs">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un client ou employé..."
                  className="input pl-9 !py-2"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input !w-auto !py-2" title="Du" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input !w-auto !py-2" title="Au" />
                {!isEmployee && (
                  <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="input !w-auto !py-2">
                    <option value="Tous">Tous les services</option>
                    {PRESTATION_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input !w-auto !py-2">
                  <option value="Tous">Tous les statuts</option>
                  <option value="submitted">Soumise</option>
                  <option value="validated">Validée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">Prestations affichées</p>
              <p className="font-display text-xl font-bold">{visible.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">Total CA ({visible[0]?.date ? "sélection" : "—"})</p>
              <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">
                {formatCurrency(totalCa)}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">En attente de validation</p>
              <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">{remaining.length}</p>
            </div>
          </div>

          {/* Journal */}
          <div className="card overflow-hidden">
            {visible.length === 0 ? (
              <EmptyState
                title="Aucune prestation"
                description={
                  isEmployee
                    ? "Vous n'avez pas encore saisi de prestation. Cliquez sur « Saisie rapide »."
                    : "Aucune prestation ne correspond à ces filtres."
                }
                action={isEmployee ? undefined : (
                  <button onClick={() => { setSearch(""); setServiceFilter("Tous"); setStatusFilter("Tous"); setDateFrom(""); setDateTo(""); }} className="btn-outline">
                    Réinitialiser les filtres
                  </button>
                )}
              />
            ) : (
              <>
                <div className="hidden lg:block">
                  <Table headers={["Date", "Client", "Service", "Employé", "Heures", "Prix", "Statut", ""]}>
                    {visible.map((p) => (
                      <TableRow key={p.id}>
                        <Td>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                              <CalendarDays size={14} />
                            </span>
                            <span className="font-medium text-sm">{formatDate(p.date)}</span>
                          </div>
                        </Td>
                        <Td>
                          <p className="font-medium text-sm">{p.firstName} {p.lastName}</p>
                        </Td>
                        <Td>{p.serviceName}</Td>
                        <Td>{p.employeeName}</Td>
                        <Td>
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <Clock size={12} className="text-[rgb(var(--text-muted))]" />
                            {p.timeIn} – {p.timeOut}
                          </span>
                        </Td>
                        <Td className="font-semibold">{formatCurrency(p.price)}</Td>
                        <Td>
                          <Badge color={p.status === "validated" ? "emerald" : "sky"} dot>
                            {p.status === "validated" ? "Validée" : "Soumise"}
                          </Badge>
                        </Td>
                        <Td align="right">
                          {canValidate && p.status === "submitted" && (
                            <button
                              onClick={() => {
                                setList((l) => l.map((x) => (x.id === p.id ? { ...x, status: "validated" as const } : x)));
                                showToast(`Prestation de ${p.firstName} ${p.lastName} validée.`, "success");
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <CheckCircle2 size={14} /> Valider
                            </button>
                          )}
                        </Td>
                      </TableRow>
                    ))}
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
                  {visible.map((p) => (
                    <div key={p.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{p.firstName} {p.lastName}</p>
                        <Badge color={p.status === "validated" ? "emerald" : "sky"} dot>
                          {p.status === "validated" ? "Validée" : "Soumise"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                        {p.serviceName} · {formatDate(p.date)} · {p.timeIn}–{p.timeOut}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[rgb(var(--text-muted))]">{p.employeeName}</p>
                        <p className="font-bold text-sm">{formatCurrency(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const PREstationDefault = "svc-esthetique";

function SaisieForm({
  myService,
  isEmployee,
  onSubmit,
}: {
  myService?: { id: string; name: string };
  isEmployee: boolean;
  onSubmit: (p: {
    date: string;
    lastName: string;
    firstName: string;
    timeIn: string;
    timeOut: string;
    price: number;
    serviceId?: string;
  }) => void;
}) {
  const { showToast } = useToast();
  const [date, setDate] = useState(todayISO());
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [timeIn, setTimeIn] = useState("09:00");
  const [timeOut, setTimeOut] = useState("10:00");
  const [price, setPrice] = useState("");

  const serviceLabel = myService?.name ?? PRESTATION_SERVICES[0].name;
  const suggested = PRESTATION_SERVICES.find((s) => s.name === serviceLabel)?.id
    ? getService(PRESTATION_SERVICES.find((s) => s.name === serviceLabel)!.id)?.price
    : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !lastName.trim() || !firstName.trim() || !timeIn || !timeOut || !price) {
      showToast("Veuillez remplir tous les champs.", "warning");
      return;
    }
    if (timeOut <= timeIn) {
      showToast("L'heure de sortie doit être après l'heure d'entrée.", "error");
      return;
    }
    onSubmit({
      date,
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      timeIn,
      timeOut,
      price: parseFloat(price),
      serviceId: myService?.id,
    });
    showToast("Prestation soumise avec succès.", "success");
    setLastName("");
    setFirstName("");
    setTimeIn("09:00");
    setTimeOut("10:00");
    setPrice("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <form onSubmit={submit} className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-gold-400/15 text-gold-600 dark:text-gold-300 flex items-center justify-center">
            <ClipboardList size={17} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Saisie rapide</h2>
            <p className="text-xs text-[rgb(var(--text-muted))]">Format identique à votre ancien message WhatsApp.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
            </div>
            {isEmployee ? (
              <div>
                <label className="input-label">Service</label>
                <input value={myService?.name ?? "—"} disabled className="input !bg-[rgb(var(--surface-soft))] opacity-70" />
              </div>
            ) : (
              <div>
                <label className="input-label">Service</label>
                <select className="input" defaultValue={myService?.id ?? "svc-esthetique"}>
                  {PRESTATION_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Nom *</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ex : Fikri" className="input" />
            </div>
            <div>
              <label className="input-label">Prénom *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex : Meryem" className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Heure d'entrée *</label>
              <input type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} className="input" />
            </div>
            <div>
              <label className="input-label">Heure de sortie *</label>
              <input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="input-label">Prix (DH) *</label>
            <div className="relative">
              <Euro size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={suggested ? `${suggested} DH (tarif ${serviceLabel})` : "Ex : 350"}
                className="input pl-9"
              />
            </div>
            {suggested && !price && (
              <button
                type="button"
                onClick={() => setPrice(String(suggested))}
                className="text-xs text-gold-600 dark:text-gold-300 mt-1.5 hover:underline"
              >
                Utiliser le tarif {serviceLabel} ({String(suggested)} DH) ↗
              </button>
            )}
          </div>

          <button type="submit" className="btn-gold w-full justify-center">
            <CheckCircle2 size={16} /> Soumettre la prestation
          </button>
          <p className="text-[11px] text-[rgb(var(--text-muted))] text-center">
            La prestation sera transmise à la direction et à la comptabilité — plus besoin de WhatsApp.
          </p>
        </div>
      </form>

      {/* Client lookup */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <UserRound size={17} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Clients récents</h2>
            <p className="text-xs text-[rgb(var(--text-muted))]">Cliquez pour pré-remplir le nom / prénom.</p>
          </div>
        </div>
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {[
            { first: "Meryem", last: "Fikri" },
            { first: "Sara", last: "El Amrani" },
            { first: "Lina", last: "Haddad" },
            { first: "Omar", last: "Tazi" },
            { first: "Houda", last: "Chakir" },
            { first: "Amina", last: "Tlemçani" },
            { first: "Youssef", last: "Benali" },
            { first: "Khalid", last: "Ait Benhaddou" },
            { first: "Rachid", last: "Benkiran" },
            { first: "Nora", last: "Fassi" },
          ].map((c) => (
            <button
              key={`${c.first}${c.last}`}
              onClick={() => {
                setFirstName(c.first);
                setLastName(c.last);
                showToast(`${c.first} ${c.last} pré-rempli.`, "info");
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-[rgb(var(--border))] hover:border-gold-400/60 hover:bg-gold-400/[0.04] text-left transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-[rgb(var(--surface-soft))] flex items-center justify-center text-sm font-semibold">
                {c.first.charAt(0)}{c.last.charAt(0)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{c.first} {c.last}</p>
                <p className="text-[11px] text-[rgb(var(--text-muted))]">Client de {myService?.name ?? "Medical Wellness"}</p>
              </div>
              <ChevronDown size={14} className="text-[rgb(var(--text-muted))] rotate-180" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}