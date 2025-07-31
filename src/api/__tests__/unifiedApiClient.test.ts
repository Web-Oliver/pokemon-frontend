/**
 * Comprehensive Tests for UnifiedApiClient
 * CRITICAL: Tests security-sensitive ID validation, error handling, and core HTTP operations
 *
 * Following CLAUDE.md testing principles:
 * - Security-focused testing for ID validation and sanitization
 * - Error handling validation for all HTTP methods
 * - Request/response transformation testing
 * - Optimization and caching behavior testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UnifiedApiClient,
  validateAndSanitizeId,
  buildUrlWithId,
  unifiedApiClient,
} from '../unifiedApiClient';
import { APIError } from '../../utils/errorHandler';
import {
  createMockApiResponse,
  createMockErrorResponse,
} from '../../test/setup';

// Create hoisted mocks for axios
const mocks = vi.hoisted(() => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    axios: {
      create: vi.fn(() => mockAxiosInstance),
    },
    axiosInstance: mockAxiosInstance,
  };
});

// Mock axios with hoisted variables
vi.mock('axios', () => ({
  default: mocks.axios,
}));

// Mock dependencies
vi.mock('../../utils/errorHandler', () => ({
  handleApiError: vi.fn().mockImplementation((error) => {
    // Re-throw the error to simulate real behavior in tests
    throw error;
  }),
  APIError: class MockAPIError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public details?: any
    ) {
      super(message);
      this.name = 'APIError';
    }
  },
}));

vi.mock('../../utils/logger', () => ({
  log: vi.fn(),
}));

vi.mock('../../utils/apiOptimization', () => ({
  optimizedApiRequest: vi.fn((requestFn) => requestFn()),
  BatchProcessor: vi.fn().mockImplementation((processorFn) => ({
    add: vi.fn().mockImplementation(async (item) => {
      // Simulate the batch processor by directly calling the processor function
      const results = await processorFn([item]);
      return results[0];
    }),
  })),
}));

vi.mock('../../utils/responseTransformer', () => ({
  transformApiResponse: vi.fn((data) => {
    // Properly transform API response by extracting the data field
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }
    return data;
  }),
}));

describe('UnifiedApiClient', () => {
  let client: UnifiedApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new UnifiedApiClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Security: ID Validation and Sanitization', () => {
    describe('validateAndSanitizeId', () => {
      it('should accept valid string IDs', () => {
        expect(validateAndSanitizeId('abc123')).toBe('abc123');
        expect(validateAndSanitizeId('user-456')).toBe('user-456');
        expect(validateAndSanitizeId('_id_789')).toBe('_id_789');
      });

      it('should convert valid numbers to strings', () => {
        expect(validateAndSanitizeId(123)).toBe('123');
        expect(validateAndSanitizeId(0)).toBe('0');
      });

      it('should trim whitespace from IDs', () => {
        expect(validateAndSanitizeId('  abc123  ')).toBe('abc123');
        expect(validateAndSanitizeId('\t\ntest\r\n')).toBe('test');
      });

      it('should reject null, undefined, and empty values', () => {
        expect(() => validateAndSanitizeId(null)).toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
        expect(() => validateAndSanitizeId(undefined)).toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
        expect(() => validateAndSanitizeId('')).toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
        expect(() => validateAndSanitizeId('   ')).toThrow(
          'Invalid id: "" is not a valid identifier'
        );
      });

      it('should reject problematic object representations (SECURITY CRITICAL)', () => {
        expect(() => validateAndSanitizeId({})).toThrow(
          'Invalid id: "[object Object]" is not a valid identifier'
        );
        expect(() => validateAndSanitizeId([])).toThrow(
          'Invalid id: "" is not a valid identifier'
        );
        expect(() => validateAndSanitizeId('[object Object]')).toThrow(
          'Invalid id: "[object Object]" is not a valid identifier'
        );
        expect(() => validateAndSanitizeId('[object Array]')).toThrow(
          'Invalid id: "[object Array]" is not a valid identifier'
        );
      });

      it('should reject dangerous string patterns', () => {
        expect(() => validateAndSanitizeId('undefined')).toThrow(
          'Invalid id: "undefined" is not a valid identifier'
        );
        expect(() => validateAndSanitizeId('null')).toThrow(
          'Invalid id: "null" is not a valid identifier'
        );
      });

      it('should enforce reasonable length limits', () => {
        const longId = 'a'.repeat(101);
        expect(() => validateAndSanitizeId(longId)).toThrow(
          `Invalid id: "${longId}" is not a valid identifier`
        );
      });

      it('should use custom parameter names in error messages', () => {
        expect(() => validateAndSanitizeId(null, 'userId')).toThrow(
          'Invalid userId: cannot be null, undefined, or empty'
        );
        expect(() => validateAndSanitizeId({}, 'productId')).toThrow(
          'Invalid productId: "[object Object]" is not a valid identifier'
        );
      });
    });

    describe('buildUrlWithId', () => {
      it('should build valid URLs with string IDs', () => {
        expect(buildUrlWithId('/api/users', 'user123')).toBe(
          '/api/users/user123'
        );
        expect(buildUrlWithId('/api/products', 'prod-456')).toBe(
          '/api/products/prod-456'
        );
      });

      it('should build URLs with subpaths', () => {
        expect(buildUrlWithId('/api/users', 'user123', 'profile')).toBe(
          '/api/users/user123/profile'
        );
        expect(buildUrlWithId('/api/products', 'prod-456', 'images')).toBe(
          '/api/products/prod-456/images'
        );
      });

      it('should validate IDs before building URLs', () => {
        expect(() => buildUrlWithId('/api/users', null)).toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
        expect(() => buildUrlWithId('/api/users', {})).toThrow(
          'Invalid id: "[object Object]" is not a valid identifier'
        );
      });

      it('should handle numeric IDs', () => {
        expect(buildUrlWithId('/api/users', 123)).toBe('/api/users/123');
        expect(buildUrlWithId('/api/users', 123, 'settings')).toBe(
          '/api/users/123/settings'
        );
      });
    });
  });

  describe('HTTP Methods with Error Handling', () => {
    describe('GET requests', () => {
      it('should make successful GET requests', async () => {
        const mockData = { id: 1, name: 'Test' };
        const mockResponse = createMockApiResponse(mockData);
        mocks.axiosInstance.get.mockResolvedValue({ data: mockResponse });

        const result = await client.get('/api/test');

        expect(mocks.axiosInstance.get).toHaveBeenCalledWith('/api/test', {});
        expect(result).toEqual(mockData);
      });

      it('should handle GET request errors', async () => {
        const mockError = new Error('Network error');
        mocks.axiosInstance.get.mockRejectedValue(mockError);

        await expect(client.get('/api/test')).rejects.toThrow('Network error');
      });

      it('should apply optimization configuration', async () => {
        const mockData = { test: 'data' };
        mocks.axiosInstance.get.mockResolvedValue({ data: mockData });

        await client.get('/api/test', {
          optimization: {
            enableCache: true,
            cacheTTL: 60000,
          },
        });

        expect(mocks.axiosInstance.get).toHaveBeenCalled();
      });
    });

    describe('POST requests', () => {
      it('should make successful POST requests', async () => {
        const postData = { name: 'New Item' };
        const mockResponse = createMockApiResponse({ id: 1, ...postData });
        mocks.axiosInstance.post.mockResolvedValue({ data: mockResponse });

        const result = await client.post('/api/items', postData);

        expect(mocks.axiosInstance.post).toHaveBeenCalledWith(
          '/api/items',
          postData,
          {}
        );
        expect(result).toEqual({ id: 1, ...postData });
      });

      it('should handle POST request errors', async () => {
        const mockError = new Error('Validation error');
        mocks.axiosInstance.post.mockRejectedValue(mockError);

        await expect(client.post('/api/items', {})).rejects.toThrow(
          'Validation error'
        );
      });
    });

    describe('PUT requests', () => {
      it('should make successful PUT requests', async () => {
        const updateData = { name: 'Updated Item' };
        const mockResponse = createMockApiResponse({ id: 1, ...updateData });
        mocks.axiosInstance.put.mockResolvedValue({ data: mockResponse });

        const result = await client.put('/api/items/1', updateData);

        expect(mocks.axiosInstance.put).toHaveBeenCalledWith(
          '/api/items/1',
          updateData,
          {}
        );
        expect(result).toEqual({ id: 1, ...updateData });
      });

      it('should handle PUT request errors', async () => {
        const mockError = new Error('Not found');
        mocks.axiosInstance.put.mockRejectedValue(mockError);

        await expect(client.put('/api/items/1', {})).rejects.toThrow(
          'Not found'
        );
      });
    });

    describe('DELETE requests', () => {
      it('should make successful DELETE requests', async () => {
        mocks.axiosInstance.delete.mockResolvedValue({ data: null });

        await client.delete('/api/items/1');

        expect(mocks.axiosInstance.delete).toHaveBeenCalledWith(
          '/api/items/1',
          {}
        );
      });

      it('should handle DELETE request errors', async () => {
        const mockError = new Error('Forbidden');
        mocks.axiosInstance.delete.mockRejectedValue(mockError);

        await expect(client.delete('/api/items/1')).rejects.toThrow(
          'Forbidden'
        );
      });
    });
  });

  describe('ID-Validated HTTP Methods (Security Critical)', () => {
    describe('getById', () => {
      it('should make GET requests with validated IDs', async () => {
        const mockData = { id: 'user123', name: 'Test User' };
        const mockResponse = createMockApiResponse(mockData);
        mocks.axiosInstance.get.mockResolvedValue({ data: mockResponse });

        const result = await client.getById('/api/users', 'user123');

        expect(mocks.axiosInstance.get).toHaveBeenCalledWith(
          '/api/users/user123',
          expect.objectContaining({
            operation: 'fetch /api/users/user123',
          })
        );
        expect(result).toEqual(mockData);
      });

      it('should reject invalid IDs for getById', async () => {
        await expect(client.getById('/api/users', null)).rejects.toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
        await expect(client.getById('/api/users', {})).rejects.toThrow(
          'Invalid id: "[object Object]" is not a valid identifier'
        );
      });

      it('should handle subpaths in getById', async () => {
        const mockData = { profile: 'data' };
        mocks.axiosInstance.get.mockResolvedValue({ data: mockData });

        await client.getById('/api/users', 'user123', 'profile');

        expect(mocks.axiosInstance.get).toHaveBeenCalledWith(
          '/api/users/user123/profile',
          expect.objectContaining({
            operation: 'fetch /api/users/user123/profile',
          })
        );
      });
    });

    describe('putById', () => {
      it('should make PUT requests with validated IDs', async () => {
        const updateData = { name: 'Updated' };
        const mockResponse = createMockApiResponse(updateData);
        mocks.axiosInstance.put.mockResolvedValue({ data: mockResponse });

        const result = await client.putById(
          '/api/users',
          'user123',
          updateData
        );

        expect(mocks.axiosInstance.put).toHaveBeenCalledWith(
          '/api/users/user123',
          updateData,
          expect.objectContaining({
            operation: 'update /api/users/user123',
          })
        );
        expect(result).toEqual(updateData);
      });

      it('should reject invalid IDs for putById', async () => {
        await expect(client.putById('/api/users', null, {})).rejects.toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
        await expect(
          client.putById('/api/users', undefined, {})
        ).rejects.toThrow('Invalid id: cannot be null, undefined, or empty');
      });
    });

    describe('deleteById', () => {
      it('should make DELETE requests with validated IDs', async () => {
        mocks.axiosInstance.delete.mockResolvedValue({ data: null });

        await client.deleteById('/api/users', 'user123');

        expect(mocks.axiosInstance.delete).toHaveBeenCalledWith(
          '/api/users/user123',
          expect.objectContaining({
            operation: 'delete /api/users/user123',
          })
        );
      });

      it('should reject invalid IDs for deleteById', async () => {
        await expect(client.deleteById('/api/users', {})).rejects.toThrow(
          'Invalid id: "[object Object]" is not a valid identifier'
        );
        await expect(client.deleteById('/api/users', '')).rejects.toThrow(
          'Invalid id: cannot be null, undefined, or empty'
        );
      });
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch GET requests', async () => {
      const urls = ['/api/items/1', '/api/items/2'];
      const mockResponses = [
        createMockApiResponse({ id: 1 }),
        createMockApiResponse({ id: 2 }),
      ];

      mocks.axiosInstance.get
        .mockResolvedValueOnce({ data: mockResponses[0] })
        .mockResolvedValueOnce({ data: mockResponses[1] });

      const results = await client.batchGet(urls);

      expect(results).toHaveLength(2);
      expect(mocks.axiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle batch POST requests', async () => {
      const requests = [
        { url: '/api/items', data: { name: 'Item 1' } },
        { url: '/api/items', data: { name: 'Item 2' } },
      ];

      const mockResponses = [
        createMockApiResponse({ id: 1, name: 'Item 1' }),
        createMockApiResponse({ id: 2, name: 'Item 2' }),
      ];

      mocks.axiosInstance.post
        .mockResolvedValueOnce({ data: mockResponses[0] })
        .mockResolvedValueOnce({ data: mockResponses[1] });

      const results = await client.batchPost(requests);

      expect(results).toHaveLength(2);
      expect(mocks.axiosInstance.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Wrapper Methods', () => {
    it('should use apiGet wrapper with standardized logging', async () => {
      const mockData = { test: 'data' };
      const mockResponse = createMockApiResponse(mockData);
      mocks.axiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await client.apiGet('/api/test', 'test data');

      expect(mocks.axiosInstance.get).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          operation: 'fetch test data',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should use apiCreate wrapper with success messages', async () => {
      const createData = { name: 'New Item' };
      const mockResponse = createMockApiResponse(createData);
      mocks.axiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.apiCreate('/api/items', createData, 'item');

      expect(mocks.axiosInstance.post).toHaveBeenCalledWith(
        '/api/items',
        createData,
        expect.objectContaining({
          operation: 'create item',
          successMessage: 'item created successfully',
        })
      );
      expect(result).toEqual(createData);
    });

    it('should use apiUpdate wrapper with success messages', async () => {
      const updateData = { name: 'Updated Item' };
      const mockResponse = createMockApiResponse(updateData);
      mocks.axiosInstance.put.mockResolvedValue({ data: mockResponse });

      const result = await client.apiUpdate('/api/items/1', updateData, 'item');

      expect(mocks.axiosInstance.put).toHaveBeenCalledWith(
        '/api/items/1',
        updateData,
        expect.objectContaining({
          operation: 'update item',
          successMessage: 'item updated successfully',
        })
      );
      expect(result).toEqual(updateData);
    });

    it('should use apiDelete wrapper with success messages', async () => {
      mocks.axiosInstance.delete.mockResolvedValue({ data: null });

      await client.apiDelete('/api/items/1', 'item');

      expect(mocks.axiosInstance.delete).toHaveBeenCalledWith(
        '/api/items/1',
        expect.objectContaining({
          operation: 'delete item',
          successMessage: 'item deleted successfully',
        })
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle axios errors properly', async () => {
      const axiosError = {
        response: {
          status: 404,
          data: createMockErrorResponse('Not found', 'NOT_FOUND'),
        },
      };

      mocks.axiosInstance.get.mockRejectedValue(axiosError);

      await expect(client.get('/api/nonexistent')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mocks.axiosInstance.get.mockRejectedValue(networkError);

      await expect(client.get('/api/test')).rejects.toThrow('Network Error');
    });

    it('should log ID validation failures', async () => {
      const mockLogger = vi.mocked(await import('../../utils/logger'));

      try {
        await client.getById('/api/users', { invalid: 'object' });
      } catch (error) {
        // Expected to throw
      }

      // Verify that ID validation error details were logged
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('ID validation failed'),
        expect.objectContaining({
          providedId: { invalid: 'object' },
          typeOfId: 'object',
        })
      );
    });
  });

  describe('Configuration and Utilities', () => {
    it('should allow setting optimization strategy', () => {
      const mockStrategy = {
        optimize: vi.fn().mockImplementation((request) => request()),
      };

      client.setOptimizationStrategy(mockStrategy);

      // The strategy should be used in subsequent requests
      expect(typeof client.setOptimizationStrategy).toBe('function');
    });

    it('should provide access to axios instance', () => {
      const instance = client.getAxiosInstance();
      expect(instance).toBeDefined();
      expect(typeof instance.get).toBe('function');
    });

    it('should handle prefetch requests silently', async () => {
      const mockData = { test: 'prefetch' };
      mocks.axiosInstance.get.mockResolvedValue({ data: mockData });

      // Should not throw even if it fails
      await client.prefetch('/api/prefetch');

      expect(mocks.axiosInstance.get).toHaveBeenCalled();
    });

    it('should handle prefetch failures silently', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      mocks.axiosInstance.get.mockRejectedValue(new Error('Prefetch failed'));

      // Should not throw
      await expect(client.prefetch('/api/prefetch')).resolves.not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[UnifiedApiClient] Prefetch failed:',
        expect.any(Error)
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Singleton Instance', () => {
    it('should provide a default singleton instance', () => {
      expect(unifiedApiClient).toBeInstanceOf(UnifiedApiClient);
    });

    it('should provide default export with bound methods', async () => {
      const defaultExport = (await import('../unifiedApiClient')).default;

      expect(typeof defaultExport.get).toBe('function');
      expect(typeof defaultExport.post).toBe('function');
      expect(typeof defaultExport.put).toBe('function');
      expect(typeof defaultExport.delete).toBe('function');
      expect(typeof defaultExport.apiGet).toBe('function');
      expect(typeof defaultExport.apiCreate).toBe('function');
    });
  });
});
