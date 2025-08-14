/**
 * CategorySalesCard Component - DRY Violation Fix
 *
 * Reusable category breakdown card component extracted from SalesAnalytics.tsx
 * to prevent JSX duplication for category breakdown cards (PSA Graded Card, Raw Card, Sealed Product).
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles one category's sales display
 * - DRY: Eliminates repeated category card JSX structures
 * - Reusability: Can be used across different category displays
 * - Design System Integration: Uses consistent styling patterns
 */

import React from 'react';
import { displayPrice } from '../../../utils';

interface CategoryConfig {
  /** Category name */
  name: string;
  /** Number of items sold in this category */
  count: number;
  /** Total revenue for this category */
  revenue: number;
  /** Emoji icon for the category */
  icon: string;
  /** Background color class */
  color: string;
  /** Text color class */
  textColor: string;
  /** Background color class for badge */
  bgColor: string;
  /** Border color class */
  borderColor: string;
}

interface CategorySalesCardProps {
  /** Category configuration object */
  category: CategoryConfig;
  /** Additional CSS classes */
  className?: string;
}

const CategorySalesCard: React.FC<CategorySalesCardProps> = ({
  category,
  className = '',
}) => {
  const getBorderColor = (colorClass: string) => {
    if (colorClass.includes('yellow')) {
      return 'rgba(251, 191, 36, 0.3)';
    }
    if (colorClass.includes('blue')) {
      return 'rgba(59, 130, 246, 0.3)';
    }
    return 'rgba(168, 85, 247, 0.3)';
  };

  return (
    <div
      className={`card-premium bg-[var(--theme-surface)] border-[var(--theme-border)] rounded-xl p-6 scale-on-hover ${className}`}
    >
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${category.color.replace('bg-', 'bg-gradient-to-r from-').replace('-600', '-500/20 to-cyan-500/20')} mb-4 text-xl border border-opacity-30 backdrop-blur-sm glow-on-hover`}
          style={{
            borderColor: getBorderColor(category.color),
          }}
        >
          {category.icon}
        </div>
        <h4 className="text-lg font-bold text-[var(--theme-text-primary)] mb-2">
          {category.name}
        </h4>
        <div className="space-y-2">
          <div
            className={`inline-flex items-center px-3 py-1 ${category.bgColor} ${category.textColor} rounded-full text-sm font-medium ${category.borderColor} border backdrop-blur-sm`}
          >
            {category.count} cards
          </div>
          <div className={`text-2xl font-bold ${category.textColor}`}>
            {displayPrice(category.revenue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySalesCard;
