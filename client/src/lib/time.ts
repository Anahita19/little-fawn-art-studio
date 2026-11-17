import type { Lang } from "./types";

export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function faDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatNumber(value: number, lang: Lang): string {
  return lang === "fa" ? faDigits(value) : String(value);
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Minutes from midnight -> "4:30 PM" (en) or "۱۶:۳۰" (fa). */
export function formatTime(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  if (lang === "fa") return faDigits(`${pad2(h)}:${pad2(m)}`);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad2(m)} ${suffix}`;
}

/** Short axis label: "9 AM" / "۹". */
export function formatHour(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60) % 24;
  if (lang === "fa") return faDigits(pad2(h));
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${suffix}`;
}

export function formatDuration(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (lang === "fa") {
    if (h && m) return `${faDigits(h)} ساعت و ${faDigits(m)} دقیقه`;
    if (h) return `${faDigits(h)} ساعت`;
    return `${faDigits(m)} دقیقه`;
  }
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/** 0 = Saturday … 6 = Friday */
export function dayIndexFromDate(date: Date): number {
  const js = date.getDay(); // 0 = Sunday
  return (js + 1) % 7;
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function minutesNow(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatDateLong(date: Date, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return dateKey(date);
  }
}

export function formatDateShort(iso: string, lang: Lang): string {
  const date = parseDateKey(iso.slice(0, 10));
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-GB", {
      day: "numeric",
      month: "short",
    }).format(date);
  } catch {
    return iso;
  }
}

export function formatMonthYear(date: Date, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-GB", {
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateKey(date);
  }
}

/** ISO timestamp N days ago (local midnight), for seeded records. */
export function daysAgoISO(days: number, from: Date = new Date()): string {
  return dateKey(addDays(startOfDay(from), -days));
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function isoWeekKey(date: Date): string {
  const d = startOfDay(date);
  const day = dayIndexFromDate(d);
  const saturday = addDays(d, -day);
  return dateKey(saturday);
}
