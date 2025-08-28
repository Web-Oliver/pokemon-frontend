/**
 * PHASE 2 SOLID/DRY REFACTORING - Query Invalidation Patterns
 * 
 * Centralizes 36+ duplicate queryClient.invalidateQueries patterns
 * 
 * Before: Scattered across useCollectionOperations, useAuction, useOcrMatching, etc.
 * After: Single reusable hook with semantic methods
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/app/lib/queryClient';

export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();

  // ========== COLLECTION INVALIDATIONS ==========
  
  const invalidateCollectionQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collection }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() }),
    ]);
  }, [queryClient]);

  const invalidatePsaCardQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collection }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() }),
    ]);
  }, [queryClient]);

  const invalidateRawCardQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collection }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() }),
    ]);
  }, [queryClient]);

  const invalidateSealedProductQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collection }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() }),
    ]);
  }, [queryClient]);

  const invalidateItemSoldQueries = useCallback((itemType: 'psa' | 'raw' | 'sealed') => {
    const baseQueries = [
      queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
      queryClient.invalidateQueries({ queryKey: queryKeys.activity }),
    ];

    const typeSpecificQuery = itemType === 'psa' 
      ? queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() })
      : itemType === 'raw'
      ? queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() })
      : queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() });

    return Promise.all([...baseQueries, typeSpecificQuery]);
  }, [queryClient]);

  // ========== AUCTION INVALIDATIONS ==========
  
  const invalidateAuctionQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionsList() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.activity }),
    ]);
  }, [queryClient]);

  const invalidateAuctionDetailQueries = useCallback((auctionId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionDetail(auctionId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auctionsList() }),
    ]);
  }, [queryClient]);

  // ========== OCR/ICR INVALIDATIONS ==========
  
  const invalidateOcrQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['scans'] }),
      queryClient.invalidateQueries({ queryKey: ['icr-status'] }),
      queryClient.invalidateQueries({ queryKey: ['stitched-images'] }),
      queryClient.invalidateQueries({ queryKey: ['card-matches'] }),
    ]);
  }, [queryClient]);

  const invalidateIcrQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.icr }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() }),
    ]);
  }, [queryClient]);

  const invalidateIcrUploadQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.icr }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() }),
    ]);
  }, [queryClient]);

  const invalidateIcrExtractQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.icr }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() }),
    ]);
  }, [queryClient]);

  const invalidateIcrStitchQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.icr }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() }),
    ]);
  }, [queryClient]);

  const invalidateIcrUpdateQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.icr }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() }),
    ]);
  }, [queryClient]);

  const invalidateIcrMatchQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.icr }),
      queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() }),
    ]);
  }, [queryClient]);

  // ========== DBA EXPORT INVALIDATIONS ==========
  
  const invalidateDbaExportQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dba-selection'] }),
      queryClient.invalidateQueries({ queryKey: ['dba-export-status'] }),
    ]);
  }, [queryClient]);

  // ========== ANALYTICS INVALIDATIONS ==========
  
  const invalidateAnalyticsQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
      queryClient.invalidateQueries({ queryKey: queryKeys.activity }),
      queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() }),
    ]);
  }, [queryClient]);

  // ========== COMPREHENSIVE INVALIDATIONS ==========
  
  const invalidateAllCollectionRelatedQueries = useCallback(() => {
    return Promise.all([
      invalidateCollectionQueries(),
      invalidateAnalyticsQueries(),
    ]);
  }, [invalidateCollectionQueries, invalidateAnalyticsQueries]);

  const invalidateAllQueries = useCallback(() => {
    return Promise.all([
      invalidateCollectionQueries(),
      invalidateAuctionQueries(), 
      invalidateAnalyticsQueries(),
      invalidateOcrQueries(),
      invalidateIcrQueries(),
      invalidateDbaExportQueries(),
    ]);
  }, [
    invalidateCollectionQueries,
    invalidateAuctionQueries,
    invalidateAnalyticsQueries,
    invalidateOcrQueries,
    invalidateIcrQueries,
    invalidateDbaExportQueries,
  ]);

  return {
    // Collection invalidations
    invalidateCollectionQueries,
    invalidatePsaCardQueries,
    invalidateRawCardQueries,
    invalidateSealedProductQueries,
    invalidateItemSoldQueries,
    
    // Auction invalidations
    invalidateAuctionQueries,
    invalidateAuctionDetailQueries,
    
    // OCR/ICR invalidations
    invalidateOcrQueries,
    invalidateIcrQueries,
    invalidateIcrUploadQueries,
    invalidateIcrExtractQueries,
    invalidateIcrStitchQueries,
    invalidateIcrUpdateQueries,
    invalidateIcrMatchQueries,
    
    // Export invalidations
    invalidateDbaExportQueries,
    
    // Analytics invalidations
    invalidateAnalyticsQueries,
    
    // Comprehensive invalidations
    invalidateAllCollectionRelatedQueries,
    invalidateAllQueries,
  };
};