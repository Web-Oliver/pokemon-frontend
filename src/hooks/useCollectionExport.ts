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

import { useState, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { exportApiService } from '../services/ExportApiService';
import {
  ExportRequest,
  ExportItemType,
  ExportFormat,
} from '../interfaces/api/IExportApiService';
import { showSuccessToast, showWarningToast, handleApiError } from '../utils/errorHandler';
import {
  formatExportSuccessMessage,
  formatExportErrorMessage,
  validateExportRequest,
} from '../utils/exportUtils';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

export interface UseCollectionExportReturn {
  // State
  isExporting: boolean;
  selectedItemsForExport: string[];

  // Unified export functions
  exportItems: (request: ExportRequest) => Promise<void>;
  exportAllItems: (items: CollectionItem[], format?: ExportFormat) => Promise<void>;
  exportSelectedItems: (selectedIds: string[], format?: ExportFormat) => Promise<void>;

  // Specialized export functions (legacy support)
  exportFacebookText: (itemIds?: string[]) => Promise<void>;
  exportImages: (itemType: ExportItemType, itemIds?: string[]) => Promise<void>;

  // Selection management
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (items: CollectionItem[]) => void;
  clearSelection: () => void;
}

export const useCollectionExport = (): UseCollectionExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedItemsForExport, setSelectedItemsForExport] = useState<string[]>([]);

  // Unified export function - consolidates all export operations
  const exportItems = useCallback(async (request: ExportRequest) => {
    if (request.itemIds && request.itemIds.length === 0) {
      showWarningToast('No items selected for export');
      return;
    }

    setIsExporting(true);
    try {
      // Validate request using consolidated utilities
      validateExportRequest(request.itemType, request.format, request.itemIds);

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
  }, []);

  // Export all items in collection with specified format
  const exportAllItems = useCallback(
    async (items: CollectionItem[], format: ExportFormat = 'facebook-text') => {
      if (items.length === 0) {
        showWarningToast('No items in collection to export');
        return;
      }

      const itemIds = items.map(item => item.id);
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
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemsForExport(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  // Select all items
  const selectAllItems = useCallback((items: CollectionItem[]) => {
    const allIds = items.map(item => item.id);
    setSelectedItemsForExport(allIds);
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItemsForExport([]);
  }, []);

  return {
    // State
    isExporting,
    selectedItemsForExport,

    // Unified export functions
    exportItems,
    exportAllItems,
    exportSelectedItems,

    // Specialized export functions (legacy support)
    exportFacebookText,
    exportImages,

    // Selection management
    toggleItemSelection,
    selectAllItems,
    clearSelection,
  };
};
