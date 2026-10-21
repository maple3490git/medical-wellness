"use client";

import { useMemo, useState } from "react";
import { Factory, Phone, Mail, MapPin, Plus, Search, Package } from "lucide-react";
import { suppliers } from "@/data/stock";
import { products } from "@/data/stock";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Table, { TableRow, Td } from "@/components/ui/Table";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";

export default function FournisseursPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openContact, setOpenContact] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...suppliers];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.company.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q));
    return list;
  }, [search]);

  const supplierById = (id: string) => {
    const sup = suppliers.find((s) => s.id === id);
    return sup?.company ?? "—";
  };

  const pendingOrders = new Map([
    ["sup-001", "CO-2026-118 · 12 400 DH"],
    ["sup-002", "CO-2026-122 · 8 700 DH"],
    ["sup-003", null],
    ["sup-004", "CO-2026-125 · 15 200 DH"],
    ["sup-005", null],
  ]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Fournisseurs" subtitle={`${suppliers.length} fournisseurs partenaires · Réapprovisionnement`}>
<button onClick={() => setOpenAdd(true)} className="btn-gold">
          <Plus size={15} /> Nouveau fournisseur
        </button>
</PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Fournisseurs actifs</p>
          <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">{suppliers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Achats ce mois</p>
          <p className="font-display text-xl font-bold">{formatCurrency(36_300)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Commandes en cours</p>
          <p className="font-display text-xl font-bold">3</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Références approvisionnées</p>
          <p className="font-display text-xl font-bold">{products.length}</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative lg:max-w-xs">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un fournisseur..." className="input pl-9 !py-2.5" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden lg:block">
          <Table headers={["Fournisseur", "Produits", "Stock acheté (pcs)", "Commande en cours", "Contact", ""]}>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                      <Factory size={15} />
                    </span>
                    <div>
                      <p className="font-medium text-sm">{s.company}</p>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]">{s.address}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-[rgb(var(--text-muted))]">{s.products?.join(", ")}</Td>
                <Td className="font-semibold">{125}</Td>
                <Td className="text-emerald-600 dark:text-emerald-400">{pendingOrders.get(s.id) ?? "—"}</Td>
                <Td>{s.contact}</Td>
                <Td align="right">
                  <button onClick={() => setOpenContact(s.id)} className="text-xs font-medium text-gold-600 dark:text-gold-300 hover:underline">
                    Voir tout
                  </button>
                </Td>
              </TableRow>
            ))}
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
          {filtered.map((s) => (
            <button key={s.id} onClick={() => setOpenContact(s.id)} className="w-full text-left p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{s.company}</p>
                <MapPin size={13} className="text-gold-500" />
              </div>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{s.contact}</p>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{s.address}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        open={Boolean(openContact)}
        onClose={() => setOpenContact(null)}
        title={suppliers.find((s) => s.id === openContact)?.company ?? "Fournisseur"}
        subtitle="Fiche fournisseur"
        footer={
          <>
            <button onClick={() => setOpenContact(null)} className="btn-outline">Fermer</button>
            <button onClick={() => { setOpenContact(null); showToast("Commande d'achat créée (démo).", "success"); }} className="btn-gold">
              <Package size={15} /> Créer une commande
            </button>
          </>
        }
      >
        {openContact && (() => {
          const sup = suppliers.find((s) => s.id === openContact)!;
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                  <Factory size={20} />
                </span>
                <div>
                  <p className="font-display font-bold text-lg">{sup.company}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{sup.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm rounded-xl bg-[rgb(var(--surface-soft))] p-4">
                <div className="flex items-center gap-2"><Phone size={14} className="text-gold-600 dark:text-gold-300" /> {sup.phone}</div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-gold-600 dark:text-gold-300" /> {sup.email}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-2">Produits fournis</p>
                <div className="flex flex-wrap gap-2">
                  {sup.products?.map((p) => (
                    <span key={p} className="chip border border-[rgb(var(--border))]">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-2">Historique d'achats (2026)</p>
                <div className="space-y-1.5 text-sm">
                  {["Mai 2026 — 9 800 DH", "Juillet 2026 — 11 450 DH"].map((row, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] px-3 py-2">
                      <span>{row.split(" — ")[0]}</span>
                      <span className="font-semibold">{row.split(" — ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Add supplier modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Nouveau fournisseur"
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Fournisseur ajouté avec succès.", "success"); }} className="btn-gold">
              <Plus size={15} /> Ajouter
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Raison sociale *</label>
            <input className="input" placeholder="Ex : Laboratoires Yves Ponroy" />
          </div>
          <div>
            <label className="input-label">Contact</label>
            <input className="input" placeholder="Nom du commercial" />
          </div>
          <div>
            <label className="input-label">Téléphone</label>
            <input className="input" placeholder="+212 6 XX XX XX XX" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">E-mail</label>
            <input className="input" placeholder="contact@fournisseur.ma" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Adresse</label>
            <input className="input" placeholder="Ville, quartier" />
          </div>
        </div>
      </Modal>
    </div>
  );
}