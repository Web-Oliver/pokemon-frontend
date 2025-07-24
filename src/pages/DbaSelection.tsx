/**
 * DBA Selection Page
 * 
 * Allows users to select items for DBA listing with 60-day countdown tracking
 * Following CLAUDE.md principles and matching existing design patterns
 */

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, Package, Star, Archive, Timer, AlertTriangle } from 'lucide-react';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { ImageSlideshow } from '../components/common/ImageSlideshow';
import { formatCardNameForDisplay } from '../utils/cardUtils';
import { showSuccessToast, handleApiError } from '../utils/errorHandler';
import * as dbaSelectionApi from '../api/dbaSelectionApi';

interface DbaSelectionInfo {
  selectedForDba: boolean;
  dbaSelectedDate?: string;
  daysSelected?: number;
  daysRemaining?: number;
}

interface ItemWithDbaInfo {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  name: string;
  price: number;
  images: string[];
  dbaInfo: DbaSelectionInfo;
  item: any; // Original item data
}

const DbaSelection: React.FC = () => {
  const { psaCards, rawCards, sealedProducts, loading } = useCollectionOperations();
  const [allItems, setAllItems] = useState<ItemWithDbaInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dbaSelections, setDbaSelections] = useState<dbaSelectionApi.DbaSelection[]>([]);
  const [loadingDbaSelections, setLoadingDbaSelections] = useState(true);

  // Load DBA selections first with retry logic
  useEffect(() => {
    const loadDbaSelections = async (retryCount = 0) => {
      try {
        console.log('[DBA SELECTION] Loading DBA selections...', retryCount > 0 ? `(retry ${retryCount})` : '');
        const selections = await dbaSelectionApi.getDbaSelections(true); // Only active selections
        setDbaSelections(selections);
        console.log('[DBA SELECTION] Loaded', selections.length, 'DBA selections');
      } catch (error) {
        console.error('[DBA SELECTION] Failed to load DBA selections:', error);
        
        // Retry once after a short delay if it's a network error
        if (retryCount === 0 && error.code === 'ERR_NETWORK') {
          console.log('[DBA SELECTION] Retrying DBA selections load in 1 second...');
          setTimeout(() => loadDbaSelections(1), 1000);
          return;
        }
        
        // Only show error to user after retries fail
        handleApiError(error, 'Failed to load DBA selections');
        setDbaSelections([]); // Set empty array to prevent crashes
      } finally {
        setLoadingDbaSelections(false);
      }
    };

    loadDbaSelections();
  }, []);

  // Calculate DBA info for an item using loaded DBA selections
  const calculateDbaInfo = (item: any, itemType: string): DbaSelectionInfo => {
    const itemId = item.id || item._id;
    const dbaSelection = dbaSelections.find(s => s.itemId === itemId && s.itemType === itemType);
    
    if (!dbaSelection || !dbaSelection.isActive) {
      return {
        selectedForDba: false
      };
    }

    return {
      selectedForDba: true,
      dbaSelectedDate: dbaSelection.selectedDate,
      daysSelected: dbaSelection.daysSelected,
      daysRemaining: dbaSelection.daysRemaining
    };
  };

  // Get display name for an item
  const getItemDisplayName = (item: any, type: string): string => {
    if (type === 'sealed') {
      return item.name || 'Unknown Product';
    } else {
      const cardName = item.cardId?.cardName || item.cardName || 'Unknown Card';
      return formatCardNameForDisplay(cardName);
    }
  };

  // Process all items with DBA info (wait for DBA selections to load)
  useEffect(() => {
    if (loadingDbaSelections || loading) return; // Wait for both collection and DBA selections to load

    const processedItems: ItemWithDbaInfo[] = [];

    // Process PSA cards
    psaCards.forEach(card => {
      processedItems.push({
        id: card.id || card._id,
        type: 'psa',
        name: getItemDisplayName(card, 'psa'),
        price: parseFloat(card.myPrice?.toString() || '0'),
        images: card.images || [],
        dbaInfo: calculateDbaInfo(card, 'psa'),
        item: card
      });
    });

    // Process Raw cards
    rawCards.forEach(card => {
      processedItems.push({
        id: card.id || card._id,
        type: 'raw',
        name: getItemDisplayName(card, 'raw'),
        price: parseFloat(card.myPrice?.toString() || '0'),
        images: card.images || [],
        dbaInfo: calculateDbaInfo(card, 'raw'),
        item: card
      });
    });

    // Process Sealed products
    sealedProducts.forEach(product => {
      processedItems.push({
        id: product.id || product._id,
        type: 'sealed',
        name: getItemDisplayName(product, 'sealed'),
        price: parseFloat(product.myPrice?.toString() || '0'),
        images: product.images || [],
        dbaInfo: calculateDbaInfo(product, 'sealed'),
        item: product
      });
    });

    setAllItems(processedItems);
  }, [psaCards, rawCards, sealedProducts, dbaSelections, loadingDbaSelections, loading]);

  // Handle item selection toggle
  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle marking items for DBA
  const handleMarkForDba = async () => {
    if (selectedItems.length === 0) {
      handleApiError(new Error('Please select at least one item to mark for DBA'), 'No items selected');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Prepare items for API call
      const itemsToAdd = selectedItems.map(itemId => {
        const item = allItems.find(i => i.id === itemId);
        return {
          itemId,
          itemType: item!.type,
          notes: ''
        };
      });

      // Call API to add items to DBA selection
      await dbaSelectionApi.addToDbaSelection(itemsToAdd);
      
      // Reload DBA selections to get updated data
      const updatedSelections = await dbaSelectionApi.getDbaSelections(true);
      setDbaSelections(updatedSelections);
      
      // Update local state
      setAllItems(prev => prev.map(item => {
        const dbaInfo = updatedSelections.find(s => s.itemId === item.id && s.itemType === item.type);
        if (dbaInfo) {
          return {
            ...item,
            dbaInfo: {
              selectedForDba: true,
              dbaSelectedDate: dbaInfo.selectedDate,
              daysSelected: dbaInfo.daysSelected,
              daysRemaining: dbaInfo.daysRemaining
            }
          };
        }
        return item;
      }));

      setSelectedItems([]);
      showSuccessToast(`Marked ${selectedItems.length} items for DBA listing`);
      
    } catch (error) {
      console.error('[DBA SELECTION] Failed to mark items:', error);
      handleApiError(error, 'Failed to mark items for DBA');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle removing items from DBA
  const handleRemoveFromDba = async () => {
    if (selectedItems.length === 0) {
      handleApiError(new Error('Please select at least one item to remove from DBA'), 'No items selected');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Prepare items for API call
      const itemsToRemove = selectedItems.map(itemId => {
        const item = allItems.find(i => i.id === itemId);
        return {
          itemId,
          itemType: item!.type
        };
      });

      // Call API to remove items from DBA selection
      await dbaSelectionApi.removeFromDbaSelection(itemsToRemove);
      
      // Reload DBA selections to get updated data
      const updatedSelections = await dbaSelectionApi.getDbaSelections(true);
      setDbaSelections(updatedSelections);
      
      // Update local state
      setAllItems(prev => prev.map(item => {
        if (selectedItems.includes(item.id)) {
          return {
            ...item,
            dbaInfo: {
              selectedForDba: false
            }
          };
        }
        return item;
      }));

      setSelectedItems([]);
      showSuccessToast(`Removed ${selectedItems.length} items from DBA listing`);
      
    } catch (error) {
      console.error('[DBA SELECTION] Failed to remove items:', error);
      handleApiError(error, 'Failed to remove items from DBA');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get item icon based on type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'psa':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'raw':
        return <Package className="w-4 h-4 text-emerald-500" />;
      case 'sealed':
        return <Archive className="w-4 h-4 text-purple-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get countdown color based on days remaining
  const getCountdownColor = (daysRemaining: number) => {
    if (daysRemaining > 30) return 'text-green-600 bg-green-50 border-green-200';
    if (daysRemaining > 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Render item card
  const renderItemCard = (item: ItemWithDbaInfo) => {
    const isSelected = selectedItems.includes(item.id);
    const { dbaInfo } = item;
    
    return (
      <div
        key={item.id}
        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
        }`}
        onClick={() => handleItemToggle(item.id)}
      >
        {/* Selection Indicator */}
        <div className="absolute top-3 right-3">
          {isSelected ? (
            <CheckCircle className="w-6 h-6 text-indigo-600" />
          ) : (
            <div className="w-5 h-5 rounded border-2 border-slate-300" />
          )}
        </div>

        {/* DBA Status Badge */}
        {dbaInfo.selectedForDba && (
          <div className="absolute top-3 left-3">
            <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getCountdownColor(dbaInfo.daysRemaining!)}`}>
              <Timer className="w-3 h-3 inline mr-1" />
              {dbaInfo.daysRemaining}d left
            </div>
          </div>
        )}

        {/* Item Image Slideshow */}
        <div className="w-full mb-3">
          <ImageSlideshow
            images={item.images}
            fallbackIcon={getItemIcon(item.type)}
            autoplay={false}
            autoplayDelay={3000}
            className="h-64"
            showThumbnails={false}
          />
        </div>

        {/* Item Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
            {item.name}
          </h3>
          
          {/* Type and Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
              {item.type === 'psa' ? 'PSA' : item.type === 'raw' ? 'Raw' : 'Sealed'}
            </span>
            <span className="font-semibold text-slate-900">
              {item.price > 0 ? `${Math.round(item.price)} kr.` : 'No price'}
            </span>
          </div>

          {/* DBA Selection Info */}
          {dbaInfo.selectedForDba ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center text-sm font-medium text-blue-800 mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                Selected for DBA
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>Selected: {dbaInfo.daysSelected} days ago</div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {dbaInfo.daysRemaining} days remaining
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-sm text-slate-600 text-center">
                Not selected for DBA
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedForDbaItems = allItems.filter(item => item.dbaInfo.selectedForDba);
  const notSelectedItems = allItems.filter(item => !item.dbaInfo.selectedForDba);
  const expiringSoonItems = selectedForDbaItems.filter(item => item.dbaInfo.daysRemaining! <= 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-wide mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DBA Selection Manager
                </h1>
                <p className="text-xl text-slate-600 font-medium">
                  Track your 60-day DBA listing countdown and manage item selections
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-500">Selected for DBA</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedForDbaItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-600">{expiringSoonItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Currently Selected</p>
                  <p className="text-2xl font-bold text-indigo-600">{selectedItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {selectedItems.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedItems.length} Item{selectedItems.length > 1 ? 's' : ''} Selected
                </h2>
                
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleMarkForDba}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Mark for DBA
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleRemoveFromDba}
                    disabled={isUpdating}
                    variant="secondary"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Remove from DBA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Expiring Soon Alert */}
          {expiringSoonItems.length > 0 && (
            <div className="bg-red-50/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200 p-8">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
                <div>
                  <h2 className="text-2xl font-bold text-red-800 mb-2">
                    {expiringSoonItems.length} Item{expiringSoonItems.length > 1 ? 's' : ''} Expiring Soon!
                  </h2>
                  <p className="text-red-700">
                    These items have 10 days or less remaining in their 60-day DBA countdown.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected for DBA Items */}
          {selectedForDbaItems.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Timer className="w-6 h-6 mr-3 text-blue-600" />
                Items Selected for DBA ({selectedForDbaItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedForDbaItems.map(item => renderItemCard(item))}
              </div>
            </div>
          )}

          {/* Available Items */}
          {notSelectedItems.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-slate-600" />
                Available Items ({notSelectedItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notSelectedItems.map(item => renderItemCard(item))}
              </div>
            </div>
          )}

          {/* No items message */}
          {allItems.length === 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Items in Collection</h3>
              <p className="text-slate-600">Add some items to your collection first to manage DBA selections</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DbaSelection;