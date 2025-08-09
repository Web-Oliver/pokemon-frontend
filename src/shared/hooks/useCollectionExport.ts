/**
 * Unified Collection Export Hook
 *
 * Consolidated business logic for all export functionality
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles export-related logic
 * - Dependency Inversion: Depends on abstractions (API layer)
 * - DRY: Unified export logic eliminating duplication
 * - Layer 2: Business Logic & Data Orchestration
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { exportApiService } from '../services/ExportApiService';
import {
  ExportFormat,
  ExportItemType,
  ExportRequest,
  OrderedExportRequest,
} from '../interfaces/api/IExportApiService';
import {
  CollectionItem,
  ItemCategory,
  ItemOrderingState,
  SortMethod,
} from '../types/ordering';
import {
  ExportSessionData,
  orderingPersistence,
  storageHelpers,
} from '../utils/storage';
import { handleApiError, createError } from '../utils/helpers/errorHandler';
import {
  showSuccessToast,
  showWarningToast,
} from '../components/organisms/ui/toastNotifications';
import {
  formatExportErrorMessage,
  formatExportSuccessMessage,
  formatOrderedExportSuccessMessage,
  prepareItemsForOrderedExport,
  validateExportRequest,
} from '../utils/helpers/exportUtils';
import {
  applyItemOrder,
  generateOrderFromItems,
  getItemCategory,
  moveItemDown,
  moveItemUp,
  resetToDefaultOrder,
  sortItemsByPrice,
} from '../utils/helpers/orderingUtils';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

export interface UseCollectionExportReturn {
  // State
  isExporting: boolean;
  selectedItemsForExport: string[];

  // Ordering state
  itemOrder: string[];
  orderingState: ItemOrderingState;

  // Unified export functions
  exportItems: (request: ExportRequest) => Promise<void>;
  exportOrderedItems: (
    request: OrderedExportRequest,
    items: CollectionItem[]
  ) => Promise<void>;
  exportAllItems: (
    items: CollectionItem[],
    format?: ExportFormat
  ) => Promise<void>;
  exportSelectedItems: (
    selectedIds: string[],
    format?: ExportFormat
  ) => Promise<void>;

  // Specialized export functions (legacy support)
  exportFacebookText: (itemIds?: string[]) => Promise<void>;
  exportImages: (itemType: ExportItemType, itemIds?: string[]) => Promise<void>;

  // Selection management
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (items: CollectionItem[]) => void;
  clearSelection: () => void;

  // Ordering functions
  reorderItems: (newOrder: string[]) => void;
  moveItemUp: (itemId: string) => void;
  moveItemDown: (itemId: string) => void;
  autoSortByPrice: (items: CollectionItem[], ascending?: boolean) => void;
  sortCategoryByPrice: (
    items: CollectionItem[],
    category: ItemCategory,
    ascending?: boolean
  ) => void;
  resetOrder: (items: CollectionItem[]) => void;
  getOrderedItems: (items: CollectionItem[]) => CollectionItem[];
}

export const useCollectionExport = (): UseCollectionExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedItemsForExport, setSelectedItemsForExport] = useState<
    string[]
  >([]);

  // Ordering state with persistence
  const [itemOrder, setItemOrder] = useState<string[]>([]);
  const [orderingState, setOrderingState] = useState<ItemOrderingState>({
    globalOrder: [],
    categoryOrders: {
      PSA_CARD: [],
      RAW_CARD: [],
      SEALED_PRODUCT: [],
    },
    lastSortMethod: null,
    lastSortTimestamp: new Date(),
  });

  // Persistence refs
  const hasPersistenceLoaded = useRef(false);
  const lastSaveTime = useRef<number>(0);

  // Load persisted state on mount
  useEffect(() => {
    if (!hasPersistenceLoaded.current) {
      hasPersistenceLoaded.current = true;

      // Clean up expired sessions
      orderingPersistence.cleanupExpiredSessions();

      // Migrate old format if needed
      storageHelpers.migrateOldFormat();

      // Load persisted ordering state
      const savedOrderingState = storageHelpers.loadOrdering();
      if (savedOrderingState) {
        setOrderingState(savedOrderingState);
        setItemOrder(savedOrderingState.globalOrder);

        if (import.meta.env.MODE === 'development') {
          console.log('Loaded persisted ordering state:', savedOrderingState);
        }
      }

      // Load session data
      const sessionData = orderingPersistence.getSessionData();
      if (sessionData && !orderingPersistence.isSessionExpired()) {
        setSelectedItemsForExport(sessionData.selectedItemIds);

        // Only restore order if we haven't loaded from ordering state
        if (!savedOrderingState && sessionData.itemOrder.length > 0) {
          setItemOrder(sessionData.itemOrder);
        }

        if (import.meta.env.MODE === 'development') {
          console.log('Restored session data:', sessionData);
        }
      }

      // Start auto-save
      orderingPersistence.startAutoSave(() => {
        try {
          const currentTime = Date.now();
          // Only save if enough time has passed to avoid excessive saves
          if (currentTime - lastSaveTime.current > 1000) {
            lastSaveTime.current = currentTime;
            return orderingState;
          }
          return null;
        } catch (error) {
          console.error('Auto-save callback error:', error);
          return null;
        }
      });
    }

    // Cleanup on unmount
    return () => {
      orderingPersistence.stopAutoSave();
    };
  }, [orderingState]); // Include orderingState to ensure auto-save callback has latest state

  // Save state changes to persistence
  const saveStateToPersistence = useCallback(
    (
      newOrderingState?: ItemOrderingState,
      newSelectedItems?: string[],
      newItemOrder?: string[]
    ) => {
      try {
        // Save ordering state
        if (newOrderingState) {
          const success = storageHelpers.saveOrdering(newOrderingState);
          if (!success) {
            if (import.meta.env.MODE === 'development') {
              console.warn('Failed to save ordering state to persistence');
            }
          }
        }

        // Save session data
        const sessionUpdate: Partial<ExportSessionData> = {};
        if (newSelectedItems !== undefined) {
          sessionUpdate.selectedItemIds = newSelectedItems;
        }
        if (newItemOrder !== undefined) {
          sessionUpdate.itemOrder = newItemOrder;
        }
        if (newOrderingState?.lastSortMethod !== undefined) {
          sessionUpdate.lastSortMethod = newOrderingState.lastSortMethod;
        }

        if (Object.keys(sessionUpdate).length > 0) {
          const success = orderingPersistence.saveSessionData(sessionUpdate);
          if (!success) {
            if (import.meta.env.MODE === 'development') {
              console.warn('Failed to save session data to persistence');
            }
          }
        }
      } catch (error) {
        console.error('Error saving state to persistence:', error);
        // Don't throw the error to avoid breaking the UI
      }
    },
    []
  );

  // Unified export function - consolidates all export operations
  const exportItems = useCallback(
    async (request: ExportRequest) => {
      if (request.itemIds && request.itemIds.length === 0) {
        showWarningToast('No items selected for export');
        return;
      }

      setIsExporting(true);
      try {
        // Validate request using consolidated utilities
        validateExportRequest(
          request.itemType,
          request.format,
          request.itemIds
        );

        const result = await exportApiService.export(request);
        exportApiService.downloadBlob(result.blob, result.filename);

        // Use consolidated success message formatting
        const successMessage = formatExportSuccessMessage(
          result.itemCount,
          request.format,
          request.itemType
        );
        showSuccessToast(successMessage);

        // Clear selection after successful export
        if (request.itemIds && request.itemIds.length > 0) {
          setSelectedItemsForExport([]);
          saveStateToPersistence(undefined, []);
        }

        // Clear ordering state if preferences indicate
        try {
          const cleared = orderingPersistence.clearAfterExport();
          if (cleared) {
            console.log('Ordering state cleared after successful export');
          }
        } catch (error) {
          console.error('Failed to clear ordering state after export:', error);
        }
      } catch (error) {
        // Use consolidated error message formatting
        const errorMessage = formatExportErrorMessage(
          request.format,
          request.itemType,
          error instanceof Error ? error.message : undefined
        );
        handleApiError(error, errorMessage);
      } finally {
        setIsExporting(false);
      }
    },
    [saveStateToPersistence]
  );

  // Standard export function with ordering support
  const exportOrderedItems = useCallback(
    async (request: OrderedExportRequest, items: CollectionItem[]) => {
      if (request.itemIds && request.itemIds.length === 0) {
        showWarningToast('No items selected for export');
        return;
      }

      setIsExporting(true);
      try {
        // Prepare items with ordering
        const { orderedItems, validation } = prepareItemsForOrderedExport(
          items,
          request
        );

        if (!validation.exportValid) {
          throw createError.validation(
            validation.exportError || 'Export validation failed',
            { component: 'useCollectionExport', action: 'exportOrderedItems' },
            { validation, request }
          );
        }

        // Update the request with the final item order
        const finalRequest: OrderedExportRequest = {
          ...request,
          itemIds: orderedItems.map((item) => item.id),
        };

        const result = await exportApiService.export(finalRequest);
        exportApiService.downloadBlob(result.blob, result.filename);

        // Use enhanced success message for ordered exports
        const successMessage = formatOrderedExportSuccessMessage(
          result.itemCount,
          request.format,
          request,
          request.itemType
        );
        showSuccessToast(successMessage);

        // Clear selection after successful export
        if (request.itemIds && request.itemIds.length > 0) {
          setSelectedItemsForExport([]);
          saveStateToPersistence(undefined, []);
        }

        // Clear ordering state if preferences indicate
        try {
          const cleared = orderingPersistence.clearAfterExport();
          if (cleared) {
            console.log('Ordering state cleared after successful export');
          }
        } catch (error) {
          console.error('Failed to clear ordering state after export:', error);
        }
      } catch (error) {
        // Use consolidated error message formatting
        const errorMessage = formatExportErrorMessage(
          request.format,
          request.itemType,
          error instanceof Error ? error.message : undefined
        );
        handleApiError(error, errorMessage);
      } finally {
        setIsExporting(false);
      }
    },
    [saveStateToPersistence]
  );

  // Export all items in collection with specified format
  const exportAllItems = useCallback(
    async (items: CollectionItem[], format: ExportFormat = 'facebook-text') => {
      const safeItems = items || [];
      if (safeItems.length === 0) {
        showWarningToast('No items in collection to export');
        return;
      }

      const itemIds = safeItems.map((item) => item.id);
      await exportItems({
        itemType: 'psa-card', // Default, but format determines actual behavior
        format,
        itemIds,
      });
    },
    [exportItems]
  );

  // Export selected items with specified format
  const exportSelectedItems = useCallback(
    async (selectedIds: string[], format: ExportFormat = 'facebook-text') => {
      if (selectedIds.length === 0) {
        showWarningToast('Please select items to export');
        return;
      }

      await exportItems({
        itemType: 'psa-card', // Default, but format determines actual behavior
        format,
        itemIds: selectedIds,
      });
    },
    [exportItems]
  );

  // Specialized export for Facebook text (legacy support)
  const exportFacebookText = useCallback(
    async (itemIds?: string[]) => {
      await exportItems({
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds,
      });
    },
    [exportItems]
  );

  // Specialized export for images (legacy support)
  const exportImages = useCallback(
    async (itemType: ExportItemType, itemIds?: string[]) => {
      await exportItems({
        itemType,
        format: 'zip',
        itemIds,
      });
    },
    [exportItems]
  );

  // Toggle individual item selection
  const toggleItemSelection = useCallback(
    (itemId: string) => {
      setSelectedItemsForExport((prev) => {
        const newSelection = prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];

        // Save to persistence
        saveStateToPersistence(undefined, newSelection);

        return newSelection;
      });
    },
    [saveStateToPersistence]
  );

  // Select all items
  const selectAllItems = useCallback(
    (items: CollectionItem[]) => {
      const safeItems = items || [];
      const allIds = safeItems.map((item) => item.id);
      setSelectedItemsForExport(allIds);

      // Save to persistence
      saveStateToPersistence(undefined, allIds);
    },
    [saveStateToPersistence]
  );

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItemsForExport([]);

    // Save to persistence
    saveStateToPersistence(undefined, []);
  }, [saveStateToPersistence]);

  // ========================================
  // ORDERING FUNCTIONS
  // ========================================

  // Update item order state and sync with ordering state
  const updateOrderingState = useCallback(
    (newOrder: string[], sortMethod: SortMethod, items?: CollectionItem[]) => {
      setItemOrder(newOrder);

      // Update category orders if items are provided
      const categoryOrders = orderingState.categoryOrders;
      if (items && Array.isArray(items)) {
        const safeItems = items || [];
        const grouped = safeItems.reduce(
          (acc, item) => {
            const category = getItemCategory(item);
            if (!acc[category]) {
              acc[category] = [];
            }
            if (newOrder.includes(item.id)) {
              acc[category].push(item.id);
            }
            return acc;
          },
          {} as Record<ItemCategory, string[]>
        );

        categoryOrders.PSA_CARD = grouped.PSA_CARD || [];
        categoryOrders.RAW_CARD = grouped.RAW_CARD || [];
        categoryOrders.SEALED_PRODUCT = grouped.SEALED_PRODUCT || [];
      }

      const newOrderingState = {
        globalOrder: newOrder,
        categoryOrders,
        lastSortMethod: sortMethod,
        lastSortTimestamp: new Date(),
      };

      setOrderingState(newOrderingState);

      // Save to persistence
      saveStateToPersistence(newOrderingState, undefined, newOrder);
    },
    [orderingState.categoryOrders, saveStateToPersistence]
  );

  // Reorder items with custom order
  const reorderItems = useCallback(
    (newOrder: string[]) => {
      updateOrderingState(newOrder, 'manual');
    },
    [updateOrderingState]
  );

  // Move item up in order
  const moveItemUpInOrder = useCallback(
    (itemId: string) => {
      const newOrder = moveItemUp(itemOrder, itemId);
      if (newOrder !== itemOrder) {
        updateOrderingState(newOrder, 'manual');
      }
    },
    [itemOrder, updateOrderingState]
  );

  // Move item down in order
  const moveItemDownInOrder = useCallback(
    (itemId: string) => {
      const newOrder = moveItemDown(itemOrder, itemId);
      if (newOrder !== itemOrder) {
        updateOrderingState(newOrder, 'manual');
      }
    },
    [itemOrder, updateOrderingState]
  );

  // Auto-sort all items by price
  const autoSortByPrice = useCallback(
    (items: CollectionItem[], ascending: boolean = false) => {
      const safeItems = items || [];
      const sortedItems = sortItemsByPrice(safeItems, ascending);
      const newOrder = generateOrderFromItems(sortedItems);
      updateOrderingState(
        newOrder,
        ascending ? 'price_asc' : 'price_desc',
        safeItems
      );
    },
    [updateOrderingState]
  );

  // Sort specific category by price
  const sortCategoryByPrice = useCallback(
    (
      items: CollectionItem[],
      category: ItemCategory,
      ascending: boolean = false
    ) => {
      const safeItems = items || [];
      // Filter items by category
      const categoryItems = safeItems.filter(
        (item) => getItemCategory(item) === category
      );
      safeItems.filter((item) => getItemCategory(item) !== category);

      // Sort category items by price
      const sortedCategoryItems = sortItemsByPrice(categoryItems, ascending);

      // Rebuild the order maintaining other items' positions
      const currentOrder =
        itemOrder.length > 0 ? itemOrder : safeItems.map((item) => item.id);
      const newOrder: string[] = [];

      currentOrder.forEach((itemId) => {
        const item = safeItems.find((i) => i.id === itemId);
        if (!item) {
          return;
        }

        if (getItemCategory(item) === category) {
          // Skip - we'll add sorted category items later
          return;
        } else {
          newOrder.push(itemId);
        }
      });

      // Insert sorted category items at appropriate positions
      // For simplicity, add them in sorted order maintaining category grouping
      const sortedCategoryIds = sortedCategoryItems.map((item) => item.id);

      // Find where to insert the sorted category items
      const existingCategoryIndex = newOrder.findIndex((id) => {
        const item = safeItems.find((i) => i.id === id);
        return item && getItemCategory(item) === category;
      });

      if (existingCategoryIndex >= 0) {
        // Replace existing category items with sorted ones
        newOrder.splice(existingCategoryIndex, 0, ...sortedCategoryIds);
      } else {
        // Add at the end if no existing items found
        newOrder.push(...sortedCategoryIds);
      }

      updateOrderingState(
        newOrder,
        ascending ? 'price_asc' : 'price_desc',
        safeItems
      );
    },
    [itemOrder, updateOrderingState]
  );

  // Reset order to default (original item order)
  const resetOrder = useCallback(
    (items: CollectionItem[]) => {
      const safeItems = items || [];
      const defaultOrder = resetToDefaultOrder(safeItems);
      updateOrderingState(defaultOrder, null, safeItems);
    },
    [updateOrderingState]
  );

  // Get items in current order
  const getOrderedItems = useCallback(
    (items: CollectionItem[]): CollectionItem[] => {
      const safeItems = items || [];
      if (itemOrder.length === 0) {
        return safeItems;
      }
      return applyItemOrder(safeItems, itemOrder);
    },
    [itemOrder]
  );

  return {
    // State
    isExporting,
    selectedItemsForExport,

    // Ordering state
    itemOrder,
    orderingState,

    // Unified export functions
    exportItems,
    exportOrderedItems,
    exportAllItems,
    exportSelectedItems,

    // Specialized export functions (legacy support)
    exportFacebookText,
    exportImages,

    // Selection management
    toggleItemSelection,
    selectAllItems,
    clearSelection,

    // Ordering functions
    reorderItems,
    moveItemUp: moveItemUpInOrder,
    moveItemDown: moveItemDownInOrder,
    autoSortByPrice,
    sortCategoryByPrice,
    resetOrder,
    getOrderedItems,
  };
};
