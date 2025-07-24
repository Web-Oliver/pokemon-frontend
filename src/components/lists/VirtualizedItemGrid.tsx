/**
 * Virtualized Item Grid Component
 * Layer 3: Components (UI Building Blocks)
 * High-performance grid for large collections using virtual scrolling
 */

import React, { memo, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Package, CheckCircle, Circle } from 'lucide-react';

interface VirtualizedItemGridProps {
  items: any[];
  selectedItemIds: Set<string>;
  onToggleSelection: (itemId: string) => void;
  itemHeight?: number;
  itemWidth?: number;
  containerHeight?: number;
  columns?: number;
}

// Memoized grid item component to prevent unnecessary re-renders
const GridItem = memo(({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    columns: number;
    selectedItemIds: Set<string>;
    onToggleSelection: (itemId: string) => void;
  };
}) => {
  const { items, columns, selectedItemIds, onToggleSelection } = data;
  const itemIndex = rowIndex * columns + columnIndex;
  const item = items[itemIndex];

  if (!item) {
    return <div style={style} />;
  }

  const isSelected = selectedItemIds.has(item.id);

  return (
    <div
      style={style}
      className="p-2"
      onClick={() => onToggleSelection(item.id)}
    >
      <div
        className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col h-full hover:scale-102 ${
          isSelected
            ? 'border-amber-400 bg-amber-50/80 shadow-lg transform scale-105'
            : 'border-slate-200 bg-white/80 hover:border-amber-300 hover:shadow-md'
        }`}
      >
        {/* Selection Indicator */}
        <div className='absolute top-3 right-3 z-10'>
          {isSelected ? (
            <CheckCircle className='w-6 h-6 text-amber-600' />
          ) : (
            <Circle className='w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors' />
          )}
        </div>

        {/* Item Type Badge */}
        <div className='absolute top-3 left-3 z-10'>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            item.itemType === 'PsaGradedCard'
              ? 'bg-teal-100 text-teal-700 border border-teal-200'
              : item.itemType === 'RawCard'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-purple-100 text-purple-700 border border-purple-200'
          }`}>
            {item.itemType === 'PsaGradedCard'
              ? `PSA ${item.grade}`
              : item.itemType === 'RawCard'
              ? item.condition
              : 'Sealed'}
          </span>
        </div>

        {/* Optimized Image Display */}
        <div className='w-full h-48 mt-8 mb-3 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden'>
          {item.displayImage ? (
            <img 
              src={item.displayImage} 
              alt={item.displayName}
              className='w-full h-full object-cover transition-opacity duration-300'
              loading="lazy"
              style={{ opacity: 0 }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Package className={`w-8 h-8 text-slate-400 ${item.displayImage ? 'hidden' : ''}`} />
        </div>

        {/* Item Details */}
        <div className='flex flex-col flex-1 space-y-2'>
          <div className='flex-1'>
            <h5 className='font-bold text-slate-900 text-sm line-clamp-2 mb-2'>
              {item.displayName}
            </h5>
            {item.setName && (
              <p className='text-xs text-slate-500 font-medium truncate mb-2'>
                {item.setName}
              </p>
            )}
          </div>
          
          {/* Price - Always at bottom */}
          <div className='flex items-center justify-between mt-auto pt-2 border-t border-slate-100'>
            <span className='text-xs font-medium text-slate-600'>
              Price
            </span>
            <span className='font-bold text-emerald-600 text-lg'>
              {item.displayPrice.toLocaleString()} kr.
            </span>
          </div>
        </div>

        {/* Selection Overlay Effect */}
        {isSelected && (
          <div className='absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-2xl pointer-events-none'></div>
        )}
      </div>
    </div>
  );
});

GridItem.displayName = 'GridItem';

export const VirtualizedItemGrid: React.FC<VirtualizedItemGridProps> = ({
  items,
  selectedItemIds,
  onToggleSelection,
  itemHeight = 320,
  itemWidth = 300,
  containerHeight = 600,
  columns = 3
}) => {
  // Calculate the total width: 3 columns of 280px = 840px (fits well in most screens)
  const gridWidth = columns * itemWidth;

  const gridData = useMemo(() => ({
    items,
    columns,
    selectedItemIds,
    onToggleSelection
  }), [items, columns, selectedItemIds, onToggleSelection]);

  const rowCount = Math.ceil(items.length / columns);

  if (items.length === 0) {
    return (
      <div className='py-12 text-center'>
        <div className='w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4'>
          <Package className='w-8 h-8 text-slate-500' />
        </div>
        <h4 className='text-lg font-bold text-slate-900 mb-2'>No items found</h4>
        <p className='text-slate-600 font-medium'>
          Try adjusting your search or filter.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center overflow-hidden">
      <div style={{ width: gridWidth }}>
        <Grid
          columnCount={columns}
          columnWidth={itemWidth}
          height={containerHeight}
          rowCount={rowCount}
          rowHeight={itemHeight}
          width={gridWidth}
          itemData={gridData}
        >
          {GridItem}
        </Grid>
      </div>
    </div>
  );
};

export default VirtualizedItemGrid;