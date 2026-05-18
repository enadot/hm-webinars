"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Phone,
  Mail,
  Users,
  X,
} from "lucide-react";

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  createdAt: string; // ISO
};

type SortDir = "desc" | "asc";

function csvEscape(v: string): string {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(rows: LeadRow[]): string {
  const header = [
    "שם",
    "טלפון",
    "מייל",
    "מקור (source)",
    "אמצעי (medium)",
    "קמפיין (campaign)",
    "תוכן (content)",
    "מילה (term)",
    "תאריך הרשמה",
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      r.phone,
      r.email,
      r.utmSource ?? "",
      r.utmMedium ?? "",
      r.utmCampaign ?? "",
      r.utmContent ?? "",
      r.utmTerm ?? "",
      new Date(r.createdAt).toLocaleString("he-IL"),
    ]
      .map(csvEscape)
      .join(",")
  );
  // BOM for Excel UTF-8 (Hebrew)
  return "﻿" + [header.join(","), ...lines].join("\r\n");
}

function uniqueValues(rows: LeadRow[], key: keyof LeadRow): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    const v = r[key];
    if (typeof v === "string" && v.trim()) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "he"));
}

export function LeadsTable({
  allRows,
  filenameBase,
}: {
  allRows: LeadRow[];
  filenameBase: string;
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sources = useMemo(() => uniqueValues(allRows, "utmSource"), [allRows]);
  const mediums = useMemo(() => uniqueValues(allRows, "utmMedium"), [allRows]);
  const campaigns = useMemo(() => uniqueValues(allRows, "utmCampaign"), [allRows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = allRows.filter((r) => {
      if (source && r.utmSource !== source) return false;
      if (medium && r.utmMedium !== medium) return false;
      if (campaign && r.utmCampaign !== campaign) return false;
      if (needle) {
        const hay = [
          r.name,
          r.phone,
          r.email,
          r.utmSource,
          r.utmMedium,
          r.utmCampaign,
          r.utmContent,
          r.utmTerm,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });
    return out;
  }, [allRows, q, source, medium, campaign, sortDir]);

  const hasFilters = q || source || medium || campaign;

  function clearFilters() {
    setQ("");
    setSource("");
    setMedium("");
    setCampaign("");
  }

  function exportCsv() {
    const blob = new Blob([buildCsv(filtered)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש: שם, טלפון, מייל, UTM..."
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <FilterSelect label="מקור" value={source} onChange={setSource} options={sources} />
        <FilterSelect label="אמצעי" value={medium} onChange={setMedium} options={mediums} />
        <FilterSelect label="קמפיין" value={campaign} onChange={setCampaign} options={campaigns} />

        <button
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="inline-flex items-center gap-1.5 h-10 px-3 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          title="מיון לפי תאריך"
        >
          {sortDir === "desc" ? (
            <ArrowDown className="size-4" />
          ) : (
            <ArrowUp className="size-4" />
          )}
          {sortDir === "desc" ? "חדש→ישן" : "ישן→חדש"}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 h-10 px-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <X className="size-4" />
            נקה
          </button>
        )}

        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download className="size-4" />
          ייצוא CSV ({filtered.length})
        </button>
      </div>

      <div className="text-sm text-slate-500">
        מציג <span className="font-bold text-slate-900">{filtered.length}</span> מתוך{" "}
        {allRows.length} לידים
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center">
          <div className="size-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="size-8" />
          </div>
          <h2 className="text-xl font-extrabold mb-2">
            {allRows.length === 0 ? "אין עדיין לידים" : "אין תוצאות לסינון"}
          </h2>
          <p className="text-slate-600">
            {allRows.length === 0
              ? "לידים שיירשמו דרך הטופס יופיעו כאן."
              : "נסו לשנות את החיפוש או הסינון."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <Th className="w-12">#</Th>
                  <Th>שם</Th>
                  <Th>טלפון</Th>
                  <Th>מייל</Th>
                  <Th>מקור</Th>
                  <Th>אמצעי</Th>
                  <Th>קמפיין</Th>
                  <Th>תוכן</Th>
                  <th
                    className="text-start font-bold px-4 py-3 cursor-pointer select-none hover:text-slate-900"
                    onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                  >
                    <span className="inline-flex items-center gap-1">
                      תאריך הרשמה
                      <ArrowUpDown className="size-3.5" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-slate-400 tabular-nums">
                      {sortDir === "desc" ? filtered.length - i : i + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{l.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${l.phone}`}
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-primary font-mono"
                      >
                        <Phone className="size-3.5 text-slate-400" />
                        {l.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${l.email}`}
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-primary"
                      >
                        <Mail className="size-3.5 text-slate-400" />
                        {l.email}
                      </a>
                    </td>
                    <Cell value={l.utmSource} tone="primary" />
                    <Cell value={l.utmMedium} tone="purple" />
                    <Cell value={l.utmCampaign} tone="gold" />
                    <Cell value={l.utmContent} />
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(l.createdAt).toLocaleString("he-IL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`text-start font-bold px-4 py-3 ${className}`}>{children}</th>
  );
}

function Cell({
  value,
  tone,
}: {
  value: string | null;
  tone?: "primary" | "purple" | "gold";
}) {
  if (!value) return <td className="px-4 py-3 text-slate-300">—</td>;
  const cls =
    tone === "primary"
      ? "bg-brand-primary/10 text-brand-primary"
      : tone === "purple"
      ? "bg-brand-purple/10 text-brand-purple"
      : tone === "gold"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return (
    <td className="px-4 py-3">
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>
        {value}
      </span>
    </td>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 px-3 text-sm rounded-lg border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
        value ? "border-brand-primary text-brand-primary font-bold" : "border-slate-200"
      }`}
      disabled={options.length === 0}
    >
      <option value="">{label}: הכל</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
