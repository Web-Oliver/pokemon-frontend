/**
 * Auctions API Client
 * Refactored to use generic API operations following DRY principles
 */

import { IAuction } from '../domain/models/auction';
import { 
  getCollection, 
  getResource, 
  createResource, 
  updateResource, 
  deleteResource,
  AUCTION_CONFIG 
} from './genericApiOperations';
import unifiedApiClient from './unifiedApiClient';

export interface AuctionsParams {
  status?: string;
}

export interface AddItemToAuctionData {
  itemId: string;
  itemCategory: string;
}

// ========== GENERIC CRUD OPERATIONS (DRY) ==========

/**
 * Get auctions with optional filters
 * Uses generic getCollection operation
 */
export const getAuctions = (params?: AuctionsParams): Promise<IAuction[]> => 
  getCollection<IAuction>(AUCTION_CONFIG, params);

/**
 * Get auction by ID (with populated items)
 * Uses generic getResource operation
 */
export const getAuctionById = (id: string): Promise<IAuction> => 
  getResource<IAuction>(AUCTION_CONFIG, id);

/**
 * Create new auction
 * Uses generic createResource operation
 */
export const createAuction = (data: Partial<IAuction>): Promise<IAuction> => 
  createResource<IAuction>(AUCTION_CONFIG, data);

/**
 * Update auction
 * Uses generic updateResource operation
 */
export const updateAuction = (id: string, data: Partial<IAuction>): Promise<IAuction> => 
  updateResource<IAuction>(AUCTION_CONFIG, id, data);

/**
 * Delete auction
 * Uses generic deleteResource operation
 */
export const deleteAuction = (id: string): Promise<void> => 
  deleteResource(AUCTION_CONFIG, id);

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
      successMessage: 'Item added to auction successfully!'
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
      data: payload
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
      successMessage: 'Auction item marked as sold! 💰'
    }
  );
};
