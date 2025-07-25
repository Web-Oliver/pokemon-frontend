/**
 * Integration Tests for Item Ordering Workflow
 * 
 * Following CLAUDE.md testing principles:
 * - Tests complete end-to-end ordering workflows
 * - Tests integration between components, hooks, and services
 * - Tests drag & drop interactions with @dnd-kit
 * - Tests large dataset performance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ItemOrderingSection } from '../components/lists/ItemOrderingSection';
import { CollectionExportModal } from '../components/lists/CollectionExportModal';
import { useCollectionExport } from '../hooks/useCollectionExport';
import { CollectionItem } from '../domain/models/ordering';
import { ExportApiService } from '../services/ExportApiService';
import { DragDropProvider } from '../contexts/DragDropContext';
import { orderingPersistence, storageHelpers } from '../utils/storageUtils';

// Mock external dependencies
vi.mock('../services/ExportApiService');
vi.mock('../utils/storageUtils', () => ({
  orderingPersistence: {
    saveOrderingState: vi.fn(() => true),
    loadOrderingState: vi.fn(() => ({
      globalOrder: [],
      categoryOrders: {
        PSA_CARD: [],
        RAW_CARD: [],
        SEALED_PRODUCT: [],
      },
      lastSortMethod: null,
      lastSortTimestamp: new Date(),
    })),
    cleanupExpiredSessions: vi.fn(),
    migrateFromOldFormat: vi.fn(),
    getSessionData: vi.fn(() => null),
    isSessionExpired: vi.fn(() => false),
    saveSessionData: vi.fn(() => true),
    startAutoSave: vi.fn(),
    stopAutoSave: vi.fn(),
    loadExportPreferences: vi.fn(() => ({
      defaultSortMethod: null,
      rememberOrderPerCategory: false,
      autoSaveInterval: 5000,
      clearOnExport: false,
      maxStoredSessions: 10,
    })),
    clearAfterExport: vi.fn(),
  },
  storageHelpers: {
    migrateOldFormat: vi.fn(),
    loadOrdering: vi.fn(() => null),
    saveOrdering: vi.fn(() => true),
  },
}));

// Mock @dnd-kit components for integration testing
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context" onDrop={(e) => onDragEnd?.({ active: { id: 'test' }, over: { id: 'test' } })}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  MeasuringStrategy: {
    WhileDragging: 'while-dragging',
  },
  defaultDropAnimationSideEffects: vi.fn(() => ({})),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  verticalListSortingStrategy: 'vertical',
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn((array, oldIndex, newIndex) => {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
}));

// Test wrapper component that provides necessary context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DragDropProvider>
    {children}
  </DragDropProvider>
);

// Mock data for integration tests
const mockItems: CollectionItem[] = [
  {
    id: 'psa-1',
    grade: 10,
    myPrice: 500,
    cardId: { cardName: 'Charizard Base Set' },
  },
  {
    id: 'psa-2',
    grade: 9,
    myPrice: 350,
    cardId: { cardName: 'Blastoise Base Set' },
  },
  {
    id: 'raw-1',
    condition: 'NM',
    myPrice: 200,
    cardId: { cardName: 'Venusaur Base Set' },
  },
  {
    id: 'sealed-1',
    name: 'Base Set Booster Box',
    myPrice: 800,
    category: 'booster-box',
  },
];

// Large dataset for performance testing
const createLargeItemSet = (size: number): CollectionItem[] => {
  return Array.from({ length: size }, (_, i) => ({
    id: `item-${i}`,
    myPrice: Math.random() * 1000,
    grade: Math.floor(Math.random() * 10) + 1,
    cardId: { cardName: `Card ${i}` },
  }));
};

describe('Ordering Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock performance.now for timing tests
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Full Export Workflow Integration', () => {
    it('should complete full workflow: select → reorder → export → verify order', async () => {
      const mockExport = vi.mocked(ExportApiService.prototype.export);
      mockExport.mockResolvedValue({
        blob: new Blob(['test content']),
        filename: 'test-export.txt',
        itemCount: 3,
      });

      // Create test component that uses the hook
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => hook.selectAllItems(mockItems)}
                data-testid="select-all"
              >
                Select All
              </button>
              
              <button 
                onClick={() => hook.reorderItems(['sealed-1', 'psa-1', 'raw-1', 'psa-2'])}
                data-testid="reorder"
              >
                Reorder
              </button>
              
              <button 
                onClick={() => hook.exportOrderedItems({
                  itemType: 'psa-card',
                  format: 'facebook-text',
                  itemIds: hook.selectedItemsForExport,
                  itemOrder: hook.itemOrder,
                }, mockItems)}
                data-testid="export"
              >
                Export
              </button>
              
              <div data-testid="order">{JSON.stringify(hook.itemOrder)}</div>
              <div data-testid="selected">{JSON.stringify(hook.selectedItemsForExport)}</div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Step 1: Select items
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-all'));
      });

      expect(screen.getByTestId('selected')).toHaveTextContent(
        JSON.stringify(mockItems.map(item => item.id))
      );

      // Step 2: Reorder items
      await act(async () => {
        fireEvent.click(screen.getByTestId('reorder'));
      });

      expect(screen.getByTestId('order')).toHaveTextContent(
        JSON.stringify(['sealed-1', 'psa-1', 'raw-1', 'psa-2'])
      );

      // Step 3: Export with order
      await act(async () => {
        fireEvent.click(screen.getByTestId('export'));
      });

      // Verify export was called with correct parameters
      expect(mockExport).toHaveBeenCalledWith(
        expect.objectContaining({
          itemType: 'psa-card',
          format: 'facebook-text',
          itemIds: expect.arrayContaining(['psa-1', 'psa-2', 'raw-1', 'sealed-1']),
          itemOrder: ['sealed-1', 'psa-1', 'raw-1', 'psa-2'],
        })
      );
    });

    it('should handle auto-sort workflow: select → auto-sort → export → verify price order', async () => {
            const mockExport = vi.mocked(ExportApiService.prototype.export);
      mockExport.mockResolvedValue({
        blob: new Blob(['test content']),
        filename: 'test-export.txt',
        itemCount: 4,
      });

      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => hook.selectAllItems(mockItems)}
                data-testid="select-all"
              >
                Select All
              </button>
              
              <button 
                onClick={() => hook.autoSortByPrice(mockItems, false)}
                data-testid="sort-desc"
              >
                Sort by Price (High to Low)
              </button>
              
              <button 
                onClick={() => hook.exportOrderedItems({
                  itemType: 'psa-card',
                  format: 'facebook-text',
                  itemIds: hook.selectedItemsForExport,
                  itemOrder: hook.itemOrder,
                }, mockItems)}
                data-testid="export"
              >
                Export
              </button>
              
              <div data-testid="order">{JSON.stringify(hook.itemOrder)}</div>
              <div data-testid="sort-method">{hook.orderingState.lastSortMethod}</div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Step 1: Select all items
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-all'));
      });

      // Step 2: Auto-sort by price (descending)
      await act(async () => {
        fireEvent.click(screen.getByTestId('sort-desc'));
      });

      // Verify items are sorted by price (highest first)
      // Expected order: sealed-1 ($800), psa-1 ($500), psa-2 ($350), raw-1 ($200)
      expect(screen.getByTestId('order')).toHaveTextContent(
        JSON.stringify(['sealed-1', 'psa-1', 'psa-2', 'raw-1'])
      );
      expect(screen.getByTestId('sort-method')).toHaveTextContent('price_desc');

      // Step 3: Export with sorted order
      await act(async () => {
        fireEvent.click(screen.getByTestId('export'));
      });

      expect(mockExport).toHaveBeenCalledWith(
        expect.objectContaining({
          itemOrder: ['sealed-1', 'psa-1', 'psa-2', 'raw-1'],
        })
      );
    });
  });

  describe('Drag & Drop Integration', () => {
    it('should handle drag and drop reordering with visual feedback', async () => {
      
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <ItemOrderingSection
              items={mockItems}
              itemOrder={hook.itemOrder}
              selectedItemIds={hook.selectedItemsForExport}
              lastSortMethod={hook.orderingState.lastSortMethod}
              onReorderItems={hook.reorderItems}
              onMoveItemUp={hook.moveItemUp}
              onMoveItemDown={hook.moveItemDown}
              onAutoSortByPrice={() => hook.autoSortByPrice(mockItems)}
              onSortCategoryByPrice={(category, ascending) => 
                hook.sortCategoryByPrice(mockItems, category, ascending)
              }
              onResetOrder={() => hook.resetOrder(mockItems)}
              onToggleItemSelection={hook.toggleItemSelection}
              showSelection={true}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Verify drag & drop context is rendered (allow multiple contexts for different categories)
      expect(screen.getAllByTestId('dnd-context').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('sortable-context').length).toBeGreaterThan(0);

      // Verify drag instructions are shown
      expect(screen.getByText(/drag to reorder items/i)).toBeInTheDocument();

      // Test drag simulation (mocked) - get the first context
      const dragContext = screen.getAllByTestId('dnd-context')[0];
      
      await act(async () => {
        fireEvent.drop(dragContext);
      });

      // Verify no errors occurred during drag operation
      expect(dragContext).toBeInTheDocument();
    });

    it('should enforce category constraints during drag operations', async () => {
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        // Set up initial order and selection
        React.useEffect(() => {
          hook.selectAllItems(mockItems);
          hook.reorderItems(['psa-1', 'psa-2', 'raw-1', 'sealed-1']);
        }, []);
        
        return (
          <TestWrapper>
            <ItemOrderingSection
              items={mockItems}
              itemOrder={hook.itemOrder}
              selectedItemIds={hook.selectedItemsForExport}
              lastSortMethod={hook.orderingState.lastSortMethod}
              onReorderItems={hook.reorderItems}
              onMoveItemUp={hook.moveItemUp}
              onMoveItemDown={hook.moveItemDown}
              onAutoSortByPrice={() => hook.autoSortByPrice(mockItems)}
              onSortCategoryByPrice={(category, ascending) => 
                hook.sortCategoryByPrice(mockItems, category, ascending)
              }
              onResetOrder={() => hook.resetOrder(mockItems)}
              onToggleItemSelection={hook.toggleItemSelection}
              showSelection={true}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Verify drag constraints are mentioned in UI
      expect(screen.getByText(/within categories/i)).toBeInTheDocument();
    });
  });

  describe('Mixed Operations Integration', () => {
    it('should handle combined manual reordering and auto-sorting', async () => {
      
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => hook.selectAllItems(mockItems)}
                data-testid="select-all"
              >
                Select All
              </button>
              
              <button 
                onClick={() => hook.reorderItems(['raw-1', 'psa-1', 'sealed-1', 'psa-2'])}
                data-testid="manual-reorder"
              >
                Manual Reorder
              </button>
              
              <button 
                onClick={() => hook.autoSortByPrice(mockItems, true)}
                data-testid="auto-sort"
              >
                Auto Sort (Ascending)
              </button>
              
              <button 
                onClick={() => hook.sortCategoryByPrice(mockItems, 'PSA_CARD', false)}
                data-testid="category-sort"
              >
                Sort PSA Cards
              </button>
              
              <button 
                onClick={() => hook.resetOrder(mockItems)}
                data-testid="reset"
              >
                Reset Order
              </button>
              
              <div data-testid="order">{JSON.stringify(hook.itemOrder)}</div>
              <div data-testid="sort-method">{hook.orderingState.lastSortMethod}</div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Step 1: Select all items
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-all'));
      });

      // Step 2: Manual reorder
      await act(async () => {
        fireEvent.click(screen.getByTestId('manual-reorder'));
      });

      expect(screen.getByTestId('sort-method')).toHaveTextContent('manual');

      // Step 3: Apply auto-sort (should override manual order)
      await act(async () => {
        fireEvent.click(screen.getByTestId('auto-sort'));
      });

      expect(screen.getByTestId('sort-method')).toHaveTextContent('price_asc');
      // Expected ascending order: raw-1 ($200), psa-2 ($350), psa-1 ($500), sealed-1 ($800)
      expect(screen.getByTestId('order')).toHaveTextContent(
        JSON.stringify(['raw-1', 'psa-2', 'psa-1', 'sealed-1'])
      );

      // Step 4: Category sort (should change specific category)
      await act(async () => {
        fireEvent.click(screen.getByTestId('category-sort'));
      });

      expect(screen.getByTestId('sort-method')).toHaveTextContent('price_desc');

      // Step 5: Reset to original order
      await act(async () => {
        fireEvent.click(screen.getByTestId('reset'));
      });

      expect(screen.getByTestId('sort-method')).toHaveTextContent('');
      // Should return to original item order
      expect(screen.getByTestId('order')).toHaveTextContent(
        JSON.stringify(mockItems.map(item => item.id))
      );
    });
  });

  describe('Large Dataset Performance Integration', () => {
    it('should handle large item collections efficiently', async () => {
      const largeItemSet = createLargeItemSet(1000);
      
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => {
                  const startTime = performance.now();
                  hook.selectAllItems(largeItemSet);
                  hook.autoSortByPrice(largeItemSet, false);
                  const endTime = performance.now();
                  console.log(`Large dataset sort time: ${endTime - startTime}ms`);
                }}
                data-testid="large-operation"
              >
                Process Large Dataset
              </button>
              
              <div data-testid="selected-count">
                {hook.selectedItemsForExport.length}
              </div>
              <div data-testid="order-count">
                {hook.itemOrder.length}
              </div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      const startTime = performance.now();

      await act(async () => {
        fireEvent.click(screen.getByTestId('large-operation'));
      });

      const endTime = performance.now();
      const operationTime = endTime - startTime;

      // Performance assertions
      expect(operationTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1000');
      expect(screen.getByTestId('order-count')).toHaveTextContent('1000');
    });

    it('should handle virtualization with large datasets', async () => {
      const largeItemSet = createLargeItemSet(500);

      const TestComponent = () => {
        const hook = useCollectionExport();
        
        // Auto-select and order large dataset
        React.useEffect(() => {
          hook.selectAllItems(largeItemSet);
          hook.autoSortByPrice(largeItemSet, false);
        }, []);
        
        return (
          <TestWrapper>
            <ItemOrderingSection
              items={largeItemSet}
              itemOrder={hook.itemOrder}
              selectedItemIds={hook.selectedItemsForExport}
              lastSortMethod={hook.orderingState.lastSortMethod}
              onReorderItems={hook.reorderItems}
              onMoveItemUp={hook.moveItemUp}
              onMoveItemDown={hook.moveItemDown}
              onAutoSortByPrice={() => hook.autoSortByPrice(largeItemSet)}
              onSortCategoryByPrice={(category, ascending) => 
                hook.sortCategoryByPrice(largeItemSet, category, ascending)
              }
              onResetOrder={() => hook.resetOrder(largeItemSet)}
              onToggleItemSelection={hook.toggleItemSelection}
              showSelection={true}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Verify component renders without performance issues
      expect(screen.getByText('Item Ordering')).toBeInTheDocument();
      expect(screen.getByText(/500 total items/)).toBeInTheDocument();
    });
  });

  describe('State Persistence Integration', () => {
    it('should integrate with localStorage persistence', async () => {
      const mockLoadOrdering = vi.mocked(storageHelpers.loadOrdering);
      
      mockLoadOrdering.mockReturnValue({
        globalOrder: ['psa-1', 'raw-1'],
        categoryOrders: {
          PSA_CARD: ['psa-1'],
          RAW_CARD: ['raw-1'],
          SEALED_PRODUCT: [],
        },
        lastSortMethod: 'manual',
        lastSortTimestamp: new Date(),
      });

      
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => hook.reorderItems(['sealed-1', 'psa-1', 'raw-1', 'psa-2'])}
                data-testid="reorder"
              >
                Reorder
              </button>
              
              <div data-testid="order">{JSON.stringify(hook.itemOrder)}</div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Verify persistence loading was called on mount
      expect(mockLoadOrdering).toHaveBeenCalled();

      // Trigger a reorder operation
      await act(async () => {
        fireEvent.click(screen.getByTestId('reorder'));
      });

      // Verify persistence saving was called (via storageHelpers.saveOrdering)
      expect(storageHelpers.saveOrdering).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle and recover from export errors gracefully', async () => {
      const mockExport = vi.mocked(ExportApiService.prototype.export);
      mockExport.mockRejectedValue(new Error('Export failed'));

      
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => hook.selectAllItems(mockItems)}
                data-testid="select-all"
              >
                Select All
              </button>
              
              <button 
                onClick={() => hook.exportOrderedItems({
                  itemType: 'psa-card',
                  format: 'facebook-text',
                  itemIds: hook.selectedItemsForExport,
                }, mockItems)}
                data-testid="export"
              >
                Export
              </button>
              
              <div data-testid="exporting">
                {hook.isExporting ? 'Exporting...' : 'Ready'}
              </div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Select items
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-all'));
      });

      // Attempt export (should fail)
      await act(async () => {
        fireEvent.click(screen.getByTestId('export'));
      });

      // Verify export was attempted
      expect(mockExport).toHaveBeenCalled();

      // Verify hook recovered from error (not stuck in loading state)
      await waitFor(() => {
        expect(screen.getByTestId('exporting')).toHaveTextContent('Ready');
      });
    });

    it('should handle invalid ordering data gracefully', async () => {
      
      const TestComponent = () => {
        const hook = useCollectionExport();
        
        return (
          <TestWrapper>
            <div>
              <button 
                onClick={() => {
                  // Try to reorder with invalid data
                  hook.reorderItems(['nonexistent-1', 'invalid-2']);
                }}
                data-testid="invalid-reorder"
              >
                Invalid Reorder
              </button>
              
              <button 
                onClick={() => hook.getOrderedItems(mockItems)}
                data-testid="get-ordered"
              >
                Get Ordered Items
              </button>
              
              <div data-testid="order">{JSON.stringify(hook.itemOrder)}</div>
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      // Attempt invalid reorder
      await act(async () => {
        fireEvent.click(screen.getByTestId('invalid-reorder'));
      });

      // Verify system doesn't crash
      expect(screen.getByTestId('get-ordered')).toBeInTheDocument();

      // Verify ordering still works with valid data
      await act(async () => {
        fireEvent.click(screen.getByTestId('get-ordered'));
      });

      // Should not throw errors
      expect(screen.getByTestId('order')).toBeInTheDocument();
    });
  });
});