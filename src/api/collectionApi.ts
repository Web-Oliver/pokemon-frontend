/**
 * Collection API Client
 * Handles CRUD operations for collection management (PSA cards, raw cards, sealed products)
 */

import unifiedApiClient from './unifiedApiClient';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';

/**
 * Helper function to extract data from wrapped API responses
 * Backend returns format: {success: true, count: number, data: Array}
 * @param responseData - Raw response from API
 * @returns The actual data array/object
 */
const extractResponseData = (responseData: any): any => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
};

/**
 * Helper function to identify metadata objects that shouldn't be processed for IDs
 * @param key - The property key
 * @param value - The property value
 * @returns true if this is a metadata object that should be skipped
 */
const isMetadataObject = (key: string, value: any): boolean => {
  // Skip known metadata/property objects
  const metadataKeys = [
    'saleDetails',
    'psaGrades',
    'psaTotalGradedForCard',
    'priceHistory',
    'metadata',
    'cardInfo',
    'productInfo',
    'setInfo',
  ];

  if (metadataKeys.includes(key)) {
    return true;
  }

  // Skip objects with known metadata properties
  if (typeof value === 'object' && value !== null) {
    const hasMetadataProps = [
      'paymentMethod',
      'actualSoldPrice',
      'deliveryMethod',
      'dateSold',
      'wasNew',
      'isSaleUpdate',
      'psa_1',
      'psa_2',
      'psa_3',
      'psa_4',
      'psa_5',
      'psa_6',
      'psa_7',
      'psa_8',
      'psa_9',
      'psa_10',
    ].some(prop => prop in value);

    if (hasMetadataProps) {
      return true;
    }
  }

  return false;
};

/**
 * Helper function to map _id to id for MongoDB compatibility
 * @param item - Item object or array of items
 * @returns Item(s) with id field mapped from _id
 */
const mapItemIds = (item: unknown): unknown => {
  if (!item) {
    return item;
  }

  if (Array.isArray(item)) {
    const mappedArray = item.map(mapItemIds);

    // Debug: Check for duplicate IDs in arrays (collection items)
    const ids = mappedArray
      .filter(item => item && typeof item === 'object')
      .map(item => (item as any).id)
      .filter(id => id !== undefined);

    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      console.error('[COLLECTION API] Duplicate IDs detected in array:', duplicates, {
        totalItems: ids.length,
        uniqueItems: uniqueIds.size,
        items: mappedArray,
      });
    }

    return mappedArray;
  }

  if (typeof item === 'object') {
    const newItem = { ...item } as Record<string, unknown>;

    // Map _id to id for the current object, ensuring we always have an id field
    if (newItem._id) {
      newItem.id = newItem._id;
      // Keep _id for debugging but ensure id is primary
    } else if (!newItem.id) {
      // Log warning for items without any ID - this shouldn't happen with valid MongoDB documents
      console.warn('[COLLECTION API] Item found without _id or id field:', newItem);
    }

    // Only recursively process specific nested collection-related objects and arrays
    // Avoid processing metadata objects like saleDetails, psaGrades, etc.
    Object.keys(newItem).forEach(key => {
      const value = newItem[key];

      if (Array.isArray(value)) {
        // Process arrays (like images, priceHistory)
        newItem[key] = value.map((arrayItem: unknown) => mapItemIds(arrayItem));
      } else if (
        typeof value === 'object' &&
        value !== null &&
        // Only process objects that might contain collection items or nested collections
        // Skip known metadata/property objects
        !isMetadataObject(key, value)
      ) {
        newItem[key] = mapItemIds(value);
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
  console.log('[COLLECTION API] getPsaGradedCards called with params:', params);
  const responseData = await unifiedApiClient.get('/psa-graded-cards', {
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
  console.log('[COLLECTION API] getPsaGradedCards raw response:', responseData);
  const extractedData = extractResponseData(responseData);
  console.log('[COLLECTION API] getPsaGradedCards extracted data:', extractedData);
  const mappedData = mapItemIds(extractedData);
  console.log('[COLLECTION API] getPsaGradedCards mapped data:', mappedData);
  console.log(
    '[COLLECTION API] getPsaGradedCards returning array length:',
    Array.isArray(mappedData) ? mappedData.length : 'NOT_ARRAY'
  );
  return mappedData as IPsaGradedCard[];
};

/**
 * Get PSA graded card by ID
 * @param id - PSA graded card ID
 * @returns Promise<IPsaGradedCard> - Single PSA graded card
 */
export const getPsaGradedCardById = async (id: string): Promise<IPsaGradedCard> => {
  const responseData = await unifiedApiClient.get(`/psa-graded-cards/${id}`);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IPsaGradedCard;
};

/**
 * Create new PSA graded card in collection
 * @param data - PSA graded card data
 * @returns Promise<IPsaGradedCard> - Created PSA graded card
 */
export const createPsaGradedCard = async (
  data: Partial<IPsaGradedCard>
): Promise<IPsaGradedCard> => {
  const responseData = await unifiedApiClient.post('/psa-graded-cards', data);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IPsaGradedCard;
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
  const responseData = await unifiedApiClient.put(`/psa-graded-cards/${id}`, data);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IPsaGradedCard;
};

/**
 * Delete PSA graded card from collection
 * @param id - PSA graded card ID
 * @returns Promise<void>
 */
export const deletePsaGradedCard = async (id: string): Promise<void> => {
  await unifiedApiClient.delete(`/psa-graded-cards/${id}`);
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
  const responseData = await unifiedApiClient.post(
    `/psa-graded-cards/${id}/mark-sold`,
    saleDetails
  );
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IPsaGradedCard;
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
  console.log('[COLLECTION API] getRawCards called with params:', params);
  const responseData = await unifiedApiClient.get('/raw-cards', {
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
  console.log('[COLLECTION API] getRawCards raw response:', responseData);
  const extractedData = extractResponseData(responseData);
  console.log('[COLLECTION API] getRawCards extracted data:', extractedData);
  const mappedData = mapItemIds(extractedData);
  console.log(
    '[COLLECTION API] getRawCards returning array length:',
    Array.isArray(mappedData) ? mappedData.length : 'NOT_ARRAY'
  );
  return mappedData as IRawCard[];
};

/**
 * Get raw card by ID
 * @param id - Raw card ID
 * @returns Promise<IRawCard> - Single raw card
 */
export const getRawCardById = async (id: string): Promise<IRawCard> => {
  const responseData = await unifiedApiClient.get(`/raw-cards/${id}`);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IRawCard;
};

/**
 * Create new raw card in collection
 * @param data - Raw card data
 * @returns Promise<IRawCard> - Created raw card
 */
export const createRawCard = async (data: Partial<IRawCard>): Promise<IRawCard> => {
  const responseData = await unifiedApiClient.post('/raw-cards', data);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IRawCard;
};

/**
 * Update raw card in collection
 * @param id - Raw card ID
 * @param data - Updated raw card data
 * @returns Promise<IRawCard> - Updated raw card
 */
export const updateRawCard = async (id: string, data: Partial<IRawCard>): Promise<IRawCard> => {
  const responseData = await unifiedApiClient.put(`/raw-cards/${id}`, data);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IRawCard;
};

/**
 * Delete raw card from collection
 * @param id - Raw card ID
 * @returns Promise<void>
 */
export const deleteRawCard = async (id: string): Promise<void> => {
  await unifiedApiClient.delete(`/raw-cards/${id}`);
};

/**
 * Mark raw card as sold
 * @param id - Raw card ID
 * @param saleDetails - Sale details
 * @returns Promise<IRawCard> - Updated raw card
 */
export const markRawCardSold = async (id: string, saleDetails: ISaleDetails): Promise<IRawCard> => {
  const responseData = await unifiedApiClient.post(`/raw-cards/${id}/mark-sold`, saleDetails);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as IRawCard;
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
  console.log('[COLLECTION API] getSealedProductCollection called with params:', params);
  const responseData = await unifiedApiClient.get('/sealed-products', {
    params,
    optimization: {
      enableCache: false,
      enableDeduplication: false,
    },
  });
  console.log('[COLLECTION API] getSealedProductCollection raw response:', responseData);
  const extractedData = extractResponseData(responseData);
  console.log('[COLLECTION API] getSealedProductCollection extracted data:', extractedData);
  const mappedData = mapItemIds(extractedData);
  console.log(
    '[COLLECTION API] getSealedProductCollection returning array length:',
    Array.isArray(mappedData) ? mappedData.length : 'NOT_ARRAY'
  );
  return mappedData as ISealedProduct[];
};

/**
 * Get sealed product by ID
 * @param id - Sealed product ID
 * @returns Promise<ISealedProduct> - Single sealed product
 */
export const getSealedProductById = async (id: string): Promise<ISealedProduct> => {
  const responseData = await unifiedApiClient.get(`/sealed-products/${id}`);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as ISealedProduct;
};

/**
 * Create new sealed product in collection
 * @param data - Sealed product data
 * @returns Promise<ISealedProduct> - Created sealed product
 */
export const createSealedProduct = async (
  data: Partial<ISealedProduct>
): Promise<ISealedProduct> => {
  const responseData = await unifiedApiClient.post('/sealed-products', data);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as ISealedProduct;
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
  const responseData = await unifiedApiClient.put(`/sealed-products/${id}`, data);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as ISealedProduct;
};

/**
 * Delete sealed product from collection
 * @param id - Sealed product ID
 * @returns Promise<void>
 */
export const deleteSealedProduct = async (id: string): Promise<void> => {
  await unifiedApiClient.delete(`/sealed-products/${id}`);
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
  const responseData = await unifiedApiClient.post(`/sealed-products/${id}/mark-sold`, saleDetails);
  const extractedData = extractResponseData(responseData);
  return mapItemIds(extractedData) as ISealedProduct;
};
