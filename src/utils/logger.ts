/**
 * Logger utility for development and debugging
 * Only outputs in non-production environments
 */

export const log = (...args: unknown[]): void => {
  if (import.meta.env.MODE !== 'production') {
    console.log('[APP]', ...args);
  }
};

export const error = (...args: unknown[]): void => {
  if (import.meta.env.MODE !== 'production') {
    console.error('[ERROR]', ...args);
  }
};
