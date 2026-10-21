"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, Circle, Info, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { notifications } from "@/data/extras";
import { useToast } from "@/context/ToastContext";
import { relativeTime } from "@/lib/utils";
import type { Notification } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";

const typeStyle: Record<Notification["type"], { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info size={15} />, color: "bg-sky-500" },
  success: { icon: <CheckCircle2 size={15} />, color: "bg-emerald-500" },
  warning: { icon: <AlertTriangle size={15} />, color: "bg-amber-500" },
  error: { icon: <AlertTriangle size={15} />, color: "bg-rose-500" },
};

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState("Toutes");

  const unreadCount = items.filter((n) => !n.read).length;

  const modules = useMemo(() => Array.from(new Set(notifications.map((n) => n.module))), []);

  const filtered = items.filter((n) => {
    if (filter === "Non lues" && n.read) return false;
    if (filter !== "Toutes" && filter !== "Non lues" && n.module !== filter) return false;
    return true;
  });

  const markAll = () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    showToast("Toutes les notifications ont été marquées comme lues.", "success");
  };

  const markOne = (id: string) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Notifications" subtitle={`${unreadCount} non lue${unreadCount > 1 ? "s" : ""} · ${items.length} au total`}>
<button onClick={markAll} disabled={unreadCount === 0} className="btn-outline disabled:opacity-40">
          <CheckCheck size={15} /> Tout marquer comme lu
        </button>
</PageHeader>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["Toutes", "Non lues", ...modules].map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`chip shrink-0 ${filter === m ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
          >
            {m}
            {m === "Non lues" && unreadCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="card p-10 flex flex-col items-center gap-3 text-center">
            <span className="w-14 h-14 rounded-2xl bg-gold-400/15 text-gold-600 dark:text-gold-300 flex items-center justify-center">
              <Bell size={24} />
            </span>
            <p className="font-display font-semibold">Aucune notification</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">Vous êtes à jour.</p>
          </div>
        )}
        {filtered.map((n) => {
          const s = typeStyle[n.type];
          return (
            <button
              key={n.id}
              onClick={() => markOne(n.id)}
              className={`card w-full text-left p-4 flex items-start gap-3 hover:border-gold-400/60 transition-colors ${!n.read ? "border-gold-400/50 bg-gold-400/[0.03]" : ""}`}
            >
              <span className={`w-8 h-8 rounded-lg ${s.color} text-white flex items-center justify-center shrink-0`}>{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm ${n.read ? "font-medium text-[rgb(var(--text-muted))]" : "font-semibold"}`}>{n.title}</p>
                  <span className="text-[11px] text-[rgb(var(--text-muted))] shrink-0">{relativeTime(n.date)}</span>
                </div>
                <p className="text-sm text-[rgb(var(--text-primary))] mt-0.5">{n.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-300">{n.module}</span>
                  {!n.read && <Circle size={9} className="fill-rose-500 text-rose-500" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <button
          onClick={() => showToast("Accès à tous les modules depuis le menu latéral.", "info")}
          className="w-full py-3 rounded-xl border border-dashed border-[rgb(var(--border))] hover:border-gold-400 text-sm text-[rgb(var(--text-muted))] flex items-center justify-center gap-1.5"
        >
          Voir plus <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}