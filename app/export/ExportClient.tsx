"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Loader2, FileSpreadsheet, FileText, Users, Building2, Ticket, CreditCard } from "lucide-react";

type ExportType = "clients" | "users" | "tickets" | "factures" | "abonnements";
type ExportFormat = "csv" | "excel";

const EXPORTS = [
  {
    id: "clients" as ExportType,
    label: "Clients (tenants)",
    description: "Nom, slug, date inscription, statut actif",
    icon: Building2,
    color: "text-vayflo-600 bg-vayflo-50",
  },
  {
    id: "users" as ExportType,
    label: "Utilisateurs",
    description: "PrÃ©nom, nom, email, rÃ´le, tenant, statut",
    icon: Users,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "tickets" as ExportType,
    label: "Tickets",
    description: "Titre, statut, prioritÃ©, tenant, dates",
    icon: Ticket,
    color: "text-orange-600 bg-orange-50",
  },
  {
    id: "factures" as ExportType,
    label: "Factures",
    description: "NumÃ©ro, client, montant HT, TTC, statut, dates",
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "abonnements" as ExportType,
    label: "Abonnements",
    description: "Client, plan, tarif, frÃ©quence, statut, dates",
    icon: CreditCard,
    color: "text-purple-600 bg-purple-50",
  },
];

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(";"),
    ...rows.map((r) =>
      headers.map((h) => {
        const v = r[h];
        const s = v === null || v === undefined ? "" : String(v);
        return s.includes(";") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      }).join(";")
    ),
  ];
  return lines.join("\n");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchData(type: ExportType): Promise<Record<string, unknown>[]> {
  switch (type) {
    case "clients": {
      const { data } = await supabase.from("tenants").select("nom, slug, actif, cree_le, mis_a_jour_le, notification_email").order("cree_le", { ascending: false });
      return (data || []).map((d) => ({
        nom: d.nom, slug: d.slug, actif: d.actif ? "Oui" : "Non",
        email_notification: d.notification_email, date_inscription: d.cree_le?.slice(0, 10),
      }));
    }
    case "users": {
      const { data } = await supabase.from("user_profiles").select("prenom, nom, email, role, actif, cree_le, tenants(nom)").order("cree_le", { ascending: false });
      return (data || []).map((d) => ({
        prenom: d.prenom, nom: d.nom, email: d.email, role: d.role,
        actif: d.actif ? "Oui" : "Non",
        client: (d.tenants as unknown as { nom: string } | null)?.nom || "",
        date_creation: d.cree_le?.slice(0, 10),
      }));
    }
    case "tickets": {
      const { data } = await supabase.from("tickets").select("titre, statut, priorite, cree_le, tenants(nom)").order("cree_le", { ascending: false });
      return (data || []).map((d) => ({
        titre: d.titre, statut: d.statut, priorite: d.priorite,
        client: (d.tenants as unknown as { nom: string } | null)?.nom || "",
        date_creation: d.cree_le?.slice(0, 10),
      }));
    }
    case "factures": {
      const { data } = await supabase.from("vayflo_factures").select("numero, objet, montant_ht, taux_tva, statut, date_emission, date_echeance, tenants(nom)").order("date_emission", { ascending: false });
      return (data || []).map((d) => ({
        numero: d.numero, client: (d.tenants as unknown as { nom: string } | null)?.nom || "",
        objet: d.objet, montant_ht: d.montant_ht,
        tva: (d.montant_ht || 0) * ((d.taux_tva || 20) / 100),
        ttc: (d.montant_ht || 0) * (1 + (d.taux_tva || 20) / 100),
        statut: d.statut, date_emission: d.date_emission, date_echeance: d.date_echeance,
      }));
    }
    case "abonnements": {
      const { data } = await supabase.from("vayflo_abonnements").select("plan, prix_ht, frequence, statut, date_debut, date_fin, tenants(nom)").order("cree_le", { ascending: false });
      return (data || []).map((d) => ({
        client: (d.tenants as unknown as { nom: string } | null)?.nom || "",
        plan: d.plan, prix_ht: d.prix_ht, frequence: d.frequence, statut: d.statut,
        date_debut: d.date_debut, date_fin: d.date_fin,
      }));
    }
    default: return [];
  }
}

export default function ExportClient() {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [format, setFormat] = useState<ExportFormat>("csv");

  async function handleExport(type: ExportType) {
    setLoading(type);
    const rows = await fetchData(type);

    const ts = new Date().toISOString().slice(0, 10);
    const filename = `vayflo-${type}-${ts}`;

    if (format === "csv") {
      const csv = toCSV(rows);
      downloadCSV(csv, `${filename}.csv`);
    } else {
      // Excel via xlsx
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type);
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    setLoading(null);
  }

  return (
    <div className="space-y-6">
      {/* Format selector */}
      <div className="stat-card">
        <p className="text-sm font-semibold text-gray-700 mb-3">Format d&apos;export</p>
        <div className="flex gap-3">
          {(["csv", "excel"] as ExportFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                format === f
                  ? "border-vayflo-500 bg-vayflo-50 text-vayflo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "excel" ? <FileSpreadsheet className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {f === "csv" ? "CSV (sÃ©parateur ;)" : "Excel (.xlsx)"}
            </button>
          ))}
        </div>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EXPORTS.map((exp) => (
          <div key={exp.id} className="stat-card flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${exp.color}`}>
              <exp.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{exp.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{exp.description}</p>
            </div>
            <button
              onClick={() => handleExport(exp.id)}
              disabled={loading !== null}
              className="btn-secondary flex-shrink-0 text-xs px-3 py-1.5"
            >
              {loading === exp.id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Download className="h-3.5 w-3.5" />
              }
              Export
            </button>
          </div>
        ))}
      </div>

      {/* Tout exporter */}
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Tout exporter en une fois</p>
        <button
          onClick={async () => {
            for (const exp of EXPORTS) {
              await handleExport(exp.id);
              await new Promise((r) => setTimeout(r, 300));
            }
          }}
          disabled={loading !== null}
          className="btn-primary"
        >
          <Download className="h-4 w-4" />
          Tout exporter ({format.toUpperCase()})
        </button>
      </div>
    </div>
  );
}
