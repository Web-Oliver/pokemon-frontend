/**
 * Orderable Item Card Component
 *
 * Extended version of CollectionItemCard with ordering capabilities
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles orderable item card display and interactions
 * - Open/Closed: Extends existing card patterns with ordering features
 * - DRY: Reuses existing card component patterns and styling
 * - Layer 3: UI Building Block component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { ImageProductView } from '../common/ImageProductView';
import { formatCardNameForDisplay } from '../../utils/formatting';
import { CollectionItem } from '../../domain/models/ordering';
import { getItemCategory, getItemDisplayName, getSortablePrice } from '../../utils/orderingUtils';

export interface OrderableItemCardProps {
  item: CollectionItem;
  index: number;
  isDragging?: boolean;
  isSelected?: boolean;
  onMoveUp: (itemId: string) => void;
  onMoveDown: (itemId: string) => void;
  onToggleSelection?: (itemId: string) => void;
  dragHandleProps?: any; // For future drag & drop implementation
  showMoveButtons?: boolean;
  showDragHandle?: boolean;
  showSelection?: boolean;
  className?: string;
}

const OrderableItemCardComponent: React.FC<OrderableItemCardProps> = ({
  item,
  index,
  isDragging = false,
  isSelected = false,
  onMoveUp,
  onMoveDown,
  onToggleSelection,
  dragHandleProps,
  showMoveButtons = true,
  showDragHandle = false,
  showSelection = false,
  className = '',
}) => {
  // Memoized item properties using existing patterns
  const itemName = useMemo(() => {
    return getItemDisplayName(item);
  }, [item]);

  // Memoized set name calculation (reusing CollectionItemCard pattern)
  const setName = useMemo(() => {
    return (
      (item as any).cardId?.setId?.setName ||
      (item as any).setName ||
      (item as any).cardId?.setName ||
      'Unknown Set'
    );
  }, [item]);

  // Determine item type for display
  const itemType = useMemo(() => {
    const category = getItemCategory(item);
    switch (category) {
      case 'PSA_CARD':
        return 'psa';
      case 'RAW_CARD':
        return 'raw';
      case 'SEALED_PRODUCT':
        return 'sealed';
      default:
        return 'raw';
    }
  }, [item]);

  // Get item-specific display properties
  const itemDisplayProps = useMemo(() => {
    const category = getItemCategory(item);
    
    return {
      grade: category === 'PSA_CARD' ? (item as any).grade : undefined,
      condition: category === 'RAW_CARD' ? (item as any).condition : undefined,
      category: category === 'SEALED_PRODUCT' ? (item as any).category : undefined,
    };
  }, [item]);

  // Event handlers
  const handleMoveUp = useCallback(() => {
    onMoveUp(item.id);
  }, [onMoveUp, item.id]);

  const handleMoveDown = useCallback(() => {
    onMoveDown(item.id);
  }, [onMoveDown, item.id]);

  const handleToggleSelection = useCallback(() => {
    if (onToggleSelection) {
      onToggleSelection(item.id);
    }
  }, [onToggleSelection, item.id]);

  // Drag state styling
  const cardClassName = useMemo(() => {
    const baseClasses = `relative transition-all duration-200 ${className}`;
    const draggingClasses = isDragging 
      ? 'opacity-50 scale-95 shadow-lg ring-2 ring-blue-500' 
      : '';
    const selectedClasses = isSelected 
      ? 'ring-2 ring-blue-500 bg-blue-900/20' 
      : '';
    
    return `${baseClasses} ${draggingClasses} ${selectedClasses}`.trim();
  }, [className, isDragging, isSelected]);

  return (
    <div className={cardClassName}>
      {/* Ordering Controls Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Drag Handle */}
        {showDragHandle && (
          <div
            {...dragHandleProps}
            className="absolute top-2 left-2 p-1 bg-zinc-800 rounded border shadow-sm cursor-grab active:cursor-grabbing pointer-events-auto hover:bg-zinc-700 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
          </div>
        )}

        {/* Selection Checkbox */}
        {showSelection && (
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggleSelection}
              className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2 pointer-events-auto"
              title={isSelected ? 'Deselect item' : 'Select item'}
            />
          </div>
        )}

        {/* Move Buttons */}
        {showMoveButtons && (
          <div className="absolute bottom-2 right-2 flex flex-col space-y-1">
            <button
              onClick={handleMoveUp}
              className="p-1 bg-zinc-800 border border-zinc-600 rounded hover:bg-zinc-700 transition-colors pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Move item up"
              disabled={index === 0}
            >
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
            </button>
            <button
              onClick={handleMoveDown}
              className="p-1 bg-zinc-800 border border-zinc-600 rounded hover:bg-zinc-700 transition-colors pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Move item down"
            >
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
            </button>
          </div>
        )}

        {/* Order Index Badge */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
            #{index + 1}
          </div>
        </div>
      </div>

      {/* Base Item Card */}
      <ImageProductView
        images={item.images || []}
        title={itemName}
        subtitle={setName}
        price={item.myPrice}
        type={itemType}
        grade={itemDisplayProps.grade}
        condition={itemDisplayProps.condition}
        category={itemDisplayProps.category}
        sold={item.sold}
        saleDate={
          item.sold ? (item as any).saleDetails?.dateSold : undefined
        }
        variant="card"
        size="md"
        aspectRatio="card"
        showBadge={true}
        showPrice={true}
        showActions={false}
        enableInteractions={false} // Disable interactions to prevent conflicts with ordering controls
        className="w-full"
      />
    </div>
  );
};

/**
 * Custom memo comparison function for OrderableItemCard
 * Optimizes re-rendering by performing shallow comparison on critical props
 * Following CLAUDE.md performance optimization principles
 */
const arePropsEqual = (
  prevProps: OrderableItemCardProps,
  nextProps: OrderableItemCardProps
): boolean => {
  // Check critical ordering props first
  if (
    prevProps.index !== nextProps.index ||
    prevProps.isDragging !== nextProps.isDragging ||
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.showMoveButtons !== nextProps.showMoveButtons ||
    prevProps.showDragHandle !== nextProps.showDragHandle ||
    prevProps.showSelection !== nextProps.showSelection
  ) {
    return false;
  }

  // Check if the item itself has changed (by reference or critical properties)
  if (prevProps.item !== nextProps.item) {
    // Perform deeper comparison for item properties that affect rendering
    const prevItem = prevProps.item as Record<string, unknown>;
    const nextItem = nextProps.item as Record<string, unknown>;

    // Check critical properties that affect card display
    if (
      prevItem.id !== nextItem.id ||
      prevItem.myPrice !== nextItem.myPrice ||
      prevItem.images !== nextItem.images ||
      JSON.stringify(prevItem.cardId) !== JSON.stringify(nextItem.cardId) ||
      JSON.stringify(prevItem.saleDetails) !==
        JSON.stringify(nextItem.saleDetails)
    ) {
      return false;
    }
  }

  // Check callback functions (by reference)
  return (
    prevProps.onMoveUp === nextProps.onMoveUp &&
    prevProps.onMoveDown === nextProps.onMoveDown &&
    prevProps.onToggleSelection === nextProps.onToggleSelection &&
    prevProps.dragHandleProps === nextProps.dragHandleProps &&
    prevProps.className === nextProps.className
  );
};

/**
 * Memoized OrderableItemCard component
 * Prevents unnecessary re-renders when props haven't changed
 * Optimizes performance for large collection grids with drag & drop
 */
export const OrderableItemCard = memo(
  OrderableItemCardComponent,
  arePropsEqual
);

export default OrderableItemCard;