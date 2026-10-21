"use client";

import { useMemo, useState } from "react";
import { FileText, Plus, Upload, Download, Trash2, FolderOpen, FileSpreadsheet } from "lucide-react";
import { documents } from "@/data/extras";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/lib/types";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

const icons: Record<string, React.ReactNode> = {
  PDF: <FileText size={15} />,
  XLSX: <FileSpreadsheet size={15} />,
  DOCX: <FileText size={15} />,
  IMG: <FolderOpen size={15} />,
};

export default function DocumentsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [openUpload, setOpenUpload] = useState(false);

  const categories = useMemo(() => Array.from(new Set(documents.map((d) => d.category))), []);

  const filtered = useMemo(() => {
    let list = [...documents].sort((a, b) => b.date.localeCompare(a.date));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((d) => d.name.toLowerCase().includes(q) || (d.patientName ?? "").toLowerCase().includes(q));
    if (category !== "Tous") list = list.filter((d) => d.category === category);
    return list;
  }, [search, category]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Documents" subtitle={`${documents.length} documents · Médiathèque médicale et administrative`}>
<button onClick={() => setOpenUpload(true)} className="btn-gold">
          <Upload size={15} /> Importer un document
        </button>
</PageHeader>

      {/* Corbeille de tri */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un document..." />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["Tous", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip shrink-0 ${category === c ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="Aucun document trouvé" description="Modifiez vos filtres ou importez un document." />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table headers={["Document", "Catégorie", "Patient", "Importé par", "Date", "Poids", "Type", ""]}>
                {filtered.map((d) => (
                  <TableRow key={d.id} onClick={() => showToast(`Ouverture de «${d.name}» (démo).`, "info")}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                          {icons[d.type] ?? <FolderOpen size={15} />}
                        </span>
                        <p className="font-medium text-sm">{d.name}</p>
                      </div>
                    </Td>
                    <Td><Badge color="zinc">{d.category}</Badge></Td>
                    <Td>{d.patientName ?? "—"}</Td>
                    <Td>{d.uploadedBy}</Td>
                    <Td>{formatDate(d.date)}</Td>
                    <Td className="text-[rgb(var(--text-muted))]">{d.size}</Td>
                    <Td>
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[rgb(var(--surface-soft))]">{d.type}</span>
                    </Td>
                    <Td align="right">
                      <button onClick={(e) => { e.stopPropagation(); showToast("Téléchargement en cours...", "info"); }} className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]">
                        <Download size={14} />
                      </button>
                    </Td>
                  </TableRow>
                ))}
              </Table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
              {filtered.map((d) => (
                <button key={d.id} onClick={() => showToast(`Ouverture de «${d.name}» (démo).`, "info")} className="w-full text-left p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                      {icons[d.type] ?? <FolderOpen size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{d.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{d.patientName ?? "Aucun patient"} · {formatDate(d.date)}</p>
                    </div>
                    <Badge color="zinc">{d.type}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Upload modal */}
      <Modal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        title="Importer un document"
        subtitle="PDF, XLSX, DOCX ou image — 10 Mo max."
        footer={
          <>
            <button onClick={() => setOpenUpload(false)} className="btn-outline">Annuler</button>
            <button
              onClick={() => {
                setOpenUpload(false);
                showToast("Document importé avec succès.", "success");
              }}
              className="btn-gold"
            >
              <Plus size={15} /> Importer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <button
            onClick={() => showToast("Sélection de fichier (démo).", "info")}
            className="w-full border-2 border-dashed border-[rgb(var(--border))] rounded-2xl p-8 hover:border-gold-400 flex flex-col items-center gap-2 text-[rgb(var(--text-muted))]"
          >
            <Upload size={22} className="text-gold-600 dark:text-gold-300" />
            <span className="text-sm font-medium">Glissez votre fichier ici ou cliquez pour parcourir</span>
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Catégorie</label>
              <select className="input">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Patient associé</label>
              <select className="input">
                {["Adam Karim", "Fatima Zahra El Idrissi", "Meryem Fikri", "Sara El Amrani", "Aucun"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}