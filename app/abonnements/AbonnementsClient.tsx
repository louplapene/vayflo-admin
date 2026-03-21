"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Tenant { id: string; nom: string; slug: string; }
interface Props {
  tenants: Tenant[];
  preselectedTenantId?: string;
}

export default function AbonnementsClient({ tenants, preselectedTenantId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tenant_id: preselectedTenantId || "",
    plan: "starter",
    prix_ht: "",
    frequence: "mensuel",
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: "",
    statut: "essai",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("vayflo_abonnements").insert({
      ...form,
      prix_ht: parseFloat(form.prix_ht) || 0,
      date_fin: form.date_fin || null,
    });
    setLoading(false);
    if (!error) { setOpen(false); router.refresh(); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h4 w-4" /> Nouvel abonnement</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Nouvel abonnement</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select required value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none">
                  <option value="">SÃ©lectionner un client...</option>
                  {tenants.map((t) => (<option key={t.id} value={t.id}>{t.nom}</option>))}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <input required type="text" placeholder="ex: starter, pro..." value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price HT (â¬)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.prix_ht} onChange={(e) => setForm({ ...form, prix_ht: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">FrÃ©quence</label>
                  <select value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none">
                    <option value="mensuel">Mensuel</option><option value="annuel">Annuel</option><option value="ponctuel">Ponctuel</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none">
                    <option value="essai">PÃ©riode d&apos;essai</option><option value="actif">Actif</option><option value="suspendu">Suspendu</option><option value="termine">TerminÃ©</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date dÃ©but</label>
                  <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date fin (opt.)</label>
                  <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
                <textarea rows={2} placeholder="Conditions particuliÃ¨res..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-vayflo-500 focus:outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading && <Loader2 className="h-4 w-4 animate-spin" />} CrÃ©er</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
