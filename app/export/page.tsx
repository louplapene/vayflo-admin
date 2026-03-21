import AppShell from "@/components/layout/AppShell";
import ExportClient from "./ExportClient";

export default function ExportPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export de donnÃ©es</h1>
          <p className="mt-1 text-sm text-gray-500">
            Exportez vos donnÃ©es au format CSV ou Excel
          </p>
        </div>
        <ExportClient />
      </div>
    </AppShell>
  );
}
