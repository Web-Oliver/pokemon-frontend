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
  fetchAuctions: (params?: auctionsApi.AuctionsParams) => Promise<void>;
  fetchAuctionById: (id: string) => Promise<void>;
  createAuction: (data: Partial<IAuction>) => Promise<IAuction>;
  updateAuction: (id: string, data: Partial<IAuction>) => Promise<void>;
  deleteAuction: (id: string) => Promise<void>;
  addItemToAuction: (id: string, itemData: auctionsApi.AddItemToAuctionData) => Promise<void>;
  removeItemFromAuction: (id: string, itemId: string) => Promise<void>;
  markAuctionItemSold: (id: string, saleData: ISaleDetails & { itemId: string }) => Promise<void>;
  generateFacebookPost: (id: string) => Promise<string>;
  downloadAuctionTextFile: (id: string) => Promise<void>;
  downloadAuctionImagesZip: (id: string) => Promise<void>;
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
  const fetchAuctions = useCallback(async (params?: auctionsApi.AuctionsParams) => {
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
  }, []);

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
  const createAuction = useCallback(async (data: Partial<IAuction>): Promise<IAuction> => {
    try {
      setLoading(true);
      setError(null);
      const newAuction = await auctionsApi.createAuction(data);
      setAuctions(prev => [...prev, newAuction]);
      return newAuction;
    } catch (err) {
      const errorMessage = 'Failed to create auction';
      setError(errorMessage);
      handleApiError(err, errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update auction
   */
  const updateAuction = useCallback(
    async (id: string, data: Partial<IAuction>) => {
      try {
        setLoading(true);
        setError(null);
        const updatedAuction = await auctionsApi.updateAuction(id, data);

        // Update auctions list
        setAuctions(prev => prev.map(auction => (auction.id === id ? updatedAuction : auction)));

        // Update current auction if it's the one being updated
        if (currentAuction?.id === id) {
          setCurrentAuction(updatedAuction);
        }
      } catch (err) {
        const errorMessage = `Failed to update auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id]
  );

  /**
   * Delete auction
   */
  const deleteAuction = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await auctionsApi.deleteAuction(id);

        // Remove from auctions list
        setAuctions(prev => prev.filter(auction => auction.id !== id));

        // Clear current auction if it's the one being deleted
        if (currentAuction?.id === id) {
          setCurrentAuction(null);
        }
      } catch (err) {
        const errorMessage = `Failed to delete auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id]
  );

  /**
   * Add item to auction
   */
  const addItemToAuction = useCallback(
    async (id: string, itemData: auctionsApi.AddItemToAuctionData) => {
      try {
        setLoading(true);
        setError(null);
        const updatedAuction = await auctionsApi.addItemToAuction(id, itemData);

        // Update auctions list
        setAuctions(prev => prev.map(auction => (auction.id === id ? updatedAuction : auction)));

        // Update current auction if it's the one being updated
        if (currentAuction?.id === id) {
          setCurrentAuction(updatedAuction);
        }
      } catch (err) {
        const errorMessage = `Failed to add item to auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id]
  );

  /**
   * Remove item from auction
   */
  const removeItemFromAuction = useCallback(
    async (id: string, itemId: string) => {
      try {
        setLoading(true);
        setError(null);
        const updatedAuction = await auctionsApi.removeItemFromAuction(id, itemId);

        // Update auctions list
        setAuctions(prev => prev.map(auction => (auction.id === id ? updatedAuction : auction)));

        // Update current auction if it's the one being updated
        if (currentAuction?.id === id) {
          setCurrentAuction(updatedAuction);
        }
      } catch (err) {
        const errorMessage = `Failed to remove item from auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id]
  );

  /**
   * Mark auction item as sold
   */
  const markAuctionItemSold = useCallback(
    async (id: string, saleData: ISaleDetails & { itemId: string }) => {
      try {
        setLoading(true);
        setError(null);
        const updatedAuction = await auctionsApi.markAuctionItemSold(id, saleData);

        // Update auctions list
        setAuctions(prev => prev.map(auction => (auction.id === id ? updatedAuction : auction)));

        // Update current auction if it's the one being updated
        if (currentAuction?.id === id) {
          setCurrentAuction(updatedAuction);
        }
      } catch (err) {
        const errorMessage = `Failed to mark auction item as sold for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentAuction?.id]
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
        if (currentAuction?.id === id) {
          setCurrentAuction(prev => (prev ? { ...prev, generatedFacebookPost: postText } : null));
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
  const downloadAuctionTextFile = useCallback(async (id: string): Promise<void> => {
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
  }, []);

  /**
   * Download auction images zip
   */
  const downloadAuctionImagesZip = useCallback(async (id: string): Promise<void> => {
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
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch auctions on mount
  useEffect(() => {
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
