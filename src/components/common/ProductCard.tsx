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
 */

import React from 'react';
import { PokemonCard } from '../design-system/PokemonCard';
import { IProduct } from '../../domain/models/product';

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
  return (
    <PokemonCard
      cardType="product"
      variant="glass"
      size="md"
      product={product}
      title={product.name}
      subtitle={product.setName}
      category={product.category}
      price={product.price}
      convertToDKK={convertToDKK}
      availability={product.available ? 'available' : 'out_of_stock'}
      interactive={true}
      className={`hover:scale-[1.02] transition-all duration-300 ${className}`}
    />
  );
};

export default ProductCard;