import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "â";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateRelative(date: string | Date | null | undefined) {
  if (!date) return "â";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd&apos;hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return formatDate(date);
}

export const STATUT_FACTURE_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "EnvoyÃ©e",
  payee: "PayÃ©e",
  retard: "En retard",
  annulee: "AnnulÃ©e",
};

export const STATUT_ABONNEMENT_LABELS: Record<string, string> = {
  actif: "Actif",
  suspendu: "Suspendu",
  termine: "TerminÃ©",
  essai: "PÃ©riode d'essai",
};

export const STATUT_FACTURE_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-700",
  envoyee: "bg-blue-100 text-blue-700",
  payee: "bg-green-100 text-green-700",
  retard: "bg-red-100 text-red-700",
  annulee: "bg-gray-100 text-gray-500 line-through",
};

export const STATUT_ABONNEMENT_COLORS: Record<string, string> = {
  actif: "bg-green-100 text-green-700",
  suspendu: "bg-orange-100 text-orange-700",
  termine: "bg-gray-100 text-gray-500",
  essai: "bg-purple-100 text-purple-700",
};
