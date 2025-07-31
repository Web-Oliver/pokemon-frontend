/**
 * Service Layer Integration Tests for New API Format
 * Tests the service layer compatibility with enhanced API response handling
 *
 * Following CLAUDE.md testing principles:
 * - Service layer integration validation
 * - Mock-based testing for isolated service testing
 * - Comprehensive error handling validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CollectionApiService } from '../services/CollectionApiService';
import { APIResponse } from '../utils/responseTransformer';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';

// Mock the collectionApi module
vi.mock('../api/collectionApi', () => ({
  getPsaGradedCards: vi.fn(),
  getPsaGradedCardById: vi.fn(),
  createPsaGradedCard: vi.fn(),
  updatePsaGradedCard: vi.fn(),
  deletePsaGradedCard: vi.fn(),
  markPsaGradedCardSold: vi.fn(),
  getRawCards: vi.fn(),
  getRawCardById: vi.fn(),
  createRawCard: vi.fn(),
  updateRawCard: vi.fn(),
  deleteRawCard: vi.fn(),
  markRawCardSold: vi.fn(),
  getSealedProductCollection: vi.fn(),
  getSealedProductById: vi.fn(),
  createSealedProduct: vi.fn(),
  updateSealedProduct: vi.fn(),
  deleteSealedProduct: vi.fn(),
  markSealedProductSold: vi.fn(),
}));

// Test data with proper ID mapping
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
  productId: 'product-ref-1',
  name: 'Base Set Booster Box',
  category: 'booster-box' as any,
  setName: 'Base Set',
  availability: 10,
  cardMarketPrice: 750000,
  myPrice: 800000,
  priceHistory: [],
  images: ['image3.jpg'],
  dateAdded: '2024-01-01T00:00:00.000Z',
  sold: false,
};

describe('Service Layer Integration - New API Format', () => {
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

  describe('PSA Card Operations', () => {
    it('should handle getPsaGradedCards with new API format', async () => {
      // Mock the API call to return transformed data (as the unified client would)
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);

      const result = await collectionService.getPsaGradedCards({ sold: false });

      expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalledWith({
        sold: false,
      });
      expect(result).toEqual([mockPsaCard]);
      expect(result[0].id).toBe('psa-1'); // Verify ID mapping worked
      expect(result[0].cardId.id).toBe('card-1'); // Verify nested ID mapping
    });

    it('should handle getPsaGradedCardById with new API format', async () => {
      mockCollectionApi.getPsaGradedCardById.mockResolvedValue(mockPsaCard);

      const result = await collectionService.getPsaGradedCardById('psa-1');

      expect(mockCollectionApi.getPsaGradedCardById).toHaveBeenCalledWith(
        'psa-1'
      );
      expect(result).toEqual(mockPsaCard);
      expect(result.id).toBe('psa-1');
    });

    it('should handle createPsaCard with new API format', async () => {
      const newCardData = { ...mockPsaCard, id: undefined };
      mockCollectionApi.createPsaGradedCard.mockResolvedValue(mockPsaCard);

      const result = await collectionService.createPsaCard(newCardData);

      expect(mockCollectionApi.createPsaGradedCard).toHaveBeenCalledWith(
        newCardData
      );
      expect(result).toEqual(mockPsaCard);
      expect(result.id).toBeDefined();
    });

    it('should handle updatePsaCard with new API format', async () => {
      const updateData = { myPrice: 6000 };
      const updatedCard = { ...mockPsaCard, myPrice: 6000 };
      mockCollectionApi.updatePsaGradedCard.mockResolvedValue(updatedCard);

      const result = await collectionService.updatePsaCard('psa-1', updateData);

      expect(mockCollectionApi.updatePsaGradedCard).toHaveBeenCalledWith(
        'psa-1',
        updateData
      );
      expect(result).toEqual(updatedCard);
      expect(result.myPrice).toBe(6000);
    });

    it('should handle markPsaCardSold with new API format', async () => {
      const saleDetails = {
        payment: 'PayPal',
        actualSoldPrice: 5500,
        delivery: 'Shipped',
        buyerFullName: 'John Doe',
      };
      const soldCard = { ...mockPsaCard, sold: true, saleDetails };
      mockCollectionApi.markPsaGradedCardSold.mockResolvedValue(soldCard);

      const result = await collectionService.markPsaCardSold(
        'psa-1',
        saleDetails
      );

      expect(mockCollectionApi.markPsaGradedCardSold).toHaveBeenCalledWith(
        'psa-1',
        saleDetails
      );
      expect(result).toEqual(soldCard);
      expect(result.sold).toBe(true);
    });
  });

  describe('Raw Card Operations', () => {
    it('should handle getRawCards with new API format', async () => {
      mockCollectionApi.getRawCards.mockResolvedValue([mockRawCard]);

      const result = await collectionService.getRawCards({ sold: false });

      expect(mockCollectionApi.getRawCards).toHaveBeenCalledWith({
        sold: false,
      });
      expect(result).toEqual([mockRawCard]);
      expect(result[0].id).toBe('raw-1');
      expect(result[0].cardId.id).toBe('card-2');
    });

    it('should handle createRawCard with new API format', async () => {
      const newCardData = { ...mockRawCard, id: undefined };
      mockCollectionApi.createRawCard.mockResolvedValue(mockRawCard);

      const result = await collectionService.createRawCard(newCardData);

      expect(mockCollectionApi.createRawCard).toHaveBeenCalledWith(newCardData);
      expect(result).toEqual(mockRawCard);
      expect(result.id).toBeDefined();
    });

    it('should handle markRawCardSold with new API format', async () => {
      const saleDetails = {
        payment: 'Cash',
        actualSoldPrice: 2200,
        delivery: 'Local',
        buyerFullName: 'Jane Smith',
      };
      const soldCard = { ...mockRawCard, sold: true, saleDetails };
      mockCollectionApi.markRawCardSold.mockResolvedValue(soldCard);

      const result = await collectionService.markRawCardSold(
        'raw-1',
        saleDetails
      );

      expect(mockCollectionApi.markRawCardSold).toHaveBeenCalledWith(
        'raw-1',
        saleDetails
      );
      expect(result).toEqual(soldCard);
      expect(result.sold).toBe(true);
    });
  });

  describe('Sealed Product Operations', () => {
    it('should handle getSealedProducts with new API format', async () => {
      mockCollectionApi.getSealedProductCollection.mockResolvedValue([
        mockSealedProduct,
      ]);

      const result = await collectionService.getSealedProducts({ sold: false });

      expect(mockCollectionApi.getSealedProductCollection).toHaveBeenCalledWith(
        { sold: false }
      );
      expect(result).toEqual([mockSealedProduct]);
      expect(result[0].id).toBe('sealed-1');
    });

    it('should handle createSealedProduct with new API format', async () => {
      const newProductData = { ...mockSealedProduct, id: undefined };
      mockCollectionApi.createSealedProduct.mockResolvedValue(
        mockSealedProduct
      );

      const result =
        await collectionService.createSealedProduct(newProductData);

      expect(mockCollectionApi.createSealedProduct).toHaveBeenCalledWith(
        newProductData
      );
      expect(result).toEqual(mockSealedProduct);
      expect(result.id).toBeDefined();
    });

    it('should handle markSealedProductSold with new API format', async () => {
      const saleDetails = {
        payment: 'Bank Transfer',
        actualSoldPrice: 850000,
        delivery: 'Shipped',
        buyerFullName: 'Collector Co.',
      };
      const soldProduct = { ...mockSealedProduct, sold: true, saleDetails };
      mockCollectionApi.markSealedProductSold.mockResolvedValue(soldProduct);

      const result = await collectionService.markSealedProductSold(
        'sealed-1',
        saleDetails
      );

      expect(mockCollectionApi.markSealedProductSold).toHaveBeenCalledWith(
        'sealed-1',
        saleDetails
      );
      expect(result).toEqual(soldProduct);
      expect(result.sold).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should propagate API errors correctly', async () => {
      const apiError = new Error('Network error');
      mockCollectionApi.getPsaGradedCards.mockRejectedValue(apiError);

      await expect(collectionService.getPsaGradedCards()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle validation errors from API', async () => {
      const validationError = new Error('Invalid card data');
      mockCollectionApi.createPsaGradedCard.mockRejectedValue(validationError);

      await expect(collectionService.createPsaCard({})).rejects.toThrow(
        'Invalid card data'
      );
    });
  });

  describe('Data Consistency Validation', () => {
    it('should ensure ID consistency across all operations', async () => {
      // Test that all returned objects have proper ID mapping
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);
      mockCollectionApi.getRawCards.mockResolvedValue([mockRawCard]);
      mockCollectionApi.getSealedProductCollection.mockResolvedValue([
        mockSealedProduct,
      ]);

      const [psaCards, rawCards, sealedProducts] = await Promise.all([
        collectionService.getPsaGradedCards(),
        collectionService.getRawCards(),
        collectionService.getSealedProducts(),
      ]);

      // Verify all items have proper ID fields
      expect(psaCards[0].id).toBe('psa-1');
      expect(rawCards[0].id).toBe('raw-1');
      expect(sealedProducts[0].id).toBe('sealed-1');

      // Verify nested objects also have proper ID mapping
      expect(psaCards[0].cardId.id).toBe('card-1');
      expect(rawCards[0].cardId.id).toBe('card-2');
    });

    it('should handle empty arrays correctly', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([]);
      mockCollectionApi.getRawCards.mockResolvedValue([]);
      mockCollectionApi.getSealedProductCollection.mockResolvedValue([]);

      const [psaCards, rawCards, sealedProducts] = await Promise.all([
        collectionService.getPsaGradedCards(),
        collectionService.getRawCards(),
        collectionService.getSealedProducts(),
      ]);

      expect(psaCards).toEqual([]);
      expect(rawCards).toEqual([]);
      expect(sealedProducts).toEqual([]);
    });

    it('should preserve metadata objects without ID mapping', async () => {
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

      mockCollectionApi.getPsaGradedCardById.mockResolvedValue(
        cardWithMetadata
      );

      const result = await collectionService.getPsaGradedCardById('psa-1');

      // Main object should have ID mapped
      expect(result.id).toBe('psa-1');

      // Metadata objects should NOT have ID mapping attempts
      expect(result.saleDetails).toEqual(cardWithMetadata.saleDetails);
      expect(result.priceHistory).toEqual(cardWithMetadata.priceHistory);
    });
  });

  describe('Service Layer Interface Compliance', () => {
    it('should maintain consistent method signatures', () => {
      const service = new CollectionApiService();

      // Verify all expected methods exist
      expect(typeof service.getPsaGradedCards).toBe('function');
      expect(typeof service.createPsaCard).toBe('function');
      expect(typeof service.updatePsaCard).toBe('function');
      expect(typeof service.deletePsaCard).toBe('function');
      expect(typeof service.markPsaCardSold).toBe('function');

      expect(typeof service.getRawCards).toBe('function');
      expect(typeof service.createRawCard).toBe('function');
      expect(typeof service.updateRawCard).toBe('function');
      expect(typeof service.deleteRawCard).toBe('function');
      expect(typeof service.markRawCardSold).toBe('function');

      expect(typeof service.getSealedProducts).toBe('function');
      expect(typeof service.createSealedProduct).toBe('function');
      expect(typeof service.updateSealedProduct).toBe('function');
      expect(typeof service.deleteSealedProduct).toBe('function');
      expect(typeof service.markSealedProductSold).toBe('function');
    });
  });
});
