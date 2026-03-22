export const dynamic = "force-dynamic";

import AppShell from "@/components/layout/AppShell";
import { supabaseAdmin } from "@/lib/supabase";
import { formatDate, formatCurrency, STATUT_ABONNEMENT_COLORS, STATUT_ABONNEMENT_LABELS } from "@/lib/utils";
import AbonnementsClient from "./AbonnementsClient";

async function getData() {
  const [{ data: abonnements }, { data: tenants }] = await Promise.all([
    supabaseAdmin.from("vayflo_abonnements").select("*, tenants(nom, slug)").order("cree_le", { ascending: false }),
    supabaseAdmin.from("tenants").select("id, nom, slug").order("nom"),
  ]);
  return { abonnements: abonnements || [], tenants: tenants || [] };
}

export default async function AbonnementsPage() {
  const { abonnements, tenants } = await getData();
  const mrr = abonnements.filter((a) => a.statut === "actif").reduce((sum, a) => sum + (a.frequence === "annuel" ? (a.prix_ht || 0) / 12 : (a.prix_ht || 0)), 0);
  const arr = abonnements.filter((a) => a.statut === "actif").reduce((sum, a) => sum + (a.frequence === "annuel" ? (a.prix_ht || 0) : (a.prix_ht || 0) * 12), 0);
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Abonnements</h1><p className="mt-1 text-sm text-gray-500">Gestion manuelle des contrats clients</p></div>
          <AbonnementsClient tenants={tenants} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[{ label: "MRR estimÃ©", value: formatCurrency(mrr), sub: "Monthly Recurring Revenue" },{ label: "ARR estimÃ©", value: formatCurrency(arr), sub: "Annual Recurring Revenue" },{ label: "Abonnements actifs", value: abonnements.filter((a) => a.statut === "actif").length, sub: `sur ${abonnements.length} total` }].map((s) => (
            <div key={s.label} className="stat-card"><p className="text-xs text-gray-500">{s.label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.sub}</p></div>
          ))}
        </div>
        <div className="stat-card p-0 overflow-hidden"><div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="table-th">Client</th><th className="table-th">Plan</th><th className="table-th">Tarif HT</th><th className="table-th">FrÃ©quence</th><th className="table-th">DÃ©but</th><th className="table-th">Fin</th><th className="table-th">Statut</th><th className="table-th">Notes</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {abonnements.length === 0 && (<tr><td colSpan={8} className="table-td text-center text-gray-400 py-8">Aucun abonnement.</td></tr>)}
                {abonnements.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="table-td"><a href={`/clients/${a.tenant_id}`} className="font-medium text-gray-900 hover:text-vayflo-600">{(a.tenants as { nom: string } | null)?.nom || "â"}</a></td>
                    <td className="table-td font-medium capitalize">{a.plan}</td>
                    <td className="table-td font-semibold">{formatCurrency(a.prix_ht || 0)}</td>
                    <td className="table-td text-gray-500 capitalize">{a.frequence}</td>
                    <td className="table-td text-gray-400">{formatDate(a.date_debut)}</td>
                    <td className="table-td text-gray-400">{formatDate(a.date_fin)}</td>
                    <td className="table-td"><span className={`badge ${STATUT_ABONNEMENT_COLORS[a.statut] || "bg-gray-100"}`}>{STATUT_ABONNEMENT_LABELS[a.statut] || a.statut}</span></td>
                    <td className="table-td text-xs text-gray-400 max-w-xs truncate">{a.notes || "â"}</td>
                  </tr>
                ))}
              </tbody>
            </table></div></div>
      </div>
    </AppShell>
  );
}
