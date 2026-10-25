import { useEffect, useRef } from 'react';

// Calls `fn` immediately and then every `ms` milliseconds while the component is mounted.
export default function usePolling(fn, ms, deps = []) {
  const saved = useRef(fn);
  saved.current = fn;

  useEffect(() => {
    saved.current();
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, ...deps]);
}
