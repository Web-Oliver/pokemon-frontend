/**
 * Auctions API Client
 * Handles auction management operations
 */

import apiClient from './apiClient';
import { IAuction } from '../domain/models/auction';
// ISaleDetails import removed as it's not used in this file

export interface AuctionsParams {
  status?: string;
}

export interface AddItemToAuctionData {
  itemId: string;
  itemCategory: string;
}

/**
 * Get auctions with optional filters
 * @param params - Optional filter parameters
 * @returns Promise<IAuction[]> - Array of auctions
 */
export const getAuctions = async (params?: AuctionsParams): Promise<IAuction[]> => {
  const response = await apiClient.get('/auctions', { params });
  return response.data.data || response.data;
};

/**
 * Get auction by ID (with populated items)
 * @param id - Auction ID
 * @returns Promise<IAuction> - Single auction with populated items
 */
export const getAuctionById = async (id: string): Promise<IAuction> => {
  const response = await apiClient.get(`/auctions/${id}`);
  return response.data.data || response.data;
};

/**
 * Create new auction
 * @param data - Auction data
 * @returns Promise<IAuction> - Created auction
 */
export const createAuction = async (data: Partial<IAuction>): Promise<IAuction> => {
  const response = await apiClient.post('/auctions', data);
  return response.data.data || response.data;
};

/**
 * Update auction
 * @param id - Auction ID
 * @param data - Updated auction data
 * @returns Promise<IAuction> - Updated auction
 */
export const updateAuction = async (id: string, data: Partial<IAuction>): Promise<IAuction> => {
  const response = await apiClient.put(`/auctions/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Delete auction
 * @param id - Auction ID
 * @returns Promise<void>
 */
export const deleteAuction = async (id: string): Promise<void> => {
  await apiClient.delete(`/auctions/${id}`);
};

/**
 * Add item to auction
 * @param id - Auction ID
 * @param itemData - Item data to add
 * @returns Promise<IAuction> - Updated auction
 */
export const addItemToAuction = async (
  id: string,
  itemData: AddItemToAuctionData
): Promise<IAuction> => {
  const response = await apiClient.post(`/auctions/${id}/items`, itemData);
  return response.data.data || response.data;
};

/**
 * Remove item from auction
 * @param id - Auction ID
 * @param itemId - Item ID to remove
 * @returns Promise<IAuction> - Updated auction
 */
export const removeItemFromAuction = async (
  id: string,
  itemId: string,
  itemCategory?: string
): Promise<IAuction> => {
  const url = `/auctions/${id}/remove-item`;
  const payload = {
    itemId,
    itemCategory: itemCategory || 'PsaGradedCard', // Default fallback
  };

  const response = await apiClient.delete(url, { data: payload });
  return response.data.data || response.data;
};

/**
 * Mark auction item as sold
 * @param id - Auction ID
 * @param saleData - Sale data for the item
 * @returns Promise<IAuction> - Updated auction
 */
export const markAuctionItemSold = async (
  id: string,
  saleData: { itemId: string; itemCategory: string; soldPrice: number }
): Promise<IAuction> => {
  const response = await apiClient.patch(`/auctions/${id}/items/sold`, saleData);
  return response.data.data || response.data;
};
