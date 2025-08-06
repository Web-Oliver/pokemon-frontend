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
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
// Lazy load modal/form components for better performance
const MarkSoldForm = React.lazy(() => import('../../../shared/components/forms/MarkSoldForm').then(m => ({ default: m.MarkSoldForm })));
const CollectionExportModal = React.lazy(() => import('../../../components/lists/CollectionExportModal'));
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { CollectionItem } from '../../../components/lists/CollectionItemCard';
import CollectionStats from '../../../components/lists/CollectionStats';
import CollectionTabs, { TabType } from '../../../components/lists/CollectionTabs';
import { useCollectionExport } from '../../../shared/hooks/useCollectionExport';
import { useCollectionOperations } from '../../../shared/hooks/useCollectionOperations';
import { navigationHelper } from '../../../shared/utils/helpers/navigation';

// Import unified design system
import { PokemonButton, PokemonModal } from '../../../shared/components/atoms/design-system';

const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('psa-graded');
  const [isMarkSoldModalOpen, setIsMarkSoldModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

  const {
    isExporting,
    selectedItemsForExport,
    exportAllItems,
    exportSelectedItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
  } = useCollectionExport();

  // Additional check for refresh flag when component mounts
  useEffect(() => {
    const needsRefresh = sessionStorage.getItem('collectionNeedsRefresh');
    if (needsRefresh === 'true') {
      sessionStorage.removeItem('collectionNeedsRefresh');
      console.log('[Collection] Refresh requested, fetching fresh data...');
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
      navigationHelper.navigateToItemDetail(type, item.id);
    },
    []
  );

  // Handle mark as sold button click
  const handleMarkAsSold = useCallback(
    (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => {
      setSelectedItem({
        id: item.id,
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
      setIsMarkSoldModalOpen(true);
    },
    []
  );

  // Handle successful mark as sold operation
  const handleMarkSoldSuccess = useCallback(() => {
    // Close modal and reset selected item
    setIsMarkSoldModalOpen(false);
    setSelectedItem(null);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsMarkSoldModalOpen(false);
    setSelectedItem(null);
  }, []);

  // Export functionality handlers
  const handleExportAllItems = useCallback(async () => {
    const allItems = getAllCollectionItems();
    await exportAllItems(allItems);
  }, [exportAllItems, getAllCollectionItems]);

  const handleExportSelectedItems = useCallback(async () => {
    await exportSelectedItems(selectedItemsForExport);
    setIsExportModalOpen(false);
  }, [exportSelectedItems, selectedItemsForExport]);

  const handleOpenExportModal = useCallback(() => {
    const allItems = getAllCollectionItems();
    if (allItems.length === 0) {
      return; // useCollectionExport hook will handle the warning
    }
    setIsExportModalOpen(true);
  }, [getAllCollectionItems]);

  const handleSelectAllItems = useCallback(() => {
    const allItems = getAllCollectionItems();
    selectAllItems(allItems);
  }, [selectAllItems, getAllCollectionItems]);

  const headerActions = useMemo(
    () => (
      <div className="flex items-center space-x-3">
        <PokemonButton
          variant="secondary"
          size="md"
          onClick={handleExportAllItems}
          disabled={isExporting || loading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <FileText className="w-5 h-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export All'}
        </PokemonButton>
        <PokemonButton
          variant="secondary"
          size="md"
          onClick={handleOpenExportModal}
          disabled={isExporting || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Selected
        </PokemonButton>
        <PokemonButton
          variant="primary"
          size="md"
          onClick={handleAddNewItem}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
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
    <PageLayout
      title="My Premium Collection"
      subtitle="Manage your Pokémon cards and sealed products with award-winning style"
      loading={loading}
      error={error}
      actions={headerActions}
      variant="default"
    >
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
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
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
        isOpen={isMarkSoldModalOpen}
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
    </PageLayout>
  );
};

export default Collection;
