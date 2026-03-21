import AppShell from "@/components/layout/AppShell";
import { supabaseAdmin } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import NewFactureForm from "./NewFactureForm";

async function getTenants() {
  const { data } = await supabaseAdmin.from("tenants").select("id, nom, slug").order("nom");
  return data || [];
}

export default async function NewFacturePage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenants = await getTenants();

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <Link href="/factures" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour aux factures
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
        </div>

        <NewFactureForm tenants={tenants} preselectedTenantId={params.tenant} />
      </div>
    </AppShell>
  );
}
