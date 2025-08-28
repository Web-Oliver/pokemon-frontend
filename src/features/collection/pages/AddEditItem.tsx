/**
 * AddEditItem Page Component - Context7 Award-Winning Design
 * Updated to use consistent PageLayout component following CLAUDE.md principles
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

import { Archive, ArrowLeft, Package, Star } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { PokemonPageContainer, PokemonCard } from '../../../shared/components/atoms/design-system';
import GenericLoadingState from '../../../shared/components/molecules/common/GenericLoadingState';
import { useCollectionOperations } from '../../../shared/hooks';
import { handleApiError } from '../../../shared/utils/helpers/errorHandler';
import { log } from '../../../shared/utils/performance/logger';
import { storageWrappers } from '../../../shared/utils/storage';
import { navigationHelper } from '../../../shared/utils/navigation';
import { useCentralizedTheme } from '../../../shared/utils/ui/themeConfig';
import {
  CollectionItem,
  CollectionItemService,
  ItemType,
} from '../services/CollectionItemService';
import { IPsaGradedCard, IRawCard } from '../../../shared/domain/models/card';
// Lazy load form components for better bundle splitting
const AddEditCardForm = React.lazy(
  () => import('../../../shared/components/forms/AddEditCardForm')
);
const AddEditSealedProductForm = React.lazy(
  () => import('../../../shared/components/forms/AddEditSealedProductForm')
);

type ItemTypeOption = 'psa-graded' | 'raw-card' | 'sealed-product' | null;

interface ItemTypeOptionConfig {
  id: ItemTypeOption;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const AddEditItem: React.FC = () => {
  const { loading: _collectionLoading, error: _collectionError } =
    useCollectionOperations();
  const themeConfig = useCentralizedTheme();
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [itemData, setItemData] = useState<CollectionItem | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Parse URL to determine if in edit mode and get item details using thin service layer
  useEffect(() => {
    const handleEditMode = async () => {
      const currentPath = window.location.pathname;

      if (CollectionItemService.isEditMode(currentPath)) {
        const urlParams = CollectionItemService.parseEditUrl(currentPath);
        if (urlParams) {
          setIsEditing(true);
          await fetchItemForEdit(urlParams.type, urlParams.id);
        }
      }
    };

    handleEditMode();
  }, []);

  // Fetch item data for editing using thin service layer
  const fetchItemForEdit = async (urlType: string, id: string) => {
    setFetchLoading(true);
    setFetchError(null);

    try {
      const { item, itemType } = await CollectionItemService.fetchItemForEdit(
        urlType,
        id
      );
      setItemData(item);
      setSelectedItemType(itemType);
      log('Item fetched successfully for editing');
    } catch (error) {
      handleApiError(error, 'Failed to fetch item for editing');
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
  const itemTypes: ItemTypeOptionConfig[] = [
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
    storageWrappers.session.setItem('collectionNeedsRefresh', 'true');

    // Also dispatch event for any already-mounted collection pages
    window.dispatchEvent(new CustomEvent('collectionUpdated'));

    if (isEditing && itemData) {
      // For editing, redirect back to the item detail page
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      if (pathParts.length === 5) {
        const [, , , type, id] = pathParts;
        const itemViewPath = `/collection/${type}/${id}`;
        // Production: Debug statement removed for security
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
          <Suspense
            fallback={
              <GenericLoadingState
                variant="spinner"
                text="Loading PSA Card Form..."
              />
            }
          >
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
          <Suspense
            fallback={
              <GenericLoadingState
                variant="spinner"
                text="Loading Raw Card Form..."
              />
            }
          >
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
          <Suspense
            fallback={
              <GenericLoadingState
                variant="spinner"
                text="Loading Sealed Product Form..."
              />
            }
          >
            <AddEditSealedProductForm
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              isEditing={isEditing}
              initialData={isEditing ? (itemData as any) : undefined}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const pageTitle = isEditing ? 'Edit Collection Item' : 'Add New Item';
  const pageSubtitle = isEditing
    ? 'Update your precious collection item with care'
    : 'Expand your collection with a new treasure';

  const headerActions = (
    <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 px-4 py-2 rounded-2xl shadow-lg">
      <div className="relative">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
      </div>
      <span className="text-sm font-semibold text-green-300">
        Collection Active
      </span>
    </div>
  );

  return (
    <PageLayout>
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <PokemonCard
            variant="glass"
            size="xl"
            className="text-white relative overflow-hidden"
          >
            <div className="relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {pageTitle}
                  </h1>
                  <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                    {pageSubtitle}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {headerActions}
                </div>
              </div>
              
              {/* Error Display */}
              {fetchError && (
                <div className="mt-6 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-400 text-sm font-medium bg-red-900/50 px-3 py-1 rounded-xl border border-red-500/30">
                      Error
                    </div>
                    <span className="text-red-300 font-medium">
                      {fetchError}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </PokemonCard>

          {/* Loading State */}
          {fetchLoading && (
            <PokemonCard variant="glass" size="xl">
              <div className="flex justify-center items-center py-20">
                <GenericLoadingState variant="spinner" size="lg" text="Loading item details..." />
              </div>
            </PokemonCard>
          )}

          {/* Item Type Selection */}
          {!fetchLoading && !fetchError && !selectedItemType && (
            <PokemonCard variant="glass" size="xl" className="relative">
              <div className="relative z-10">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 leading-tight">
                    Choose Your Collection Type
                  </h2>
                  <p className="text-xl text-cyan-100/70 font-medium max-w-2xl mx-auto">
                    Select the type of precious item you want to add to your collection
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {itemTypes.map((itemType, index) => {
                    const Icon = itemType.icon;
                    const gradientClasses = {
                      blue: 'from-cyan-500 to-blue-600',
                      green: 'from-emerald-500 to-teal-600',
                      purple: 'from-purple-500 to-violet-600',
                    };

                    return (
                      <PokemonCard
                        key={itemType.id}
                        variant="glass"
                        size="lg"
                        interactive
                        onClick={() => setSelectedItemType(itemType.id)}
                        className="group text-center transform hover:scale-105 transition-all duration-300"
                      >
                        {/* Icon Container */}
                        <div className="mb-6">
                          <div className="relative mx-auto w-fit">
                            <div
                              className={`w-20 h-20 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} rounded-2xl shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20`}
                            >
                              <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                            {itemType.name}
                          </h3>
                          <p className="text-cyan-100/70 text-base leading-relaxed group-hover:text-cyan-100 transition-colors duration-300 font-medium">
                            {itemType.description}
                          </p>
                        </div>
                      </PokemonCard>
                    );
                  })}
                </div>
              </div>
            </PokemonCard>
          )}

          {/* Selected Form */}
          {!fetchLoading && !fetchError && selectedItemType && (
            <PokemonCard variant="glass" size="xl" className="relative">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center space-x-6">
                    {!isEditing && (
                      <PokemonCard
                        variant="glass"
                        size="sm"
                        interactive
                        onClick={() => setSelectedItemType(null)}
                        className="p-3"
                      >
                        <ArrowLeft className="w-5 h-5 text-cyan-300 hover:text-white transition-colors duration-300" />
                      </PokemonCard>
                    )}

                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                        {itemTypes.find((type) => type.id === selectedItemType)?.name}
                      </h2>
                      <p className="text-lg text-cyan-100/70 font-medium mt-2">
                        {itemTypes.find((type) => type.id === selectedItemType)?.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center space-x-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg"></div>
                      <div className="w-3 h-3 bg-emerald-300 rounded-full shadow-lg"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    </div>
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="text-sm font-semibold text-emerald-300">
                      Step 2 of 3
                    </span>
                  </div>
                </div>

                <div>{renderForm()}</div>
              </div>
            </PokemonCard>
          )}
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default AddEditItem;
