/**
 * Unit Tests for OrderableItemCard Component
 *
 * Following CLAUDE.md testing principles:
 * - Tests component interactions and state updates
 * - Tests visual feedback and accessibility
 * - Tests drag & drop preparation and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderableItemCard } from '../OrderableItemCard';
import { CollectionItem } from '../../../domain/models/ordering';

// Mock Lucide React icons - Extended for ImageProductView component dependencies
vi.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-icon">Grip</div>,
  ChevronUp: () => <div data-testid="chevron-up">Up</div>,
  ChevronDown: () => <div data-testid="chevron-down">Down</div>,
  // Icons needed by ImageProductView component
  Package: () => <div data-testid="package-icon">Package</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Archive: () => <div data-testid="archive-icon">Archive</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  // Icons needed by ImageSlideshow component
  ChevronLeft: () => <div data-testid="chevron-left">Left</div>,
  ChevronRight: () => <div data-testid="chevron-right">Right</div>,
}));

const mockPsaCard: CollectionItem = {
  id: 'psa-1',
  grade: 9,
  myPrice: 500,
  cardId: { cardName: 'Charizard Base Set' },
};

const mockRawCard: CollectionItem = {
  id: 'raw-1',
  condition: 'NM',
  myPrice: 200,
  cardId: { cardName: 'Blastoise Base Set' },
};

const mockSealedProduct: CollectionItem = {
  id: 'sealed-1',
  name: 'Base Set Booster Box',
  myPrice: 800,
  category: 'booster-box',
};

const defaultProps = {
  item: mockPsaCard,
  index: 0,
  totalItems: 3,
  isSelected: false,
  isDragging: false,
  onToggleSelection: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  showSelection: true,
  showMoveButtons: true,
  showDragHandle: true,
  className: '',
};

describe('OrderableItemCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render PSA card correctly', () => {
      render(<OrderableItemCard {...defaultProps} />);

      expect(screen.getByText('Charizard Base Set')).toBeInTheDocument();
      expect(screen.getByText('Grade 9')).toBeInTheDocument();
      expect(screen.getByText('500 kr.')).toBeInTheDocument();
    });

    it('should render raw card correctly', () => {
      render(<OrderableItemCard {...defaultProps} item={mockRawCard} />);

      expect(screen.getByText('Blastoise Base Set')).toBeInTheDocument();
      expect(screen.getByText('NM')).toBeInTheDocument();
      expect(screen.getByText('200 kr.')).toBeInTheDocument();
    });

    it('should render sealed product correctly', () => {
      render(<OrderableItemCard {...defaultProps} item={mockSealedProduct} />);

      expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
      expect(screen.getByText('booster-box')).toBeInTheDocument();
      expect(screen.getByText('800 kr.')).toBeInTheDocument();
    });

    it('should show order badge correctly', () => {
      render(<OrderableItemCard {...defaultProps} index={2} />);

      expect(screen.getByText('#3')).toBeInTheDocument(); // index + 1
    });
  });

  describe('selection functionality', () => {
    it('should render selection checkbox when showSelection is true', () => {
      render(<OrderableItemCard {...defaultProps} showSelection={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should show checked state when item is selected', () => {
      render(
        <OrderableItemCard
          {...defaultProps}
          isSelected={true}
          showSelection={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should call onToggleSelection when checkbox is clicked', () => {
      render(<OrderableItemCard {...defaultProps} showSelection={true} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(defaultProps.onToggleSelection).toHaveBeenCalledWith('psa-1');
    });

    it('should not render checkbox when showSelection is false', () => {
      render(<OrderableItemCard {...defaultProps} showSelection={false} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should apply selected styling when item is selected', () => {
      const { container } = render(
        <OrderableItemCard {...defaultProps} isSelected={true} />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass(
        'ring-2',
        'ring-blue-500',
        'bg-blue-900/20'
      );
    });
  });

  describe('move buttons functionality', () => {
    it('should render move buttons when showMoveButtons is true', () => {
      render(<OrderableItemCard {...defaultProps} showMoveButtons={true} />);

      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('should call onMoveUp when up button is clicked', () => {
      render(<OrderableItemCard {...defaultProps} showMoveButtons={true} />);

      const upButton = screen.getByTestId('chevron-up').closest('button');
      fireEvent.click(upButton!);

      expect(defaultProps.onMoveUp).toHaveBeenCalledWith('psa-1');
    });

    it('should call onMoveDown when down button is clicked', () => {
      render(<OrderableItemCard {...defaultProps} showMoveButtons={true} />);

      const downButton = screen.getByTestId('chevron-down').closest('button');
      fireEvent.click(downButton!);

      expect(defaultProps.onMoveDown).toHaveBeenCalledWith('psa-1');
    });

    it('should disable up button when item is first', () => {
      render(
        <OrderableItemCard {...defaultProps} index={0} showMoveButtons={true} />
      );

      const upButton = screen.getByTestId('chevron-up').closest('button');
      expect(upButton).toBeDisabled();
    });

    it('should disable down button when item is last', () => {
      render(
        <OrderableItemCard
          {...defaultProps}
          index={2}
          totalItems={3}
          showMoveButtons={true}
        />
      );

      const downButton = screen.getByTestId('chevron-down').closest('button');
      expect(downButton).toBeDisabled();
    });

    it('should not render move buttons when showMoveButtons is false', () => {
      render(<OrderableItemCard {...defaultProps} showMoveButtons={false} />);

      expect(screen.queryByTestId('chevron-up')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument();
    });
  });

  describe('drag handle functionality', () => {
    it('should render drag handle when showDragHandle is true', () => {
      render(<OrderableItemCard {...defaultProps} showDragHandle={true} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    });

    it('should not render drag handle when showDragHandle is false', () => {
      render(<OrderableItemCard {...defaultProps} showDragHandle={false} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });

    it('should have proper cursor style on drag handle', () => {
      render(<OrderableItemCard {...defaultProps} showDragHandle={true} />);

      const dragHandle = screen.getByTestId('grip-icon').closest('div');
      expect(dragHandle).toHaveClass('cursor-grab');
    });
  });

  describe('dragging state', () => {
    it('should apply dragging styles when isDragging is true', () => {
      const { container } = render(
        <OrderableItemCard {...defaultProps} isDragging={true} />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('opacity-50', 'scale-95', 'shadow-lg');
    });

    it('should not apply dragging styles when isDragging is false', () => {
      const { container } = render(
        <OrderableItemCard {...defaultProps} isDragging={false} />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).not.toHaveClass('opacity-50', 'scale-95');
    });
  });

  describe('item display information', () => {
    it('should handle item with missing card name', () => {
      const itemWithoutName = {
        ...mockPsaCard,
        cardId: undefined,
      };

      render(<OrderableItemCard {...defaultProps} item={itemWithoutName} />);

      expect(screen.getByText('Unknown Item')).toBeInTheDocument();
    });

    it('should handle item with zero price', () => {
      const itemWithZeroPrice = {
        ...mockPsaCard,
        myPrice: 0,
      };

      render(<OrderableItemCard {...defaultProps} item={itemWithZeroPrice} />);

      expect(screen.getByText('0 kr.')).toBeInTheDocument();
    });

    it('should handle item with string price', () => {
      const itemWithStringPrice = {
        ...mockPsaCard,
        myPrice: '750.50',
      };

      render(
        <OrderableItemCard {...defaultProps} item={itemWithStringPrice} />
      );

      expect(screen.getByText('750.5 kr.')).toBeInTheDocument();
    });

    it('should format large prices correctly', () => {
      const itemWithLargePrice = {
        ...mockPsaCard,
        myPrice: 12345,
      };

      render(<OrderableItemCard {...defaultProps} item={itemWithLargePrice} />);

      expect(screen.getByText('12,345 kr.')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for move buttons', () => {
      render(<OrderableItemCard {...defaultProps} showMoveButtons={true} />);

      const upButton = screen.getByTestId('chevron-up').closest('button');
      const downButton = screen.getByTestId('chevron-down').closest('button');

      expect(upButton).toHaveAttribute('title', 'Move item up');
      expect(downButton).toHaveAttribute('title', 'Move item down');
    });

    it('should have proper ARIA label for drag handle', () => {
      render(<OrderableItemCard {...defaultProps} showDragHandle={true} />);

      const dragHandle = screen.getByTestId('grip-icon').closest('div');
      expect(dragHandle).toHaveAttribute('title', 'Drag to reorder');
    });

    it('should have proper checkbox labeling', () => {
      render(<OrderableItemCard {...defaultProps} showSelection={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName('Select Charizard Base Set');
    });

    it('should support keyboard navigation for buttons', () => {
      render(<OrderableItemCard {...defaultProps} showMoveButtons={true} />);

      const upButton = screen.getByTestId('chevron-up').closest('button');
      const downButton = screen.getByTestId('chevron-down').closest('button');

      expect(upButton).toHaveAttribute('tabIndex', '0');
      expect(downButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('error handling', () => {
    it('should handle undefined item properties gracefully', () => {
      const incompleteItem = {
        id: 'incomplete',
      } as CollectionItem;

      expect(() => {
        render(<OrderableItemCard {...defaultProps} item={incompleteItem} />);
      }).not.toThrow();

      expect(screen.getByText('Unknown Item')).toBeInTheDocument();
      expect(screen.getByText('0 kr.')).toBeInTheDocument();
    });

    it('should handle missing callback functions', () => {
      const propsWithoutCallbacks = {
        ...defaultProps,
        onToggleSelection: undefined,
        onMoveUp: undefined,
        onMoveDown: undefined,
      };

      expect(() => {
        render(<OrderableItemCard {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });

    it('should handle negative index values', () => {
      expect(() => {
        render(<OrderableItemCard {...defaultProps} index={-1} />);
      }).not.toThrow();

      expect(screen.getByText('0')).toBeInTheDocument(); // Math.max(-1 + 1, 1)
    });

    it('should handle invalid totalItems values', () => {
      expect(() => {
        render(
          <OrderableItemCard {...defaultProps} index={0} totalItems={0} />
        );
      }).not.toThrow();
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <OrderableItemCard {...defaultProps} className="custom-class" />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <OrderableItemCard
          {...defaultProps}
          className="custom-class"
          isSelected={true}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('custom-class');
      expect(cardElement).toHaveClass('ring-2', 'ring-blue-500');
    });
  });

  describe('memoization', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();

      const TestWrapper = ({ ...props }) => {
        renderSpy();
        return <OrderableItemCard {...props} />;
      };

      const { rerender } = render(<TestWrapper {...defaultProps} />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper {...defaultProps} />);

      // Should still only be called once due to memoization
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when props change', () => {
      const renderSpy = vi.fn();

      const TestWrapper = ({ ...props }) => {
        renderSpy();
        return <OrderableItemCard {...props} />;
      };

      const { rerender } = render(<TestWrapper {...defaultProps} />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with different props
      rerender(<TestWrapper {...defaultProps} isSelected={true} />);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
