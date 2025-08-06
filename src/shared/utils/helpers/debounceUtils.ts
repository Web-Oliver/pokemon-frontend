/**
 * Debounce Utilities - CONSOLIDATED
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility - only handles debouncing functionality
 * - OCP: Open for extension with new debounce patterns
 * - DRY: Single source of truth for debounce implementations
 *
 * Consolidates both utils/common.ts debounce and hooks/useDebounce patterns
 */

import { useCallback, useEffect, useRef } from 'react';

// ============================================================================
// UTILITY DEBOUNCE FUNCTION - FOR NON-REACT CONTEXTS
// ============================================================================

/**
 * Utility debounce function for non-React contexts
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// ============================================================================
// REACT HOOK DEBOUNCE - FOR REACT CONTEXTS WITH PROPER CLEANUP
// ============================================================================

/**
 * Hook-based debounce for React contexts with proper cleanup
 * @param callback - Callback function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback function
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export default { debounce, useDebounce };
