"use client";

import { Download } from "lucide-react";

export type LeadRow = {
  name: string;
  phone: string;
  email: string;
  createdAt: string; // ISO
};

function toCsv(rows: LeadRow[]): string {
  const header = ["שם", "טלפון", "מייל", "תאריך הרשמה"];
  const esc = (v: string) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [r.name, r.phone, r.email, new Date(r.createdAt).toLocaleString("he-IL")]
      .map(esc)
      .join(",")
  );
  // BOM so Excel reads UTF-8 (Hebrew) correctly
  return "﻿" + [header.join(","), ...lines].join("\r\n");
}

export function ExportCsvButton({
  rows,
  filename,
}: {
  rows: LeadRow[];
  filename: string;
}) {
  function download() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="size-4" />
      ייצוא ל-CSV ({rows.length})
    </button>
  );
}
