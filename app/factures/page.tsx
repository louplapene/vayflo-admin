export const dynamic = "force-dynamic";

import AppShell from "@/components/layout/AppShell";
import { supabaseAdmin } from "@/lib/supabase";
import {
  formatDate, formatCurrency,
  STATUT_FACTURE_COLORS, STATUT_FACTURE_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

async function getFactures() {
  const { data } = await supabaseAdmin
    .from("vayflo_factures")
    .select("*, tenants(nom)")
    .order("date_emission", { ascending: false });
  return data || [];
}

export default async function FacturesPage() {
  const factures = await getFactures();

  const totalPaye = factures.filter((f) => f.statut === "payee").reduce((s, f) => s + (f.montant_ht || 0), 0);
  const totalEnAttente = factures.filter((f) => ["envoyee", "retard"].includes(f.statut)).reduce((s, f) => s + (f.montant_ht || 0), 0);
  const totalBrouillon = factures.filter((f) => f.statut === "brouillon").reduce((s, f) => s + (f.montant_ht || 0), 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
            <p className="mt-1 text-sm text-gray-500">{factures.length} facture{factures.length > 1 ? "s" : ""}</p>
          </div>
          <Link href="/factures/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Nouvelle facture
          </Link>
        </div>

        {/* RÃ©sumÃ© financier */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "EncaissÃ©", value: totalPaye, color: "text-green-600", bg: "bg-green-50 border-green-100" },
            { label: "En attente", value: totalEnAttente, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
            { label: "Brouillons", value: totalBrouillon, color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="stat-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">NÂ°</th>
                  <th className="table-th">Client</th>
                  <th className="table-th">Objet</th>
                  <th className="table-th">Montant HT</th>
                  <th className="table-th">TVA</th>
                  <th className="table-th">TTC</th>
                  <th className="table-th">Ãmission</th>
                  <th className="table-th">ÃchÃ©ance</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {factures.length === 0 && (
                  <tr>
                    <td colSpan={10} className="table-td text-center text-gray-400 py-10">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                      Aucune facture. CrÃ©ez la premiÃ¨re.
                    </td>
                  </tr>
                )}
                {factures.map((f) => {
                  const tva = (f.montant_ht || 0) * ((f.taux_tva || 20) / 100);
                  const ttc = (f.montant_ht || 0) + tva;
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="table-td font-mono text-xs font-semibold">{f.numero}</td>
                      <td className="table-td">
                        <a href={`/clients/${f.tenant_id}`} className="font-medium text-gray-900 hover:text-vayflo-600">
                          {(f.tenants as { nom: string } | null)?.nom || "â"}
                        </a>
                      </td>
                      <td className="table-td text-gray-500 max-w-xs truncate">{f.objet || "â"}</td>
                      <td className="table-td font-semibold">{formatCurrency(f.montant_ht || 0)}</td>
                      <td className="table-td text-gray-400">{f.taux_tva}%</td>
                      <td className="table-td font-semibold">{formatCurrency(ttc)}</td>
                      <td className="table-td text-gray-400">{formatDate(f.date_emission)}</td>
                      <td className="table-td text-gray-400">{formatDate(f.date_echeance)}</td>
                      <td className="table-td">
                        <span className={`badge ${STATUT_FACTURE_COLORS[f.statut] || "bg-gray-100 text-gray-600"}`}>
                          {STATUT_FACTURE_LABELS[f.statut] || f.statut}
                        </span>
                      </td>
                      <td className="table-td">
                        <Link href={`/factures/${f.id}`} className="text-xs text-vayflo-600 hover:underline">
                          GÃ©rer â
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
