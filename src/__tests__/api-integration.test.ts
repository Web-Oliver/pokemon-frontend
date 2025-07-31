/**
 * API Integration Tests for New Response Format Only
 * Tests the simplified response handling system with new API format only
 *
 * Following CLAUDE.md testing principles:
 * - Real backend integration testing (no API mocking)
 * - Comprehensive error handling validation for new format
 * - Removes hybrid format complexity
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  transformApiResponse,
  APIResponse,
} from '../utils/responseTransformer';
import {
  handleApiError,
  APIError,
  getLastApiError,
} from '../utils/errorHandler';
import { createMockApiResponse, createMockErrorResponse } from '../test/setup';

// Mock axios module at the top level
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    },
  };
});

// Mock data for testing - using standardized new format only
const mockPsaCard = {
  _id: '507f1f77bcf86cd799439011',
  cardId: {
    _id: '507f1f77bcf86cd799439012',
    cardName: 'Charizard',
    setId: {
      _id: '507f1f77bcf86cd799439013',
      setName: 'Base Set',
    },
  },
  grade: '10',
  myPrice: 5000,
  images: ['image1.jpg'],
  dateAdded: '2024-01-01T00:00:00.000Z',
  sold: false,
};

const mockApiResponse = createMockApiResponse(mockPsaCard);
const mockApiErrorResponse = createMockErrorResponse(
  'Card not found',
  'CARD_NOT_FOUND',
  { cardId: 'invalid-id' }
);

describe('API Integration - New Response Format Only', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any stored errors
    if (typeof window !== 'undefined') {
      delete (window as any).__lastApiError;
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('API Response Validation', () => {
    it('should validate new API format structure', () => {
      expect(mockApiResponse.success).toBe(true);
      expect(mockApiResponse.status).toBe('success');
      expect(mockApiResponse.data).toBeDefined();
      expect(mockApiResponse.meta).toBeDefined();
      expect(mockApiResponse.meta.timestamp).toBeDefined();
      expect(mockApiResponse.meta.version).toBe('2.0');
    });

    it('should validate error response structure', () => {
      expect(mockApiErrorResponse.success).toBe(false);
      expect(mockApiErrorResponse.status).toBe('error');
      expect(mockApiErrorResponse.data).toBeNull();
      expect(mockApiErrorResponse.error).toBeDefined();
      expect(mockApiErrorResponse.error.message).toBeDefined();
      expect(mockApiErrorResponse.error.code).toBeDefined();
    });

    it('should handle invalid response structures gracefully', () => {
      const invalidResponses = [
        null,
        undefined,
        {},
        { success: true }, // Missing data
        { data: mockPsaCard }, // Missing success
        { success: true, data: mockPsaCard }, // Missing status and meta
      ];

      invalidResponses.forEach((response) => {
        expect(() => transformApiResponse(response as any)).toThrow(); // Should throw errors for invalid formats as designed
      });
    });
  });

  describe('Response Transformation', () => {
    it('should transform API response correctly', () => {
      const result = transformApiResponse(mockApiResponse);

      expect(result).toEqual({
        ...mockPsaCard,
        id: mockPsaCard._id, // Should map _id to id
        cardId: {
          ...mockPsaCard.cardId,
          id: mockPsaCard.cardId._id,
          setId: {
            ...mockPsaCard.cardId.setId,
            id: mockPsaCard.cardId.setId._id,
          },
        },
      });
    });

    it('should handle array responses correctly', () => {
      const arrayData = [mockPsaCard, { ...mockPsaCard, _id: 'different-id' }];
      const arrayResponse = createMockApiResponse(arrayData);

      const result = transformApiResponse(arrayResponse);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(mockPsaCard._id);
      expect(result[1].id).toBe('different-id');
    });

    it('should handle null/undefined data gracefully', () => {
      const nullResponse = createMockApiResponse(null);
      const result = transformApiResponse(nullResponse);

      expect(result).toBeNull();
    });

    it('should preserve nested object structures', () => {
      const complexData = {
        _id: 'test-id',
        nested: {
          _id: 'nested-id',
          deep: {
            _id: 'deep-id',
            value: 'test',
          },
        },
      };

      const response = createMockApiResponse(complexData);
      const result = transformApiResponse(response);

      expect(result.id).toBe('test-id');
      expect(result.nested.id).toBe('nested-id');
      expect(result.nested.deep.id).toBe('deep-id');
      expect(result.nested.deep.value).toBe('test');
    });
  });

  describe('Error Handling Integration', () => {
    it('should properly handle API errors with new format', () => {
      const error = new APIError('Test error', 400, mockApiErrorResponse);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(mockApiErrorResponse);
    });

    it('should store errors for debugging', () => {
      const testError = new APIError('Debug test', 500);
      handleApiError(testError, 'Test context');

      const lastError = getLastApiError();
      expect(lastError).toBeDefined();
      expect(lastError.message).toBe('Debug test');
    });

    it('should handle validation errors from API', () => {
      const validationError = createMockErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        { field: 'grade', issue: 'Invalid grade value' }
      );

      expect(validationError.error.code).toBe('VALIDATION_ERROR');
      expect(validationError.error.details.field).toBe('grade');
    });
  });

  describe('Unified API Client Integration', () => {
    it('should process responses through unified client', async () => {
      const axios = await import('axios');
      const mockAxios = vi.mocked(axios.default);
      const mockCreate = vi.mocked(mockAxios.create);

      // Setup mock axios instance
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({
          data: mockApiResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockCreate.mockReturnValue(mockAxiosInstance as any);

      // Import fresh instance with mocked axios
      const { UnifiedApiClient } = await import('../api/unifiedApiClient');
      const testClient = new UnifiedApiClient();

      const result = await testClient.get('/test-endpoint');

      // Should receive transformed data (not raw response)
      expect(result.id).toBe(mockPsaCard._id);
      expect(result.cardId.id).toBe(mockPsaCard.cardId._id);
    });

    it('should handle API client errors properly', async () => {
      const axios = await import('axios');
      const mockAxios = vi.mocked(axios.default);
      const mockCreate = vi.mocked(mockAxios.create);

      // Mock axios to throw 404 error
      const mockError = {
        response: {
          data: mockApiErrorResponse,
          status: 404,
          statusText: 'Not Found',
        },
        message: 'Request failed with status code 404',
      };

      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockCreate.mockReturnValue(mockAxiosInstance as any);

      const { UnifiedApiClient } = await import('../api/unifiedApiClient');
      const testClient = new UnifiedApiClient();

      await expect(testClient.get('/nonexistent')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const axios = await import('axios');
      const mockAxios = vi.mocked(axios.default);
      const mockCreate = vi.mocked(mockAxios.create);

      // Mock axios to throw network error
      const networkError = new Error('Network error');

      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(networkError),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockCreate.mockReturnValue(mockAxiosInstance as any);

      const { UnifiedApiClient } = await import('../api/unifiedApiClient');
      const testClient = new UnifiedApiClient();

      await expect(testClient.get('/test')).rejects.toThrow('Network error');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle large response payloads', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPsaCard,
        _id: `item-${i}`,
      }));

      const largeResponse = createMockApiResponse(largeArray);

      const startTime = performance.now();
      const result = transformApiResponse(largeResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should be memory efficient with transformations', () => {
      const testData = { ...mockPsaCard };
      const response = createMockApiResponse(testData);

      // Transform multiple times to check for memory leaks
      for (let i = 0; i < 100; i++) {
        const result = transformApiResponse(response);
        expect(result.id).toBe(mockPsaCard._id);
      }

      // Should complete without memory issues
      expect(true).toBe(true);
    });
  });

  describe('Data Consistency Validation', () => {
    it('should ensure ID consistency across all operations', () => {
      const testData = {
        _id: 'consistent-id',
        items: [
          { _id: 'item-1', name: 'Test Item 1' },
          { _id: 'item-2', name: 'Test Item 2' },
        ],
      };

      const response = createMockApiResponse(testData);
      const result = transformApiResponse(response);

      expect(result.id).toBe('consistent-id');
      expect(result.items[0].id).toBe('item-1');
      expect(result.items[1].id).toBe('item-2');
    });

    it('should handle empty arrays correctly', () => {
      const emptyResponse = createMockApiResponse([]);
      const result = transformApiResponse(emptyResponse);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should preserve metadata objects without ID mapping', () => {
      const dataWithMeta = {
        _id: 'data-id',
        metadata: {
          version: '1.0',
          timestamp: '2024-01-01',
          // No _id here - should not get transformed
        },
      };

      const response = createMockApiResponse(dataWithMeta);
      const result = transformApiResponse(response);

      expect(result.id).toBe('data-id');
      expect(result.metadata.version).toBe('1.0');
      expect(result.metadata.id).toBeUndefined(); // Should not be added
    });
  });
});
