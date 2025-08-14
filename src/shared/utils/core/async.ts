/**
 * Pure Async Utilities - Layer 1 Core
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only async operations and timing
 * DRY: Single source for async utilities
 * No external dependencies - pure functions only
 */

/**
 * Simple debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Simple throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry should not reach this point');
};

/**
 * Safe JSON parsing
 */
export const safeJsonParse = <T>(
  jsonString: string,
  fallback: T
): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('[ASYNC UTILS] Failed to parse JSON:', error);
    return fallback;
  }
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};