/**
 * Drag & Drop Context Provider for Item Ordering
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles drag & drop context setup
 * - Open/Closed: Extensible for different drag & drop scenarios
 * - DRY: Centralized drag & drop configuration
 * - Layer 2: Services/Context - provides drag & drop capabilities to components
 */

import React, { createContext, useContext, ReactNode } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  DropAnimation,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types for drag & drop operations
export interface DragDropContextValue {
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: typeof closestCenter;
  measuring: {
    droppable: {
      strategy: MeasuringStrategy;
    };
  };
}

export interface DragDropProviderProps {
  children: ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  dragOverlay?: ReactNode;
}

export interface SortableListProps {
  children: ReactNode;
  items: string[];
  strategy?: typeof verticalListSortingStrategy;
}

// Context for drag & drop operations
const DragDropContext = createContext<DragDropContextValue | null>(null);

/**
 * Custom drop animation with enhanced visual feedback
 */
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

/**
 * Drag & Drop Provider Component
 * Provides drag & drop context for item ordering with enhanced UX
 */
export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragOverlay,
}) => {
  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Optimized measuring strategy for better performance
  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.WhileDragging,
    },
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={dropAnimation}>
        {dragOverlay}
      </DragOverlay>
    </DndContext>
  );
};

/**
 * Sortable List Container
 * Wraps items that can be sorted via drag & drop
 */
export const SortableList: React.FC<SortableListProps> = ({
  children,
  items,
  strategy = verticalListSortingStrategy,
}) => {
  return (
    <SortableContext items={items} strategy={strategy}>
      {children}
    </SortableContext>
  );
};

/**
 * Hook to use drag & drop context
 */
export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

/**
 * Utility function to create drag & drop transform styles
 */
export const createDragStyle = (
  transform: { x: number; y: number } | null,
  transition?: string | null,
  isDragging: boolean = false
) => {
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    position: isDragging ? ('relative' as const) : ('static' as const),
  };

  return style;
};

/**
 * Utility function to handle array reordering
 */
export const reorderArray = <T,>(
  array: T[],
  activeId: string | number,
  overId: string | number
): T[] => {
  const oldIndex = array.findIndex((item: any) => 
    (item.id || item) === activeId
  );
  const newIndex = array.findIndex((item: any) => 
    (item.id || item) === overId
  );

  if (oldIndex === -1 || newIndex === -1) {
    return array;
  }

  return arrayMove(array, oldIndex, newIndex);
};

/**
 * Utility function to check if drag operation is allowed
 */
export const isDragAllowed = (
  activeId: string,
  overId: string,
  constraints?: {
    sameCategory?: boolean;
    allowedCategories?: string[];
  }
): boolean => {
  if (!constraints) return true;

  if (constraints.sameCategory) {
    // Extract category from ID (assuming format like "category-id")
    const activeCategory = activeId.split('-')[0];
    const overCategory = overId.split('-')[0];
    return activeCategory === overCategory;
  }

  if (constraints.allowedCategories) {
    const activeCategory = activeId.split('-')[0];
    const overCategory = overId.split('-')[0];
    return (
      constraints.allowedCategories.includes(activeCategory) &&
      constraints.allowedCategories.includes(overCategory)
    );
  }

  return true;
};

/**
 * Utility function to generate drag feedback styles
 */
export const getDragFeedbackStyles = (isDragging: boolean, isOver?: boolean) => {
  const baseStyles = 'transition-all duration-200';
  
  if (isDragging) {
    return `${baseStyles} opacity-50 scale-95 shadow-lg ring-2 ring-blue-500`;
  }
  
  if (isOver) {
    return `${baseStyles} scale-105 shadow-md ring-2 ring-blue-300`;
  }
  
  return `${baseStyles} hover:shadow-md`;
};

export default DragDropProvider;