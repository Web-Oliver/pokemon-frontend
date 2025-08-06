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
 * REFACTORED: Now uses BaseCard for consistent card styling and behavior
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { BaseCard } from './BaseCard';
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
  return (
    <BaseCard
      variant="glass"
      size="md"
      interactive={true}
      className={`group ${className}`}
      elevated={true}
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-[var(--theme-text-primary)] text-lg leading-tight line-clamp-2 group-hover:text-[var(--theme-status-success)] transition-colors duration-300">
            {product.productName}
          </h3>
          <p className="text-[var(--theme-text-secondary)] font-medium mt-1">
            {product.setProductName || 'Unknown SetProduct'}
          </p>
          <span className="inline-block px-3 py-1 text-xs font-bold bg-gradient-to-r from-[var(--theme-status-success)]/50 to-teal-900/50 text-[var(--theme-status-success)] rounded-full mt-2 border border-[var(--theme-status-success)]/30">
            {product.category?.replace(/-/g, ' ') || 'Unknown'}
          </span>
        </div>

        <div className="space-y-3 pt-3 border-t border-[var(--theme-border)]">
          {product.price && (
            <div className="flex justify-between items-center">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Price:
              </span>
              <div className="text-right">
                <div className="font-bold text-[var(--theme-text-primary)]">
                  {convertToDKK(parseFloat(product.price))} DKK
                </div>
                <div className="text-xs text-[var(--theme-text-muted)]">
                  €{product.price}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[var(--theme-text-secondary)] font-medium">
              Available:
            </span>
            <span
              className={`font-bold px-2 py-1 rounded-lg text-sm ${
                product.available > 0
                  ? 'text-[var(--theme-status-success)] bg-[var(--theme-status-success)]/30 border border-[var(--theme-status-success)]/30'
                  : 'text-[var(--theme-status-error)] bg-[var(--theme-status-error)]/30 border border-[var(--theme-status-error)]/30'
              }`}
            >
              {product.available > 0
                ? `${product.available} in stock`
                : 'Out of stock'}
            </span>
          </div>

          {product.lastUpdated && (
            <div className="text-xs text-[var(--theme-text-muted)] text-center pt-2">
              Updated: {new Date(product.lastUpdated).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* External Link */}
        {product.url && (
          <div className="pt-3 border-t border-[var(--theme-border)]">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/link"
            >
              <ExternalLink className="w-4 h-4 mr-2 group-hover/link:scale-110 transition-transform duration-300" />
              View Product
            </a>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default ProductCard;