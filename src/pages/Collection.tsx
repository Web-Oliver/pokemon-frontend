/**
 * Collection Page Component
 *
 * Main collection management page with full tabbed navigation functionality.
 * Phase 4.3: Complete implementation with state management and useCollection integration.
 *
 * Following CLAUDE.md principles:
 * - Beautiful, award-winning design with modern aesthetics
 * - Responsive layout for all device sizes
 * - Integration with domain layer through useCollection hook
 * - Loading and error state handling
 */

import React, { useState } from 'react';
import {
  Package,
  Star,
  Archive,
  CheckCircle,
  Plus,
  DollarSign,
  Download,
  FileText,
  Eye,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { MarkSoldForm } from '../components/forms/MarkSoldForm';
import { useCollection } from '../hooks/useCollection';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionFacebookTextFile, downloadBlob } from '../api/exportApi';
import { showSuccessToast, showWarningToast, handleApiError } from '../utils/errorHandler';

type TabType = 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items';

interface TabConfig {
  id: TabType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('psa-graded');
  const [isMarkSoldModalOpen, setIsMarkSoldModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedItemsForExport, setSelectedItemsForExport] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
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
  } = useCollection();

  // Tab configuration for clean, maintainable tab management
  const tabs: TabConfig[] = [
    {
      id: 'psa-graded',
      name: 'PSA Graded Cards',
      icon: Star,
      color: 'blue',
    },
    {
      id: 'raw-cards',
      name: 'Raw Cards',
      icon: Package,
      color: 'green',
    },
    {
      id: 'sealed-products',
      name: 'Sealed Products',
      icon: Archive,
      color: 'purple',
    },
    {
      id: 'sold-items',
      name: 'Sold Items',
      icon: CheckCircle,
      color: 'yellow',
    },
  ];

  // Get count for each collection type
  const getCounts = () => ({
    psaGraded: psaCards.length,
    rawCards: rawCards.length,
    sealedProducts: sealedProducts.length,
    soldItems: soldItems.length,
  });

  const counts = getCounts();

  // Handle navigation to add new item (Phase 4.4)
  const handleAddNewItem = () => {
    window.history.pushState({}, '', '/collection/add');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle navigation to item detail page
  const handleViewItemDetail = (
    item: { id: string; cardName?: string; name?: string },
    type: 'psa' | 'raw' | 'sealed'
  ) => {
    window.history.pushState({}, '', `/collection/${type}/${item.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle mark as sold button click
  const handleMarkAsSold = (
    item: { id: string; cardName?: string; name?: string },
    type: 'psa' | 'raw' | 'sealed'
  ) => {
    setSelectedItem({
      id: item.id,
      type,
      name: item.cardName || item.name || 'Unknown Item',
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

  // Export functionality
  const getAllCollectionItems = () => {
    const allItems = [
      ...psaCards,
      ...rawCards,
      ...sealedProducts,
    ];
    return allItems;
  };

  const handleExportAllItems = async () => {
    const allItems = getAllCollectionItems();

    if (allItems.length === 0) {
      showWarningToast('No items in collection to export');
      return;
    }

    setIsExporting(true);
    try {
      const itemIds = allItems.map(item => item.id);
      const blob = await getCollectionFacebookTextFile(itemIds);
      const filename = `collection-facebook-export-${new Date().toISOString().split('T')[0]}.txt`;
      downloadBlob(blob, filename);
      showSuccessToast(`Successfully exported ${itemIds.length} items to Facebook text file!`);
    } catch (error) {
      handleApiError(error, 'Failed to export collection to Facebook text file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSelectedItems = async () => {
    if (selectedItemsForExport.length === 0) {
      showWarningToast('Please select items to export');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await getCollectionFacebookTextFile(selectedItemsForExport);
      const filename = `collection-selected-export-${new Date().toISOString().split('T')[0]}.txt`;
      downloadBlob(blob, filename);
      showSuccessToast(`Successfully exported ${selectedItemsForExport.length} selected items!`);
      setIsExportModalOpen(false);
      setSelectedItemsForExport([]);
    } catch (error) {
      handleApiError(error, 'Failed to export selected items');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenExportModal = () => {
    const allItems = getAllCollectionItems();
    if (allItems.length === 0) {
      showWarningToast('No items in collection to export');
      return;
    }
    setIsExportModalOpen(true);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemsForExport(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    const allItems = getAllCollectionItems();
    const allIds = allItems.map(item => item.id);
    setSelectedItemsForExport(allIds);
  };

  const clearSelection = () => {
    setSelectedItemsForExport([]);
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className='flex justify-center items-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      );
    }

    if (error) {
      return (
        <div className='text-center py-12'>
          <div className='text-red-500 mb-4'>
            <Package className='mx-auto w-12 h-12' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Error Loading Collection</h3>
          <p className='text-gray-500 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
          >
            Retry
          </button>
        </div>
      );
    }

    const getTabData = () => {
      switch (activeTab) {
        case 'psa-graded':
          return { data: psaCards, emptyMessage: 'No PSA graded cards in your collection yet.' };
        case 'raw-cards':
          return { data: rawCards, emptyMessage: 'No raw cards in your collection yet.' };
        case 'sealed-products':
          return {
            data: sealedProducts,
            emptyMessage: 'No sealed products in your collection yet.',
          };
        case 'sold-items':
          return { data: soldItems, emptyMessage: 'No sold items yet.' };
        default:
          return { data: [], emptyMessage: 'No items found.' };
      }
    };

    const { data, emptyMessage } = getTabData();

    if (data.length === 0) {
      return (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || Package, {
              className: 'mx-auto w-12 h-12',
            })}
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No Items Found</h3>
          <p className='text-gray-500 mb-4'>{emptyMessage}</p>
          <button
            onClick={handleAddNewItem}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center'
          >
            <Plus className='w-4 h-4 mr-2' />
            Add First Item
          </button>
        </div>
      );
    }

    // Render actual collection items with Mark as Sold functionality
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
        {data.map(
          (
            item: {
              _id: string;
              cardId?: { cardName?: string; name?: string };
              cardName?: string;
              name?: string;
              grade?: string;
              condition?: string;
              category?: string;
              myPrice?: number;
              sold?: boolean;
              saleDetails?: { dateSold?: string; actualSoldPrice?: number };
            },
            index: number
          ) => {
            // Determine item type based on item properties, especially important for sold items
            const getItemType = (item: any, activeTab: string) => {
              if (activeTab === 'psa-graded') return 'psa';
              if (activeTab === 'raw-cards') return 'raw';
              if (activeTab === 'sealed-products') return 'sealed';
              
              // For sold items, detect type based on item properties
              if (activeTab === 'sold-items') {
                if ('grade' in item || item.grade !== undefined) return 'psa';
                if ('condition' in item || item.condition !== undefined) return 'raw';
                if ('category' in item || item.category !== undefined) return 'sealed';
                
                // Fallback: check if item has cardId (PSA/Raw cards) or productId (sealed)
                if (item.cardId || item.cardName) return item.grade ? 'psa' : 'raw';
                if (item.productId || item.name) return 'sealed';
              }
              
              return 'sealed'; // Default fallback
            };
            
            const itemType = getItemType(item, activeTab);
            const isUnsoldTab = activeTab !== 'sold-items';

            return (
              <div
                key={item.id || index}
                className='group relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:scale-105 hover:border-indigo-200/50 overflow-hidden'
              >
                {/* Card Background Pattern */}
                <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 to-indigo-50/30 opacity-60'></div>
                
                {/* Card Image Placeholder */}
                <div className='relative z-10 mb-6'>
                  <div className='w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner'>
                    <div className='w-32 h-44 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300'>
                      <div className='w-24 h-32 bg-gradient-to-br from-white/80 to-indigo-50/80 rounded-lg flex items-center justify-center'>
                        <Package className='w-8 h-8 text-indigo-600' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className='relative z-10 space-y-4'>
                  <div className='text-center'>
                    <h4 className='text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors duration-300'>
                      {item.cardId?.cardName ||
                        item.cardId?.name ||
                        item.cardName ||
                        item.name ||
                        'Unknown'}
                    </h4>
                    
                    {/* Grade/Condition Badge */}
                    <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200/50'>
                      {activeTab === 'psa-graded' && (
                        <>
                          <Star className='w-4 h-4 mr-1 text-yellow-500' />
                          Grade {item.grade}
                        </>
                      )}
                      {activeTab === 'raw-cards' && (
                        <>
                          <Package className='w-4 h-4 mr-1 text-emerald-500' />
                          {item.condition}
                        </>
                      )}
                      {activeTab === 'sealed-products' && (
                        <>
                          <Archive className='w-4 h-4 mr-1 text-purple-500' />
                          {item.category}
                        </>
                      )}
                      {activeTab === 'sold-items' && (
                        <>
                          <CheckCircle className='w-4 h-4 mr-1 text-green-500' />
                          {item.saleDetails?.dateSold ? new Date(item.saleDetails.dateSold).toLocaleDateString() : 'N/A'}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className='text-center space-y-2'>
                    <p className='text-2xl font-bold text-slate-900'>
                      {item.myPrice || '0'} kr.
                    </p>
                    
                    {item.sold && (
                      <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/50'>
                        <CheckCircle className='w-4 h-4 mr-1' />
                        Sold
                      </div>
                    )}
                    
                    {activeTab === 'sold-items' && item.saleDetails?.actualSoldPrice && (
                      <p className='text-sm font-medium text-green-600'>
                        Sold: {item.saleDetails.actualSoldPrice} kr.
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-col gap-3 pt-4'>
                    {/* View Details Button - Always visible */}
                    <button
                      onClick={() => handleViewItemDetail(item, itemType)}
                      className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    >
                      <Eye className='w-5 h-5 mr-2' />
                      View Details
                    </button>
                    
                    {/* Mark as Sold Button - Only for unsold items */}
                    {isUnsoldTab && !item.sold && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsSold(item, itemType);
                        }}
                        className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                      >
                        <DollarSign className='w-5 h-5 mr-2' />
                        Mark as Sold
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl'></div>
              </div>
            );
          }
        )}
      </div>
    );
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

          {/* Context7 Premium Collection Overview */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-indigo-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Star className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-indigo-600 tracking-wide uppercase mb-1'>
                    PSA Graded
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300'>
                    {loading ? (
                      <div className='w-12 h-8 bg-slate-200 rounded-lg animate-pulse'></div>
                    ) : (
                      counts.psaGraded
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-emerald-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Package className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-emerald-600 tracking-wide uppercase mb-1'>
                    Raw Cards
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300'>
                    {loading ? (
                      <div className='w-12 h-8 bg-slate-200 rounded-lg animate-pulse'></div>
                    ) : (
                      counts.rawCards
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-purple-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Archive className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-purple-600 tracking-wide uppercase mb-1'>
                    Sealed Products
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors duration-300'>
                    {loading ? (
                      <div className='w-12 h-8 bg-slate-200 rounded-lg animate-pulse'></div>
                    ) : (
                      counts.sealedProducts
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-amber-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <CheckCircle className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-amber-600 tracking-wide uppercase mb-1'>
                    Sold Items
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-300'>
                    {loading ? (
                      <div className='w-12 h-8 bg-slate-200 rounded-lg animate-pulse'></div>
                    ) : (
                      counts.soldItems
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Tabbed Collection Content */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-purple-500/3 to-blue-500/3'></div>

            <div className='relative z-10'>
              <div className='border-b border-slate-200/50 px-8 pt-8'>
                <nav className='-mb-px flex space-x-1'>
                  {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap py-4 px-6 border-b-3 font-bold text-sm transition-all duration-300 rounded-t-2xl relative group ${
                          isActive
                            ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50 shadow-lg'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-110'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                            }`}
                          >
                            <Icon className='w-4 h-4' />
                          </div>
                          <span className='tracking-wide'>{tab.name}</span>
                        </div>
                        {isActive && (
                          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg animate-pulse'></div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className='p-10'>{renderTabContent()}</div>
            </div>
          </div>
        </div>

        {/* Export Selection Modal */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title='Select Items to Export'
          maxWidth='4xl'
        >
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <p className='text-gray-600'>
                Select items from your collection to include in the Facebook text file export.
              </p>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={selectAllItems}
                  className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                >
                  Select All
                </button>
                <span className='text-gray-300'>|</span>
                <button
                  onClick={clearSelection}
                  className='text-gray-600 hover:text-gray-700 text-sm font-medium'
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Selected count */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <p className='text-blue-800 font-medium'>
                {selectedItemsForExport.length} items selected for export
              </p>
            </div>

            {/* Items list */}
            <div className='max-h-96 overflow-y-auto space-y-2'>
              {getAllCollectionItems().map(item => {
                const itemId = item.id;
                const isSelected = selectedItemsForExport.includes(itemId);
                const itemType = item.grade
                  ? 'PSA Graded'
                  : item.condition
                    ? 'Raw Card'
                    : 'Sealed Product';

                return (
                  <div
                    key={itemId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleItemSelection(itemId)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleItemSelection(itemId)}
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3'
                        />
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            {item.cardName || item.name || 'Unknown Item'}
                          </h4>
                          <p className='text-sm text-gray-500'>
                            {itemType} • {item.myPrice || '0'} kr.
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          itemType === 'PSA Graded'
                            ? 'bg-blue-100 text-blue-800'
                            : itemType === 'Raw Card'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {itemType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Export actions */}
            <div className='flex items-center justify-end space-x-3 pt-4 border-t border-gray-200'>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleExportSelectedItems}
                disabled={selectedItemsForExport.length === 0 || isExporting}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center'
              >
                {isExporting ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <Download className='w-4 h-4 mr-2' />
                )}
                Export Selected ({selectedItemsForExport.length})
              </button>
            </div>
          </div>
        </Modal>

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
