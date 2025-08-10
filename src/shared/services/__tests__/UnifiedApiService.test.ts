import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnifiedApiService } from '../UnifiedApiService';

// Mock the HTTP client
vi.mock('../base/UnifiedHttpClient', () => ({
  unifiedHttpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UnifiedApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('collection service', () => {
    it('should have collection endpoints', () => {
      expect(UnifiedApiService.collection).toBeDefined();
      expect(typeof UnifiedApiService.collection.getAllItems).toBe('function');
      expect(typeof UnifiedApiService.collection.createItem).toBe('function');
    });
  });

  describe('search service', () => {
    it('should have search endpoints', () => {
      expect(UnifiedApiService.search).toBeDefined();
      expect(typeof UnifiedApiService.search.searchCards).toBe('function');
      expect(typeof UnifiedApiService.search.searchSets).toBe('function');
    });
  });

  describe('auctions service', () => {
    it('should have auction endpoints', () => {
      expect(UnifiedApiService.auctions).toBeDefined();
      expect(typeof UnifiedApiService.auctions.getAll).toBe('function');
      expect(typeof UnifiedApiService.auctions.create).toBe('function');
    });
  });
});
