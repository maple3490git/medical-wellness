"use client";

import { useState } from "react";
import { StickyNote, Plus, Pin, Users, Megaphone } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { relativeTime } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

type Note = {
  id: number;
  author: string;
  role: string;
  target: "Équipe" | "Médecins" | "Réception" | "Tous";
  title: string;
  text: string;
  pinned: boolean;
  date: string;
  color: string;
};

const initialNotes: Note[] = [
  {
    id: 1,
    author: "Salma Idrissi",
    role: "Chef de réception",
    target: "Réception",
    title: "Nouveau tarif SPA",
    text: "À partir de lundi, le forfait SPA & Hammam duo passe à 800 DH. Merci de vérifier les tarifs au moment de la confirmation des rendez-vous.",
    pinned: true,
    date: "2026-09-17T09:00:00",
    color: "bg-amber-400",
  },
  {
    id: 2,
    author: "Nadia Chraibi",
    role: "Esthéticienne",
    target: "Tous",
    title: "Commande de produits",
    text: "Nous recevrons la livraison d'argan et sérum Sothys jeudi. Je mettrai à jour le stock dès réception à l'accueil.",
    pinned: false,
    date: "2026-09-16T17:30:00",
    color: "bg-violet-400",
  },
  {
    id: 3,
    author: "Dr. Mehdi Mernissi",
    role: "Directeur médical",
    target: "Médecins",
    title: "Rappel : comité médical",
    text: "Comité médical de fin de mois vendredi à 12h30 en salle de réunion. Ordre du jour : bilan des protocoles anti-âge et admission des nouveaux protocoles.",
    pinned: false,
    date: "2026-09-15T14:20:00",
    color: "bg-sky-400",
  },
  {
    id: 4,
    author: "Youssef Alaoui",
    role: "Biologiste",
    target: "Équipe",
    title: "Analyse morphologique de masse",
    text: "Les prélèvements pour l'analyse morphologique sont à remettre au laboratoire avant 14h. Compter 48h pour les résultats.",
    pinned: false,
    date: "2026-09-15T10:00:00",
    color: "bg-emerald-400",
  },
];

const targets = ["Tous", "Équipe", "Médecins", "Réception"];

export default function NotesInternesPage() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  const filtered = notes.filter((n) => {
    if (filter !== "Toutes" && n.target !== filter && !(filter === "Épinglées" && n.pinned)) return false;
    const q = search.trim().toLowerCase();
    if (q && !n.title.toLowerCase().includes(q) && !n.author.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Notes internes" subtitle={`${notes.length} notes · Communications d'équipe`}>
<button onClick={() => setOpenAdd(true)} className="btn-gold">
          <Plus size={15} /> Nouvelle note
        </button>
</PageHeader>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une note..." />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["Toutes", "Épinglées", ...targets].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`chip shrink-0 ${filter === t ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((n) => (
          <div key={n.id} className={`card p-5 ${n.pinned ? "border-gold-400/60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar firstName={n.author.split(" ")[0]} lastName={n.author.split(" ")[1] ?? ""} size="md" className={`text-white ${n.color}`} />
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{n.author} · {n.role}</p>
                </div>
              </div>
              {n.pinned && <Pin size={15} className="text-gold-600 dark:text-gold-300 shrink-0" />}
            </div>
            <p className="text-sm leading-relaxed mt-3 text-[rgb(var(--text-primary))]">{n.text}</p>
            <div className="flex items-center justify-between mt-4">
              <Badge color={n.target === "Tous" ? "gold" : "zinc"}>
                <span className="inline-flex items-center gap-1">
                  {n.target === "Tous" ? <Megaphone size={11} /> : <Users size={11} />} {n.target}
                </span>
              </Badge>
              <span className="text-xs text-[rgb(var(--text-muted))]">{relativeTime(n.date)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add note */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Nouvelle note interne"
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button
              onClick={() => {
                setOpenAdd(false);
                showToast("Note publiée pour l'équipe.", "success");
              }}
              className="btn-gold"
            >
              <StickyNote size={15} /> Publier
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">Titre *</label>
            <input className="input" placeholder="Ex : Rappel planning de la semaine" />
          </div>
          <div>
            <label className="input-label">Destinataire</label>
            <select className="input">
              {targets.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Contenu *</label>
            <textarea rows={4} className="input resize-none" placeholder="Écrivez votre message à l'équipe..." />
          </div>
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
            <input type="checkbox" className="accent-[#d4af37]" /> Épingler cette note en haut
          </label>
        </div>
      </Modal>
    </div>
  );
}