/**
 * Item Display Utilities
 *
 * Centralizes item data extraction and formatting logic across AuctionDetail and CollectionItemDetail
 * Following CLAUDE.md principles: DRY, Single Responsibility, and consistent data handling
 */

import { getImageUrl, type ImageSource } from '../ui/imageUtils';
import { displayKrPrice, displayPriceWithFallback } from '../formatting/prices';

// Core item display data interface
export interface ItemDisplayData {
  itemName: string;
  itemImage?: string;
  setName?: string;
  cardNumber?: string;
  grade?: number;
  condition?: string;
  price?: number;
}

// Status color mappings following theme system
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
    case 'active':
      return 'bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] border border-[var(--theme-accent-primary)]/50';
    case 'sold':
      return 'bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/50';
    case 'expired':
      return 'bg-[var(--theme-status-error)]/20 text-[var(--theme-status-error)] border border-[var(--theme-status-error)]/50';
    default:
      return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
  }
};

// Item category color mappings
export const getItemCategoryColor = (category: string): string => {
  switch (category) {
    case 'PsaGradedCard':
    case 'psaGradedCard':
    case 'psa':
      return 'bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] border border-[var(--theme-accent-primary)]/50';
    case 'RawCard':
    case 'rawCard':
    case 'raw':
      return 'bg-[var(--theme-accent-secondary)]/20 text-[var(--theme-accent-secondary)] border border-[var(--theme-accent-secondary)]/50';
    case 'SealedProduct':
    case 'sealedProduct':
    case 'sealed':
      return 'bg-[var(--theme-status-info)]/20 text-[var(--theme-status-info)] border border-[var(--theme-status-info)]/50';
    default:
      return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
  }
};

// Format item category for display
export const formatItemCategory = (category: string): string => {
  switch (category) {
    case 'PsaGradedCard':
    case 'psaGradedCard':
      return 'PSA Graded';
    case 'RawCard':
    case 'rawCard':
      return 'Raw Card';
    case 'SealedProduct':
    case 'sealedProduct':
      return 'Sealed Product';
    default:
      return category;
  }
};

// Helper function to get full image URL with proper source context
const getItemImageUrl = (imagePath: string | undefined, source: ImageSource = 'collection'): string | undefined => {
  if (!imagePath) {
    return undefined;
  }
  return getImageUrl(imagePath, source);
};

// Extract standardized display data from any item type
export const getItemDisplayData = (item: any, imageSource: ImageSource = 'collection'): ItemDisplayData => {
  const defaultData: ItemDisplayData = {
    itemName: 'Unknown Item',
    itemImage: undefined,
    setName: undefined,
    cardNumber: undefined,
    grade: undefined,
    condition: undefined,
    price: undefined,
  };

  if (!item) {
    return defaultData;
  }

  // Handle auction items (with itemData and itemCategory)
  if (item.itemData && item.itemCategory) {
    const { itemData, itemCategory } = item;

    switch (itemCategory) {
      case 'PsaGradedCard':
      case 'RawCard':
        return {
          itemName:
            itemData.cardId?.cardName || itemData.cardName || 'Unknown Item',
          itemImage: getItemImageUrl(itemData.images?.[0], imageSource),
          setName: itemData.cardId?.setId?.setName || itemData.setName,
          cardNumber: itemData.cardId?.cardNumber || itemData.cardNumber,
          grade: itemCategory === 'PsaGradedCard' ? itemData.grade : undefined,
          condition:
            itemCategory === 'RawCard' ? itemData.condition : undefined,
          price: itemData.myPrice,
        };
      case 'SealedProduct':
        return {
          itemName:
            itemData.name ||
            itemData.productId?.productName ||
            itemData.productName ||
            'Unknown Item',
          itemImage: getItemImageUrl(itemData.images?.[0], imageSource),
          setName:
            itemData.setName ||
            itemData.productId?.setProductName ||
            itemData.setProductName,
          cardNumber: undefined,
          grade: undefined,
          condition: undefined,
          price: itemData.myPrice,
        };
      default:
        return defaultData;
    }
  }

  // Handle direct collection items (PSA/Raw/Sealed)
  if ('cardId' in item || 'cardName' in item) {
    // PSA or Raw card
    return {
      itemName: item.cardId?.cardName || item.cardName || 'Unknown Card',
      itemImage: getItemImageUrl(item.images?.[0], imageSource),
      setName: item.cardId?.setId?.setName || item.setName,
      cardNumber: item.cardId?.cardNumber || item.cardNumber,
      grade: 'grade' in item ? item.grade : undefined,
      condition: 'condition' in item ? item.condition : undefined,
      price: item.myPrice,
    };
  }

  if ('productId' in item && item.productId) {
    // Sealed product
    return {
      itemName: item.productId?.productName || item.name || 'Unknown Product',
      itemImage: getItemImageUrl(item.images?.[0], imageSource),
      setName: item.productId?.setProductName || item.setName,
      cardNumber: undefined,
      grade: undefined,
      condition: undefined,
      price: item.myPrice,
    };
  }

  return defaultData;
};

// Get item title (simplified version of CollectionItemDetail logic)
export const getItemTitle = (item: any): string => {
  if (!item) {
    return 'Loading...';
  }

  // For PSA and Raw cards
  if ('cardId' in item || 'cardName' in item) {
    return item.cardId?.cardName || item.cardName || 'Unknown Card';
  }

  // For sealed products
  if ('productId' in item && item.productId) {
    return (
      item.productId?.productName ||
      item.productId?.category?.replace(/-/g, ' ') ||
      'Unknown Product'
    );
  }

  return 'Unknown Item';
};

// Get item subtitle with set and card number info
export const getItemSubtitle = (item: any): string => {
  if (!item) {
    return '';
  }

  const displayData = getItemDisplayData(item);
  const parts: string[] = [];

  if (displayData.setName) {
    parts.push(displayData.setName);
  }

  if (displayData.cardNumber) {
    parts.push(`#${displayData.cardNumber}`);
  }

  if (displayData.grade) {
    parts.push(`Grade ${displayData.grade}`);
  }

  if (displayData.condition) {
    parts.push(displayData.condition);
  }

  return parts.join(' • ');
};

// Format currency consistently - SOLID compliant kr formatting using centralized utility
export const formatCurrency = (amount: number | undefined): string => {
  return displayPriceWithFallback(amount, '0 kr');
};

// Format date consistently
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) {
    return 'N/A';
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};
