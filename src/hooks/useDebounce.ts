/**
 * Debounce Hook
 * Centralized debounce implementation for React components
 *
 * Following CLAUDE.md DRY principles:
 * - Single implementation of debounce logic
 * - Consistent behavior across components
 * - Proper cleanup on unmount
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook for debouncing function calls
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
// Re-exported from consolidated debounceUtils to eliminate duplication
export { useDebounce } from '../utils/debounceUtils';

/**
 * Hook for cancelling a debounced operation
 * @param delay - Delay in milliseconds
 * @returns Object with debounce and cancel functions
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
} => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debouncedCallback, cancel };
};

/**
 * Hook for debouncing values (not functions)
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
