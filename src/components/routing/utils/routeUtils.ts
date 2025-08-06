/**
 * Route Utilities
 * Layer 1: Core/Foundation - Utility Functions
 *
 * Route parsing and matching utilities following SOLID principles
 * Single Responsibility: Route parsing and pattern matching logic
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Route parsing and matching only
 * - DRY: Eliminates duplicate route parsing across components
 * - Pure Functions: No side effects, testable and predictable
 */

import { RouteParams, RouteMatch } from '../types/RouterTypes';

/**
 * Parse route path into segments
 * Single Responsibility: Path segmentation
 */
export function parseRoute(path: string): string[] {
  return path.split('/').filter((segment) => segment.length > 0);
}

/**
 * Check if route pattern matches current path
 * Single Responsibility: Route pattern matching with parameter extraction
 *
 * @param pattern Route pattern (e.g., '/collection/:type/:id')
 * @param path Current path (e.g., '/collection/psa/123')
 * @param exact Whether match must be exact
 * @returns RouteMatch if matched, null if no match
 */
export function matchRoute(
  pattern: string,
  path: string,
  exact: boolean = true
): RouteMatch | null {
  const patternSegments = parseRoute(pattern);
  const pathSegments = parseRoute(path);

  // For exact matches, segment counts must match
  if (exact && patternSegments.length !== pathSegments.length) {
    return null;
  }

  // For non-exact matches, path must have at least as many segments as pattern
  if (!exact && pathSegments.length < patternSegments.length) {
    return null;
  }

  const params: RouteParams = {};

  // Match each segment
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    if (patternSegment.startsWith(':')) {
      // Parameter segment - extract parameter
      const paramName = patternSegment.slice(1);
      params[paramName] = pathSegment;
    } else if (patternSegment !== pathSegment) {
      // Static segment - must match exactly
      return null;
    }
  }

  return {
    params,
    isExact: exact,
  };
}

/**
 * Generate path from pattern and parameters
 * Single Responsibility: Path generation from template
 */
export function generatePath(pattern: string, params: RouteParams): string {
  let path = pattern;

  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });

  return path;
}

/**
 * Extract parameters from path using pattern
 * Single Responsibility: Parameter extraction
 */
export function extractParams(
  pattern: string,
  path: string
): RouteParams | null {
  const match = matchRoute(pattern, path, true);
  return match ? match.params : null;
}
