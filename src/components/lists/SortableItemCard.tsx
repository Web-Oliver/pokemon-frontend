/**
 * Sortable Item Card Component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles sortable drag & drop functionality
 * - Open/Closed: Extensible wrapper for any item card component
 * - DRY: Reusable sortable wrapper for different item types
 * - Layer 3: UI Building Block component
 */

import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import {
  createDragStyle,
  getDragFeedbackStyles,
} from '../../contexts/DragDropContext';
import { OrderableItemCard, OrderableItemCardProps } from './OrderableItemCard';
import { CollectionItem } from '../../domain/models/ordering';

export interface SortableItemCardProps
  extends Omit<OrderableItemCardProps, 'isDragging'> {
  id: string;
  item: CollectionItem;
  // Drag & drop specific props
  dragConstraints?: {
    sameCategory?: boolean;
    allowedCategories?: string[];
  };
  // Visual feedback options
  showDragFeedback?: boolean;
  dragHandle?: boolean;
}

/**
 * Sortable Item Card Component
 * Wraps OrderableItemCard with drag & drop functionality using @dnd-kit
 */
const SortableItemCardComponent: React.FC<SortableItemCardProps> = ({
  id,
  item,
  index,
  totalItems,
  isSelected,
  onToggleSelection,
  onMoveUp,
  onMoveDown,
  showSelection = true,
  showMoveButtons = true,
  showDragHandle = true,
  dragConstraints,
  showDragFeedback = true,
  dragHandle = true,
  className = '',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id,
    data: {
      type: 'item',
      item,
      constraints: dragConstraints,
    },
  });

  // Create drag styles using utility function
  const dragStyle = createDragStyle(transform, transition, isDragging);

  // Get drag feedback styles
  const feedbackStyles = showDragFeedback
    ? getDragFeedbackStyles(isDragging, isOver)
    : '';

  // Combine all styles
  const combinedClassName = `${className} ${feedbackStyles}`.trim();

  // Prepare drag handle props
  const dragHandleProps =
    dragHandle && showDragHandle
      ? {
          ...attributes,
          ...listeners,
        }
      : {};

  return (
    <div ref={setNodeRef} style={dragStyle} className={combinedClassName}>
      <OrderableItemCard
        item={item}
        index={index}
        totalItems={totalItems}
        isSelected={isSelected}
        isDragging={isDragging}
        onToggleSelection={onToggleSelection}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        showSelection={showSelection}
        showMoveButtons={showMoveButtons}
        showDragHandle={showDragHandle}
        dragHandleProps={dragHandleProps}
        className=""
      />
    </div>
  );
};

/**
 * Custom memo comparison function for SortableItemCard
 * Optimizes re-rendering by comparing critical props
 */
const arePropsEqual = (
  prevProps: SortableItemCardProps,
  nextProps: SortableItemCardProps
): boolean => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.totalItems === nextProps.totalItems &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showSelection === nextProps.showSelection &&
    prevProps.showMoveButtons === nextProps.showMoveButtons &&
    prevProps.showDragHandle === nextProps.showDragHandle &&
    prevProps.showDragFeedback === nextProps.showDragFeedback &&
    prevProps.dragHandle === nextProps.dragHandle &&
    prevProps.className === nextProps.className &&
    prevProps.onToggleSelection === nextProps.onToggleSelection &&
    prevProps.onMoveUp === nextProps.onMoveUp &&
    prevProps.onMoveDown === nextProps.onMoveDown &&
    JSON.stringify(prevProps.dragConstraints) ===
      JSON.stringify(nextProps.dragConstraints)
  );
};

/**
 * Memoized SortableItemCard component
 * Prevents unnecessary re-renders when props haven't changed
 */
export const SortableItemCard = memo(SortableItemCardComponent, arePropsEqual);

export default SortableItemCard;
