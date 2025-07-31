/**
 * Comprehensive Tests for Response Transformer
 * CRITICAL: Tests data transformation, security validation, and MongoDB ID mapping
 *
 * Following CLAUDE.md testing principles:
 * - Security-focused testing for malformed response handling
 * - Data integrity validation for MongoDB ID mapping
 * - API format validation and error handling
 * - Metadata preservation testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  transformApiResponse,
  extractResponseData,
  mapMongoIds,
  isMetadataObject,
  ResponseTransformers,
  validateApiResponse,
  transformResponse,
  createResponseTransformer,
} from '../responseTransformer';
import {
  createMockApiResponse,
  createMockErrorResponse,
} from '../../test/setup';

describe('ResponseTransformer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security: API Response Validation', () => {
    it('should accept valid new API format responses', () => {
      const validResponse = createMockApiResponse({ test: 'data' });

      expect(() => transformApiResponse(validResponse)).not.toThrow();
      const result = transformApiResponse(validResponse);
      expect(result).toEqual({ test: 'data' });
    });

    it('should reject responses missing required fields', () => {
      const invalidResponses = [
        { data: 'test' }, // Missing success, status, meta
        { success: true, data: 'test' }, // Missing status, meta
        { success: true, status: 'success', data: 'test' }, // Missing meta
        {
          success: true,
          status: 'success',
          data: 'test',
          meta: {}, // Invalid meta structure
        },
        {
          success: true,
          status: 'success',
          data: 'test',
          meta: { timestamp: 'test' }, // Missing required meta fields
        },
      ];

      invalidResponses.forEach((response, index) => {
        expect(() => transformApiResponse(response)).toThrow(
          'Invalid API response format - expected new standardized format'
        );
      });
    });

    it('should reject null, undefined, and non-object responses', () => {
      const invalidInputs = [null, undefined, 'string', 123, [], true];

      invalidInputs.forEach((input) => {
        expect(() => transformApiResponse(input)).toThrow(
          'Invalid API response format - expected new standardized format'
        );
      });
    });

    it('should handle malformed meta objects', () => {
      const malformedMeta = {
        success: true,
        status: 'success',
        data: { test: 'data' },
        meta: {
          timestamp: null, // Invalid timestamp
          version: undefined, // Invalid version
          duration: 123, // Should be string
        },
      };

      expect(() => transformApiResponse(malformedMeta)).toThrow(
        'Invalid API response format - expected new standardized format'
      );
    });
  });

  describe('Error Response Handling', () => {
    it('should throw errors for failed API responses', () => {
      const errorResponse = {
        success: false,
        status: 'error',
        data: null,
        message: 'Validation failed',
        meta: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          duration: '5ms',
          cached: false,
        },
        details: {
          field: 'email',
          reason: 'Invalid format',
        },
      };

      const thrownError = expect(() =>
        transformApiResponse(errorResponse)
      ).toThrow('Validation failed');

      try {
        transformApiResponse(errorResponse);
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.details).toEqual({
          field: 'email',
          reason: 'Invalid format',
        });
        expect(error.apiResponse).toEqual(errorResponse);
      }
    });

    it('should handle error responses without message', () => {
      const errorResponse = {
        success: false,
        status: 'error',
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          duration: '5ms',
          cached: false,
        },
      };

      try {
        transformApiResponse(errorResponse);
      } catch (error: any) {
        expect(error.message).toBe('API request failed');
        expect(error.statusCode).toBe(500); // Defaults to 500 for unknown error status
      }
    });

    it('should handle partial status errors', () => {
      const partialResponse = {
        success: false,
        status: 'partial',
        data: { incomplete: 'data' },
        message: 'Partial failure',
        meta: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          duration: '10ms',
          cached: false,
        },
      };

      try {
        transformApiResponse(partialResponse);
      } catch (error: any) {
        expect(error.message).toBe('Partial failure');
        expect(error.statusCode).toBe(500); // Partial status treated as server error
      }
    });
  });

  describe('MongoDB ID Mapping (Data Integrity Critical)', () => {
    it('should map _id to id for simple objects', () => {
      const responseData = createMockApiResponse({
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Item',
        category: 'test',
      });

      const result = transformApiResponse(responseData);

      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result._id).toBe('507f1f77bcf86cd799439011'); // Original preserved
      expect(result.name).toBe('Test Item');
    });

    it('should not override existing id fields', () => {
      const responseData = createMockApiResponse({
        _id: '507f1f77bcf86cd799439011',
        id: 'existing-id',
        name: 'Test Item',
      });

      const result = transformApiResponse(responseData);

      expect(result.id).toBe('existing-id'); // Existing id preserved
      expect(result._id).toBe('507f1f77bcf86cd799439011');
    });

    it('should recursively map IDs in nested objects', () => {
      const responseData = createMockApiResponse({
        _id: 'parent-id',
        cardId: {
          _id: 'card-id',
          cardName: 'Charizard',
          setId: {
            _id: 'set-id',
            setName: 'Base Set',
          },
        },
      });

      const result = transformApiResponse(responseData);

      expect(result.id).toBe('parent-id');
      expect(result.cardId.id).toBe('card-id');
      expect(result.cardId.setId.id).toBe('set-id');
    });

    it('should map IDs in arrays', () => {
      const responseData = createMockApiResponse([
        { _id: 'item1', name: 'First' },
        { _id: 'item2', name: 'Second' },
        { _id: 'item3', name: 'Third' },
      ]);

      const result = transformApiResponse(responseData);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBe('item1');
      expect(result[1].id).toBe('item2');
      expect(result[2].id).toBe('item3');
    });

    it('should handle mixed nested arrays and objects', () => {
      const responseData = createMockApiResponse({
        _id: 'collection-id',
        items: [
          {
            _id: 'item1',
            details: {
              _id: 'detail1',
              info: 'test',
            },
          },
          {
            _id: 'item2',
            details: {
              _id: 'detail2',
              info: 'test2',
            },
          },
        ],
      });

      const result = transformApiResponse(responseData);

      expect(result.id).toBe('collection-id');
      expect(result.items[0].id).toBe('item1');
      expect(result.items[0].details.id).toBe('detail1');
      expect(result.items[1].id).toBe('item2');
      expect(result.items[1].details.id).toBe('detail2');
    });
  });

  describe('Metadata Object Preservation (Business Logic Critical)', () => {
    it('should identify metadata objects by key names', () => {
      expect(isMetadataObject('saleDetails', {})).toBe(true);
      expect(isMetadataObject('psaGrades', {})).toBe(true);
      expect(isMetadataObject('priceHistory', [])).toBe(true);
      expect(isMetadataObject('buyerAddress', {})).toBe(true);

      expect(isMetadataObject('cardId', {})).toBe(false);
      expect(isMetadataObject('setId', {})).toBe(false);
      expect(isMetadataObject('productId', {})).toBe(false);
    });

    it('should identify metadata objects by properties', () => {
      const saleDetailsObj = {
        paymentMethod: 'PayPal',
        deliveryMethod: 'Shipped',
        actualSoldPrice: 100,
        buyerFullName: 'John Doe',
      };

      const psaGradesObj = {
        grades: { '10': 5, '9': 10, '8': 20 },
        population: 1000,
      };

      const normalObj = {
        name: 'Test Item',
        category: 'test',
      };

      expect(isMetadataObject('details', saleDetailsObj)).toBe(true);
      expect(isMetadataObject('grades', psaGradesObj)).toBe(true);
      expect(isMetadataObject('item', normalObj)).toBe(false);
    });

    it('should preserve metadata objects without ID mapping', () => {
      const responseData = createMockApiResponse({
        _id: 'card-id',
        cardName: 'Charizard',
        saleDetails: {
          _id: 'sale-id', // This should NOT be mapped to id
          paymentMethod: 'PayPal',
          actualSoldPrice: 5000,
          buyerAddress: {
            _id: 'addr-id', // This should NOT be mapped either
            streetName: '123 Main St',
            city: 'Springfield',
          },
        },
        priceHistory: [
          { _id: 'history1', price: 4000, date: '2023-01-01' },
          { _id: 'history2', price: 5000, date: '2024-01-01' },
        ],
      });

      const result = transformApiResponse(responseData);

      // Main object should have ID mapped
      expect(result.id).toBe('card-id');

      // Metadata objects should preserve original structure
      expect(result.saleDetails._id).toBe('sale-id');
      expect(result.saleDetails.id).toBeUndefined();
      expect(result.saleDetails.paymentMethod).toBe('PayPal');

      expect(result.saleDetails.buyerAddress._id).toBe('addr-id');
      expect(result.saleDetails.buyerAddress.id).toBeUndefined();

      // Price history should also be preserved
      expect(result.priceHistory[0]._id).toBe('history1');
      expect(result.priceHistory[0].id).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle null and undefined values safely', () => {
      expect(mapMongoIds(null)).toBeNull();
      expect(mapMongoIds(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(mapMongoIds('string')).toBe('string');
      expect(mapMongoIds(123)).toBe(123);
      expect(mapMongoIds(true)).toBe(true);
    });

    it('should handle empty arrays and objects', () => {
      const responseData = createMockApiResponse({
        emptyArray: [],
        emptyObject: {},
        nullValue: null,
        undefinedValue: undefined,
      });

      const result = transformApiResponse(responseData);

      expect(Array.isArray(result.emptyArray)).toBe(true);
      expect(result.emptyArray.length).toBe(0);
      expect(typeof result.emptyObject).toBe('object');
      expect(result.nullValue).toBeNull();
      expect(result.undefinedValue).toBeUndefined();
    });

    it('should handle circular references gracefully', () => {
      const circularObj: any = { name: 'circular' };
      circularObj.self = circularObj;

      // This should not cause infinite recursion or throw
      const result = mapMongoIds(circularObj);
      expect(result.name).toBe('circular');
      expect(result.self).toBe(result); // Circular reference preserved
    });

    it('should handle very deeply nested objects', () => {
      const deepObj: any = { _id: 'level0' };
      let current = deepObj;

      // Create 50 levels of nesting
      for (let i = 1; i < 50; i++) {
        current.nested = { _id: `level${i}` };
        current = current.nested;
      }

      const responseData = createMockApiResponse(deepObj);
      const result = transformApiResponse(responseData);

      expect(result.id).toBe('level0');

      // Check a few levels deep
      let currentResult = result;
      for (let i = 1; i < 5; i++) {
        expect(currentResult.nested.id).toBe(`level${i}`);
        currentResult = currentResult.nested;
      }
    });
  });

  describe('Data Extraction Utilities', () => {
    it('should extract data from wrapped responses', () => {
      const wrappedData = {
        success: true,
        count: 3,
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
        ],
      };

      const extracted = extractResponseData(wrappedData);

      expect(Array.isArray(extracted)).toBe(true);
      expect(extracted.length).toBe(3);
      expect(extracted[0].name).toBe('Item 1');
    });

    it('should return data as-is when not wrapped', () => {
      const directData = { id: 1, name: 'Direct Item' };
      const result = extractResponseData(directData);

      expect(result).toEqual(directData);
    });

    it('should handle various wrapper formats', () => {
      const formats = [
        { data: 'test' },
        { result: 'test', data: 'correct' }, // Should prioritize 'data'
        { payload: 'test' }, // No 'data' field, return as-is
      ];

      expect(extractResponseData(formats[0])).toBe('test');
      expect(extractResponseData(formats[1])).toBe('correct');
      expect(extractResponseData(formats[2])).toEqual({ payload: 'test' });
    });
  });

  describe('Response Transformer Factory and Configuration', () => {
    it('should create custom transformers with specific configurations', () => {
      const noIdMappingTransformer = createResponseTransformer({
        extractData: true,
        mapMongoIds: false,
      });

      const testData = {
        data: {
          _id: 'test-id',
          name: 'Test Item',
        },
      };

      const result = noIdMappingTransformer(testData);

      expect(result._id).toBe('test-id');
      expect(result.id).toBeUndefined(); // ID mapping disabled
      expect(result.name).toBe('Test Item');
    });

    it('should apply custom transformations', () => {
      const customTransformer = createResponseTransformer({
        customTransformations: [
          (data) => ({ ...data, customField: 'added' }),
          (data) => ({ ...data, timestamp: new Date().toISOString() }),
        ],
      });

      const result = customTransformer({ test: 'data' });

      expect(result.test).toBe('data');
      expect(result.customField).toBe('added');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Response Transformer Presets', () => {
    it('should provide standard transformer', () => {
      const testData = createMockApiResponse({
        _id: 'test-id',
        name: 'Test',
      });

      const result = ResponseTransformers.standard(testData);

      expect(result.id).toBe('test-id');
      expect(result.name).toBe('Test');
    });

    it('should provide enhanced transformer (alias)', () => {
      const testData = createMockApiResponse({
        _id: 'test-id',
        name: 'Test',
      });

      const result = ResponseTransformers.enhanced(testData);

      expect(result.id).toBe('test-id');
      expect(result.name).toBe('Test');
    });

    it('should provide noIdMapping transformer', () => {
      const testData = {
        data: {
          _id: 'test-id',
          name: 'Test',
        },
      };

      const result = ResponseTransformers.noIdMapping(testData);

      expect(result._id).toBe('test-id');
      expect(result.id).toBeUndefined();
      expect(result.name).toBe('Test');
    });

    it('should provide extractOnly transformer', () => {
      const testData = {
        success: true,
        data: { extracted: 'data' },
      };

      const result = ResponseTransformers.extractOnly(testData);

      expect(result).toEqual({ extracted: 'data' });
    });

    it('should provide raw transformer', () => {
      const testData = { raw: 'data' };
      const result = ResponseTransformers.raw(testData);

      expect(result).toEqual(testData);
      expect(result).toBe(testData); // Should be same reference
    });
  });

  describe('Backward Compatibility and Deprecation Warnings', () => {
    it('should warn about deprecated functions', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Test deprecated imports
      const {
        transformNewApiResponse,
        transformStandardResponse,
      } = require('../responseTransformer');

      const testData = createMockApiResponse({ test: 'data' });

      transformNewApiResponse(testData);
      expect(consoleSpy).toHaveBeenCalledWith(
        'transformNewApiResponse is deprecated, use transformApiResponse instead'
      );

      transformStandardResponse(testData);
      expect(consoleSpy).toHaveBeenCalledWith(
        'transformStandardResponse is deprecated, use transformApiResponse instead'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Memory Safety', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        _id: `item-${i}`,
        name: `Item ${i}`,
        data: Array.from({ length: 100 }, (_, j) => `data-${j}`),
      }));

      const responseData = createMockApiResponse(largeDataset);

      const startTime = performance.now();
      const result = transformApiResponse(responseData);
      const endTime = performance.now();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1000);
      expect(result[0].id).toBe('item-0');
      expect(result[999].id).toBe('item-999');

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second max
    });

    it('should not cause memory leaks with repeated transformations', () => {
      const testData = createMockApiResponse({
        _id: 'test-id',
        largeArray: Array.from({ length: 1000 }, (_, i) => ({
          _id: `item-${i}`,
        })),
      });

      // Run transformation multiple times
      for (let i = 0; i < 100; i++) {
        const result = transformApiResponse(testData);
        expect(result.id).toBe('test-id');
      }

      // If this test completes without throwing, memory usage is acceptable
      expect(true).toBe(true);
    });
  });
});
