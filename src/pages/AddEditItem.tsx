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
 * - Unified theme system integration
 */

import { Archive, Package, Star } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UnifiedHeader, SectionContainer } from '../components/common';
// Lazy load form components for better bundle splitting
const AddEditCardForm = React.lazy(() => import('../components/forms/AddEditCardForm'));
const AddEditSealedProductForm = React.lazy(() => import('../components/forms/AddEditSealedProductForm'));
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { navigationHelper } from '../utils/navigation';
import { useCentralizedTheme } from '../utils/themeConfig';

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
  const { loading: _collectionLoading, error: _collectionError } =
    useCollectionOperations();
  const themeConfig = useCentralizedTheme();
  const [selectedItemType, setSelectedItemType] = useState<ItemType>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [itemData, setItemData] = useState<CollectionItem | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Parse URL to determine if in edit mode and get item details
  useEffect(() => {
    const handleEditMode = async () => {
      const currentPath = window.location.pathname;

      if (currentPath.startsWith('/collection/edit/')) {
        const pathParts = currentPath.split('/');
        if (pathParts.length === 5) {
          const [, , , type, id] = pathParts;
          setIsEditing(true);
          await fetchItemForEdit(type, id);
        }
      }
    };

    handleEditMode();
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
        default: {
          const errorMessage = `Unknown item type: ${type}`;
          setFetchError(errorMessage);
          return;
        }
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
    navigationHelper.navigateToCollection();
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
        navigationHelper.navigateTo(itemViewPath);
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
          <Suspense fallback={<LoadingSpinner text="Loading PSA Card Form..." />}>
            <AddEditCardForm
              cardType="psa-graded"
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              isEditing={isEditing}
              initialData={isEditing ? (itemData as IPsaGradedCard) : undefined}
            />
          </Suspense>
        );
      case 'raw-card':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading Raw Card Form..." />}>
            <AddEditCardForm
              cardType="raw-card"
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              isEditing={isEditing}
              initialData={isEditing ? (itemData as IRawCard) : undefined}
            />
          </Suspense>
        );
      case 'sealed-product':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading Sealed Product Form..." />}>
            <AddEditSealedProductForm
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              isEditing={isEditing}
              initialData={isEditing ? (itemData as ISealedProduct) : undefined}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden theme-${themeConfig.visualTheme}`}
    >
      {/* Unified background handled by theme system */}

      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UnifiedHeader
            icon={isEditing ? Package : Star}
            title={isEditing ? 'Edit Collection Item' : 'Add New Item'}
            subtitle={isEditing ? 'Update your precious collection item with care' : 'Expand your collection with a new treasure'}
            variant="glassmorphism"
            size="lg"
            showBackButton={true}
            onBack={handleBackToCollection}
            className="mb-12"
            actions={[
              {
                label: 'Collection Active',
                variant: 'success',
                icon: () => (
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )
              }
            ]}
          />

          {/* Loading State */}
          {fetchLoading && (
            <SectionContainer 
              variant="glassmorphism" 
              size="lg" 
              className="text-center"
            >
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-[var(--theme-text-muted)]">
                Loading item for editing...
              </p>
            </SectionContainer>
          )}

          {/* Error State */}
          {fetchError && (
            <SectionContainer 
              title="Error Loading Item"
              subtitle={fetchError}
              variant="glassmorphism" 
              size="lg"
              className="text-center"
              actions={[
                {
                  label: 'Back to Collection',
                  variant: 'danger',
                  onClick: handleBackToCollection
                }
              ]}
            >
              <div className="text-center">
                <Archive className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-[var(--theme-text-muted)]">Unable to load the item for editing</p>
              </div>
            </SectionContainer>
          )}

          {/* Item Type Selection */}
          {!fetchLoading && !fetchError && !selectedItemType && (
            <SectionContainer 
              title="Choose Your Collection Type"
              subtitle="Select the type of precious item you want to add to your collection"
              variant="glassmorphism" 
              size="lg"
              className="text-center"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {itemTypes.map((itemType) => {
                  const Icon = itemType.icon as any;
                  const colorVariants = {
                    blue: 'product',
                    green: 'elevated', 
                    purple: 'cosmic'
                  } as const;

                  return (
                    <SectionContainer
                      key={itemType.id}
                      title={itemType.name}
                      subtitle={itemType.description}
                      icon={Icon}
                      variant={colorVariants[itemType.color as keyof typeof colorVariants] || 'default'}
                      size="md"
                      clickable={true}
                      onClick={() => setSelectedItemType(itemType.id)}
                      className="transform hover:scale-105 transition-all duration-300"
                    />
                  );
                })}
              </div>
            </SectionContainer>
          )}

          {/* Selected Form */}
          {!fetchLoading && !fetchError && selectedItemType && (
            <SectionContainer 
              title={itemTypes.find((type) => type.id === selectedItemType)?.name || ''}
              subtitle={itemTypes.find((type) => type.id === selectedItemType)?.description || ''}
              variant="glassmorphism" 
              size="lg"
              showBackButton={!isEditing}
              onBack={() => setSelectedItemType(null)}
              actions={[
                {
                  label: 'Step 2 of 3',
                  variant: 'success',
                  icon: () => (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg"></div>
                      <div className="w-3 h-3 bg-emerald-300 rounded-full shadow-lg"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    </div>
                  )
                }
              ]}
            >
              {renderForm()}
            </SectionContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditItem;
