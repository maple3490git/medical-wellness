import * as XLSX from "xlsx";
import type { Prestation } from "@/lib/types";

export interface ExportColumn<T> {
  title: string;
  value: (row: T) => string | number;
}

export function exportRowsToExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = "Export"
) {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((col) => [col.title, col.value(row)]))
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportPrestations(prestations: Prestation[], filename: string) {
  exportRowsToExcel(
    prestations,
    [
      { title: "Date", value: (p) => p.date },
      { title: "Nom", value: (p) => p.lastName },
      { title: "Prénom", value: (p) => p.firstName },
      { title: "Service", value: (p) => p.serviceName },
      { title: "Employé", value: (p) => p.employeeName },
      { title: "Heure entrée", value: (p) => p.timeIn },
      { title: "Heure sortie", value: (p) => p.timeOut },
      { title: "Prix (DH)", value: (p) => p.price },
      { title: "Statut", value: (p) => (p.status === "validated" ? "Validée" : "Soumise") },
      { title: "Date de saisie", value: (p) => p.createdAt },
    ],
    filename,
    "Prestations"
  );
}