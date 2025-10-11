import { useEffect, useCallback } from 'react';

/**
 * Hook untuk debounce function calls - mengurangi re-renders
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      const timeoutId = setTimeout(() => callback(...args), delay);
      return () => clearTimeout(timeoutId);
    },
    [callback, delay]
  );

  return debouncedFn;
}

/**
 * Hook untuk throttle function calls - optimasi scroll/resize handlers
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

/**
 * Hook untuk intersection observer - lazy loading content
 */
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, options);

    return () => observer.disconnect();
  }, [callback, options]);
}

/**
 * Hook untuk prefetch links on hover - faster navigation
 */
export function usePrefetchOnHover(router: any) {
  return useCallback(
    (href: string) => {
      const handleMouseEnter = () => {
        router.prefetch(href);
      };
      return { onMouseEnter: handleMouseEnter };
    },
    [router]
  );
}
