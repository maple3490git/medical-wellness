"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, CalendarRange, Trophy, FileBarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { revenueStats, appointmentsStats, clientsGrowth, servicePerformance, monthlyRevenue } from "@/data/stats";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import { exportRowsToExcel } from "@/lib/excel-export";
import PageHeader from "@/components/ui/PageHeader";

const periods = ["Septembre", "Août", "Juillet", "Année entière"];

const chartTooltipStyle = {
  background: "#1a1813",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
};

export default function RapportsPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState(periods[0]);

  const bestService = useMemo(() => servicePerformance.reduce((a, b) => (b.value > a.value ? b : a)), []);

  const doExport = (what: "revenue" | "services" | "clients") => {
    if (what === "revenue") {
      exportRowsToExcel(
        monthlyRevenue,
        [
          { title: "Mois", value: (r) => r.month },
          { title: "Revenus (DH)", value: (r) => r.revenu },
          { title: "Dépenses (DH)", value: (r) => r.depenses },
          { title: "Marge (DH)", value: (r) => r.revenu - r.depenses },
        ],
        "rapport-revenus"
      );
    } else if (what === "services") {
      exportRowsToExcel(
        servicePerformance,
        [
          { title: "Service", value: (s) => s.name },
          { title: "Part (%)", value: (s) => s.value },
        ],
        "rapport-services"
      );
    } else if (what === "clients") {
      exportRowsToExcel(
        clientsGrowth,
        [
          { title: "Mois", value: (c) => c.label },
          { title: "Clients", value: (c) => c.value },
        ],
        "rapport-clients"
      );
    }
    showToast("Rapport exporté en Excel.", "success");
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Rapports & analyses" subtitle="Indicateurs clés d'activité · Tableaux de bord analytiques">
<div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm">
            <CalendarRange size={14} className="text-gold-600 dark:text-gold-300" />
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-transparent outline-none text-sm py-0.5">
              {periods.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={() => doExport("revenue")} className="btn-gold">
            <Download size={15} /> Export
          </button>
        </div>
</PageHeader>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Chiffre d'affaires ({period.toLowerCase()})</p>
          <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">53 200 DH</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">+7,3% vs mois préc.</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Marge brute</p>
          <p className="font-display text-xl font-bold">20 700 DH</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">38,9% de marge</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Prestations réalisées</p>
          <p className="font-display text-xl font-bold">412</p>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">341 validées</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Panier moyen / client</p>
          <p className="font-display text-xl font-bold">478 DH</p>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Taux de fidélité 61%</p>
        </div>
      </div>

      {/* Top service */}
      <div className="rounded-2xl bg-gradient-to-br from-gold-400/20 via-gold-500/10 to-transparent border border-gold-400/30 p-5 flex items-center gap-4">
        <span className="w-12 h-12 rounded-2xl bg-gold-500 text-noir-950 flex items-center justify-center shrink-0">
          <Trophy size={20} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-300">Service le plus performant</p>
          <p className="font-display text-xl font-bold">{bestService.name}</p>
          <p className="text-sm text-[rgb(var(--text-muted))]">{bestService.value}% du CA · En progression constante depuis juin</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg">Revenus vs dépenses</h2>
            <p className="text-xs text-[rgb(var(--text-muted))]">Évolution mensuelle</p>
          </div>
          <button onClick={() => { doExport("revenue"); }} className="btn-ghost !py-2 text-xs flex items-center gap-1">
            <Download size={13} /> Excel
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,122,106,0.15)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number | string) => formatCurrency(Number(v))} />
            <Area type="monotone" dataKey="revenu" name="Revenus" stroke="#d4af37" strokeWidth={2.5} fill="url(#rv)" />
            <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#a68728" strokeWidth={2} fill="transparent" strokeDasharray="5 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Services */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Performance par service</h2>
            <button onClick={() => { doExport("services"); }} className="btn-ghost !py-2 text-xs flex items-center gap-1">
              <Download size={13} /> Excel
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={servicePerformance} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,122,106,0.15)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number | string) => `${v}%`} />
              <Bar dataKey="value" name="Part du CA" radius={[0, 8, 8, 0]} barSize={18}>
                {servicePerformance.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RDV week */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-lg mb-4">Rendez-vous par jour</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={appointmentsStats.map((a) => ({ name: a.label, value: a.value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {appointmentsStats.map((_, i) => (
                  <Cell key={i} fill={["#d4af37", "#a68728", "#8a6f20", "#c9a644", "#b8942e", "#7a621c", "#e3c46a"][i % 7]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clients growth */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg">Croissance de la clientèle</h2>
            <p className="text-xs text-[rgb(var(--text-muted))]">247 clients actifs · +15 nouveaux ce mois</p>
          </div>
          <button onClick={() => { doExport("clients"); }} className="btn-ghost !py-2 text-xs flex items-center gap-1">
            <Download size={13} /> Excel
          </button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={clientsGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,122,106,0.15)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="value" name="Clients" fill="#d4af37" radius={[8, 8, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footnotes */}
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[rgb(var(--border))] p-4 text-xs text-[rgb(var(--text-muted))]">
        <FileBarChart2 size={15} className="shrink-0 mt-0.5" />
        <p>
          Données consolidées à partir des modules Caisse, Prestations, Facturation et Rendez-vous.
          Les rapports détaillés (Bilan comptable, Rapport fiscal, Suivi des prestataires) sont disponibles en export depuis
          chaque feuille. <span className="text-gold-600 dark:text-gold-300">Journal d'audit complet : module Audit.</span>
        </p>
      </div>
    </div>
  );
}