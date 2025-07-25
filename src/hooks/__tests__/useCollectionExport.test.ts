/**
 * Unit Tests for useCollectionExport Hook with Ordering
 * 
 * Following CLAUDE.md testing principles:
 * - Tests the enhanced export hook with ordering capabilities
 * - Covers all ordering functions and state management
 * - Tests error handling and recovery scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollectionExport } from '../useCollectionExport';
import { CollectionItem, ItemCategory, SortMethod } from '../../domain/models/ordering';

// Mock the exportApiService
vi.mock('../../services/ExportApiService', () => ({
  exportApiService: {
    export: vi.fn(),
    exportOrdered: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock collection items
const mockItems: CollectionItem[] = [
  {
    id: 'psa-1',
    grade: 9,
    myPrice: 500,
    cardId: { cardName: 'Charizard' },
  },
  {
    id: 'psa-2',
    grade: 8,
    myPrice: 300,
    cardId: { cardName: 'Blastoise' },
  },
  {
    id: 'raw-1',
    condition: 'NM',
    myPrice: 200,
    cardId: { cardName: 'Venusaur' },
  },
  {
    id: 'sealed-1',
    name: 'Base Set Booster Box',
    myPrice: 800,
    category: 'booster-box',
  },
];

describe('useCollectionExport Hook with Ordering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hook initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      expect(result.current.selectedItemsForExport).toEqual([]);
      expect(result.current.itemOrder).toEqual([]);
      expect(result.current.orderingState.lastSortMethod).toBeNull();
      expect(result.current.isExporting).toBe(false);
    });

    it('should initialize ordering state correctly', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      expect(result.current.orderingState.globalOrder).toEqual([]);
      expect(result.current.orderingState.categoryOrders).toEqual({
        PSA_CARD: [],
        RAW_CARD: [],
        SEALED_PRODUCT: [],
      });
      expect(result.current.orderingState.lastSortMethod).toBeNull();
    });
  });

  describe('item selection', () => {
    it('should toggle item selection correctly', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      act(() => {
        result.current.toggleItemSelection('psa-1');
      });
      
      expect(result.current.selectedItemsForExport).toContain('psa-1');
      
      act(() => {
        result.current.toggleItemSelection('psa-1');
      });
      
      expect(result.current.selectedItemsForExport).not.toContain('psa-1');
    });

    it('should select all items', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      expect(result.current.selectedItemsForExport).toHaveLength(mockItems.length);
      expect(result.current.selectedItemsForExport).toEqual(mockItems.map(item => item.id));
    });

    it('should clear all selections', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // First select some items
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      expect(result.current.selectedItemsForExport).toHaveLength(mockItems.length);
      
      // Then clear all
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selectedItemsForExport).toEqual([]);
    });
  });

  describe('ordering functions', () => {
    it('should reorder items correctly', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // First select items
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      const newOrder = ['sealed-1', 'psa-1', 'raw-1'];
      
      act(() => {
        result.current.reorderItems(newOrder);
      });
      
      expect(result.current.itemOrder).toEqual(newOrder);
      expect(result.current.orderingState.lastSortMethod).toBe('manual');
    });

    it('should move item up in order', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Setup initial order
      const initialOrder = ['psa-1', 'raw-1', 'sealed-1'];
      act(() => {
        result.current.reorderItems(initialOrder);
      });
      
      // Move second item (raw-1) up
      act(() => {
        result.current.moveItemUp('raw-1');
      });
      
      expect(result.current.itemOrder).toEqual(['raw-1', 'psa-1', 'sealed-1']);
    });

    it('should move item down in order', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Setup initial order
      const initialOrder = ['psa-1', 'raw-1', 'sealed-1'];
      act(() => {
        result.current.reorderItems(initialOrder);
      });
      
      // Move first item down
      act(() => {
        result.current.moveItemDown('psa-1');
      });
      
      expect(result.current.itemOrder).toEqual(['raw-1', 'psa-1', 'sealed-1']);
    });

    it('should handle move up at first position', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      const initialOrder = ['psa-1', 'psa-2', 'raw-1'];
      act(() => {
        result.current.reorderItems(initialOrder);
      });
      
      // Try to move first item up (should not change)
      act(() => {
        result.current.moveItemUp('psa-1');
      });
      
      expect(result.current.itemOrder).toEqual(initialOrder);
    });

    it('should handle move down at last position', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      const initialOrder = ['psa-1', 'psa-2', 'raw-1'];
      act(() => {
        result.current.reorderItems(initialOrder);
      });
      
      // Try to move last item down (should not change)
      act(() => {
        result.current.moveItemDown('raw-1');
      });
      
      expect(result.current.itemOrder).toEqual(initialOrder);
    });
  });

  describe('price sorting', () => {
    it('should auto-sort by price descending', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select all items
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      act(() => {
        result.current.autoSortByPrice(mockItems, false); // descending
      });
      
      expect(result.current.orderingState.lastSortMethod).toBe('price_desc');
      expect(result.current.itemOrder[0]).toBe('sealed-1'); // 800
      expect(result.current.itemOrder[1]).toBe('psa-1'); // 500
      expect(result.current.itemOrder[2]).toBe('psa-2'); // 300
      expect(result.current.itemOrder[3]).toBe('raw-1'); // 200
    });

    it('should auto-sort by price ascending', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select all items
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      act(() => {
        result.current.autoSortByPrice(mockItems, true); // ascending
      });
      
      expect(result.current.orderingState.lastSortMethod).toBe('price_asc');
      expect(result.current.itemOrder[0]).toBe('raw-1'); // 200
      expect(result.current.itemOrder[1]).toBe('psa-2'); // 300
      expect(result.current.itemOrder[2]).toBe('psa-1'); // 500
      expect(result.current.itemOrder[3]).toBe('sealed-1'); // 800
    });

    it('should sort category by price', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select all items
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      act(() => {
        result.current.sortCategoryByPrice(mockItems, 'PSA_CARD', false); // descending
      });
      
      // Should have PSA cards sorted by price, others in original order
      const psaItems = result.current.itemOrder.filter(id => 
        mockItems.find(item => item.id === id)?.hasOwnProperty('grade')
      );
      
      expect(psaItems[0]).toBe('psa-1'); // 500
      expect(psaItems[1]).toBe('psa-2'); // 300
    });
  });

  describe('reset functionality', () => {
    it('should reset order to original state', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // First create some ordering
      act(() => {
        result.current.selectAllItems(mockItems);
        result.current.autoSortByPrice(mockItems, false);
      });
      
      expect(result.current.itemOrder).not.toEqual([]);
      expect(result.current.orderingState.lastSortMethod).toBe('price_desc');
      
      // Reset
      act(() => {
        result.current.resetOrder(mockItems);
      });
      
      expect(result.current.itemOrder).toEqual(mockItems.map(item => item.id));
      expect(result.current.orderingState.lastSortMethod).toBeNull();
    });
  });

  describe('getOrderedItems', () => {
    it('should return items in specified order', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select all and create custom order
      act(() => {
        result.current.selectAllItems(mockItems);
        result.current.reorderItems(['raw-1', 'sealed-1', 'psa-1', 'psa-2']);
      });
      
      const orderedItems = result.current.getOrderedItems(mockItems);
      
      expect(orderedItems).toHaveLength(4);
      expect(orderedItems[0].id).toBe('raw-1');
      expect(orderedItems[1].id).toBe('sealed-1');
      expect(orderedItems[2].id).toBe('psa-1');
      expect(orderedItems[3].id).toBe('psa-2');
    });

    it('should return all items in original order when no custom order', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select some items but don't create custom order
      act(() => {
        result.current.toggleItemSelection('psa-2');
        result.current.toggleItemSelection('raw-1');
      });
      
      const orderedItems = result.current.getOrderedItems(mockItems);
      
      expect(orderedItems).toHaveLength(mockItems.length);
      // Should maintain original order from mockItems
      expect(orderedItems[0].id).toBe(mockItems[0].id);
      expect(orderedItems[1].id).toBe(mockItems[1].id);
    });

    it('should handle missing items in order gracefully', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      act(() => {
        result.current.selectAllItems(mockItems);
        // Create order with non-existent item
        result.current.reorderItems(['psa-1', 'nonexistent', 'raw-1']);
      });
      
      const orderedItems = result.current.getOrderedItems(mockItems);
      
      // Should return all items, with ordered items first, then remaining items
      expect(orderedItems).toHaveLength(mockItems.length);
      expect(orderedItems[0].id).toBe('psa-1');
      expect(orderedItems[1].id).toBe('raw-1');
      // The remaining items should be added after the ordered ones
    });
  });

  describe('error handling', () => {
    it('should handle empty items array', () => {
      const { result } = renderHook(() => useCollectionExport([]));
      
      expect(result.current.selectedItemsForExport).toEqual([]);
      expect(result.current.itemOrder).toEqual([]);
      
      // Should not throw when calling functions
      expect(() => {
        act(() => {
          result.current.selectAllItems(mockItems);
          result.current.autoSortByPrice(mockItems, false);
          result.current.resetOrder(mockItems);
        });
      }).not.toThrow();
    });

    it('should handle invalid item IDs in ordering functions', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      expect(() => {
        act(() => {
          result.current.moveItemUp('nonexistent');
          result.current.moveItemDown('nonexistent');
          result.current.reorderItems(['nonexistent', 'invalid']);
        });
      }).not.toThrow();
    });

    it('should handle sorting with invalid price data', () => {
      const itemsWithInvalidPrices: CollectionItem[] = [
        { id: 'invalid-1', myPrice: null, grade: 9 },
        { id: 'invalid-2', myPrice: 'invalid', condition: 'NM' },
        { id: 'invalid-3', myPrice: undefined, name: 'Test' },
      ] as CollectionItem[];
      
      const { result } = renderHook(() => useCollectionExport());
      
      expect(() => {
        act(() => {
          result.current.selectAllItems(itemsWithInvalidPrices);
          result.current.autoSortByPrice(itemsWithInvalidPrices, false);
        });
      }).not.toThrow();
      
      expect(result.current.itemOrder).toHaveLength(3);
    });

    it('should handle category sorting with mixed item types', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      act(() => {
        result.current.selectAllItems(mockItems);
      });
      
      expect(() => {
        act(() => {
          result.current.sortCategoryByPrice(mockItems, 'PSA_CARD', false);
          result.current.sortCategoryByPrice(mockItems, 'RAW_CARD', true);
          result.current.sortCategoryByPrice(mockItems, 'SEALED_PRODUCT', false);
        });
      }).not.toThrow();
    });
  });

  describe('state consistency', () => {
    it('should maintain selection when reordering', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select specific items
      act(() => {
        result.current.toggleItemSelection('psa-1');
        result.current.toggleItemSelection('raw-1');
      });
      
      const originalSelection = [...result.current.selectedItemsForExport];
      
      // Reorder
      act(() => {
        result.current.reorderItems(['raw-1', 'psa-1']);
      });
      
      // Selection should remain the same
      expect(result.current.selectedItemsForExport).toEqual(originalSelection);
    });

    it('should maintain order when items are deselected', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select and order items
      act(() => {
        result.current.selectAllItems(mockItems);
        result.current.autoSortByPrice(mockItems, false);
      });
      
      const originalOrder = [...result.current.itemOrder];
      expect(originalOrder).not.toEqual([]);
      
      // Clear selection
      act(() => {
        result.current.clearSelection();
      });
      
      // Order should persist even when selection is cleared
      expect(result.current.itemOrder).toEqual(originalOrder);
      expect(result.current.orderingState.lastSortMethod).toBe('price_desc');
    });

    it('should maintain order when items are removed from selection', () => {
      const { result } = renderHook(() => useCollectionExport());
      
      // Select all and create order
      act(() => {
        result.current.selectAllItems(mockItems);
        result.current.reorderItems(['psa-1', 'psa-2', 'raw-1', 'sealed-1']);
      });
      
      const originalOrder = [...result.current.itemOrder];
      expect(originalOrder).toHaveLength(4);
      
      // Remove one item from selection
      act(() => {
        result.current.toggleItemSelection('psa-2');
      });
      
      // Order should remain the same - selection doesn't affect order
      expect(result.current.itemOrder).toEqual(originalOrder);
      expect(result.current.itemOrder).toHaveLength(4);
    });
  });

  describe('performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeItemSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        myPrice: Math.random() * 1000,
        grade: Math.floor(Math.random() * 10) + 1,
      })) as CollectionItem[];
      
      const { result } = renderHook(() => useCollectionExport());
      
      const start = performance.now();
      
      act(() => {
        result.current.selectAllItems(largeItemSet);
        result.current.autoSortByPrice(largeItemSet, false);
      });
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
      expect(result.current.selectedItemsForExport).toHaveLength(1000);
      expect(result.current.itemOrder).toHaveLength(1000);
    });
  });
});