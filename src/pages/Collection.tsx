/**
 * Collection Page Component
 *
 * Main collection management page orchestrating reusable components.
 * Refactored following CLAUDE.md principles:
 * - Single Responsibility: Only orchestrates components and manages page state
 * - Open/Closed: Uses extensible component architecture
 * - DRY: Leverages reusable components to eliminate duplication
 * - Layer 4: Application Screen - orchestrates Layer 3 components and Layer 2 hooks
 */

import { Download, FileText, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import { MarkSoldForm } from '../components/forms/MarkSoldForm';
import { PageLayout } from '../components/layouts/PageLayout';
import CollectionExportModal from '../components/lists/CollectionExportModal';
import { CollectionItem } from '../components/lists/CollectionItemCard';
import CollectionStats from '../components/lists/CollectionStats';
import CollectionTabs, { TabType } from '../components/lists/CollectionTabs';
import { useCollectionExport } from '../hooks/useCollectionExport';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { navigationHelper } from '../utils/navigation';

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
  const getAllCollectionItems = (): CollectionItem[] => {
    return [...psaCards, ...rawCards, ...sealedProducts];
  };

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
          (item as any).cardId?.cardName ||
          (item as any).cardName ||
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
  }, [exportAllItems, psaCards, rawCards, sealedProducts]);

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
  }, [psaCards, rawCards, sealedProducts]);

  const handleSelectAllItems = useCallback(() => {
    const allItems = getAllCollectionItems();
    selectAllItems(allItems);
  }, [selectAllItems, psaCards, rawCards, sealedProducts]);

  const headerActions = useMemo(
    () => (
      <div className="flex items-center space-x-3">
        <button
          onClick={handleExportAllItems}
          disabled={isExporting || loading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export All'}
        </button>
        <button
          onClick={handleOpenExportModal}
          disabled={isExporting || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Selected
        </button>
        <button
          onClick={handleAddNewItem}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-indigo-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </button>
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

      {/* Mark as Sold Modal */}
      <Modal
        isOpen={isMarkSoldModalOpen}
        onClose={handleModalClose}
        title={`Mark "${selectedItem?.name}" as Sold`}
        maxWidth="2xl"
      >
        {selectedItem && (
          <MarkSoldForm
            itemId={selectedItem.id}
            itemType={selectedItem.type}
            onCancel={handleModalClose}
            onSuccess={handleMarkSoldSuccess}
          />
        )}
      </Modal>
    </PageLayout>
  );
};

export default Collection;
