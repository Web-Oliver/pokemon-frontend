/**
 * Create Auction Page
 * Allows users to create new auctions with required fields
 * Following CLAUDE.md layered architecture and Context7 design principles
 */

import React, { useState, useMemo } from 'react';
import { Calendar, FileText, Save, ArrowLeft, Gavel, Sparkles, Package, CheckCircle, Circle, Search, Filter, X } from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import { useCollection } from '../hooks/useCollection';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { log } from '../utils/logger';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { IAuctionItem } from '../domain/models/auction';

// Define unified collection item type for display
interface UnifiedCollectionItem {
  id: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  originalItem: IPsaGradedCard | IRawCard | ISealedProduct;
}

const CreateAuction: React.FC = () => {
  const { createAuction, loading: auctionLoading, error, clearError } = useAuction();
  const { psaCards, rawCards, sealedProducts, loading: collectionLoading, error: collectionError } = useCollection();
  
  // Form state
  const [formData, setFormData] = useState({
    topText: '',
    bottomText: '',
    auctionDate: '',
    status: 'draft' as 'draft' | 'active' | 'sold' | 'expired'
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Item selection state
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'PsaGradedCard' | 'RawCard' | 'SealedProduct'>('all');

  // Combine all collection items into unified format
  const allCollectionItems = useMemo((): UnifiedCollectionItem[] => {
    const items: UnifiedCollectionItem[] = [];

    // Add PSA Graded Cards
    psaCards.filter(card => !card.sold).forEach(card => {
      items.push({
        id: card.id,
        itemType: 'PsaGradedCard',
        displayName: `${card.cardName || 'Unknown Card'} - Grade ${card.grade}`,
        displayPrice: card.myPrice,
        displayImage: card.images?.[0],
        setName: card.setName,
        grade: card.grade,
        originalItem: card,
      });
    });

    // Add Raw Cards
    rawCards.filter(card => !card.sold).forEach(card => {
      items.push({
        id: card.id,
        itemType: 'RawCard',
        displayName: `${card.cardName || 'Unknown Card'} - ${card.condition}`,
        displayPrice: card.myPrice,
        displayImage: card.images?.[0],
        setName: card.setName,
        condition: card.condition,
        originalItem: card,
      });
    });

    // Add Sealed Products
    sealedProducts.filter(product => !product.sold).forEach(product => {
      items.push({
        id: product.id,
        itemType: 'SealedProduct',
        displayName: `${product.name || 'Unknown Product'} - ${product.setName}`,
        displayPrice: product.myPrice,
        displayImage: product.images?.[0],
        setName: product.setName,
        category: product.category,
        originalItem: product,
      });
    });

    return items;
  }, [psaCards, rawCards, sealedProducts]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = allCollectionItems;

    // Filter by type
    if (filterType !== 'all') {
      items = items.filter(item => item.itemType === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.displayName.toLowerCase().includes(search) ||
        item.setName?.toLowerCase().includes(search)
      );
    }

    return items;
  }, [allCollectionItems, filterType, searchTerm]);

  // Calculate selected items total value
  const selectedItemsValue = useMemo(() => {
    return Array.from(selectedItemIds).reduce((total, itemId) => {
      const item = allCollectionItems.find(item => item.id === itemId);
      return total + (item?.displayPrice || 0);
    }, 0);
  }, [selectedItemIds, allCollectionItems]);

  // Navigation helper
  const navigateToAuctions = () => {
    window.history.pushState({}, '', '/auctions');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Select all filtered items
  const selectAllItems = () => {
    const newSelection = new Set(selectedItemIds);
    filteredItems.forEach(item => newSelection.add(item.id));
    setSelectedItemIds(newSelection);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedItemIds(new Set());
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.topText.trim()) {
      errors.topText = 'Top text is required';
    }

    if (!formData.bottomText.trim()) {
      errors.bottomText = 'Bottom text is required';
    }

    if (formData.auctionDate && new Date(formData.auctionDate) < new Date()) {
      errors.auctionDate = 'Auction date cannot be in the past';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      log('Creating auction with data:', formData);
      log('Selected items:', selectedItemIds);

      // Prepare selected items for auction
      const auctionItems: IAuctionItem[] = Array.from(selectedItemIds).map(itemId => {
        const item = allCollectionItems.find(item => item.id === itemId);
        if (!item) {
          throw new Error(`Item with ID ${itemId} not found`);
        }
        
        return {
          itemId: item.id,
          itemCategory: item.itemType,
          sold: false,
        };
      });

      // Prepare auction data
      const auctionData = {
        topText: formData.topText.trim(),
        bottomText: formData.bottomText.trim(),
        status: formData.status,
        items: auctionItems,
        totalValue: selectedItemsValue,
        ...(formData.auctionDate && { auctionDate: formData.auctionDate })
      };

      const createdAuction = await createAuction(auctionData);
      log('Auction created successfully:', createdAuction);

      // Navigate to auction detail page - handle both id and _id
      const auctionId = createdAuction.id || createdAuction._id;
      if (auctionId) {
        window.history.pushState({}, '', `/auctions/${auctionId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        log('Error: No auction ID returned from API', createdAuction);
        // Navigate back to auctions list as fallback
        window.history.pushState({}, '', '/auctions');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (err) {
      log('Error creating auction:', err);
    }
  };

  // Format current date for default value
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-20'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-4xl mx-auto space-y-8'>
          {/* Context7 Premium Header */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-blue-500/5'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center space-x-4'>
                  <Button
                    onClick={navigateToAuctions}
                    variant='outline'
                    size='sm'
                    className='text-slate-600 hover:text-slate-800 border-slate-300 hover:border-slate-400'
                  >
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Auctions
                  </Button>
                </div>
              </div>
              
              <div className='flex items-center space-x-4 mb-4'>
                <div className='w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-xl flex items-center justify-center'>
                  <Gavel className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-slate-900 tracking-wide bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>
                    Create New Auction
                  </h1>
                  <p className='text-xl text-slate-600 font-medium leading-relaxed'>
                    Start a new auction for your Pokémon collection
                  </p>
                </div>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Error Display */}
          {(error || collectionError) && (
            <div className='bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-lg'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg flex items-center justify-center'>
                    <FileText className='h-5 w-5 text-white' />
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm text-red-600 font-medium'>{error || collectionError}</p>
                </div>
                <div className='ml-auto pl-3'>
                  <button
                    onClick={clearError}
                    className='inline-flex text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors'
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Auction Form */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-teal-500/3 via-cyan-500/3 to-blue-500/3'></div>
            <div className='relative z-10 p-8'>
              <form onSubmit={handleSubmit} className='space-y-8'>
                {/* Top Text Field */}
                <div>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide flex items-center'>
                    <div className='w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3'>
                      <FileText className='w-3 h-3 text-white' />
                    </div>
                    Auction Header Text *
                  </label>
                  <input
                    type='text'
                    name='topText'
                    value={formData.topText}
                    onChange={handleInputChange}
                    placeholder='Enter the main auction title/description (e.g., "Pokemon Card Auction #1")'
                    className={`w-full px-4 py-4 bg-white/50 backdrop-blur-sm border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.topText 
                        ? 'border-red-300 bg-red-50/50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    disabled={auctionLoading || collectionLoading}
                  />
                  {validationErrors.topText && (
                    <p className='mt-2 text-sm text-red-600 font-medium'>{validationErrors.topText}</p>
                  )}
                </div>

                {/* Bottom Text Field */}
                <div>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide flex items-center'>
                    <div className='w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3'>
                      <FileText className='w-3 h-3 text-white' />
                    </div>
                    Auction Footer Text *
                  </label>
                  <textarea
                    name='bottomText'
                    value={formData.bottomText}
                    onChange={handleInputChange}
                    placeholder='Enter the auction footer/closing text (e.g., "Happy bidding! Payment due within 48 hours.")'
                    rows={4}
                    className={`w-full px-4 py-4 bg-white/50 backdrop-blur-sm border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none ${
                      validationErrors.bottomText 
                        ? 'border-red-300 bg-red-50/50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    disabled={auctionLoading || collectionLoading}
                  />
                  {validationErrors.bottomText && (
                    <p className='mt-2 text-sm text-red-600 font-medium'>{validationErrors.bottomText}</p>
                  )}
                </div>

                {/* Auction Date Field */}
                <div>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide flex items-center'>
                    <div className='w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3'>
                      <Calendar className='w-3 h-3 text-white' />
                    </div>
                    Auction Date (Optional)
                  </label>
                  <input
                    type='date'
                    name='auctionDate'
                    value={formData.auctionDate}
                    onChange={handleInputChange}
                    min={getCurrentDate()}
                    className={`w-full px-4 py-4 bg-white/50 backdrop-blur-sm border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.auctionDate 
                        ? 'border-red-300 bg-red-50/50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    disabled={auctionLoading || collectionLoading}
                  />
                  {validationErrors.auctionDate && (
                    <p className='mt-2 text-sm text-red-600 font-medium'>{validationErrors.auctionDate}</p>
                  )}
                  <p className='mt-2 text-sm text-slate-500 font-medium'>
                    Leave empty to set the date later. You can add items to the auction after creation.
                  </p>
                </div>

                {/* Status Field */}
                <div>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide flex items-center'>
                    <div className='w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3'>
                      <Sparkles className='w-3 h-3 text-white' />
                    </div>
                    Initial Status
                  </label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    className='w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400'
                    disabled={auctionLoading || collectionLoading}
                  >
                    <option value='draft'>Draft - Not visible to public</option>
                    <option value='active'>Active - Live auction</option>
                  </select>
                  <p className='mt-2 text-sm text-slate-500 font-medium'>
                    Start with "Draft" to review and add items before making it active.
                  </p>
                </div>

                {/* Collection Items Selection */}
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-slate-900 tracking-wide flex items-center'>
                      <div className='w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-3'>
                        <Package className='w-4 h-4 text-white' />
                      </div>
                      Select Items for Auction
                    </h3>
                    <div className='flex items-center space-x-2 text-sm font-medium text-slate-600'>
                      <span>{selectedItemIds.size} selected</span>
                      {selectedItemIds.size > 0 && (
                        <span className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200'>
                          ${selectedItemsValue.toFixed(2)} total
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
                      <input
                        type='text'
                        placeholder='Search items...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200'
                      />
                    </div>
                    <div className='relative'>
                      <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className='w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200'
                      >
                        <option value='all'>All Items</option>
                        <option value='PsaGradedCard'>PSA Graded Cards</option>
                        <option value='RawCard'>Raw Cards</option>
                        <option value='SealedProduct'>Sealed Products</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Button
                        type='button'
                        onClick={selectAllItems}
                        variant='outline'
                        size='sm'
                        disabled={filteredItems.length === 0}
                        className='text-amber-600 border-amber-300 hover:bg-amber-50'
                      >
                        Select All ({filteredItems.length})
                      </Button>
                      {selectedItemIds.size > 0 && (
                        <Button
                          type='button'
                          onClick={clearAllSelections}
                          variant='outline'
                          size='sm'
                          className='text-slate-600 border-slate-300 hover:bg-slate-50'
                        >
                          <X className='w-4 h-4 mr-1' />
                          Clear Selection
                        </Button>
                      )}
                    </div>
                    <p className='text-sm text-slate-500 font-medium'>
                      {filteredItems.length} items available
                    </p>
                  </div>

                  {/* Items Grid */}
                  {collectionLoading ? (
                    <div className='py-12'>
                      <LoadingSpinner text='Loading collection items...' />
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className='py-12 text-center'>
                      <div className='w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4'>
                        <Package className='w-8 h-8 text-slate-500' />
                      </div>
                      <h4 className='text-lg font-bold text-slate-900 mb-2'>No items found</h4>
                      <p className='text-slate-600 font-medium'>
                        {searchTerm || filterType !== 'all' 
                          ? 'Try adjusting your search or filter.' 
                          : 'Add items to your collection first.'}
                      </p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto rounded-2xl bg-slate-50/50 p-4'>
                      {filteredItems.map((item) => {
                        const isSelected = selectedItemIds.has(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemSelection(item.id)}
                            className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50/80 shadow-lg scale-102'
                                : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:shadow-md'
                            }`}
                          >
                            {/* Selection Indicator */}
                            <div className='absolute top-3 right-3'>
                              {isSelected ? (
                                <CheckCircle className='w-6 h-6 text-amber-600' />
                              ) : (
                                <Circle className='w-6 h-6 text-slate-400 group-hover:text-slate-600' />
                              )}
                            </div>

                            {/* Item Image */}
                            {item.displayImage && (
                              <div className='w-full h-24 mb-3 rounded-xl overflow-hidden bg-slate-100'>
                                <img
                                  src={item.displayImage}
                                  alt={item.displayName}
                                  className='w-full h-full object-cover'
                                />
                              </div>
                            )}

                            {/* Item Details */}
                            <div className='space-y-2'>
                              <h5 className='font-bold text-slate-900 text-sm line-clamp-2'>
                                {item.displayName}
                              </h5>
                              <div className='flex items-center justify-between'>
                                <span className='text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg'>
                                  {item.itemType === 'PsaGradedCard' ? 'PSA' : 
                                   item.itemType === 'RawCard' ? 'Raw' : 'Sealed'}
                                </span>
                                <span className='font-bold text-emerald-600'>
                                  ${item.displayPrice.toFixed(2)}
                                </span>
                              </div>
                              {item.setName && (
                                <p className='text-xs text-slate-500 font-medium truncate'>
                                  {item.setName}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className='flex items-center justify-end space-x-4 pt-6 border-t border-slate-200/50'>
                  <Button
                    type='button'
                    onClick={navigateToAuctions}
                    variant='outline'
                    disabled={auctionLoading || collectionLoading}
                    className='text-slate-600 hover:text-slate-800 border-slate-300 hover:border-slate-400'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={auctionLoading || collectionLoading}
                    className='bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105'
                  >
                    {auctionLoading ? (
                      <LoadingSpinner size='sm' text='Creating...' />
                    ) : (
                      <>
                        <Save className='w-5 h-5 mr-3' />
                        Create Auction
                        {selectedItemIds.size > 0 && (
                          <span className='ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-bold'>
                            {selectedItemIds.size} items
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;