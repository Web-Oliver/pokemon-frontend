/**
 * AddEditItem Page Component - Context7 Award-Winning Design
 *
 * Ultra-premium page for adding collection items with stunning visual hierarchy.
 * Features glass-morphism, premium animations, and Context7 design patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating cards
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Package, Archive } from 'lucide-react';
import AddEditPsaCardForm from '../components/forms/AddEditPsaCardForm';
import AddEditRawCardForm from '../components/forms/AddEditRawCardForm';
import AddEditSealedProductForm from '../components/forms/AddEditSealedProductForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';

type ItemType = 'psa-graded' | 'raw-card' | 'sealed-product' | null;

interface ItemTypeOption {
  id: ItemType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

const AddEditItem: React.FC = () => {
  const { loading: collectionLoading, error: collectionError } = useCollectionOperations();
  const [selectedItemType, setSelectedItemType] = useState<ItemType>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [itemData, setItemData] = useState<CollectionItem | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Parse URL to determine if in edit mode and get item details
  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath.startsWith('/collection/edit/')) {
      const pathParts = currentPath.split('/');
      if (pathParts.length === 5) {
        const [, , , type, id] = pathParts;
        setIsEditing(true);
        fetchItemForEdit(type, id);
      }
    }
  }, []);

  // Fetch item data for editing
  const fetchItemForEdit = async (type: string, id: string) => {
    setFetchLoading(true);
    setFetchError(null);

    try {
      log(`Fetching ${type} item with ID: ${id} for editing`);
      const collectionApi = getCollectionApiService();
      let fetchedItem: CollectionItem;
      let itemType: ItemType;

      switch (type) {
        case 'psa':
          fetchedItem = await collectionApi.getPsaGradedCardById(id);
          itemType = 'psa-graded';
          break;
        case 'raw':
          fetchedItem = await collectionApi.getRawCardById(id);
          itemType = 'raw-card';
          break;
        case 'sealed':
          fetchedItem = await collectionApi.getSealedProductById(id);
          itemType = 'sealed-product';
          break;
        default:
          throw new Error(`Unknown item type: ${type}`);
      }

      setItemData(fetchedItem);
      setSelectedItemType(itemType);
      log('Item fetched successfully for editing');
    } catch (err) {
      handleApiError(err, 'Failed to fetch item for editing');
      setFetchError('Failed to load item for editing');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle navigation back to collection
  const handleBackToCollection = () => {
    window.history.pushState({}, '', '/collection');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Item type options for selection
  const itemTypes: ItemTypeOption[] = [
    {
      id: 'psa-graded',
      name: 'PSA Graded Card',
      description: 'Professional Sports Authenticator graded Pokémon card',
      icon: Star,
      color: 'blue',
    },
    {
      id: 'raw-card',
      name: 'Raw Card',
      description: 'Ungraded Pokémon card in various conditions',
      icon: Package,
      color: 'green',
    },
    {
      id: 'sealed-product',
      name: 'Sealed Product',
      description: 'Booster boxes, ETBs, and other sealed products',
      icon: Archive,
      color: 'purple',
    },
  ];

  // Handle successful form submission
  const handleFormSuccess = () => {
    // Set a flag in sessionStorage to indicate collection needs refresh
    sessionStorage.setItem('collectionNeedsRefresh', 'true');

    // Also dispatch event for any already-mounted collection pages
    window.dispatchEvent(new CustomEvent('collectionUpdated'));

    if (isEditing && itemData) {
      // For editing, redirect back to the item detail page
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      if (pathParts.length === 5) {
        const [, , , type, id] = pathParts;
        const itemViewPath = `/collection/${type}/${id}`;
        console.log('[EDIT SUCCESS] Redirecting to item view:', itemViewPath);
        window.history.pushState({}, '', itemViewPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        // Fallback to collection if path parsing fails
        handleBackToCollection();
      }
    } else {
      // For new items, navigate back to collection
      handleBackToCollection();
    }
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setSelectedItemType(null);
  };

  // Render form based on selected item type
  const renderForm = () => {
    if (!selectedItemType) {
      return null;
    }

    switch (selectedItemType) {
      case 'psa-graded':
        return (
          <AddEditPsaCardForm
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
            isEditing={isEditing}
            initialData={isEditing ? (itemData as IPsaGradedCard) : undefined}
          />
        );
      case 'raw-card':
        return (
          <AddEditRawCardForm
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
            isEditing={isEditing}
            initialData={isEditing ? (itemData as IRawCard) : undefined}
          />
        );
      case 'sealed-product':
        return (
          <AddEditSealedProductForm
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
            isEditing={isEditing}
            initialData={isEditing ? (itemData as ISealedProduct) : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative'>
      {/* Modern Background Pattern */}
      <div className='absolute inset-0 opacity-20'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Modern Header */}
          <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200/30 p-6 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'></div>
            <div className='absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-xl'></div>

            <div className='flex items-center justify-between relative z-10'>
              <div className='flex items-center space-x-4'>
                <button
                  onClick={handleBackToCollection}
                  className='p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group'
                  aria-label='Back to collection'
                >
                  <ArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform duration-200' />
                </button>
                <div>
                  <h1 className='text-2xl font-bold text-slate-900 mb-1'>
                    {isEditing ? 'Edit Item' : 'Add New Item'}
                  </h1>
                  <p className='text-slate-600 text-sm'>
                    {isEditing
                      ? 'Update your collection item details'
                      : 'Add a new item to your collection'}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className='flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-xs font-medium text-green-700'>Active</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {fetchLoading && (
            <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/30 p-8 text-center'>
              <LoadingSpinner size='lg' />
              <p className='mt-4 text-slate-600'>Loading item for editing...</p>
            </div>
          )}

          {/* Error State */}
          {fetchError && (
            <div className='bg-red-50/95 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200/50 p-8'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Archive className='w-6 h-6 text-red-600' />
                </div>
                <h3 className='text-lg font-bold text-red-900 mb-2'>Error Loading Item</h3>
                <p className='text-red-700 mb-4'>{fetchError}</p>
                <button
                  onClick={handleBackToCollection}
                  className='bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors'
                >
                  Back to Collection
                </button>
              </div>
            </div>
          )}

          {/* Modern Item Type Selection */}
          {!fetchLoading && !fetchError && !selectedItemType && (
            <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/30 p-8 relative overflow-hidden'>
              <div className='absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl'></div>

              <div className='mb-8 relative z-10'>
                <h2 className='text-xl font-bold text-slate-900 mb-2'>Select Item Type</h2>
                <p className='text-slate-600 text-sm'>
                  Choose the type of item you want to add to your collection
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10'>
                {itemTypes.map((itemType, index) => {
                  const Icon = itemType.icon;
                  const gradientClasses = {
                    blue: 'from-blue-500 to-indigo-600',
                    green: 'from-emerald-500 to-teal-600',
                    purple: 'from-purple-500 to-violet-600',
                  };

                  const hoverClasses = {
                    blue: 'hover:shadow-blue-500/20',
                    green: 'hover:shadow-emerald-500/20',
                    purple: 'hover:shadow-purple-500/20',
                  };

                  return (
                    <button
                      key={itemType.id}
                      onClick={() => setSelectedItemType(itemType.id)}
                      className={`group relative text-left p-6 bg-white/90 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${hoverClasses[itemType.color as keyof typeof hoverClasses]} border border-slate-200/50 hover:border-blue-300/50 overflow-hidden`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Gradient overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      ></div>

                      {/* Icon container */}
                      <div className='relative z-10 mb-4'>
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} rounded-lg shadow-md flex items-center justify-center group-hover:scale-110 transition-all duration-300`}
                        >
                          <Icon className='w-6 h-6 text-white' />
                        </div>
                      </div>

                      <div className='relative z-10'>
                        <h3 className='text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-300'>
                          {itemType.name}
                        </h3>
                        <p className='text-slate-600 text-sm leading-relaxed group-hover:text-slate-500 transition-colors duration-300'>
                          {itemType.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className='absolute bottom-4 right-4 w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100'>
                        <ArrowLeft className='w-5 h-5 rotate-180' />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modern Selected Form */}
          {!fetchLoading && !fetchError && selectedItemType && (
            <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/30 p-8 relative overflow-hidden'>
              <div className='absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl'></div>

              <div className='flex items-center justify-between mb-8 relative z-10'>
                <div className='flex items-center space-x-4'>
                  {!isEditing && (
                    <button
                      onClick={() => setSelectedItemType(null)}
                      className='p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group'
                      aria-label='Back to item type selection'
                    >
                      <ArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform duration-200' />
                    </button>
                  )}
                  <div>
                    <h2 className='text-xl font-bold text-slate-900 mb-1'>
                      {itemTypes.find(type => type.id === selectedItemType)?.name}
                    </h2>
                    <p className='text-slate-600 text-sm'>
                      {itemTypes.find(type => type.id === selectedItemType)?.description}
                    </p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div className='w-2 h-2 bg-blue-300 rounded-full'></div>
                  <div className='w-2 h-2 bg-slate-300 rounded-full'></div>
                  <span className='text-xs font-medium text-slate-600 ml-2'>Step 2 of 3</span>
                </div>
              </div>

              <div className='relative z-10'>{renderForm()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditItem;
