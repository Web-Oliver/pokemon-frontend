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
import { Gavel, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import UnifiedHeader from '../../../shared/components/molecules/common/UnifiedHeader';
import { IAuctionItem } from '../../../shared/domain/models/auction';
import { IPsaGradedCard, IRawCard } from '../../../shared/domain/models/card';
import { ISealedProduct } from '../../../shared/domain/models/sealedProduct';
import { useAuction } from '../../../shared/hooks/useAuction';
import { useFetchCollectionItems } from '../../../shared/hooks/useFetchCollectionItems';
import { useAuctionFormAdapter } from '../../../shared/hooks/form/useGenericFormStateAdapter';
import { log } from '../../../shared/utils/performance/logger';
import AuctionFormContainer from '../../../shared/components/forms/containers/AuctionFormContainer';
import AuctionItemSelectionSection from '../../../shared/components/forms/sections/AuctionItemSelectionSection';
import { useCentralizedTheme } from '../../../shared/utils/ui/themeConfig';
import {
  ParticleSystem,
  NeuralNetworkBackground,
} from '../../../shared/components/organisms/effects';
import { AuctionDataService, UnifiedCollectionItem } from '../services/AuctionDataService';
import { navigationHelper } from '../../../shared/utils/navigation';

// Form data interface
interface AuctionFormData {
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
}

// Form data interface

const CreateAuction: React.FC = () => {
  const themeConfig = useCentralizedTheme();
  const {
    createAuction,
    loading: auctionLoading,
    error: _error,
    clearError,
  } = useAuction();

  // Collection items state (using thin service layer)
  const [allCollectionItems, setAllCollectionItems] = useState<UnifiedCollectionItem[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  // Initialize form using our consolidated form state with react-hook-form adapter
  const formAdapter = useAuctionFormAdapter({
    topText: '',
    bottomText: '',
    auctionDate: '',
    status: 'draft' as 'draft' | 'active' | 'sold' | 'expired',
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
        const { psaCards, rawCards, sealedProducts } = await AuctionDataService.fetchAllCollectionItems();
        const unifiedItems = AuctionDataService.transformToUnifiedItems(psaCards, rawCards, sealedProducts);
        setAllCollectionItems(unifiedItems);
        log('Successfully loaded and transformed collection items:', unifiedItems.length);
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
            allCollectionItems.find((item) => item.id === itemId)
          )
          .filter(Boolean) as UnifiedCollectionItem[];

        groups[typedItemType] = items;
      }
    );

    return groups;
  }, [selectedItemOrderByType, allCollectionItems, selectedItemIds]);

  // Calculate selected items total value
  const selectedItemsValue = useMemo(() => {
    const allSelectedItems = [
      ...selectedItemsByType.PsaGradedCard,
      ...selectedItemsByType.RawCard,
      ...selectedItemsByType.SealedProduct,
    ];
    return allSelectedItems.reduce((total, item) => {
      return total + (item?.displayPrice || 0);
    }, 0);
  }, [selectedItemsByType]);


  // Handle item selection with separate ordering per category
  const toggleItemSelection = useCallback(
    (itemId: string) => {
      const item = allCollectionItems.find((item) => item.id === itemId);
      if (!item) {
        return;
      }

      setSelectedItemIds((prev) => {
        const newSet = new Set(prev);
        const isCurrentlySelected = newSet.has(itemId);

        if (isCurrentlySelected) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });

      setSelectedItemOrderByType((prevOrder) => {
        const isCurrentlySelected = selectedItemIds.has(itemId);

        if (isCurrentlySelected) {
          return {
            ...prevOrder,
            [item.itemType]: prevOrder[item.itemType].filter(
              (id) => id !== itemId
            ),
          };
        } else {
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
    },
    [allCollectionItems, selectedItemIds]
  );

  // SOLID/DRY: Select all filtered items with hierarchical filtering
  const selectAllItems = useCallback(() => {
    const filteredItems = allCollectionItems.filter((item) => {
      const matchesType = filterType === 'all' || item.itemType === filterType;

      // Hierarchical filtering: first by set, then by card/product
      const matchesSet =
        !selectedSetName ||
        item.setName?.toLowerCase().includes(selectedSetName.toLowerCase());
      const matchesCardProduct =
        !cardProductSearchTerm.trim() ||
        item.displayName
          .toLowerCase()
          .includes(cardProductSearchTerm.toLowerCase());

      return matchesType && matchesSet && matchesCardProduct;
    });

    const newSelection = new Set(selectedItemIds);
    const newOrderItemsByType = { ...selectedItemOrderByType };

    filteredItems.forEach((item) => {
      if (!newSelection.has(item.id)) {
        newSelection.add(item.id);
        if (!newOrderItemsByType[item.itemType].includes(item.id)) {
          newOrderItemsByType[item.itemType] = [
            ...newOrderItemsByType[item.itemType],
            item.id,
          ];
        }
      }
    });

    setSelectedItemIds(newSelection);
    setSelectedItemOrderByType(newOrderItemsByType);
  }, [
    selectedItemIds,
    allCollectionItems,
    selectedItemOrderByType,
    filterType,
    selectedSetName,
    cardProductSearchTerm,
  ]);

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
          itemId: String(item.id),
          itemCategory: 'PsaGradedCard' as const,
          sold: false,
        })),
        ...selectedItemsByType.RawCard.map((item) => ({
          itemId: String(item.id),
          itemCategory: 'RawCard' as const,
          sold: false,
        })),
        ...selectedItemsByType.SealedProduct.map((item) => ({
          itemId: String(item.id),
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
    background:
      themeConfig.visualTheme === 'context7-futuristic'
        ? 'linear-gradient(135deg, rgb(2 6 23) 0%, rgba(88 28 135 / 0.2) 50%, rgba(49 46 129 / 0.3) 100%)'
        : 'linear-gradient(135deg, var(--theme-background-start, rgb(2 6 23)) 0%, var(--theme-background-mid, rgba(88 28 135 / 0.2)) 50%, var(--theme-background-end, rgba(49 46 129 / 0.3)) 100%)',
  };

  return (
    <PageLayout>
      <div
        className="min-h-screen relative overflow-hidden"
        style={backgroundStyles}
      >
        {/* Context7 2025 Futuristic Neural Background - Quantum Field Effect */}
        <NeuralNetworkBackground
          primaryColor="#06b6d4"
          secondaryColor="#a855f7"
          gridColor="#06b6d4"
          opacity={0.2}
          enableQuantumParticles={true}
          enableGrid={true}
          animationSpeed={1}
        />

        {/* Context7 2025 Futuristic Particle Systems */}
        <ParticleSystem
          particleCount={12}
          colors={['#06b6d4', '#a855f7', '#ec4899', '#10b981']}
          sizeRange={[2, 8]}
          durationRange={[3, 7]}
          opacity={0.2}
          animationType="pulse"
        />

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <UnifiedHeader
              icon={Gavel}
              title="Create Auction"
              subtitle="Neural-powered auction creation for your collection universe"
              variant="glassmorphism"
              size="lg"
              showBackButton={true}
              onBack={() => navigationHelper.navigateToAuctions()}
              className="mb-8"
            />

            {/* Context7 2025 Futuristic Form Container */}
            <div className="relative group overflow-hidden">
              {/* Holographic field effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

              {/* Advanced glassmorphism container - theme-aware */}
              <div
                className="relative backdrop-blur-xl border rounded-[2rem] shadow-[0_16px_40px_0_rgba(31,38,135,0.2)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, ${0.08 * (themeConfig.glassmorphismIntensity / 100)}) 0%, 
                    rgba(100, 116, 139, ${0.03 * (themeConfig.glassmorphismIntensity / 100)}) 50%, 
                    rgba(168, 85, 247, ${0.08 * (themeConfig.glassmorphismIntensity / 100)}) 100%)`,
                  borderColor: `rgba(255, 255, 255, ${0.12 * (themeConfig.glassmorphismIntensity / 100)})`,
                }}
              >
                {/* Neural network grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px',
                  }}
                ></div>

                {/* Quantum accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

                <div className="p-8 relative z-10">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateAuction;
