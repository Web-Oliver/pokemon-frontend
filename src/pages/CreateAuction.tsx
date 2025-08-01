/**
 * Create Auction Page
 * Refactored to use proper form components following SOLID and DRY principles
 * Following CLAUDE.md layered architecture and Context7 design patterns
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gavel } from 'lucide-react';
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
  const {
    createAuction,
    loading: auctionLoading,
    error,
    clearError,
  } = useAuction();

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

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
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
        const productName = product.name || 'Unknown Product';
        const displayName = product.setName
          ? `${productName} - ${product.setName}`
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
          setName: product.setName || 'Unknown Set',
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

  // Select all filtered items
  const selectAllItems = useCallback(() => {
    const filteredItems = allCollectionItems.filter((item) => {
      const matchesType = filterType === 'all' || item.itemType === filterType;
      const matchesSearch =
        !searchTerm.trim() ||
        item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.setName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
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
    searchTerm,
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
        alert('✅ Auction created successfully!');
        window.history.pushState({}, '', `/auctions/${auctionId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        alert('✅ Auction created successfully! Redirecting to auctions list.');
        navigateToAuctions();
      }
    } catch (err) {
      log('Error creating auction:', err);
    }
  };

  return (
    <PageLayout
      title="Create New Auction"
      subtitle="Set up a new auction for your collection items"
      loading={auctionLoading}
      error={error || collectionError}
      variant="default"
    >
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
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
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
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
    </PageLayout>
  );
};

export default CreateAuction;
