/**
 * Status API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * @deprecated This file is deprecated. Use UnifiedApiService.status instead.
 * Import: import { unifiedApiService } from '../services/UnifiedApiService'
 * Usage: unifiedApiService.status.getDataCounts(), unifiedApiService.status.getApiStatus()
 *
 * This file will be removed in a future version as part of API consolidation.
 *
 * NEW: API status endpoint for monitoring system health and data counts
 * Updated to include SetProduct count field from new backend architecture
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for system status operations
 * - DIP: Depends on unifiedApiClient abstraction
 */

import unifiedApiClient from './unifiedApiClient';

// ========== INTERFACES ==========

/**
 * API Status Response - Updated for new backend structure
 * Includes SetProduct count field as per migration guide
 */
export interface ApiStatusResponse {
  success: boolean;
  data: {
    cards: number;
    sets: number;
    products: number;
    setProducts: number; // NEW: SetProduct count
    timestamp: string;
  };
}

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get API status with data counts
 * @returns Promise<ApiStatusResponse> - API status and data counts
 */
export const getApiStatus = async (): Promise<ApiStatusResponse> => {
  const response = await unifiedApiClient.apiGet<ApiStatusResponse>(
    '/status',
    'API status'
  );

  return response;
};

/**
 * Get simplified data counts
 * @returns Promise<{ cards: number; sets: number; products: number; setProducts: number }> - Data counts only
 */
export const getDataCounts = async (): Promise<{
  cards: number;
  sets: number;
  products: number;
  setProducts: number;
}> => {
  const status = await getApiStatus();
  return {
    cards: status.cards,
    sets: status.sets,
    products: status.products,
    setProducts: status.setProducts,
  };
};
