/**
 * useCardSelection Hook - State Management Version
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Provides card selection state management for AddEditCardForm
 * Supports preset-based configuration for different card types
 */

import { useCallback, useState } from 'react';

interface SelectedCard {
  id: string;
  cardName: string;
  setId?: {
    setName: string;
  };
  setName?: string;
  cardNumber?: string;
  variety?: string;

  [key: string]: any;
}

interface UseCardSelectionConfig {
  preset: 'rawCard' | 'psaCard';
}

interface UseCardSelectionReturn {
  selectedCard: SelectedCard | null;
  setSelectedCard: (card: SelectedCard | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearSelection: () => void;
}

/**
 * Card Selection State Hook
 * Manages card selection state and search query for form components
 */
export const useCardSelection = (
  config: UseCardSelectionConfig
): UseCardSelectionReturn => {
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearSelection = useCallback(() => {
    setSelectedCard(null);
    setSearchQuery('');
  }, []);

  return {
    selectedCard,
    setSelectedCard,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    clearSelection,
  };
};

/**
 * Preset configurations for card selection patterns
 */
export const cardSelectionPresets = {
  rawCard: 'rawCard' as const,
  psaCard: 'psaCard' as const,
};

export default useCardSelection;
