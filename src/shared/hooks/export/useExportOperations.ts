/**
 * Export Operations Hook - PHASE 2 REFACTORING
 * Extracted from useCollectionExport monster hook (672 lines)
 * 
 * SOLID Principles:
 * - SRP: Only handles export operations (create, update, delete decomposed)
 * - DIP: Depends on abstractions (API services)
 * - OCP: Extensible through export formats and types
 */

import { useCallback } from 'react';
import { unifiedApiService } from '../../services/UnifiedApiService';
import {
  ExportFormat,
  ExportItemType,
  ExportRequest,
  OrderedExportRequest,
} from '../../interfaces/api/IExportApiService';
import { CollectionItem } from '../../types/ordering';
import { useAsyncOperation } from '../useAsyncOperation';
import { useUnifiedNotifications } from '../common/useUnifiedNotifications';
import { useErrorHandler } from '../error/useErrorHandler';
import {
  formatExportErrorMessage,
  formatExportSuccessMessage,
  formatOrderedExportSuccessMessage,
  validateExportRequest,
} from '../../utils/helpers/exportUtils';

export interface UseExportOperationsReturn {
  /** Current export state */
  isExporting: boolean;
  /** Execute basic export request */
  exportItems: (request: ExportRequest) => Promise<void>;
  /** Execute ordered export request */
  exportOrderedItems: (
    request: OrderedExportRequest,
    items: CollectionItem[]
  ) => Promise<void>;
  /** Export all items with format */
  exportAllItems: (
    items: CollectionItem[],
    format?: ExportFormat
  ) => Promise<void>;
  /** Export selected items only */
  exportSelectedItems: (
    selectedIds: string[],
    format?: ExportFormat
  ) => Promise<void>;
  /** Legacy Facebook text export */
  exportFacebookText: (itemIds?: string[]) => Promise<void>;
  /** Legacy image export */
  exportImages: (itemType: ExportItemType, itemIds?: string[]) => Promise<void>;
}

/**
 * Focused export operations hook - single responsibility for export logic only
 * Replaces 200+ lines from useCollectionExport monster
 */
export const useExportOperations = (): UseExportOperationsReturn => {
  const { loading: isExporting, execute } = useAsyncOperation();
  const { notifyOperationSuccess, notifyOperationError } = useUnifiedNotifications();
  const { handleError } = useErrorHandler({ 
    defaultContext: 'ExportOperations',
    showToastsDefault: false // We handle toasts via notifications hook
  });

  const exportItems = useCallback(
    async (request: ExportRequest) => {
      // Validate request
      const validation = validateExportRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      await execute(
        async () => {
          const result = await unifiedApiService.exportItems(request);
          return result;
        },
        {
          successMessage: formatExportSuccessMessage(request),
          showSuccessToast: true,
          onError: (error) => {
            const errorMessage = formatExportErrorMessage(request, error);
            notifyOperationError('export', request.itemType, errorMessage);
          },
        }
      );
    },
    [execute, notifyOperationError]
  );

  const exportOrderedItems = useCallback(
    async (request: OrderedExportRequest, items: CollectionItem[]) => {
      await execute(
        async () => {
          const result = await unifiedApiService.exportOrderedItems(request, items);
          return result;
        },
        {
          successMessage: formatOrderedExportSuccessMessage(request),
          showSuccessToast: true,
          onError: (error) => {
            notifyOperationError('export', 'ordered items', error);
          },
        }
      );
    },
    [execute, notifyOperationError]
  );

  const exportAllItems = useCallback(
    async (items: CollectionItem[], format: ExportFormat = 'csv') => {
      if (!items?.length) {
        throw new Error('No items to export');
      }

      await exportItems({
        itemType: 'all',
        format,
        itemIds: undefined, // Export all
      });
    },
    [exportItems]
  );

  const exportSelectedItems = useCallback(
    async (selectedIds: string[], format: ExportFormat = 'csv') => {
      if (!selectedIds?.length) {
        throw new Error('No items selected for export');
      }

      await exportItems({
        itemType: 'all',
        format,
        itemIds: selectedIds,
      });
    },
    [exportItems]
  );

  // Legacy support methods
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

  return {
    isExporting,
    exportItems,
    exportOrderedItems,
    exportAllItems,
    exportSelectedItems,
    exportFacebookText,
    exportImages,
  };
};

export default useExportOperations;