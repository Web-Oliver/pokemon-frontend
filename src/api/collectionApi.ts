/**
 * Collection API Client
 * Handles CRUD operations for collection management (PSA cards, raw cards, sealed products)
 */

import apiClient from './apiClient';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';

/**
 * Helper function to map _id to id for MongoDB compatibility
 * @param item - Item object or array of items
 * @returns Item(s) with id field mapped from _id
 */
const mapItemIds = (item: any): any => {
  if (!item) {
    return item;
  }

  if (Array.isArray(item)) {
    return item.map(mapItemIds);
  }

  if (typeof item === 'object') {
    const newItem = { ...item };
    
    // Map _id to id for the current object, ensuring we always have an id field
    if (newItem._id) {
      newItem.id = newItem._id;
      // Keep _id for debugging but ensure id is primary
    } else if (!newItem.id && newItem._id) {
      newItem.id = newItem._id;
    }

    // Recursively process nested objects
    Object.keys(newItem).forEach(key => {
      if (typeof newItem[key] === 'object' && newItem[key] !== null && !Array.isArray(newItem[key])) {
        newItem[key] = mapItemIds(newItem[key]);
      } else if (Array.isArray(newItem[key])) {
        newItem[key] = newItem[key].map((arrayItem: any) => mapItemIds(arrayItem));
      }
    });

    return newItem;
  }

  return item;
};

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
  const response = await apiClient.get('/psa-graded-cards', { params });
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Get PSA graded card by ID
 * @param id - PSA graded card ID
 * @returns Promise<IPsaGradedCard> - Single PSA graded card
 */
export const getPsaGradedCardById = async (id: string): Promise<IPsaGradedCard> => {
  const response = await apiClient.get(`/psa-graded-cards/${id}`);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Create new PSA graded card in collection
 * @param data - PSA graded card data
 * @returns Promise<IPsaGradedCard> - Created PSA graded card
 */
export const createPsaGradedCard = async (
  data: Partial<IPsaGradedCard>
): Promise<IPsaGradedCard> => {
  const response = await apiClient.post('/psa-graded-cards', data);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
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
  const response = await apiClient.put(`/psa-graded-cards/${id}`, data);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Delete PSA graded card from collection
 * @param id - PSA graded card ID
 * @returns Promise<void>
 */
export const deletePsaGradedCard = async (id: string): Promise<void> => {
  await apiClient.delete(`/psa-graded-cards/${id}`);
};

/**
 * Mark PSA graded card as sold
 * @param id - PSA graded card ID
 * @param saleDetails - Sale details
 * @returns Promise<IPsaGradedCard> - Updated PSA graded card
 */
export const markPsaGradedCardSold = async (
  id: string,
  saleDetails: ISaleDetails
): Promise<IPsaGradedCard> => {
  const response = await apiClient.post(`/psa-graded-cards/${id}/mark-sold`, saleDetails);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
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
export const getRawCards = async (params?: RawCardsParams): Promise<IRawCard[]> => {
  const response = await apiClient.get('/raw-cards', { params });
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Get raw card by ID
 * @param id - Raw card ID
 * @returns Promise<IRawCard> - Single raw card
 */
export const getRawCardById = async (id: string): Promise<IRawCard> => {
  const response = await apiClient.get(`/raw-cards/${id}`);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Create new raw card in collection
 * @param data - Raw card data
 * @returns Promise<IRawCard> - Created raw card
 */
export const createRawCard = async (data: Partial<IRawCard>): Promise<IRawCard> => {
  const response = await apiClient.post('/raw-cards', data);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Update raw card in collection
 * @param id - Raw card ID
 * @param data - Updated raw card data
 * @returns Promise<IRawCard> - Updated raw card
 */
export const updateRawCard = async (id: string, data: Partial<IRawCard>): Promise<IRawCard> => {
  const response = await apiClient.put(`/raw-cards/${id}`, data);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Delete raw card from collection
 * @param id - Raw card ID
 * @returns Promise<void>
 */
export const deleteRawCard = async (id: string): Promise<void> => {
  await apiClient.delete(`/raw-cards/${id}`);
};

/**
 * Mark raw card as sold
 * @param id - Raw card ID
 * @param saleDetails - Sale details
 * @returns Promise<IRawCard> - Updated raw card
 */
export const markRawCardSold = async (id: string, saleDetails: ISaleDetails): Promise<IRawCard> => {
  const response = await apiClient.post(`/raw-cards/${id}/mark-sold`, saleDetails);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

// Sealed Products Collection APIs
export interface SealedProductCollectionParams {
  category?: string;
  setName?: string;
  sold?: boolean;
}

/**
 * Get sealed products from collection
 * @param params - Optional filter parameters
 * @returns Promise<ISealedProduct[]> - Array of sealed products
 */
export const getSealedProductCollection = async (
  params?: SealedProductCollectionParams
): Promise<ISealedProduct[]> => {
  const response = await apiClient.get('/sealed-products', { params });
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Get sealed product by ID
 * @param id - Sealed product ID
 * @returns Promise<ISealedProduct> - Single sealed product
 */
export const getSealedProductById = async (id: string): Promise<ISealedProduct> => {
  const response = await apiClient.get(`/sealed-products/${id}`);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Create new sealed product in collection
 * @param data - Sealed product data
 * @returns Promise<ISealedProduct> - Created sealed product
 */
export const createSealedProduct = async (
  data: Partial<ISealedProduct>
): Promise<ISealedProduct> => {
  const response = await apiClient.post('/sealed-products', data);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
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
  const response = await apiClient.put(`/sealed-products/${id}`, data);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};

/**
 * Delete sealed product from collection
 * @param id - Sealed product ID
 * @returns Promise<void>
 */
export const deleteSealedProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/sealed-products/${id}`);
};

/**
 * Mark sealed product as sold
 * @param id - Sealed product ID
 * @param saleDetails - Sale details
 * @returns Promise<ISealedProduct> - Updated sealed product
 */
export const markSealedProductSold = async (
  id: string,
  saleDetails: ISaleDetails
): Promise<ISealedProduct> => {
  const response = await apiClient.post(`/sealed-products/${id}/mark-sold`, saleDetails);
  const responseData = response.data.data || response.data;
  return mapItemIds(responseData);
};
