/**
 * Collection Export Hook
 * 
 * Business logic for collection export functionality
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles export-related logic
 * - Dependency Inversion: Depends on abstractions (API layer)
 * - DRY: Reusable export logic across components
 * - Layer 2: Business Logic & Data Orchestration
 */

import { useState, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { getCollectionFacebookTextFile, downloadBlob } from '../api/exportApi';
import { showSuccessToast, showWarningToast, handleApiError } from '../utils/errorHandler';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

export interface UseCollectionExportReturn {
  // State
  isExporting: boolean;
  selectedItemsForExport: string[];
  
  // Export functions
  exportAllItems: (items: CollectionItem[]) => Promise<void>;
  exportSelectedItems: (selectedIds: string[]) => Promise<void>;
  
  // Selection management
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (items: CollectionItem[]) => void;
  clearSelection: () => void;
}

export const useCollectionExport = (): UseCollectionExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedItemsForExport, setSelectedItemsForExport] = useState<string[]>([]);

  // Export all items in collection
  const exportAllItems = useCallback(async (items: CollectionItem[]) => {
    if (items.length === 0) {
      showWarningToast('No items in collection to export');
      return;
    }

    setIsExporting(true);
    try {
      const itemIds = items.map(item => item.id);
      const blob = await getCollectionFacebookTextFile(itemIds);
      const filename = `collection-facebook-export-${new Date().toISOString().split('T')[0]}.txt`;
      downloadBlob(blob, filename);
      showSuccessToast(`Successfully exported ${itemIds.length} items to Facebook text file!`);
    } catch (error) {
      handleApiError(error, 'Failed to export collection to Facebook text file');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Export selected items
  const exportSelectedItems = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      showWarningToast('Please select items to export');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await getCollectionFacebookTextFile(selectedIds);
      const filename = `collection-selected-export-${new Date().toISOString().split('T')[0]}.txt`;
      downloadBlob(blob, filename);
      showSuccessToast(`Successfully exported ${selectedIds.length} selected items!`);
      
      // Clear selection after successful export
      setSelectedItemsForExport([]);
    } catch (error) {
      handleApiError(error, 'Failed to export selected items');
    } finally {
      setIsExporting(false);
    }
  }, []);

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
    
    // Export functions
    exportAllItems,
    exportSelectedItems,
    
    // Selection management
    toggleItemSelection,
    selectAllItems,
    clearSelection,
  };
};