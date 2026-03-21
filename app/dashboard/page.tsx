import AppShell from "@/components/layout/AppShell";
import { supabaseAdmin } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users, Building2, Ticket, FileText,
  TrendingUp, Activity, Calendar, AlertCircle
} from "lucide-react";
import DashboardCharts from "./DashboardCharts";

async function getDashboardData() {
  const [
    { count: totalTenants },
    { count: activeTenants },
    { count: totalUsers },
    { count: totalTickets },
    { count: openTickets },
    { count: totalDevis },
    { count: totalImmeubles },
    { data: recentTenants },
    { data: facturesEnAttente },
    { data: ticketsByMonth },
  ] = await Promise.all([
    supabaseAdmin.from("tenants").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("tenants").select("*", { count: "exact", head: true }).eq("actif", true),
    supabaseAdmin.from("user_profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).not("statut", "in", '("resolu","ferme","clos")'),
    supabaseAdmin.from("devis").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("immeubles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("tenants").select("id, nom, slug, cree_le, actif").order("cree_le", { ascending: false }).limit(5),
    supabaseAdmin.from("vayflo_factures").select("id, numero, montant_ht, date_echeance, statut, tenant_id").in("statut", ["envoyee", "retard"]).order("date_echeance"),
    supabaseAdmin.rpc("get_tickets_by_month").limit(6),
  ]);

  const { data: abonnements } = await supabaseAdmin
    .from("vayflo_abonnements")
    .select("prix_ht, frequence")
    .eq("statut", "actif");

  const mrr = (abonnements || []).reduce((sum, a) => {
    const monthly = a.frequence === "annuel" ? a.prix_ht / 12 : a.prix_ht;
    return sum + (monthly || 0);
  }, 0);

  return { totalTenants: totalTenants || 0, activeTenants: activeTenants || 0, totalUsers: totalUsers || 0, totalTickets: totalTickets || 0, openTickets: openTickets || 0, totalDevis: totalDevis || 0, totalImmeubles: totalImmeubles || 0, mrr, recentTenants: recentTenants || [], facturesEnAttente: facturesEnAttente || [], ticketsByMonth: ticketsByMonth || [] };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const stats = [
    { label: "Clients actifs", value: data.activeTenants, sub: `${data.totalTenants} total`, icon: Building2, color: "text-vayflo-600", bg: "bg-vayflo-50" },
    { label: "Utilisateurs", value: data.totalUsers, sub: "sur la plateforme", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Tickets ouverts", value: data.openTickets, sub: `${data.totalTickets} total`, icon: Ticket, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "MRR estimÃ©", value: formatCurrency(data.mrr), sub: `${data.totalDevis} devis gÃ©nÃ©rÃ©s`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  ];
  return (<AppShell><div className="space-y-8"><div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="mt-1 text-sm text-gray-500">Vue d&apos;ensemble de la plateforme</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => (<div key={stat.label} className="stat-card flex items-start gap-4"><div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}><stat.icon className={`p-5 w-5 ${stat.color}`} /></div><div><p className="text-xs text-gray-500">{stat.label}</p><p className="mt-0.5 text-2xl font-bold text-gray-900">{stat.value}</p><p className="text-xs text-gray-400">{stat.sub}</p></div></div>))}</div><div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><div className="lg:col-span-2 stat-card"><div className="mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-gray-400" /><h2 className="text-sm font-semibold text-gray-700">ActivitÃ© tickets</h2></div><DashboardCharts totalImmeubles={data.totalImmeubles} totalDevis={data.totalDevis} activeTenants={data.activeTenants} /></div><div className="stat-card"><div className="mb-4 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-orange-400" /><h2 className="text-sm font-semibold text-gray-700">Factures en attente</h2></div>{facturesEnAttente.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">Aucune facture</p> : <div className="space-y-3">{data.facturesEnAttente.map((f: { id: string; numero: string; montant_ht: number; date_echeance: string; statut: string }) => (<div key={f.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"><div><p className="text-sm font-medium text-gray-800">{f.numero}</p><p className="text-xs text-gray-400">{formatDate(f.date_echeance)}</p></div><div><p className="text-sm font-semibold text-gray-900">{formatCurrency(f.montant_ht)}</p><span className={`badge ${f.statut === "retard" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{f.statut === "retard" ? "En retard" : "EnvoyÃ©e"}</span></div></div>))}</div>}</div></div><div className="stat-card"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-700">Derniers clients</h2><a href="/clients" className="text-xs text-vayflo-600 hover:underline">Voir tous</a></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100"><th className="table-th">Nom</th><th className="table-th">Statut</th><th className="table-th">Inscription</th></tr></thead><tbody className="divide-y divide-gray-50">{data.recentTenants.map((t: { id: string; nom: string; actif: boolean; cree_le: string }) => (<tr key={t.id} className="hover:bg-gray-50"><td className="table-td"><a href={`/clients/${t.id}`} className="font-medium text-gray-900">{t.nom}</a></td><td className="table-td"><span className={`badge ${t.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{t.actif ? "Actif" : "Inactif"}</span></td><td className="table-td text-gray-400">{formatDate(t.cree_le)}</td></tr>))}</tbody></table></div></div></div></AppShell>);
}
