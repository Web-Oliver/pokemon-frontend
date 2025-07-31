/**
 * Performance Tests for New API Format Only
 * Tests performance characteristics of the simplified API integration
 *
 * Following CLAUDE.md testing principles:
 * - Performance validation for single transformation path
 * - Memory usage and efficiency testing
 * - Error boundary behavior validation
 * - Removes hybrid format complexity
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  transformApiResponse,
  APIResponse,
  mapMongoIds,
} from '../utils/responseTransformer';
import { handleApiError, APIError } from '../utils/errorHandler';
import { createMockApiResponse } from '../test/setup';

// Mock the unified API client to avoid axios interceptor issues
vi.mock('../api/unifiedApiClient', () => ({
  unifiedApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

// Performance test data generators
const generateLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    _id: `item-${i}`,
    cardId: {
      _id: `card-${i}`,
      cardName: `Card ${i}`,
      setId: {
        _id: `set-${i % 10}`, // 10 different sets
        setName: `Set ${i % 10}`,
      },
    },
    grade: Math.floor(Math.random() * 10) + 1,
    myPrice: Math.floor(Math.random() * 10000),
    images: [`image-${i}.jpg`],
    dateAdded: new Date().toISOString(),
    sold: Math.random() > 0.8,
    saleDetails:
      Math.random() > 0.8
        ? {
            payment: 'PayPal',
            actualSoldPrice: Math.floor(Math.random() * 10000),
            delivery: 'Shipped',
            buyerFullName: `Buyer ${i}`,
          }
        : undefined,
    priceHistory: Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, j) => ({
        price: Math.floor(Math.random() * 10000),
        date: new Date(Date.now() - j * 86400000).toISOString(),
        source: 'manual',
      })
    ),
  }));
};

// Generate deeply nested objects for testing ID mapping performance
const generateDeepNestedObject = (depth: number): any => {
  if (depth <= 0) {
    return { _id: `deep-${depth}`, value: `data-${depth}` };
  }
  return {
    _id: `level-${depth}`,
    nested: generateDeepNestedObject(depth - 1),
    data: `level-${depth}-data`,
  };
};

describe('Performance Testing - New API Format Only', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Response Transformation Performance', () => {
    it('should handle small datasets efficiently', () => {
      const smallDataset = generateLargeDataset(10);
      const apiResponse = createMockApiResponse(smallDataset);

      const startTime = performance.now();
      const result = transformApiResponse(apiResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
      expect(result[0].id).toBe('item-0');
      expect(result[9].id).toBe('item-9');
    });

    it('should handle medium datasets efficiently', () => {
      const mediumDataset = generateLargeDataset(100);
      const apiResponse = createMockApiResponse(mediumDataset);

      const startTime = performance.now();
      const result = transformApiResponse(apiResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      expect(result[0].id).toBe('item-0');
      expect(result[99].id).toBe('item-99');
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = generateLargeDataset(1000);
      const apiResponse = createMockApiResponse(largeDataset);

      const startTime = performance.now();
      const result = transformApiResponse(apiResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
      expect(result[0].id).toBe('item-0');
      expect(result[999].id).toBe('item-999');
    });

    it('should handle very large datasets within acceptable time limits', () => {
      const veryLargeDataset = generateLargeDataset(5000);
      const apiResponse = createMockApiResponse(veryLargeDataset);

      const startTime = performance.now();
      const result = transformApiResponse(apiResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(5000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(result[0].id).toBe('item-0');
      expect(result[4999].id).toBe('item-4999');
    });
  });

  describe('Deep Nesting Performance', () => {
    it('should handle deeply nested object transformation efficiently', () => {
      const deepObject = generateDeepNestedObject(20);
      const apiResponse = createMockApiResponse(deepObject);

      const startTime = performance.now();
      const result = transformApiResponse(apiResponse);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should handle deep nesting quickly
      expect(result.id).toBe('level-20');

      // Navigate through nested structure to verify transformation
      let current = result;
      for (let i = 20; i > 0; i--) {
        expect(current.id).toBe(`level-${i}`);
        current = current.nested;
      }
      expect(current.id).toBe('deep-0');
    });

    it('should handle arrays of deeply nested objects', () => {
      const deepObjects = Array.from({ length: 10 }, (_, i) =>
        generateDeepNestedObject(10 + i)
      );
      const apiResponse = createMockApiResponse(deepObjects);

      const startTime = performance.now();
      const result = transformApiResponse(apiResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(100);
      expect(result[0].id).toBe('level-10');
      expect(result[9].id).toBe('level-19');
    });
  });

  describe('Memory Efficiency', () => {
    it('should not cause memory leaks with repeated transformations', () => {
      const testData = generateLargeDataset(100);
      const apiResponse = createMockApiResponse(testData);

      // Simulate memory usage before
      const memBefore = process.memoryUsage().heapUsed;

      // Perform many transformations
      for (let i = 0; i < 1000; i++) {
        const result = transformApiResponse(apiResponse);
        expect(result).toHaveLength(100);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memAfter = process.memoryUsage().heapUsed;

      // Memory usage should be reasonable (less than 50MB increase)
      const memIncrease = memAfter - memBefore;
      expect(memIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle concurrent transformations efficiently', async () => {
      const testData = generateLargeDataset(200);
      const apiResponse = createMockApiResponse(testData);

      const startTime = performance.now();

      // Create multiple concurrent transformation promises
      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve(transformApiResponse(apiResponse))
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toHaveLength(200);
        expect(result[0].id).toBe('item-0');
        expect(result[199].id).toBe('item-199');
      });

      expect(endTime - startTime).toBeLessThan(500); // Concurrent processing should be efficient
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle error processing efficiently', () => {
      const errors = Array.from(
        { length: 100 },
        (_, i) => new APIError(`Error ${i}`, 400, { field: `field-${i}` })
      );

      const startTime = performance.now();
      errors.forEach((error) => {
        try {
          handleApiError(error);
        } catch (e) {
          // Expected to be handled
        }
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // 100 errors in under 50ms
    });

    it('should handle error creation with large payloads efficiently', () => {
      const largePayload = generateLargeDataset(50);
      const errorResponse = {
        success: false,
        status: 'error' as const,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          duration: '100ms',
          cached: false,
        },
        error: {
          message: 'Large payload error',
          code: 'LARGE_PAYLOAD_ERROR',
          details: { payload: largePayload },
        },
      };

      const startTime = performance.now();
      const error = new APIError('Test error', 400, errorResponse);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(errorResponse);
    });

    it('should handle transformation errors gracefully', () => {
      const invalidData = [
        null,
        undefined,
        'string',
        123,
        { invalidStructure: true },
      ];

      invalidData.forEach((data) => {
        const apiResponse = createMockApiResponse(data);

        const startTime = performance.now();
        const result = transformApiResponse(apiResponse);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(10); // Should handle invalid data quickly
        // transformApiResponse should return the data portion, which should be defined
        if (data === null) {
          expect(result).toBeNull();
        } else if (data === undefined) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toBeDefined();
        }
      });
    });
  });

  describe('API Client Integration Performance', () => {
    it('should handle unified client requests efficiently', async () => {
      const testData = generateLargeDataset(50);
      // Transform the test data to add id fields like the real API client would
      const transformedData = transformApiResponse(
        createMockApiResponse(testData)
      );

      // Import the mocked version
      const { unifiedApiClient } = await import('../api/unifiedApiClient');

      // Configure the mock to return our transformed test data
      vi.mocked(unifiedApiClient.get).mockResolvedValue(transformedData);

      const startTime = performance.now();
      const result = await unifiedApiClient.get('/test-endpoint');
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Including mock overhead
      expect(result).toHaveLength(50);
      expect(result[0].id).toBe('item-0');
    });

    it('should handle multiple concurrent API requests', async () => {
      const testData = generateLargeDataset(20);
      // Transform the test data to add id fields like the real API client would
      const transformedData = transformApiResponse(
        createMockApiResponse(testData)
      );

      // Import the mocked version
      const { unifiedApiClient } = await import('../api/unifiedApiClient');

      // Configure the mock to return our transformed test data
      vi.mocked(unifiedApiClient.get).mockResolvedValue(transformedData);

      const startTime = performance.now();

      // Make 5 concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        unifiedApiClient.get('/test-endpoint')
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toHaveLength(20);
        expect(result[0].id).toBe('item-0');
      });

      expect(endTime - startTime).toBeLessThan(200); // Concurrent requests should be efficient
    });
  });

  describe('Mongo ID Mapping Performance', () => {
    it('should handle ID mapping efficiently for large datasets', () => {
      const largeDataset = generateLargeDataset(1000);

      const startTime = performance.now();
      const result = mapMongoIds(largeDataset);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Direct ID mapping should be very fast
      expect(result).toHaveLength(1000);
      expect(result[0].id).toBe('item-0');
      expect(result[999].id).toBe('item-999');
    });

    it('should handle nested ID mapping efficiently', () => {
      const nestedData = {
        _id: 'root',
        level1: {
          _id: 'level1-id',
          level2: {
            _id: 'level2-id',
            items: Array.from({ length: 100 }, (_, i) => ({
              _id: `item-${i}`,
              name: `Item ${i}`,
            })),
          },
        },
      };

      const startTime = performance.now();
      const result = mapMongoIds(nestedData);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(result.id).toBe('root');
      expect(result.level1.id).toBe('level1-id');
      expect(result.level1.level2.id).toBe('level2-id');
      expect(result.level1.level2.items).toHaveLength(100);
      expect(result.level1.level2.items[0].id).toBe('item-0');
    });
  });
});
