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
 * - Uses shared effect utilities (ParticleSystem, NeuralNetworkBackground, FloatingGeometry)
 * - Theme-compatible: Respects glassmorphism intensity and particle effect settings
 * - Specialized patterns documented for potential reuse across components
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gavel, ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layouts/PageLayout';
import { IAuctionItem } from '../domain/models/auction';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { useAuction } from '../hooks/useAuction';
import { useFetchCollectionItems } from '../hooks/useFetchCollectionItems';
import { useBaseForm } from '../hooks/useBaseForm';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { processImageUrl } from '../utils/formatting';
import { log } from '../utils/logger';
import AuctionFormContainer from '../components/forms/containers/AuctionFormContainer';
import AuctionItemSelectionSection from '../components/forms/sections/AuctionItemSelectionSection';
import { useCentralizedTheme } from '../utils/themeConfig';
import {
  ParticleSystem,
  NeuralNetworkBackground,
  FloatingGeometry,
  type GeometricElement,
} from '../components/effects';

// Form data interface
interface AuctionFormData {
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
}

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
  const themeConfig = useCentralizedTheme();
  const {
    createAuction,
    loading: auctionLoading,
    error: _error,
    clearError,
  } = useAuction();

  // Context7 2025 Futuristic Geometric Elements Configuration
  const futuristicGeometry: GeometricElement[] = [
    {
      type: 'square',
      size: 80,
      color: '#06b6d4',
      position: { top: '2rem', right: '2rem' },
      animation: 'spin',
      animationDuration: '20s',
      borderOnly: true,
      opacity: 0.4,
      glowEffect: true,
    },
    {
      type: 'circle',
      size: 64,
      color: '#a855f7',
      position: { bottom: '2rem', left: '2rem' },
      animation: 'pulse',
      opacity: 0.4,
      borderOnly: true,
      glowEffect: true,
    },
  ];

  // Use separate fetch hooks for better state management (following CLAUDE.md SRP)
  const collectionApiService = getCollectionApiService();
  const {
    items: psaCards,
    loading: psaLoading,
    error: psaError,
    fetchItems: fetchPsaCards,
  } = useFetchCollectionItems<IPsaGradedCard>({ initialData: [] });

  const {
    items: rawCards,
    loading: rawLoading,
    error: rawError,
    fetchItems: fetchRawCards,
  } = useFetchCollectionItems<IRawCard>({ initialData: [] });

  const {
    items: sealedProducts,
    loading: sealedLoading,
    error: sealedError,
    fetchItems: fetchSealedProducts,
  } = useFetchCollectionItems<ISealedProduct>({ initialData: [] });

  // Aggregate loading and error states
  const collectionLoading = psaLoading || rawLoading || sealedLoading;
  const collectionError = psaError || rawError || sealedError;

  // Initialize form with proper validation
  const baseForm = useBaseForm<AuctionFormData>({
    defaultValues: {
      topText: '',
      bottomText: '',
      auctionDate: '',
      status: 'draft',
    },
    validationRules: {
      topText: { required: 'Header text is required' },
      bottomText: { required: 'Footer text is required' },
      auctionDate: {
        custom: (value: string) => {
          if (value && new Date(value) < new Date()) {
            return 'Auction date cannot be in the past';
          }
          return undefined;
        },
      },
    },
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

  // Fetch collection data on component mount
  useEffect(() => {
    const loadCollectionData = async () => {
      try {
        await Promise.all([
          fetchPsaCards(() => collectionApiService.getPsaGradedCards()),
          fetchRawCards(() => collectionApiService.getRawCards()),
          fetchSealedProducts(() => collectionApiService.getSealedProducts()),
        ]);
      } catch (error) {
        log('Error loading collection data:', error);
      }
    };

    loadCollectionData();
  }, [fetchPsaCards, fetchRawCards, fetchSealedProducts, collectionApiService]);

  // Optimized combination of collection items with improved memoization
  const allCollectionItems = useMemo((): UnifiedCollectionItem[] => {
    const items: UnifiedCollectionItem[] = [];

    // Early return if no data to avoid unnecessary processing
    const psaCardsArray = psaCards || [];
    const rawCardsArray = rawCards || [];
    const sealedProductsArray = sealedProducts || [];

    if (
      !psaCardsArray.length &&
      !rawCardsArray.length &&
      !sealedProductsArray.length
    ) {
      return items;
    }

    // Add PSA Graded Cards
    psaCardsArray
      .filter((card) => !card.sold)
      .forEach((card) => {
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
        const cleanCardName = cardName
          .replace(/^2025\s+/gi, '')
          .replace(/Japanese Pokemon Japanese\s+/gi, 'Japanese ')
          .replace(/Pokemon Japanese\s+/gi, 'Japanese ')
          .replace(/Japanese\s+Japanese\s+/gi, 'Japanese ')
          .replace(/\s+/g, ' ')
          .trim();

        let displayName = cleanCardName;
        if (variety && !displayName.includes(variety)) {
          displayName = `${displayName} (${variety})`;
        }
        if (pokemonNumber && cleanCardName === 'Unknown Card') {
          displayName = `#${pokemonNumber}`;
        }
        displayName = `${displayName} - PSA ${card.grade}`;

        const processedImages = (card.images || [])
          .map(memoizedProcessImageUrl)
          .filter(Boolean) as string[];

        items.push({
          id: card.id,
          itemType: 'PsaGradedCard',
          displayName,
          displayPrice: card.myPrice || 0,
          displayImage: processedImages[0],
          images: processedImages,
          setName,
          grade: card.grade,
          originalItem: card,
        });
      });

    // Add Raw Cards
    rawCardsArray
      .filter((card) => !card.sold)
      .forEach((card) => {
        let cardName = 'Unknown Card';
        let setName = 'Unknown Set';

        const cardData = (card as any).cardId || card;
        const setData = cardData?.setId || cardData?.set;

        if (cardData?.cardName) {
          cardName = cardData.cardName;
        } else if (cardData?.baseName) {
          cardName = cardData.baseName;
        }

        if (setData?.setName) {
          setName = setData.setName;
        } else if (cardData?.setName) {
          setName = cardData.setName;
        }

        const displayName = `${cardName} - ${card.condition}`;

        const processedImages = (card.images || [])
          .map(memoizedProcessImageUrl)
          .filter(Boolean) as string[];

        items.push({
          id: card.id,
          itemType: 'RawCard',
          displayName,
          displayPrice: card.myPrice || 0,
          displayImage: processedImages[0],
          images: processedImages,
          setName,
          condition: card.condition,
          originalItem: card,
        });
      });

    // Add Sealed Products
    sealedProductsArray
      .filter((product) => !product.sold)
      .forEach((product) => {
        // Use hierarchical structure to get product name - match CollectionItemCard pattern
        const productName =
          // For sealed products - check Product->SetProduct reference
          (product as any).productId?.productName ||
          product.name ||
          (product as any).productName ||
          'Unknown Product';

        // Use hierarchical structure to get set name - match CollectionItemCard pattern
        const setName =
          // For sealed products - check Product->SetProduct reference
          (product as any).productId?.setProductName ||
          product.setName ||
          (product as any).setProductName ||
          'Unknown Set';

        const displayName =
          setName !== 'Unknown Set'
            ? `${productName} - ${setName}`
            : productName;

        const processedImages = (product.images || [])
          .map(memoizedProcessImageUrl)
          .filter(Boolean) as string[];

        items.push({
          id: product.id,
          itemType: 'SealedProduct',
          displayName,
          displayPrice: product.myPrice || 0,
          displayImage: processedImages[0],
          images: processedImages,
          setName,
          category: product.category,
          originalItem: product,
        });
      });

    return items;
  }, [psaCards, rawCards, sealedProducts]);

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

  // Navigation helper
  const navigateToAuctions = () => {
    window.history.pushState({}, '', '/auctions');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

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
      const matchesSet = !selectedSetName || 
        item.setName?.toLowerCase().includes(selectedSetName.toLowerCase());
      const matchesCardProduct = !cardProductSearchTerm.trim() ||
        item.displayName.toLowerCase().includes(cardProductSearchTerm.toLowerCase());
        
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
        window.history.pushState({}, '', `/auctions/${auctionId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        toast.success('✅ Auction created successfully! Redirecting to auctions list.');
        navigateToAuctions();
      }
    } catch (err) {
      log('Error creating auction:', err);
    }
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Theme-aware background while preserving Context7 2025 futuristic aesthetic
  const backgroundStyles = {
    background:
      themeConfig.visualTheme === 'context7-futuristic'
        ? 'linear-gradient(135deg, rgb(2 6 23) 0%, rgba(88 28 135 / 0.2) 50%, rgba(49 46 129 / 0.3) 100%)'
        : 'linear-gradient(135deg, var(--theme-background-start, rgb(2 6 23)) 0%, var(--theme-background-mid, rgba(88 28 135 / 0.2)) 50%, var(--theme-background-end, rgba(49 46 129 / 0.3)) 100%)',
  };

  return (
    <PageLayout
      title="Create Auction"
      subtitle="Create a new auction for your items"
    >
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
            {/* Context7 2025 Futuristic Glassmorphism Header */}
            <div className="relative group">
              {/* Glassmorphism card with neumorphism elements - theme-aware */}
              <div
                className="backdrop-blur-xl border rounded-[2rem] shadow-2xl text-white p-12 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, ${0.15 * (themeConfig.glassmorphismIntensity / 100)}) 0%, 
                    rgba(6, 182, 212, ${0.12 * (themeConfig.glassmorphismIntensity / 100)}) 50%, 
                    rgba(168, 85, 247, ${0.15 * (themeConfig.glassmorphismIntensity / 100)}) 100%)`,
                  borderColor: `rgba(255, 255, 255, ${0.2 * (themeConfig.glassmorphismIntensity / 100)})`,
                }}
              >
                {/* Neural network glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 opacity-70 blur-3xl"></div>

                {/* Holographic border animation */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>

                {/* Top accent line with RGB shifting */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80 animate-pulse"></div>

                {/* Context7 2025 Futuristic Floating Geometric Elements */}
                <FloatingGeometry elements={futuristicGeometry} />

                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    {/* Neumorphism back button */}
                    <button
                      onClick={() => handleNavigation('/auctions')}
                      className="mr-6 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-cyan-400/30 transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    >
                      <ArrowLeft className="w-6 h-6 group-hover/btn:scale-110 group-hover/btn:-translate-x-1 transition-all duration-300 text-cyan-300" />
                    </button>

                    {/* Holographic icon container */}
                    <div className="relative mr-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                        {/* Inner glow */}
                        <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-xl blur-lg"></div>
                        <Gavel className="w-10 h-10 text-cyan-300 relative z-10 animate-pulse" />
                        {/* Orbiting elements */}
                        <div
                          className="absolute inset-0 animate-spin opacity-40"
                          style={{ animationDuration: '15s' }}
                        >
                          <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                      </div>
                    </div>

                    {/* Title section with cyberpunk styling */}
                    <div className="flex-1">
                      <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        Create Auction
                      </h1>
                      <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        Neural-powered auction creation for your collection
                        universe
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-zinc-800/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-zinc-800/10 rounded-full animate-pulse delay-75"></div>
            </div>

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
                    isSubmitting={auctionLoading}
                    title="Create New Auction"
                    description="Start a new auction for your Pokémon collection"
                    icon={Gavel}
                    primaryColorClass="blue"
                    register={baseForm.form.register}
                    errors={baseForm.form.formState.errors}
                    setValue={baseForm.form.setValue}
                    watch={baseForm.form.watch}
                    handleSubmit={baseForm.form.handleSubmit}
                    onSubmit={handleSubmit}
                    onCancel={navigateToAuctions}
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
