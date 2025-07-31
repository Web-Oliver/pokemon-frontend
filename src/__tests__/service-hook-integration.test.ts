/**
 * Service-Hook Integration Tests for New API Format
 * Tests that the service layer integrates properly with the hook layer for API format changes
 *
 * Following CLAUDE.md testing principles:
 * - Integration testing between service and hook layers
 * - Focus on data flow and API format compatibility
 * - Simplified mocking for clearer test intent
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CollectionApiService } from '../services/CollectionApiService';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';

// Mock the entire API layer
vi.mock('../api/collectionApi', () => ({
  getPsaGradedCards: vi.fn(),
  getRawCards: vi.fn(),
  getSealedProductCollection: vi.fn(),
  getPsaGradedCardById: vi.fn(),
  createPsaGradedCard: vi.fn(),
  updatePsaGradedCard: vi.fn(),
  deletePsaGradedCard: vi.fn(),
  markPsaGradedCardSold: vi.fn(),
  getRawCardById: vi.fn(),
  createRawCard: vi.fn(),
  updateRawCard: vi.fn(),
  deleteRawCard: vi.fn(),
  markRawCardSold: vi.fn(),
  getSealedProductById: vi.fn(),
  createSealedProduct: vi.fn(),
  updateSealedProduct: vi.fn(),
  deleteSealedProduct: vi.fn(),
  markSealedProductSold: vi.fn(),
}));

// Test data representing what the API would return after transformation
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

describe('Service-Hook Integration - New API Format', () => {
  let collectionService: CollectionApiService;
  let mockCollectionApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCollectionApi = await import('../api/collectionApi');
    collectionService = new CollectionApiService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data Flow Integration', () => {
    it('should handle collection data flow with proper ID mapping', async () => {
      // Setup mock responses
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);
      mockCollectionApi.getRawCards.mockResolvedValue([mockRawCard]);
      mockCollectionApi.getSealedProductCollection.mockResolvedValue([
        mockSealedProduct,
      ]);

      // Simulate what a hook would do - fetch all collection data
      const [psaCards, rawCards, sealedProducts] = await Promise.all([
        collectionService.getPsaGradedCards({ sold: false }),
        collectionService.getRawCards({ sold: false }),
        collectionService.getSealedProducts({ sold: false }),
      ]);

      // Verify data structure is as expected by UI components
      expect(psaCards[0]).toMatchObject({
        id: 'psa-1',
        cardId: {
          id: 'card-1',
          cardName: 'Charizard',
          setId: {
            id: 'set-1',
            setName: 'Base Set',
          },
        },
        grade: 10,
        myPrice: 5000,
      });

      expect(rawCards[0]).toMatchObject({
        id: 'raw-1',
        cardId: {
          id: 'card-2',
          cardName: 'Blastoise',
        },
        condition: 'NM',
        myPrice: 2000,
      });

      expect(sealedProducts[0]).toMatchObject({
        id: 'sealed-1',
        name: 'Base Set Booster Box',
        category: 'booster-box',
        myPrice: 800000,
      });
    });

    it('should handle sold items filtering correctly', async () => {
      const soldPsaCard = { ...mockPsaCard, sold: true };
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([soldPsaCard]);

      const soldCards = await collectionService.getPsaGradedCards({
        sold: true,
      });

      expect(soldCards[0].sold).toBe(true);
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalledWith({
        sold: true,
      });
    });

    it('should handle create operations with new API format', async () => {
      const newCardData = {
        cardId: mockPsaCard.cardId,
        grade: 9,
        myPrice: 4000,
        images: ['new-image.jpg'],
        sold: false,
      };

      const createdCard = { ...mockPsaCard, ...newCardData, id: 'psa-2' };
      mockCollectionApi.createPsaGradedCard.mockResolvedValue(createdCard);

      const result = await collectionService.createPsaCard(newCardData);

      expect(result.id).toBe('psa-2');
      expect(result.grade).toBe(9);
      expect(result.myPrice).toBe(4000);
      expect(mockCollectionApi.createPsaGradedCard).toHaveBeenCalledWith(
        newCardData
      );
    });

    it('should handle update operations maintaining data integrity', async () => {
      const updateData = { myPrice: 6000, grade: 9 };
      const updatedCard = { ...mockPsaCard, ...updateData };
      mockCollectionApi.updatePsaGradedCard.mockResolvedValue(updatedCard);

      const result = await collectionService.updatePsaCard('psa-1', updateData);

      expect(result.id).toBe('psa-1'); // ID should remain unchanged
      expect(result.myPrice).toBe(6000);
      expect(result.grade).toBe(9);
      expect(result.cardId.id).toBe('card-1'); // Nested IDs should be preserved
    });

    it('should handle sale operations with metadata preservation', async () => {
      const saleDetails = {
        payment: 'PayPal',
        actualSoldPrice: 5500,
        delivery: 'Shipped',
        buyerFullName: 'John Doe',
        buyerEmail: 'john@example.com',
        dateInitiated: '2024-01-15T10:00:00.000Z',
        dateSold: '2024-01-15T10:00:00.000Z',
      };

      const soldCard = {
        ...mockPsaCard,
        sold: true,
        saleDetails,
      };

      mockCollectionApi.markPsaGradedCardSold.mockResolvedValue(soldCard);

      const result = await collectionService.markPsaCardSold(
        'psa-1',
        saleDetails
      );

      expect(result.sold).toBe(true);
      expect(result.saleDetails).toEqual(saleDetails);
      expect(result.id).toBe('psa-1'); // Main ID preserved
      expect(result.cardId.id).toBe('card-1'); // Nested IDs preserved
      expect(mockCollectionApi.markPsaGradedCardSold).toHaveBeenCalledWith(
        'psa-1',
        saleDetails
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('should propagate API errors to hook layer', async () => {
      const networkError = new Error('Network connection failed');
      mockCollectionApi.getPsaGradedCards.mockRejectedValue(networkError);

      await expect(collectionService.getPsaGradedCards()).rejects.toThrow(
        'Network connection failed'
      );
    });

    it('should handle validation errors from API', async () => {
      const validationError = new Error('Invalid card data: missing cardId');
      mockCollectionApi.createPsaGradedCard.mockRejectedValue(validationError);

      await expect(collectionService.createPsaCard({})).rejects.toThrow(
        'Invalid card data: missing cardId'
      );
    });

    it('should handle not found errors gracefully', async () => {
      const notFoundError = new Error('Card not found');
      mockCollectionApi.getPsaGradedCardById.mockRejectedValue(notFoundError);

      await expect(
        collectionService.getPsaGradedCardById('nonexistent')
      ).rejects.toThrow('Card not found');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large collections efficiently', async () => {
      // Create a large collection
      const largeCollection = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPsaCard,
        id: `psa-${i}`,
        cardId: {
          ...mockPsaCard.cardId,
          id: `card-${i}`,
          cardName: `Card ${i}`,
        },
      }));

      mockCollectionApi.getPsaGradedCards.mockResolvedValue(largeCollection);

      const startTime = performance.now();
      const result = await collectionService.getPsaGradedCards();
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(result[0].id).toBe('psa-0');
      expect(result[999].id).toBe('psa-999');
    });

    it('should handle concurrent operations correctly', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);
      mockCollectionApi.getRawCards.mockResolvedValue([mockRawCard]);
      mockCollectionApi.getSealedProductCollection.mockResolvedValue([
        mockSealedProduct,
      ]);

      // Simulate concurrent requests like a hook might make
      const promises = await Promise.all([
        collectionService.getPsaGradedCards(),
        collectionService.getRawCards(),
        collectionService.getSealedProducts(),
      ]);

      expect(promises[0]).toHaveLength(1);
      expect(promises[1]).toHaveLength(1);
      expect(promises[2]).toHaveLength(1);

      // Verify all API calls were made
      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalled();
      expect(mockCollectionApi.getRawCards).toHaveBeenCalled();
      expect(mockCollectionApi.getSealedProductCollection).toHaveBeenCalled();
    });
  });

  describe('Data Consistency Validation', () => {
    it('should maintain consistent data structure across all operations', async () => {
      // Test all CRUD operations maintain consistent data structure
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);
      mockCollectionApi.createPsaGradedCard.mockResolvedValue(mockPsaCard);
      mockCollectionApi.updatePsaGradedCard.mockResolvedValue(mockPsaCard);
      mockCollectionApi.getPsaGradedCardById.mockResolvedValue(mockPsaCard);

      const [getResult, createResult, updateResult, getByIdResult] =
        await Promise.all([
          collectionService.getPsaGradedCards(),
          collectionService.createPsaCard({}),
          collectionService.updatePsaCard('psa-1', {}),
          collectionService.getPsaGradedCardById('psa-1'),
        ]);

      // All should have consistent structure
      const expectedStructure = {
        id: expect.any(String),
        cardId: {
          id: expect.any(String),
          cardName: expect.any(String),
          setId: {
            id: expect.any(String),
            setName: expect.any(String),
          },
        },
        grade: expect.any(Number),
        myPrice: expect.any(Number),
        images: expect.any(Array),
        dateAdded: expect.any(String),
        sold: expect.any(Boolean),
      };

      expect(getResult[0]).toMatchObject(expectedStructure);
      expect(createResult).toMatchObject(expectedStructure);
      expect(updateResult).toMatchObject(expectedStructure);
      expect(getByIdResult).toMatchObject(expectedStructure);
    });

    it('should handle empty responses consistently', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([]);
      mockCollectionApi.getRawCards.mockResolvedValue([]);
      mockCollectionApi.getSealedProductCollection.mockResolvedValue([]);

      const [psaCards, rawCards, sealedProducts] = await Promise.all([
        collectionService.getPsaGradedCards(),
        collectionService.getRawCards(),
        collectionService.getSealedProducts(),
      ]);

      expect(Array.isArray(psaCards)).toBe(true);
      expect(Array.isArray(rawCards)).toBe(true);
      expect(Array.isArray(sealedProducts)).toBe(true);
      expect(psaCards).toHaveLength(0);
      expect(rawCards).toHaveLength(0);
      expect(sealedProducts).toHaveLength(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with UI components expecting specific data format', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);

      const result = await collectionService.getPsaGradedCards();
      const card = result[0];

      // UI components typically expect these properties
      expect(card.id).toBeDefined(); // For React keys
      expect(card.myPrice).toBeDefined(); // For price display
      expect(card.images).toBeDefined(); // For image display
      expect(card.cardId.cardName).toBeDefined(); // For card name display
      expect(card.cardId.setId.setName).toBeDefined(); // For set name display

      // Should work with common UI patterns
      expect(typeof card.myPrice).toBe('number');
      expect(Array.isArray(card.images)).toBe(true);
      expect(typeof card.cardId.cardName).toBe('string');
    });
  });
});
