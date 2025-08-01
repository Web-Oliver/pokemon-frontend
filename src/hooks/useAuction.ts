/**
 * useAuction Hook
 * Provides auction management functionality with React Query caching
 */

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as auctionsApi from '../api/auctionsApi';
import * as exportApi from '../api/exportApi';
import { IAuction } from '../domain/models/auction';
import { queryKeys, CACHE_TIMES } from '../lib/queryClient';
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
 * Custom hook for auction management with React Query caching
 */
export const useAuction = (params?: auctionsApi.AuctionsParams): UseAuctionHook => {
  const queryClient = useQueryClient();
  const [currentAuction, setCurrentAuction] = useState<IAuction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cached auctions list
  const {
    data: auctions = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchAuctions
  } = useQuery({
    queryKey: queryKeys.auctionsList(params),
    queryFn: () => auctionsApi.getAuctions(params),
    staleTime: CACHE_TIMES.COLLECTION_DATA.staleTime,
    gcTime: CACHE_TIMES.COLLECTION_DATA.gcTime,
  });

  /**
   * Fetch all auctions with optional filters (now just triggers refetch)
   */
  const fetchAuctions = useCallback(
    async (newParams?: auctionsApi.AuctionsParams) => {
      try {
        setError(null);
        // Invalidate and refetch with new params
        await queryClient.invalidateQueries({ queryKey: queryKeys.auctionsList(newParams) });
      } catch (err) {
        const errorMessage = 'Failed to fetch auctions';
        setError(errorMessage);
        handleApiError(err, errorMessage);
      }
    },
    [queryClient]
  );

  /**
   * Fetch auction by ID with caching
   */
  const fetchAuctionById = useCallback(async (id: string) => {
    try {
      setError(null);
      const auction = await queryClient.fetchQuery({
        queryKey: queryKeys.auctionDetail(id),
        queryFn: () => auctionsApi.getAuctionById(id),
        staleTime: CACHE_TIMES.COLLECTION_DATA.staleTime,
      });
      setCurrentAuction(auction);
    } catch (err) {
      const errorMessage = 'Failed to fetch auction';
      setError(errorMessage);
      handleApiError(err, errorMessage);
    }
  }, [queryClient]);

  // Create auction mutation
  const createAuctionMutation = useMutation({
    mutationFn: (data: Partial<IAuction>) => auctionsApi.createAuction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });

  // Update auction mutation  
  const updateAuctionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IAuction> }) => 
      auctionsApi.updateAuction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });

  // Delete auction mutation
  const deleteAuctionMutation = useMutation({
    mutationFn: (id: string) => auctionsApi.deleteAuction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });

  // Add item to auction mutation
  const addItemToAuctionMutation = useMutation({
    mutationFn: ({ id, itemData }: { id: string; itemData: auctionsApi.AddItemToAuctionData }) => 
      auctionsApi.addItemToAuction(id, itemData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });

  // Remove item from auction mutation
  const removeItemFromAuctionMutation = useMutation({
    mutationFn: ({ id, itemId, itemCategory }: { id: string; itemId: string; itemCategory?: string }) => 
      auctionsApi.removeItemFromAuction(id, itemId, itemCategory),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });

  // Mark auction item sold mutation
  const markAuctionItemSoldMutation = useMutation({
    mutationFn: ({ id, saleData }: { id: string; saleData: { itemId: string; itemCategory: string; soldPrice: number } }) => 
      auctionsApi.markAuctionItemSold(id, saleData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });

  /**
   * Create new auction with React Query mutation
   */
  const createAuction = useCallback(
    async (data: Partial<IAuction>): Promise<IAuction> => {
      try {
        setError(null);
        const result = await createAuctionMutation.mutateAsync(data);
        return result;
      } catch (err) {
        const errorMessage = 'Failed to create auction';
        setError(errorMessage);
        handleApiError(err, errorMessage);
        throw err;
      }
    },
    [createAuctionMutation]
  );

  /**
   * Update auction with React Query mutation
   */
  const updateAuction = useCallback(
    async (id: string, data: Partial<IAuction>) => {
      try {
        setError(null);
        await updateAuctionMutation.mutateAsync({ id, data });
      } catch (err) {
        const errorMessage = `Failed to update auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      }
    },
    [updateAuctionMutation]
  );

  /**
   * Delete auction with React Query mutation
   */
  const deleteAuction = useCallback(
    async (id: string) => {
      try {
        setError(null);
        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuction] Deleting auction with ID:', id);
        }

        // Clear current auction if it's the one being deleted
        if ((currentAuction?.id || currentAuction?._id) === id) {
          setCurrentAuction(null);
        }

        await deleteAuctionMutation.mutateAsync(id);

        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuction] Auction deleted successfully');
        }
      } catch (err) {
        const errorMessage = `Failed to delete auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      }
    },
    [currentAuction?.id, deleteAuctionMutation]
  );

  /**
   * Add item to auction with React Query mutation
   */
  const addItemToAuction = useCallback(
    async (id: string, itemData: auctionsApi.AddItemToAuctionData) => {
      try {
        setError(null);
        await addItemToAuctionMutation.mutateAsync({ id, itemData });
      } catch (err) {
        const errorMessage = `Failed to add item to auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      }
    },
    [addItemToAuctionMutation]
  );

  /**
   * Remove item from auction with React Query mutation
   */
  const removeItemFromAuction = useCallback(
    async (id: string, itemId: string, itemCategory?: string) => {
      try {
        setError(null);
        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuction] Removing item:', {
            id,
            itemId,
            itemCategory,
          });
        }

        await removeItemFromAuctionMutation.mutateAsync({ id, itemId, itemCategory });

        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuction] Item removed successfully');
        }
      } catch (err: any) {
        // CRITICAL FIX: If we get 404, the item is already gone, so still refresh the cache
        if (err?.response?.status === 404) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useAuction] Item already removed (404), refreshing cache...');
          }
          // The mutation onSuccess will handle cache invalidation
          queryClient.invalidateQueries({ queryKey: queryKeys.auctionDetail(id) });
          queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
        } else {
          const errorMessage = `Failed to remove item from auction with ID: ${id}`;
          setError(errorMessage);
          handleApiError(err, errorMessage);
        }
      }
    },
    [removeItemFromAuctionMutation, queryClient]
  );

  /**
   * Mark auction item as sold with React Query mutation
   */
  const markAuctionItemSold = useCallback(
    async (
      id: string,
      saleData: { itemId: string; itemCategory: string; soldPrice: number }
    ) => {
      try {
        setError(null);
        await markAuctionItemSoldMutation.mutateAsync({ id, saleData });
      } catch (err) {
        const errorMessage = `Failed to mark auction item as sold for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
      }
    },
    [markAuctionItemSoldMutation]
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
        setError(null);
        const blob = await exportApi.getAuctionFacebookTextFile(id);
        const filename = `auction-${id}-facebook-post.txt`;
        exportApi.downloadBlob(blob, filename);
      } catch (err) {
        const errorMessage = `Failed to download text file for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
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
        setError(null);
        const blob = await exportApi.zipAuctionImages(id);
        const filename = `auction-${id}-images.zip`;
        exportApi.downloadBlob(blob, filename);
      } catch (err) {
        const errorMessage = `Failed to download images zip for auction with ID: ${id}`;
        setError(errorMessage);
        handleApiError(err, errorMessage);
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

  // NOTE: Removed automatic fetch on mount to prevent circular reference errors
  // Pages that need auction data should explicitly call fetchAuctions()
  // This prevents unnecessary API calls on pages like CreateAuction that don't need existing auctions

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
