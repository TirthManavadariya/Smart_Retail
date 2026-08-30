import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * quiet. Use it to keep an input responsive while throttling the expensive
 * work it drives (network queries, filtering) — e.g. a slider that would
 * otherwise refetch on every pixel of drag, or a search box hitting the API
 * on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
