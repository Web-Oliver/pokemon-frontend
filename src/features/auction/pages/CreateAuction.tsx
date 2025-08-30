/**
 * Create Auction Page - Context7 2025 Award-Winning Futuristic Design
 *
 * Breathtaking glassmorphism & neumorphism auction creation with stunning animations.
 * Features ultra-modern form design, neural-network interactions, and immersive visualization.
 *
 * Following CLAUDE.md + Context7 2025 principles:
 * - Award-winning futuristic glassmorphism design with neural micro-interactions
 * - Advanced neumorphism with floating holographic cards and depth layers
 * - Cyberpunk gradients and holographic color palettes with RGB shifting
 * - Context7 2025 futuristic design system compliance
 * - Quantum animations, particle effects, and neural hover transformations
 * - Neo-brutalist elements mixed with soft glassmorphism
 * - Refactored to use proper form components following SOLID and DRY principles
 * - Following CLAUDE.md layered architecture and Context7 design patterns
 *
 * THEME INTEGRATION (Phase 2.2.6 Complete):
 * - Preserves Context7 2025 futuristic system as specialized variant
 * - Uses shared effect utilities (ParticleSystem, NeuralNetworkBackground)
 * - Theme-compatible: Respects glassmorphism intensity and particle effect settings
 * - Specialized patterns documented for potential reuse across components
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gavel } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '@/shared/components/layout/layouts/PageLayout';
import { PokemonPageContainer, PokemonCard } from '@/shared/components/atoms/design-system';
import UnifiedHeader from '@/shared/components/molecules/common/UnifiedHeader';
import { IAuctionItem } from '@/shared/domain/models/auction';
import { useAuction } from '@/shared/hooks/useAuction';
import { useAuctionFormAdapter } from '@/shared/hooks/form/useFormState';
import { log } from '@/shared/utils/performance/logger';
import AuctionFormContainer from '@/shared/components/forms/containers/AuctionFormContainer';
import AuctionItemSelectionSection from '@/shared/components/forms/sections/AuctionItemSelectionSection';
import {
  NeuralNetworkBackground,
  ParticleSystem,
} from '@/shared/components/organisms/effects';
import {
  AuctionDataService,
  UnifiedCollectionItem,
} from '@/shared/services/AuctionDataService';
import { navigationHelper } from '@/shared/utils/navigation';

// Form data interface
interface AuctionFormData {
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
}

// Form data interface

const CreateAuction: React.FC = () => {
  const {
    createAuction,
    loading: auctionLoading,
    error: _error,
    clearError,
  } = useAuction();

  // Collection items state (using thin service layer)
  const [allCollectionItems, setAllCollectionItems] = useState<
    UnifiedCollectionItem[]
  >([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format for default auction date
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize form using our consolidated form state with react-hook-form adapter
  const formAdapter = useAuctionFormAdapter({
    topText: '',
    bottomText: '',
    auctionDate: getTodayDate(),
    status: 'active' as 'draft' | 'active' | 'sold' | 'expired',
  });

  // Item selection state with separate ordering for each category
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedItemOrderByType, setSelectedItemOrderByType] = useState<{
    PsaGradedCard: string[];
    RawCard: string[];
    SealedProduct: string[];
  }>({
    PsaGradedCard: [],
    RawCard: [],
    SealedProduct: [],
  });

  // SOLID/DRY: Hierarchical search state for dual search boxes
  const [selectedSetName, setSelectedSetName] = useState<string>('');
  const [cardProductSearchTerm, setCardProductSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'PsaGradedCard' | 'RawCard' | 'SealedProduct'
  >('all');

  // UI state
  const [showPreview, setShowPreview] = useState(false);

  // Fetch collection data on component mount using thin service layer
  useEffect(() => {
    const loadCollectionData = async () => {
      setCollectionLoading(true);
      setCollectionError(null);

      try {
        const { psaCards, rawCards, sealedProducts } =
          await AuctionDataService.fetchAllCollectionItems();
        const unifiedItems = AuctionDataService.transformToUnifiedItems(
          psaCards,
          rawCards,
          sealedProducts
        );
        setAllCollectionItems(unifiedItems);
        log(
          'Successfully loaded and transformed collection items:',
          unifiedItems.length
        );
      } catch (error) {
        log('Error loading collection data:', error);
        setCollectionError('Failed to load collection items');
      } finally {
        setCollectionLoading(false);
      }
    };

    loadCollectionData();
  }, []);

  // Get selected items grouped by type with their orders and sorting
  const selectedItemsByType = useMemo(() => {
    const groups = {
      PsaGradedCard: [] as UnifiedCollectionItem[],
      RawCard: [] as UnifiedCollectionItem[],
      SealedProduct: [] as UnifiedCollectionItem[],
    };

    // Get items in order for each category, ensuring no duplicates
    Object.entries(selectedItemOrderByType).forEach(
      ([itemType, orderArray]) => {
        const typedItemType = itemType as keyof typeof groups;

        const uniqueSelectedIds = [...new Set(orderArray)].filter((id) =>
          selectedItemIds.has(id)
        );

        const items = uniqueSelectedIds
          .map((itemId) =>
            allCollectionItems.find((item) => (item.id || (item as any)._id) === itemId)
          )
          .filter(Boolean) as UnifiedCollectionItem[];

        groups[typedItemType] = items;
      }
    );

    return groups;
  }, [selectedItemOrderByType, allCollectionItems, selectedItemIds]);

  // Calculate selected items total value
  const selectedItemsValue = useMemo(() => {
    // Calculate value directly from selectedItemIds and allCollectionItems to avoid circular dependency
    let total = 0;
    selectedItemIds.forEach((itemId) => {
      const item = allCollectionItems.find((item) => (item.id || (item as any)._id) === itemId);
      if (item) {
        total += item.displayPrice || 0;
      }
    });
    return total;
  }, [selectedItemIds, allCollectionItems]);

  // Handle item selection with separate ordering per category
  const toggleItemSelection = useCallback(
    (itemId: string) => {
      console.log('[DEBUG] toggleItemSelection called for itemId:', itemId);
      
      if (!itemId) {
        console.error('[DEBUG] toggleItemSelection received undefined itemId');
        return;
      }

      const item = allCollectionItems.find((item) => (item.id || (item as any)._id) === itemId);
      if (!item) {
        console.error('[DEBUG] Item not found for itemId:', itemId);
        return;
      }

      setSelectedItemIds((prev) => {
        const newSet = new Set(prev);
        const isCurrentlySelected = newSet.has(itemId);

        if (isCurrentlySelected) {
          // Remove from selection
          newSet.delete(itemId);
          
          // Remove from order array for this item type
          setSelectedItemOrderByType((prevOrder) => ({
            ...prevOrder,
            [item.itemType]: prevOrder[item.itemType].filter((id) => id !== itemId),
          }));
        } else {
          // Add to selection
          newSet.add(itemId);
          
          // Add to order array for this item type (if not already present)
          setSelectedItemOrderByType((prevOrder) => ({
            ...prevOrder,
            [item.itemType]: prevOrder[item.itemType].includes(itemId)
              ? prevOrder[item.itemType]
              : [...prevOrder[item.itemType], itemId],
          }));
        }

        return newSet;
      });
    },
    [allCollectionItems]
  );

  // SOLID/DRY: Select all filtered items with hierarchical filtering
  const selectAllItems = useCallback(() => {
    // Apply the same filtering logic as in AuctionItemSelectionSection
    let filteredItems = allCollectionItems;

    // First: Filter by selected set (hierarchical)
    if (selectedSetName) {
      filteredItems = filteredItems.filter((item) =>
        item.setName?.toLowerCase().includes(selectedSetName.toLowerCase())
      );
    }

    // Second: Filter by item type
    if (filterType !== 'all') {
      filteredItems = filteredItems.filter((item) => item.itemType === filterType);
    }

    // Third: Filter by card/product search term
    if (cardProductSearchTerm.trim()) {
      const search = cardProductSearchTerm.toLowerCase();
      filteredItems = filteredItems.filter((item) =>
        item.displayName.toLowerCase().includes(search)
      );
    }

    // Add all filtered items to selection
    const newSelectedIds = new Set(selectedItemIds);
    const newOrderByType = { ...selectedItemOrderByType };

    filteredItems.forEach((item) => {
      const itemId = item.id || (item as any)._id;
      if (!newSelectedIds.has(itemId)) {
        newSelectedIds.add(itemId);
        
        // Add to order array for this item type (if not already present)
        if (!newOrderByType[item.itemType].includes(itemId)) {
          newOrderByType[item.itemType] = [...newOrderByType[item.itemType], itemId];
        }
      }
    });

    setSelectedItemIds(newSelectedIds);
    setSelectedItemOrderByType(newOrderByType);
  }, [allCollectionItems, selectedSetName, filterType, cardProductSearchTerm, selectedItemIds, selectedItemOrderByType]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedItemIds(new Set());
    setSelectedItemOrderByType({
      PsaGradedCard: [],
      RawCard: [],
      SealedProduct: [],
    });
  }, []);

  // Handle form submission
  const handleSubmit = async (formData: AuctionFormData) => {
    try {
      clearError();

      // Prepare selected items for auction (preserving category order)
      const auctionItems: IAuctionItem[] = [
        ...selectedItemsByType.PsaGradedCard.map((item) => ({
          itemId: String(item.id || (item as any)._id),
          itemCategory: 'PsaGradedCard' as const,
          sold: false,
        })),
        ...selectedItemsByType.RawCard.map((item) => ({
          itemId: String(item.id || (item as any)._id),
          itemCategory: 'RawCard' as const,
          sold: false,
        })),
        ...selectedItemsByType.SealedProduct.map((item) => ({
          itemId: String(item.id || (item as any)._id),
          itemCategory: 'SealedProduct' as const,
          sold: false,
        })),
      ];

      // Prepare auction data
      const auctionData = {
        topText: formData.topText.trim(),
        bottomText: formData.bottomText.trim(),
        status: formData.status,
        items: auctionItems,
        totalValue: Number(selectedItemsValue),
        ...(formData.auctionDate && { auctionDate: formData.auctionDate }),
      };

      console.log('[AUCTION CREATE DEBUG] Selected items state:', {
        selectedItemIds: Array.from(selectedItemIds),
        selectedItemsByType: selectedItemsByType,
        auctionItemsCount: auctionItems.length,
        auctionItems: auctionItems
      });

      log('Creating auction with data:', {
        topText: auctionData.topText,
        bottomText: auctionData.bottomText,
        status: auctionData.status,
        itemCount: auctionData.items.length,
        totalValue: auctionData.totalValue,
        hasAuctionDate: !!auctionData.auctionDate,
      });

      const createdAuction = await createAuction(auctionData);

      // Navigate to auction detail page
      const auctionId = createdAuction.id || createdAuction._id;
      if (auctionId) {
        toast.success('✅ Auction created successfully!');
        navigationHelper.navigateToAuctionDetail(auctionId);
      } else {
        toast.success(
          '✅ Auction created successfully! Redirecting to auctions list.'
        );
        navigationHelper.navigateToAuctions();
      }
    } catch (err) {
      log('Error creating auction:', err);
    }
  };

  // Theme-aware background while preserving Context7 2025 futuristic aesthetic
  const backgroundStyles = {
    background: 'linear-gradient(135deg, rgb(2 6 23) 0%, rgba(88 28 135 / 0.2) 50%, rgba(49 46 129 / 0.3) 100%)',
  };

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
                    Create Auction
                  </h1>
                  <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                    Neural-powered auction creation for your collection universe
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                    <Gavel className="w-5 h-5 mr-2 text-cyan-300" />
                    <div>
                      <div className="text-lg font-bold text-white">{selectedItemIds.size}</div>
                      <div className="text-xs text-cyan-200">Items Selected</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Error Display */}
              {_error && (
                <div className="mt-6 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-400 text-sm font-medium bg-red-900/50 px-3 py-1 rounded-xl border border-red-500/30">
                      Error
                    </div>
                    <span className="text-red-300 font-medium">
                      {_error}
                    </span>
                  </div>
                </div>
              )}

              {/* Collection Error Display */}
              {collectionError && (
                <div className="mt-6 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-400 text-sm font-medium bg-red-900/50 px-3 py-1 rounded-xl border border-red-500/30">
                      Collection Error
                    </div>
                    <span className="text-red-300 font-medium">
                      {collectionError}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </PokemonCard>

          {/* Loading State */}
          {(formAdapter.loading || auctionLoading || collectionLoading) && (
            <PokemonCard variant="glass" size="xl">
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            </PokemonCard>
          )}

          {/* Form Container */}
          {!collectionLoading && (
            <PokemonCard variant="glass" size="xl" className="relative">
              <div className="relative z-10">
                <AuctionFormContainer
                  isEditing={false}
                  isSubmitting={formAdapter.loading || auctionLoading}
                  title="Create New Auction"
                  description="Start a new auction for your Pokémon collection"
                  icon={Gavel}
                  primaryColorClass="blue"
                  register={formAdapter.register}
                  errors={formAdapter.formState.errors}
                  setValue={formAdapter.setValue}
                  watch={formAdapter.watch}
                  handleSubmit={formAdapter.handleSubmit}
                  onSubmit={handleSubmit}
                  onCancel={() => navigationHelper.navigateToAuctions()}
                  itemSelectionSection={
                    <AuctionItemSelectionSection
                      items={allCollectionItems}
                      loading={collectionLoading}
                      error={collectionError}
                      selectedItemIds={selectedItemIds}
                      onToggleSelection={toggleItemSelection}
                      onSelectAll={selectAllItems}
                      onClearSelection={clearAllSelections}
                      selectedItemsValue={selectedItemsValue}
                      selectedSetName={selectedSetName}
                      onSetSelection={setSelectedSetName}
                      cardProductSearchTerm={cardProductSearchTerm}
                      onCardProductSearchChange={setCardProductSearchTerm}
                      filterType={filterType}
                      onFilterChange={setFilterType}
                      showPreview={showPreview}
                      onTogglePreview={() => setShowPreview(!showPreview)}
                      selectedItemsByType={selectedItemsByType}
                    />
                  }
                />
              </div>
            </PokemonCard>
          )}
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default CreateAuction;
