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

import React, { useState, useEffect } from 'react';
import { Plus, Download, FileText } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { MarkSoldForm } from '../components/forms/MarkSoldForm';
import CollectionStats from '../components/lists/CollectionStats';
import CollectionTabs, { TabType } from '../components/lists/CollectionTabs';
import CollectionExportModal from '../components/lists/CollectionExportModal';
import { CollectionItem } from '../components/lists/CollectionItemCard';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { useCollectionExport } from '../hooks/useCollectionExport';
import { ISaleDetails } from '../domain/models/common';

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
    markPsaCardSold,
    markRawCardSold,
    markSealedProductSold,
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
  const handleAddNewItem = () => {
    window.history.pushState({}, '', '/collection/add');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle navigation to item detail page
  const handleViewItemDetail = (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => {
    window.history.pushState({}, '', `/collection/${type}/${item.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle mark as sold button click
  const handleMarkAsSold = (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => {
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
  };

  // Handle mark as sold form submission
  const handleMarkSoldSubmit = async (saleDetails: ISaleDetails) => {
    if (!selectedItem) {
      return;
    }

    try {
      switch (selectedItem.type) {
        case 'psa':
          await markPsaCardSold(selectedItem.id, saleDetails);
          break;
        case 'raw':
          await markRawCardSold(selectedItem.id, saleDetails);
          break;
        case 'sealed':
          await markSealedProductSold(selectedItem.id, saleDetails);
          break;
      }

      // Close modal and reset selected item
      setIsMarkSoldModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error marking item as sold:', error);
      // Error handling is done by the useCollection hook
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsMarkSoldModalOpen(false);
    setSelectedItem(null);
  };

  // Export functionality handlers
  const handleExportAllItems = async () => {
    const allItems = getAllCollectionItems();
    await exportAllItems(allItems);
  };

  const handleExportSelectedItems = async () => {
    await exportSelectedItems(selectedItemsForExport);
    setIsExportModalOpen(false);
  };

  const handleOpenExportModal = () => {
    const allItems = getAllCollectionItems();
    if (allItems.length === 0) {
      return; // useCollectionExport hook will handle the warning
    }
    setIsExportModalOpen(true);
  };

  const handleSelectAllItems = () => {
    const allItems = getAllCollectionItems();
    selectAllItems(allItems);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-10'>
          {/* Context7 Premium Page Header */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5'></div>
            <div className='relative z-10 flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-slate-900 tracking-wide mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  My Premium Collection
                </h1>
                <p className='text-xl text-slate-600 font-medium leading-relaxed'>
                  Manage your Pokémon cards and sealed products with award-winning style
                </p>
              </div>
              <div className='flex items-center space-x-4'>
                {/* Context7 Premium Export Buttons */}
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={handleExportAllItems}
                    disabled={isExporting || loading}
                    className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isExporting ? (
                      <LoadingSpinner size='sm' className='mr-3' />
                    ) : (
                      <Download className='w-5 h-5 mr-3' />
                    )}
                    Export All
                  </button>

                  <button
                    onClick={handleOpenExportModal}
                    disabled={isExporting || loading}
                    className='bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <FileText className='w-5 h-5 mr-3' />
                    Select & Export
                  </button>
                </div>

                <button
                  onClick={handleAddNewItem}
                  className='bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-indigo-500/20'
                >
                  <Plus className='w-5 h-5 mr-3' />
                  Add New Item
                </button>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Collection Statistics */}
          <CollectionStats
            psaGradedCount={psaCards.length}
            rawCardsCount={rawCards.length}
            sealedProductsCount={sealedProducts.length}
            soldItemsCount={soldItems.length}
            loading={loading}
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
        </div>

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
          maxWidth='2xl'
        >
          <MarkSoldForm
            onSubmit={handleMarkSoldSubmit}
            onCancel={handleModalClose}
            isLoading={loading}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Collection;
