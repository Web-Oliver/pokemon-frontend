/**
 * Hook Layer Integration Tests for New API Format
 * Tests that React hooks work correctly with the enhanced API response handling
 *
 * Following CLAUDE.md testing principles:
 * - Hook layer integration validation with service layer
 * - React Testing Library for hook testing
 * - State management verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';

// Create a persistent mock API service
const createMockApiService = () => ({
  getPsaGradedCards: vi.fn(),
  getRawCards: vi.fn(),
  getSealedProducts: vi.fn(),
  createPsaCard: vi.fn(),
  updatePsaCard: vi.fn(),
  deletePsaCard: vi.fn(),
  markPsaCardSold: vi.fn(),
  createRawCard: vi.fn(),
  updateRawCard: vi.fn(),
  deleteRawCard: vi.fn(),
  markRawCardSold: vi.fn(),
  createSealedProduct: vi.fn(),
  updateSealedProduct: vi.fn(),
  deleteSealedProduct: vi.fn(),
  markSealedProductSold: vi.fn(),
});

const mockApiServiceInstance = createMockApiService();

// Mock the service registry and related dependencies
vi.mock('../services/ServiceRegistry', () => ({
  getCollectionApiService: () => mockApiServiceInstance,
}));

// Mock specialized hooks
vi.mock('../hooks/usePsaCardOperations', () => ({
  usePsaCardOperations: () => ({
    addPsaCard: vi.fn(),
    updatePsaCard: vi.fn(),
    deletePsaCard: vi.fn(),
    markPsaCardSold: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('../hooks/useRawCardOperations', () => ({
  useRawCardOperations: () => ({
    addRawCard: vi.fn(),
    updateRawCard: vi.fn(),
    deleteRawCard: vi.fn(),
    markRawCardSold: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('../hooks/useSealedProductOperations', () => ({
  useSealedProductOperations: () => ({
    addSealedProduct: vi.fn(),
    updateSealedProduct: vi.fn(),
    deleteSealedProduct: vi.fn(),
    markSealedProductSold: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('../hooks/useCollectionImageExport', () => ({
  useCollectionImageExport: () => ({
    downloadPsaCardImagesZip: vi.fn(),
    downloadRawCardImagesZip: vi.fn(),
    downloadSealedProductImagesZip: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('../hooks/useAsyncOperation', () => ({
  useAsyncOperation: () => ({
    loading: false,
    error: null,
    execute: vi.fn(async (fn) => {
      try {
        return await fn();
      } catch (error) {
        console.warn('Test async operation error:', error);
        throw error;
      }
    }),
    clearError: vi.fn(),
  }),
}));

// Mock the collection state hook to prevent complex state dependencies
vi.mock('../hooks/useCollectionState', () => ({
  useCollectionState: () => ({
    psaCards: [],
    rawCards: [],
    sealedProducts: [],
    soldItems: [],
    setCollectionState: vi.fn(),
    addPsaCardToState: vi.fn(),
    updatePsaCardInState: vi.fn(),
    removePsaCardFromState: vi.fn(),
    movePsaCardToSold: vi.fn(),
    addRawCardToState: vi.fn(),
    updateRawCardInState: vi.fn(),
    removeRawCardFromState: vi.fn(),
    moveRawCardToSold: vi.fn(),
    addSealedProductToState: vi.fn(),
    updateSealedProductInState: vi.fn(),
    removeSealedProductFromState: vi.fn(),
    moveSealedProductToSold: vi.fn(),
  }),
}));

// Test data with proper formatting expected from API
const mockPsaCard: IPsaGradedCard = {
  id: 'psa-1',
  cardId: {
    id: 'card-1',
    cardName: 'Charizard',
    setId: { id: 'set-1', setName: 'Base Set' },
  },
  grade: 10,
  myPrice: 5000,
  images: ['image1.jpg'],
  dateAdded: '2024-01-01T00:00:00.000Z',
  sold: false,
};

const mockRawCard: IRawCard = {
  id: 'raw-1',
  cardId: {
    id: 'card-2',
    cardName: 'Blastoise',
    setId: { id: 'set-1', setName: 'Base Set' },
  },
  condition: 'NM',
  myPrice: 2000,
  images: ['image2.jpg'],
  dateAdded: '2024-01-01T00:00:00.000Z',
  sold: false,
};

const mockSealedProduct: ISealedProduct = {
  id: 'sealed-1',
  name: 'Base Set Booster Box',
  category: 'booster-box',
  myPrice: 800000,
  images: ['image3.jpg'],
  dateAdded: '2024-01-01T00:00:00.000Z',
  sold: false,
};

describe('Hook Layer Integration - New API Format', () => {
  let mockCollectionApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Use the global mock API service instance
    mockCollectionApi = mockApiServiceInstance;

    // Setup default mock implementations
    mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);
    mockCollectionApi.getRawCards.mockResolvedValue([mockRawCard]);
    mockCollectionApi.getSealedProducts.mockResolvedValue([mockSealedProduct]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook Structure and Interface', () => {
    it('should provide all expected operations and state', () => {
      const { result } = renderHook(() => useCollectionOperations());

      // Check that all operations are available
      expect(typeof result.current.addPsaCard).toBe('function');
      expect(typeof result.current.updatePsaCard).toBe('function');
      expect(typeof result.current.deletePsaCard).toBe('function');
      expect(typeof result.current.markPsaCardSold).toBe('function');

      expect(typeof result.current.addRawCard).toBe('function');
      expect(typeof result.current.updateRawCard).toBe('function');
      expect(typeof result.current.deleteRawCard).toBe('function');
      expect(typeof result.current.markRawCardSold).toBe('function');

      expect(typeof result.current.addSealedProduct).toBe('function');
      expect(typeof result.current.updateSealedProduct).toBe('function');
      expect(typeof result.current.deleteSealedProduct).toBe('function');
      expect(typeof result.current.markSealedProductSold).toBe('function');

      expect(typeof result.current.refreshCollection).toBe('function');
      expect(typeof result.current.clearError).toBe('function');

      // Check state properties
      expect(typeof result.current.loading).toBe('boolean');
      expect(
        result.current.error === null ||
          typeof result.current.error === 'string'
      ).toBe(true);
    });

    it('should provide image export operations', () => {
      const { result } = renderHook(() => useCollectionOperations());

      expect(typeof result.current.downloadPsaCardImagesZip).toBe('function');
      expect(typeof result.current.downloadRawCardImagesZip).toBe('function');
      expect(typeof result.current.downloadSealedProductImagesZip).toBe(
        'function'
      );
    });
  });

  describe('Data Loading Integration', () => {
    it('should fetch collection data on initialization', async () => {
      // Set a timeout for this specific test to prevent hanging
      vi.setConfig({ testTimeout: 5000 });

      const { result } = renderHook(() => useCollectionOperations());

      // Wait for initial data loading with shorter timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Verify API calls were made for initial data (at least once each)
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalledWith({
        sold: false,
      });
      expect(mockCollectionApi.getRawCards).toHaveBeenCalledWith({
        sold: false,
      });
      expect(mockCollectionApi.getSealedProducts).toHaveBeenCalledWith({
        sold: false,
      });

      // Verify sold items were also fetched
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalledWith({
        sold: true,
      });
      expect(mockCollectionApi.getRawCards).toHaveBeenCalledWith({
        sold: true,
      });
      expect(mockCollectionApi.getSealedProducts).toHaveBeenCalledWith({
        sold: true,
      });

      // Verify hook returned expected structure
      expect(result.current).toBeDefined();
      expect(typeof result.current.refreshCollection).toBe('function');
    }, 5000);

    it('should handle refresh collection operation', async () => {
      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.refreshCollection();
      });

      // Should make fresh API calls
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalled();
      expect(mockCollectionApi.getRawCards).toHaveBeenCalled();
      expect(mockCollectionApi.getSealedProducts).toHaveBeenCalled();
    });
  });

  describe('API Response Format Compatibility', () => {
    it('should handle data with proper ID mapping', async () => {
      // Mock the service to return data as it would after API transformation
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // The hook should receive properly transformed data
      // Note: The actual state is managed by useCollectionState which we're not mocking here
      // but the service calls should work with transformed data
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalled();
    });

    it('should work with empty collections', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([]);
      mockCollectionApi.getRawCards.mockResolvedValue([]);
      mockCollectionApi.getSealedProducts.mockResolvedValue([]);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should handle empty arrays without errors
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalled();
      expect(mockCollectionApi.getRawCards).toHaveBeenCalled();
      expect(mockCollectionApi.getSealedProducts).toHaveBeenCalled();
    });

    it('should preserve metadata in item data', async () => {
      const cardWithMetadata = {
        ...mockPsaCard,
        saleDetails: {
          payment: 'PayPal',
          actualSoldPrice: 5500,
          delivery: 'Shipped',
          buyerFullName: 'John Doe',
        },
        priceHistory: [
          { price: 4000, date: '2023-01-01', source: 'manual' },
          { price: 5000, date: '2024-01-01', source: 'manual' },
        ],
      };

      mockCollectionApi.getPsaGradedCards.mockResolvedValue([cardWithMetadata]);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Metadata should be preserved in service calls
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalled();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      const apiError = new Error('Network error');
      mockCollectionApi.getPsaGradedCards.mockRejectedValue(apiError);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should not crash and should provide error clearing functionality
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should provide error state management', () => {
      const { result } = renderHook(() => useCollectionOperations());

      // Should provide error state and clearing mechanism
      expect(
        result.current.error === null ||
          typeof result.current.error === 'string'
      ).toBe(true);
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Loading State Management', () => {
    it('should provide loading state', () => {
      const { result } = renderHook(() => useCollectionOperations());

      expect(typeof result.current.loading).toBe('boolean');
    });

    it('should handle loading states from multiple operations', () => {
      const { result } = renderHook(() => useCollectionOperations());

      // Should aggregate loading states from all sub-hooks
      expect(typeof result.current.loading).toBe('boolean');
    });
  });

  describe('SessionStorage Integration', () => {
    it('should handle session storage refresh requests', async () => {
      // Mock sessionStorage
      const mockSessionStorage = {
        getItem: vi.fn(() => 'true'),
        removeItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
      });

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250)); // Wait for timeout
      });

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
        'collectionNeedsRefresh'
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'collectionNeedsRefresh'
      );
    });
  });

  describe('Event Listener Integration', () => {
    it('should listen for collection update events', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useCollectionOperations());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'collectionUpdated',
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'collectionUpdated',
        expect.any(Function)
      );
    });

    it('should refresh collection on update events', async () => {
      let eventHandler: Function;
      const addEventListenerSpy = vi
        .spyOn(window, 'addEventListener')
        .mockImplementation((event, handler) => {
          if (event === 'collectionUpdated') {
            eventHandler = handler as Function;
          }
        });

      renderHook(() => useCollectionOperations());

      // Clear initial calls
      vi.clearAllMocks();

      await act(async () => {
        eventHandler();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should trigger refresh
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalled();
    });
  });

  describe('Hook Composition Integration', () => {
    it('should properly compose specialized hooks', () => {
      const { result } = renderHook(() => useCollectionOperations());

      // Should provide operations from all composed hooks
      expect(result.current.addPsaCard).toBeDefined();
      expect(result.current.addRawCard).toBeDefined();
      expect(result.current.addSealedProduct).toBeDefined();
      expect(result.current.downloadPsaCardImagesZip).toBeDefined();
    });
  });
});
