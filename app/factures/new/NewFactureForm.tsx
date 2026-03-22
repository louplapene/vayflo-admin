"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Tenant { id: string; nom: string; slug: string; }

export default function NewFactureForm({
  tenants,
  preselectedTenantId,
}: {
  tenants: Tenant[];
  preselectedTenantId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tenant_id: preselectedTenantId || "",
    objet: "",
    montant_ht: "",
    taux_tva: "20",
    date_emission: new Date().toISOString().split("T")[0],
    date_echeance: "",
    statut: "brouillon",
    notes: "",
  });

  const montantHT = parseFloat(form.montant_ht) || 0;
  const tva = montantHT * (parseFloat(form.taux_tva) / 100);
  const ttc = montantHT + tva;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("vayflo_factures").insert({
      ...form,
      montant_ht: montantHT,
      taux_tva: parseFloat(form.taux_tva),
      date_echeance: form.date_echeance || null,
    });
    setLoading(false);
    if (!error) router.push("/factures");
  }

  return (
    <form onSubmit={handleSubmit} className="stat-card space-y-5">
      {/* Client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
        <select
          required
          value={form.tenant_id}
          onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
        >
          <option value="">Sélectionner un client...</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.nom}</option>
          ))}
        </select>
      </div>

      {/* Objet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la facture *</label>
        <input
          required
          type="text"
          placeholder="ex: Abonnement ImmoGravity — Avril 2026"
          value={form.objet}
          onChange={(e) => setForm({ ...form, objet: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
        />
      </div>

      {/* Montants */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (€) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.montant_ht}
            onChange={(e) => setForm({ ...form, montant_ht: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
          <select
            value={form.taux_tva}
            onChange={(e) => setForm({ ...form, taux_tva: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
          >
            <option value="0">0% (exonéré)</option>
            <option value="20">20%</option>
            <option value="10">10%</option>
            <option value="5.5">5.5%</option>
          </select>
        </div>
      </div>

      {/* Récapitulatif */}
      {montantHT > 0 && (
        <div className="rounded-lg bg-gray-50 px-4 py-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Montant HT</span>
            <span>{formatCurrency(montantHT)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">TVA ({form.taux_tva}%)</span>
            <span>{formatCurrency(tva)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1 mt-1">
            <span>Total TTC</span>
            <span className="text-vayflo-600">{formatCurrency(ttc)}</span>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;émission</label>
          <input
            type="date"
            value={form.date_emission}
            onChange={(e) => setForm({ ...form, date_emission: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;échéance</label>
          <input
            type="date"
            value={form.date_echeance}
            onChange={(e) => setForm({ ...form, date_echeance: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
          />
        </div>
      </div>

      {/* Statut */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Statut initial</label>
        <select
          value={form.statut}
          onChange={(e) => setForm({ ...form, statut: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
        >
          <option value="brouillon">Brouillon</option>
          <option value="envoyee">Envoyée</option>
          <option value="payee">Payée</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
        <textarea
          rows={3}
          placeholder="Conditions de paiement, remarques..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-vayflo-500 focus:outline-none focus:ring-1 focus:ring-vayflo-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
        >
          Annuler
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer la facture
        </button>
      </div>
    </form>
  );
}
