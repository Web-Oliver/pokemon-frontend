/**
 * DBA Export Business Logic Hook
 * Layer 2: Services/Hooks/Store (CLAUDE.md Architecture)
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for DBA export business logic
 * - OCP: Open for extension via additional operations
 * - DIP: Depends on API abstractions
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as dbaSelectionApi from '../api/dbaSelectionApi';
import * as exportApi from '../api/exportApi';
import { useCollectionOperations } from './useCollectionOperations';
import { handleApiError } from '../utils/errorHandler';
import { showSuccessToast } from '../utils/errorHandler';
import { queryKeys } from '../lib/queryClient';
import { CACHE_TTL } from '../config/cacheConfig';

export interface SelectedItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  name: string;
  price: number;
  images: string[];
  customTitle?: string;
  customDescription?: string;
  // Additional fields for different types
  grade?: number;
  condition?: string;
  category?: string;
  cardId?: any;
  setName?: string;
}

// Pokemon abbreviations for title generation
const POKEMON_ABBREVIATIONS = {
  'Black White': 'B&W',
  'Black & White': 'B&W',
  'Sun Moon': 'S&M',
  'Sun & Moon': 'S&M',
  'Diamond Pearl': 'D&P',
  'Diamond & Pearl': 'D&P',
  'Heartgold Soulsilver': 'HGSS',
  'HeartGold SoulSilver': 'HGSS',
  'Sword Shield': 'S&S',
  'Sword & Shield': 'S&S',
  'Scarlet Violet': 'S&V',
  'Scarlet & Violet': 'S&V',
  'X Y': 'XY',
  'X & Y': 'XY',
  'Black Star Promo': 'Promo',
  'World Championships': 'World',
  'World Championship': 'World',
  'Corocoro Comics': 'Corocoro',
  'CoroCoro Comics': 'Corocoro',
  'Pokemon Center': 'PC',
  'Pokémon Center': 'PC',
  'Starter Set': 'Starter',
  'Theme Deck': 'Theme',
  'Elite Trainer Box': 'ETB',
  'Collection Box': 'Collection',
  'Premium Collection': 'Premium',
  'Gift Set': 'Gift',
  'Battle Deck': 'Battle',
};

export const useDbaExport = () => {
  const { psaCards, rawCards, sealedProducts, loading } = useCollectionOperations();
  const queryClient = useQueryClient();
  
  // State management (non-cached state)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // React Query for DBA selections with proper caching
  const {
    data: dbaSelections = [],
    isLoading: loadingDbaSelections,
    error: dbaSelectionsError,
  } = useQuery({
    queryKey: queryKeys.dbaSelections({ active: true }),
    queryFn: () => dbaSelectionApi.getDbaSelections({ active: true }),
    staleTime: CACHE_TTL.COLLECTION_ITEMS, // 2 minutes - DBA selections can change
    gcTime: CACHE_TTL.COLLECTION_ITEMS * 2, // 4 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Debug logging for collection data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DBA EXPORT] Collection data loaded:', {
        psaCards: psaCards.length,
        rawCards: rawCards.length,
        sealedProducts: sealedProducts.length,
        dbaSelections: dbaSelections.length,
        samplePsaCard: psaCards[0],
        sampleRawCard: rawCards[0],
        sampleSealedProduct: sealedProducts[0],
      });
    }
  }, [psaCards, rawCards, sealedProducts, dbaSelections]);

  // Utility functions
  const formatCardNameForDisplay = (cardName: string): string => {
    return cardName.replace(/-/g, ' ').replace(/\(#\d+\)$/, '').trim();
  };

  const getItemDisplayName = (item: any, type: string): string => {
    if (type === 'sealed') {
      return item.name || 'Unknown Product';
    } else {
      const cardName = item.cardId?.cardName || item.cardName || 'Unknown Card';
      return formatCardNameForDisplay(cardName);
    }
  };

  const getDbaInfo = (itemId: string, itemType: string) => {
    return dbaSelections?.find(
      (selection) => selection.itemId === itemId && selection.itemType === itemType
    );
  };

  const shortenSetName = (originalName: string): string => {
    if (!originalName || typeof originalName !== 'string') {
      return originalName || '';
    }

    let processedName = originalName.trim();

    // Apply special rules
    const corocoroPattern = /Pokemon Japanese Corocoro Comics? Promo \((\d+)\)/i;
    if (corocoroPattern.test(processedName)) {
      processedName = processedName.replace(corocoroPattern, 'Corocoro $1');
      return processedName;
    }

    const worldPattern = /Pokemon Diamond Pearl World (\d+) Promo \((\d+)\)/i;
    if (worldPattern.test(processedName)) {
      processedName = processedName.replace(worldPattern, 'D&P Promo $2');
      return processedName;
    }

    const promoYearPattern = /(.+) Promo \((\d+)\)$/i;
    if (promoYearPattern.test(processedName)) {
      processedName = processedName.replace(promoYearPattern, '$1 Promo $2');
    }

    // Remove "Pokemon" prefix
    processedName = processedName.replace(/^Pokemon\s+/i, '');

    // Apply abbreviations
    Object.entries(POKEMON_ABBREVIATIONS).forEach(([fullForm, abbreviation]) => {
      const regex = new RegExp(fullForm, 'gi');
      if (regex.test(processedName)) {
        processedName = processedName.replace(regex, abbreviation);
      }
    });

    // Clean up
    processedName = processedName
      .replace(/\s+/g, ' ')
      .replace(/\s*\(\s*\)/g, '')
      .trim();

    return processedName;
  };

  const generateDefaultTitle = (item: SelectedItem & any): string => {
    const parts = ['Pokemon Kort'];

    if (item.type === 'sealed') {
      const productName = item.name || '';
      if (productName) {
        const cleanName = productName
          .replace(/pokemon/gi, '')
          .replace(/pokémon/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanName) {
          parts.push(cleanName);
        }
      }
      parts.push('Sealed');
    } else {
      const setName = item.cardId?.setId?.setName || item.setName || '';
      const cardName = item.cardId?.cardName || item.cardName || item.name || '';
      const pokemonNumber = item.cardId?.pokemonNumber || '';

      const shortenedSet = shortenSetName(setName);
      if (shortenedSet) {
        parts.push(shortenedSet);
      }

      if (cardName) {
        const cleanCardName = cardName
          .replace(/-/g, ' ')
          .replace(/\(#\d+\)$/, '')
          .replace(/1st Edition/gi, '1 Ed')
          .replace(/\bholo\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        parts.push(cleanCardName);
      }

      if (pokemonNumber) {
        parts.push(pokemonNumber);
      }

      if (item.type === 'psa' && item.grade) {
        parts.push(`PSA ${item.grade}`);
      } else if (item.type === 'raw' && item.condition) {
        parts.push(item.condition);
      }
    }

    let fullTitle = parts.join(' ');

    if (fullTitle.length > 80) {
      const shortenedSet = item.type === 'sealed'
        ? shortenSetName(item.setName || '')
        : shortenSetName(item.cardId?.setId?.setName || item.setName || '');
      
      const baseTitle = `Pokemon Kort ${shortenedSet} `;
      const remaining = 80 - baseTitle.length - 10;

      const cardName = item.type === 'sealed'
        ? item.name
        : item.cardId?.cardName || item.cardName || item.name || '';

      const cardPart = `${cardName.substring(0, remaining)}...`;
      let suffix = '';

      if (item.type === 'psa' && item.grade) {
        suffix = ` PSA ${item.grade}`;
      } else if (item.type === 'raw' && item.condition) {
        suffix = ` ${item.condition}`;
      } else if (item.type === 'sealed') {
        suffix = ' Sealed';
      }

      fullTitle = baseTitle + cardPart + suffix;

      if (fullTitle.length > 80) {
        fullTitle = `${fullTitle.substring(0, 77)}...`;
      }
    }

    return fullTitle;
  };

  const generateDefaultDescription = (item: SelectedItem & any): string => {
    let description = '';

    const cleanSetName = item.cardId?.setId?.setName || item.setName || '';
    const cleanCardName = item.cardId?.cardName || item.cardName || item.name || '';

    if (cleanSetName && cleanCardName) {
      description += `${cleanSetName} ${cleanCardName}`;
    } else if (cleanCardName) {
      description += cleanCardName;
    }

    if (item.type === 'psa' && item.grade) {
      description += ` PSA ${item.grade}`;
    } else if (item.type === 'raw' && item.condition) {
      description += ` (${item.condition})`;
    }

    description += '\n\nFlotte pokemon kort i perfekt stand. Hurtig og sikker forsendelse.';
    return description;
  };

  // Item management functions
  const handleItemToggle = (item: any, type: 'psa' | 'raw' | 'sealed') => {
    const itemId = item.id || (item as any)._id;
    const isSelected = selectedItems.some((selected) => selected.id === itemId);

    if (process.env.NODE_ENV === 'development') {
      console.log('[DBA EXPORT] Item toggle:', {
        item, type, itemId, isSelected,
        hasId: !!item.id,
        has_id: !!(item as any)._id,
      });
    }

    if (isSelected) {
      setSelectedItems(selectedItems.filter((selected) => selected.id !== itemId));
    } else {
      const selectedItem: SelectedItem = {
        id: itemId,
        type,
        name: getItemDisplayName(item, type),
        price: parseFloat(item.myPrice?.toString() || '0'),
        images: item.images || [],
        customTitle: undefined, // Initialize as undefined for proper controlled component handling
        customDescription: undefined, // Initialize as undefined for proper controlled component handling
        ...(type === 'psa' && {
          grade: item.grade,
          cardId: item.cardId,
          setName: item.cardId?.setId?.setName,
        }),
        ...(type === 'raw' && {
          condition: item.condition,
          cardId: item.cardId,
          setName: item.cardId?.setId?.setName,
        }),
        ...(type === 'sealed' && {
          category: item.category,
          setName: item.setName,
        }),
      } as any;

      if (process.env.NODE_ENV === 'development') {
        console.log('[DBA EXPORT] Selected item:', selectedItem);
      }
      setSelectedItems([...selectedItems, selectedItem]);
    }
  };

  const updateItemCustomization = (
    itemId: string,
    field: 'customTitle' | 'customDescription',
    value: string
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DBA EXPORT] updateItemCustomization called:', { itemId, field, value });
    }
    
    setSelectedItems((prevItems) => 
      prevItems.map((item) => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Export functions
  const handleExportToDba = async () => {
    if (selectedItems.length === 0) {
      handleApiError(new Error('No items selected'), 'No items selected');
      return;
    }

    setIsExporting(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DBA EXPORT] Starting export for', selectedItems.length, 'items');
      }

      // Add items to DBA selection tracking
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DBA EXPORT] Adding items to DBA selection tracking...');
        }
        const itemsToAdd = selectedItems.map((item) => ({
          itemId: item.id,
          itemType: item.type,
        }));

        await dbaSelectionApi.addToDbaSelection(itemsToAdd);
        if (process.env.NODE_ENV === 'development') {
          console.log('[DBA EXPORT] Items added to DBA selection tracking');
        }
      } catch (dbaAddError) {
        console.warn('[DBA EXPORT] Could not add items to DBA selection tracking:', dbaAddError);
      }

      // Prepare export data
      const exportData = {
        items: selectedItems,
        customDescription,
      };

      const response = await exportApi.exportToDba(exportData);

      if (process.env.NODE_ENV === 'development') {
        console.log('[DBA EXPORT] Export successful:', response);
      }
      setExportResult(response);

      // Invalidate DBA selections cache to show countdown timers
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DBA EXPORT] Invalidating DBA selections cache to show countdown timers...');
        }
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.dbaSelections({ active: true }) 
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('[DBA EXPORT] DBA selections cache invalidated successfully');
        }
      } catch (dbaError) {
        console.warn('[DBA EXPORT] Could not invalidate DBA selections cache:', dbaError);
      }

      const itemCount = response?.itemCount || 0;
      if (process.env.NODE_ENV === 'development') {
        console.log('[DBA EXPORT] Final export stats:', {
          expectedCount: selectedItems.length,
          actualValue: response?.itemCount,
          finalItemCount: itemCount,
        });
      }
      showSuccessToast(
        `DBA export generated successfully! ${itemCount} items exported and added to DBA tracking.`
      );
    } catch (err) {
      handleApiError(err, 'Failed to export to DBA format');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadZip = async () => {
    try {
      setIsExporting(true);
      await exportApi.downloadDbaZip();
    } catch (err) {
      handleApiError(err, 'Failed to download DBA export');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    // Collection data
    psaCards,
    rawCards,
    sealedProducts,
    loading,
    
    // DBA state
    selectedItems,
    customDescription,
    setCustomDescription,
    isExporting,
    exportResult,
    dbaSelections,
    error,
    loadingDbaSelections,
    
    // Utility functions
    getDbaInfo,
    getItemDisplayName,
    generateDefaultTitle,
    generateDefaultDescription,
    
    // Actions
    handleItemToggle,
    updateItemCustomization,
    handleExportToDba,
    downloadZip,
  };
};