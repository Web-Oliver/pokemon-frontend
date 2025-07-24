/**
 * Auctions API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
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
  createResourceOperations,
  AUCTION_CONFIG,
} from './genericApiOperations';
import unifiedApiClient from './unifiedApiClient';
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
interface IAuctionCreatePayload extends Omit<IAuction, 'id' | '_id'> {}

/**
 * Auction update payload interface
 */
interface IAuctionUpdatePayload extends Partial<IAuctionCreatePayload> {}

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
  includeBatchOperations: true,
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get auctions with optional filters
 * @param params - Optional filter parameters
 * @returns Promise<IAuction[]> - Array of auctions
 */
export const getAuctions = auctionOperations.getAll;

/**
 * Get auction by ID (with populated items)
 * @param id - Auction ID
 * @returns Promise<IAuction> - Single auction
 */
export const getAuctionById = auctionOperations.getById;

/**
 * Create new auction
 * @param auctionData - Auction creation data
 * @returns Promise<IAuction> - Created auction
 */
export const createAuction = auctionOperations.create;

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

/**
 * Bulk create auctions
 * @param auctionsData - Array of auction creation data
 * @returns Promise<IAuction[]> - Created auctions
 */
export const bulkCreateAuctions = auctionOperations.bulkCreate;

/**
 * Export auctions data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportAuctions = auctionOperations.export;

/**
 * Batch operation on auctions
 * @param operation - Operation name
 * @param ids - Auction IDs
 * @param operationData - Operation-specific data
 * @returns Promise<IAuction[]> - Operation results
 */
export const batchAuctionOperation = auctionOperations.batchOperation;

// ========== AUCTION-SPECIFIC OPERATIONS ==========

/**
 * Add item to auction
 * Custom operation using unified client correctly
 */
export const addItemToAuction = async (
  id: string,
  itemData: AddItemToAuctionData
): Promise<IAuction> => {
  return await unifiedApiClient.post<IAuction>(
    `/auctions/${id}/items`,
    itemData,
    {
      operation: 'add item to auction',
      successMessage: 'Item added to auction successfully!',
    }
  );
};

/**
 * Remove item from auction
 * Custom operation using unified client correctly
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

  return await unifiedApiClient.delete<IAuction>(
    `/auctions/${id}/remove-item`,
    {
      operation: 'remove item from auction',
      successMessage: 'Item removed from auction successfully!',
      // Pass data in config for DELETE request
      optimization: { enableCache: false },
      data: payload,
    }
  );
};

/**
 * Mark auction item as sold
 * Custom operation using unified client correctly
 */
export const markAuctionItemSold = async (
  id: string,
  saleData: { itemId: string; itemCategory: string; soldPrice: number }
): Promise<IAuction> => {
  return await unifiedApiClient.put<IAuction>(
    `/auctions/${id}/items/sold`,
    saleData,
    {
      operation: 'mark auction item as sold',
      successMessage: 'Auction item marked as sold! 💰',
    }
  );
};
