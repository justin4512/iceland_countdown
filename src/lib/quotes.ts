import { QUOTES } from '../data/quotes';
import type { Quote, QuoteCategory } from '../types';
import { diffDays } from './time';

export const CATEGORY_LABEL: Record<QuoteCategory, string> = {
  prep: '準備',
  caution: '注意',
  weather: '氣候',
  culture: '文化',
  wear: '穿著',
  drive: '行車',
  spot: '網美景點',
  after: '回國後',
};

const sorted = [...QUOTES].sort((a, b) => a.date.localeCompare(b.date));
const first = sorted[0];
const last = sorted[sorted.length - 1];

/** Quote for a Taipei date. Before the first date shows the first; after the last, cycles through all. */
export function quoteFor(date: string): Quote {
  if (date <= first.date) return first;
  const exact = sorted.find((q) => q.date === date);
  if (exact) return exact;
  if (date > last.date) {
    const n = diffDays(date, last.date) - 1;
    return { ...sorted[n % sorted.length], date };
  }
  // gap inside the range: fall back to the latest earlier quote
  return [...sorted].reverse().find((q) => q.date < date) ?? first;
}

/** All quotes unlocked by the given Taipei date, newest first. */
export function unlockedQuotes(date: string): Quote[] {
  return sorted.filter((q) => q.date <= date).reverse();
}
