/**
 * Item Display Data Hook
 *
 * Provides consistent item data formatting and display logic
 * Following CLAUDE.md principles: DRY, centralized business logic, reusable patterns
 */

import { useMemo } from 'react';
import {
  getItemDisplayData,
  getItemTitle,
  getItemSubtitle,
  formatCurrency,
  formatDate,
  getStatusColor,
  getItemCategoryColor,
  formatItemCategory,
  ItemDisplayData,
} from '../utils/helpers/itemDisplayHelpers';

export interface UseItemDisplayDataReturn extends ItemDisplayData {
  // Formatted values
  formattedPrice: string;
  formattedDate?: string;

  // Display helpers
  title: string;
  subtitle: string;
  categoryDisplayName: string;
  categoryColorClass: string;
  statusColorClass?: string;

  // Utility functions
  getDetailValue: (key: keyof ItemDisplayData) => string;
  hasImages: boolean;
  isPsaCard: boolean;
  isRawCard: boolean;
  isSealedProduct: boolean;
}

export interface UseItemDisplayDataOptions {
  item: any;
  includeStatus?: boolean;
  dateField?: string; // field name for date formatting
}

export const useItemDisplayData = ({
  item,
  includeStatus = false,
  dateField = 'dateAdded',
}: UseItemDisplayDataOptions): UseItemDisplayDataReturn => {
  return useMemo(() => {
    const displayData = getItemDisplayData(item);
    const title = getItemTitle(item);
    const subtitle = getItemSubtitle(item);

    // Format price
    const formattedPrice = formatCurrency(displayData.price);

    // Format date if available
    const formattedDate = item?.[dateField]
      ? formatDate(item[dateField])
      : undefined;

    // Category information
    const categoryDisplayName = item?.itemCategory
      ? formatItemCategory(item.itemCategory)
      : item?.category
        ? formatItemCategory(item.category)
        : 'Unknown';

    const categoryColorClass = item?.itemCategory
      ? getItemCategoryColor(item.itemCategory)
      : item?.category
        ? getItemCategoryColor(item.category)
        : '';

    // Status information (if requested)
    const statusColorClass =
      includeStatus && item?.status ? getStatusColor(item.status) : undefined;

    // Type checks
    const isPsaCard = Boolean(
      item?.itemCategory === 'PsaGradedCard' ||
        item?.itemCategory === 'psaGradedCard' ||
        ('grade' in item && item.grade !== undefined) ||
        item?.type === 'psa'
    );

    const isRawCard = Boolean(
      item?.itemCategory === 'RawCard' ||
        item?.itemCategory === 'rawCard' ||
        ('condition' in item && !('grade' in item)) ||
        item?.type === 'raw'
    );

    const isSealedProduct = Boolean(
      item?.itemCategory === 'SealedProduct' ||
        item?.itemCategory === 'sealedProduct' ||
        'productId' in item ||
        item?.type === 'sealed'
    );

    // Utility to get formatted detail values
    const getDetailValue = (key: keyof ItemDisplayData): string => {
      const value = displayData[key];

      if (value === undefined || value === null) {
        return 'N/A';
      }

      // Special formatting for specific fields
      switch (key) {
        case 'price':
          return formatCurrency(value as number);
        case 'grade':
          return `Grade ${value}`;
        case 'cardNumber':
          return `#${value}`;
        default:
          return String(value);
      }
    };

    // Check if item has images
    const hasImages = Boolean(
      item?.images?.length > 0 ||
        item?.itemData?.images?.length > 0 ||
        displayData.itemImage
    );

    return {
      // Core display data
      ...displayData,

      // Formatted values
      formattedPrice,
      formattedDate,

      // Display helpers
      title,
      subtitle,
      categoryDisplayName,
      categoryColorClass,
      statusColorClass,

      // Utility functions
      getDetailValue,
      hasImages,
      isPsaCard,
      isRawCard,
      isSealedProduct,
    };
  }, [item, includeStatus, dateField]);
};

// Convenience hooks for specific contexts
export const useAuctionItemDisplayData = (item: any) =>
  useItemDisplayData({
    item,
    includeStatus: true,
    dateField: 'dateAdded',
  });

export const useCollectionItemDisplayData = (item: any) =>
  useItemDisplayData({
    item,
    includeStatus: false,
    dateField: 'dateAdded',
  });

// Hook for multiple items (e.g., item lists)
export const useMultipleItemDisplayData = (items: any[]) => {
  return useMemo(() => {
    return items.map((item) => useItemDisplayData({ item }));
  }, [items]);
};
