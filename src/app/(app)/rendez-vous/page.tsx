"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { appointments } from "@/data/appointments";
import { getMonthName, getDayName, daysInMonth, formatDate, formatTime } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";

const statusColor: Record<string, "emerald" | "amber" | "sky" | "rose" | "zinc"> = {
  confirmed: "emerald",
  pending: "amber",
  completed: "sky",
  cancelled: "rose",
  absent: "zinc",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  completed: "Effectué",
  cancelled: "Annulé",
  absent: "Absent",
};

export default function RendezVousPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [view, setView] = useState<"mois" | "semaine" | "jour">("mois");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8); // Septembre
  const [day, setDay] = useState("2026-09-17");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [openAdd, setOpenAdd] = useState(false);

  const filtered = useMemo(
    () => appointments.filter((a) => statusFilter === "Tous" || a.status === statusFilter),
    [statusFilter]
  );

  const monthAppointments = useMemo(() => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    return filtered.filter((a) => a.date.startsWith(key));
  }, [filtered, year, month]);

  const dayAppointments = useMemo(
    () => filtered.filter((a) => a.date === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [filtered, day]
  );

  const weekAppointments = useMemo(() => {
    const base = new Date(`${day}T00:00:00`);
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay() + 1);
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days.map((d) => ({ day: d, list: filtered.filter((a) => a.date === d).sort((a, b) => a.startTime.localeCompare(b.startTime)) }));
  }, [filtered, day]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const todayStats = {
    confirmed: filtered.filter((a) => a.date === "2026-09-17" && a.status === "confirmed").length,
    pending: filtered.filter((a) => a.date === "2026-09-17" && a.status === "pending").length,
    completed: filtered.filter((a) => a.date === "2026-09-17" && a.status === "completed").length,
  };

  const calendarCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const total = daysInMonth(year, month);
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Rendez-vous" subtitle={`${filtered.length} rendez-vous · Planning du centre`}>
<button onClick={() => setOpenAdd(true)} className="btn-gold">
          <Plus size={16} /> Nouveau rendez-vous
        </button>
</PageHeader>

      {/* Stats du jour */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Aujourd'hui</p>
          <p className="font-display text-xl font-bold">{todayStats.confirmed + todayStats.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Confirmés</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{todayStats.confirmed}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">En attente</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">{todayStats.pending}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgb(var(--surface-soft))] w-fit">
          {(["jour", "semaine", "mois"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${view === v ? "bg-[rgb(var(--surface))] shadow-sm" : "text-[rgb(var(--text-muted))]"}`}
            >
              {v === "mois" ? "Mois" : v === "semaine" ? "Semaine" : "Jour"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { if (view === "mois") changeMonth(-1); else setDay((d) => new Date(new Date(d).setDate(new Date(d).getDate() - 1)).toISOString().split("T")[0]); }} className="p-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
            <ChevronLeft size={15} />
          </button>
          <span className="font-display font-semibold text-base min-w-[150px] text-center">
            {view === "mois" ? `${getMonthName(month)} ${year}` : formatDate(day, { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <button onClick={() => { if (view === "mois") changeMonth(1); else setDay((d) => new Date(new Date(d).setDate(new Date(d).getDate() + 1)).toISOString().split("T")[0]); }} className="p-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
            <ChevronRight size={15} />
          </button>
          <button onClick={() => { setYear(2026); setMonth(8); setDay("2026-09-17"); }} className="btn-ghost !px-3 !py-2 text-xs">Aujourd'hui</button>
        </div>

        <div className="lg:ml-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input !w-auto !py-2">
            <option value="Tous">Tous les statuts</option>
            <option value="confirmed">Confirmés</option>
            <option value="pending">En attente</option>
            <option value="completed">Effectués</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>
      </div>

      {view === "mois" && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[rgb(var(--border))]">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, i) => {
              if (cell === null) return <div key={`e-${i}`} className="min-h-[100px] sm:min-h-[120px] border-b border-r border-[rgb(var(--border))] last:border-r-0 bg-[rgb(var(--bg-app))]/30" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(cell).padStart(2, "0")}`;
              const dayRdv = monthAppointments.filter((a) => a.date === dateStr);
              const isToday = dateStr === "2026-09-17";
              return (
                <button
                  key={dateStr}
                  onClick={() => { setDay(dateStr); setView("jour"); }}
                  className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-[rgb(var(--border))] last:border-r-0 p-1.5 text-left align-top transition-colors hover:bg-gold-400/[0.05] ${isToday ? "bg-gold-400/[0.08]" : ""}`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mb-1 ${isToday ? "bg-gold-400 text-noir-950" : "text-[rgb(var(--text-muted))]"}`}>
                    {cell}
                  </span>
                  <div className="space-y-1">
                    {dayRdv.slice(0, 3).map((a) => (
                      <div key={a.id} className="rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate" style={{ background: `${a.color ?? "#d4af37"}22`, color: "rgb(var(--text))" }}>
                        {a.startTime} {a.patientName.split(" ")[0]}
                      </div>
                    ))}
                    {dayRdv.length > 3 && (
                      <p className="text-[10px] text-[rgb(var(--text-muted))] px-1">+{dayRdv.length - 3} autres</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "semaine" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekAppointments.map(({ day: dd, list }) => (
            <div key={dd} className="card p-3">
              <p className={`text-xs font-semibold ${dd === "2026-09-17" ? "text-gold-600 dark:text-gold-300" : "text-[rgb(var(--text-muted))]"}`}>
                {getDayName(new Date(`${dd}T00:00:00`).getDay(), true)} {parseInt(dd.slice(8), 10)}
              </p>
              <div className="mt-2 space-y-1.5">
                {list.length === 0 && <p className="text-[11px] text-[rgb(var(--text-muted))]">—</p>}
                {list.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg px-2 py-1.5 text-[11px] border"
                    style={{ borderColor: `${a.color ?? "#d4af37"}55`, background: `${a.color ?? "#d4af37"}14` }}
                  >
                    <p className="font-semibold truncate">{a.startTime} {a.patientName.split(" ")[0]}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] truncate">{a.serviceName}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "jour" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Timeline */}
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Clock size={16} className="text-gold-500" /> Agenda du {formatDate(day)}
              </h2>
              <Badge color="gold">{dayAppointments.length} RDV</Badge>
            </div>
            {dayAppointments.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))]">Aucun rendez-vous ce jour.</p>
            ) : (
              <div className="space-y-2.5">
                {dayAppointments.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[rgb(var(--border))]">
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-sm font-semibold">{a.startTime}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">- {a.endTime}</p>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-sm font-semibold">{a.patientName}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{a.serviceName} · {a.staffName}</p>
                      {a.room && <p className="text-[11px] text-gold-600 dark:text-gold-300 mt-0.5">{a.room}</p>}
                    </div>
                    <Badge color={statusColor[a.status] ?? "zinc"} dot>
                      {statusLabel[a.status] ?? a.status}
                    </Badge>
                    <div className="flex gap-1.5">
                      {a.status === "pending" && (
                        <>
                          <button
                            onClick={() => showToast(`RDV de ${a.patientName} confirmé.`, "success")}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-500/10"
                            title="Confirmer"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => showToast(`RDV de ${a.patientName} annulé.`, "info")}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Annuler"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liste */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Rendez-vous du {getMonthName(month)}</h2>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filtered.slice(0, 12).map((a) => (
                <button key={a.id} onClick={() => setDay(a.date)} className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[rgb(var(--border))] hover:border-gold-400/60 hover:bg-gold-400/[0.04] text-left">
                  <span className="w-10 h-10 rounded-lg bg-[rgb(var(--surface-soft))] flex items-center justify-center text-center shrink-0">
                    <span className="leading-tight text-[10px] font-semibold">
                      {parseInt(a.date.slice(8), 10)}<br />{getMonthName(new Date(`${a.date}T00:00:00`).getMonth()).slice(0, 3)}
                    </span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.patientName}</p>
                    <p className="text-[11px] text-[rgb(var(--text-muted))] truncate">{a.serviceName}</p>
                  </div>
                  <span className="text-[11px] text-[rgb(var(--text-muted))] shrink-0">{a.startTime}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Nouveau rendez-vous"
        subtitle="Planifier un rendez-vous pour un patient."
        size="lg"
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Rendez-vous créé avec succès.", "success"); }} className="btn-gold">
              <Plus size={15} /> Créer le rendez-vous
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Patient *</label>
            <select className="input">
              {["Sara El Amrani", "Youssef Benali", "Lina Haddad", "Adam Karim", "Fatima Zahra El Idrissi", "Omar Tazi", "Meryem Fikri", "Amina Tlemçani"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Service *</label>
            <select className="input">
              {["Kinésithérapie", "Esthétique & Anti-âge", "Coiffure", "SPA & Hammam", "Fitness", "Consultation Générale", "Nutrition & Accompagnement", "Amincissement & Minceur", "I-SLIM Électro-stimulation", "Bilan Bien-être Complet"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Prestataire *</label>
            <select className="input">
              {["Dr. Mehdi Mernissi", "Sophie Laurent", "Yasmine El Amrani", "Nadia Chraibi", "Amina Soulhi", "Leïla Benali", "Karim Tazi", "Ahmed Bennani", "Salma Idrissi"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Date *</label>
            <input type="date" className="input" defaultValue="2026-09-17" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Début</label>
              <input type="time" className="input" defaultValue="09:00" />
            </div>
            <div>
              <label className="input-label">Fin</label>
              <input type="time" className="input" defaultValue="09:45" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Salle / Cabine</label>
            <select className="input">
              {["Cabine Kiné 1", "Cabine Esthétique", "Salon Coiffure", "Hammam", "Salle Fitness", "Cabinet Médical", "Salle I-SLIM", "Laboratoire", "Cabine Cryo", "Cabine Nutrition"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Notes</label>
            <textarea className="input min-h-[60px]" placeholder="Précisions pour cet RDV..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}