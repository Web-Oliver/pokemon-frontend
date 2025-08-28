/**
 * ICR React Query Hooks - Proper TanStack Query Implementation
 * Individual hooks for each ICR operation with proper cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OcrApiRepository } from '../infrastructure/api/OcrApiRepository';
import { queryKeys, CACHE_TIMES } from '../../../app/lib/queryClient';
import { useQueryInvalidation } from '../../../shared/hooks/useQueryInvalidation';

const apiRepository = new OcrApiRepository();

// ================================
// QUERY HOOKS
// ================================

export const useIcrScans = (status?: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: queryKeys.icrScans(status, page, limit),
    queryFn: () => apiRepository.getScans({ status, page, limit }),
    staleTime: 0, // NO CACHING - Real-time ICR data required
    gcTime: 0, // NO CACHE RETENTION - Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useIcrStitchedImages = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: queryKeys.icrStitched(page, limit),
    queryFn: () => apiRepository.getStitchedImages({ page, limit }),
    staleTime: 0, // NO CACHING - Real-time ICR data required
    gcTime: 0, // NO CACHE RETENTION - Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useIcrStatus = () => {
  return useQuery({
    queryKey: queryKeys.icrStatus(),
    queryFn: () => apiRepository.getOverallStatus(),
    staleTime: 0, // NO CACHING - Real-time ICR data required
    gcTime: 0, // NO CACHE RETENTION - Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ================================
// MUTATION HOOKS
// ================================

export const useUploadImages = () => {
  const { invalidateIcrUploadQueries } = useQueryInvalidation();
  
  return useMutation({
    mutationFn: (imageFiles: File[]) => apiRepository.uploadImages(imageFiles),
    onSuccess: () => {
      // PHASE 2: Using centralized ICR upload invalidation patterns
      invalidateIcrUploadQueries();
    },
  });
};

export const useExtractLabels = () => {
  const { invalidateIcrExtractQueries } = useQueryInvalidation();
  
  return useMutation({
    mutationFn: (scanIds: string[]) => apiRepository.extractLabels(scanIds),
    onSuccess: () => {
      // PHASE 2: Using centralized ICR extract invalidation patterns
      invalidateIcrExtractQueries();
    },
  });
};

export const useStitchImages = () => {
  const { invalidateIcrStitchQueries } = useQueryInvalidation();
  
  return useMutation({
    mutationFn: (imageHashes: string[]) => apiRepository.stitchImages(imageHashes),
    onSuccess: () => {
      // PHASE 2: Using centralized ICR stitch invalidation patterns
      invalidateIcrStitchQueries();
    },
  });
};

export const useDeleteStitchedImage = () => {
  const { invalidateIcrUpdateQueries } = useQueryInvalidation();
  
  return useMutation({
    mutationFn: (stitchedId: string) => apiRepository.deleteStitchedImage(stitchedId),
    onSuccess: () => {
      // PHASE 2: Using centralized ICR update invalidation patterns
      invalidateIcrUpdateQueries();
    },
  });
};

export const useDeleteScans = () => {
  const { invalidateIcrMatchQueries } = useQueryInvalidation();
  
  return useMutation({
    mutationFn: (scanIds: string[]) => apiRepository.deleteScans(scanIds),
    onSuccess: () => {
      // PHASE 2: Using centralized ICR match invalidation patterns
      invalidateIcrMatchQueries();
    },
  });
};

// ================================
// UTILITY FUNCTIONS
// ================================

export const getImageUrls = () => ({
  getFullImageUrl: (filename: string) => apiRepository.getFullImageUrl(filename),
  getLabelImageUrl: (filename: string) => apiRepository.getLabelImageUrl(filename),
  getStitchedImageUrl: (filename: string) => apiRepository.getStitchedImageUrl(filename),
});