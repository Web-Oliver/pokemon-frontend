/**
 * Collection Item Detail Page (Refactored)
 * 
 * Refactored from 937-line god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only orchestrates specialized components
 * - DRY: Leverages extracted hooks and components
 * - Maintainability: Clear separation of concerns
 * - Reusability: Components can be used independently
 */

import React from 'react';
import { Package } from 'lucide-react';
import { PokemonModal, PokemonConfirmModal } from '../../../shared/components/atoms/design-system/PokemonModal';
import { PokemonPageContainer } from '../../../shared/components/atoms/design-system/PokemonPageContainer';
import LoadingSpinner from '../../../shared/components/molecules/common/LoadingSpinner';
import { MarkSoldForm } from '../../../shared/components/forms/MarkSoldForm';
import { useModal } from '../../../shared/hooks/useModal';
import { useCollectionItemFromUrl } from '../../../shared/hooks/collection/useCollectionItem';
import { useItemOperations } from '../../../shared/hooks/collection/useItemOperations';
import { usePriceManagement } from '../../../shared/hooks/collection/usePriceManagement';
import { useImageDownload } from '../../../shared/hooks/collection/useImageDownload';
import { 
  CollectionItemHeader,
  ItemEssentialDetails,
  ItemImageGallery,
  ItemPriceHistory,
  ItemSaleDetails,
  PsaCardDetailSection,
  RawCardDetailSection,
  SealedProductDetailSection
} from '../components/collection';
import { getItemDisplayData } from '../../../shared/utils/helpers/itemDisplayHelpers';
import { navigationHelper } from '../../../shared/utils/helpers/navigation';

const CollectionItemDetail: React.FC = () => {
  // Extracted hooks for clean separation of concerns
  const { item, loading, error, refetchItem } = useCollectionItemFromUrl();
  const operations = useItemOperations(item);
  const priceManagement = usePriceManagement(item, (updatedItem) => {
    // Handle item updates from price management
    // The useCollectionItem hook will handle state updates
    refetchItem();
  });
  const imageDownload = useImageDownload(item, () => getItemTitle());
  
  // Modal for mark sold form
  const markSoldModal = useModal();

  // Handle mark sold success by refreshing item data
  const handleMarkSoldSuccess = () => {
    markSoldModal.closeModal();
    refetchItem(); // Refresh data after successful sale
  };

  // Helper functions for display (simplified)
  const getItemTitle = () => {
    if (!item) return 'Loading...';

    // For PSA and Raw cards
    if ('cardId' in item || 'cardName' in item) {
      return (item as any).cardId?.cardName || (item as any).cardName || 'Unknown Card';
    }

    // For sealed products
    if ('productId' in item && item.productId) {
      const sealedItem = item as any;
      return sealedItem.productId?.productName || 
             sealedItem.productId?.category?.replace(/-/g, ' ') || 
             'Unknown Product';
    }

    return 'Unknown Item';
  };

  const getItemSubtitle = () => {
    if (!item) return '';

    if ('grade' in item) return `PSA Grade ${item.grade}`;
    if ('condition' in item) return `Condition: ${item.condition}`;
    
    if ('productId' in item && item.productId) {
      const sealedItem = item as any;
      return sealedItem.productId?.category ? 
        `Category: ${sealedItem.productId.category.replace(/-/g, ' ')}` : '';
    }

    return '';
  };

  const getSetName = () => {
    if (!item) return '';

    // For cards
    if ('cardId' in item && (item as any).cardId?.setId?.setName) {
      return (item as any).cardId.setId.setName;
    }

    // For sealed products
    if ('productId' in item && item.productId) {
      const sealedItem = item as any;
      if (sealedItem.productId?.productName) {
        const setName = sealedItem.productId.productName
          .replace(/(Booster|Box|Pack|Elite Trainer Box|ETB).*$/i, '')
          .trim();
        return setName || 'Set Name Pending';
      }
    }

    return 'Unknown Set';
  };

  const renderItemSpecificInfo = () => {
    if (!item) return null;

    const itemDisplayData = getItemDisplayData(item);

    if ('grade' in item) {
      return <PsaCardDetailSection item={item as any} displayData={itemDisplayData} />;
    }

    if ('condition' in item) {
      return <RawCardDetailSection item={item as any} displayData={itemDisplayData} />;
    }

    if ('category' in item) {
      return <SealedProductDetailSection item={item as any} displayData={itemDisplayData} />;
    }

    return null;
  };



  // Loading state
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading item details..." />;
  }

  // Error state
  if (error && !item) {
    return (
      <PokemonPageContainer>
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-[var(--theme-status-error)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--theme-status-error)] mb-2">
            Item Not Found
          </h3>
          <p className="text-[var(--theme-text-muted)]">{error}</p>
        </div>
      </PokemonPageContainer>
    );
  }

  // No item state
  if (!item) {
    return null;
  }

  return (
    <PokemonPageContainer>
      {/* Header Component - Extracted from god class */}
      <CollectionItemHeader
        item={item}
        title={getItemTitle()}
        subtitle={getItemSubtitle()}
        setName={getSetName()}
        onEdit={operations.handleEdit}
        onMarkSold={() => markSoldModal.openModal()}
        onDelete={operations.handleDelete}
        onBackToCollection={operations.handleBackToCollection}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Essential Details - Extracted component */}
        <ItemEssentialDetails item={item} />
        
        {/* Image Gallery - Extracted component */}
        <ItemImageGallery
          item={item}
          title={getItemTitle()}
          setName={getSetName()}
          onDownloadImages={imageDownload.handleDownloadImages}
          downloadingZip={imageDownload.downloadingZip}
        />
        
        {/* Price History - Extracted component */}
        <ItemPriceHistory
          item={item}
          newPrice={priceManagement.newPrice}
          onPriceInputChange={priceManagement.handlePriceInputChange}
          onCustomPriceUpdate={priceManagement.handleCustomPriceUpdate}
          isValidPrice={priceManagement.isValidPrice}
          isPriceChanged={priceManagement.isPriceChanged}
        />
      </div>

      {/* Item-Specific Information - Reused existing components */}
      <div className="mb-8">
        {renderItemSpecificInfo()}
      </div>

      {/* Sale Details - Extracted component */}
      <ItemSaleDetails item={item} />

      {/* Mark as Sold Modal */}
      <PokemonModal
        isOpen={markSoldModal.isOpen}
        onClose={markSoldModal.closeModal}
        title={`Mark "${getItemTitle()}" as Sold`}
        maxWidth="2xl"
      >
        {item && (
          <MarkSoldForm
            itemId={item.id || (item as any)._id}
            itemType={(() => {
              const { type } = navigationHelper.getCollectionItemParams();
              return type as 'psa' | 'raw' | 'sealed';
            })()}
            onCancel={markSoldModal.closeModal}
            onSuccess={handleMarkSoldSuccess}
          />
        )}
      </PokemonModal>

      {/* Delete Confirmation Modal */}
      <PokemonConfirmModal
        isOpen={operations.deleteConfirmModal.isOpen}
        onClose={operations.deleteConfirmModal.closeModal}
        onConfirm={operations.confirmDeleteItem}
        title="Delete Collection Item"
        confirmMessage="Are you sure you want to delete this item? This action cannot be undone and will permanently remove the item from your collection."
        confirmText="Delete Item"
        variant="danger"
        loading={operations.deleteConfirmModal.isConfirming}
      />
    </PokemonPageContainer>
  );
};

export default CollectionItemDetail;
