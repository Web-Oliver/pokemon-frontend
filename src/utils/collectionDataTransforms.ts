/**
 * Collection Data Transformation Utilities
 * Layer 1: Core/Foundation - Data transformation utilities
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles data transformation (SRP)
 * - DRY: Centralized display data transformation logic
 * - Open/Closed: Extensible for new item types (OCP)
 */

import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';

// Unified display item interface for VirtualizedItemGrid
export interface DisplayItem {
  id: string;
  displayName: string;
  displayImage: string;
  displayPrice: number;
  images: string[]; // Full images array for ImageSlideshow
  setName?: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  pokemonNumber?: string;
  condition?: string;
  grade?: string;
  category?: string;
  // Original item for detail operations
  originalItem: IPsaGradedCard | IRawCard | ISealedProduct;
}

/**
 * Transform PSA Graded Card to Display Item
 */
export const transformPsaCardToDisplay = (card: IPsaGradedCard): DisplayItem => {
  // Debug log the actual card data structure
  console.log('[TRANSFORM] PSA Card data:', {
    id: card.id,
    cardId: card.cardId,
    grade: card.grade,
    images: card.images,
    myPrice: card.myPrice,
    fullCard: card
  });
  
  // Access nested populated fields correctly
  const cardData = (card as any).cardId || {};
  const setData = cardData.setId || {};
  
  const cardName = cardData.cardName || card.cardName;
  const baseName = cardData.baseName || card.baseName;
  const variety = cardData.variety || card.variety;
  const setName = setData.setName || card.setName;
  const pokemonNumber = cardData.pokemonNumber || card.pokemonNumber;
  
  console.log('[TRANSFORM] Extracted fields:', {
    cardName,
    baseName,
    variety,
    setName,
    pokemonNumber
  });
  
  // Use the actual card name from the populated field
  let displayName = cardName || baseName || 'Unknown Card';
  
  // Add variety if available and not already included
  if (variety && !displayName.includes(variety)) {
    displayName = `${displayName} (${variety})`;
  }
  
  // Add PSA grade
  displayName = `${displayName} - PSA ${card.grade}`;
  
  // Get first image with proper URL handling
  let displayImage = '';
  if (card.images && card.images.length > 0) {
    const imageUrl = card.images[0];
    // Handle both absolute URLs and relative paths
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      displayImage = imageUrl;
    } else {
      // Assume it's a filename that needs to be served from backend
      displayImage = `http://localhost:3000/uploads/${imageUrl}`;
    }
  }
  
  // Get actual price - handle Decimal128 from MongoDB
  const displayPrice = card.myPrice ? 
    (typeof card.myPrice === 'object' && card.myPrice.$numberDecimal ? 
      parseFloat(card.myPrice.$numberDecimal) : 
      parseFloat(card.myPrice.toString()) || 0) : 0;
  
  console.log('[TRANSFORM] PSA Price conversion:', {
    originalPrice: card.myPrice,
    convertedPrice: displayPrice
  });

  return {
    id: card.id,
    displayName,
    displayImage,
    displayPrice,
    images: card.images || [], // Full images array for slideshow
    setName: setName,
    itemType: 'PsaGradedCard',
    pokemonNumber: pokemonNumber,
    grade: card.grade,
    originalItem: card,
  };
};

/**
 * Transform Raw Card to Display Item
 */
export const transformRawCardToDisplay = (card: IRawCard): DisplayItem => {
  console.log('[TRANSFORM] Raw Card data:', {
    id: card.id,
    cardId: card.cardId,
    condition: card.condition,
    images: card.images,
    myPrice: card.myPrice,
    fullCard: card
  });
  
  // Access nested populated fields correctly
  const cardData = (card as any).cardId || {};
  const setData = cardData.setId || {};
  
  const cardName = cardData.cardName || card.cardName;
  const baseName = cardData.baseName || card.baseName;
  const variety = cardData.variety || card.variety;
  const setName = setData.setName || card.setName;
  const pokemonNumber = cardData.pokemonNumber || card.pokemonNumber;
  
  console.log('[TRANSFORM] Raw Card extracted fields:', {
    cardName,
    baseName,
    variety,
    setName,
    pokemonNumber
  });
  
  // Build display name with formatting
  let displayName = cardName || baseName || 'Unknown Card';
  
  // Add variety if available and not already included
  if (variety && !displayName.includes(variety)) {
    displayName = `${displayName} (${variety})`;
  }
  
  // Add condition
  displayName = `${displayName} - ${card.condition}`;
  
  // Get first image with proper URL handling
  let displayImage = '';
  if (card.images && card.images.length > 0) {
    const imageUrl = card.images[0];
    // Handle both absolute URLs and relative paths
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      displayImage = imageUrl;
    } else {
      // Assume it's a filename that needs to be served from backend
      displayImage = `http://localhost:3000/uploads/${imageUrl}`;
    }
  }
  
  // Get actual price - handle Decimal128 from MongoDB
  const displayPrice = card.myPrice ? 
    (typeof card.myPrice === 'object' && card.myPrice.$numberDecimal ? 
      parseFloat(card.myPrice.$numberDecimal) : 
      parseFloat(card.myPrice.toString()) || 0) : 0;
  
  console.log('[TRANSFORM] Raw Card Price conversion:', {
    originalPrice: card.myPrice,
    convertedPrice: displayPrice
  });

  return {
    id: card.id,
    displayName,
    displayImage,
    displayPrice,
    images: card.images || [], // Full images array for slideshow
    setName: setName,
    itemType: 'RawCard',
    pokemonNumber: pokemonNumber,
    condition: card.condition,
    originalItem: card,
  };
};

/**
 * Transform Sealed Product to Display Item
 */
export const transformSealedProductToDisplay = (product: ISealedProduct): DisplayItem => {
  console.log('[TRANSFORM] Sealed Product data:', {
    id: product.id,
    name: product.name,
    setName: product.setName,
    category: product.category,
    images: product.images,
    myPrice: product.myPrice,
    fullProduct: product
  });
  
  // Use product name directly
  const displayName = product.name || `${product.setName} Product`;
  
  // Get first image with proper URL handling
  let displayImage = '';
  if (product.images && product.images.length > 0) {
    const imageUrl = product.images[0];
    // Handle both absolute URLs and relative paths
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      displayImage = imageUrl;
    } else {
      // Assume it's a filename that needs to be served from backend
      displayImage = `http://localhost:3000/uploads/${imageUrl}`;
    }
  }
  
  // Get actual price - handle Decimal128 from MongoDB
  const displayPrice = product.myPrice ? 
    (typeof product.myPrice === 'object' && product.myPrice.$numberDecimal ? 
      parseFloat(product.myPrice.$numberDecimal) : 
      parseFloat(product.myPrice.toString()) || 0) : 0;
  
  console.log('[TRANSFORM] Sealed Product Price conversion:', {
    originalPrice: product.myPrice,
    convertedPrice: displayPrice
  });

  return {
    id: product.id,
    displayName,
    displayImage,
    displayPrice,
    images: product.images || [], // Full images array for slideshow
    setName: product.setName,
    itemType: 'SealedProduct',
    category: product.category as string,
    originalItem: product,
  };
};

/**
 * Transform array of mixed collection items to display items
 */
export const transformCollectionToDisplay = (
  items: (IPsaGradedCard | IRawCard | ISealedProduct)[]
): DisplayItem[] => {
  return items.map(item => {
    // Determine item type and transform accordingly
    if ('grade' in item && item.grade !== undefined) {
      return transformPsaCardToDisplay(item as IPsaGradedCard);
    } else if ('condition' in item && item.condition !== undefined) {
      return transformRawCardToDisplay(item as IRawCard);
    } else {
      return transformSealedProductToDisplay(item as ISealedProduct);
    }
  });
};

/**
 * Clean and format card name for display
 */
export const cleanCardName = (cardName: string, baseName?: string): string => {
  if (!cardName) return baseName || 'Unknown Card';
  
  // Remove redundant information and clean up formatting
  return cardName
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Format price for display with currency
 */
export const formatPriceDisplay = (price: number, currency: string = 'kr.'): string => {
  return `${(price || 0).toLocaleString()} ${currency}`;
};

/**
 * Get item type from mixed item
 */
export const getItemType = (item: any): 'PsaGradedCard' | 'RawCard' | 'SealedProduct' => {
  if ('grade' in item && item.grade !== undefined) return 'PsaGradedCard';
  if ('condition' in item && item.condition !== undefined) return 'RawCard';
  return 'SealedProduct';
};