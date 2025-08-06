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
import { PokemonCard } from '../design-system/PokemonCard';
import { displayPrice } from '../../utils/formatting';

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
  return (
    <PokemonCard
      cardType="metric"
      variant="glass"
      size="md"
      title={category.displayName}
      value={category.count}
      subtitle={`Total Revenue: $${category.totalRevenue.toFixed(2)}`}
      colorScheme="success"
      className={className}
    />
  );
};

export default CategorySalesCard;