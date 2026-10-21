"use client";

import { useMemo, useState } from "react";
import { FlaskConical, Plus, FileCheck2, Timer } from "lucide-react";
import { analyses, healthMetrics } from "@/data/extras";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/utils";
import type { AnalysisReport } from "@/lib/types";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function AnalysesPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"Rapports" | "Résultats">("Rapports");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [openDetail, setOpenDetail] = useState<AnalysisReport | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const filtered = useMemo(() => {
    let list = [...analyses].sort((a, b) => b.date.localeCompare(a.date));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((a) => a.patientName.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
    if (status !== "Tous") list = list.filter((a) => a.status === status);
    return list;
  }, [search, status]);

  const doneCount = analyses.filter((a) => a.status === "done").length;
  const pendingCount = analyses.filter((a) => a.status === "pending").length;

  const statusBadge = (s: AnalysisReport["status"]) => (
    <Badge color={s === "done" ? "emerald" : "amber"} dot>
      {s === "done" ? "Résultat disponible" : "En cours"}
    </Badge>
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Analyses" subtitle="Rapports de laboratoire et résultats biologiques">
<button onClick={() => setOpenNew(true)} className="btn-gold">
          <Plus size={15} /> Nouvelle analyse
        </button>
</PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Analyses cette semaine</p>
          <p className="font-display text-xl font-bold">{analyses.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Résultats disponibles</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{doneCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">En cours de traitement</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Marqueurs déséquilibrés</p>
          <p className="font-display text-xl font-bold text-rose-500">
            {healthMetrics.filter((m) => m.status !== "normal").length}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1.5 overflow-x-auto">
        {(["Rapports", "Résultats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`chip shrink-0 ${tab === t ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filtres */}
      {tab === "Rapports" && (
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un patient ou un type d'analyse..." />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto !py-2.5">
          <option value="Tous">Tous les statuts</option>
          <option value="done">Résultat disponible</option>
          <option value="pending">En cours</option>
        </select>
      </div>
      )}

      {/* Rapports */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="Aucune analyse trouvée" description="Modifiez vos filtres ou lancez une nouvelle analyse." />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table headers={["Patient", "Type d'analyse", "Date", "Médecin prescripteur", "Statut", "Résultat", ""]}>
                {filtered.map((a) => (
                  <TableRow key={a.id} onClick={() => a.status === "done" && setOpenDetail(a)}>
                    <Td className="font-medium">{a.patientName}</Td>
                    <Td>{a.type}</Td>
                    <Td>{formatDate(a.date)}</Td>
                    <Td>{a.doctorName}</Td>
                    <Td>{statusBadge(a.status)}</Td>
                    <Td className="text-[rgb(var(--text-muted))]">
                      {a.status === "done" ? (a.results ?? "").slice(0, 40) + "…" : "—"}
                    </Td>
                    <Td align="right">
                      {a.status === "done" ? (
                        <button onClick={() => setOpenDetail(a)} className="p-2 rounded-lg text-gold-600 dark:text-gold-300 hover:bg-[rgb(var(--surface-soft))]">
                          <FileCheck2 size={15} />
                        </button>
                      ) : (
                        <button onClick={() => showToast("Analyse en cours de traitement par le laboratoire.", "info")} className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]">
                          <Timer size={15} />
                        </button>
                      )}
                    </Td>
                  </TableRow>
                ))}
              </Table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
              {filtered.map((a) => (
                <button key={a.id} onClick={() => a.status === "done" && setOpenDetail(a)} className="w-full text-left p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{a.patientName}</p>
                    {statusBadge(a.status)}
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{a.type} · {formatDate(a.date)}</p>
                  <p className="text-[11px] text-[rgb(var(--text-muted))] mt-0.5">{a.doctorName}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Résultats tab */}
      {tab === "Résultats" && (
        <div className="card overflow-hidden">
          <p className="px-5 pt-5 text-sm font-semibold">Marqueurs biologiques</p>
          <div className="hidden lg:block mt-3">
            <Table headers={["Patient", "Test", "Date", "Résultat", "Référence", "Statut"]}>
              {healthMetrics.map((m, i) => (
                <TableRow key={i}>
                  <Td className="font-medium">{m.patientName}</Td>
                  <Td>{m.test}</Td>
                  <Td>{formatDate(m.date)}</Td>
                  <Td className="font-semibold">{m.result}</Td>
                  <Td className="text-[rgb(var(--text-muted))]">{m.reference}</Td>
                  <Td>
                    <Badge color={m.status === "normal" ? "emerald" : m.status === "attention" ? "amber" : "rose"} dot>
                      {m.status === "normal" ? "Dans les normes" : m.status === "attention" ? "À surveiller" : "Critique"}
                    </Badge>
                  </Td>
                </TableRow>
              ))}
            </Table>
          </div>
          <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
            {healthMetrics.map((m, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{m.test}</p>
                  <Badge color={m.status === "normal" ? "emerald" : m.status === "attention" ? "amber" : "rose"} dot>
                    {m.status === "normal" ? "Normes" : m.status === "attention" ? "Surveiller" : "Critique"}
                  </Badge>
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{m.patientName} · {formatDate(m.date)}</p>
                <p className="text-sm mt-1.5"><strong>{m.result}</strong> <span className="text-[rgb(var(--text-muted))]">· réf {m.reference}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail */}
      <Modal
        open={Boolean(openDetail)}
        onClose={() => setOpenDetail(null)}
        title={openDetail?.type ?? ""}
        subtitle={openDetail ? `${openDetail.patientName} · ${formatDate(openDetail.date)}` : ""}
        footer={
          <>
            <button onClick={() => setOpenDetail(null)} className="btn-outline">Fermer</button>
            <button onClick={() => { setOpenDetail(null); showToast("Résultat envoyé au patient et au médecin prescripteur.", "success"); }} className="btn-gold">
              Envoyer le résultat
            </button>
          </>
        }
      >
        {openDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-[rgb(var(--surface-soft))] p-4">
              <span className="w-10 h-10 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                <FlaskConical size={18} />
              </span>
              <div>
                <p className="font-medium">{openDetail.patientName}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Prescrit par {openDetail.doctorName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">Conclusion du laboratoire</p>
              <p className="text-sm leading-relaxed text-[rgb(var(--text-primary))]">
                {openDetail.results ?? "Résultat en cours de validation par le biologiste."}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* New analysis */}
      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="Prescrire une nouvelle analyse"
        footer={
          <>
            <button onClick={() => setOpenNew(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenNew(false); showToast("Analyse prescrite et transmise au laboratoire.", "success"); }} className="btn-gold">
              <Plus size={15} /> Transmettre au laboratoire
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Patient *</label>
            <select className="input">
              {["Adam Karim", "Fatima Zahra El Idrissi", "Rachid Benkiran", "Nora Fassi", "Meryem Fikri", "Hassan Tahiri"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Type d'analyse</label>
            <select className="input">
              {["Profilage micronutritionnel (Oligocheck)", "Bilan métabolique complet", "Profilage hormonal", "Bilan lipidique", "Analyse morphologique"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Médecin prescripteur</label>
            <select className="input">
              {["Dr. Mehdi Mernissi", "Dr. Abdelali Mernissi", "Youssef Alaoui"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Date de prélèvement</label>
            <input type="date" className="input" defaultValue="2026-09-17" />
          </div>
        </div>
      </Modal>
    </div>
  );
}