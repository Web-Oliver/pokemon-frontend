/**
 * Unit Tests for Ordering Utilities
 *
 * Following CLAUDE.md testing principles:
 * - Single Responsibility: Each test focuses on one specific function
 * - Comprehensive coverage: Tests normal cases, edge cases, and error scenarios
 * - Clear naming: Test names describe exactly what is being tested
 */

import { describe, it, expect } from 'vitest';
import {
  getItemCategory,
  sortItemsByPrice,
  validateItemOrder,
  getSortablePrice,
  moveItemInArray,
} from '../orderingUtils';
import { CollectionItem, ItemCategory } from '../../domain/models/ordering';

// Mock collection items for testing
const mockPsaCard: CollectionItem = {
  id: 'psa-1',
  grade: 9,
  myPrice: 500,
  cardId: { cardName: 'Test PSA Card' },
};

const mockRawCard: CollectionItem = {
  id: 'raw-1',
  condition: 'NM',
  myPrice: 200,
  cardId: { cardName: 'Test Raw Card' },
};

const mockSealedProduct: CollectionItem = {
  id: 'sealed-1',
  name: 'Test Booster Box',
  myPrice: 800,
  category: 'booster-box',
};

const mockItems: CollectionItem[] = [
  mockPsaCard,
  mockRawCard,
  mockSealedProduct,
];

describe('orderingUtils', () => {
  describe('getItemCategory', () => {
    it('should identify PSA graded card correctly', () => {
      const category = getItemCategory(mockPsaCard);
      expect(category).toBe('PSA_CARD');
    });

    it('should identify raw card correctly', () => {
      const category = getItemCategory(mockRawCard);
      expect(category).toBe('RAW_CARD');
    });

    it('should identify sealed product correctly', () => {
      const category = getItemCategory(mockSealedProduct);
      expect(category).toBe('SEALED_PRODUCT');
    });

    it('should handle item with both grade and condition (PSA takes precedence)', () => {
      const hybridItem = { ...mockPsaCard, condition: 'NM' };
      const category = getItemCategory(hybridItem);
      expect(category).toBe('PSA_CARD');
    });

    it('should default to SEALED_PRODUCT for unrecognized items', () => {
      const unknownItem = { id: 'unknown', myPrice: 100 } as CollectionItem;
      const category = getItemCategory(unknownItem);
      expect(category).toBe('SEALED_PRODUCT');
    });
  });

  describe('getSortablePrice', () => {
    it('should return numeric price when myPrice is a number', () => {
      const price = getSortablePrice(mockPsaCard);
      expect(price).toBe(500);
    });

    it('should parse string price correctly', () => {
      const itemWithStringPrice = { ...mockPsaCard, myPrice: '750' };
      const price = getSortablePrice(itemWithStringPrice);
      expect(price).toBe(750);
    });

    it('should handle null/undefined price', () => {
      const itemWithNullPrice = { ...mockPsaCard, myPrice: null };
      const price = getSortablePrice(itemWithNullPrice);
      expect(price).toBe(0);
    });

    it('should handle invalid string price', () => {
      const itemWithInvalidPrice = { ...mockPsaCard, myPrice: 'invalid' };
      const price = getSortablePrice(itemWithInvalidPrice);
      expect(price).toBe(0);
    });

    it('should handle decimal prices', () => {
      const itemWithDecimalPrice = { ...mockPsaCard, myPrice: 123.45 };
      const price = getSortablePrice(itemWithDecimalPrice);
      expect(price).toBe(123.45);
    });
  });

  describe('sortItemsByPrice', () => {
    it('should sort items by price in descending order by default', () => {
      const sorted = sortItemsByPrice(mockItems);
      expect(sorted[0].myPrice).toBe(800); // Sealed product
      expect(sorted[1].myPrice).toBe(500); // PSA card
      expect(sorted[2].myPrice).toBe(200); // Raw card
    });

    it('should sort items by price in ascending order when specified', () => {
      const sorted = sortItemsByPrice(mockItems, true);
      expect(sorted[0].myPrice).toBe(200); // Raw card
      expect(sorted[1].myPrice).toBe(500); // PSA card
      expect(sorted[2].myPrice).toBe(800); // Sealed product
    });

    it('should not mutate the original array', () => {
      const originalOrder = [...mockItems];
      sortItemsByPrice(mockItems);
      expect(mockItems).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = sortItemsByPrice([]);
      expect(sorted).toEqual([]);
    });

    it('should handle items with same price', () => {
      const samePrice = [
        { ...mockPsaCard, myPrice: 500 },
        { ...mockRawCard, myPrice: 500 },
      ];
      const sorted = sortItemsByPrice(samePrice);
      expect(sorted).toHaveLength(2);
      expect(sorted[0].myPrice).toBe(500);
      expect(sorted[1].myPrice).toBe(500);
    });

    it('should handle mixed price types (string and number)', () => {
      const mixedItems = [
        { ...mockPsaCard, myPrice: '300' },
        { ...mockRawCard, myPrice: 400 },
        { ...mockSealedProduct, myPrice: '100' },
      ];
      const sorted = sortItemsByPrice(mixedItems);
      expect(getSortablePrice(sorted[0])).toBe(400);
      expect(getSortablePrice(sorted[1])).toBe(300);
      expect(getSortablePrice(sorted[2])).toBe(100);
    });
  });

  describe('moveItemInArray', () => {
    const testArray = ['a', 'b', 'c', 'd', 'e'];

    it('should move item from start to middle', () => {
      const result = moveItemInArray(testArray, 0, 2);
      expect(result).toEqual(['b', 'c', 'a', 'd', 'e']);
    });

    it('should move item from middle to start', () => {
      const result = moveItemInArray(testArray, 2, 0);
      expect(result).toEqual(['c', 'a', 'b', 'd', 'e']);
    });

    it('should move item from middle to end', () => {
      const result = moveItemInArray(testArray, 2, 4);
      expect(result).toEqual(['a', 'b', 'd', 'e', 'c']);
    });

    it('should move item from end to middle', () => {
      const result = moveItemInArray(testArray, 4, 2);
      expect(result).toEqual(['a', 'b', 'e', 'c', 'd']);
    });

    it('should handle same source and destination index', () => {
      const result = moveItemInArray(testArray, 2, 2);
      expect(result).toEqual(testArray);
    });

    it('should not mutate original array', () => {
      const original = [...testArray];
      moveItemInArray(testArray, 0, 2);
      expect(testArray).toEqual(original);
    });

    it('should handle empty array', () => {
      const result = moveItemInArray([], 0, 0);
      expect(result).toEqual([]);
    });

    it('should handle out of bounds indices gracefully', () => {
      const result = moveItemInArray(testArray, -1, 10);
      expect(result).toEqual(testArray);
    });
  });

  describe('validateItemOrder', () => {
    const validItemIds = ['psa-1', 'raw-1', 'sealed-1'];

    it('should validate correct order', () => {
      const validation = validateItemOrder(validItemIds, mockItems);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect missing items in order', () => {
      const incompleteOrder = ['psa-1', 'raw-1']; // missing sealed-1
      const validation = validateItemOrder(incompleteOrder, mockItems);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing items in order: sealed-1');
    });

    it('should detect extra items in order', () => {
      const extraOrder = [...validItemIds, 'extra-item'];
      const validation = validateItemOrder(extraOrder, mockItems);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Extra items in order: extra-item');
    });

    it('should detect duplicate items in order', () => {
      const duplicateOrder = ['psa-1', 'psa-1', 'raw-1', 'sealed-1'];
      const validation = validateItemOrder(duplicateOrder, mockItems);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Duplicate items in order: psa-1');
    });

    it('should handle empty order array', () => {
      const validation = validateItemOrder([], mockItems);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Order array is empty');
    });

    it('should handle empty items array', () => {
      const validation = validateItemOrder(validItemIds, []);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Items array is empty');
    });

    it('should handle multiple validation errors', () => {
      const badOrder = ['psa-1', 'psa-1', 'nonexistent']; // duplicate + missing + extra
      const validation = validateItemOrder(badOrder, mockItems);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(1);
    });
  });

  describe('error scenarios', () => {
    it('should handle null/undefined items gracefully', () => {
      const itemsWithNull = [
        mockPsaCard,
        null,
        mockRawCard,
      ] as CollectionItem[];
      expect(() =>
        sortItemsByPrice(itemsWithNull.filter(Boolean))
      ).not.toThrow();
    });

    it('should handle items without required properties', () => {
      const incompleteItem = { id: 'incomplete' } as CollectionItem;
      expect(() => getItemCategory(incompleteItem)).not.toThrow();
      expect(() => getSortablePrice(incompleteItem)).not.toThrow();
    });

    it('should handle circular references in validation', () => {
      const circularOrder = ['item1', 'item2'];
      const circularItems = [
        { id: 'item1', myPrice: 100 },
        { id: 'item2', myPrice: 200 },
      ] as CollectionItem[];

      expect(() =>
        validateItemOrder(circularOrder, circularItems)
      ).not.toThrow();
    });
  });

  describe('performance with large datasets', () => {
    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        myPrice: Math.random() * 1000,
        grade: Math.floor(Math.random() * 10) + 1,
      })) as CollectionItem[];

      const startTime = performance.now();
      const sorted = sortItemsByPrice(largeArray);
      const endTime = performance.now();

      expect(sorted).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should validate large orders efficiently', () => {
      const largeItems = Array.from({ length: 500 }, (_, i) => ({
        id: `item-${i}`,
        myPrice: 100,
      })) as CollectionItem[];

      const largeOrder = largeItems.map((item) => item.id);

      const startTime = performance.now();
      const validation = validateItemOrder(largeOrder, largeItems);
      const endTime = performance.now();

      expect(validation.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });
  });
});
