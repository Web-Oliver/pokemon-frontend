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
import { getCollectionApiService } from '../../services/ServiceRegistry';
import { handleApiError } from '../../../shared/utils/helpers/errorHandler';
import { showSuccessToast } from '../../components/organisms/ui/toastNotifications';
import { navigationHelper } from "../../../shared/utils/navigation";
import { useConfirmModal } from '../useModal';

export interface UseItemOperationsReturn {
  handleEdit: () => void;
  handleDelete: () => void;
  confirmDeleteItem: () => Promise<void>;
  handleMarkSold: () => void;
  handleBackToCollection: () => void;
  deleteConfirmModal: ReturnType<typeof useConfirmModal>;
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
  const deleteConfirmModal = useConfirmModal();

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

  // Open delete confirmation modal
  const handleDelete = useCallback(() => {
    deleteConfirmModal.openModal();
  }, [deleteConfirmModal]);

  // Confirm and execute delete operation
  const confirmDeleteItem = useCallback(async () => {
    const { type: itemType, id: itemId } = getUrlParams();

    if (!item || !itemType || !itemId) {
      return;
    }

    await deleteConfirmModal.confirmAction(async () => {
      const collectionApi = getCollectionApiService();

      switch (itemType) {
        case 'psa':
          await collectionApi.deletePsaCard(itemId);
          break;
        case 'raw':
          await collectionApi.deleteRawCard(itemId);
          break;
        case 'sealed':
          await collectionApi.deleteSealedProduct(itemId);
          break;
        default:
          throw new Error(`Unknown item type: ${itemType}`);
      }

      showSuccessToast('Item deleted successfully');
      navigationHelper.navigateToCollection();
    });
  }, [item, getUrlParams, deleteConfirmModal]);

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
    deleteConfirmModal,
  };
};
