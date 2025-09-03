/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/exporters.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type Row = Record<string, any>;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportToCSV(rows: Row[] | undefined | null, filename = "export.csv") {
  const safe = Array.isArray(rows) ? rows : [];
  if (!safe.length) {
    downloadBlob(new Blob([""], { type: "text/csv;charset=utf-8;" }), filename);
    return;
  }

  const header = Object.keys(safe[0]);
  const lines = safe.map(r =>
    header
      .map(h => {
        const v = r[h] ?? "";
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      })
      .join(",")
  );

  const csv = [header.join(","), ...lines].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportToExcel(rows: Row[] | undefined | null, filename = "export.xlsx", sheetName = "Sheet1") {
  const safe = Array.isArray(rows) ? rows : [];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(safe);
  const keys = safe.length ? Object.keys(safe[0]) : [];
  ws["!cols"] = keys.map(() => ({ wch: 18 })); // set basic column widths
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([wbout], { type: "application/octet-stream" }), filename);
}

export function exportToPDF(
  rows: Row[] | undefined | null,
  filename = "export.pdf",
  options?: {
    title?: string;
    columns?: { key: string; header: string }[];
    orientation?: "p" | "l";
  }
) {
  const safe = Array.isArray(rows) ? rows : [];
  const doc = new jsPDF({ orientation: options?.orientation ?? "p", unit: "pt" });
  const title = options?.title ?? "Export";
  doc.setFontSize(16);
  doc.text(title, 40, 40);

  let columns = options?.columns;
  if (!columns || !columns.length) {
    const keys = safe.length ? Object.keys(safe[0]) : [];
    columns = keys.map(k => ({ key: k, header: k }));
  }

  const head = [columns.map(c => c.header)];
  const body = safe.map(r => columns!.map(c => r[c.key]));

  autoTable(doc, {
    startY: 60,
    head,
    body,
    styles: { fontSize: 9 },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename);
}
