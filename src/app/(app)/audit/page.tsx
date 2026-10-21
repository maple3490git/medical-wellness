"use client";

import { useMemo, useState } from "react";
import { History, ShieldCheck, FileWarning } from "lucide-react";
import { auditLog } from "@/data/extras";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Avatar from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("Tous");
  const [showExport, setShowExport] = useState(false);

  const modules = useMemo(() => Array.from(new Set(auditLog.map((a) => a.module))), []);

  const filtered = useMemo(() => {
    let list = [...auditLog].sort((a, b) => b.date.localeCompare(a.date));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((l) => l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.module.toLowerCase().includes(q));
    if (module !== "Tous") list = list.filter((l) => l.module === module);
    return list;
  }, [search, module]);

  const today = auditLog.filter((a) => a.date.startsWith("2026-09-17")).length;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Journal d'audit" subtitle={`Traçabilité des actions · ${auditLog.length} événements`}>
<button onClick={() => setShowExport(true)} className="btn-outline">
          <ShieldCheck size={15} /> Exporter la trace
        </button>
</PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Événements aujourd'hui</p>
          <p className="font-display text-xl font-bold text-gold-600 dark:text-gold-300">{today}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Modules suivis</p>
          <p className="font-display text-xl font-bold">{modules.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Utilisateurs actifs</p>
          <p className="font-display text-xl font-bold">{new Set(auditLog.map((a) => a.user)).size}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Actions de modification</p>
          <p className="font-display text-xl font-bold">{auditLog.filter((a) => a.action.includes("Modification")).length}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Utilisateur, action, module..." />
        <select value={module} onChange={(e) => setModule(e.target.value)} className="input !w-auto !py-2.5">
          <option value="Tous">Tous les modules</option>
          {modules.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden lg:block">
          <Table headers={["Utilisateur", "Action", "Module", "Date & heure", "Avant", "Après"]}>
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar firstName={a.user.split(" ")[0]} lastName={a.user.split(" ")[1] ?? ""} size="sm" />
                    <span className="font-medium text-sm">{a.user}</span>
                  </div>
                </Td>
                <Td>
                  <Badge color={a.action.includes("créé") || a.action === "Création patient" ? "emerald" : a.action.includes("Modification") ? "amber" : "zinc"}>
                    {a.action}
                  </Badge>
                </Td>
                <Td>{a.module}</Td>
                <Td className="text-[rgb(var(--text-muted))]">{formatDateTime(a.date)}</Td>
                <Td className={a.previousValue ? "text-rose-500 line-through decoration-rose-300/50" : "text-[rgb(var(--text-muted))]"}>
                  {a.previousValue ?? "—"}
                </Td>
                <Td className="text-emerald-600 dark:text-emerald-400">{a.newValue ?? "—"}</Td>
              </TableRow>
            ))}
          </Table>
        </div>

        <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
          {filtered.map((a) => (
            <div key={a.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{a.user}</p>
                <Badge color="zinc">{a.module}</Badge>
              </div>
              <p className="text-sm mt-1"><span className="text-[rgb(var(--text-muted))]">{a.action} :</span> {a.newValue}</p>
              <p className="text-[11px] text-[rgb(var(--text-muted))] mt-1">{formatDateTime(a.date)}</p>
            </div>
          ))}
        </div>
      </div>

      {showExport && (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--border))] p-4 flex items-center gap-3 animate-fade-in-up">
          <span className="w-9 h-9 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center shrink-0">
            <FileWarning size={16} />
          </span>
          <div className="flex-1 text-sm">
            <p className="font-medium">Export de la trace d'audit</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">Fichier CSV horodaté (prototype — paramétré dans Paramètres → Conformité).</p>
          </div>
          <button onClick={() => setShowExport(false)} className="btn-ghost !py-2 text-xs">Fermer</button>
        </div>
      )}
    </div>
  );
}