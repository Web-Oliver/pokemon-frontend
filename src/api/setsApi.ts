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
  // Convert 'search' to 'q' to match backend parameter
  const backendParams = {
    ...params,
    ...(params?.search && { q: params.search }),
  };
  // Remove the 'search' param since backend uses 'q'
  if (backendParams.search) {
    delete backendParams.search;
  }
  
  const response = await apiClient.get('/sets', { params: backendParams });
  
  // Backend returns: { sets, currentPage, totalPages, totalSets, hasNextPage, hasPrevPage }
  // Transform to match frontend interface
  const backendData = response.data;
  return {
    sets: backendData.sets || [],
    total: backendData.totalSets || 0,
    currentPage: backendData.currentPage || 1,
    totalPages: backendData.totalPages || 1,
    hasNextPage: backendData.hasNextPage || false,
    hasPrevPage: backendData.hasPrevPage || false,
  };
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
