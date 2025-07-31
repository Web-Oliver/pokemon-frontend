/**
 * Collection API Client
 * Handles CRUD operations for collection management (PSA cards, raw cards, sealed products)
 *
 * OPTIMIZED: Now uses conditional logging system for production-ready code
 * Following CLAUDE.md principles - removed excessive debug logging
 */

import { unifiedApiClient } from './unifiedApiClient';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import { createApiLogger } from '../utils/apiLogger';

// Create logger instance for this API
const logger = createApiLogger('COLLECTION API');

// PSA Graded Cards Collection APIs
export interface PsaGradedCardsParams {
  grade?: string;
  setName?: string;
  cardName?: string;
  sold?: boolean;
}

/**
 * Get PSA graded cards from collection
 * @param params - Optional filter parameters
 * @returns Promise<IPsaGradedCard[]> - Array of PSA graded cards
 */
export const getPsaGradedCards = async (
  params?: PsaGradedCardsParams
): Promise<IPsaGradedCard[]> => {
  logger.logApiCall('getPsaGradedCards', params);
  const data = await unifiedApiClient.get<IPsaGradedCard[]>(
    '/psa-graded-cards',
    {
      params,
    }
  );
  logger.logResponse('getPsaGradedCards', data);
  logger.logProcessedData(
    'getPsaGradedCards',
    Array.isArray(data) ? data.length : 'NOT_ARRAY',
    'returning array length'
  );
  return data;
};

/**
 * Get PSA graded card by ID
 * @param id - PSA graded card ID
 * @returns Promise<IPsaGradedCard> - Single PSA graded card
 */
export const getPsaGradedCardById = async (
  id: string
): Promise<IPsaGradedCard> => {
  return await unifiedApiClient.getById<IPsaGradedCard>(
    '/psa-graded-cards',
    id
  );
};

/**
 * Create new PSA graded card in collection
 * @param data - PSA graded card data
 * @returns Promise<IPsaGradedCard> - Created PSA graded card
 */
export const createPsaGradedCard = async (
  data: Partial<IPsaGradedCard>
): Promise<IPsaGradedCard> => {
  return await unifiedApiClient.post<IPsaGradedCard>('/psa-graded-cards', data);
};

/**
 * Update PSA graded card in collection
 * @param id - PSA graded card ID
 * @param data - Updated PSA graded card data
 * @returns Promise<IPsaGradedCard> - Updated PSA graded card
 */
export const updatePsaGradedCard = async (
  id: string,
  data: Partial<IPsaGradedCard>
): Promise<IPsaGradedCard> => {
  return await unifiedApiClient.putById<IPsaGradedCard>(
    '/psa-graded-cards',
    id,
    data
  );
};

/**
 * Delete PSA graded card from collection
 * @param id - PSA graded card ID
 * @returns Promise<void>
 */
export const deletePsaGradedCard = async (id: string): Promise<void> => {
  await unifiedApiClient.deleteById('/psa-graded-cards', id);
};

/**
 * Mark PSA graded card as sold
 * Uses POST /api/psa-graded-cards/:id/mark-sold endpoint as per API documentation
 * @param id - PSA graded card ID
 * @param saleDetails - Sale details matching API saleDetails format
 * @returns Promise<IPsaGradedCard> - Updated PSA graded card
 */
export const markPsaGradedCardSold = async (
  id: string,
  saleDetails: ISaleDetails
): Promise<IPsaGradedCard> => {
  return await unifiedApiClient.postById<IPsaGradedCard>(
    '/psa-graded-cards',
    id,
    { saleDetails }, // Wrap in saleDetails object as per API documentation
    'mark-sold'
  );
};

// Raw Cards Collection APIs
export interface RawCardsParams {
  condition?: string;
  setName?: string;
  cardName?: string;
  sold?: boolean;
}

/**
 * Get raw cards from collection
 * @param params - Optional filter parameters
 * @returns Promise<IRawCard[]> - Array of raw cards
 */
export const getRawCards = async (
  params?: RawCardsParams
): Promise<IRawCard[]> => {
  logger.logApiCall('getRawCards', params);
  const data = await unifiedApiClient.get<IRawCard[]>('/raw-cards', {
    params: {
      ...params,
      _t: Date.now(), // Cache busting
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    optimization: {
      enableCache: false,
      enableDeduplication: false,
    },
  });
  logger.logResponse('getRawCards', data);
  logger.logProcessedData(
    'getRawCards',
    Array.isArray(data) ? data.length : 'NOT_ARRAY',
    'returning array length'
  );
  return data;
};

/**
 * Get raw card by ID
 * @param id - Raw card ID
 * @returns Promise<IRawCard> - Single raw card
 */
export const getRawCardById = async (id: string): Promise<IRawCard> => {
  return await unifiedApiClient.getById<IRawCard>('/raw-cards', id);
};

/**
 * Create new raw card in collection
 * @param data - Raw card data
 * @returns Promise<IRawCard> - Created raw card
 */
export const createRawCard = async (
  data: Partial<IRawCard>
): Promise<IRawCard> => {
  return await unifiedApiClient.post<IRawCard>('/raw-cards', data);
};

/**
 * Update raw card in collection
 * @param id - Raw card ID
 * @param data - Updated raw card data
 * @returns Promise<IRawCard> - Updated raw card
 */
export const updateRawCard = async (
  id: string,
  data: Partial<IRawCard>
): Promise<IRawCard> => {
  return await unifiedApiClient.putById<IRawCard>('/raw-cards', id, data);
};

/**
 * Delete raw card from collection
 * @param id - Raw card ID
 * @returns Promise<void>
 */
export const deleteRawCard = async (id: string): Promise<void> => {
  await unifiedApiClient.deleteById('/raw-cards', id);
};

/**
 * Mark raw card as sold
 * Uses POST /api/raw-cards/:id/mark-sold endpoint as per API documentation
 * @param id - Raw card ID
 * @param saleDetails - Sale details matching API saleDetails format
 * @returns Promise<IRawCard> - Updated raw card
 */
export const markRawCardSold = async (
  id: string,
  saleDetails: ISaleDetails
): Promise<IRawCard> => {
  return await unifiedApiClient.postById<IRawCard>(
    '/raw-cards',
    id,
    { saleDetails }, // Wrap in saleDetails object as per API documentation
    'mark-sold'
  );
};

// Sealed Products Collection APIs
export interface SealedProductCollectionParams {
  category?: string;
  setName?: string;
  sold?: boolean;
  search?: string;
}

/**
 * Get sealed products from collection
 * @param params - Optional filter parameters
 * @returns Promise<ISealedProduct[]> - Array of sealed products
 */
export const getSealedProductCollection = async (
  params?: SealedProductCollectionParams
): Promise<ISealedProduct[]> => {
  logger.logApiCall('getSealedProductCollection', params);
  const data = await unifiedApiClient.get<ISealedProduct[]>(
    '/sealed-products',
    {
      params,
      optimization: {
        enableCache: false,
        enableDeduplication: false,
      },
    }
  );
  logger.logResponse('getSealedProductCollection', data);
  logger.logProcessedData(
    'getSealedProductCollection',
    Array.isArray(data) ? data.length : 'NOT_ARRAY',
    'returning array length'
  );
  return data;
};

/**
 * Get sealed product by ID
 * @param id - Sealed product ID
 * @returns Promise<ISealedProduct> - Single sealed product
 */
export const getSealedProductById = async (
  id: string
): Promise<ISealedProduct> => {
  return await unifiedApiClient.getById<ISealedProduct>('/sealed-products', id);
};

/**
 * Create new sealed product in collection
 * @param data - Sealed product data
 * @returns Promise<ISealedProduct> - Created sealed product
 */
export const createSealedProduct = async (
  data: Partial<ISealedProduct>
): Promise<ISealedProduct> => {
  return await unifiedApiClient.post<ISealedProduct>('/sealed-products', data);
};

/**
 * Update sealed product in collection
 * @param id - Sealed product ID
 * @param data - Updated sealed product data
 * @returns Promise<ISealedProduct> - Updated sealed product
 */
export const updateSealedProduct = async (
  id: string,
  data: Partial<ISealedProduct>
): Promise<ISealedProduct> => {
  return await unifiedApiClient.putById<ISealedProduct>(
    '/sealed-products',
    id,
    data
  );
};

/**
 * Delete sealed product from collection
 * @param id - Sealed product ID
 * @returns Promise<void>
 */
export const deleteSealedProduct = async (id: string): Promise<void> => {
  await unifiedApiClient.deleteById('/sealed-products', id);
};

/**
 * Mark sealed product as sold
 * Uses POST /api/sealed-products/:id/mark-sold endpoint as per API documentation
 * @param id - Sealed product ID
 * @param saleDetails - Sale details matching API saleDetails format
 * @returns Promise<ISealedProduct> - Updated sealed product
 */
export const markSealedProductSold = async (
  id: string,
  saleDetails: ISaleDetails
): Promise<ISealedProduct> => {
  return await unifiedApiClient.postById<ISealedProduct>(
    '/sealed-products',
    id,
    { saleDetails }, // Wrap in saleDetails object as per API documentation
    'mark-sold'
  );
};
