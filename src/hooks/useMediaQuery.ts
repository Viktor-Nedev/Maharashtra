import { useEffect, useState } from 'react';

/** SSR-safe matchMedia hook. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Decides whether to run the reduced-complexity ("low power") render path.
 * True on small screens, coarse pointers, or when the user prefers reduced motion.
 */
export function useLowPower(): boolean {
  const small = useMediaQuery('(max-width: 768px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const lowCores = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 4;
  return small || reduced || (coarse && lowCores);
}
