/**
 * Item Customization Card Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for rendering item customization UI
 * - OCP: Open for extension via responsive design
 * - DRY: Eliminates mobile/desktop layout duplication
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { processImageUrl } from '../../../../../shared/utils';

interface SelectedItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  customTitle?: string;
  customDescription?: string;
  images?: string[];
  name?: string;
  setName?: string;
  productId?: {
    productName?: string;
    setProductId?: string;
  };
}

interface ItemCustomizationCardProps {
  item: SelectedItem;
  generateTitle: (item: any) => string;
  generateDescription: (item: any) => string;
  updateItemCustomization: (
    itemId: string,
    field: string,
    value: string
  ) => void;
}

// processImageUrl now imported from utils/common.ts

/**
 * Get item display information
 * Centralizes item metadata extraction logic
 */
const getItemDisplayInfo = (
  item: SelectedItem,
  generateTitle: (item: any) => string
) => ({
  title: item.productId?.productName || item.name || generateTitle(item),
  subtitle: `${item.productId?.setProductId || item.setName || 'Unknown Set'} • ${item.type.toUpperCase()}`,
  hasImage: !!(item.images && item.images[0]),
  imageUrl:
    item.images && item.images[0] ? processImageUrl(item.images[0]) : null,
  altText: item.name || 'Item',
});

const ItemCustomizationCard: React.FC<ItemCustomizationCardProps> = ({
  item,
  generateTitle,
  generateDescription,
  updateItemCustomization,
}) => {
  const displayInfo = getItemDisplayInfo(item, generateTitle);

  return (
    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-600/30">
      {/* Responsive Layout - Mobile-first with responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] gap-4">
        {/* Item Info & Image Column */}
        <div className="flex flex-col">
          {/* Item Information */}
          <div className="mb-3">
            <span className="text-sm lg:text-sm font-medium text-white">
              {displayInfo.title}
            </span>
            <p className="text-xs text-zinc-400 mt-1">{displayInfo.subtitle}</p>
          </div>

          {/* Item Image */}
          <div className="flex justify-center lg:justify-start">
            {displayInfo.hasImage ? (
              <img
                src={displayInfo.imageUrl!}
                alt={displayInfo.altText}
                className="w-48 h-48 lg:w-64 lg:h-64 object-contain rounded-lg border border-zinc-600 bg-zinc-800"
              />
            ) : (
              <div className="w-48 h-48 lg:w-64 lg:h-64 bg-zinc-700 rounded-lg border border-zinc-600 flex items-center justify-center">
                <span className="text-zinc-500 text-xs text-center">
                  No Image
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Customization Fields Column */}
        <div className="flex flex-col space-y-4">
          {/* Custom Title Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Custom Title
            </label>
            <textarea
              value={item.customTitle || generateTitle(item)}
              onChange={(e) => {
                updateItemCustomization(item.id, 'customTitle', e.target.value);
              }}
              placeholder="Enter custom title..."
              className="w-full h-20 lg:h-[100px] px-3 py-3 bg-zinc-700 text-white font-medium text-sm rounded-lg border border-zinc-600 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:bg-zinc-600 transition-all duration-200 resize-none"
            />
          </div>

          {/* Custom Description Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Custom Description
            </label>
            <textarea
              value={item.customDescription || generateDescription(item)}
              onChange={(e) => {
                updateItemCustomization(
                  item.id,
                  'customDescription',
                  e.target.value
                );
              }}
              placeholder="Enter custom description..."
              className="w-full h-32 lg:h-[135px] px-3 py-3 bg-zinc-700 text-white font-medium text-sm rounded-lg border border-zinc-600 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:bg-zinc-600 transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCustomizationCard;
