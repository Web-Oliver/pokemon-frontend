/**
 * Comprehensive Tests for useCollectionOperations Hook
 * MEDIUM PRIORITY: Tests state management, error propagation, and hook composition
 *
 * Following CLAUDE.md testing principles:
 * - State synchronization and management testing
 * - Error propagation between composed hooks
 * - Event handling and lifecycle testing
 * - Integration testing with mock services
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollectionOperations } from '../useCollectionOperations';
import {
  createMockPsaCard,
  createMockRawCard,
  createMockSealedProduct,
} from '../../test/setup';

// Mock dependencies
vi.mock('../useCollectionState', () => ({
  useCollectionState: vi.fn(),
}));

vi.mock('../usePsaCardOperations', () => ({
  usePsaCardOperations: vi.fn(),
}));

vi.mock('../useRawCardOperations', () => ({
  useRawCardOperations: vi.fn(),
}));

vi.mock('../useSealedProductOperations', () => ({
  useSealedProductOperations: vi.fn(),
}));

vi.mock('../useCollectionImageExport', () => ({
  useCollectionImageExport: vi.fn(),
}));

vi.mock('../useAsyncOperation', () => ({
  useAsyncOperation: vi.fn(),
}));

vi.mock('../../services/ServiceRegistry', () => ({
  getCollectionApiService: vi.fn(),
}));

vi.mock('../../utils/errorHandler', () => ({
  handleApiError: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  log: vi.fn(),
}));

const mockUseCollectionState = vi.mocked(
  require('../useCollectionState').useCollectionState
);
const mockUsePsaCardOperations = vi.mocked(
  require('../usePsaCardOperations').usePsaCardOperations
);
const mockUseRawCardOperations = vi.mocked(
  require('../useRawCardOperations').useRawCardOperations
);
const mockUseSealedProductOperations = vi.mocked(
  require('../useSealedProductOperations').useSealedProductOperations
);
const mockUseCollectionImageExport = vi.mocked(
  require('../useCollectionImageExport').useCollectionImageExport
);
const mockUseAsyncOperation = vi.mocked(
  require('../useAsyncOperation').useAsyncOperation
);
const mockGetCollectionApiService = vi.mocked(
  require('../../services/ServiceRegistry').getCollectionApiService
);
const mockLogger = vi.mocked(require('../../utils/logger'));

describe('useCollectionOperations', () => {
  // Mock data
  const mockPsaCard = createMockPsaCard();
  const mockRawCard = createMockRawCard();
  const mockSealedProduct = createMockSealedProduct();

  const mockSaleDetails = {
    payment: 'PayPal',
    actualSoldPrice: 1000,
    delivery: 'Shipped',
    buyerFullName: 'Test Buyer',
    dateSold: new Date().toISOString(),
  };

  // Mock implementations
  let mockCollectionState: any;
  let mockPsaOperations: any;
  let mockRawOperations: any;
  let mockSealedOperations: any;
  let mockImageExport: any;
  let mockAsyncOperation: any;
  let mockCollectionApiService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock collection state
    mockCollectionState = {
      psaCards: [mockPsaCard],
      rawCards: [mockRawCard],
      sealedProducts: [mockSealedProduct],
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
    };
    mockUseCollectionState.mockReturnValue(mockCollectionState);

    // Mock PSA operations
    mockPsaOperations = {
      addPsaCard: vi.fn(),
      updatePsaCard: vi.fn(),
      deletePsaCard: vi.fn(),
      markPsaCardSold: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    };
    mockUsePsaCardOperations.mockReturnValue(mockPsaOperations);

    // Mock raw operations
    mockRawOperations = {
      addRawCard: vi.fn(),
      updateRawCard: vi.fn(),
      deleteRawCard: vi.fn(),
      markRawCardSold: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    };
    mockUseRawCardOperations.mockReturnValue(mockRawOperations);

    // Mock sealed operations
    mockSealedOperations = {
      addSealedProduct: vi.fn(),
      updateSealedProduct: vi.fn(),
      deleteSealedProduct: vi.fn(),
      markSealedProductSold: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    };
    mockUseSealedProductOperations.mockReturnValue(mockSealedOperations);

    // Mock image export
    mockImageExport = {
      downloadPsaCardImagesZip: vi.fn(),
      downloadRawCardImagesZip: vi.fn(),
      downloadSealedProductImagesZip: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    };
    mockUseCollectionImageExport.mockReturnValue(mockImageExport);

    // Mock async operation
    mockAsyncOperation = {
      loading: false,
      error: null,
      execute: vi.fn(),
      clearError: vi.fn(),
    };
    mockUseAsyncOperation.mockReturnValue(mockAsyncOperation);

    // Mock collection API service
    mockCollectionApiService = {
      getPsaGradedCards: vi.fn(),
      getRawCards: vi.fn(),
      getSealedProducts: vi.fn(),
    };
    mockGetCollectionApiService.mockReturnValue(mockCollectionApiService);

    // Mock window events
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        removeItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook Initialization and State Management', () => {
    it('should initialize with composed hook states', () => {
      const { result } = renderHook(() => useCollectionOperations());

      expect(result.current.psaCards).toEqual([mockPsaCard]);
      expect(result.current.rawCards).toEqual([mockRawCard]);
      expect(result.current.sealedProducts).toEqual([mockSealedProduct]);
      expect(result.current.soldItems).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch collection data on initialization', async () => {
      mockAsyncOperation.execute.mockImplementation((fn) => fn());
      mockCollectionApiService.getPsaGradedCards
        .mockResolvedValueOnce([mockPsaCard]) // unsold
        .mockResolvedValueOnce([]); // sold
      mockCollectionApiService.getRawCards
        .mockResolvedValueOnce([mockRawCard]) // unsold
        .mockResolvedValueOnce([]); // sold
      mockCollectionApiService.getSealedProducts
        .mockResolvedValueOnce([mockSealedProduct]) // unsold
        .mockResolvedValueOnce([]); // sold

      renderHook(() => useCollectionOperations());

      await waitFor(() => {
        expect(mockAsyncOperation.execute).toHaveBeenCalled();
      });

      expect(mockCollectionApiService.getPsaGradedCards).toHaveBeenCalledWith({
        sold: false,
      });
      expect(mockCollectionApiService.getPsaGradedCards).toHaveBeenCalledWith({
        sold: true,
      });
      expect(mockCollectionApiService.getRawCards).toHaveBeenCalledWith({
        sold: false,
      });
      expect(mockCollectionApiService.getSealedProducts).toHaveBeenCalledWith({
        sold: false,
      });
    });

    it('should handle session storage refresh trigger', async () => {
      const mockSessionStorage = window.sessionStorage as any;
      mockSessionStorage.getItem.mockReturnValue('true');

      mockAsyncOperation.execute.mockImplementation((fn) => fn());
      mockCollectionApiService.getPsaGradedCards.mockResolvedValue([]);
      mockCollectionApiService.getRawCards.mockResolvedValue([]);
      mockCollectionApiService.getSealedProducts.mockResolvedValue([]);

      vi.useFakeTimers();

      renderHook(() => useCollectionOperations());

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
        'collectionNeedsRefresh'
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'collectionNeedsRefresh'
      );

      // Fast-forward the setTimeout
      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockAsyncOperation.execute).toHaveBeenCalledTimes(2); // Initial + refresh
      });

      vi.useRealTimers();
    });
  });

  describe('Collection Data Validation', () => {
    it('should validate and filter invalid collection response data', async () => {
      const invalidData = [
        null,
        undefined,
        { invalidItem: 'no id' },
        mockPsaCard, // Valid item
        'string', // Invalid type
        { id: 'valid-id', name: 'Valid Item' }, // Valid item
      ];

      mockAsyncOperation.execute.mockImplementation((fn) => fn());
      mockCollectionApiService.getPsaGradedCards
        .mockResolvedValueOnce(invalidData as any)
        .mockResolvedValueOnce([]);
      mockCollectionApiService.getRawCards.mockResolvedValue([]);
      mockCollectionApiService.getSealedProducts.mockResolvedValue([]);

      renderHook(() => useCollectionOperations());

      await waitFor(() => {
        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION OPERATIONS] Invalid PSA cards item filtered out',
          expect.objectContaining({ item: null })
        );
      });

      expect(mockCollectionState.setCollectionState).toHaveBeenCalledWith(
        expect.objectContaining({
          psaCards: expect.arrayContaining([
            mockPsaCard,
            { id: 'valid-id', name: 'Valid Item' },
          ]),
        })
      );
    });

    it('should handle non-array responses gracefully', async () => {
      mockAsyncOperation.execute.mockImplementation((fn) => fn());
      mockCollectionApiService.getPsaGradedCards
        .mockResolvedValueOnce('invalid-response' as any)
        .mockResolvedValueOnce([]);
      mockCollectionApiService.getRawCards.mockResolvedValue([]);
      mockCollectionApiService.getSealedProducts.mockResolvedValue([]);

      renderHook(() => useCollectionOperations());

      await waitFor(() => {
        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION OPERATIONS] PSA cards response is not an array',
          { data: 'invalid-response' }
        );
      });

      expect(mockCollectionState.setCollectionState).toHaveBeenCalledWith(
        expect.objectContaining({
          psaCards: [],
        })
      );
    });

    it('should set fallback empty arrays on fetch error', async () => {
      const fetchError = new Error('Network error');
      mockAsyncOperation.execute.mockImplementation((fn) => {
        return fn().catch((error: any) => {
          throw error;
        });
      });
      mockCollectionApiService.getPsaGradedCards.mockRejectedValue(fetchError);

      renderHook(() => useCollectionOperations());

      await waitFor(() => {
        expect(mockCollectionState.setCollectionState).toHaveBeenCalledWith({
          psaCards: [],
          rawCards: [],
          sealedProducts: [],
          soldItems: [],
        });
      });
    });
  });

  describe('PSA Card Operations Integration', () => {
    it('should add PSA card and update state', async () => {
      const newCard = createMockPsaCard({ id: 'new-psa-card' });
      mockPsaOperations.addPsaCard.mockResolvedValue(newCard);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.addPsaCard({ cardId: 'card-123' });
      });

      expect(mockPsaOperations.addPsaCard).toHaveBeenCalledWith({
        cardId: 'card-123',
      });
      expect(mockCollectionState.addPsaCardToState).toHaveBeenCalledWith(
        newCard
      );
    });

    it('should update PSA card and update state', async () => {
      const updatedCard = { ...mockPsaCard, myPrice: 6000 };
      mockPsaOperations.updatePsaCard.mockResolvedValue(updatedCard);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.updatePsaCard('psa-123', { myPrice: 6000 });
      });

      expect(mockPsaOperations.updatePsaCard).toHaveBeenCalledWith('psa-123', {
        myPrice: 6000,
      });
      expect(mockCollectionState.updatePsaCardInState).toHaveBeenCalledWith(
        'psa-123',
        updatedCard
      );
    });

    it('should delete PSA card and update state', async () => {
      mockPsaOperations.deletePsaCard.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.deletePsaCard('psa-123');
      });

      expect(mockPsaOperations.deletePsaCard).toHaveBeenCalledWith('psa-123');
      expect(mockCollectionState.removePsaCardFromState).toHaveBeenCalledWith(
        'psa-123'
      );
    });

    it('should mark PSA card sold and move to sold items', async () => {
      const soldCard = {
        ...mockPsaCard,
        sold: true,
        saleDetails: mockSaleDetails,
      };
      mockPsaOperations.markPsaCardSold.mockResolvedValue(soldCard);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.markPsaCardSold('psa-123', mockSaleDetails);
      });

      expect(mockPsaOperations.markPsaCardSold).toHaveBeenCalledWith(
        'psa-123',
        mockSaleDetails
      );
      expect(mockCollectionState.movePsaCardToSold).toHaveBeenCalledWith(
        'psa-123',
        soldCard
      );
    });

    it('should handle PSA card operation errors gracefully', async () => {
      const operationError = new Error('PSA operation failed');
      mockPsaOperations.addPsaCard.mockRejectedValue(operationError);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.addPsaCard({ cardId: 'card-123' });
      });

      // Should not crash and not call state update
      expect(mockCollectionState.addPsaCardToState).not.toHaveBeenCalled();
    });
  });

  describe('Raw Card Operations Integration', () => {
    it('should add raw card and update state', async () => {
      const newCard = createMockRawCard({ id: 'new-raw-card' });
      mockRawOperations.addRawCard.mockResolvedValue(newCard);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.addRawCard({
          cardId: 'card-123',
          condition: 'NM',
        });
      });

      expect(mockRawOperations.addRawCard).toHaveBeenCalledWith({
        cardId: 'card-123',
        condition: 'NM',
      });
      expect(mockCollectionState.addRawCardToState).toHaveBeenCalledWith(
        newCard
      );
    });

    it('should mark raw card sold and move to sold items', async () => {
      const soldCard = {
        ...mockRawCard,
        sold: true,
        saleDetails: mockSaleDetails,
      };
      mockRawOperations.markRawCardSold.mockResolvedValue(soldCard);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.markRawCardSold('raw-123', mockSaleDetails);
      });

      expect(mockRawOperations.markRawCardSold).toHaveBeenCalledWith(
        'raw-123',
        mockSaleDetails
      );
      expect(mockCollectionState.moveRawCardToSold).toHaveBeenCalledWith(
        'raw-123',
        soldCard
      );
    });
  });

  describe('Sealed Product Operations Integration', () => {
    it('should add sealed product and update state', async () => {
      const newProduct = createMockSealedProduct({ id: 'new-sealed-product' });
      mockSealedOperations.addSealedProduct.mockResolvedValue(newProduct);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.addSealedProduct({ productId: 'product-123' });
      });

      expect(mockSealedOperations.addSealedProduct).toHaveBeenCalledWith({
        productId: 'product-123',
      });
      expect(mockCollectionState.addSealedProductToState).toHaveBeenCalledWith(
        newProduct
      );
    });

    it('should mark sealed product sold and move to sold items', async () => {
      const soldProduct = {
        ...mockSealedProduct,
        sold: true,
        saleDetails: mockSaleDetails,
      };
      mockSealedOperations.markSealedProductSold.mockResolvedValue(soldProduct);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.markSealedProductSold(
          'sealed-123',
          mockSaleDetails
        );
      });

      expect(mockSealedOperations.markSealedProductSold).toHaveBeenCalledWith(
        'sealed-123',
        mockSaleDetails
      );
      expect(mockCollectionState.moveSealedProductToSold).toHaveBeenCalledWith(
        'sealed-123',
        soldProduct
      );
    });
  });

  describe('Loading State Aggregation', () => {
    it('should aggregate loading state from all composed hooks', () => {
      // Set various loading states
      mockPsaOperations.loading = true;
      mockRawOperations.loading = false;
      mockSealedOperations.loading = false;
      mockImageExport.loading = false;
      mockAsyncOperation.loading = false;

      const { result } = renderHook(() => useCollectionOperations());

      expect(result.current.loading).toBe(true);
    });

    it('should return false when no hooks are loading', () => {
      // All loading states false
      mockPsaOperations.loading = false;
      mockRawOperations.loading = false;
      mockSealedOperations.loading = false;
      mockImageExport.loading = false;
      mockAsyncOperation.loading = false;

      const { result } = renderHook(() => useCollectionOperations());

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error State Aggregation', () => {
    it('should prioritize operation errors over general errors', () => {
      mockPsaOperations.error = 'PSA operation error';
      mockRawOperations.error = null;
      mockSealedOperations.error = null;
      mockImageExport.error = null;
      mockAsyncOperation.error = 'General error';

      const { result } = renderHook(() => useCollectionOperations());

      expect(result.current.error).toBe('PSA operation error');
    });

    it('should return null when no errors exist', () => {
      mockPsaOperations.error = null;
      mockRawOperations.error = null;
      mockSealedOperations.error = null;
      mockImageExport.error = null;
      mockAsyncOperation.error = null;

      const { result } = renderHook(() => useCollectionOperations());

      expect(result.current.error).toBeNull();
    });

    it('should clear all errors when clearError is called', () => {
      const { result } = renderHook(() => useCollectionOperations());

      act(() => {
        result.current.clearError();
      });

      expect(mockAsyncOperation.clearError).toHaveBeenCalled();
      expect(mockPsaOperations.clearError).toHaveBeenCalled();
      expect(mockRawOperations.clearError).toHaveBeenCalled();
      expect(mockSealedOperations.clearError).toHaveBeenCalled();
      expect(mockImageExport.clearError).toHaveBeenCalled();
    });
  });

  describe('Event Listeners and Cleanup', () => {
    it('should set up collection update event listener', () => {
      renderHook(() => useCollectionOperations());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'collectionUpdated',
        expect.any(Function)
      );
    });

    it('should clean up event listener on unmount', () => {
      const { unmount } = renderHook(() => useCollectionOperations());

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'collectionUpdated',
        expect.any(Function)
      );
    });

    it('should refresh collection when collectionUpdated event is triggered', async () => {
      mockAsyncOperation.execute.mockImplementation((fn) => fn());
      mockCollectionApiService.getPsaGradedCards.mockResolvedValue([]);
      mockCollectionApiService.getRawCards.mockResolvedValue([]);
      mockCollectionApiService.getSealedProducts.mockResolvedValue([]);

      const { result } = renderHook(() => useCollectionOperations());

      // Simulate the event being triggered
      const eventHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'collectionUpdated'
      )[1];

      await act(async () => {
        eventHandler();
      });

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Collection update event received, refreshing data...'
      );
    });
  });

  describe('Image Export Operations', () => {
    it('should delegate image export operations to imageExport hook', () => {
      const { result } = renderHook(() => useCollectionOperations());

      expect(result.current.downloadPsaCardImagesZip).toBe(
        mockImageExport.downloadPsaCardImagesZip
      );
      expect(result.current.downloadRawCardImagesZip).toBe(
        mockImageExport.downloadRawCardImagesZip
      );
      expect(result.current.downloadSealedProductImagesZip).toBe(
        mockImageExport.downloadSealedProductImagesZip
      );
    });
  });

  describe('Refresh Collection Functionality', () => {
    it('should provide refreshCollection method', async () => {
      mockAsyncOperation.execute.mockImplementation((fn) => fn());
      mockCollectionApiService.getPsaGradedCards.mockResolvedValue([]);
      mockCollectionApiService.getRawCards.mockResolvedValue([]);
      mockCollectionApiService.getSealedProducts.mockResolvedValue([]);

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.refreshCollection();
      });

      expect(mockAsyncOperation.execute).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid state updates without memory leaks', async () => {
      const { result } = renderHook(() => useCollectionOperations());

      // Simulate rapid operations
      for (let i = 0; i < 10; i++) {
        mockPsaOperations.addPsaCard.mockResolvedValue(
          createMockPsaCard({ id: `psa-${i}` })
        );

        await act(async () => {
          await result.current.addPsaCard({ cardId: `card-${i}` });
        });
      }

      expect(mockPsaOperations.addPsaCard).toHaveBeenCalledTimes(10);
      expect(mockCollectionState.addPsaCardToState).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent operations gracefully', async () => {
      const { result } = renderHook(() => useCollectionOperations());

      // Set up mock responses
      mockPsaOperations.addPsaCard.mockResolvedValue(mockPsaCard);
      mockRawOperations.addRawCard.mockResolvedValue(mockRawCard);
      mockSealedOperations.addSealedProduct.mockResolvedValue(
        mockSealedProduct
      );

      // Execute concurrent operations
      const promises = [
        result.current.addPsaCard({ cardId: 'card-1' }),
        result.current.addRawCard({ cardId: 'card-2' }),
        result.current.addSealedProduct({ productId: 'product-1' }),
      ];

      await act(async () => {
        await Promise.all(promises);
      });

      expect(mockPsaOperations.addPsaCard).toHaveBeenCalledTimes(1);
      expect(mockRawOperations.addRawCard).toHaveBeenCalledTimes(1);
      expect(mockSealedOperations.addSealedProduct).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    it('should handle undefined responses from composed hooks', () => {
      mockUseCollectionState.mockReturnValue(undefined as any);

      expect(() => renderHook(() => useCollectionOperations())).not.toThrow();
    });

    it('should handle missing methods in composed hooks', () => {
      mockUsePsaCardOperations.mockReturnValue({} as any);

      const { result } = renderHook(() => useCollectionOperations());

      expect(typeof result.current.addPsaCard).toBe('function');
    });

    it('should maintain state consistency during error conditions', async () => {
      mockPsaOperations.addPsaCard.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useCollectionOperations());

      await act(async () => {
        await result.current.addPsaCard({ cardId: 'card-123' });
      });

      // State should not be updated when operation fails
      expect(mockCollectionState.addPsaCardToState).not.toHaveBeenCalled();
    });
  });
});
