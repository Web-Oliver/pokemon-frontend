/**
 * Create Auction Page
 * Allows users to create new auctions with required fields and drag-and-drop ordering
 * Following CLAUDE.md layered architecture and Context7 design principles
 */

import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  Gavel,
  Sparkles,
  Package,
  CheckCircle,
  Circle,
  Search,
  Filter,
  X,
  GripVertical,
  Eye,
  Hash,
  TrendingUp,
  Star,
  Grid3X3,
  Users,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import { useCollection } from '../hooks/useCollection';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
// Lazy load ImageSlideshow for better performance
const ImageSlideshow = lazy(() => import('../components/common/ImageSlideshow').then(module => ({
  default: module.ImageSlideshow
})));

// Lazy load VirtualizedItemGrid for large collections
const VirtualizedItemGrid = lazy(() => import('../components/lists/VirtualizedItemGrid'));

// Lazy load PerformanceMonitor for development
const PerformanceMonitor = lazy(() => import('../components/debug/PerformanceMonitor'));
import { log } from '../utils/logger';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { IAuctionItem } from '../domain/models/auction';

// Optimized helper function to process image URLs with memoization
const processImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  // Use regex for more efficient multiple localhost prefix cleanup
  const cleanPath = imagePath.replace(/(http:\/\/localhost:3000)+/g, 'http://localhost:3000');
  
  // If it's already a full URL after cleaning, return as-is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  
  // If it starts with /, it's already a proper absolute path
  if (cleanPath.startsWith('/')) {
    return `http://localhost:3000${cleanPath}`;
  }
  
  // Otherwise, assume it needs to be prefixed with the uploads path
  return `http://localhost:3000/uploads/${cleanPath}`;
};

// Memoized function to avoid recreation on every render
const memoizedProcessImageUrl = (imagePath: string | undefined) => {
  return processImageUrl(imagePath);
};

// Define unified collection item type for display
interface UnifiedCollectionItem {
  id: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  images?: string[];
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  originalItem: IPsaGradedCard | IRawCard | ISealedProduct;
}

const CreateAuction: React.FC = () => {
  const { createAuction, loading: auctionLoading, error, clearError } = useAuction();
  const {
    psaCards,
    rawCards,
    sealedProducts,
    loading: collectionLoading,
    error: collectionError,
  } = useCollection();

  // Form state
  const [formData, setFormData] = useState({
    topText: '',
    bottomText: '',
    auctionDate: '',
    status: 'draft' as 'draft' | 'active' | 'sold' | 'expired',
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Item selection state with separate ordering for each category
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [selectedItemOrderByType, setSelectedItemOrderByType] = useState<{
    PsaGradedCard: string[];
    RawCard: string[];
    SealedProduct: string[];
  }>({
    PsaGradedCard: [],
    RawCard: [],
    SealedProduct: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'PsaGradedCard' | 'RawCard' | 'SealedProduct'
  >('all');
  
  // UI state for improved experience
  const [showPreview, setShowPreview] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  // Sort options for preview lists
  const [sortOptions, setSortOptions] = useState<{
    PsaGradedCard: 'order' | 'price-high' | 'price-low';
    RawCard: 'order' | 'price-high' | 'price-low';
    SealedProduct: 'order' | 'price-high' | 'price-low';
  }>({
    PsaGradedCard: 'order',
    RawCard: 'order',
    SealedProduct: 'order',
  });

  // Optimized combination of collection items with improved memoization
  const allCollectionItems = useMemo((): UnifiedCollectionItem[] => {
    const items: UnifiedCollectionItem[] = [];
    
    // Early return if no data to avoid unnecessary processing
    if (!psaCards.length && !rawCards.length && !sealedProducts.length) {
      return items;
    }

    // Add PSA Graded Cards
    psaCards
      .filter(card => !card.sold)
      .forEach(card => {
        // Based on the console logs, PSA cards have a cardId object that contains populated card details
        // Try cardId populated fields first, then direct fields as fallback
        let cardName = 'Unknown Card';
        let setName = 'Unknown Set';
        let pokemonNumber = '';
        let variety = '';
        
        // Access nested cardId object for card details (populated by backend)
        const cardData = (card as any).cardId || card;
        const setData = cardData?.setId || cardData?.set;
        
        if (cardData?.cardName) {
          cardName = cardData.cardName;
        } else if (cardData?.baseName) {
          cardName = cardData.baseName;
        } else if (cardData?.pokemonNumber) {
          cardName = `Card #${cardData.pokemonNumber}`;
        }
        
        if (setData?.setName) {
          setName = setData.setName;
        } else if (cardData?.setName) {
          setName = cardData.setName;
        }
        
        if (cardData?.variety) {
          variety = cardData.variety;
        }
        
        if (cardData?.pokemonNumber) {
          pokemonNumber = cardData.pokemonNumber;
        }
        
        // Clean and build display name
        let cleanCardName = cardName;
        
        // Remove common redundant prefixes and duplications
        cleanCardName = cleanCardName
          .replace(/^2025\s+/gi, '') // Remove year prefix
          .replace(/Japanese Pokemon Japanese\s+/gi, 'Japanese ') // Remove duplicate "Japanese Pokemon Japanese"
          .replace(/Pokemon Japanese\s+/gi, 'Japanese ') // Remove "Pokemon Japanese"
          .replace(/Japanese\s+Japanese\s+/gi, 'Japanese ') // Remove duplicate "Japanese"
          .replace(/\s+/g, ' ') // Clean up multiple spaces
          .trim();
        
        // Build concise display name
        let displayName = cleanCardName;
        if (variety && !displayName.includes(variety)) {
          displayName = `${displayName} (${variety})`;
        }
        if (pokemonNumber && cleanCardName === 'Unknown Card') {
          displayName = `#${pokemonNumber}`;
        }
        displayName = `${displayName} - PSA ${card.grade}`;
        
        // Process image URLs using the memoized helper function
        const processedImages = (card.images || [])
          .map(memoizedProcessImageUrl)
          .filter(Boolean) as string[];
        
        items.push({
          id: card.id,
          itemType: 'PsaGradedCard',
          displayName: displayName,
          displayPrice: card.myPrice || 0,
          displayImage: processedImages[0],
          images: processedImages,
          setName: setName,
          grade: card.grade,
          originalItem: card,
        });
      });

    // Add Raw Cards
    rawCards
      .filter(card => !card.sold)
      .forEach(card => {
        // Based on the console logs, Raw cards have a cardId object that contains populated card details
        // Try cardId populated fields first, then direct fields as fallback
        let cardName = 'Unknown Card';
        let setName = 'Unknown Set';
        let pokemonNumber = '';
        let variety = '';
        
        // Access nested cardId object for card details (populated by backend)
        const cardData = (card as any).cardId || card;
        const setData = cardData?.setId || cardData?.set;
        
        if (cardData?.cardName) {
          cardName = cardData.cardName;
        } else if (cardData?.baseName) {
          cardName = cardData.baseName;
        } else if (cardData?.pokemonNumber) {
          cardName = `Card #${cardData.pokemonNumber}`;
        }
        
        if (setData?.setName) {
          setName = setData.setName;
        } else if (cardData?.setName) {
          setName = cardData.setName;
        }
        
        if (cardData?.variety) {
          variety = cardData.variety;
        }
        
        if (cardData?.pokemonNumber) {
          pokemonNumber = cardData.pokemonNumber;
        }
        
        // Build full display name
        let displayName = cardName;
        if (variety) {
          displayName = `${cardName} (${variety})`;
        }
        if (pokemonNumber && cardName === 'Unknown Card') {
          displayName = `#${pokemonNumber}`;
        }
        displayName = `${displayName} - ${card.condition}`;
        
        // Process image URLs using the memoized helper function
        const processedImages = (card.images || [])
          .map(memoizedProcessImageUrl)
          .filter(Boolean) as string[];
        
        items.push({
          id: card.id,
          itemType: 'RawCard',
          displayName: displayName,
          displayPrice: card.myPrice || 0,
          displayImage: processedImages[0],
          images: processedImages,
          setName: setName,
          condition: card.condition,
          originalItem: card,
        });
      });

    // Add Sealed Products
    sealedProducts
      .filter(product => !product.sold)
      .forEach(product => {
        const productName = product.name || 'Unknown Product';
        const displayName = product.setName 
          ? `${productName} - ${product.setName}` 
          : productName;

        // Process image URLs using the memoized helper function
        const processedImages = (product.images || [])
          .map(memoizedProcessImageUrl)
          .filter(Boolean) as string[];
          
        items.push({
          id: product.id,
          itemType: 'SealedProduct',
          displayName: displayName,
          displayPrice: product.myPrice || 0,
          displayImage: processedImages[0],
          images: processedImages,
          setName: product.setName || 'Unknown Set',
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
      items = items.filter(
        item =>
          item.displayName.toLowerCase().includes(search) ||
          item.setName?.toLowerCase().includes(search)
      );
    }

    return items;
  }, [allCollectionItems, filterType, searchTerm]);

  // Performance optimization: Use virtualization for large collections
  const VIRTUALIZATION_THRESHOLD = 50;
  const shouldUseVirtualization = filteredItems.length > VIRTUALIZATION_THRESHOLD;

  // Get selected items grouped by type with their orders and sorting
  const selectedItemsByType = useMemo(() => {
    const groups = {
      PsaGradedCard: [] as UnifiedCollectionItem[],
      RawCard: [] as UnifiedCollectionItem[],
      SealedProduct: [] as UnifiedCollectionItem[],
    };
    
    // Get items in order for each category, ensuring no duplicates
    Object.entries(selectedItemOrderByType).forEach(([itemType, orderArray]) => {
      const typedItemType = itemType as keyof typeof groups;
      
      // Remove duplicates from the order array and only include selected items
      const uniqueSelectedIds = [...new Set(orderArray)].filter(id => selectedItemIds.has(id));
      
      let items = uniqueSelectedIds
        .map(itemId => allCollectionItems.find(item => item.id === itemId))
        .filter(Boolean) as UnifiedCollectionItem[];
      
      // Apply sorting based on sort option for this category
      const sortOption = sortOptions[typedItemType];
      if (sortOption === 'price-high') {
        items = items.sort((a, b) => (b.displayPrice || 0) - (a.displayPrice || 0));
      } else if (sortOption === 'price-low') {
        items = items.sort((a, b) => (a.displayPrice || 0) - (b.displayPrice || 0));
      }
      // If sortOption === 'order', keep the original order (no sorting needed)
      
      groups[typedItemType] = items;
    });
    
    return groups;
  }, [selectedItemOrderByType, allCollectionItems, selectedItemIds, sortOptions]);

  // Get all selected items in a flat array (for total calculations)
  const allSelectedItems = useMemo(() => {
    return [
      ...selectedItemsByType.PsaGradedCard,
      ...selectedItemsByType.RawCard,
      ...selectedItemsByType.SealedProduct,
    ];
  }, [selectedItemsByType]);

  // Calculate selected items total value
  const selectedItemsValue = useMemo(() => {
    return allSelectedItems.reduce((total, item) => {
      return total + (item?.displayPrice || 0);
    }, 0);
  }, [allSelectedItems]);

  // Navigation helper
  const navigateToAuctions = () => {
    window.history.pushState({}, '', '/auctions');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle item selection with separate ordering per category
  const toggleItemSelection = useCallback((itemId: string) => {
    const item = allCollectionItems.find(item => item.id === itemId);
    if (!item) return;

    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      const isCurrentlySelected = newSet.has(itemId);
      
      if (isCurrentlySelected) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });

    // Update the order array separately to avoid race conditions
    setSelectedItemOrderByType(prevOrder => {
      const isCurrentlySelected = selectedItemIds.has(itemId);
      
      if (isCurrentlySelected) {
        // Remove from the appropriate category order array
        return {
          ...prevOrder,
          [item.itemType]: prevOrder[item.itemType].filter(id => id !== itemId),
        };
      } else {
        // Add to end of the appropriate category order array only if not already present
        const currentOrder = prevOrder[item.itemType];
        if (!currentOrder.includes(itemId)) {
          return {
            ...prevOrder,
            [item.itemType]: [...currentOrder, itemId],
          };
        }
        return prevOrder;
      }
    });
  }, [allCollectionItems, selectedItemIds]);

  // Select all filtered items
  const selectAllItems = useCallback(() => {
    const newSelection = new Set(selectedItemIds);
    const newOrderItemsByType = { ...selectedItemOrderByType };
    
    filteredItems.forEach(item => {
      if (!newSelection.has(item.id)) {
        newSelection.add(item.id);
        // Only add if not already in the order array
        if (!newOrderItemsByType[item.itemType].includes(item.id)) {
          newOrderItemsByType[item.itemType] = [...newOrderItemsByType[item.itemType], item.id];
        }
      }
    });
    
    setSelectedItemIds(newSelection);
    setSelectedItemOrderByType(newOrderItemsByType);
  }, [selectedItemIds, filteredItems, selectedItemOrderByType]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedItemIds(new Set());
    setSelectedItemOrderByType({
      PsaGradedCard: [],
      RawCard: [],
      SealedProduct: [],
    });
  }, []);

  // Drag and drop functionality for ordering within categories
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string, targetItemType: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedItemData = allCollectionItems.find(item => item.id === draggedItem);
    if (!draggedItemData) return;

    // Only allow reordering within the same category
    if (draggedItemData.itemType !== targetItemType) return;

    setSelectedItemOrderByType(prevOrder => {
      const newOrder = { ...prevOrder };
      const categoryOrder = [...newOrder[draggedItemData.itemType]];
      const draggedIndex = categoryOrder.indexOf(draggedItem);
      const targetIndex = categoryOrder.indexOf(targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Remove dragged item and insert at target position
        categoryOrder.splice(draggedIndex, 1);
        categoryOrder.splice(targetIndex, 0, draggedItem);
        newOrder[draggedItemData.itemType] = categoryOrder;
      }
      
      return newOrder;
    });
    
    setDraggedItem(null);
  }, [draggedItem, allCollectionItems]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  // Handle form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    const errors: { [key: string]: string } = {};

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

      // Prepare selected items for auction (preserving category order)
      const auctionItems: IAuctionItem[] = [
        ...selectedItemsByType.PsaGradedCard.map(item => ({
          itemId: item.id,
          itemCategory: item.itemType,
          sold: false,
        })),
        ...selectedItemsByType.RawCard.map(item => ({
          itemId: item.id,
          itemCategory: item.itemType,
          sold: false,
        })),
        ...selectedItemsByType.SealedProduct.map(item => ({
          itemId: item.id,
          itemCategory: item.itemType,
          sold: false,
        })),
      ];

      // Prepare auction data
      const auctionData = {
        topText: formData.topText.trim(),
        bottomText: formData.bottomText.trim(),
        status: formData.status,
        items: auctionItems,
        totalValue: selectedItemsValue,
        ...(formData.auctionDate && { auctionDate: formData.auctionDate }),
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
                    <p className='mt-2 text-sm text-red-600 font-medium'>
                      {validationErrors.topText}
                    </p>
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
                    <p className='mt-2 text-sm text-red-600 font-medium'>
                      {validationErrors.bottomText}
                    </p>
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
                    <p className='mt-2 text-sm text-red-600 font-medium'>
                      {validationErrors.auctionDate}
                    </p>
                  )}
                  <p className='mt-2 text-sm text-slate-500 font-medium'>
                    Leave empty to set the date later. You can add items to the auction after
                    creation.
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
                <div className='space-y-8'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-slate-900 tracking-wide flex items-center'>
                      <div className='w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-3'>
                        <Package className='w-4 h-4 text-white' />
                      </div>
                      Select Items for Auction
                    </h3>
                    <div className='flex items-center space-x-3'>
                      <div className='flex items-center space-x-2 text-sm font-medium text-slate-600'>
                        <Hash className='w-4 h-4' />
                        <span>{selectedItemIds.size} selected</span>
                        {selectedItemIds.size > 0 && (
                          <>
                            <TrendingUp className='w-4 h-4 text-emerald-600' />
                            <span className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 font-bold'>
                              {selectedItemsValue.toLocaleString()} kr.
                            </span>
                          </>
                        )}
                      </div>
                      {selectedItemIds.size > 0 && (
                        <Button
                          type='button'
                          onClick={() => setShowPreview(!showPreview)}
                          variant='outline'
                          size='sm'
                          className={`flex items-center space-x-2 transition-all duration-200 ${
                            showPreview 
                              ? 'bg-amber-50 border-amber-300 text-amber-700' 
                              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Eye className='w-4 h-4' />
                          <span>{showPreview ? 'Hide Preview' : 'Preview Selection'}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Selection Preview Panel */}
                  {showPreview && selectedItemIds.size > 0 && (
                    <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-lg'>
                      <div className='flex items-center justify-between mb-6'>
                        <h4 className='text-lg font-bold text-amber-900 flex items-center'>
                          <Star className='w-5 h-5 mr-2' />
                          Auction Preview ({allSelectedItems.length} items)
                        </h4>
                        <div className='flex items-center space-x-4 text-sm'>
                          <div className='flex items-center space-x-2'>
                            <Grid3X3 className='w-4 h-4 text-teal-600' />
                            <span className='font-medium text-slate-700'>PSA: {selectedItemsByType.PsaGradedCard.length}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Package className='w-4 h-4 text-blue-600' />
                            <span className='font-medium text-slate-700'>Raw: {selectedItemsByType.RawCard.length}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Users className='w-4 h-4 text-purple-600' />
                            <span className='font-medium text-slate-700'>Sealed: {selectedItemsByType.SealedProduct.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Separate Drag-and-Drop Lists for Each Category */}
                      <div className='space-y-6'>
                        <div className='flex items-center space-x-2 text-xs font-medium text-amber-700 mb-4'>
                          <ArrowUpDown className='w-4 h-4' />
                          <span>Drag to reorder manually or use the sort dropdowns to organize by price</span>
                        </div>
                        
                        {/* PSA Graded Cards Section */}
                        {selectedItemsByType.PsaGradedCard.length > 0 && (
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <h5 className='text-sm font-bold text-teal-800 flex items-center'>
                                <Grid3X3 className='w-4 h-4 mr-2' />
                                PSA Graded Cards ({selectedItemsByType.PsaGradedCard.length})
                              </h5>
                              <select
                                value={sortOptions.PsaGradedCard}
                                onChange={(e) => setSortOptions(prev => ({
                                  ...prev,
                                  PsaGradedCard: e.target.value as 'order' | 'price-high' | 'price-low'
                                }))}
                                className='text-xs px-2 py-1 bg-white border border-teal-300 rounded-lg text-teal-700 font-medium'
                              >
                                <option value='order'>Manual Order</option>
                                <option value='price-high'>Price: High to Low</option>
                                <option value='price-low'>Price: Low to High</option>
                              </select>
                            </div>
                            <div className='grid gap-2'>
                              {selectedItemsByType.PsaGradedCard.map((item, index) => (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, item.id, 'PsaGradedCard')}
                                  onDragEnd={handleDragEnd}
                                  className={`group flex items-center space-x-4 p-3 bg-white/80 rounded-xl border-2 transition-all duration-200 cursor-move hover:shadow-md ${
                                    draggedItem === item.id 
                                      ? 'border-teal-400 shadow-lg scale-105 bg-teal-50' 
                                      : 'border-teal-200 hover:border-teal-300'
                                  }`}
                                >
                                  <div className='flex items-center space-x-3'>
                                    <GripVertical className='w-4 h-4 text-slate-400 group-hover:text-teal-600' />
                                    <div className='w-6 h-6 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center font-bold text-teal-700 text-xs'>
                                      {index + 1}
                                    </div>
                                  </div>
                                  
                                  <div className='flex-1 flex items-center space-x-3'>
                                    <div className='w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden'>
                                      {item.displayImage ? (
                                        <img 
                                          src={item.displayImage} 
                                          alt={item.displayName}
                                          className='w-full h-full object-cover'
                                          loading="lazy"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <Package className={`w-5 h-5 text-slate-400 ${item.displayImage ? 'hidden' : ''}`} />
                                    </div>
                                    
                                    <div className='flex-1 min-w-0'>
                                      <p className='font-semibold text-slate-900 truncate text-sm'>{item.displayName}</p>
                                      <p className='text-xs text-slate-500 truncate'>{item.setName}</p>
                                    </div>
                                    
                                    <div className='text-right'>
                                      <p className='font-bold text-emerald-600 text-sm'>{item.displayPrice.toLocaleString()} kr.</p>
                                    </div>
                                    
                                    <Button
                                      type='button'
                                      onClick={() => toggleItemSelection(item.id)}
                                      variant='outline'
                                      size='sm'
                                      className='text-red-600 border-red-300 hover:bg-red-50'
                                    >
                                      <X className='w-3 h-3' />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Raw Cards Section */}
                        {selectedItemsByType.RawCard.length > 0 && (
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <h5 className='text-sm font-bold text-blue-800 flex items-center'>
                                <Package className='w-4 h-4 mr-2' />
                                Raw Cards ({selectedItemsByType.RawCard.length})
                              </h5>
                              <select
                                value={sortOptions.RawCard}
                                onChange={(e) => setSortOptions(prev => ({
                                  ...prev,
                                  RawCard: e.target.value as 'order' | 'price-high' | 'price-low'
                                }))}
                                className='text-xs px-2 py-1 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium'
                              >
                                <option value='order'>Manual Order</option>
                                <option value='price-high'>Price: High to Low</option>
                                <option value='price-low'>Price: Low to High</option>
                              </select>
                            </div>
                            <div className='grid gap-2'>
                              {selectedItemsByType.RawCard.map((item, index) => (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, item.id, 'RawCard')}
                                  onDragEnd={handleDragEnd}
                                  className={`group flex items-center space-x-4 p-3 bg-white/80 rounded-xl border-2 transition-all duration-200 cursor-move hover:shadow-md ${
                                    draggedItem === item.id 
                                      ? 'border-blue-400 shadow-lg scale-105 bg-blue-50' 
                                      : 'border-blue-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div className='flex items-center space-x-3'>
                                    <GripVertical className='w-4 h-4 text-slate-400 group-hover:text-blue-600' />
                                    <div className='w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center font-bold text-blue-700 text-xs'>
                                      {index + 1}
                                    </div>
                                  </div>
                                  
                                  <div className='flex-1 flex items-center space-x-3'>
                                    <div className='w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden'>
                                      {item.displayImage ? (
                                        <img 
                                          src={item.displayImage} 
                                          alt={item.displayName}
                                          className='w-full h-full object-cover'
                                          loading="lazy"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <Package className={`w-5 h-5 text-slate-400 ${item.displayImage ? 'hidden' : ''}`} />
                                    </div>
                                    
                                    <div className='flex-1 min-w-0'>
                                      <p className='font-semibold text-slate-900 truncate text-sm'>{item.displayName}</p>
                                      <p className='text-xs text-slate-500 truncate'>{item.setName}</p>
                                    </div>
                                    
                                    <div className='text-right'>
                                      <p className='font-bold text-emerald-600 text-sm'>{item.displayPrice.toLocaleString()} kr.</p>
                                    </div>
                                    
                                    <Button
                                      type='button'
                                      onClick={() => toggleItemSelection(item.id)}
                                      variant='outline'
                                      size='sm'
                                      className='text-red-600 border-red-300 hover:bg-red-50'
                                    >
                                      <X className='w-3 h-3' />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sealed Products Section */}
                        {selectedItemsByType.SealedProduct.length > 0 && (
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <h5 className='text-sm font-bold text-purple-800 flex items-center'>
                                <Users className='w-4 h-4 mr-2' />
                                Sealed Products ({selectedItemsByType.SealedProduct.length})
                              </h5>
                              <select
                                value={sortOptions.SealedProduct}
                                onChange={(e) => setSortOptions(prev => ({
                                  ...prev,
                                  SealedProduct: e.target.value as 'order' | 'price-high' | 'price-low'
                                }))}
                                className='text-xs px-2 py-1 bg-white border border-purple-300 rounded-lg text-purple-700 font-medium'
                              >
                                <option value='order'>Manual Order</option>
                                <option value='price-high'>Price: High to Low</option>
                                <option value='price-low'>Price: Low to High</option>
                              </select>
                            </div>
                            <div className='grid gap-2'>
                              {selectedItemsByType.SealedProduct.map((item, index) => (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, item.id, 'SealedProduct')}
                                  onDragEnd={handleDragEnd}
                                  className={`group flex items-center space-x-4 p-3 bg-white/80 rounded-xl border-2 transition-all duration-200 cursor-move hover:shadow-md ${
                                    draggedItem === item.id 
                                      ? 'border-purple-400 shadow-lg scale-105 bg-purple-50' 
                                      : 'border-purple-200 hover:border-purple-300'
                                  }`}
                                >
                                  <div className='flex items-center space-x-3'>
                                    <GripVertical className='w-4 h-4 text-slate-400 group-hover:text-purple-600' />
                                    <div className='w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center font-bold text-purple-700 text-xs'>
                                      {index + 1}
                                    </div>
                                  </div>
                                  
                                  <div className='flex-1 flex items-center space-x-3'>
                                    <div className='w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden'>
                                      {item.displayImage ? (
                                        <img 
                                          src={item.displayImage} 
                                          alt={item.displayName}
                                          className='w-full h-full object-cover'
                                          loading="lazy"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <Package className={`w-5 h-5 text-slate-400 ${item.displayImage ? 'hidden' : ''}`} />
                                    </div>
                                    
                                    <div className='flex-1 min-w-0'>
                                      <p className='font-semibold text-slate-900 truncate text-sm'>{item.displayName}</p>
                                      <p className='text-xs text-slate-500 truncate'>{item.setName}</p>
                                    </div>
                                    
                                    <div className='text-right'>
                                      <p className='font-bold text-emerald-600 text-sm'>{item.displayPrice.toLocaleString()} kr.</p>
                                    </div>
                                    
                                    <Button
                                      type='button'
                                      onClick={() => toggleItemSelection(item.id)}
                                      variant='outline'
                                      size='sm'
                                      className='text-red-600 border-red-300 hover:bg-red-50'
                                    >
                                      <X className='w-3 h-3' />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className='mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200'>
                          <div className='flex items-center justify-between'>
                            <span className='font-semibold text-emerald-800'>Total Auction Value</span>
                            <span className='text-xl font-bold text-emerald-600'>
                              {selectedItemsValue.toLocaleString()} kr.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search and Filter Controls */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
                      <input
                        type='text'
                        placeholder='Search items...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200'
                      />
                    </div>
                    <div className='relative'>
                      <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
                      <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value as any)}
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
                    <div className='space-y-4'>
                      {/* Quick selection summary */}
                      {selectedItemIds.size > 0 && !showPreview && (
                        <div className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div className='flex items-center space-x-2 text-sm font-medium'>
                                <CheckCircle className='w-4 h-4 text-amber-600' />
                                <span className='text-amber-800'>{selectedItemIds.size} items selected</span>
                              </div>
                              <span className='text-emerald-700 font-bold'>
                                {selectedItemsValue.toLocaleString()} kr. total
                              </span>
                            </div>
                            <Button
                              type='button'
                              onClick={() => setShowPreview(true)}
                              variant='outline'
                              size='sm'
                              className='text-amber-700 border-amber-300 hover:bg-amber-100'
                            >
                              <Eye className='w-4 h-4 mr-2' />
                              View & Order
                              <ChevronRight className='w-4 h-4 ml-1' />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Conditional Rendering: Virtualized Grid for Large Collections */}
                      {shouldUseVirtualization ? (
                        <div className='rounded-2xl bg-slate-50/50 p-4 overflow-hidden'>
                          <div className='mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200'>
                            <p className='text-sm text-blue-700 font-medium'>
                              ⚡ Performance mode: Large collection detected. Using optimized virtual scrolling.
                            </p>
                          </div>
                          <div className='flex justify-center w-full'>
                            <Suspense fallback={
                              <div className='py-12 text-center'>
                                <LoadingSpinner text='Loading optimized view...' />
                              </div>
                            }>
                              <VirtualizedItemGrid
                                items={filteredItems}
                                selectedItemIds={selectedItemIds}
                                onToggleSelection={toggleItemSelection}
                                containerHeight={600}
                                columns={3}
                                itemWidth={280}
                              />
                            </Suspense>
                          </div>
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl bg-slate-50/50 p-4'>
                          {filteredItems.map(item => {
                            const isSelected = selectedItemIds.has(item.id);
                            const selectionOrder = selectedItemOrderByType[item.itemType].indexOf(item.id) + 1;
                            
                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleItemSelection(item.id)}
                                className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col h-full hover:scale-102 ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-50/80 shadow-lg transform scale-105'
                                    : 'border-slate-200 bg-white/80 hover:border-amber-300 hover:shadow-md'
                                }`}
                              >
                                {/* Selection Indicator with Order Number */}
                                <div className='absolute top-3 right-3 z-10'>
                                  {isSelected ? (
                                    <div className='relative'>
                                      <CheckCircle className='w-6 h-6 text-amber-600' />
                                      <div className='absolute -top-2 -right-2 w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                                        {selectionOrder}
                                      </div>
                                    </div>
                                  ) : (
                                    <Circle className='w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors' />
                                  )}
                                </div>

                                {/* Item Type Badge */}
                                <div className='absolute top-3 left-3 z-10'>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                    item.itemType === 'PsaGradedCard'
                                      ? 'bg-teal-100 text-teal-700 border border-teal-200'
                                      : item.itemType === 'RawCard'
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                                  }`}>
                                    {item.itemType === 'PsaGradedCard'
                                      ? `PSA ${item.grade}`
                                      : item.itemType === 'RawCard'
                                      ? item.condition
                                      : 'Sealed'}
                                  </span>
                                </div>

                                {/* Optimized Item Image Slideshow with Suspense */}
                                <div className='w-full mb-3 mt-8'>
                                  <Suspense fallback={
                                    <div className='w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center'>
                                      <Package className='w-8 h-8 text-slate-400' />
                                    </div>
                                  }>
                                    <ImageSlideshow
                                      images={item.displayImage ? [item.displayImage] : []}
                                      fallbackIcon={<Package className='w-6 h-6 text-slate-400' />}
                                      autoplay={false}
                                      autoplayDelay={3000}
                                      className='w-full h-48'
                                      showThumbnails={false}
                                      adaptiveLayout={false}
                                      enableAspectRatioDetection={false}
                                    />
                                  </Suspense>
                                </div>

                                {/* Item Details */}
                                <div className='flex flex-col flex-1 space-y-2'>
                                  <div className='flex-1'>
                                    <h5 className='font-bold text-slate-900 text-sm line-clamp-2 mb-2'>
                                      {item.displayName}
                                    </h5>
                                    {item.setName && (
                                      <p className='text-xs text-slate-500 font-medium truncate mb-2'>
                                        {item.setName}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Price - Always at bottom */}
                                  <div className='flex items-center justify-between mt-auto pt-2 border-t border-slate-100'>
                                    <span className='text-xs font-medium text-slate-600'>
                                      Price
                                    </span>
                                    <span className='font-bold text-emerald-600 text-lg'>
                                      {item.displayPrice.toLocaleString()} kr.
                                    </span>
                                  </div>
                                </div>

                                {/* Selection Overlay Effect */}
                                {isSelected && (
                                  <div className='absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-2xl pointer-events-none'></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className='flex items-center justify-between pt-8 border-t border-slate-200/50'>
                  {/* Left side - Summary */}
                  <div className='flex items-center space-x-4'>
                    {selectedItemIds.size > 0 && (
                      <div className='bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-xl border border-emerald-200'>
                        <div className='flex items-center space-x-3 text-sm font-medium'>
                          <CheckCircle className='w-4 h-4 text-emerald-600' />
                          <span className='text-emerald-800'>
                            {selectedItemIds.size} item{selectedItemIds.size !== 1 ? 's' : ''} ready
                          </span>
                          <div className='w-px h-4 bg-emerald-300'></div>
                          <TrendingUp className='w-4 h-4 text-emerald-600' />
                          <span className='text-emerald-800 font-bold'>
                            {selectedItemsValue.toLocaleString()} kr. total
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side - Actions */}
                  <div className='flex items-center space-x-4'>
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
                            <span className='ml-2 px-3 py-1 bg-white/20 rounded-lg text-xs font-bold flex items-center space-x-1'>
                              <Hash className='w-3 h-3' />
                              <span>{selectedItemIds.size}</span>
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Monitor for Development */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <PerformanceMonitor 
            componentName="CreateAuction"
            collectionSize={allCollectionItems.length}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CreateAuction;
