import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Kenyan Shillings (KSh)
 * Example: 25999 -> "KSh 25,999"
 */
export function formatKSh(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

/**
 * Normalize and validate Kenyan phone numbers
 * Accepts:
 * - 07XXXXXXXX or 01XXXXXXXX
 * - +2547XXXXXXXX or +2541XXXXXXXX
 * - 2547XXXXXXXX or 2541XXXXXXXX
 * - 7XXXXXXXX or 1XXXXXXXX
 * Returns standard format: +254 7XX XXX XXX or +254 1XX XXX XXX
 */
export function formatKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  let standard = "";

  if (cleaned.startsWith("254") && cleaned.length === 12) {
    standard = cleaned;
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    standard = `254${cleaned.substring(1)}`;
  } else if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) {
    standard = `254${cleaned}`;
  } else {
    return phone; // Return as-is if unrecognized format
  }

  // Format as +254 7XX XXX XXX
  const country = standard.substring(0, 3);
  const prefix = standard.substring(3, 6);
  const part1 = standard.substring(6, 9);
  const part2 = standard.substring(9, 12);

  return `+${country} ${prefix} ${part1} ${part2}`;
}

export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && (cleaned.startsWith("07") || cleaned.startsWith("01"))) {
    return true;
  }
  if (cleaned.length === 12 && (cleaned.startsWith("2547") || cleaned.startsWith("2541"))) {
    return true;
  }
  if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
    return true;
  }
  return false;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateDiscount(currentPrice: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= currentPrice) return null;
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  return discount > 0 ? discount : null;
}
