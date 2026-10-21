"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CalendarDays,
  Coins,
  Users,
  Plus,
  ChevronRight,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { dashboardStats, revenueStats, clientsGrowth, servicePerformance, monthlyRevenue } from "@/data/stats";
import { appointments } from "@/data/appointments";
import { activityFeed } from "@/data/extras";
import { lowStockProducts } from "@/data/stock";
import { employees } from "@/data/personnel";
import { services } from "@/data/services";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { formatTime } from "@/lib/utils";

const statusColor: Record<string, "sky" | "emerald" | "amber" | "zinc"> = {
  confirmed: "emerald",
  pending: "amber",
  completed: "sky",
  cancelled: "zinc",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  completed: "Effectué",
  cancelled: "Annulé",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"jour" | "semaine" | "mois" | "annee">("mois");

  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === "2026-09-17").sort((a, b) => a.startTime.localeCompare(b.startTime)),
    []
  );

  const revenue = useMemo(
    () => (period === "annee" ? monthlyRevenue : revenueStats.map((r) => ({ ...r, value: r.value * (period === "jour" ? 0.055 : 1) }))),
    [period]
  );

  const lowStock = useMemo(() => lowStockProducts().slice(0, 4), []);

  const staffToday = employees.filter((p) => p.status === "active");

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const fmt = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 });

  const statPeriodLabel: Record<string, string> = {
    jour: "Aujourd'hui",
    semaine: "Cette semaine",
    mois: "Ce mois",
    annee: "Cette année",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[rgb(var(--text-muted))]">{statPeriodLabel[period]}, 17 septembre 2026</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-0.5">
            {greeting}, {user?.firstName} <span className="text-gold-500">👋</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["jour", "semaine", "mois", "annee"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                period === p
                  ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950"
                  : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]"
              }`}
            >
              {p === "annee" ? "Année" : p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Patients aujourd'hui"
          value={String(dashboardStats.patientsToday)}
          delta={`${dashboardStats.patientsTodayDelta} par rapport à hier`}
          deltaPositive
          icon={<Users size={18} />}
          iconClass="bg-gold-400/15 text-gold-600 dark:text-gold-300"
        />
        <StatCard
          label="Rendez-vous aujourd'hui"
          value={String(dashboardStats.appointmentsToday)}
          delta={`${dashboardStats.appointmentsPending} en attente de confirmation`}
          deltaPositive={false}
          icon={<CalendarDays size={18} />}
          iconClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label="Revenus du jour"
          value={`${fmt.format(dashboardStats.revenueToday)} DH`}
          delta="+12% vs hier"
          deltaPositive
          icon={<Coins size={18} />}
          iconClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Encaissements en attente"
          value={`${fmt.format(dashboardStats.pendingAmount)} DH`}
          delta={`${dashboardStats.pendingPayments} paiements en attente`}
          deltaPositive={false}
          icon={<TrendingUp size={18} />}
          iconClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          onClick={user?.role !== "employe" ? () => {} : undefined}
        />
      </div>

      {/* Chart + RDV */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Évolution des revenus</h2>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                {period === "annee" ? "Revenus vs dépenses mensuelles" : "Prestations pour la période sélectionnée"} (DH)
              </p>
            </div>
            <Badge color="gold">
              <TrendingUp size={12} /> +24%
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {period === "annee" ? (
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a68728" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a68728" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} tick={{ fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => `${fmt.format(v)} DH`}
                    contentStyle={{ borderRadius: 12, background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="revenu" stroke="#d4af37" strokeWidth={2.5} fill="url(#rev)" name="Revenus" />
                  <Area type="monotone" dataKey="depenses" stroke="#a68728" strokeWidth={2} fill="url(#dep)" name="Dépenses" />
                </AreaChart>
              ) : (
                <AreaChart data={revenue} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="revs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} tick={{ fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} tick={{ fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => `${fmt.format(v)} DH`}
                    contentStyle={{ borderRadius: 12, background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2.5} fill="url(#revs)" name="CA" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* RDV du jour */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Rendez-vous du jour</h2>
            <Link href="/rendez-vous" className="text-xs font-medium text-gold-600 dark:text-gold-300 flex items-center gap-1 hover:underline">
              Tout voir <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2.5 flex-1">
            {todayAppointments.map((rdv) => (
              <Link
                key={rdv.id}
                href="/rendez-vous"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-[rgb(var(--border))] hover:border-gold-400/60 hover:bg-gold-400/[0.04] transition-colors"
              >
                <div className="w-12 shrink-0 text-center">
                  <p className="text-sm font-semibold">{formatTime(rdv.startTime)}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">- {formatTime(rdv.endTime)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{rdv.patientName}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] truncate">
                    {rdv.serviceName} · {rdv.staffName}
                  </p>
                </div>
                <Badge color={statusColor[rdv.status] ?? "zinc"} dot>
                  {statusLabel[rdv.status] ?? rdv.status}
                </Badge>
              </Link>
            ))}
          </div>
          <Link href="/rendez-vous" className="btn-outline w-full justify-center mt-4 hidden sm:flex">
            <Plus size={15} /> Nouveau rendez-vous
          </Link>
        </div>
      </div>

      {/* Service perf + activite */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg font-semibold">Performance par service</h2>
            <Badge color="gold">{services.length} services</Badge>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={servicePerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {servicePerformance.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ borderRadius: 12, background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {servicePerformance.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="flex-1 truncate text-[rgb(var(--text-muted))]">{s.name}</span>
                <span className="font-semibold text-xs">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Croissance clients */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg font-semibold">Croissance des clients</h2>
            <Badge color="emerald">
              <ArrowUpRight size={12} /> +11%
            </Badge>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientsGrowth} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tick={{ fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} tick={{ fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}
                />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9" }} name="Clients" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[rgb(var(--surface-soft))] p-3">
              <p className="text-[11px] text-[rgb(var(--text-muted))]">Nouveaux ce mois</p>
              <p className="font-display text-lg font-bold">{fmt.format(dashboardStats.newPatients)}</p>
            </div>
            <div className="rounded-xl bg-[rgb(var(--surface-soft))] p-3">
              <p className="text-[11px] text-[rgb(var(--text-muted))]">Fidélité / retour</p>
              <p className="font-display text-lg font-bold">64%</p>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Activité récente</h2>
            <Link href="/rapports" className="text-xs font-medium text-gold-600 dark:text-gold-300 flex items-center gap-1 hover:underline">
              Rapports <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3 flex-1">
            {activityFeed.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${act.color}`} />
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{act.text}</p>
                  <p className="text-[11px] text-[rgb(var(--text-muted))]">
                    {act.user} · {act.date.split("T")[1]?.slice(0, 5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock faible + staff */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Stock faible</h2>
            <Link href="/stock" className="text-xs font-medium text-gold-600 dark:text-gold-300 flex items-center gap-1 hover:underline">
              Gérer <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[rgb(var(--border))]">
                <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-[rgb(var(--text-muted))]">{p.category}</p>
                </div>
                <Badge color="rose">{p.stock} restant{/* / {p.minStock} */}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe en service */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Équipe en service</h2>
            <Badge color="emerald" dot>
              {staffToday.length} présents
            </Badge>
          </div>
          <div className="space-y-2">
            {staffToday.slice(0, 7).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(var(--surface-soft))] transition-colors">
                <Avatar firstName={p.firstName} lastName={p.lastName} size="sm" status={p.status === "active"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-[11px] text-[rgb(var(--text-muted))] truncate">{p.role}</p>
                </div>
                <span className="text-[11px] text-[rgb(var(--text-muted))]">{p.schedule.includes("Sam") ? "09h00 – 20h00" : "09h00 – 19h00"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Santé du centre */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">En bref</h2>
            <Badge color="gold">
              <Clock size={12} /> En direct
            </Badge>
          </div>
          <div className="space-y-2 flex-1">
            {[
              { label: "Chiffre d'affaires du mois", value: `${fmt.format(dashboardStats.revenueMonth)} DH`, extra: "Objectif 70 000 DH" },
              { label: "Services actifs", value: String(dashboardStats.activeServices), extra: "10 offres au catalogue" },
              { label: "Taux d'occupation", value: "76%", extra: "Salles & cabines" },
              { label: "Satisfaction clients", value: "4,8/5", extra: "84 avis" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-[rgb(var(--surface-soft))] p-3.5">
                <p className="text-[11px] text-[rgb(var(--text-muted))]">{k.label}</p>
                <p className="font-display text-xl font-bold mt-0.5">{k.value}</p>
                <p className="text-[11px] text-gold-600 dark:text-gold-300">{k.extra}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}