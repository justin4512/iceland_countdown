import { ITINERARY } from '../data/itinerary';

/** Countdown target: 2027-02-28 23:00 Taipei */
export const DEPART = Date.parse('2027-02-28T23:00:00+08:00');
/** Trip ends at the end of Day 15 in Iceland (UTC+0) */
export const TRIP_END = Date.parse('2027-03-16T00:00:00Z');
/** Quote history starts here (first day of the content) */
export const QUOTE_START = '2026-11-02';

const DAY_MS = 86_400_000;

export type Phase = 'countdown' | 'trip' | 'after';

export function phaseAt(now: number): Phase {
  if (now < DEPART) return 'countdown';
  if (now < TRIP_END) return 'trip';
  return 'after';
}

export interface Remaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function remaining(now: number): Remaining {
  const total = Math.max(0, DEPART - now);
  return {
    total,
    days: Math.floor(total / DAY_MS),
    hours: Math.floor((total % DAY_MS) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
}

/** Whole days left until departure, counted on the Taipei calendar. */
export function daysLeft(now: number): number {
  return Math.max(0, Math.ceil((DEPART - now) / DAY_MS));
}

/** YYYY-MM-DD for the given instant in a time zone */
export function dateIn(now: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export const taipeiDate = (now: number) => dateIn(now, 'Asia/Taipei');
export const icelandDate = (now: number) => dateIn(now, 'Atlantic/Reykjavik');

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY_MS);
}

/** Trip day number (1–15) by Iceland date; 0 while still in the air before Day 1 */
export function tripDay(now: number): number {
  const idx = ITINERARY.findIndex((d) => d.date === icelandDate(now));
  return idx === -1 ? 0 : idx + 1;
}

/** Days since back home (counted from 2027-03-16 Taipei) */
export function daysHome(now: number): number {
  return Math.max(0, diffDays(taipeiDate(now), '2027-03-16') + 1);
}
