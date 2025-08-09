/**
 * Item Image Gallery Component
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles image display and download functionality
 * - DRY: Reusable image gallery pattern
 * - Reusability: Can be used by other item components
 */

import React from 'react';
import { Download } from 'lucide-react';
import { CollectionItem } from '../../hooks/collection/useCollectionItem';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';
import { ImageProductView } from '../../../../shared/components/molecules/common/ImageProductView';
import LoadingSpinner from '../../../../shared/components/molecules/common/LoadingSpinner';
import { navigationHelper } from "../../../shared/utils/navigation";

export interface ItemImageGalleryProps {
  item: CollectionItem;
  title: string;
  setName: string;
  onDownloadImages?: () => void;
  downloadingZip?: boolean;
  className?: string;
}

/**
 * Component for displaying item image gallery with download functionality
 * Shows high-resolution imagery with optional download button
 */
export const ItemImageGallery: React.FC<ItemImageGalleryProps> = ({
  item,
  title,
  setName,
  onDownloadImages,
  downloadingZip = false,
  className = '',
}) => {
  // Get item type for ImageProductView
  const getItemType = () => {
    const { type } = navigationHelper.getCollectionItemParams();
    return type as 'psa' | 'raw' | 'sealed';
  };

  return (
    <PokemonCard
      title="Premium Gallery"
      subtitle="High-resolution imagery"
      variant="outlined"
      className={`h-full ${className}`}
    >
      <div className="h-[300px] sm:h-[400px] md:h-[500px]">
        <ImageProductView
          images={item.images || []}
          title={title}
          subtitle={setName}
          price={item.myPrice}
          type={getItemType()}
          grade={'grade' in item ? item.grade : undefined}
          condition={'condition' in item ? item.condition : undefined}
          category={'category' in item ? item.category : undefined}
          sold={item.sold}
          saleDate={item.saleDetails?.dateSold}
          variant="detail"
          size="xl"
          aspectRatio="auto"
          showBadge={false}
          showPrice={false}
          showActions={true}
          enableInteractions={false}
          className="h-full"
        />
      </div>

      {/* Download Button */}
      {item.images && item.images.length > 0 && onDownloadImages && (
        <div className="mt-3 sm:mt-4 flex justify-center">
          <button
            onClick={onDownloadImages}
            disabled={downloadingZip}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[var(--theme-accent-primary)] text-white rounded-lg hover:bg-[var(--theme-accent-primary)]/80 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {downloadingZip ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloadingZip ? 'Downloading...' : 'Download ZIP'}</span>
          </button>
        </div>
      )}
    </PokemonCard>
  );
};
