import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Turn an UPPER_SNAKE enum value into a human label, e.g. "PENDING_APPROVAL" → "Pending Approval". */
export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Locale date-time string, or an em dash when the value is missing. */
export function formatDateTime(value?: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}
