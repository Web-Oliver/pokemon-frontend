/**
 * Card Formatting Utilities - Layer 2 Domain
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only Pokemon card formatting and display
 * DRY: Single source for card utilities
 * Depends only on Layer 1 utilities
 */

import { normalize } from '../core/string';

/**
 * Format card name for display
 */
export const formatCardName = (cardName: string): string => {
  if (!cardName) return cardName;

  return cardName
    .replace(/-/g, ' ')
    .replace(/\(#(\d+)\)$/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Format display name with pokemon number
 */
export const formatDisplayNameWithNumber = (
  cardName: string,
  cardNumber?: string
): string => {
  const formattedName = formatCardName(cardName);

  if (cardNumber) {
    const trimmedNumber = cardNumber.replace(/^#/, '');
    if (formattedName.endsWith(trimmedNumber)) {
      return formattedName;
    }
    return `${formattedName} ${trimmedNumber}`;
  }

  return formattedName;
};

/**
 * Get item title from various item types
 */
export const getItemTitle = (item: any): string => {
  if (!item) return 'Loading...';

  // PSA/Raw cards
  if ('cardId' in item || 'cardName' in item) {
    return item.cardId?.cardName || item.cardName || 'Unknown Card';
  }

  // Sealed products
  if ('productId' in item && item.productId) {
    if (item.productId?.productName) {
      return item.productId.productName;
    }
    if (item.productId?.category) {
      return item.productId.category.replace(/-/g, ' ');
    }
  }

  return 'Unknown Item';
};

/**
 * Get item subtitle based on type
 */
export const getItemSubtitle = (item: any): string => {
  if (!item) return '';

  if ('grade' in item) {
    return `PSA Grade ${item.grade}`;
  }

  if ('condition' in item) {
    return `Condition: ${item.condition}`;
  }

  if ('productId' in item && item.productId?.category) {
    return `Category: ${item.productId.category.replace(/-/g, ' ')}`;
  }

  return '';
};

/**
 * Get set name from item
 */
export const getSetName = (item: any): string => {
  if (!item) return '';

  // For cards
  if ('cardId' in item && item.cardId?.setId?.setName) {
    return item.cardId.setId.setName;
  }

  // For sealed products
  if ('productId' in item && item.productId?.productName) {
    const productName = item.productId.productName;
    const setName = productName
      .replace(/(Booster|Box|Pack|Elite Trainer Box|ETB).*$/i, '')
      .trim();
    return setName || 'Set Name Pending';
  }

  return 'Unknown Set';
};

/**
 * Get item type
 */
export const getItemType = (
  item: any
): 'psa' | 'raw' | 'sealed' | 'unknown' => {
  if (!item) return 'unknown';

  if ('grade' in item) return 'psa';
  if ('condition' in item) return 'raw';
  if ('category' in item) return 'sealed';

  return 'unknown';
};