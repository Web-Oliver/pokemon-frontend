/**
 * Image Product View Component with Theme Integration
 *
 * Standardized reusable component for displaying product images across all pages.
 * Based on the premium design from CollectionItemCard with enhanced functionality.
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles image product display
 * - Open/Closed: Extensible via props for different use cases
 * - DRY: Reusable across collection, detail, and auction pages
 * - Layer 3: UI Building Block component
 * - Theme Integration: Uses unified theme system for consistent styling
 */

import React, { memo, useCallback, useState } from 'react';
import {
  Archive,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Heart,
  MoreHorizontal,
  Package,
  Share,
  Star,
  Trash2,
} from 'lucide-react';
import { ImageSlideshow } from './ImageSlideshow';
import { getElementTheme, ThemeColor } from '../../../../theme/formThemes';

export interface ImageProductViewProps {
  // Core image data
  images: string[];
  title: string;
  subtitle?: string;
  price?: number | string;

  // Product type and status
  type?: 'psa' | 'raw' | 'sealed';
  grade?: string | number;
  condition?: string;
  category?: string;
  sold?: boolean;
  saleDate?: string;

  // Display options
  variant?: 'card' | 'detail' | 'auction' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showPrice?: boolean;
  showActions?: boolean;
  enableInteractions?: boolean;

  // Layout options
  aspectRatio?: 'auto' | 'card' | 'square' | 'wide';
  className?: string;
  themeColor?: ThemeColor;

  // Callback functions
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkSold?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
}

const ImageProductViewComponent: React.FC<ImageProductViewProps> = ({
  images,
  title,
  subtitle,
  price,
  type = 'sealed',
  grade,
  condition,
  category,
  sold = false,
  saleDate,
  variant = 'card',
  size = 'md',
  showBadge = true,
  showPrice = true,
  showActions = false,
  enableInteractions = true,
  aspectRatio = 'card',
  className = '',
  themeColor = 'dark',
  onView,
  onEdit,
  onDelete,
  _onMarkSold,
  onDownload,
  onShare,
  onFavorite,
}) => {
  const elementTheme = getElementTheme(themeColor);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Size configuration - Made image much bigger, text smaller
  const {} = {
    sm: {
      width: 'w-32',
      height: 'h-80',
      textHeight: 'h-16',
      text: 'text-[10px]',
      badge: 'text-[8px]',
    },
    md: {
      width: 'w-48',
      height: 'h-[30rem]',
      textHeight: 'h-20',
      text: 'text-xs',
      badge: 'text-[9px]',
    },
    lg: {
      width: 'w-64',
      height: 'h-[36rem]',
      textHeight: 'h-24',
      text: 'text-sm',
      badge: 'text-[10px]',
    },
    xl: {
      width: 'w-80',
      height: 'h-[44rem]',
      textHeight: 'h-28',
      text: 'text-base',
      badge: 'text-xs',
    },
  }[size];

  // Aspect ratio configuration
  const {} = {
    auto: 'aspect-auto',
    card: 'aspect-[3/5]', // Vertical portrait cards
    square: 'aspect-square',
    wide: 'aspect-[16/9]',
  }[aspectRatio];

  // Badge content based on type and status
  const getBadgeContent = () => {
    if (sold && saleDate) {
      return (
        <>
          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
          Sold {new Date(saleDate).toLocaleDateString()}
        </>
      );
    }

    switch (type) {
      case 'psa':
        return (
          <>
            <Star className="w-3 h-3 mr-1 text-yellow-500" />
            Grade {grade || 'N/A'}
          </>
        );
      case 'raw':
        return (
          <>
            <Package className="w-3 h-3 mr-1 text-emerald-500" />
            {condition || 'N/A'}
          </>
        );
      case 'sealed':
        return (
          <>
            <Archive className="w-3 h-3 mr-1 text-purple-500" />
            {category || 'N/A'}
          </>
        );
      default:
        return null;
    }
  };

  // Handle primary click action
  const handleClick = useCallback(() => {
    if (onView && enableInteractions) {
      onView();
    }
  }, [onView, enableInteractions]);

  // Render action buttons
  const renderActions = () => {
    if (!showActions) {
      return null;
    }

    const actions = [
      { icon: Eye, label: 'View', onClick: onView, show: !!onView },
      { icon: Edit, label: 'Edit', onClick: onEdit, show: !!onEdit },
      {
        icon: Download,
        label: 'Download',
        onClick: onDownload,
        show: !!onDownload,
      },
      { icon: Share, label: 'Share', onClick: onShare, show: !!onShare },
      {
        icon: Heart,
        label: 'Favorite',
        onClick: onFavorite,
        show: !!onFavorite,
      },
      { icon: Trash2, label: 'Delete', onClick: onDelete, show: !!onDelete },
    ].filter((action) => action.show);

    if (actions.length === 0) {
      return null;
    }

    return (
      <div className="absolute top-3 right-3 z-50">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsActionsOpen(!isActionsOpen);
            }}
            className="w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isActionsOpen && (
            <div
              className={`absolute top-10 right-0 bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl ${elementTheme.border} p-2 min-w-[120px]`}
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.();
                      setIsActionsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 rounded-xl transition-colors duration-300"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Variant-specific styling
  const baseStyles =
    'relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10';

  const getVariantStyles = () => {
    switch (variant) {
      case 'detail':
        return `${baseStyles} shadow-2xl rounded-2xl`;
      case 'auction':
        return `${baseStyles} shadow-lg hover:shadow-xl rounded-2xl`;
      case 'minimal':
        return `${baseStyles} shadow-sm hover:shadow-md rounded-2xl`;
      case 'card':
      default:
        return `${baseStyles} shadow-lg hover:shadow-xl hover:border-white/20 rounded-2xl`;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      className={`group h-full w-full transition-all duration-300 ${enableInteractions ? 'cursor-pointer hover:scale-[1.02]' : ''} ${variantStyles} ${className}`}
      onClick={enableInteractions ? handleClick : undefined}
    >
      {/* Full background image */}
      <div className="absolute inset-0">
        <ImageSlideshow
          images={images}
          fallbackIcon={<Package className="w-8 h-8 text-white/60" />}
          autoplay={false}
          autoplayDelay={4000}
          className="w-full h-full rounded-2xl"
          showThumbnails={variant === 'detail'}
          themeColor={themeColor}
        />
      </div>

      {/* Clean text overlay at bottom - like the reference design */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 z-30">
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            {/* Title - larger and prominent like "Jane Doe" */}
            <h3 className="text-white font-bold text-xl leading-tight mb-1">
              {title}
            </h3>

            {/* Set name - more visible */}
            {subtitle && (
              <p className="text-white font-medium text-sm">{subtitle}</p>
            )}
          </div>

          {/* Grade and Price stacked on right */}
          <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-3">
            {showBadge && (
              <div className="text-white/90 text-xs font-medium">
                {getBadgeContent()}
              </div>
            )}
            {showPrice && price && (
              <div className="text-white font-bold text-sm">{price} kr</div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons only when explicitly enabled */}
      {showActions && (
        <div className="absolute top-2 left-2 z-30">{renderActions()}</div>
      )}
    </div>
  );
};

/**
 * Custom memo comparison function for ImageProductView
 * Optimizes re-rendering by performing shallow comparison on critical props
 * Following CLAUDE.md performance optimization principles
 */
const arePropsEqual = (
  prevProps: ImageProductViewProps,
  nextProps: ImageProductViewProps
): boolean => {
  // Check critical properties that affect rendering
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.price === nextProps.price &&
    prevProps.type === nextProps.type &&
    prevProps.grade === nextProps.grade &&
    prevProps.condition === nextProps.condition &&
    prevProps.category === nextProps.category &&
    prevProps.sold === nextProps.sold &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.aspectRatio === nextProps.aspectRatio &&
    prevProps.themeColor === nextProps.themeColor &&
    JSON.stringify(prevProps.images) === JSON.stringify(nextProps.images) &&
    prevProps.showBadge === nextProps.showBadge &&
    prevProps.showPrice === nextProps.showPrice &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.enableInteractions === nextProps.enableInteractions
  );
};

/**
 * Memoized ImageProductView component
 * Prevents unnecessary re-renders when props haven't changed
 * Optimizes performance for pages with multiple product views
 */
export const ImageProductView = memo(ImageProductViewComponent, arePropsEqual);

export default ImageProductView;
