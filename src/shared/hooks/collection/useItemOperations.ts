/**
 * Collection Item Operations Hook
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles CRUD operations and navigation
 * - DRY: Eliminates duplicated operation logic across components
 * - Reusability: Can be used by other components needing item operations
 */

import { useCallback } from 'react';
import { CollectionItem, ItemType } from './useCollectionItem';
import { unifiedApiService } from '../../services/UnifiedApiService';
import { showSuccessToast } from '@/components/organisms/ui/toastNotifications';
import { navigationHelper } from '../../utils/navigation';
// import { useConfirmModal } from '../useModal'; // Removed - file no longer exists

export interface UseItemOperationsReturn {
  handleEdit: () => void;
  handleDelete: () => void;
  confirmDeleteItem: () => Promise<void>;
  handleMarkSold: () => void;
  handleBackToCollection: () => void;
  // deleteConfirmModal: ReturnType<typeof useConfirmModal>; // Replaced with simple confirm
}

/**
 * Custom hook for managing item CRUD operations
 * Handles edit, delete, mark sold, and navigation operations
 */
export const useItemOperations = (
  item: CollectionItem | null,
  type?: string,
  id?: string
): UseItemOperationsReturn => {
  // const deleteConfirmModal = useConfirmModal(); // Replaced with simple confirm

  // Get URL params if not provided
  const getUrlParams = useCallback(() => {
    if (type && id) {
      return { type, id };
    }
    return navigationHelper.getCollectionItemParams();
  }, [type, id]);

  // Navigate to edit form
  const handleEdit = useCallback(() => {
    const { type: itemType, id: itemId } = getUrlParams();

    if (!item || !itemType || !itemId) {
      return;
    }

    navigationHelper.navigateToEdit.item(itemType as ItemType, itemId);
  }, [item, getUrlParams]);

  // Open delete confirmation
  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      confirmDeleteItem();
    }
  }, []);

  // Confirm and execute delete operation
  const confirmDeleteItem = useCallback(async () => {
    const { type: itemType, id: itemId } = getUrlParams();

    if (!item || !itemType || !itemId) {
      return;
    }

    try {
      switch (itemType) {
        case 'psa':
          await unifiedApiService.collection.deletePsaCard(itemId);
          break;
        case 'raw':
          await unifiedApiService.collection.deleteRawCard(itemId);
          break;
        case 'sealed':
          await unifiedApiService.collection.deleteSealedProduct(itemId);
          break;
        default:
          throw new Error(`Unknown item type: ${itemType}`);
      }

      showSuccessToast('Item deleted successfully');
      navigationHelper.navigateToCollection();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [item, getUrlParams]);

  // Open mark sold modal (modal management handled by parent)
  const handleMarkSold = useCallback(() => {
    if (!item || item.sold) {
      return;
    }
    // Modal opening is handled by parent component using useModal hook
    // This is just a validation function
  }, [item]);

  // Navigate back to collection
  const handleBackToCollection = useCallback(() => {
    navigationHelper.navigateToCollection();
  }, []);

  return {
    handleEdit,
    handleDelete,
    confirmDeleteItem,
    handleMarkSold,
    handleBackToCollection,
    // deleteConfirmModal, // Replaced with simple confirm
  };
};
