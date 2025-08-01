/**
 * Image Product View Component
 *
 * Standardized reusable component for displaying product images across all pages.
 * Based on the premium design from CollectionItemCard with enhanced functionality.
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles image product display
 * - Open/Closed: Extensible via props for different use cases
 * - DRY: Reusable across collection, detail, and auction pages
 * - Layer 3: UI Building Block component
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
  onView,
  onEdit,
  onDelete,
  onMarkSold,
  onDownload,
  onShare,
  onFavorite,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Size configuration - Made image much bigger, text smaller
  const sizeConfig = {
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
  const aspectConfig = {
    auto: 'aspect-auto',
    card: 'aspect-[3/7]', // Made taller for bigger image area
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
            <div className="absolute top-10 right-0 bg-zinc-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-zinc-700/40 p-2 min-w-[120px]">
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
                    className="w-full flex items-center px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 rounded transition-colors"
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
  const getVariantStyles = () => {
    const baseStyles =
      'relative rounded-xl shadow-lg border border-zinc-700/40 overflow-hidden bg-zinc-900/80 backdrop-blur-xl';

    switch (variant) {
      case 'detail':
        return `${baseStyles} shadow-xl`;
      case 'auction':
        return `${baseStyles} hover:shadow-xl`;
      case 'minimal':
        return `${baseStyles} shadow-sm hover:shadow-md`;
      case 'card':
      default:
        return `${baseStyles} hover:shadow-xl`;
    }
  };

  return (
    <div
      className={`group ${getVariantStyles()} transition-all duration-300 ${enableInteractions ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className} flex flex-col ${sizeConfig.height}`}
      onClick={handleClick}
      style={{
        boxShadow:
          '0 35px 60px -12px rgba(0, 0, 0, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Main Image Container - Much bigger */}
      <div
        className={`relative w-full ${variant === 'detail' ? 'min-h-[500px]' : 'flex-1'}`}
      >
        <div className="w-full h-full rounded-t-xl overflow-hidden relative">
          <ImageSlideshow
            images={images}
            fallbackIcon={<Package className="w-8 h-8 text-indigo-600" />}
            autoplay={false}
            autoplayDelay={4000}
            className="w-full h-full"
            showThumbnails={variant === 'detail'}
          />

          {/* Standard multi-layer text overlay shadow for better visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/95 via-black/80 via-black/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/98 via-black/85 to-transparent z-15 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/95 to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/90 z-25 pointer-events-none" />
        </div>

        {/* Action buttons */}
        {renderActions()}
      </div>

      {/* Text Layer - Standard shadows for better visibility */}
      <div
        className={`absolute bottom-0 left-0 right-0 ${sizeConfig.textHeight} flex flex-col justify-end p-2 pointer-events-none z-30`}
      >
        {/* Badge */}
        {showBadge && (
          <div
            className={`inline-flex items-center justify-center px-2 py-1 rounded-full ${sizeConfig.badge} font-bold mb-1 self-start pointer-events-auto ${sold ? 'bg-green-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg'}`}
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              backgroundColor: sold ? '#059669' : '#2563eb',
            }}
          >
            {getBadgeContent()}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p
            className={`${sizeConfig.badge} text-white font-semibold mb-0.5 tracking-wide uppercase leading-tight break-words`}
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.8)',
              WebkitTextStroke: '0.5px rgba(0,0,0,0.5)',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Title */}
        <h3
          className={`${sizeConfig.text} font-bold text-white leading-tight break-words`}
          style={{
            textShadow:
              '0 2px 4px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,0.9), 0 3px 8px rgba(0,0,0,0.7)',
            WebkitTextStroke: '0.5px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </h3>
      </div>

      {/* Price in Bottom Right Corner */}
      {showPrice && price && (
        <div
          className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg ${sizeConfig.badge} font-bold bg-cyan-400 text-black dark:text-white dark:text-white pointer-events-auto z-40 shadow-xl`}
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {price} kr.
        </div>
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
