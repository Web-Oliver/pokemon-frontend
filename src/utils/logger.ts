/**
 * Logger utility for development and debugging
 * Only outputs in non-production environments
 */

export const log = (...args: any[]): void => {
  if (import.meta.env.MODE !== 'production') {
    console.log('[APP]', ...args);
  }
};

export const error = (...args: any[]): void => {
  if (import.meta.env.MODE !== 'production') {
    console.error('[ERROR]', ...args);
  }
};