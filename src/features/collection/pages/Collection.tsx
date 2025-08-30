/**
 * Collection Page Component - Unified Design System
 *
 * Modern collection management page with unified theme system integration.
 * Main collection management page orchestrating reusable components.
 * Refactored following CLAUDE.md unified design principles:
 * - Single Responsibility: Only orchestrates components and manages page state
 * - Open/Closed: Uses extensible component architecture with unified components
 * - DRY: Leverages unified design system components to eliminate duplication
 * - Layer 4: Application Screen - orchestrates unified Layer 3 components and Layer 2 hooks
 */

import { Download, FileText, Plus } from 'lucide-react';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@/shared/hooks';
import { PageLayout } from '@/shared/components/layout/layouts/PageLayout';
import { CollectionItem } from '@/shared/components/molecules/collection/CollectionItemCard';
import CollectionStats from '@/shared/components/organisms/collection/CollectionStats';
import CollectionTabs, {
  TabType,
} from '@/shared/components/organisms/collection/CollectionTabs';
import { useExportOperations } from '@/shared/hooks/export/useExportOperations';
import { useItemSelection } from '@/shared/hooks/export/useItemSelection';
import { useCollectionOperations } from '@/shared/hooks';
import { navigationHelper } from '@/shared/utils/navigation';
import { storageWrappers } from '@/shared/utils/storage';
import { handleError, createError } from '@/shared/utils/helpers/errorHandler';

// Import unified design system
import {
  PokemonButton,
  PokemonModal,
  PokemonPageContainer,
  PokemonCard,
} from '@/shared/components/atoms/design-system';
// Lazy load modal/form components for better performance
const MarkSoldForm = React.lazy(() =>
  import('../../../shared/components/forms/MarkSoldForm').then((m) => ({
    default: m.MarkSoldForm,
  }))
);
const CollectionExportModal = React.lazy(
  () => import('../../../shared/components/organisms/collection/CollectionExportModal')
);

const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('psa-graded');

  // Replace repetitive modal useState patterns with useToggle
  const markSoldModal = useToggle(false);
  const exportModal = useToggle(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'psa' | 'raw' | 'sealed';
    name: string;
  } | null>(null);

  const {
    psaCards,
    rawCards,
    sealedProducts,
    soldItems,
    loading,
    error,
    refreshCollection,
  } = useCollectionOperations();

  // Use decomposed export hooks following SOLID principles
  const { isExporting, exportAllItems, exportSelectedItems } = useExportOperations();
  const { 
    selectedItems: selectedItemsForExport,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
  } = useItemSelection();

  // Additional check for refresh flag when component mounts
  useEffect(() => {
    const needsRefresh = storageWrappers.session.getItem(
      'collectionNeedsRefresh'
    );
    if (needsRefresh === 'true') {
      storageWrappers.session.removeItem('collectionNeedsRefresh');
      // Production: Debug statement removed for security
      refreshCollection();
    }
  }, [refreshCollection]);

  // Get all collection items for export functionality
  const getAllCollectionItems = useCallback((): CollectionItem[] => {
    return [...psaCards, ...rawCards, ...sealedProducts];
  }, [psaCards, rawCards, sealedProducts]);

  // Handle navigation to add new item
  const handleAddNewItem = useCallback(() => {
    navigationHelper.navigateToCreate.item();
  }, []);

  // Handle navigation to item detail page
  const handleViewItemDetail = useCallback(
    (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => {
      // Extract ID from either id or _id field (MongoDB uses _id)
      const itemId = item.id || (item as any)._id;
      if (!itemId) {
        handleError(
          createError.validation('No ID found for collection item', {
            component: 'Collection',
            action: 'handleViewItemDetail'
          }, { item })
        );
        return;
      }
      navigationHelper.navigateToItemDetail(type, itemId);
    },
    []
  );

  // Handle mark as sold button click
  const handleMarkAsSold = useCallback(
    (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => {
      // Extract ID from either id or _id field (MongoDB uses _id)
      const itemId = item.id || (item as any)._id;
      if (!itemId) {
        handleError(
          createError.validation('No ID found for collection item', {
            component: 'Collection',
            action: 'handleViewItemDetail'
          }, { item })
        );
        return;
      }
      setSelectedItem({
        id: itemId,
        type,
        name:
          // UPDATED: Handle new field structures (cardNumber, setProductName, productName)
          (item as any).cardId?.cardName ||
          (item as any).cardName ||
          (item as any).productId?.productName || // NEW: Product hierarchy
          (item as any).productName || // NEW: Direct product name
          (item as any).name ||
          'Unknown Item',
      });
      markSoldModal.setTrue();
    },
    []
  );

  // Handle successful mark as sold operation
  const handleMarkSoldSuccess = useCallback(() => {
    // Close modal and reset selected item
    markSoldModal.setFalse();
    setSelectedItem(null);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    markSoldModal.setFalse();
    setSelectedItem(null);
  }, []);

  // Export functionality handlers
  const handleExportAllItems = useCallback(async () => {
    const allItems = getAllCollectionItems();
    await exportAllItems(allItems);
  }, [exportAllItems, getAllCollectionItems]);

  const handleExportSelectedItems = useCallback(async () => {
    await exportSelectedItems(selectedItemsForExport);
    exportModal.setFalse();
  }, [exportSelectedItems, selectedItemsForExport]);

  const handleOpenExportModal = useCallback(() => {
    const allItems = getAllCollectionItems();
    if (allItems.length === 0) {
      return; // useCollectionExport hook will handle the warning
    }
    exportModal.setTrue();
  }, [getAllCollectionItems]);

  const handleSelectAllItems = useCallback(() => {
    const allItems = getAllCollectionItems();
    selectAllItems(allItems);
  }, [selectAllItems, getAllCollectionItems]);

  const headerActions = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-3">
        <PokemonButton
          variant="secondary"
          size="default"
          onClick={handleExportAllItems}
          disabled={isExporting || loading}
        >
          <FileText className="w-5 h-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export All'}
        </PokemonButton>
        <PokemonButton
          variant="secondary"
          size="default"
          onClick={handleOpenExportModal}
          disabled={isExporting || loading}
        >
          <Download className="w-5 h-5 mr-2" />
          Export Selected
        </PokemonButton>
        <PokemonButton
          variant="primary"
          size="default"
          onClick={handleAddNewItem}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </PokemonButton>
      </div>
    ),
    [
      handleExportAllItems,
      handleOpenExportModal,
      handleAddNewItem,
      isExporting,
      loading,
    ]
  );

  return (
    <PageLayout>
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <PokemonCard
            variant="glass"
            size="xl"
            className="text-white relative overflow-hidden"
          >
            <div className="relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    My Premium Collection
                  </h1>
                  <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                    Manage your Pokémon cards and sealed products with award-winning style
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {headerActions}
                </div>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-400 text-sm font-medium bg-red-900/50 px-3 py-1 rounded-xl border border-red-500/30">
                      Error
                    </div>
                    <span className="text-red-300 font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </PokemonCard>

          {/* Collection Statistics */}
          <CollectionStats
            psaGradedCount={psaCards.length}
            rawCardsCount={rawCards.length}
            sealedProductsCount={sealedProducts.length}
            soldItemsCount={soldItems.length}
            loading={loading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Collection Tabs */}
          <CollectionTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            psaCards={psaCards}
            rawCards={rawCards}
            sealedProducts={sealedProducts}
            soldItems={soldItems}
            loading={loading}
            error={error}
            onAddNewItem={handleAddNewItem}
            onViewItemDetail={handleViewItemDetail}
            onMarkAsSold={handleMarkAsSold}
          />

          {/* Export Selection Modal */}
          <Suspense fallback={<div>Loading export modal...</div>}>
            <CollectionExportModal
              isOpen={exportModal.value}
              onClose={exportModal.setFalse}
              items={getAllCollectionItems()}
              selectedItemIds={selectedItemsForExport}
              isExporting={isExporting}
              onToggleItemSelection={toggleItemSelection}
              onSelectAllItems={handleSelectAllItems}
              onClearSelection={clearSelection}
              onExportSelected={handleExportSelectedItems}
            />
          </Suspense>

          {/* Mark as Sold Modal using PokemonModal */}
          <PokemonModal
            isOpen={markSoldModal.value}
            onClose={handleModalClose}
            title={`Mark "${selectedItem?.name}" as Sold`}
            size="lg"
          >
            {selectedItem && (
              <Suspense fallback={<div>Loading form...</div>}>
                <MarkSoldForm
                  itemId={selectedItem.id}
                  itemType={selectedItem.type}
                  onCancel={handleModalClose}
                  onSuccess={handleMarkSoldSuccess}
                />
              </Suspense>
            )}
          </PokemonModal>
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default Collection;
