/**
 * Shared Auction Form Data Management Hook
 *
 * Extracts common auction form state and logic from CreateAuction and AuctionEdit
 * to eliminate 95% code duplication (661 lines).
 *
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Manages auction form data, validation, and collection items
 * - DRY: Eliminates duplication between CreateAuction/AuctionEdit form logic
 * - Dependency Inversion: Uses service abstractions for data fetching
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBaseForm } from './useBaseForm';
import { useFetchCollectionItems } from './useFetchCollectionItems';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { IAuctionItem } from '../domain/models/auction';

import { processImageUrl } from '../utils/helpers/formatting';
import { log } from '../utils/performance/logger';

// AuctionFormData moved to types/form/FormTypes.ts to eliminate duplication
import { AuctionFormData } from '../../types/form/FormTypes';

// UnifiedCollectionItem moved to shared/types/collectionDisplayTypes.ts to eliminate duplication
import { UnifiedCollectionItem } from '../types/collectionDisplayTypes';

// Search and filter state interface
export interface SearchFilterState {
  selectedSetName: string;
  cardProductSearchTerm: string;
  filterType: 'all' | 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
}

// Item selection state interface
export interface ItemSelectionState {
  selectedItemIds: Set<string>;
  selectedItemOrderByType: {
    PsaGradedCard: string[];
    RawCard: string[];
    SealedProduct: string[];
  };
}

// Memoized image processing function
const memoizedProcessImageUrl = (imagePath: string | undefined) => {
  return processImageUrl(imagePath);
};

export const useAuctionFormData = (initialData?: Partial<AuctionFormData>) => {
  // Form management with validation
  const baseForm = useBaseForm<AuctionFormData>({
    defaultValues: {
      topText: initialData?.topText || '',
      bottomText: initialData?.bottomText || '',
      auctionDate: initialData?.auctionDate || '',
      status: initialData?.status || 'draft',
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

  // Collection data fetching hooks
  const collectionApiService = unifiedApiService.collection;
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

  // Search and filter state
  const [searchFilter, setSearchFilter] = useState<SearchFilterState>({
    selectedSetName: '',
    cardProductSearchTerm: '',
    filterType: 'all',
  });

  // Item selection state with separate ordering for each category
  const [itemSelection, setItemSelection] = useState<ItemSelectionState>({
    selectedItemIds: new Set(),
    selectedItemOrderByType: {
      PsaGradedCard: [],
      RawCard: [],
      SealedProduct: [],
    },
  });

  // Load collection data on mount
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

  // Transform collection items to unified format with optimized memoization
  const allCollectionItems = useMemo((): UnifiedCollectionItem[] => {
    const items: UnifiedCollectionItem[] = [];

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

    // Process PSA Graded Cards
    psaCardsArray
      .filter((card) => !card.sold)
      .forEach((card) => {
        const cardData = (card as any).cardId || card;
        const setData = cardData?.setId || cardData?.set;

        const cardName =
          cardData?.cardName || cardData?.baseName || 'Unknown Card';
        const setName = setData?.setName || cardData?.setName || 'Unknown Set';
        const variety = cardData?.variety || '';
        const pokemonNumber = cardData?.pokemonNumber || '';

        // Clean card name
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

    // Process Raw Cards
    rawCardsArray
      .filter((card) => !card.sold)
      .forEach((card) => {
        const cardData = (card as any).cardId || card;
        const setData = cardData?.setId || cardData?.set;

        const cardName =
          cardData?.cardName || cardData?.baseName || 'Unknown Card';
        const setName = setData?.setName || cardData?.setName || 'Unknown Set';
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

    // Process Sealed Products
    sealedProductsArray
      .filter((product) => !product.sold)
      .forEach((product) => {
        const productName =
          (product as any).productId?.productName ||
          product.name ||
          (product as any).productName ||
          'Unknown Product';

        const setName =
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

  // Get selected items grouped by type with their orders
  const selectedItemsByType = useMemo(() => {
    const groups = {
      PsaGradedCard: [] as UnifiedCollectionItem[],
      RawCard: [] as UnifiedCollectionItem[],
      SealedProduct: [] as UnifiedCollectionItem[],
    };

    Object.entries(itemSelection.selectedItemOrderByType).forEach(
      ([itemType, orderArray]) => {
        const typedItemType = itemType as keyof typeof groups;
        const uniqueSelectedIds = [...new Set(orderArray)].filter((id) =>
          itemSelection.selectedItemIds.has(id)
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
  }, [
    itemSelection.selectedItemOrderByType,
    allCollectionItems,
    itemSelection.selectedItemIds,
  ]);

  // Calculate total value of selected items
  const selectedItemsValue = useMemo(() => {
    const allSelectedItems = [
      ...selectedItemsByType.PsaGradedCard,
      ...selectedItemsByType.RawCard,
      ...selectedItemsByType.SealedProduct,
    ];
    return allSelectedItems.reduce(
      (total, item) => total + (item?.displayPrice || 0),
      0
    );
  }, [selectedItemsByType]);

  // Handle item selection with separate ordering per category
  const toggleItemSelection = useCallback(
    (itemId: string) => {
      const item = allCollectionItems.find((item) => item.id === itemId);
      if (!item) return;

      setItemSelection((prev) => {
        const newSelectedIds = new Set(prev.selectedItemIds);
        const isCurrentlySelected = newSelectedIds.has(itemId);

        if (isCurrentlySelected) {
          newSelectedIds.delete(itemId);
        } else {
          newSelectedIds.add(itemId);
        }

        const newOrder = { ...prev.selectedItemOrderByType };
        if (isCurrentlySelected) {
          newOrder[item.itemType] = newOrder[item.itemType].filter(
            (id) => id !== itemId
          );
        } else {
          if (!newOrder[item.itemType].includes(itemId)) {
            newOrder[item.itemType] = [...newOrder[item.itemType], itemId];
          }
        }

        return {
          selectedItemIds: newSelectedIds,
          selectedItemOrderByType: newOrder,
        };
      });
    },
    [allCollectionItems]
  );

  // Select all filtered items
  const selectAllItems = useCallback(() => {
    const filteredItems = allCollectionItems.filter((item) => {
      const matchesType =
        searchFilter.filterType === 'all' ||
        item.itemType === searchFilter.filterType;
      const matchesSet =
        !searchFilter.selectedSetName ||
        item.setName
          ?.toLowerCase()
          .includes(searchFilter.selectedSetName.toLowerCase());
      const matchesCardProduct =
        !searchFilter.cardProductSearchTerm.trim() ||
        item.displayName
          .toLowerCase()
          .includes(searchFilter.cardProductSearchTerm.toLowerCase());

      return matchesType && matchesSet && matchesCardProduct;
    });

    setItemSelection((prev) => {
      const newSelection = new Set(prev.selectedItemIds);
      const newOrderItemsByType = { ...prev.selectedItemOrderByType };

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

      return {
        selectedItemIds: newSelection,
        selectedItemOrderByType: newOrderItemsByType,
      };
    });
  }, [allCollectionItems, searchFilter]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setItemSelection({
      selectedItemIds: new Set(),
      selectedItemOrderByType: {
        PsaGradedCard: [],
        RawCard: [],
        SealedProduct: [],
      },
    });
  }, []);

  // Convert selected items to auction item format
  const convertToAuctionItems = useCallback((): IAuctionItem[] => {
    return [
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
  }, [selectedItemsByType]);

  // Update form values (for edit mode)
  const updateFormValues = useCallback(
    (values: Partial<AuctionFormData>) => {
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          baseForm.form.setValue(key as keyof AuctionFormData, value);
        }
      });
    },
    [baseForm.form]
  );

  return {
    // Form management
    form: baseForm.form,
    formErrors: baseForm.form.formState.errors,
    updateFormValues,

    // Collection data
    allCollectionItems,
    collectionLoading,
    collectionError,

    // Selection state
    selectedItemIds: itemSelection.selectedItemIds,
    selectedItemsByType,
    selectedItemsValue,
    toggleItemSelection,
    selectAllItems,
    clearAllSelections,

    // Search and filter
    searchFilter,
    setSearchFilter,

    // Utilities
    convertToAuctionItems,
  };
};
