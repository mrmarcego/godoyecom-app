import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatCurrencyPrecise(value: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-US").format(value || 0);
}

export function formatPercent(value: number, opts?: { signed?: boolean }) {
  const sign = opts?.signed && value > 0 ? "+" : "";
  return `${sign}${(value || 0).toFixed(1)}%`;
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr + (dateStr.length <= 10 ? "T00:00:00" : "")));
}

export function formatDateShort(dateStr: string) {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateStr + (dateStr.length <= 10 ? "T00:00:00" : "")));
}

export function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
