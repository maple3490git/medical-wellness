"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ReceiptText,
  Plus,
  
  CheckCircle2,
  Printer,
  Eye,
  Download,
  Mail,
} from "lucide-react";
import { invoices } from "@/data/billing";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { BUSINESS } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function FacturationPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [openDetail, setOpenDetail] = useState<Invoice | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let list = [...invoices].sort((a, b) => b.number.localeCompare(a.number));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((f) => f.clientName.toLowerCase().includes(q) || f.number.toLowerCase().includes(q));
    if (status !== "Tous") list = list.filter((f) => f.status === status);
    return list;
  }, [search, status]);

  const paidTotal = invoices.filter((f) => f.status === "paid").reduce((s, f) => s + f.total, 0);
  const pendingTotal = invoices.filter((f) => f.status === "unpaid").reduce((s, f) => s + f.total, 0);
  const partial = invoices.filter((f) => f.status === "partial");
  const partialTotal = partial.reduce((s, f) => s + (f.total - f.paid), 0);

  const statusBadge = (s: Invoice["status"]): ReactNode => (
    <Badge color={s === "paid" ? "emerald" : s === "partial" ? "amber" : s === "unpaid" ? "rose" : "zinc"} dot>
      {s === "paid" ? "Payée" : s === "partial" ? "Partielle" : s === "unpaid" ? "Impayée" : "Annulée"}
    </Badge>
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Facturation" subtitle={`${invoices.length} factures · FACT-2026-0247 (série en cours)`}>
<div className="flex gap-2">
          <button onClick={() => showToast("Devis créé (démo).", "info")} className="btn-outline">
            <ReceiptText size={15} /> Devis
          </button>
          <button onClick={() => showToast("Nouvelle facture créée.", "success")} className="btn-gold">
            <Plus size={15} /> Nouvelle facture
          </button>
        </div>
</PageHeader>

      {/* Totaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Encaissé ce mois</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(paidTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Impayé (total)</p>
          <p className="font-display text-xl font-bold text-rose-500">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Reste à percevoir</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(partialTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Factures partiellement payées</p>
          <p className="font-display text-xl font-bold">{partial.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher une facture ou un client..." />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input !w-auto !py-2.5">
          <option value="Tous">Tous les statuts</option>
          <option value="paid">Payées</option>
          <option value="partial">Partielles</option>
          <option value="unpaid">Impayées</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="Aucune facture trouvée"
            description="Modifiez vos filtres ou créez une nouvelle facture."
            action={<button onClick={() => { setSearch(""); setStatus("Tous"); }} className="btn-outline">Réinitialiser</button>}
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table headers={["Numéro", "Client", "Date", "Échéance", "Montant", "Payé", "Restant", "Statut", ""]}>
                {filtered.slice((page - 1) * pageSize, page * pageSize).map((f) => (
                  <TableRow key={f.id} onClick={() => setOpenDetail(f)}>
                    <Td>
                      <p className="font-semibold text-sm text-gold-700 dark:text-gold-300">{f.number}</p>
                    </Td>
                    <Td className="font-medium">{f.clientName}</Td>
                    <Td>{formatDate(f.date)}</Td>
                    <Td>{formatDate(f.dueDate)}</Td>
                    <Td className="font-semibold">{formatCurrency(f.total)}</Td>
                    <Td className="text-emerald-600 dark:text-emerald-400">{formatCurrency(f.paid)}</Td>
                    <Td className={f.total - f.paid > 0 ? "text-amber-600 dark:text-amber-400" : "text-[rgb(var(--text-muted))]"}>
                      {formatCurrency(f.total - f.paid)}
                    </Td>
                    <Td>{statusBadge(f.status)}</Td>
                    <Td align="right">
                      <button onClick={(e) => { e.stopPropagation(); setOpenDetail(f); }} className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]">
                        <Eye size={15} />
                      </button>
                    </Td>
                  </TableRow>
                ))}
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
              {filtered.slice((page - 1) * pageSize, page * pageSize).map((f) => (
                <button key={f.id} onClick={() => setOpenDetail(f)} className="w-full text-left p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gold-700 dark:text-gold-300">{f.number}</p>
                    {statusBadge(f.status)}
                  </div>
                  <p className="text-sm font-medium mt-1">{f.clientName}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{formatDate(f.date)} · {formatCurrency(f.total)}</p>
                </button>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-[rgb(var(--border))]">
              <Pagination total={filtered.length} pageSize={pageSize} current={page} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Detail */}
      <Modal
        open={Boolean(openDetail)}
        onClose={() => setOpenDetail(null)}
        title={`Facture ${openDetail?.number ?? ""}`}
        subtitle={openDetail ? `${openDetail.clientName} · ${formatDate(openDetail.date)}` : ""}
        size="xl"
        footer={
          <>
            <button onClick={() => setOpenDetail(null)} className="btn-outline">Fermer</button>
            <button onClick={() => showToast("Facture envoyée par e-mail au client.", "success")} className="btn-outline">
              <Mail size={15} /> Envoyer
            </button>
            <button onClick={() => showToast("Impression de la facture...", "info")} className="btn-dark">
              <Printer size={15} /> Imprimer / PDF
            </button>
          </>
        }
      >
        {openDetail && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-display font-bold text-gold-600 dark:text-gold-300">MEDICAL WELLNESS</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {BUSINESS.address} · {BUSINESS.phone}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{openDetail.number}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Émise le {formatDate(openDetail.date)} · Échéance {formatDate(openDetail.dueDate)}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[rgb(var(--surface-soft))] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Client</p>
                <p className="font-semibold">{openDetail.clientName}</p>
              </div>
              {statusBadge(openDetail.status)}
            </div>

            <Table headers={["Description", "Qté", "Prix unitaire", "Montant"]}>
              {openDetail.items.map((item, i) => (
                <TableRow key={i}>
                  <Td>{item.label}</Td>
                  <Td>{item.qty}</Td>
                  <Td>{formatCurrency(item.price)}</Td>
                  <Td className="font-semibold">{formatCurrency(item.qty * item.price)}</Td>
                </TableRow>
              ))}
            </Table>

            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="flex justify-between w-52"><span className="text-[rgb(var(--text-muted))]">Total TTC</span><span className="font-bold">{formatCurrency(openDetail.total)}</span></div>
              <div className="flex justify-between w-52"><span className="text-[rgb(var(--text-muted))]">Déjà payé</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(openDetail.paid)}</span></div>
              <div className="flex justify-between w-52 border-t border-[rgb(var(--border))] pt-1">
                <span className="text-[rgb(var(--text-muted))]">Reste dû</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(openDetail.total - openDetail.paid)}</span>
              </div>
            </div>
            {openDetail.status !== "paid" && (
              <button
                onClick={() => { setOpenDetail(null); showToast("Paiement partiel enregistré.", "success"); }}
                className="btn-gold w-full justify-center"
              >
                <CheckCircle2 size={15} /> Enregistrer un paiement
              </button>
            )}
            <button className="btn-outline w-full justify-center !py-2 text-xs">
              <Download size={13} /> Télécharger la facture (PDF)
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}