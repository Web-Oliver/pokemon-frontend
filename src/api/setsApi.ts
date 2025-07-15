/**
 * Sets API Client
 * Handles all set-related API operations matching the backend endpoints
 */

import apiClient from './apiClient';
import { ISet } from '../domain/models/card';

export interface PaginatedSetsParams {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
}

export interface PaginatedSetsResponse {
  sets: ISet[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Get all sets
 * @returns Promise<ISet[]> - Complete sets array
 */
export const getSets = async (): Promise<ISet[]> => {
  const response = await apiClient.get('/sets');
  return response.data.sets || response.data.data || response.data;
};

/**
 * Get paginated sets with optional filters
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedSetsResponse> - Paginated sets response
 */
export const getPaginatedSets = async (
  params?: PaginatedSetsParams
): Promise<PaginatedSetsResponse> => {
  const response = await apiClient.get('/sets/paginated', { params });
  return response.data.data || response.data;
};

/**
 * Get set by ID
 * @param id - Set ID
 * @returns Promise<ISet> - Single set
 */
export const getSetById = async (id: string): Promise<ISet> => {
  const response = await apiClient.get(`/sets/${id}`);
  return response.data.data || response.data;
};
