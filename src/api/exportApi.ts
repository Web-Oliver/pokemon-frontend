/**
 * Export API Client
 * Handles export operations for auctions and collections
 * Phase 10: Auction Management - Export Features
 */

import apiClient from './apiClient';

/**
 * Generate Facebook post for auction
 * @param auctionId - Auction ID
 * @returns Promise<string> - Generated Facebook post text
 */
export const generateAuctionFacebookPost = async (auctionId: string): Promise<string> => {
  const response = await apiClient.post(`/auctions/${auctionId}/generate-facebook-post`);
  return response.data.data || response.data.post || response.data;
};

/**
 * Generate Facebook text file for auction
 * @param auctionId - Auction ID
 * @returns Promise<Blob> - Text file blob for download
 */
export const getAuctionFacebookTextFile = async (auctionId: string): Promise<Blob> => {
  const response = await apiClient.get(`/auctions/${auctionId}/facebook-text-file`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Zip all images for auction
 * @param auctionId - Auction ID
 * @returns Promise<Blob> - Zip file blob for download
 */
export const zipAuctionImages = async (auctionId: string): Promise<Blob> => {
  const response = await apiClient.get(`/auctions/${auctionId}/zip-images`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Generate Facebook text file for collection items
 * @param selectedItemIds - Array of selected item IDs
 * @returns Promise<Blob> - Text file blob for download
 */
export const getCollectionFacebookTextFile = async (selectedItemIds: string[]): Promise<Blob> => {
  const response = await apiClient.post('/collection/facebook-text-file', {
    itemIds: selectedItemIds
  }, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Utility function to trigger file download
 * @param blob - File blob to download
 * @param filename - Suggested filename
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};