"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

interface Props {
  totalImmeubles: number;
  totalDevis: number;
  activeTenants: number;
}

export default function DashboardCharts({ totalImmeubles, totalDevis, activeTenants }: Props) {
  // Données illustratives pour montrer la structure (à remplacer par vraies données quand volume > 0)
  const data = [
    { name: "Oct", tickets: 0, devis: 0 },
    { name: "Nov", tickets: 0, devis: 0 },
    { name: "Déc", tickets: 0, devis: 0 },
    { name: "Jan", tickets: 0, devis: 0 },
    { name: "Fév", tickets: 2, devis: 5 },
    { name: "Mar", tickets: 12, devis: 29 },
  ];

  const COLORS = ["#6272f1", "#10b981"];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
            cursor={{ fill: "#f9fafb" }}
          />
          <Bar dataKey="tickets" name="Tickets" fill="#6272f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="devis" name="Devis" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Clients actifs", value: activeTenants, color: "#6272f1" },
          { label: "Immeubles gérés", value: totalImmeubles, color: "#10b981" },
          { label: "Devis générés", value: totalDevis, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-gray-50 px-3 py-2.5 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
