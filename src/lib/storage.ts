import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'lecturelens:v1:';

export const storageKeys = {
  stillStuck: 'stillStuck',
  settings: 'settings',
  hints: 'hints',
} as const;

/** False when the browser blocks localStorage (some private modes, strict privacy settings). */
export const storageAvailable = (() => {
  try {
    const k = `${PREFIX}probe`;
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

/** Accepts stored data only if it still has the expected shape; otherwise the fallback wins. */
export type Validator<T> = (value: unknown, fallback: T) => T | undefined;

function read<T>(key: string, fallback: T, validate?: Validator<T>): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate ? validate(parsed, fallback) ?? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T, fallback?: T) {
  try {
    const json = JSON.stringify(value);
    // Nothing worth keeping: leave no trace in storage.
    if (fallback !== undefined && json === JSON.stringify(fallback)) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, json);
  } catch {
    // Private mode or storage full: the prototype keeps working in memory.
  }
}

/** useState that persists to localStorage and survives a cold load with no data (or damaged data). */
export function usePersistentState<T>(key: string, fallback: T, validate?: Validator<T>) {
  const [value, setValue] = useState<T>(() => read(key, fallback, validate));

  useEffect(() => {
    write(key, value, fallback);
  }, [key, value, fallback]);

  const reset = useCallback(() => setValue(fallback), [fallback]);
  return [value, setValue, reset] as const;
}

/** Plain-object values: keep known fields of the right type, fill the rest from the fallback. */
export function objectOf<T extends object>(value: unknown, fallback: T): T | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const out = { ...fallback } as Record<string, unknown>;
  for (const [k, v] of Object.entries(fallback)) {
    const stored = (value as Record<string, unknown>)[k];
    if (typeof stored === typeof v) out[k] = stored;
  }
  return out as T;
}

/** Removes everything LectureLens stored in this browser. */
export function clearAllStored() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
