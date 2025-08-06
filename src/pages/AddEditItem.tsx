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

import { Archive, ArrowLeft, Package, Star } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GlassmorphismHeader from '../components/common/GlassmorphismHeader';
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
      {/* Context7 Award-Winning Background - Theme Aware */}
      <div className="absolute inset-0 bg-[var(--theme-bg-primary)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(16,185,129,0.05),transparent_60%)]"></div>

      {/* Premium Particle Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.04'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='80' cy='30' r='0.8'/%3E%3Ccircle cx='30' cy='80' r='1.2'/%3E%3Ccircle cx='70' cy='70' r='0.9'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GlassmorphismHeader
            icon={isEditing ? Package : Star}
            title={isEditing ? 'Edit Collection Item' : 'Add New Item'}
            description={isEditing ? 'Update your precious collection item with care' : 'Expand your collection with a new treasure'}
            className="mb-12"
          >
            <button
              onClick={handleBackToCollection}
              className="group relative overflow-hidden p-3 rounded-2xl glass-bg backdrop-blur-xl border border-[var(--border-glass-medium)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] shadow-lg hover:shadow-xl transition-all duration-[var(--animation-duration-normal)] transform hover:scale-105"
              aria-label="Back to collection"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ArrowLeft className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 px-4 py-2 rounded-2xl shadow-lg">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm font-semibold text-green-300">
                Collection Active
              </span>
            </div>
          </GlassmorphismHeader>

          {/* Loading State */}
          {fetchLoading && (
            <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--theme-border)] p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-[var(--theme-text-muted)]">
                Loading item for editing...
              </p>
            </div>
          )}

          {/* Error State */}
          {fetchError && (
            <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--theme-border)] p-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-2">
                  Error Loading Item
                </h3>
                <p className="text-[var(--theme-text-muted)] mb-4">
                  {fetchError}
                </p>
                <button
                  onClick={handleBackToCollection}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Back to Collection
                </button>
              </div>
            </div>
          )}

          {/* Context7 Award-Winning Item Type Selection */}
          {!fetchLoading && !fetchError && !selectedItemType && (
            <div className="relative">
              {/* Background Glass Effects */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[3rem] blur-2xl opacity-60"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400/5 via-purple-400/5 to-pink-400/5 rounded-[2.5rem] blur-xl"></div>

              <div className="relative glass-bg backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-[var(--border-glass-medium)] p-12 ring-1 ring-[var(--border-glass-subtle)] overflow-hidden">
                {/* Floating Orbs */}
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div
                  className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-2xl animate-pulse"
                  style={{ animationDelay: '1.5s' }}
                ></div>

                <div className="mb-12 relative z-10 text-center">
                  <h2 className="text-3xl font-bold text-gradient-primary mb-4 leading-tight">
                    Choose Your Collection Type
                  </h2>
                  <p className="text-xl text-[var(--theme-text-muted)] font-medium max-w-2xl mx-auto">
                    Select the type of precious item you want to add to your
                    collection
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  {itemTypes.map((itemType, index) => {
                    const Icon = itemType.icon;
                    const gradientClasses = {
                      blue: 'from-cyan-500 to-blue-600',
                      green: 'from-emerald-500 to-teal-600',
                      purple: 'from-purple-500 to-violet-600',
                    };

                    const shadowClasses = {
                      blue: 'hover:shadow-cyan-500/25',
                      green: 'hover:shadow-emerald-500/25',
                      purple: 'hover:shadow-purple-500/25',
                    };

                    const glowClasses = {
                      blue: 'hover:ring-cyan-500/30',
                      green: 'hover:ring-emerald-500/30',
                      purple: 'hover:ring-purple-500/30',
                    };

                    return (
                      <button
                        key={itemType.id}
                        onClick={() => setSelectedItemType(itemType.id)}
                        className={`group relative text-center p-8 glass-bg backdrop-blur-2xl rounded-3xl transition-all duration-[var(--animation-duration-slow)] hover:scale-105 hover:shadow-2xl ${shadowClasses[itemType.color as keyof typeof shadowClasses]} border border-[var(--border-glass-medium)] ring-1 ring-[var(--border-glass-subtle)] hover:ring-2 ${glowClasses[itemType.color as keyof typeof glowClasses]} overflow-hidden transform hover:-translate-y-2`}
                        style={{
                          animationDelay: `${index * 200}ms`,
                          animation: 'fadeInUp 0.8s ease-out forwards',
                        }}
                      >
                        {/* Premium Gradient Overlay */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} opacity-0 group-hover:opacity-10 transition-all duration-500`}
                        ></div>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                        {/* Icon Container with Multiple Layers */}
                        <div className="relative z-10 mb-6">
                          <div className="relative mx-auto w-fit">
                            {/* Outer Glow Ring */}
                            <div
                              className={`absolute -inset-4 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500`}
                            ></div>
                            {/* Inner Glow Ring */}
                            <div
                              className={`absolute -inset-2 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} rounded-full blur-md opacity-20 group-hover:opacity-50 transition-all duration-500`}
                            ></div>
                            {/* Main Icon Container */}
                            <div
                              className={`relative w-20 h-20 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} rounded-2xl shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20`}
                            >
                              <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-4 group-hover:text-[var(--theme-text-primary)] transition-colors duration-[var(--animation-duration-normal)]">
                            {itemType.name}
                          </h3>
                          <p className="text-[var(--theme-text-muted)] text-base leading-relaxed group-hover:text-[var(--theme-text-secondary)] transition-colors duration-[var(--animation-duration-normal)] font-medium">
                            {itemType.description}
                          </p>
                        </div>

                        {/* Premium Arrow Indicator */}
                        <div className="absolute bottom-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-glass-primary)] backdrop-blur-xl border border-[var(--border-glass-medium)] text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] group-hover:bg-[var(--bg-glass-secondary)] group-hover:translate-x-1 group-hover:scale-110 transition-all duration-[var(--animation-duration-normal)] opacity-0 group-hover:opacity-100">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>

                        {/* Bottom Glow Line */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses[itemType.color as keyof typeof gradientClasses]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                        ></div>
                      </button>
                    );
                  })}
                </div>

                {/* Breathing Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
              </div>
            </div>
          )}

          {/* Context7 Award-Winning Selected Form */}
          {!fetchLoading && !fetchError && selectedItemType && (
            <div className="relative">
              {/* Background Glass Effects */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-[3rem] blur-2xl opacity-60"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/5 via-teal-400/5 to-cyan-400/5 rounded-[2.5rem] blur-xl"></div>

              <div className="relative glass-bg backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-[var(--border-glass-medium)] p-12 ring-1 ring-[var(--border-glass-subtle)] overflow-hidden">
                {/* Floating Orbs */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div
                  className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse"
                  style={{ animationDelay: '2s' }}
                ></div>

                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center space-x-6">
                    {!isEditing && (
                      <button
                        onClick={() => setSelectedItemType(null)}
                        className="group relative overflow-hidden p-3 rounded-2xl glass-bg backdrop-blur-xl border border-[var(--border-glass-medium)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] shadow-lg hover:shadow-xl transition-all duration-[var(--animation-duration-normal)] transform hover:scale-105"
                        aria-label="Back to item type selection"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <ArrowLeft className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      </button>
                    )}

                    <div>
                      <h2 className="text-3xl font-bold text-gradient-primary leading-tight">
                        {
                          itemTypes.find((type) => type.id === selectedItemType)
                            ?.name
                        }
                      </h2>
                      <p className="text-lg text-[var(--theme-text-muted)] font-medium mt-2">
                        {
                          itemTypes.find((type) => type.id === selectedItemType)
                            ?.description
                        }
                      </p>
                    </div>
                  </div>

                  {/* Premium Progress Indicator */}
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

                <div className="relative z-10">{renderForm()}</div>

                {/* Breathing Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditItem;
