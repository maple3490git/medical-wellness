"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  HandCoins,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Coins,
  Search,
  Receipt,
  CheckCircle2,
  Landmark,
} from "lucide-react";
import { services } from "@/data/services";
import { payments } from "@/data/billing";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";

interface CartItem {
  id: string;
  label: string;
  qty: number;
  price: number;
}

const methods = [
  { id: "Espèces" as const, label: "Espèces", icon: Banknote },
  { id: "Carte bancaire" as const, label: "Carte bancaire", icon: CreditCard },
  { id: "Virement" as const, label: "Virement", icon: Landmark },
  { id: "WellnessCoins" as const, label: "WellnessCoins", icon: Coins },
  { id: "Chèque" as const, label: "Chèque", icon: Receipt },
];

export default function CaissePage() {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<typeof methods[number]["id"]>("Espèces");
  const [client, setClient] = useState("Client comptoir");
  const [paid, setPaid] = useState("");
  const [done, setDone] = useState<{ total: number; method: string; client: string } | null>(null);

  const subTotal = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [search]);

  const addItem = (id: string, label: string, price: number) => {
    setCart((c) => {
      const found = c.find((i) => i.id === id);
      if (found) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id, label, qty: 1, price }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id: string) => setCart((c) => c.filter((i) => i.id !== id));

  const restant = parseFloat(paid) - subTotal || 0;

  const todayTotal = useMemo(
    () => payments.filter((p) => p.date === "2026-09-17" && p.status === "paid").reduce((s, p) => s + p.amount, 0),
    []
  );
  const todayCount = useMemo(
    () => payments.filter((p) => p.date === "2026-09-17" && p.status === "paid").length,
    []
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Ajoutez au moins une prestation au panier.", "warning");
      return;
    }
    if (method !== "WellnessCoins" && parseFloat(paid) < subTotal) {
      showToast("Le montant reçu est insuffisant par rapport au total.", "error");
      return;
    }
    setDone({ total: subTotal, method, client });
  };

  const reset = () => {
    setCart([]);
    setPaid("");
    setClient("Client comptoir");
    setMethod("Espèces");
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Caisse (POS)" subtitle="Encaissement rapide des prestations au comptoir.">
<div className="flex items-center gap-2">
          <Badge color="gold" dot>Session ouverte</Badge>
          <button onClick={() => showToast("Session encaissée vers la comptabilité.", "success")} className="btn-outline !py-2">
            Clôturer la journée
          </button>
        </div>
</PageHeader>

      {/* Stats du jour */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Encaissé aujourd'hui</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Transactions</p>
          <p className="font-display text-xl font-bold">{todayCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Panier en cours</p>
          <p className="font-display text-xl font-bold">{formatCurrency(subTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Articles</p>
          <p className="font-display text-xl font-bold">{cart.reduce((s, i) => s + i.qty, 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Catalogue */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <HandCoins size={17} className="text-gold-500" /> Catalogue rapide
            </h2>
            <div className="relative w-44">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="input !py-2 pl-8 !text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredServices.map((s) => (
              <button
                key={s.id}
                onClick={() => addItem(s.id, s.name, s.price)}
                className="flex flex-col items-start gap-1 p-3 rounded-xl border border-[rgb(var(--border))] hover:border-gold-400 hover:bg-gold-400/[0.04] text-left transition-all"
              >
                <span className="text-xs font-semibold text-[rgb(var(--text))] leading-tight line-clamp-2">{s.name}</span>
                <span className="text-[10px] text-[rgb(var(--text-muted))]">{s.category}</span>
                <span className="text-sm font-bold text-gold-600 dark:text-gold-300 mt-auto">{formatCurrency(s.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panier */}
        <form onSubmit={submit} className="card p-5 flex flex-col">
          <h2 className="font-display text-lg font-semibold mb-4">Panier</h2>

          <div className="space-y-2 flex-1 min-h-[200px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="w-12 h-12 rounded-2xl bg-[rgb(var(--surface-soft))] flex items-center justify-center text-[rgb(var(--text-muted))]">
                  <HandCoins size={20} />
                </span>
                <p className="text-sm text-[rgb(var(--text-muted))] mt-3">Ajoutez une prestation depuis le catalogue.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-[rgb(var(--border))]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{formatCurrency(item.price)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => changeQty(item.id, -1)} className="w-7 h-7 rounded-lg border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--text-muted))]">
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button type="button" onClick={() => changeQty(item.id, 1)} className="w-7 h-7 rounded-lg border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--text-muted))]">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-semibold text-sm w-20 text-right">{formatCurrency(item.qty * item.price)}</span>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-[rgb(var(--text-muted))] hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Client */}
          <div className="mt-4">
            <label className="input-label">Client</label>
            <input value={client} onChange={(e) => setClient(e.target.value)} className="input" placeholder="Nom du client ou « Client comptoir »" />
          </div>

          {/* Methodes */}
          <div className="mt-4">
            <label className="input-label">Moyen de paiement</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      active ? "border-gold-400 bg-gold-400/10 text-gold-700 dark:text-gold-300" : "border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-gold-400/50"
                    }`}
                  >
                    <Icon size={16} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Totaux */}
          <div className="mt-4 p-4 rounded-xl bg-[rgb(var(--surface-soft))] space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[rgb(var(--text-muted))]">Total TTC</span><span className="font-semibold">{formatCurrency(subTotal)}</span></div>
            {method !== "WellnessCoins" ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[rgb(var(--text-muted))]">Montant reçu</span>
                <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0" className="input !w-32 !py-1.5 text-right !text-sm" />
              </div>
            ) : (
              <div className="flex justify-between"><span className="text-[rgb(var(--text-muted))]">Coins disponibles</span><span className="font-semibold text-gold-600 dark:text-gold-300">1 250</span></div>
            )}
            <div className="flex justify-between border-t border-[rgb(var(--border))] pt-1.5">
              <span className="text-[rgb(var(--text-muted))]">Monnaie à rendre</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{method === "WellnessCoins" ? "—" : formatCurrency(Math.max(0, restant))}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={cart.length === 0}
            className="btn-gold w-full justify-center mt-4 !py-3.5"
          >
            <CheckCircle2 size={17} /> Encaisser {formatCurrency(subTotal)}
          </button>
        </form>
      </div>

      {/* Confirm */}
      {done && (
        <Modal open={true} onClose={() => reset()} title="Paiement enregistré" size="sm"
          footer={<button onClick={reset} className="btn-gold w-full justify-center">Nouvel encaissement</button>}
        >
          <div className="text-center py-2">
            <span className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={26} />
            </span>
            <p className="font-display text-2xl font-bold">{formatCurrency(done.total)}</p>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
              Réglé par {done.method} · {done.client}
            </p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Reçu édité · {formatDate(new Date().toISOString())}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}