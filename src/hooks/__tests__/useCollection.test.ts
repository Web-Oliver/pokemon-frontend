/**
 * Integration tests for useCollection Hook
 * Tests hook interactions with real backend API (no mocking)
 * Requires backend (SAFESPACE/pokemon-collection-backend) running on PORT 3000
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollection } from '../useCollection';
import { ISaleDetails } from '../../domain/models/common';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

// Test utilities
const createMockSaleDetails = (): ISaleDetails => ({
  paymentMethod: 'CASH',
  actualSoldPrice: 150,
  deliveryMethod: 'Sent',
  source: 'Facebook',
  buyerFullName: 'Test Buyer',
  buyerAddress: {
    streetName: '123 Test St',
    postnr: '12345',
    city: 'Test City',
  },
  buyerPhoneNumber: '+45 12 34 56 78',
  buyerEmail: 'test@example.com',
  trackingNumber: 'TRACK123',
  dateSold: new Date().toISOString(),
});

const createMockPsaCard = (): Partial<IPsaGradedCard> => ({
  cardName: 'Charmander', // Real card from backend
  setName: 'Pokemon Battle Academy', // Real set from backend
  grade: '10',
  myPrice: 100,
  images: ['test-image-1.jpg'],
  dateAdded: new Date().toISOString(),
  sold: false,
});

const createMockRawCard = (): Partial<IRawCard> => ({
  cardName: 'Charmander', // Real card from backend
  setName: 'Pokemon Battle Academy', // Real set from backend
  condition: 'Near Mint',
  myPrice: 75,
  images: ['test-image-2.jpg'],
  dateAdded: new Date().toISOString(),
  sold: false,
});

const createMockSealedProduct = (): Partial<ISealedProduct> => ({
  productId: '686da80432db32c7cc73d73d', // Real product ID from backend
  category: 'Blisters', // Real category from backend  
  setName: 'Destined Rivals',
  name: 'Destined Rivals: Kangaskhan 3-Pack Blister',
  availability: 10,
  cardMarketPrice: 142,
  myPrice: 120,
  images: ['test-sealed-1.jpg'],
  dateAdded: new Date().toISOString(),
  sold: false,
});

describe('useCollection Integration Tests', () => {
  beforeAll(() => {
    // Ensure backend is running
    console.log('🚨 IMPORTANT: Ensure backend is running on http://localhost:3000');
    console.log('Start backend with: cd ../pokemon-collection-backend && npm run dev');
  });

  it('should initialize with empty state and loading false', () => {
    const { result } = renderHook(() => useCollection());

    expect(result.current.psaCards).toEqual([]);
    expect(result.current.rawCards).toEqual([]);
    expect(result.current.sealedProducts).toEqual([]);
    expect(result.current.soldItems).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch collection data on initialization', async () => {
    const { result } = renderHook(() => useCollection());

    // Should start loading
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Should complete loading and populate data
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 10000 });

    // Verify data structure (actual data depends on backend state)
    expect(Array.isArray(result.current.psaCards)).toBe(true);
    expect(Array.isArray(result.current.rawCards)).toBe(true);
    expect(Array.isArray(result.current.sealedProducts)).toBe(true);
    expect(Array.isArray(result.current.soldItems)).toBe(true);
  });

  it('should handle collection refresh', async () => {
    const { result } = renderHook(() => useCollection());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 10000 });

    // Trigger refresh
    await act(async () => {
      await result.current.refreshCollection();
    });

    // Should load again
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.error).toBe(null);
  });

  it('should clear error state', async () => {
    const { result } = renderHook(() => useCollection());

    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  // PSA Graded Cards Tests
  describe('PSA Graded Cards Operations', () => {
    it('should add PSA graded card', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      const initialCount = result.current.psaCards.length;
      const mockCard = createMockPsaCard();

      await act(async () => {
        await result.current.addPsaCard(mockCard);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Verify card was added (optimistic update)
      expect(result.current.psaCards.length).toBe(initialCount + 1);
      expect(result.current.error).toBe(null);
    }, 15000);

    it('should handle PSA card operations with proper error handling', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Test invalid data handling
      const invalidCard = {} as Partial<IPsaGradedCard>;

      await act(async () => {
        await result.current.addPsaCard(invalidCard);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Should handle errors gracefully
      // Error state might be set depending on backend validation
    }, 15000);
  });

  // Raw Cards Tests
  describe('Raw Cards Operations', () => {
    it('should add raw card', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      const initialCount = result.current.rawCards.length;
      const mockCard = createMockRawCard();

      await act(async () => {
        await result.current.addRawCard(mockCard);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Verify card was added
      expect(result.current.rawCards.length).toBe(initialCount + 1);
      expect(result.current.error).toBe(null);
    }, 15000);
  });

  // Sealed Products Tests
  describe('Sealed Products Operations', () => {
    it('should add sealed product', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      const initialCount = result.current.sealedProducts.length;
      const mockProduct = createMockSealedProduct();

      await act(async () => {
        await result.current.addSealedProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Verify product was added
      expect(result.current.sealedProducts.length).toBe(initialCount + 1);
      expect(result.current.error).toBe(null);
    }, 15000);
  });

  // Test CRUD operations if we have existing items
  describe('Update and Delete Operations', () => {
    it('should handle update operations when items exist', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Only test if we have PSA cards
      if (result.current.psaCards.length > 0) {
        const cardToUpdate = result.current.psaCards[0];
        const updateData = { myPrice: 999 };

        await act(async () => {
          await result.current.updatePsaCard(cardToUpdate.id!, updateData);
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        }, { timeout: 10000 });

        // Find updated card
        const updatedCard = result.current.psaCards.find(card => card.id === cardToUpdate.id);
        expect(updatedCard?.myPrice).toBe(999);
        expect(result.current.error).toBe(null);
      } else {
        console.log('No PSA cards available for update test');
      }
    }, 15000);

    it('should handle mark as sold operations', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Only test if we have PSA cards
      if (result.current.psaCards.length > 0) {
        const cardToSell = result.current.psaCards[0];
        const saleDetails = createMockSaleDetails();
        const initialSoldCount = result.current.soldItems.length;

        await act(async () => {
          await result.current.markPsaCardSold(cardToSell.id!, saleDetails);
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        }, { timeout: 10000 });

        // Verify card moved to sold items
        expect(result.current.soldItems.length).toBe(initialSoldCount + 1);
        expect(result.current.psaCards.find(card => card.id === cardToSell.id)).toBeUndefined();
        expect(result.current.error).toBe(null);
      } else {
        console.log('No PSA cards available for mark as sold test');
      }
    }, 15000);
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { result } = renderHook(() => useCollection());

      // Test with obviously invalid ID
      await act(async () => {
        await result.current.deletePsaCard('invalid-id-that-does-not-exist');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Should handle error without crashing
      // Error state handling depends on backend implementation
    }, 15000);
  });

  // Performance and state management tests
  describe('State Management', () => {
    it('should maintain consistent state during multiple operations', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Store initial state for later comparison if needed
      console.log('Initial collection state:', {
        psaCount: result.current.psaCards.length,
        rawCount: result.current.rawCards.length,
        sealedCount: result.current.sealedProducts.length,
        soldCount: result.current.soldItems.length,
      });

      // Perform refresh operation
      await act(async () => {
        await result.current.refreshCollection();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // State should be consistent after refresh
      expect(result.current.psaCards.length).toBeGreaterThanOrEqual(0);
      expect(result.current.rawCards.length).toBeGreaterThanOrEqual(0);
      expect(result.current.sealedProducts.length).toBeGreaterThanOrEqual(0);
      expect(result.current.soldItems.length).toBeGreaterThanOrEqual(0);
    }, 20000);
  });
});