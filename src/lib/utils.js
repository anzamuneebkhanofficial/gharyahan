import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Pakistani Rupees (PKR)
 * e.g., 45000 -> "PKR 45,000"
 */
export function formatPKR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount).replace("PKR", "PKR ");
}

/**
 * Sanitize Pakistani phone numbers for wa.me deep links
 * Converts: "03001234567" or "+92 300 1234567" -> "923001234567"
 */
export function sanitizeWhatsAppNumber(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.substring(1);
  } else if (cleaned.startsWith("92")) {
    // already starts with 92
  } else if (cleaned.length === 10) {
    cleaned = "92" + cleaned;
  }
  return cleaned;
}

/**
 * Generate WhatsApp direct chat link with pre-filled message
 */
export function createWhatsAppLink({ phone, title, rentPrice, area }) {
  const cleanNumber = sanitizeWhatsAppNumber(phone);
  const formattedPrice = formatPKR(rentPrice);
  const message = `Assalam-o-Alaikum, I found your listing on GharYahan: "${title}" (${formattedPrice}/mo) in ${area}. Is it still available for a visit?`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Format expected vacancy or listing date
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculate days remaining until expected vacancy date
 */
export function getDaysUntilVacancy(vacancyDate) {
  if (!vacancyDate) return null;
  const target = new Date(vacancyDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
