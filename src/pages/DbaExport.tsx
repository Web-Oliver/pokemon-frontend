/**
 * DBA.dk Export Page
 *
 * Allows users to select collection items and export them as DBA.dk posts
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles DBA export functionality
 * - Layer 4: Application Screen
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle,
  Package,
  Star,
  Archive,
  FileDown,
  Settings,
  Timer,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { PageLayout } from '../components/layouts/PageLayout';
import { useExportOperations } from '../hooks/useExportOperations';
import { navigationHelper } from '../utils/navigation';
import { ButtonLoading } from '../components/common/LoadingStates';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ImageSlideshow } from '../components/common/ImageSlideshow';
import { ImageProductView } from '../components/common/ImageProductView';
import { formatCardNameForDisplay } from '../utils/formatting';
import * as exportApi from '../api/exportApi';
import * as dbaSelectionApi from '../api/dbaSelectionApi';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';

interface SelectedItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  name: string;
  price: number;
  images: string[];
  customTitle?: string;
  customDescription?: string;
  // Additional properties for title generation
  grade?: number;
  condition?: string;
  category?: string;
}

const DbaExport: React.FC = () => {
  const { psaCards, rawCards, sealedProducts, loading } = useCollectionOperations();

  // Debug logging for collection data
  useEffect(() => {
    console.log('[DBA EXPORT] Collection data loaded:', {
      psaCards: psaCards.length,
      rawCards: rawCards.length,
      sealedProducts: sealedProducts.length,
      samplePsaCard: psaCards[0],
      sampleRawCard: rawCards[0],
      sampleSealedProduct: sealedProducts[0],
    });
  }, [psaCards, rawCards, sealedProducts]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<any>(null);
  const [dbaSelections, setDbaSelections] = useState<dbaSelectionApi.DbaSelection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingDbaSelections, setLoadingDbaSelections] = useState(true);

  // Load DBA selections with retry logic
  useEffect(() => {
    const loadDbaSelections = async (retryCount = 0) => {
      try {
        console.log(
          '[DBA EXPORT] Loading DBA selections...',
          retryCount > 0 ? `(retry ${retryCount})` : ''
        );
        const selections = await dbaSelectionApi.getDbaSelections(true); // Only active selections
        console.log('[DBA EXPORT] Loaded DBA selections:', selections);
        setDbaSelections(selections.data || []);
      } catch (err) {
        // Log for debugging but use centralized error handling

        // Retry once after a short delay if it's a network error
        if (retryCount === 0 && (err as any).code === 'ERR_NETWORK') {
          console.log('[DBA EXPORT] Retrying DBA selections load in 1 second...');
          setTimeout(() => loadDbaSelections(1), 1000);
          return;
        }

        // After retry fails or for other errors, gracefully handle the failure
        console.log('[DBA EXPORT] DBA selection API unavailable, continuing with empty data');
        setDbaSelections([]);
        setError(null); // Clear error to allow page to function without DBA data
      } finally {
        setLoadingDbaSelections(false);
      }
    };

    loadDbaSelections();
  }, []);

  // Get DBA selection info for an item
  const getDbaInfo = (itemId: string, itemType: string) => {
    return dbaSelections?.find(
      selection => selection.itemId === itemId && selection.itemType === itemType
    );
  };

  // Handle item selection
  const handleItemToggle = (item: any, type: 'psa' | 'raw' | 'sealed') => {
    const itemId = item.id || (item as any)._id;
    const isSelected = selectedItems.some(selected => selected.id === itemId);

    console.log('[DBA EXPORT] Item toggle:', {
      item,
      type,
      itemId,
      isSelected,
      hasId: !!item.id,
      has_id: !!(item as any)._id,
    });

    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== itemId));
    } else {
      const selectedItem: SelectedItem = {
        id: itemId,
        type,
        name: getItemDisplayName(item, type),
        price: parseFloat(item.myPrice?.toString() || '0'),
        images: item.images || [],
        // Store additional data needed for title generation
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
      console.log('[DBA EXPORT] Selected item:', selectedItem);
      setSelectedItems([...selectedItems, selectedItem]);
    }
  };

  // Get display name for an item
  const getItemDisplayName = (item: any, type: string): string => {
    let name = '';

    if (type === 'sealed') {
      name = item.name || 'Unknown Product';
    } else {
      const cardName = item.cardId?.cardName || item.cardName || 'Unknown Card';
      name = formatCardNameForDisplay(cardName);
    }

    return name;
  };

  // Update individual item customization
  const updateItemCustomization = (
    itemId: string,
    field: 'customTitle' | 'customDescription',
    value: string
  ) => {
    setSelectedItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          // For title field, ensure we store the actual user input
          // For description field, ensure we store the actual user input
          // The getCurrentTitle/getCurrentDescription functions will handle fallbacks to defaults
          const updatedItem = { ...item, [field]: value };

          // If the value matches the default, we can store it as custom to maintain user intent
          // This ensures the user sees their input when editing again
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Complete Pokemon Name Shortener (copied from backend)
  const POKEMON_ABBREVIATIONS = {
    // Generation/Series Abbreviations
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

    // Promo Abbreviations
    'Black Star Promo': 'Promo',
    'World Championships': 'World',
    'World Championship': 'World',
    'Corocoro Comics': 'Corocoro',
    'CoroCoro Comics': 'Corocoro',
    'Pokemon Center': 'PC',
    'Pokémon Center': 'PC',

    // Common Set Types
    'Starter Set': 'Starter',
    'Theme Deck': 'Theme',
    'Elite Trainer Box': 'ETB',
    'Collection Box': 'Collection',
    'Premium Collection': 'Premium',
    'Gift Set': 'Gift',
    'Battle Deck': 'Battle',

    // Language Prefixes
    Japanese: 'Japanese',
    Korean: 'Korean',
    Chinese: 'Chinese',
    German: 'German',
    French: 'French',
    Italian: 'Italian',
    Spanish: 'Spanish',
  };

  const shortenSetName = (originalName: string): string => {
    if (!originalName || typeof originalName !== 'string') {
      return originalName || '';
    }

    let processedName = originalName.trim();

    // Step 1: Apply special rules
    // Corocoro special case
    const corocoroPattern = /Pokemon Japanese Corocoro Comics? Promo \((\d+)\)/i;
    if (corocoroPattern.test(processedName)) {
      processedName = processedName.replace(corocoroPattern, 'Corocoro $1');
      return processedName;
    }

    // World championship special case
    const worldPattern = /Pokemon Diamond Pearl World (\d+) Promo \((\d+)\)/i;
    if (worldPattern.test(processedName)) {
      processedName = processedName.replace(worldPattern, 'D&P Promo $2');
      return processedName;
    }

    // General promo year extraction
    const promoYearPattern = /(.+) Promo \((\d+)\)$/i;
    if (promoYearPattern.test(processedName)) {
      processedName = processedName.replace(promoYearPattern, '$1 Promo $2');
    }

    // Step 2: Remove "Pokemon" prefix but preserve language indicators
    processedName = processedName.replace(/^Pokemon\s+/i, '');

    // Step 3: Apply standard abbreviations
    Object.entries(POKEMON_ABBREVIATIONS).forEach(([fullForm, abbreviation]) => {
      const regex = new RegExp(fullForm, 'gi');
      if (regex.test(processedName)) {
        processedName = processedName.replace(regex, abbreviation);
      }
    });

    // Step 4: Clean up the result
    processedName = processedName
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*\(\s*\)/g, '') // Remove empty parentheses
      .trim(); // Remove leading/trailing whitespace

    return processedName;
  };

  // Generate default title for an item (full logic moved from backend)
  const generateDefaultTitle = (item: SelectedItem & any): string => {
    const parts = ['Pokemon Kort'];

    if (item.type === 'sealed') {
      // For sealed products: "Pokemon Kort" (product name) Sealed
      // Examples:
      // - "Pokemon Kort Tag Team Reshiram & Charizard GX Premium Collection Box Sealed"
      // - "Pokemon Kort GG End Booster Box Sealed"
      // - "Pokemon Kort Sword & Shield Figure Collection Sealed"

      const productName = item.name || '';
      if (productName) {
        // Clean the product name - remove redundant words and fix formatting
        const cleanName = productName
          .replace(/pokemon/gi, '') // Remove "Pokemon" since we already have "Pokemon Kort"
          .replace(/pokémon/gi, '') // Remove "Pokémon" variants
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();

        // If the product name doesn't already contain "Box", "Collection", etc., keep it as is
        // The examples show we want the full descriptive name
        if (cleanName) {
          parts.push(cleanName);
        }
      }
      parts.push('Sealed');
    } else {
      // For cards: "Pokemon Kort" (shortened set name) (card name) (pokemon number) PSA (grade)
      const setName = item.cardId?.setId?.setName || item.setName || '';
      const cardName = item.cardId?.cardName || item.cardName || item.name || '';
      const pokemonNumber = item.cardId?.pokemonNumber || '';

      const shortenedSet = shortenSetName(setName);
      if (shortenedSet) {
        parts.push(shortenedSet);
      }

      if (cardName) {
        // Clean card name
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

    // Join parts and ensure max length (80 chars) - SMART TRUNCATION FROM BACKEND
    let fullTitle = parts.join(' ');

    if (fullTitle.length > 80) {
      // Truncate smartly - keep most important parts (like backend)
      const shortenedSet =
        item.type === 'sealed'
          ? shortenSetName(item.setName || '')
          : shortenSetName(item.cardId?.setId?.setName || item.setName || '');
      const baseTitle = `Pokemon Kort ${shortenedSet} `;
      const remaining = 80 - baseTitle.length - 10; // Reserve space for suffix

      const cardName =
        item.type === 'sealed'
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

      // Final length check
      if (fullTitle.length > 80) {
        fullTitle = `${fullTitle.substring(0, 77)}...`;
      }
    }

    return fullTitle;
  };

  // Get current or default title for an item (for editing UI only)
  const getCurrentTitle = (item: SelectedItem): string => {
    return item.customTitle || generateDefaultTitle(item);
  };

  // Get current or default description for an item (for editing UI only)
  const getCurrentDescription = (item: SelectedItem): string => {
    return item.customDescription || generateDefaultDescription(item);
  };

  // Generate default description for an item (full backend logic)
  const generateDefaultDescription = (item: SelectedItem & any): string => {
    const baseDesc =
      customDescription.trim() ||
      'Kan afhentes i København eller sendes med GLS, Jeg er ikke interesseret i at bytte.';

    let description = '';

    // Add full item details (like backend)
    const setName = item.cardId?.setId?.setName || item.setName || '';
    const cardName = item.cardId?.cardName || item.cardName || item.name || '';

    // Clean up card name - remove dashes, fix "1st Edition", and remove "holo"
    const cleanCardName = cardName
      .replace(/-/g, ' ')
      .replace(/1st Edition/gi, '1 Ed')
      .replace(/\bholo\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const cleanSetName = setName.replace(/-/g, ' ').replace(/1st Edition/gi, '1 Ed');

    if (cleanSetName && cleanCardName) {
      description += `${cleanSetName} ${cleanCardName}`;
    } else if (cleanCardName) {
      description += cleanCardName;
    }

    // Add condition/grade info
    if (item.type === 'psa' && item.grade) {
      description += ` PSA ${item.grade}`;
    } else if (item.type === 'raw' && item.condition) {
      description += ` (${item.condition})`;
    }
    // For sealed products, don't add anything extra - just the name and standard text

    // Add standard Danish text
    description += `. ${baseDesc}`;

    return description.trim();
  };

  // Handle export to DBA
  const handleExportToDba = async () => {
    if (selectedItems.length === 0) {
      handleApiError(new Error('Please select at least one item to export'), 'No items selected');
      return;
    }

    setIsExporting(true);

    try {
      console.log('[DBA EXPORT] Starting export for', selectedItems.length, 'items');

      // FIRST: Add items to DBA selection tracking to start countdown timers
      try {
        console.log('[DBA EXPORT] Adding items to DBA selection tracking...');
        const itemsToAdd = selectedItems.map(item => ({
          itemId: item.id,
          itemType: item.type,
          notes: 'Added via DBA export',
        }));

        await dbaSelectionApi.addToDbaSelection(itemsToAdd);
        console.log('[DBA EXPORT] Items added to DBA selection tracking');
      } catch (dbaAddError) {
        console.warn('[DBA EXPORT] Could not add items to DBA selection tracking:', dbaAddError);
        // Continue with export even if DBA tracking fails
      }

      // SECOND: Prepare export data
      const exportData = {
        items: selectedItems.map(item => ({
          id: item.id,
          type: item.type,
          // Only send custom title/description if they exist and are different from defaults
          customTitle: item.customTitle?.trim() || null,
          customDescription: item.customDescription?.trim() || null,
        })),
        customDescription: customDescription.trim(),
        includeMetadata: true,
      };

      // THIRD: Call export API
      const response = await exportApi.exportToDba(exportData);

      console.log('[DBA EXPORT] Export successful:', response);
      setExportResult(response.data);

      // FOURTH: Reload DBA selections to show updated countdown timers
      try {
        console.log('[DBA EXPORT] Reloading DBA selections to show countdown timers...');
        const updatedSelections = await dbaSelectionApi.getDbaSelections(true);
        setDbaSelections(updatedSelections);
        console.log(
          '[DBA EXPORT] Successfully reloaded DBA selections with',
          updatedSelections.length,
          'items'
        );
      } catch (dbaError) {
        console.warn('[DBA EXPORT] Could not reload DBA selections:', dbaError);
        // Continue without DBA selection data - this is not critical for export functionality
      }

      showSuccessToast(
        `DBA export generated successfully! ${response.data.itemCount} items exported and added to DBA tracking.`
      );
    } catch (err) {
      handleApiError(err, 'Failed to export to DBA format');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle download ZIP
  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);

      await exportApi.downloadDbaZip();
      showSuccessToast('DBA export ZIP downloaded successfully!');
    } catch (err) {
      handleApiError(err, 'Failed to download DBA export');
    } finally {
      setIsExporting(false);
    }
  };

  // Get item icon based on type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'psa':
        return <Star className='w-4 h-4 text-yellow-500' />;
      case 'raw':
        return <Package className='w-4 h-4 text-emerald-500' />;
      case 'sealed':
        return <Archive className='w-4 h-4 text-purple-500' />;
      default:
        return <Package className='w-4 h-4 text-gray-500' />;
    }
  };

  // Render item card
  const renderItemCard = (item: any, type: 'psa' | 'raw' | 'sealed') => {
    const itemId = item.id || (item as any)._id;
    const isSelected = selectedItems.some(selected => selected.id === itemId);
    const displayName = getItemDisplayName(item, type);
    const dbaInfo = getDbaInfo(itemId, type);

    let subtitle = '';
    if (type === 'psa' && item.grade) {
      subtitle = `PSA ${item.grade}`;
    } else if (type === 'raw' && item.condition) {
      subtitle = item.condition;
    } else if (type === 'sealed' && item.category) {
      subtitle = item.category;
    }

    const price = parseFloat(item.myPrice?.toString() || '0');

    // Get countdown color based on days remaining
    const getCountdownColor = (daysRemaining: number) => {
      if (daysRemaining > 30) {
        return 'text-green-300 bg-green-900/30 border-green-600';
      }
      if (daysRemaining > 10) {
        return 'text-yellow-300 bg-yellow-900/30 border-yellow-600';
      }
      return 'text-red-300 bg-red-900/30 border-red-600';
    };

    return (
      <div
        key={itemId}
        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 flex flex-col h-full ${
          isSelected
            ? 'border-cyan-500 bg-cyan-900/30'
            : 'border-zinc-600 bg-zinc-800 hover:border-cyan-400 hover:bg-cyan-900/20'
        }`}
        onClick={() => handleItemToggle(item, type)}
      >
        {/* Selection Indicator */}
        <div className='absolute top-3 right-3'>
          {isSelected ? (
            <CheckCircle className='w-6 h-6 text-indigo-600' />
          ) : (
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
              }`}
            >
              {isSelected && <CheckCircle className='w-3 h-3 text-white' />}
            </div>
          )}
        </div>

        {/* DBA Countdown Badge */}
        {dbaInfo && (
          <div className='absolute top-3 left-3'>
            <div
              className={`px-2 py-1 rounded-lg text-xs font-medium border ${getCountdownColor(dbaInfo.daysRemaining)}`}
            >
              <Timer className='w-3 h-3 inline mr-1' />
              {dbaInfo.daysRemaining}d left
            </div>
          </div>
        )}

        {/* Standardized Image Product View */}
        <div className='w-full mb-3 pointer-events-none'>
          <ImageProductView
            images={item.images || []}
            title={displayName}
            subtitle={subtitle}
            price={price}
            type={type}
            grade={type === 'psa' ? item.grade : undefined}
            condition={type === 'raw' ? item.condition : undefined}
            category={type === 'sealed' ? item.category : undefined}
            sold={false}
            variant='card'
            size='md'
            aspectRatio='card'
            showBadge={true}
            showPrice={true}
            showActions={false}
            enableInteractions={false}
            className='w-full h-72'
          />
        </div>

        {/* DBA Selection Info */}
        <div className='mt-auto'>
          {dbaInfo ? (
            <div className='bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg p-2 border border-blue-600'>
              <div className='flex items-center text-xs font-medium text-blue-300 mb-1'>
                <Calendar className='w-3 h-3 mr-1' />
                Selected for DBA
              </div>
              <div className='text-xs text-blue-400'>
                {dbaInfo.daysSelected} days ago • {dbaInfo.daysRemaining} days left
              </div>
            </div>
          ) : (
            <div className='bg-zinc-700 rounded-lg p-2 border border-zinc-600'>
              <div className='text-xs text-zinc-300 text-center'>Not selected for DBA</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const { exportCollectionData } = useExportOperations();

  // Combine all collection items for export
  const allItems = [...psaCards, ...rawCards, ...sealedProducts];

  const headerActions = (
    <button
      onClick={() => exportCollectionData(allItems, 'all')}
      className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105'
    >
      <Download className='w-5 h-5 mr-2' />
      Export All
    </button>
  );

  return (
    <PageLayout
      title='DBA Export'
      subtitle='Export your collection data for external analysis'
      loading={loading}
      error={error}
      actions={headerActions}
      variant='default'
    >
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-10'>
          {/* Header */}
          <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-10'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-zinc-100 tracking-wide mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
                  Export to DBA.dk
                </h1>
                <p className='text-xl text-zinc-300 font-medium'>
                  Select items to export as DBA.dk posts with images and descriptions
                </p>
              </div>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <p className='text-sm text-zinc-400'>Items for DBA</p>
                  <p className='text-2xl font-bold text-cyan-400'>{dbaSelections?.length || 0}</p>
                </div>
                <div>
                  <p className='text-sm text-zinc-400'>Expiring Soon</p>
                  <p className='text-2xl font-bold text-red-600'>
                    {dbaSelections?.filter(s => s.daysRemaining <= 10).length || 0}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-zinc-400'>Selected for Export</p>
                  <p className='text-2xl font-bold text-cyan-400'>{selectedItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Configuration */}
          {selectedItems.length > 0 && (
            <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-8'>
              <h2 className='text-2xl font-bold text-zinc-100 mb-6 flex items-center'>
                <Settings className='w-6 h-6 mr-3 text-cyan-400' />
                Export Configuration
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-zinc-300 mb-2'>
                    Custom Description Prefix (Optional)
                  </label>
                  <Input
                    value={customDescription}
                    onChange={e => setCustomDescription(e.target.value)}
                    placeholder='e.g., Sjældent samler kort...'
                    className='w-full'
                  />
                  <p className='text-xs text-zinc-400 mt-1'>
                    This text will be added before the auto-generated description
                  </p>
                </div>

                {/* Individual Item Customization */}
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-4 flex items-center'>
                    <Settings className='w-5 h-5 mr-2 text-cyan-400' />
                    Customize Individual Items
                  </h3>
                  <div className='space-y-4 max-h-96 overflow-y-auto'>
                    {selectedItems.map(item => (
                      <div
                        key={item.id}
                        className='p-4 bg-zinc-800 rounded-xl border border-zinc-600'
                      >
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex items-center flex-1'>
                            {item.images.length > 0 && (
                              <img
                                src={`http://localhost:3000${item.images[0]}`}
                                alt={item.name}
                                className='w-12 h-12 object-cover rounded-lg mr-3 shadow-lg hover:shadow-xl transition-shadow duration-300'
                              />
                            )}
                            <div>
                              <h4 className='text-sm font-medium text-zinc-100'>{item.name}</h4>
                              <p className='text-xs text-zinc-400 capitalize'>
                                {item.type} • {item.price} DKK
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              if (editingItem === item.id) {
                                setEditingItem(null);
                              } else {
                                // When starting to edit, pre-populate with defaults if not already customized
                                if (!item.customTitle) {
                                  updateItemCustomization(
                                    item.id,
                                    'customTitle',
                                    generateDefaultTitle(item)
                                  );
                                }
                                if (!item.customDescription) {
                                  updateItemCustomization(
                                    item.id,
                                    'customDescription',
                                    generateDefaultDescription(item)
                                  );
                                }
                                setEditingItem(item.id);
                              }
                            }}
                            className='text-xs px-3 py-1 bg-cyan-900/50 text-cyan-300 hover:bg-cyan-900/70'
                          >
                            {editingItem === item.id ? 'Done' : 'Edit'}
                          </Button>
                        </div>

                        {editingItem === item.id && (
                          <div className='space-y-3 pt-3 border-t border-zinc-600'>
                            <div>
                              <label className='block text-xs font-medium text-zinc-300 mb-1'>
                                Custom Title (Max 80 characters)
                              </label>
                              <Input
                                value={getCurrentTitle(item)}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value.length <= 80) {
                                    updateItemCustomization(item.id, 'customTitle', value);
                                  }
                                }}
                                placeholder='Enter custom title or edit the default'
                                className='text-sm'
                                maxLength={80}
                              />
                              <div className='flex justify-between items-center mt-1'>
                                <p className='text-xs text-zinc-400'>
                                  Edit the pre-filled default title as needed
                                </p>
                                <span
                                  className={`text-xs ${
                                    getCurrentTitle(item).length > 70
                                      ? 'text-red-400'
                                      : 'text-zinc-500'
                                  }`}
                                >
                                  {getCurrentTitle(item).length}/80
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className='block text-xs font-medium text-zinc-300 mb-1'>
                                Custom Description
                              </label>
                              <textarea
                                value={getCurrentDescription(item)}
                                onChange={e =>
                                  updateItemCustomization(
                                    item.id,
                                    'customDescription',
                                    e.target.value
                                  )
                                }
                                placeholder='Enter custom description or edit the default'
                                className='w-full text-sm p-2 border border-zinc-600 bg-zinc-700 text-zinc-100 rounded-lg resize-none'
                                rows={3}
                              />
                              <p className='text-xs text-zinc-400 mt-1'>
                                Edit the pre-filled default description as needed
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-3'>
                  <Button
                    onClick={handleExportToDba}
                    disabled={isExporting}
                    className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  >
                    {isExporting ? (
                      <ButtonLoading text='Exporting...' />
                    ) : (
                      <>
                        <Download className='w-4 h-4 mr-2' />
                        Export to DBA
                      </>
                    )}
                  </Button>

                  {exportResult && (
                    <Button
                      onClick={handleDownloadZip}
                      disabled={isExporting}
                      className='w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    >
                      <FileDown className='w-4 h-4 mr-2' />
                      Download ZIP
                    </Button>
                  )}
                </div>

                {exportResult && (
                  <div className='mt-4 p-4 bg-green-50 rounded-xl border border-green-200'>
                    <h3 className='font-semibold text-green-800 mb-2'>Export Successful!</h3>
                    <p className='text-sm text-green-700'>
                      Generated {exportResult.itemCount} DBA posts. Files saved to:{' '}
                      {exportResult.dataFolder}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Item Selection - Split into 2 sections */}
          <div className='space-y-8'>
            {/* Section 1: Items with DBA Timers (Previously Selected) */}
            {(() => {
              // Get all items that have been previously selected for DBA
              const psaWithTimers = psaCards.filter(card => getDbaInfo(card.id || card._id, 'psa'));
              const rawWithTimers = rawCards.filter(card => getDbaInfo(card.id || card._id, 'raw'));
              const sealedWithTimers = sealedProducts.filter(product =>
                getDbaInfo(product.id || product._id, 'sealed')
              );

              const totalWithTimers =
                psaWithTimers.length + rawWithTimers.length + sealedWithTimers.length;

              if (totalWithTimers === 0) {
                return null;
              }

              return (
                <div className='bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-600/50 p-8'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold text-blue-100 flex items-center'>
                      <Timer className='w-6 h-6 mr-3 text-blue-600' />
                      Items with DBA Timers ({totalWithTimers})
                    </h2>
                    <div className='text-sm text-blue-300 bg-blue-900/50 px-3 py-1 rounded-lg border border-blue-600'>
                      Previously selected for DBA
                    </div>
                  </div>

                  {/* PSA Cards with Timers */}
                  {psaWithTimers.length > 0 && (
                    <div className='mb-8'>
                      <h3 className='text-lg font-semibold text-blue-200 mb-4 flex items-center'>
                        <Star className='w-5 h-5 mr-2 text-yellow-500' />
                        PSA Graded Cards ({psaWithTimers.length})
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {psaWithTimers.map(card => renderItemCard(card, 'psa'))}
                      </div>
                    </div>
                  )}

                  {/* Raw Cards with Timers */}
                  {rawWithTimers.length > 0 && (
                    <div className='mb-8'>
                      <h3 className='text-lg font-semibold text-blue-200 mb-4 flex items-center'>
                        <Package className='w-5 h-5 mr-2 text-emerald-500' />
                        Raw Cards ({rawWithTimers.length})
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {rawWithTimers.map(card => renderItemCard(card, 'raw'))}
                      </div>
                    </div>
                  )}

                  {/* Sealed Products with Timers */}
                  {sealedWithTimers.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold text-blue-200 mb-4 flex items-center'>
                        <Archive className='w-5 h-5 mr-2 text-purple-500' />
                        Sealed Products ({sealedWithTimers.length})
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {sealedWithTimers.map(product => renderItemCard(product, 'sealed'))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Section 2: Items without DBA Timers (Available for Selection) */}
            {(() => {
              // Get all items that have NOT been previously selected for DBA
              const psaWithoutTimers = psaCards.filter(
                card => !getDbaInfo(card.id || card._id, 'psa')
              );
              const rawWithoutTimers = rawCards.filter(
                card => !getDbaInfo(card.id || card._id, 'raw')
              );
              const sealedWithoutTimers = sealedProducts.filter(
                product => !getDbaInfo(product.id || product._id, 'sealed')
              );

              const totalWithoutTimers =
                psaWithoutTimers.length + rawWithoutTimers.length + sealedWithoutTimers.length;

              if (totalWithoutTimers === 0) {
                return null;
              }

              return (
                <div className='bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-600/50 p-8'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold text-zinc-100 flex items-center'>
                      <Package className='w-6 h-6 mr-3 text-zinc-400' />
                      Available Items ({totalWithoutTimers})
                    </h2>
                    <div className='text-sm text-zinc-300 bg-zinc-700 px-3 py-1 rounded-lg border border-zinc-600'>
                      Ready for DBA selection
                    </div>
                  </div>

                  {/* PSA Cards without Timers */}
                  {psaWithoutTimers.length > 0 && (
                    <div className='mb-8'>
                      <h3 className='text-lg font-semibold text-zinc-200 mb-4 flex items-center'>
                        <Star className='w-5 h-5 mr-2 text-yellow-500' />
                        PSA Graded Cards ({psaWithoutTimers.length})
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {psaWithoutTimers.map(card => renderItemCard(card, 'psa'))}
                      </div>
                    </div>
                  )}

                  {/* Raw Cards without Timers */}
                  {rawWithoutTimers.length > 0 && (
                    <div className='mb-8'>
                      <h3 className='text-lg font-semibold text-zinc-200 mb-4 flex items-center'>
                        <Package className='w-5 h-5 mr-2 text-emerald-500' />
                        Raw Cards ({rawWithoutTimers.length})
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {rawWithoutTimers.map(card => renderItemCard(card, 'raw'))}
                      </div>
                    </div>
                  )}

                  {/* Sealed Products without Timers */}
                  {sealedWithoutTimers.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold text-zinc-200 mb-4 flex items-center'>
                        <Archive className='w-5 h-5 mr-2 text-purple-500' />
                        Sealed Products ({sealedWithoutTimers.length})
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {sealedWithoutTimers.map(product => renderItemCard(product, 'sealed'))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* No items message */}
          {psaCards.length === 0 && rawCards.length === 0 && sealedProducts.length === 0 && (
            <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-16 text-center'>
              <Package className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-zinc-100 mb-2'>No Items in Collection</h3>
              <p className='text-zinc-400'>
                Add some items to your collection first to export them to DBA.dk
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DbaExport;
