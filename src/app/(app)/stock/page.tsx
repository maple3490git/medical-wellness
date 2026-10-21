"use client";

import { useMemo, useState } from "react";
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle, ArrowDownUp } from "lucide-react";
import { products, getSupplier, lowStockProducts } from "@/data/stock";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function StockPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [lowOnly, setLowOnly] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [mvtFor, setMvtFor] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), []);
  const low = useMemo(() => lowStockProducts(), []);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    if (category !== "Tous") list = list.filter((p) => p.category === category);
    if (lowOnly) list = list.filter((p) => p.stock <= p.minStock);
    return list;
  }, [search, category, lowOnly]);

  const inventoryValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Stock" subtitle={`${products.length} références · Gestion des inventaires`}>
<div className="flex gap-2">
          <button onClick={() => setOpenAdd(true)} className="btn-outline">
            <Package size={15} /> Nouvelle référence
          </button>
          <button onClick={() => setMvtFor(products[0])} className="btn-gold">
            <Plus size={15} /> Entrée / Sortie
          </button>
        </div>
</PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Valeur du stock</p>
          <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">{formatCurrency(inventoryValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Références</p>
          <p className="font-display text-xl font-bold">{products.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Alertes stock bas</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">{low.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Catégories</p>
          <p className="font-display text-xl font-bold">{categories.length}</p>
        </div>
      </div>

      {/* Alertes */}
      {low.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Produits sous le seuil minimum</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {low.map((p) => (
              <span key={p.id} className="chip border border-amber-500/30 text-amber-700 dark:text-amber-300">
                {p.name} · {p.stock} / min {p.minStock}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un produit ou SKU..." />
        <div className="flex items-center gap-2 flex-wrap">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input !w-auto !py-2.5">
            <option value="Tous">Toutes les catégories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setLowOnly((v) => !v)} className={`chip ${lowOnly ? "bg-rose-500 text-white" : "border border-[rgb(var(--border))]"}`}>
            <TrendingDown size={12} /> Stock bas uniquement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden lg:block">
          <Table headers={["Produit", "Catégorie", "Fournisseur", "Stock", "Seuil", "Prix vente", "Prix achat", "Statut", ""]}>
            {filtered.slice((page - 1) * pageSize, page * pageSize).map((p) => {
              const sup = getSupplier(p.supplierId);
              const isLow = p.stock <= p.minStock;
              return (
                <TableRow key={p.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                        <Package size={15} />
                      </span>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-[11px] text-[rgb(var(--text-muted))]">{p.sku}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{p.category}</Td>
                  <Td>{sup?.company ?? "—"}</Td>
                  <Td>
                    <span className={`font-semibold ${isLow ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {p.stock} u.
                    </span>
                  </Td>
                  <Td className="text-[rgb(var(--text-muted))]">{p.minStock} min</Td>
                  <Td className="font-semibold">{formatCurrency(p.salePrice)}</Td>
                  <Td>{formatCurrency(p.purchasePrice)}</Td>
                  <Td>
                    <Badge color={isLow ? "rose" : "emerald"} dot>
                      {isLow ? "Stock bas" : "En stock"}
                    </Badge>
                  </Td>
                  <Td align="right">
                    <button onClick={() => setMvtFor(p)} className="text-xs font-medium text-gold-600 dark:text-gold-300 hover:underline">
                      <ArrowDownUp size={14} className="inline mr-1" />
                      Entrée/Sortie
                    </button>
                  </Td>
                </TableRow>
              );
            })}
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
          {filtered.slice((page - 1) * pageSize, page * pageSize).map((p) => {
            const isLow = p.stock <= p.minStock;
            return (
              <button key={p.id} onClick={() => setMvtFor(p)} className="w-full text-left p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{p.name}</p>
                  <Badge color={isLow ? "rose" : "emerald"} dot>{isLow ? "Stock bas" : "En stock"}</Badge>
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{p.sku} · {p.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-semibold ${isLow ? "text-rose-500" : ""}`}>{p.stock} u. (min {p.minStock})</span>
                  <span className="font-bold text-sm">{formatCurrency(p.salePrice)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-[rgb(var(--border))]">
          <Pagination total={filtered.length} pageSize={pageSize} current={page} onChange={setPage} />
        </div>
      </div>

      {/* Add product modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Nouvelle référence produit"
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Référence ajoutée au stock.", "success"); }} className="btn-gold">
              <Plus size={15} /> Ajouter
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Nom du produit *</label>
            <input className="input" placeholder="Ex : Gommage visage" />
          </div>
          <div>
            <label className="input-label">Catégorie</label>
            <select className="input">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Fournisseur</label>
            <select className="input">
              {["Laboratoires COTAGI", "Sothys Maroc", "Procosmetic", "TechnoForm", "PharmaSupply Maroc"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Prix vente (DH)</label>
            <input type="number" className="input" placeholder="Ex : 180" />
          </div>
          <div>
            <label className="input-label">Prix achat (DH)</label>
            <input type="number" className="input" placeholder="Ex : 110" />
          </div>
        </div>
      </Modal>

      {/* Mouvement modal */}
      <Modal
        open={Boolean(mvtFor)}
        onClose={() => setMvtFor(null)}
        title={`Entrée / Sortie — ${mvtFor?.name ?? ""}`}
        subtitle="Enregistrer un mouvement de stock."
        footer={
          <>
            <button onClick={() => setMvtFor(null)} className="btn-outline">Annuler</button>
            <button
              onClick={() => {
                setMvtFor(null);
                showToast("Mouvement de stock enregistré.", "success");
              }}
              className="btn-gold"
            >
              <ArrowDownUp size={15} /> Valider le mouvement
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => showToast("Entrée de stock sélectionnée.", "info")} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[rgb(var(--border))] hover:border-gold-400 text-sm font-medium">
              <TrendingUp size={18} className="text-emerald-500" /> Entrée
            </button>
            <button onClick={() => showToast("Sortie de stock sélectionnée.", "info")} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[rgb(var(--border))] hover:border-gold-400 text-sm font-medium">
              <TrendingDown size={18} className="text-rose-500" /> Sortie
            </button>
          </div>
          <div>
            <label className="input-label">Quantité</label>
            <input type="number" className="input" placeholder="Ex : 20" />
          </div>
          <div>
            <label className="input-label">Motif</label>
            <select className="input">
              <option>Réception de commande</option>
              <option>Inventaire / ajustement</option>
              <option>Utilisation de soin</option>
              <option>Réclamation / retour fournisseur</option>
            </select>
          </div>
          {mvtFor && (
            <p className="text-xs text-[rgb(var(--text-muted))] rounded-xl bg-[rgb(var(--surface-soft))] p-3">
              Stock actuel : <strong>{mvtFor.stock} u.</strong> · Seuil min : {mvtFor.minStock} u.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}