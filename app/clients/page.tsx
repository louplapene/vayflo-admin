export const dynamic = "force-dynamic";

import AppShell from "@/components/layout/AppShell";
import { supabaseAdmin } from "@/lib/supabase";
import { formatDate, STATUT_ABONNEMENT_COLORS, STATUT_ABONNEMENT_LABELS } from "@/lib/utils";
import { Building2, Plus, Users, Ticket } from "lucide-react";
import Link from "next/link";

async function getClients() {
  const { data: tenants } = await supabaseAdmin
    .from("tenants")
    .select("id, nom, slug, actif, cree_le, notification_email")
    .order("cree_le", { ascending: false });

  if (!tenants) return [];

  // Stats par tenant en parallèle
  const clientsWithStats = await Promise.all(
    tenants.map(async (t) => {
      const [
        { count: users },
        { count: tickets },
        { count: immeubles },
        { data: abonnement },
      ] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabaseAdmin.from("immeubles").select("*", { count: "exact", head: true }).eq("organisation_id", t.id),
        supabaseAdmin.from("vayflo_abonnements").select("plan, statut, prix_ht").eq("tenant_id", t.id).eq("statut", "actif").maybeSingle(),
      ]);
      return { ...t, users: users || 0, tickets: tickets || 0, immeubles: immeubles || 0, abonnement };
    })
  );

  return clientsWithStats;
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="mt-1 text-sm text-gray-500">
              {clients.length} client{clients.length > 1 ? "s" : ""} sur ImmoGravity
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="stat-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Client</th>
                  <th className="table-th">Abonnement</th>
                  <th className="table-th">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Utilisateurs</span>
                  </th>
                  <th className="table-th">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> Immeubles</span>
                  </th>
                  <th className="table-th">
                    <span className="flex items-center gap-1"><Ticket className="h-3 w-3" /> Tickets</span>
                  </th>
                  <th className="table-th">Inscription</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <div>
                        <p className="font-semibold text-gray-900">{c.nom}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.slug}</p>
                      </div>
                    </td>
                    <td className="table-td">
                      {c.abonnement ? (
                        <div>
                          <span className={`badge ${STATUT_ABONNEMENT_COLORS[c.abonnement.statut] || "bg-gray-100 text-gray-600"}`}>
                            {c.abonnement.plan}
                          </span>
                          {c.abonnement.prix_ht > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{c.abonnement.prix_ht}€ HT/mois</p>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-purple-100 text-purple-700">Beta</span>
                      )}
                    </td>
                    <td className="table-td text-center font-semibold">{c.users}</td>
                    <td className="table-td text-center font-semibold">{c.immeubles}</td>
                    <td className="table-td text-center font-semibold">{c.tickets}</td>
                    <td className="table-td text-gray-400">{formatDate(c.cree_le)}</td>
                    <td className="table-td">
                      <span className={`badge ${c.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="table-td">
                      <Link
                        href={`/clients/${c.id}`}
                        className="text-xs text-vayflo-600 hover:underline font-medium"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
