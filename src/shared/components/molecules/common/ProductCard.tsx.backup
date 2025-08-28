/**
 * ProductCard Component - DRY Violation Fix
 *
 * Reusable product card component extracted from SealedProductSearch.tsx
 * to prevent JSX duplication for individual product cards in the grid display.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles rendering of a single product card
 * - DRY: Eliminates repeated product card JSX structures
 * - Reusability: Can be used across different product displays
 * - Design System Integration: Uses consistent styling patterns
 *
 * REFACTORED: Now uses PokemonCard for unified design system styling
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ImageCollectionCard } from './ImageCollectionCard';
import { IProduct } from '../../../domain/models/product';

interface ProductCardProps {
  /** Product data to display */
  product: IProduct;
  /** Function to convert EUR to DKK */
  convertToDKK: (eurPrice: number) => number;
  /** Additional CSS classes */
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  convertToDKK,
  className = '',
}) => {
  const convertedPrice = product.price ? convertToDKK(parseFloat(product.price)) : 0;
  
  const handleExternalLink = () => {
    if (product.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <ImageCollectionCard
      title={product.productName}
      subtitle={product.setProductName || 'Unknown SetProduct'}
      imageUrl={undefined} // Products typically don't have images in this context
      price={convertedPrice}
      badge={{
        text: product.category?.replace(/-/g, ' ') || 'Unknown',
        variant: 'info',
      }}
      actions={[
        ...(product.url
          ? [
              {
                label: 'View Product',
                onClick: handleExternalLink,
                icon: <ExternalLink className="w-4 h-4" />,
                variant: 'primary' as const,
              },
            ]
          : []),
      ]}
      extraDetails={[
        ...(product.price
          ? [
              { label: 'EUR Price', value: `€${product.price}` },
              { label: 'DKK Price', value: `${convertedPrice} DKK` },
            ]
          : []),
        {
          label: 'Available',
          value: product.available > 0 ? `${product.available} in stock` : 'Out of stock',
        },
        ...(product.lastUpdated
          ? [
              {
                label: 'Updated',
                value: new Date(product.lastUpdated).toLocaleDateString(),
              },
            ]
          : []),
      ]}
      interactive={true}
      className={className}
    />
  );
};

export default ProductCard;
