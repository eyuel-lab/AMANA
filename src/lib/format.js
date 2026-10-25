import { format, formatDistanceToNow } from "date-fns";

export function formatETB(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value, pattern = "d MMM yyyy") {
  if (!value) return "—";
  try {
    return format(new Date(value), pattern);
  } catch {
    return "—";
  }
}

export function fromNow(value) {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function maskId(value) {
  if (!value) return "••••";
  const clean = String(value).replace(/\s+/g, "");
  return clean.length <= 4 ? "••••" : `${"•".repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

export const shortRef = (ref) => (ref ? String(ref).slice(0, 14) : "—");