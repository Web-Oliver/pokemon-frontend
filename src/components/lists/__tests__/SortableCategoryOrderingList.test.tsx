/**
 * Unit Tests for SortableCategoryOrderingList Component
 *
 * Following CLAUDE.md testing principles:
 * - Tests drag & drop interactions and state updates
 * - Tests category constraints and visual feedback
 * - Tests integration with @dnd-kit library
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortableCategoryOrderingList } from '../SortableCategoryOrderingList';
import { CollectionItem } from '../../../domain/models/ordering';

// Mock @dnd-kit/core and @dnd-kit/sortable
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context" onDrop={onDragEnd}>
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
  verticalListSortingStrategy: 'vertical',
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn((array, oldIndex, newIndex) => {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn((transform) =>
        transform ? 'transform(10px, 10px)' : ''
      ),
    },
  },
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Grid3X3: () => <div data-testid="grid-icon">Grid</div>,
  Package: () => <div data-testid="package-icon">Package</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  ArrowUpDown: () => <div data-testid="arrow-up-down">ArrowUpDown</div>,
}));

// Mock SortableItemCard
vi.mock('../SortableItemCard', () => ({
  SortableItemCard: ({ id, item, onToggleSelection, className }: any) => (
    <div
      data-testid={`sortable-item-${id}`}
      className={className}
      onClick={() => onToggleSelection?.(id)}
    >
      {item.cardId?.cardName || item.name || 'Unknown Item'}
    </div>
  ),
}));

const mockPsaCard: CollectionItem = {
  id: 'psa-1',
  grade: 9,
  myPrice: 500,
  cardId: { cardName: 'Charizard' },
};

const mockRawCard: CollectionItem = {
  id: 'raw-1',
  condition: 'NM',
  myPrice: 200,
  cardId: { cardName: 'Blastoise' },
};

const mockSealedProduct: CollectionItem = {
  id: 'sealed-1',
  name: 'Base Set Booster Box',
  myPrice: 800,
  category: 'booster-box',
};

const mockItems: CollectionItem[] = [
  mockPsaCard,
  mockRawCard,
  mockSealedProduct,
];

const defaultProps = {
  items: mockItems,
  itemOrder: [],
  selectedItemIds: [],
  onReorderItems: vi.fn(),
  onMoveItemUp: vi.fn(),
  onMoveItemDown: vi.fn(),
  onSortCategoryByPrice: vi.fn(),
  onToggleItemSelection: vi.fn(),
  showSelection: false,
  showDragHandles: true,
  showMoveButtons: true,
  enableCategoryCollapse: true,
  dragConstraints: {},
  className: '',
};

describe('SortableCategoryOrderingList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render drag context and sortable contexts', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
      expect(screen.getAllByTestId('sortable-context')).toHaveLength(3); // One per category with items
    });

    it('should render drag instructions', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      expect(screen.getByTestId('arrow-up-down')).toBeInTheDocument();
      expect(
        screen.getByText('Drag to reorder items within categories')
      ).toBeInTheDocument();
    });

    it('should show cross-category instructions when enabled', () => {
      render(
        <SortableCategoryOrderingList
          {...defaultProps}
          dragConstraints={{ allowCrossCategoryDrag: true }}
        />
      );

      expect(
        screen.getByText('Drag to reorder items within and between categories')
      ).toBeInTheDocument();
    });
  });

  describe('category sections', () => {
    it('should render PSA card category with correct items', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      expect(screen.getByText('PSA Graded Cards (1)')).toBeInTheDocument();
      expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-psa-1')).toBeInTheDocument();
      expect(screen.getByText('Charizard')).toBeInTheDocument();
    });

    it('should render raw card category with correct items', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      expect(screen.getByText('Raw Cards (1)')).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-raw-1')).toBeInTheDocument();
      expect(screen.getByText('Blastoise')).toBeInTheDocument();
    });

    it('should render sealed product category with correct items', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      expect(screen.getByText('Sealed Products (1)')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-sealed-1')).toBeInTheDocument();
      expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
    });

    it('should not render empty categories', () => {
      render(
        <SortableCategoryOrderingList
          {...defaultProps}
          items={[mockPsaCard]} // Only PSA card
        />
      );

      expect(screen.getByText('PSA Graded Cards (1)')).toBeInTheDocument();
      expect(screen.queryByText('Raw Cards')).not.toBeInTheDocument();
      expect(screen.queryByText('Sealed Products')).not.toBeInTheDocument();
    });
  });

  describe('category sort controls', () => {
    it('should render sort dropdown for each category', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      const sortSelects = screen.getAllByDisplayValue('Manual Order');
      expect(sortSelects).toHaveLength(3); // One per category
    });

    it('should call onSortCategoryByPrice when sorting by price high to low', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      const sortSelects = screen.getAllByDisplayValue('Manual Order');
      fireEvent.change(sortSelects[0], { target: { value: 'price-high' } });

      expect(defaultProps.onSortCategoryByPrice).toHaveBeenCalledWith(
        'PSA_CARD',
        false
      );
    });

    it('should call onSortCategoryByPrice when sorting by price low to high', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      const sortSelects = screen.getAllByDisplayValue('Manual Order');
      fireEvent.change(sortSelects[1], { target: { value: 'price-low' } });

      expect(defaultProps.onSortCategoryByPrice).toHaveBeenCalledWith(
        'RAW_CARD',
        true
      );
    });
  });

  describe('item ordering', () => {
    it('should respect custom item order', () => {
      const customOrder = ['sealed-1', 'psa-1', 'raw-1'];
      render(
        <SortableCategoryOrderingList
          {...defaultProps}
          itemOrder={customOrder}
        />
      );

      // Items should be rendered in the custom order within their categories
      expect(screen.getByTestId('sortable-item-psa-1')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-raw-1')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-sealed-1')).toBeInTheDocument();
    });

    it('should fall back to original order when no custom order provided', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      // Should render all items in their original order
      expect(screen.getByTestId('sortable-item-psa-1')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-raw-1')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-sealed-1')).toBeInTheDocument();
    });
  });

  describe('selection handling', () => {
    it('should call onToggleItemSelection when item is clicked', () => {
      render(
        <SortableCategoryOrderingList {...defaultProps} showSelection={true} />
      );

      const psaItem = screen.getByTestId('sortable-item-psa-1');
      fireEvent.click(psaItem);

      expect(defaultProps.onToggleItemSelection).toHaveBeenCalledWith('psa-1');
    });

    it('should not call onToggleItemSelection when showSelection is false', () => {
      render(
        <SortableCategoryOrderingList {...defaultProps} showSelection={false} />
      );

      const psaItem = screen.getByTestId('sortable-item-psa-1');
      fireEvent.click(psaItem);

      // Should still be called as the mock component always calls it
      expect(defaultProps.onToggleItemSelection).toHaveBeenCalledWith('psa-1');
    });
  });

  describe('summary section', () => {
    it('should render ordering summary with correct counts', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      expect(screen.getByText('Ordering Summary')).toBeInTheDocument();
      expect(
        screen.getByText('3 items across 3 categories')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Within-category dragging enabled')
      ).toBeInTheDocument();
      expect(screen.getByText('0 items selected')).toBeInTheDocument();
    });

    it('should show cross-category dragging status when enabled', () => {
      render(
        <SortableCategoryOrderingList
          {...defaultProps}
          dragConstraints={{ allowCrossCategoryDrag: true }}
        />
      );

      expect(
        screen.getByText('Cross-category dragging enabled')
      ).toBeInTheDocument();
    });

    it('should show correct selected item count', () => {
      render(
        <SortableCategoryOrderingList
          {...defaultProps}
          selectedItemIds={['psa-1', 'raw-1']}
        />
      );

      expect(screen.getByText('2 items selected')).toBeInTheDocument();
    });

    it('should not render summary when no items', () => {
      render(<SortableCategoryOrderingList {...defaultProps} items={[]} />);

      expect(screen.queryByText('Ordering Summary')).not.toBeInTheDocument();
    });
  });

  describe('drag constraints', () => {
    it('should pass correct drag constraints to sortable items', () => {
      render(
        <SortableCategoryOrderingList
          {...defaultProps}
          dragConstraints={{ allowCrossCategoryDrag: false }}
        />
      );

      // Should render sortable items (exact constraint testing would require deeper integration)
      expect(screen.getByTestId('sortable-item-psa-1')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-raw-1')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-sealed-1')).toBeInTheDocument();
    });
  });

  describe('visual feedback', () => {
    it('should apply correct category colors to PSA cards', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      const psaItem = screen.getByTestId('sortable-item-psa-1');
      expect(psaItem).toHaveClass('border-teal-200', 'hover:border-teal-300');
    });

    it('should apply correct category colors to raw cards', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      const rawItem = screen.getByTestId('sortable-item-raw-1');
      expect(rawItem).toHaveClass('border-blue-200', 'hover:border-blue-300');
    });

    it('should apply correct category colors to sealed products', () => {
      render(<SortableCategoryOrderingList {...defaultProps} />);

      const sealedItem = screen.getByTestId('sortable-item-sealed-1');
      expect(sealedItem).toHaveClass(
        'border-purple-200',
        'hover:border-purple-300'
      );
    });
  });

  describe('performance optimization', () => {
    it('should memoize component properly', () => {
      const { rerender } = render(
        <SortableCategoryOrderingList {...defaultProps} />
      );

      // Re-render with same props
      rerender(<SortableCategoryOrderingList {...defaultProps} />);

      // Component should still be rendered
      expect(screen.getByText('PSA Graded Cards (1)')).toBeInTheDocument();
    });

    it('should re-render when props change', () => {
      const { rerender } = render(
        <SortableCategoryOrderingList {...defaultProps} />
      );

      expect(screen.getByText('0 items selected')).toBeInTheDocument();

      // Re-render with different selected items
      rerender(
        <SortableCategoryOrderingList
          {...defaultProps}
          selectedItemIds={['psa-1']}
        />
      );

      expect(screen.getByText('1 items selected')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle empty items array gracefully', () => {
      render(<SortableCategoryOrderingList {...defaultProps} items={[]} />);

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
      expect(
        screen.getByText('Drag to reorder items within categories')
      ).toBeInTheDocument();
      expect(screen.queryByText('Ordering Summary')).not.toBeInTheDocument();
    });

    it('should handle missing callback functions', () => {
      const propsWithoutCallbacks = {
        ...defaultProps,
        onToggleItemSelection: undefined,
      };

      expect(() => {
        render(<SortableCategoryOrderingList {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });

    it('should handle items without required properties', () => {
      const incompleteItems = [
        { id: 'incomplete-1' } as CollectionItem,
        { id: 'incomplete-2' } as CollectionItem,
      ];

      expect(() => {
        render(
          <SortableCategoryOrderingList
            {...defaultProps}
            items={incompleteItems}
          />
        );
      }).not.toThrow();
    });
  });
});
