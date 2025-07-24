/**
 * useAuction Hook
 * Provides auction management functionality
 */

import { useState, useEffect, useCallback } from 'react';
import * as auctionsApi from '../api/auctionsApi';
import * as exportApi from '../api/exportApi';
import { IAuction } from '../domain/models/auction';
import { ISaleDetails } from '../domain/models/common';
import { handleApiError } from '../utils/errorHandler';

export interface UseAuctionState {
  auctions: IAuction[];
  currentAuction: IAuction | null;
  loading: boolean;
  error: string | null;
}

export interface UseAuctionActions {
  fetchAuctions: (_params?: auctionsApi.AuctionsParams) => Promise<void>;
  fetchAuctionById: (_id: string) => Promise<void>;
  createAuction: (_data: Partial<IAuction>) => Promise<IAuction>;
  updateAuction: (_id: string, _data: Partial<IAuction>) => Promise<void>;
  deleteAuction: (_id: string) => Promise<void>;
  addItemToAuction: (
    _id: string,
    _itemData: auctionsApi.AddItemToAuctionData
  ) => Promise<void>;
  removeItemFromAuction: (
    _id: string,
    _itemId: string,
    _itemCategory?: string
  ) => Promise<void>;
  markAuctionItemSold: (
    _id: string,
    _saleData: { itemId: string; itemCategory: string; soldPrice: number }
  ) => Promise<void>;
  generateFacebookPost: (_id: string) => Promise<string>;
  downloadAuctionTextFile: (_id: string) => Promise<void>;
  downloadAuctionImagesZip: (_id: string) => Promise<void>;
  clearCurrentAuction: () => void;
  clearError: () => void;
}

export type UseAuctionHook = UseAuctionState & UseAuctionActions;

/**
 * Custom hook for auction management
 */
export const useAuction = (): UseAuctionHook => {
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [currentAuction, setCurrentAuction] = useState<IAuction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all auctions with optional filters
   */
  const fetchAuctions = useCallback(
    async (params?: auctionsApi.AuctionsParams) => {
      try {
        setLoading(true);
        setError(null);
        const fetchedAuctions = await auctionsApi.getAuctions(params);
        setAuctions(fetchedAuctions);
      } catch (err) {
        const errorMessage = 'Failed to fetch auctions';
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch auction by ID
   */
  const fetchAuctionById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const auction = await auctionsApi.getAuctionById(id);
      setCurrentAuction(auction);
    } catch (err) {
      const errorMessage = `Failed to fetch auction with ID: ${id}`;
      setError(errorMessage);
      handleApiError(err, errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new auction
   */
  const createAuction = useCallback(
    async (data: Partial<IAuction>): Promise<IAuction> => {
      try {
        setLoading(true);
        setError(null);
        const newAuction = await auctionsApi.createAuction(data);
        setAuctions((prev) => [...prev, newAuction]);
        return newAuction;
      } catch (err) {
        const errorMessage = 'Failed to create auction';
        setError(errorMessage);
        handleApiError(err, errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update auction
   */
  const updateAuction = useCallback(
    async (id: string, data: Partial<IAuction>) => {
      try {
        setLoading(true);
        setError(null);
        await auctionsApi.updateAuction(id, data);

        // CONSISTENCY FIX: Always refetch from server instead of manual state updates
        await Promise.all([
          fetchAuctionById(id), // Update current auction
          fetchAuctions(), // Update auctions list cache
        ]);
      } catch (err) {
        const errorMessage = `Failed to update auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAuctionById, fetchAuctions]
  );

  /**
   * Delete auction
   */
  const deleteAuction = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        console.log('[useAuction] Deleting auction with ID:', id);
        await auctionsApi.deleteAuction(id);

        console.log(
          '[useAuction] Auction deleted successfully, refetching all auctions...'
        );

        // Clear current auction if it's the one being deleted
        if ((currentAuction?.id || currentAuction?._id) === id) {
          setCurrentAuction(null);
        }

        // Refetch all auctions from the server to ensure accurate state
        await fetchAuctions();
      } catch (err) {
        const errorMessage = `Failed to delete auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id, fetchAuctions]
  );

  /**
   * Add item to auction
   */
  const addItemToAuction = useCallback(
    async (id: string, itemData: auctionsApi.AddItemToAuctionData) => {
      try {
        setLoading(true);
        setError(null);
        await auctionsApi.addItemToAuction(id, itemData);

        // CONSISTENCY FIX: Always refetch from server instead of manual state updates
        await Promise.all([
          fetchAuctionById(id), // Update current auction
          fetchAuctions(), // Update auctions list cache
        ]);
      } catch (err) {
        const errorMessage = `Failed to add item to auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAuctionById, fetchAuctions]
  );

  /**
   * Remove item from auction
   */
  const removeItemFromAuction = useCallback(
    async (id: string, itemId: string, itemCategory?: string) => {
      try {
        setLoading(true);
        setError(null);
        console.log('[useAuction] Removing item:', {
          id,
          itemId,
          itemCategory,
        });
        await auctionsApi.removeItemFromAuction(id, itemId, itemCategory);
        console.log(
          '[useAuction] Item removed successfully, refetching all auction data...'
        );

        // CRITICAL FIX: Refetch both current auction AND auctions list to invalidate cache
        await Promise.all([
          fetchAuctionById(id), // Update current auction
          fetchAuctions(), // Update auctions list cache
        ]);
      } catch (err: any) {
        // CRITICAL FIX: If we get 404, the item is already gone, so still refresh the cache
        if (err?.response?.status === 404) {
          console.log(
            '[useAuction] Item already removed (404), refreshing cache...'
          );
          await Promise.all([
            fetchAuctionById(id), // Update current auction
            fetchAuctions(), // Update auctions list cache
          ]);
        } else {
          const errorMessage = `Failed to remove item from auction with ID: ${id}`;
          setError(errorMessage);
          handleApiError(err, errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchAuctionById, fetchAuctions]
  );

  /**
   * Mark auction item as sold
   */
  const markAuctionItemSold = useCallback(
    async (
      id: string,
      saleData: { itemId: string; itemCategory: string; soldPrice: number }
    ) => {
      try {
        setLoading(true);
        setError(null);
        await auctionsApi.markAuctionItemSold(id, saleData);

        // CONSISTENCY FIX: Always refetch from server instead of manual state updates
        await Promise.all([
          fetchAuctionById(id), // Update current auction
          fetchAuctions(), // Update auctions list cache
        ]);
      } catch (err) {
        const errorMessage = `Failed to mark auction item as sold for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAuctionById, fetchAuctions]
  );

  /**
   * Clear current auction
   */
  const clearCurrentAuction = useCallback(() => {
    setCurrentAuction(null);
  }, []);

  /**
   * Generate Facebook post for auction
   */
  const generateFacebookPost = useCallback(
    async (id: string): Promise<string> => {
      try {
        setLoading(true);
        setError(null);
        const postText = await exportApi.generateAuctionFacebookPost(id);

        // Update the current auction with the generated post
        if ((currentAuction?.id || currentAuction?._id) === id) {
          setCurrentAuction((prev) =>
            prev ? { ...prev, generatedFacebookPost: postText } : null
          );
        }

        return postText;
      } catch (err) {
        const errorMessage = `Failed to generate Facebook post for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id]
  );

  /**
   * Download auction text file
   */
  const downloadAuctionTextFile = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const blob = await exportApi.getAuctionFacebookTextFile(id);
        const filename = `auction-${id}-facebook-post.txt`;
        exportApi.downloadBlob(blob, filename);
      } catch (err) {
        const errorMessage = `Failed to download text file for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Download auction images zip
   */
  const downloadAuctionImagesZip = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const blob = await exportApi.zipAuctionImages(id);
        const filename = `auction-${id}-images.zip`;
        exportApi.downloadBlob(blob, filename);
      } catch (err) {
        const errorMessage = `Failed to download images zip for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch auctions on mount (restored to maintain hook order)
  useEffect(() => {
    // Always fetch on mount to ensure fresh data
    fetchAuctions();
  }, [fetchAuctions]);

  return {
    // State
    auctions,
    currentAuction,
    loading,
    error,
    // Actions
    fetchAuctions,
    fetchAuctionById,
    createAuction,
    updateAuction,
    deleteAuction,
    addItemToAuction,
    removeItemFromAuction,
    markAuctionItemSold,
    generateFacebookPost,
    downloadAuctionTextFile,
    downloadAuctionImagesZip,
    clearCurrentAuction,
    clearError,
  };
};
