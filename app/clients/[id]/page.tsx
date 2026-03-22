export const dynamic = "force-dynamic";

import AppShell from "@/components/layout/AppShell";
import { supabaseAdmin } from "@/lib/supabase";
import {
  formatDate, formatCurrency,
  STATUT_ABONNEMENT_COLORS, STATUT_ABONNEMENT_LABELS,
  STATUT_FACTURE_COLORS, STATUT_FACTURE_LABELS,
} from "@/lib/utils";
import { notFound } from "next/navigation";
import { Building2, Users, Ticket, FileText, ArrowLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";

async function getClientData(id: string) {
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (!tenant) return null;

  const [
    { data: users },
    { data: immeubles },
    { data: tickets },
    { data: devis },
    { data: abonnements },
    { data: factures },
    { data: invitations },
  ] = await Promise.all([
    supabaseAdmin.from("user_profiles").select("id, nom, prenom, email, role, actif, cree_le").eq("tenant_id", id),
    supabaseAdmin.from("immeubles").select("id, nom, adresse, ville, code_postal").eq("organisation_id", id),
    supabaseAdmin.from("tickets").select("id, titre, statut, priorite, cree_le").eq("tenant_id", id).order("cree_le", { ascending: false }).limit(10),
    supabaseAdmin.from("devis").select("id, reference, statut, montant_ht, cree_le").eq("tenant_id", id).order("cree_le", { ascending: false }).limit(10),
    supabaseAdmin.from("vayflo_abonnements").select("*").eq("tenant_id", id).order("cree_le", { ascending: false }),
    supabaseAdmin.from("vayflo_factures").select("*").eq("tenant_id", id).order("date_emission", { ascending: false }),
    supabaseAdmin.from("invitations").select("email, used_at, expires_at, cree_le").eq("tenant_id", id).order("cree_le", { ascending: false }).limit(5),
  ]);

  return { tenant, users, immeubles, tickets, devis, abonnements, factures, invitations };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getClientData(id);
  if (!data) notFound();

  const { tenant, users, immeubles, tickets, devis, abonnements, factures } = data;

  const activeAbonnement = (abonnements || []).find((a) => a.statut === "actif" || a.statut === "essai");
  const totalFacture = (factures || []).filter((f) => f.statut === "payee").reduce((s, f) => s + (f.montant_ht || 0), 0);

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Back + Header */}
        <div>
          <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" /> Tous les clients
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.nom}</h1>
              <p className="mt-1 text-sm text-gray-400 font-mono">{tenant.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${tenant.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {tenant.actif ? "Actif" : "Inactif"}
              </span>
              <Link href={`/factures/new?tenant=${id}`} className="btn-primary">
                <FileText className="h-4 w-4" /> Nouvelle facture
              </Link>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Utilisateurs", value: users?.length || 0, icon: Users, color: "text-vayflo-600 bg-vayflo-50" },
            { label: "Immeubles", value: immeubles?.length || 0, icon: Building2, color: "text-emerald-600 bg-emerald-50" },
            { label: "Tickets", value: tickets?.length || 0, icon: Ticket, color: "text-orange-600 bg-orange-50" },
            { label: "CA encaissé", value: formatCurrency(totalFacture), icon: FileText, color: "text-green-600 bg-green-50" },
          ].map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Abonnement actif */}
          <div className="stat-card">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Abonnement</h2>
            {activeAbonnement ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plan</span>
                  <span className="font-semibold text-gray-900 capitalize">{activeAbonnement.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tarif</span>
                  <span className="font-semibold">{formatCurrency(activeAbonnement.prix_ht)} HT / {activeAbonnement.frequence}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Statut</span>
                  <span className={`badge ${STATUT_ABONNEMENT_COLORS[activeAbonnement.statut]}`}>
                    {STATUT_ABONNEMENT_LABELS[activeAbonnement.statut]}
                  </span>
                </div>
                {activeAbonnement.date_debut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Depuis</span>
                    <span className="text-sm">{formatDate(activeAbonnement.date_debut)}</span>
                  </div>
                )}
                {activeAbonnement.notes && (
                  <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{activeAbonnement.notes}</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3">
                <p className="text-sm font-medium text-purple-700">Bêta-testeur</p>
                <p className="text-xs text-purple-500">Pas encore d&apos;abonnement payant</p>
              </div>
            )}
            <Link href={`/abonnements?tenant=${id}`} className="mt-4 block text-xs text-vayflo-600 hover:underline">
              Gérer les abonnements →
            </Link>
          </div>

          {/* Utilisateurs */}
          <div className="stat-card">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Utilisateurs ({users?.length || 0})</h2>
            <div className="space-y-2">
              {(users || []).slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-vayflo-100 text-xs font-semibold text-vayflo-700">
                    {(u.prenom?.[0] || u.nom?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {u.prenom} {u.nom}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${u.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {u.role || "user"}
                  </span>
                </div>
              ))}
              {(users?.length || 0) === 0 && (
                <p className="text-sm text-gray-400 text-center py-3">Aucun utilisateur</p>
              )}
            </div>
          </div>
        </div>

        {/* Immeubles */}
        {(immeubles?.length || 0) > 0 && (
          <div className="stat-card">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Immeubles ({immeubles?.length})</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(immeubles || []).map((imm) => (
                <div key={imm.id} className="rounded-lg bg-gray-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-gray-800">{imm.nom}</p>
                  <p className="text-xs text-gray-400">{imm.adresse}{imm.ville ? `, ${imm.ville}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Factures */}
        <div className="stat-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Factures ({factures?.length || 0})</h2>
            <Link href={`/factures/new?tenant=${id}`} className="btn-secondary text-xs">
              + Nouvelle
            </Link>
          </div>
          {(factures?.length || 0) === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune facture</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-th">Numéro</th>
                    <th className="table-th">Objet</th>
                    <th className="table-th">Montant HT</th>
                    <th className="table-th">Émission</th>
                    <th className="table-th">Échéance</th>
                    <th className="table-th">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(factures || []).map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="table-td font-mono text-xs">{f.numero}</td>
                      <td className="table-td text-gray-500">{f.objet || "—"}</td>
                      <td className="table-td font-semibold">{formatCurrency(f.montant_ht)}</td>
                      <td className="table-td text-gray-400">{formatDate(f.date_emission)}</td>
                      <td className="table-td text-gray-400">{formatDate(f.date_echeance)}</td>
                      <td className="table-td">
                        <span className={`badge ${STATUT_FACTURE_COLORS[f.statut]}`}>
                          {STATUT_FACTURE_LABELS[f.statut]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tickets récents */}
        {(tickets?.length || 0) > 0 && (
          <div className="stat-card">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Tickets récents</h2>
            <div className="space-y-2">
              {(tickets || []).slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    t.statut === "ouvert" ? "bg-blue-400" :
                    t.statut === "en_cours" ? "bg-orange-400" :
                    t.statut === "resolu" ? "bg-green-400" : "bg-gray-300"
                  }`} />
                  <p className="flex-1 text-sm text-gray-700 truncate">{t.titre}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(t.cree_le)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
