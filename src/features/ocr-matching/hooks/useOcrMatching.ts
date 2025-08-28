/**
 * ICR Matching Hook - INDIVIDUAL ENDPOINT IMPLEMENTATION
 * Provides ALL individual ICR processing steps as separate methods
 * SOLID: Single Responsibility for each ICR step
 * DRY: Centralized API call handling with proper error management
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  OcrApiRepository, 
  IcrUploadResponse,
  IcrExtractLabelsResponse,
  IcrStitchResult,
  IcrOcrResult,
  IcrDistributeResult,
  IcrMatchResult,
  IcrResultsResponse, 
  IcrStatusResponse,
  IcrSelectMatchResponse,
  IcrCreatePsaResponse,
  IcrCreatePsaRequest,
} from '../infrastructure/api/OcrApiRepository';
import { queryKeys } from '../../../app/lib/queryClient';

interface UseIcrMatchingReturn {
  // ================================
  // MUTATIONS
  // ================================
  
  uploadMutation: any;
  extractMutation: any;
  stitchMutation: any;
  processOcrMutation: any;
  distributeTextMutation: any;
  matchCardsMutation: any;
  deleteScansMutation: any;
  deleteStitchedMutation: any;
  selectMatchMutation: any;
  createPsaMutation: any;
  
  // ================================
  // QUERIES
  // ================================
  
  scansQuery: (options: { status?: string; limit?: number }) => { data: any; isLoading: boolean };
  statusQuery: () => { data: any; isLoading: boolean };
  
  // ================================  
  // IMAGE SERVING UTILITIES - DEPRECATED
  // ================================
  // Image URLs are now automatically transformed in API responses
  // Use imageUrlService directly if manual URL construction is needed
}

export const useOcrMatching = (): UseIcrMatchingReturn => {
  const queryClient = useQueryClient();
  const apiRepository = new OcrApiRepository();


  // ================================
  // MUTATION HOOKS
  // ================================

  const uploadMutation = useMutation({
    mutationFn: (imageFiles: File[]) => apiRepository.uploadImages(imageFiles),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Ensure fresh data for next step
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
      queryClient.invalidateQueries({ queryKey: ['stitched-images'] });
    },
  });

  const extractMutation = useMutation({
    mutationFn: (scanIds: string[]) => apiRepository.extractLabels(scanIds),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Force fresh data for next step
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
    },
  });

  const stitchMutation = useMutation({
    mutationFn: (imageHashes: string[]) => apiRepository.stitchImages(imageHashes),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data for OCR step
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['stitched-images'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
    },
  });

  const ocrMutation = useMutation({
    mutationFn: ({ imageHashes, stitchedImagePath }: { imageHashes: string[], stitchedImagePath?: string }) => 
      apiRepository.processOcr(imageHashes, stitchedImagePath),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data for text distribution step
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['stitched-images'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
    },
  });

  const distributeMutation = useMutation({
    mutationFn: ({ imageHashes, ocrResult }: { imageHashes: string[], ocrResult?: IcrOcrResult }) => 
      apiRepository.distributeText(imageHashes, ocrResult),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data for card matching step
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
    },
  });

  const matchMutation = useMutation({
    mutationFn: (imageHashes: string[]) => apiRepository.matchCards(imageHashes),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data for final results
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
      queryClient.invalidateQueries({ queryKey: ['card-matches'] });
    },
  });

  const deleteScansMutation = useMutation({
    mutationFn: (scanIds: string[]) => apiRepository.deleteScans(scanIds),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data after deletion
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
      queryClient.invalidateQueries({ queryKey: ['stitched-images'] });
    },
  });

  const deleteStitchedMutation = useMutation({
    mutationFn: (stitchedId: string) => apiRepository.deleteStitchedImage(stitchedId),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data after stitched image deletion
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['stitched-images'] });
      queryClient.invalidateQueries({ queryKey: ['icr-status'] });
    },
  });

  const selectMatchMutation = useMutation({
    mutationFn: ({ imageHash, cardId }: { imageHash: string, cardId: string }) => 
      apiRepository.selectCardMatch(imageHash, cardId),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data after match selection
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['card-matches'] });
    },
  });

  const createPsaMutation = useMutation({
    mutationFn: ({ imageHash, psaData }: { imageHash: string, psaData: IcrCreatePsaRequest }) => 
      apiRepository.createPsaCard(imageHash, psaData),
    onSuccess: () => {
      // AGGRESSIVE INVALIDATION - Fresh data after PSA card creation
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['psa-cards'] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },
  });

  // URL helper functions removed - now handled automatically by ImageUrlService

  // ================================
  // QUERY FUNCTION
  // ================================
  
  const scansQuery = useCallback((options: { status?: string; limit?: number }) => {
    return useQuery({
      queryKey: ['scans', options.status, options.limit],
      queryFn: () => apiRepository.getScans(options),
      enabled: !!options.status,
      staleTime: 0, // ZERO STALE TIME - Always fresh data
      gcTime: 0, // No cache retention (replaces cacheTime in v5)
      refetchOnMount: 'always', // Always refetch on mount
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });
  }, [apiRepository]);

  // STATUS QUERY - Always fresh pipeline status
  const statusQuery = useCallback(() => {
    return useQuery({
      queryKey: ['icr-status'],
      queryFn: () => apiRepository.getStatus(),
      staleTime: 0, // ZERO STALE TIME - Always fresh status
      gcTime: 0, // No cache retention
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchInterval: 2000, // Auto-refresh every 2 seconds for live updates
    });
  }, [apiRepository]);

  return {
    // ================================
    // MUTATIONS
    // ================================
    uploadMutation,
    extractMutation,
    stitchMutation,
    processOcrMutation: ocrMutation,
    distributeTextMutation: distributeMutation,
    matchCardsMutation: matchMutation,
    deleteScansMutation,
    deleteStitchedMutation,
    selectMatchMutation,
    createPsaMutation,
    
    // ================================
    // QUERIES - ALWAYS FRESH DATA
    // ================================
    scansQuery,
    statusQuery,
    getScanDetails: (scanId: string) => apiRepository.getScanDetails(scanId),
    
    // ================================
    // IMAGE SERVING UTILITIES - DEPRECATED
    // ================================
    // Image URLs are now automatically transformed in API responses
  };
};

// Export all response types for component use
export type {
  IcrUploadResponse,
  IcrExtractLabelsResponse,
  IcrStitchResult,
  IcrOcrResult,
  IcrDistributeResult,
  IcrMatchResult,
  IcrResultsResponse,
  IcrStatusResponse,
  IcrSelectMatchResponse,
  IcrCreatePsaResponse,
  IcrCreatePsaRequest
};

// Main hook export
export { useOcrMatching as useIcrMatching };