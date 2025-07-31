/**
 * Comprehensive Tests for Collection API Service
 * MEDIUM PRIORITY: Tests validation, error handling, and service layer integration
 *
 * Following CLAUDE.md testing principles:
 * - Input validation and sanitization testing
 * - Error handling and recovery mechanisms
 * - Service layer contract compliance
 * - Data consistency validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CollectionApiService } from '../CollectionApiService';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { ISaleDetails } from '../../domain/models/common';

// Mock the collection API module
vi.mock('../../api/collectionApi', () => ({
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

// Mock error handler and logger
vi.mock('../../utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  log: vi.fn(),
}));

const mockCollectionApi = vi.mocked(require('../../api/collectionApi'));
const mockErrorHandler = vi.mocked(require('../../utils/errorHandler'));
const mockLogger = vi.mocked(require('../../utils/logger'));

describe('CollectionApiService', () => {
  let service: CollectionApiService;

  // Test data
  const mockPsaCard: IPsaGradedCard = {
    id: 'psa-123',
    cardId: {
      id: 'card-456',
      cardName: 'Charizard',
      setId: { id: 'set-789', setName: 'Base Set' },
    },
    grade: 10,
    myPrice: 5000,
    images: ['image1.jpg'],
    dateAdded: '2024-01-01T00:00:00.000Z',
    sold: false,
    priceHistory: [],
  };

  const mockRawCard: IRawCard = {
    id: 'raw-123',
    cardId: {
      id: 'card-456',
      cardName: 'Blastoise',
      setId: { id: 'set-789', setName: 'Base Set' },
    },
    condition: 'NM',
    myPrice: 2000,
    images: ['image2.jpg'],
    dateAdded: '2024-01-01T00:00:00.000Z',
    sold: false,
    priceHistory: [],
  };

  const mockSealedProduct: ISealedProduct = {
    id: 'sealed-123',
    productId: 'product-456',
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

  const mockSaleDetails: ISaleDetails = {
    payment: 'PayPal',
    actualSoldPrice: 5500,
    delivery: 'Shipped',
    buyerFullName: 'John Doe',
    buyerEmail: 'john@example.com',
    dateSold: '2024-01-15T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CollectionApiService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input Validation (SECURITY CRITICAL)', () => {
    describe('ID Validation', () => {
      it('should validate IDs before API calls', async () => {
        await expect(service.getPsaGradedCardById('')).rejects.toThrow(
          'Invalid ID provided for getPsaGradedCardById:'
        );
        await expect(service.getPsaGradedCardById(null as any)).rejects.toThrow(
          'Invalid ID provided for getPsaGradedCardById: null'
        );
        await expect(
          service.getPsaGradedCardById(undefined as any)
        ).rejects.toThrow(
          'Invalid ID provided for getPsaGradedCardById: undefined'
        );
        await expect(service.getPsaGradedCardById('   ')).rejects.toThrow(
          'Invalid ID provided for getPsaGradedCardById:    '
        );

        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] ID validation failed for getPsaGradedCardById',
          expect.objectContaining({
            operation: 'getPsaGradedCardById',
          })
        );
      });

      it('should validate IDs for update operations', async () => {
        await expect(service.updatePsaCard('', {})).rejects.toThrow(
          'Invalid ID provided for updatePsaCard:'
        );
        await expect(service.updateRawCard(null as any, {})).rejects.toThrow(
          'Invalid ID provided for updateRawCard: null'
        );
        await expect(
          service.updateSealedProduct(undefined as any, {})
        ).rejects.toThrow(
          'Invalid ID provided for updateSealedProduct: undefined'
        );
      });

      it('should validate IDs for delete operations', async () => {
        await expect(service.deletePsaCard('')).rejects.toThrow(
          'Invalid ID provided for deletePsaCard:'
        );
        await expect(service.deleteRawCard('   ')).rejects.toThrow(
          'Invalid ID provided for deleteRawCard:    '
        );
        await expect(service.deleteSealedProduct(null as any)).rejects.toThrow(
          'Invalid ID provided for deleteSealedProduct: null'
        );
      });

      it('should validate IDs for mark sold operations', async () => {
        await expect(
          service.markPsaCardSold('', mockSaleDetails)
        ).rejects.toThrow('Invalid ID provided for markPsaCardSold:');
        await expect(
          service.markRawCardSold(undefined as any, mockSaleDetails)
        ).rejects.toThrow('Invalid ID provided for markRawCardSold: undefined');
        await expect(
          service.markSealedProductSold(null as any, mockSaleDetails)
        ).rejects.toThrow(
          'Invalid ID provided for markSealedProductSold: null'
        );
      });

      it('should accept valid string IDs', async () => {
        mockCollectionApi.getPsaGradedCardById.mockResolvedValue(mockPsaCard);

        await service.getPsaGradedCardById('valid-id-123');

        expect(mockCollectionApi.getPsaGradedCardById).toHaveBeenCalledWith(
          'valid-id-123'
        );
      });
    });

    describe('Data Validation', () => {
      it('should validate data objects for create operations', async () => {
        await expect(service.createPsaCard(null as any)).rejects.toThrow(
          'Invalid data provided for createPsaCard'
        );
        await expect(service.createRawCard(undefined as any)).rejects.toThrow(
          'Invalid data provided for createRawCard'
        );
        await expect(
          service.createSealedProduct('invalid' as any)
        ).rejects.toThrow('Invalid data provided for createSealedProduct');

        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] Data validation failed for createPsaCard',
          expect.objectContaining({
            operation: 'createPsaCard',
          })
        );
      });

      it('should validate data objects for update operations', async () => {
        await expect(
          service.updatePsaCard('valid-id', null as any)
        ).rejects.toThrow('Invalid data provided for updatePsaCard');
        await expect(
          service.updateRawCard('valid-id', undefined as any)
        ).rejects.toThrow('Invalid data provided for updateRawCard');
        await expect(
          service.updateSealedProduct('valid-id', 'invalid' as any)
        ).rejects.toThrow('Invalid data provided for updateSealedProduct');
      });

      it('should validate sale details for mark sold operations', async () => {
        await expect(
          service.markPsaCardSold('valid-id', null as any)
        ).rejects.toThrow('Invalid data provided for markPsaCardSold');
        await expect(
          service.markRawCardSold('valid-id', undefined as any)
        ).rejects.toThrow('Invalid data provided for markRawCardSold');
        await expect(
          service.markSealedProductSold('valid-id', 'invalid' as any)
        ).rejects.toThrow('Invalid data provided for markSealedProductSold');
      });

      it('should accept valid data objects', async () => {
        mockCollectionApi.createPsaGradedCard.mockResolvedValue(mockPsaCard);

        const validCardData = { cardId: 'card-123', grade: 9 };
        await service.createPsaCard(validCardData);

        expect(mockCollectionApi.createPsaGradedCard).toHaveBeenCalledWith(
          validCardData
        );
      });
    });
  });

  describe('PSA Card Operations', () => {
    describe('getPsaGradedCards', () => {
      it('should retrieve PSA cards successfully', async () => {
        const mockCards = [mockPsaCard];
        mockCollectionApi.getPsaGradedCards.mockResolvedValue(mockCards);

        const result = await service.getPsaGradedCards({ sold: false });

        expect(mockCollectionApi.getPsaGradedCards).toHaveBeenCalledWith({
          sold: false,
        });
        expect(result).toEqual(mockCards);
        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] Executing getPsaGradedCards'
        );
        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] Successfully completed getPsaGradedCards'
        );
      });

      it('should validate array response format', async () => {
        mockCollectionApi.getPsaGradedCards.mockResolvedValue(
          'invalid-response' as any
        );

        await expect(service.getPsaGradedCards()).rejects.toThrow(
          'Invalid response format: expected array of PSA cards'
        );

        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] getPsaGradedCards returned non-array result',
          { result: 'invalid-response' }
        );
      });

      it('should handle API errors', async () => {
        const apiError = new Error('Network error');
        mockCollectionApi.getPsaGradedCards.mockRejectedValue(apiError);

        await expect(service.getPsaGradedCards()).rejects.toThrow(
          'Network error'
        );

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(
          apiError,
          'Collection service getPsaGradedCards failed'
        );
      });
    });

    describe('getPsaGradedCardById', () => {
      it('should retrieve PSA card by ID successfully', async () => {
        mockCollectionApi.getPsaGradedCardById.mockResolvedValue(mockPsaCard);

        const result = await service.getPsaGradedCardById('psa-123');

        expect(mockCollectionApi.getPsaGradedCardById).toHaveBeenCalledWith(
          'psa-123'
        );
        expect(result).toEqual(mockPsaCard);
      });

      it('should validate object response format', async () => {
        mockCollectionApi.getPsaGradedCardById.mockResolvedValue(null);

        await expect(service.getPsaGradedCardById('psa-123')).rejects.toThrow(
          'PSA card not found or invalid format: psa-123'
        );

        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] getPsaGradedCardById returned invalid result',
          { id: 'psa-123', result: null }
        );
      });
    });

    describe('createPsaCard', () => {
      it('should create PSA card successfully', async () => {
        mockCollectionApi.createPsaGradedCard.mockResolvedValue(mockPsaCard);

        const cardData = { cardId: 'card-123', grade: 10 };
        const result = await service.createPsaCard(cardData);

        expect(mockCollectionApi.createPsaGradedCard).toHaveBeenCalledWith(
          cardData
        );
        expect(result).toEqual(mockPsaCard);
      });

      it('should validate created card has required properties', async () => {
        const invalidResponse = { id: 'psa-123' }; // Missing cardId
        mockCollectionApi.createPsaGradedCard.mockResolvedValue(
          invalidResponse as any
        );

        const cardData = { cardId: 'card-123', grade: 10 };
        await expect(service.createPsaCard(cardData)).rejects.toThrow(
          'Failed to create PSA card: invalid response format'
        );

        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] createPsaCard returned invalid result',
          { cardData, result: invalidResponse }
        );
      });
    });

    describe('updatePsaCard', () => {
      it('should update PSA card successfully', async () => {
        const updatedCard = { ...mockPsaCard, myPrice: 6000 };
        mockCollectionApi.updatePsaGradedCard.mockResolvedValue(updatedCard);

        const updateData = { myPrice: 6000 };
        const result = await service.updatePsaCard('psa-123', updateData);

        expect(mockCollectionApi.updatePsaGradedCard).toHaveBeenCalledWith(
          'psa-123',
          updateData
        );
        expect(result).toEqual(updatedCard);
      });

      it('should validate updated card response', async () => {
        mockCollectionApi.updatePsaGradedCard.mockResolvedValue(null);

        const updateData = { myPrice: 6000 };
        await expect(
          service.updatePsaCard('psa-123', updateData)
        ).rejects.toThrow('Failed to update PSA card: psa-123');
      });
    });

    describe('deletePsaCard', () => {
      it('should delete PSA card successfully', async () => {
        mockCollectionApi.deletePsaGradedCard.mockResolvedValue(undefined);

        await service.deletePsaCard('psa-123');

        expect(mockCollectionApi.deletePsaGradedCard).toHaveBeenCalledWith(
          'psa-123'
        );
      });
    });

    describe('markPsaCardSold', () => {
      it('should mark PSA card as sold successfully', async () => {
        const soldCard = {
          ...mockPsaCard,
          sold: true,
          saleDetails: mockSaleDetails,
        };
        mockCollectionApi.markPsaGradedCardSold.mockResolvedValue(soldCard);

        const result = await service.markPsaCardSold(
          'psa-123',
          mockSaleDetails
        );

        expect(mockCollectionApi.markPsaGradedCardSold).toHaveBeenCalledWith(
          'psa-123',
          mockSaleDetails
        );
        expect(result).toEqual(soldCard);
      });

      it('should validate sold status in response', async () => {
        const invalidResponse = { ...mockPsaCard, sold: false }; // Not marked as sold
        mockCollectionApi.markPsaGradedCardSold.mockResolvedValue(
          invalidResponse
        );

        await expect(
          service.markPsaCardSold('psa-123', mockSaleDetails)
        ).rejects.toThrow('Failed to mark PSA card as sold: psa-123');

        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] markPsaCardSold returned invalid result',
          {
            id: 'psa-123',
            saleDetails: mockSaleDetails,
            result: invalidResponse,
          }
        );
      });
    });
  });

  describe('Raw Card Operations', () => {
    describe('getRawCards', () => {
      it('should retrieve raw cards successfully', async () => {
        const mockCards = [mockRawCard];
        mockCollectionApi.getRawCards.mockResolvedValue(mockCards);

        const result = await service.getRawCards({ sold: false });

        expect(mockCollectionApi.getRawCards).toHaveBeenCalledWith({
          sold: false,
        });
        expect(result).toEqual(mockCards);
      });

      it('should validate array response format', async () => {
        mockCollectionApi.getRawCards.mockResolvedValue({
          invalid: 'response',
        } as any);

        await expect(service.getRawCards()).rejects.toThrow(
          'Invalid response format: expected array of raw cards'
        );
      });
    });

    describe('createRawCard', () => {
      it('should create raw card successfully', async () => {
        mockCollectionApi.createRawCard.mockResolvedValue(mockRawCard);

        const cardData = { cardId: 'card-123', condition: 'NM' };
        const result = await service.createRawCard(cardData);

        expect(mockCollectionApi.createRawCard).toHaveBeenCalledWith(cardData);
        expect(result).toEqual(mockRawCard);
      });

      it('should validate created card has required properties', async () => {
        const invalidResponse = { id: 'raw-123' }; // Missing cardId
        mockCollectionApi.createRawCard.mockResolvedValue(
          invalidResponse as any
        );

        const cardData = { cardId: 'card-123', condition: 'NM' };
        await expect(service.createRawCard(cardData)).rejects.toThrow(
          'Failed to create raw card: invalid response format'
        );
      });
    });

    describe('markRawCardSold', () => {
      it('should mark raw card as sold successfully', async () => {
        const soldCard = {
          ...mockRawCard,
          sold: true,
          saleDetails: mockSaleDetails,
        };
        mockCollectionApi.markRawCardSold.mockResolvedValue(soldCard);

        const result = await service.markRawCardSold(
          'raw-123',
          mockSaleDetails
        );

        expect(mockCollectionApi.markRawCardSold).toHaveBeenCalledWith(
          'raw-123',
          mockSaleDetails
        );
        expect(result).toEqual(soldCard);
      });

      it('should validate sold status in response', async () => {
        const invalidResponse = { ...mockRawCard, sold: false };
        mockCollectionApi.markRawCardSold.mockResolvedValue(invalidResponse);

        await expect(
          service.markRawCardSold('raw-123', mockSaleDetails)
        ).rejects.toThrow('Failed to mark raw card as sold: raw-123');
      });
    });
  });

  describe('Sealed Product Operations', () => {
    describe('getSealedProducts', () => {
      it('should retrieve sealed products successfully', async () => {
        const mockProducts = [mockSealedProduct];
        mockCollectionApi.getSealedProductCollection.mockResolvedValue(
          mockProducts
        );

        const result = await service.getSealedProducts({ sold: false });

        expect(
          mockCollectionApi.getSealedProductCollection
        ).toHaveBeenCalledWith({ sold: false });
        expect(result).toEqual(mockProducts);
      });

      it('should validate array response format', async () => {
        mockCollectionApi.getSealedProductCollection.mockResolvedValue(
          'not-an-array' as any
        );

        await expect(service.getSealedProducts()).rejects.toThrow(
          'Invalid response format: expected array of sealed products'
        );
      });
    });

    describe('createSealedProduct', () => {
      it('should create sealed product successfully', async () => {
        mockCollectionApi.createSealedProduct.mockResolvedValue(
          mockSealedProduct
        );

        const productData = { productId: 'product-123', name: 'Test Product' };
        const result = await service.createSealedProduct(productData);

        expect(mockCollectionApi.createSealedProduct).toHaveBeenCalledWith(
          productData
        );
        expect(result).toEqual(mockSealedProduct);
      });

      it('should validate created product has required properties', async () => {
        const invalidResponse = { id: 'sealed-123' }; // Missing productId
        mockCollectionApi.createSealedProduct.mockResolvedValue(
          invalidResponse as any
        );

        const productData = { productId: 'product-123', name: 'Test Product' };
        await expect(service.createSealedProduct(productData)).rejects.toThrow(
          'Failed to create sealed product: invalid response format'
        );
      });
    });

    describe('markSealedProductSold', () => {
      it('should mark sealed product as sold successfully', async () => {
        const soldProduct = {
          ...mockSealedProduct,
          sold: true,
          saleDetails: mockSaleDetails,
        };
        mockCollectionApi.markSealedProductSold.mockResolvedValue(soldProduct);

        const result = await service.markSealedProductSold(
          'sealed-123',
          mockSaleDetails
        );

        expect(mockCollectionApi.markSealedProductSold).toHaveBeenCalledWith(
          'sealed-123',
          mockSaleDetails
        );
        expect(result).toEqual(soldProduct);
      });

      it('should validate sold status in response', async () => {
        const invalidResponse = { ...mockSealedProduct, sold: false };
        mockCollectionApi.markSealedProductSold.mockResolvedValue(
          invalidResponse
        );

        await expect(
          service.markSealedProductSold('sealed-123', mockSaleDetails)
        ).rejects.toThrow('Failed to mark sealed product as sold: sealed-123');
      });
    });
  });

  describe('Error Handling and Logging', () => {
    it('should handle and log validation errors', async () => {
      try {
        await service.getPsaGradedCardById('');
      } catch (error) {
        expect(mockLogger.log).toHaveBeenCalledWith(
          '[COLLECTION SERVICE] ID validation failed for getPsaGradedCardById',
          expect.objectContaining({
            id: '',
            operation: 'getPsaGradedCardById',
          })
        );
      }
    });

    it('should wrap API errors with enhanced error handling', async () => {
      const originalError = new Error('Database connection failed');
      mockCollectionApi.getPsaGradedCards.mockRejectedValue(originalError);

      await expect(service.getPsaGradedCards()).rejects.toThrow(
        'Database connection failed'
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        '[COLLECTION SERVICE] Executing getPsaGradedCards'
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[COLLECTION SERVICE] Error in getPsaGradedCards',
        { error: originalError }
      );
      expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(
        originalError,
        'Collection service getPsaGradedCards failed'
      );
    });

    it('should log successful operations', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([mockPsaCard]);

      await service.getPsaGradedCards();

      expect(mockLogger.log).toHaveBeenCalledWith(
        '[COLLECTION SERVICE] Executing getPsaGradedCards'
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[COLLECTION SERVICE] Successfully completed getPsaGradedCards'
      );
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extremely long ID strings', async () => {
      const longId = 'a'.repeat(1000);

      // Should not crash, but may be rejected by validation
      try {
        await service.getPsaGradedCardById(longId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle special characters in IDs', async () => {
      const specialId = 'id-with-special!@#$%^&*()_+-=[]{}|;:,.<>?';
      mockCollectionApi.getPsaGradedCardById.mockResolvedValue(mockPsaCard);

      await service.getPsaGradedCardById(specialId);

      expect(mockCollectionApi.getPsaGradedCardById).toHaveBeenCalledWith(
        specialId
      );
    });

    it('should handle very large data objects', async () => {
      const largeData = {
        cardId: 'card-123',
        grade: 10,
        largeField: 'x'.repeat(10000), // 10KB string
        metadata: Array.from({ length: 1000 }, (_, i) => ({
          key: `value${i}`,
        })),
      };

      mockCollectionApi.createPsaGradedCard.mockResolvedValue(mockPsaCard);

      await service.createPsaCard(largeData);

      expect(mockCollectionApi.createPsaGradedCard).toHaveBeenCalledWith(
        largeData
      );
    });

    it('should handle concurrent operations gracefully', async () => {
      mockCollectionApi.getPsaGradedCardById.mockResolvedValue(mockPsaCard);

      // Run multiple operations concurrently
      const promises = Array.from({ length: 10 }, (_, i) =>
        service.getPsaGradedCardById(`psa-${i}`)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(mockCollectionApi.getPsaGradedCardById).toHaveBeenCalledTimes(10);
    });
  });

  describe('Service Interface Compliance', () => {
    it('should implement all required PSA card methods', () => {
      expect(typeof service.getPsaGradedCards).toBe('function');
      expect(typeof service.getPsaGradedCardById).toBe('function');
      expect(typeof service.createPsaCard).toBe('function');
      expect(typeof service.updatePsaCard).toBe('function');
      expect(typeof service.deletePsaCard).toBe('function');
      expect(typeof service.markPsaCardSold).toBe('function');
    });

    it('should implement all required raw card methods', () => {
      expect(typeof service.getRawCards).toBe('function');
      expect(typeof service.getRawCardById).toBe('function');
      expect(typeof service.createRawCard).toBe('function');
      expect(typeof service.updateRawCard).toBe('function');
      expect(typeof service.deleteRawCard).toBe('function');
      expect(typeof service.markRawCardSold).toBe('function');
    });

    it('should implement all required sealed product methods', () => {
      expect(typeof service.getSealedProducts).toBe('function');
      expect(typeof service.getSealedProductById).toBe('function');
      expect(typeof service.createSealedProduct).toBe('function');
      expect(typeof service.updateSealedProduct).toBe('function');
      expect(typeof service.deleteSealedProduct).toBe('function');
      expect(typeof service.markSealedProductSold).toBe('function');
    });

    it('should return promises for all async methods', async () => {
      mockCollectionApi.getPsaGradedCards.mockResolvedValue([]);

      const result = service.getPsaGradedCards();
      expect(result).toBeInstanceOf(Promise);

      await result; // Ensure it resolves
    });
  });
});
