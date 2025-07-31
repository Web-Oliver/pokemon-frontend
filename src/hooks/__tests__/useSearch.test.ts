/**
 * Unit Tests for useSearch Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md testing principles:
 * - Tests search functionality with hierarchical logic
 * - Tests new API format integration
 * - Tests error handling and caching behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';
import { createMockApiResponse } from '../../test/setup';

// Mock the search API
vi.mock('../../api/searchApi', () => ({
  searchApi: {
    searchSetsOptimized: vi.fn(),
    searchCardsOptimized: vi.fn(),
    searchProductsOptimized: vi.fn(),
  },
}));

// Mock other API modules
vi.mock('../../api/cardsApi', () => ({
  getCardById: vi.fn(),
  getAllCards: vi.fn(),
}));

vi.mock('../../api/cardMarketRefProductsApi', () => ({
  getProductsBySet: vi.fn(),
  getAllProducts: vi.fn(),
}));

vi.mock('../../api/setsApi', () => ({
  getAllSets: vi.fn(),
  getSetByName: vi.fn(),
}));

// Mock error handler
vi.mock('../../utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  log: vi.fn(),
}));

// Test data
const mockSetResults = [
  {
    setName: 'Base Set',
    year: 1998,
    score: 100,
    source: 'unified-search',
    isExactMatch: true,
    searchScore: 100,
    relevanceScore: 100,
  },
  {
    setName: 'Jungle',
    year: 1999,
    score: 90,
    source: 'unified-search',
    isExactMatch: false,
    searchScore: 90,
    relevanceScore: 90,
  },
];

const mockCardResults = [
  {
    _id: 'card-1',
    cardName: 'Charizard',
    pokemonNumber: '4',
    baseName: 'Charizard',
    variety: 'Holo',
    setInfo: { setName: 'Base Set', year: 1998 },
    searchScore: 100,
    isExactMatch: true,
    relevanceScore: 100,
  },
  {
    _id: 'card-2',
    cardName: 'Blastoise',
    pokemonNumber: '9',
    baseName: 'Blastoise',
    variety: 'Holo',
    setInfo: { setName: 'Base Set', year: 1998 },
    searchScore: 90,
    isExactMatch: false,
    relevanceScore: 90,
  },
];

const mockProductResults = [
  {
    _id: 'product-1',
    name: 'Base Set Booster Box',
    setName: 'Base Set',
    category: 'booster-box',
    available: 10,
    price: 5000,
    searchScore: 100,
    isExactMatch: true,
    relevanceScore: 100,
  },
  {
    _id: 'product-2',
    name: 'Base Set Starter Deck',
    setName: 'Base Set',
    category: 'theme-deck',
    available: 25,
    price: 150,
    searchScore: 90,
    isExactMatch: false,
    relevanceScore: 90,
  },
];

describe('useSearch Hook', () => {
  let mockSearchApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSearchApi = vi.mocked((await import('../../api/searchApi')).searchApi);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedSet).toBeNull();
      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.activeField).toBeNull();
      expect(result.current.setName).toBe('');
      expect(result.current.categoryName).toBe('');
      expect(result.current.cardProductName).toBe('');
    });
  });

  describe('Set Search', () => {
    it('should update set name and trigger suggestions', async () => {
      mockSearchApi.searchSetsOptimized.mockResolvedValue(
        createMockApiResponse(mockSetResults)
      );

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateSetName('Base');
      });

      expect(result.current.setName).toBe('Base');
      expect(result.current.activeField).toBe('set');

      // Wait for debounced API call
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(mockSearchApi.searchSetsOptimized).toHaveBeenCalledWith({
        query: 'base',
        limit: 15,
      });
    });

    it('should clear suggestions when set name is empty', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateSetName('');
      });

      expect(result.current.setName).toBe('');
      expect(result.current.activeField).toBe('set');
      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('Card/Product Search', () => {
    it('should update card/product name and trigger suggestions', async () => {
      mockSearchApi.searchCardsOptimized.mockResolvedValue(
        createMockApiResponse(mockCardResults)
      );

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateCardProductName('Charizard');
      });

      expect(result.current.cardProductName).toBe('Charizard');
      expect(result.current.activeField).toBe('cardProduct');

      // Wait for debounced API call
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(mockSearchApi.searchCardsOptimized).toHaveBeenCalledWith({
        query: 'charizard',
        setName: undefined,
        limit: 15,
      });
    });

    it('should search products when in product mode', async () => {
      // Ensure mock is set up before using it
      mockSearchApi.searchProductsOptimized.mockResolvedValue(
        createMockApiResponse(mockProductResults)
      );

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.setSearchMode('products');
      });

      await act(async () => {
        result.current.updateCardProductName('Booster');
      });

      // Wait for debounced API call
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(mockSearchApi.searchProductsOptimized).toHaveBeenCalledWith({
        query: 'booster',
        setName: undefined,
        category: undefined,
        limit: 15,
      });
    });
  });

  describe('Suggestion Selection', () => {
    it('should handle set suggestion selection', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.handleSuggestionSelect(mockSetResults[0], 'set');
      });

      expect(result.current.setName).toBe('Base Set');
      expect(result.current.selectedSet).toBe('Base Set');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.activeField).toBeNull();
      expect(result.current.cardProductName).toBe('');
    });

    it('should handle card suggestion selection with autofill', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.handleSuggestionSelect(
          mockCardResults[0],
          'cardProduct'
        );
      });

      expect(result.current.cardProductName).toBe('Charizard');
      expect(result.current.setName).toBe('Base Set');
      expect(result.current.selectedSet).toBe('Base Set');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.activeField).toBeNull();
    });

    it('should handle product suggestion selection with autofill', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.handleSuggestionSelect(
          mockProductResults[0],
          'cardProduct'
        );
      });

      expect(result.current.cardProductName).toBe('Base Set Booster Box');
      expect(result.current.setName).toBe('Base Set');
      expect(result.current.selectedSet).toBe('Base Set');
      expect(result.current.categoryName).toBe('booster-box');
      expect(result.current.selectedCategory).toBe('booster-box');
    });
  });

  describe('State Management', () => {
    it('should clear search state', async () => {
      const { result } = renderHook(() => useSearch());

      // Set some state first
      await act(async () => {
        result.current.updateSetName('Base');
        result.current.updateCardProductName('Charizard');
      });

      // Clear the state
      await act(async () => {
        result.current.clearSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedCardData).toBeNull();
    });

    it('should clear selected set', async () => {
      const { result } = renderHook(() => useSearch());

      // Set some state first
      await act(async () => {
        result.current.handleSuggestionSelect(mockSetResults[0], 'set');
      });

      expect(result.current.selectedSet).toBe('Base Set');

      // Clear selected set
      await act(async () => {
        result.current.clearSelectedSet();
      });

      expect(result.current.selectedSet).toBeNull();
      expect(result.current.setName).toBe('');
    });

    it('should set active field', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.setActiveField('set');
      });

      expect(result.current.activeField).toBe('set');

      await act(async () => {
        result.current.setActiveField(null);
      });

      expect(result.current.activeField).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockSearchApi.searchSetsOptimized.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateSetName('Invalid');
      });

      // Wait for debounced API call and error handling
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('Main Search Functionality', () => {
    it('should perform main search and update results', async () => {
      mockSearchApi.searchCardsOptimized.mockResolvedValue(
        createMockApiResponse(mockCardResults)
      );

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.handleSearch('Charizard');
      });

      expect(mockSearchApi.searchCardsOptimized).toHaveBeenCalledWith({
        query: 'Charizard',
        setName: undefined,
        limit: 50,
      });

      expect(result.current.searchTerm).toBe('Charizard');
      expect(result.current.searchResults).toHaveLength(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.searchMeta?.queryTime).toBeDefined();
    });

    it('should clear search when query is empty', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.handleSearch('');
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('Best Match Functionality', () => {
    it('should get best match for a query', async () => {
      mockSearchApi.searchCardsOptimized.mockResolvedValue(
        createMockApiResponse([mockCardResults[0]])
      );

      const { result } = renderHook(() => useSearch());

      let bestMatch: any;
      await act(async () => {
        bestMatch = await result.current.getBestMatch('Charizard');
      });

      expect(mockSearchApi.searchCardsOptimized).toHaveBeenCalledWith({
        query: 'Charizard',
        setName: undefined,
        limit: 1,
      });

      expect(bestMatch).toEqual(mockCardResults[0]);
    });

    it('should return null when no best match found', async () => {
      mockSearchApi.searchCardsOptimized.mockResolvedValue(
        createMockApiResponse([])
      );

      const { result } = renderHook(() => useSearch());

      let bestMatch: any;
      await act(async () => {
        bestMatch = await result.current.getBestMatch('Unknown');
      });

      expect(bestMatch).toBeNull();
    });
  });

  describe('Hierarchical Search Logic', () => {
    it('should filter searches by selected set', async () => {
      mockSearchApi.searchCardsOptimized.mockResolvedValue(
        createMockApiResponse(mockCardResults)
      );

      const { result } = renderHook(() => useSearch());

      // First select a set
      await act(async () => {
        result.current.handleSuggestionSelect(mockSetResults[0], 'set');
      });

      // Then search for cards
      await act(async () => {
        result.current.updateCardProductName('Charizard');
      });

      // Wait for debounced API call
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(mockSearchApi.searchCardsOptimized).toHaveBeenCalledWith({
        query: 'charizard',
        setName: 'Base Set',
        limit: 15,
      });
    });

    it('should filter products by selected category', async () => {
      mockSearchApi.searchProductsOptimized.mockResolvedValue(
        createMockApiResponse(mockProductResults)
      );

      const { result } = renderHook(() => useSearch());

      // Set product mode
      await act(async () => {
        result.current.setSearchMode('products');
      });

      // Select a category through suggestion
      await act(async () => {
        result.current.handleSuggestionSelect(
          { category: 'booster-box' },
          'category'
        );
      });

      // Search for products
      await act(async () => {
        result.current.updateCardProductName('Booster');
      });

      // Wait for debounced API call
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(mockSearchApi.searchProductsOptimized).toHaveBeenCalledWith({
        query: 'booster',
        setName: undefined,
        category: 'booster-box',
        limit: 15,
      });
    });
  });

  describe('Configuration', () => {
    it('should switch search modes', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.setSearchMode('products');
      });

      // Mode change affects which API is called for card/product search
      mockSearchApi.searchProductsOptimized.mockResolvedValue(
        createMockApiResponse(mockProductResults)
      );

      await act(async () => {
        result.current.updateCardProductName('Box');
      });

      // Wait for debounced API call
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });

      expect(mockSearchApi.searchProductsOptimized).toHaveBeenCalled();
    });
  });
});
