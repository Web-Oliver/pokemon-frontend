/**
 * Auctions API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 * 
 * @deprecated This file is deprecated. Use UnifiedApiService.auctions instead.
 * Import: import { unifiedApiService } from '../services/UnifiedApiService'
 * Usage: unifiedApiService.auctions.getAuctions(), unifiedApiService.auctions.createAuction()
 * 
 * This file will be removed in a future version as part of API consolidation.
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for auction-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains IAuction interface compatibility
 * - ISP: Provides specific auction operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import {
  AUCTION_CONFIG,
  createResourceOperations,
} from './genericApiOperations';
import { unifiedApiClient } from './unifiedApiClient';
import { IAuction } from '../domain/models/auction';

// ========== INTERFACES (ISP Compliance) ==========

export interface AuctionsParams {
  status?: string;
}

export interface AddItemToAuctionData {
  itemId: string;
  itemCategory: string;
}

/**
 * Auction creation payload interface
 */
type IAuctionCreatePayload = Omit<IAuction, 'id' | '_id'>;

/**
 * Auction update payload interface
 */
type IAuctionUpdatePayload = Partial<IAuctionCreatePayload>;

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for auctions using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const auctionOperations = createResourceOperations<
  IAuction,
  IAuctionCreatePayload,
  IAuctionUpdatePayload
>(AUCTION_CONFIG, {
  includeExportOperations: true,
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get auctions with optional filters
 * @param params - Optional filter parameters
 * @returns Promise<IAuction[]> - Array of auctions
 */
export const getAuctions = async (
  params?: AuctionsParams
): Promise<IAuction[]> => {
  try {
    return await auctionOperations.getAll(params);
  } catch (error: any) {
    // Handle specific backend errors that might be related to circular references
    if (
      error?.message?.includes('Maximum call stack size exceeded') ||
      error?.response?.data?.message?.includes(
        'Maximum call stack size exceeded'
      )
    ) {
      console.warn(
        'Backend circular reference detected in auctions, returning empty array'
      );
      // Return empty array to prevent frontend crashes
      return [];
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Get auction by ID (with populated items)
 * @param id - Auction ID
 * @returns Promise<IAuction> - Single auction
 */
export const getAuctionById = async (id: string): Promise<IAuction> => {
  try {
    return await auctionOperations.getById(id);
  } catch (error: any) {
    // Handle specific backend errors that might be related to circular references
    if (
      error?.message?.includes('Maximum call stack size exceeded') ||
      error?.response?.data?.message?.includes(
        'Maximum call stack size exceeded'
      )
    ) {
      console.warn(`Backend circular reference detected for auction ${id}`);
      // Return a minimal auction object to prevent crashes
      throw new Error(
        `Auction ${id} has corrupted data and cannot be loaded. Please contact support.`
      );
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Create new auction
 * @param auctionData - Auction creation data
 * @returns Promise<IAuction> - Created auction
 */
export const createAuction = async (
  auctionData: IAuctionCreatePayload
): Promise<IAuction> => {
  try {
    return await auctionOperations.create(auctionData);
  } catch (error: any) {
    // Handle specific backend errors that might be related to circular references
    if (
      error?.message?.includes('Maximum call stack size exceeded') ||
      error?.response?.data?.message?.includes(
        'Maximum call stack size exceeded'
      )
    ) {
      console.warn(
        'Backend circular reference detected during auction creation'
      );
      // Throw a user-friendly error instead of the technical one
      throw new Error(
        'Unable to create auction due to a server issue. Please contact support or try again later.'
      );
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Update auction
 * @param id - Auction ID
 * @param auctionData - Auction update data
 * @returns Promise<IAuction> - Updated auction
 */
export const updateAuction = auctionOperations.update;

/**
 * Delete auction
 * @param id - Auction ID
 * @returns Promise<void>
 */
export const deleteAuction = auctionOperations.remove;

/**
 * Search auctions with parameters
 * @param searchParams - Auction search parameters
 * @returns Promise<IAuction[]> - Search results
 */
export const searchAuctions = auctionOperations.search;

// BULK/BATCH CREATE OPERATIONS REMOVED - Not used by any frontend components

/**
 * Export auctions data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportAuctions = auctionOperations.export;

// ========== AUCTION-SPECIFIC OPERATIONS ==========

/**
 * Add item to auction
 * Custom operation using ID-validated methods
 */
export const addItemToAuction = async (
  id: string,
  itemData: AddItemToAuctionData
): Promise<IAuction> => {
  return await unifiedApiClient.putById<IAuction>(
    '/auctions',
    id,
    itemData,
    'items',
    {
      operation: 'add item to auction',
      successMessage: 'Item added to auction successfully!',
    }
  );
};

/**
 * Remove item from auction
 * Custom operation using ID-validated methods
 */
export const removeItemFromAuction = async (
  id: string,
  itemId: string,
  itemCategory?: string
): Promise<IAuction> => {
  const payload = {
    itemId,
    itemCategory: itemCategory || 'PsaGradedCard',
  };

  return await unifiedApiClient.deleteById<IAuction>(
    '/auctions',
    id,
    'remove-item',
    {
      operation: 'remove item from auction',
      successMessage: 'Item removed from auction successfully!',
      optimization: { enableCache: false },
      data: payload,
    }
  );
};

/**
 * Mark auction item as sold
 * Custom operation using ID-validated methods
 */
export const markAuctionItemSold = async (
  id: string,
  saleData: { itemId: string; itemCategory: string; soldPrice: number }
): Promise<IAuction> => {
  return await unifiedApiClient.putById<IAuction>(
    '/auctions',
    id,
    saleData,
    'items/sold',
    {
      operation: 'mark auction item as sold',
      successMessage: 'Auction item marked as sold! 💰',
    }
  );
};
