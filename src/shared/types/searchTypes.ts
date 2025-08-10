/**
 * Search Types - Shared search-related type definitions
 *
 * This file contains search-related types to prevent circular dependencies
 * between search hooks, API clients, and utility helpers.
 */

export interface SearchResult {
  id: string;
  displayName: string;
  data: any; // Original data from API
  type: 'set' | 'product' | 'card' | 'setProduct';
}

export interface SearchParams {
  query: string;
  limit?: number;
  page?: number;

  [key: string]: any;
}
