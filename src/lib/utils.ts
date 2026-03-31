import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | number | undefined | null): string {
  if (d === undefined || d === null) return "";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (typeof d === "number") {
    return new Date(d).toLocaleDateString("en-US", opts);
  }
  const num = Number(d);
  if (!isNaN(num) && num > 1e12) {
    return new Date(num).toLocaleDateString("en-US", opts);
  }
  // Handle ISO date strings like "2026-05-15"
  if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Parse as UTC to avoid timezone offset issues
    const parsed = new Date(d + "T00:00:00");
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", opts);
    }
  }
  return d;
}

export function formatEnumLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
