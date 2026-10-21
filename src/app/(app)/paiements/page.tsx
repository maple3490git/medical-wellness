"use client";

import { useMemo, useState } from "react";
import { CreditCard, Plus, RotateCcw, Download, TrendingUp } from "lucide-react";
import { payments } from "@/data/billing";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportRowsToExcel } from "@/lib/excel-export";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

const methods = ["Espèces", "Carte bancaire", "Virement", "WellnessCoins", "Chèque"];

export default function PaiementsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("Tous");
  const [openAdd, setOpenAdd] = useState(false);

  const filtered = useMemo(() => {
    let list = [...payments].sort((a, b) => b.date.localeCompare(a.date));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.clientName.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q));
    if (method !== "Tous") list = list.filter((p) => p.method === method);
    return list;
  }, [search, method]);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const byMethod = useMemo(() => {
    const m = new Map<string, number>();
    payments.forEach((p) => m.set(p.method, (m.get(p.method) ?? 0) + p.amount));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const exportPayments = () => {
    exportRowsToExcel(
      filtered,
      [
        { title: "Référence", value: (p) => p.reference },
        { title: "Client", value: (p) => p.clientName },
        { title: "Date", value: (p) => p.date },
        { title: "Montant (DH)", value: (p) => p.amount },
        { title: "Méthode", value: (p) => p.method },
        { title: "Service", value: (p) => p.serviceName ?? "" },
      ],
      "paiements"
    );
    showToast("Export Excel généré.", "success");
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Paiements" subtitle={`${payments.length} paiements enregistrés · Suivi des encaissements`}>
<div className="flex gap-2">
          <button onClick={exportPayments} className="btn-outline">
            <Download size={15} /> Exporter
          </button>
          <button onClick={() => setOpenAdd(true)} className="btn-gold">
            <Plus size={15} /> Enregistrer un paiement
          </button>
        </div>
</PageHeader>

      {/* Totaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Total encaissé (sept.)</p>
          <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">{formatCurrency(total)}</p>
        </div>
        {byMethod.slice(0, 3).map(([m, v]) => (
          <div key={m} className="card p-4">
            <p className="text-xs text-[rgb(var(--text-muted))]">{m}</p>
            <p className="font-display text-xl font-bold">{formatCurrency(v)}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un client ou une référence..." />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["Tous", ...methods].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`chip shrink-0 ${method === m ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden lg:block">
          <Table headers={["Référence", "Client", "Date", "Prestation", "Méthode", "Montant", "Statut", ""]}>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                      <CreditCard size={14} />
                    </span>
                    <span className="font-medium text-sm">{p.reference}</span>
                  </div>
                </Td>
                <Td className="font-medium">{p.clientName}</Td>
                <Td>{formatDate(p.date)}</Td>
                <Td>{p.serviceName ?? "—"}</Td>
                <Td>
                  <Badge color="zinc">{p.method}</Badge>
                </Td>
                <Td className="font-semibold">{formatCurrency(p.amount)}</Td>
                <Td>
                  <Badge color={p.status === "paid" ? "emerald" : p.status === "partial" ? "amber" : p.status === "refunded" ? "zinc" : "rose"} dot>
                    {p.status === "paid" ? "Payé" : p.status === "partial" ? "Partiel" : p.status === "refunded" ? "Remboursé" : "En attente"}
                  </Badge>
                </Td>
                <Td align="right">
                  <button onClick={() => showToast(`Détail du paiement ${p.reference} (démo).`, "info")} className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]">
                    <RotateCcw size={14} />
                  </button>
                </Td>
              </TableRow>
            ))}
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
          {filtered.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{p.clientName}</p>
                <Badge color={p.status === "paid" ? "emerald" : p.status === "partial" ? "amber" : "zinc"} dot>
                  {p.status === "paid" ? "Payé" : p.status === "partial" ? "Partiel" : "Remboursé"}
                </Badge>
              </div>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{p.reference} · {formatDate(p.date)} · {p.method}</p>
              <p className="font-bold mt-1.5">{formatCurrency(p.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add payment modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Enregistrer un paiement"
        size="lg"
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Paiement enregistré avec succès.", "success"); }} className="btn-gold">
              <Plus size={15} /> Valider le paiement
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Client</label>
            <select className="input">
              {["Adam Karim", "Amina Tlemçani", "Youssef Benali", "Houda Chakir", "Fatima Zahra El Idrissi", "Client comptoir"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Montant (DH) *</label>
            <input type="number" className="input" placeholder="Ex : 350" />
          </div>
          <div>
            <label className="input-label">Moyen de paiement</label>
            <select className="input">
              {methods.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Date</label>
            <input type="date" className="input" defaultValue="2026-09-17" />
          </div>
          <div>
            <label className="input-label">Prestation / Facture</label>
            <select className="input">
              <option>FACT-2026-0243 — Amina Tlemçani (1 550 DH)</option>
              <option>FACT-2026-0247 — Youssef Benali (350 DH)</option>
              <option>Prestation comptoir</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}