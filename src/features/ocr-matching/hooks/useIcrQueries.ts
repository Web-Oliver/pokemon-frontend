/**
 * ICR React Query Hooks - Proper TanStack Query Implementation
 * Individual hooks for each ICR operation with proper cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OcrApiRepository } from '../infrastructure/api/OcrApiRepository';
import { queryKeys, CACHE_TIMES } from '../../../app/lib/queryClient';

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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageFiles: File[]) => apiRepository.uploadImages(imageFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.icr });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
    },
  });
};

export const useExtractLabels = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scanIds: string[]) => apiRepository.extractLabels(scanIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.icr });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
    },
  });
};

export const useStitchImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageHashes: string[]) => apiRepository.stitchImages(imageHashes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.icr });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
    },
  });
};

export const useDeleteStitchedImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (stitchedId: string) => apiRepository.deleteStitchedImage(stitchedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.icr });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
    },
  });
};

export const useDeleteScans = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scanIds: string[]) => apiRepository.deleteScans(scanIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.icr });
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
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