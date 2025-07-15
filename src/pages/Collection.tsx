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
import { Package, Star, Archive, CheckCircle, Plus, DollarSign } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { MarkSoldForm } from '../components/forms/MarkSoldForm';
import { useCollection } from '../hooks/useCollection';
import { ISaleDetails } from '../domain/models/common';

type TabType = 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items';

interface TabConfig {
  id: TabType;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('psa-graded');
  const [isMarkSoldModalOpen, setIsMarkSoldModalOpen] = useState(false);
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
    markSealedProductSold
  } = useCollection();

  // Tab configuration for clean, maintainable tab management
  const tabs: TabConfig[] = [
    {
      id: 'psa-graded',
      name: 'PSA Graded Cards',
      icon: Star,
      color: 'blue'
    },
    {
      id: 'raw-cards',
      name: 'Raw Cards',
      icon: Package,
      color: 'green'
    },
    {
      id: 'sealed-products',
      name: 'Sealed Products',
      icon: Archive,
      color: 'purple'
    },
    {
      id: 'sold-items',
      name: 'Sold Items',
      icon: CheckCircle,
      color: 'yellow'
    }
  ];

  // Get count for each collection type
  const getCounts = () => ({
    psaGraded: psaCards.length,
    rawCards: rawCards.length,
    sealedProducts: sealedProducts.length,
    soldItems: soldItems.length
  });

  const counts = getCounts();

  // Handle navigation to add new item (Phase 4.4)
  const handleAddNewItem = () => {
    window.history.pushState({}, '', '/collection/add');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle mark as sold button click
  const handleMarkAsSold = (item: any, type: 'psa' | 'raw' | 'sealed') => {
    setSelectedItem({
      id: item._id,
      type,
      name: item.cardName || item.name || 'Unknown Item'
    });
    setIsMarkSoldModalOpen(true);
  };

  // Handle mark as sold form submission
  const handleMarkSoldSubmit = async (saleDetails: ISaleDetails) => {
    if (!selectedItem) return;

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

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Package className="mx-auto w-12 h-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Collection</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
          return { data: sealedProducts, emptyMessage: 'No sealed products in your collection yet.' };
        case 'sold-items':
          return { data: soldItems, emptyMessage: 'No sold items yet.' };
        default:
          return { data: [], emptyMessage: 'No items found.' };
      }
    };

    const { data, emptyMessage } = getTabData();

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || Package, {
              className: "mx-auto w-12 h-12"
            })}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
          <p className="text-gray-500 mb-4">{emptyMessage}</p>
          <button 
            onClick={handleAddNewItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </button>
        </div>
      );
    }

    // Render actual collection items with Mark as Sold functionality
    return (
      <div className="space-y-4">
        {data.map((item: any, index: number) => {
          const itemType = activeTab === 'psa-graded' ? 'psa' : 
                          activeTab === 'raw-cards' ? 'raw' : 'sealed';
          const isUnsoldTab = activeTab !== 'sold-items';
          
          return (
            <div key={item._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.cardName || item.name || `Item ${index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'psa-graded' && `Grade: ${item.grade}`}
                    {activeTab === 'raw-cards' && `Condition: ${item.condition}`}
                    {activeTab === 'sealed-products' && `Category: ${item.category}`}
                    {activeTab === 'sold-items' && `Sold: ${item.saleDetails?.dateSold ? new Date(item.saleDetails.dateSold).toLocaleDateString() : 'N/A'}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${item.myPrice || '0.00'}
                    </p>
                    {item.sold && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sold
                      </span>
                    )}
                    {activeTab === 'sold-items' && item.saleDetails?.actualSoldPrice && (
                      <p className="text-sm text-green-600 font-medium">
                        Sold: ${item.saleDetails.actualSoldPrice}
                      </p>
                    )}
                  </div>
                  
                  {/* Mark as Sold button - only show for unsold items in non-sold tabs */}
                  {isUnsoldTab && !item.sold && (
                    <button
                      onClick={() => handleMarkAsSold(item, itemType)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Mark as Sold
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Collection</h1>
              <p className="mt-1 text-gray-600">
                Manage your Pokémon cards and sealed products
              </p>
            </div>
            <button 
              onClick={handleAddNewItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </button>
          </div>
        </div>

        {/* Collection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">PSA Graded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.psaGraded}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Raw Cards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.rawCards}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sealed Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.sealedProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sold Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.soldItems}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Collection Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Mark as Sold Modal */}
        <Modal
          isOpen={isMarkSoldModalOpen}
          onClose={handleModalClose}
          title={`Mark "${selectedItem?.name}" as Sold`}
          maxWidth="2xl"
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