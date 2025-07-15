/**
 * Integration Tests for useCollection Hook
 * Tests update and delete operations against real backend API
 * Following CLAUDE.md: No mocking for API interactions
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useCollection } from './useCollection';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import * as collectionApi from '../api/collectionApi';

// Test data
const mockSaleDetails: ISaleDetails = {
  paymentMethod: 'CASH',
  actualSoldPrice: 150.00,
  deliveryMethod: 'Local Meetup',
  source: 'Facebook',
  buyerFullName: 'John Doe',
  buyerAddress: {
    streetName: '123 Main St',
    postnr: '12345',
    city: 'Testtown'
  },
  buyerPhoneNumber: '+1234567890',
  buyerEmail: 'john@example.com',
  dateSold: new Date().toISOString()
};

const mockPsaCard: Partial<IPsaGradedCard> = {
  cardId: 'card123',
  grade: '9',
  myPrice: 100.00,
  images: ['image1.jpg'],
  dateAdded: new Date().toISOString()
};

const mockRawCard: Partial<IRawCard> = {
  cardId: 'card456',
  condition: 'NM',
  myPrice: 50.00,
  images: ['image2.jpg'],
  dateAdded: new Date().toISOString()
};

const mockSealedProduct: Partial<ISealedProduct> = {
  productId: 'product789',
  category: 'Booster Box',
  setName: 'Base Set',
  name: 'Base Set Booster Box',
  availability: 1,
  cardMarketPrice: 500.00,
  myPrice: 450.00,
  images: ['image3.jpg'],
  dateAdded: new Date().toISOString()
};

describe('useCollection Hook - Update & Delete Operations', () => {
  beforeAll(() => {
    // Ensure backend is running for integration tests
    console.log('Running integration tests against real backend at http://localhost:3000/api');
  });

  describe('PSA Graded Cards Operations', () => {
    let createdCardId: string;

    beforeEach(async () => {
      // Create a test card for update/delete operations
      const createdCard = await collectionApi.createPsaGradedCard(mockPsaCard);
      createdCardId = createdCard.id!;
    });

    afterEach(async () => {
      // Cleanup: try to delete the test card if it still exists
      try {
        await collectionApi.deletePsaGradedCard(createdCardId);
      } catch (error) {
        // Card may have been deleted in test, ignore error
      }
    });

    test('updatePsaCard updates a PSA graded card successfully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateData: Partial<IPsaGradedCard> = {
        myPrice: 120.00,
        grade: '10'
      };

      // Update the card
      await result.current.updatePsaCard(createdCardId, updateData);

      // Verify the card was updated in local state
      await waitFor(() => {
        const updatedCard = result.current.psaCards.find(card => card.id === createdCardId);
        expect(updatedCard).toBeDefined();
        expect(updatedCard?.myPrice).toBe(120.00);
        expect(updatedCard?.grade).toBe('10');
      });
    });

    test('deletePsaCard removes a PSA graded card successfully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Delete the card
      await result.current.deletePsaCard(createdCardId);

      // Verify the card was removed from local state
      await waitFor(() => {
        const deletedCard = result.current.psaCards.find(card => card.id === createdCardId);
        expect(deletedCard).toBeUndefined();
      });
    });

    test('markPsaCardSold moves PSA card to sold items', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mark card as sold
      await result.current.markPsaCardSold(createdCardId, mockSaleDetails);

      // Verify the card was moved to sold items
      await waitFor(() => {
        const cardInCollection = result.current.psaCards.find(card => card.id === createdCardId);
        const cardInSoldItems = result.current.soldItems.find((item: any) => item.id === createdCardId);
        
        expect(cardInCollection).toBeUndefined();
        expect(cardInSoldItems).toBeDefined();
        expect((cardInSoldItems as IPsaGradedCard).sold).toBe(true);
      });
    });
  });

  describe('Raw Cards Operations', () => {
    let createdCardId: string;

    beforeEach(async () => {
      // Create a test raw card for update/delete operations
      const createdCard = await collectionApi.createRawCard(mockRawCard);
      createdCardId = createdCard.id!;
    });

    afterEach(async () => {
      // Cleanup: try to delete the test card if it still exists
      try {
        await collectionApi.deleteRawCard(createdCardId);
      } catch (error) {
        // Card may have been deleted in test, ignore error
      }
    });

    test('updateRawCard updates a raw card successfully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateData: Partial<IRawCard> = {
        myPrice: 75.00,
        condition: 'LP'
      };

      // Update the card
      await result.current.updateRawCard(createdCardId, updateData);

      // Verify the card was updated in local state
      await waitFor(() => {
        const updatedCard = result.current.rawCards.find(card => card.id === createdCardId);
        expect(updatedCard).toBeDefined();
        expect(updatedCard?.myPrice).toBe(75.00);
        expect(updatedCard?.condition).toBe('LP');
      });
    });

    test('deleteRawCard removes a raw card successfully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Delete the card
      await result.current.deleteRawCard(createdCardId);

      // Verify the card was removed from local state
      await waitFor(() => {
        const deletedCard = result.current.rawCards.find(card => card.id === createdCardId);
        expect(deletedCard).toBeUndefined();
      });
    });

    test('markRawCardSold moves raw card to sold items', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mark card as sold
      await result.current.markRawCardSold(createdCardId, mockSaleDetails);

      // Verify the card was moved to sold items
      await waitFor(() => {
        const cardInCollection = result.current.rawCards.find(card => card.id === createdCardId);
        const cardInSoldItems = result.current.soldItems.find((item: any) => item.id === createdCardId);
        
        expect(cardInCollection).toBeUndefined();
        expect(cardInSoldItems).toBeDefined();
        expect((cardInSoldItems as IRawCard).sold).toBe(true);
      });
    });
  });

  describe('Sealed Products Operations', () => {
    let createdProductId: string;

    beforeEach(async () => {
      // Create a test sealed product for update/delete operations
      const createdProduct = await collectionApi.createSealedProduct(mockSealedProduct);
      createdProductId = createdProduct.id!;
    });

    afterEach(async () => {
      // Cleanup: try to delete the test product if it still exists
      try {
        await collectionApi.deleteSealedProduct(createdProductId);
      } catch (error) {
        // Product may have been deleted in test, ignore error
      }
    });

    test('updateSealedProduct updates a sealed product successfully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateData: Partial<ISealedProduct> = {
        myPrice: 475.00,
        availability: 2
      };

      // Update the product
      await result.current.updateSealedProduct(createdProductId, updateData);

      // Verify the product was updated in local state
      await waitFor(() => {
        const updatedProduct = result.current.sealedProducts.find(product => product.id === createdProductId);
        expect(updatedProduct).toBeDefined();
        expect(updatedProduct?.myPrice).toBe(475.00);
        expect(updatedProduct?.availability).toBe(2);
      });
    });

    test('deleteSealedProduct removes a sealed product successfully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Delete the product
      await result.current.deleteSealedProduct(createdProductId);

      // Verify the product was removed from local state
      await waitFor(() => {
        const deletedProduct = result.current.sealedProducts.find(product => product.id === createdProductId);
        expect(deletedProduct).toBeUndefined();
      });
    });

    test('markSealedProductSold moves sealed product to sold items', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mark product as sold
      await result.current.markSealedProductSold(createdProductId, mockSaleDetails);

      // Verify the product was moved to sold items
      await waitFor(() => {
        const productInCollection = result.current.sealedProducts.find(product => product.id === createdProductId);
        const productInSoldItems = result.current.soldItems.find((item: any) => item.id === createdProductId);
        
        expect(productInCollection).toBeUndefined();
        expect(productInSoldItems).toBeDefined();
        expect((productInSoldItems as ISealedProduct).sold).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles update errors gracefully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Try to update a non-existent card
      await result.current.updatePsaCard('non-existent-id', mockPsaCard);

      // Verify error state is set
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error).toContain('Failed to update PSA graded card');
      });

      // Clear error
      result.current.clearError();
      expect(result.current.error).toBeNull();
    });

    test('handles delete errors gracefully', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Try to delete a non-existent card
      await result.current.deletePsaCard('non-existent-id');

      // Verify error state is set
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error).toContain('Failed to delete PSA graded card');
      });
    });
  });

  describe('Optimistic Updates', () => {
    let createdCardId: string;

    beforeEach(async () => {
      // Create a test card for optimistic update testing
      const createdCard = await collectionApi.createPsaGradedCard(mockPsaCard);
      createdCardId = createdCard.id!;
    });

    afterEach(async () => {
      // Cleanup
      try {
        await collectionApi.deletePsaGradedCard(createdCardId);
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    test('performs optimistic updates for card modifications', async () => {
      const { result } = renderHook(() => useCollection());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateData: Partial<IPsaGradedCard> = {
        myPrice: 999.99
      };

      // Perform update - should update local state immediately
      const updatePromise = result.current.updatePsaCard(createdCardId, updateData);

      // Check that local state is updated immediately (optimistic update)
      await waitFor(() => {
        const updatedCard = result.current.psaCards.find(card => card.id === createdCardId);
        expect(updatedCard?.myPrice).toBe(999.99);
      });

      // Wait for the actual API call to complete
      await updatePromise;
    });
  });
});