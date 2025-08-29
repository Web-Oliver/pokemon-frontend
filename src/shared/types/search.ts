/**
 * Search Types
 * Shared types for search operations across the application
 */

export interface SearchResponse<T> {
  success: boolean;
  query: string;
  count: number;
  data: T[];
}