import { useEffect, useState } from 'react';

/** Current time, refreshed every `ms`. `?now=2027-03-05T10:00:00Z` in the URL fakes the clock (for previewing phases). */
const fakeStart = (() => {
  const p = new URLSearchParams(location.search).get('now');
  const t = p ? Date.parse(p) : NaN;
  return Number.isNaN(t) ? null : { at: t, real: Date.now() };
})();

export const clockNow = () => (fakeStart ? fakeStart.at + (Date.now() - fakeStart.real) : Date.now());

export function useNow(ms = 1000): number {
  const [now, setNow] = useState(clockNow);
  useEffect(() => {
    const id = setInterval(() => setNow(clockNow()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: keep in memory only */
    }
  }, [key, value]);
  return [value, setValue];
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Whether the device should get the full WebGL scene by default */
export function canRun3D(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const narrowTouch = matchMedia('(pointer: coarse) and (max-width: 820px)').matches;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  if (narrowTouch || weak) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Fetch JSON once, with a localStorage cache used as the offline fallback. */
export function useCachedJson<T>(key: string, url: string, maxAgeMs: number) {
  const [state, setState] = useState<{ data: T | null; at: number | null; offline: boolean }>(() => {
    try {
      const raw = localStorage.getItem(`cache:${key}`);
      if (raw) {
        const c = JSON.parse(raw) as { data: T; at: number };
        return { data: c.data, at: c.at, offline: false };
      }
    } catch {
      /* ignore */
    }
    return { data: null, at: null, offline: false };
  });

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<T>;
        })
        .then((data) => {
          if (!alive) return;
          const at = Date.now();
          setState({ data, at, offline: false });
          try {
            localStorage.setItem(`cache:${key}`, JSON.stringify({ data, at }));
          } catch {
            /* ignore */
          }
        })
        .catch(() => alive && setState((s) => ({ ...s, offline: true })));
    load();
    const id = setInterval(load, maxAgeMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [key, url, maxAgeMs]);

  return state;
}
