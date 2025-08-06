/**
 * SalesStatCard Component - DRY Violation Fix
 *
 * Reusable sales statistics card component extracted from SalesAnalytics.tsx
 * to prevent JSX duplication for key metrics cards (Total Cards Sold, Total Revenue).
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles one type of sales statistical display
 * - DRY: Eliminates repeated sales statistics card JSX structures
 * - Reusability: Can be used across different sales analytics displays
 * - Design System Integration: Uses consistent styling patterns
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonCard } from '../design-system/PokemonCard';

interface SalesStatCardProps {
  /** Display title of the statistic */
  title: string;
  /** Numerical or text value to display */
  value: string | number;
  /** Icon component to display (optional, uses emoji if not provided) */
  icon?: LucideIcon;
  /** Emoji to display (used if icon not provided) */
  emoji?: string;
  /** Color scheme configuration */
  colorScheme: {
    /** Gradient background classes for icon container (e.g., "from-emerald-500/20 to-cyan-500/20") */
    iconBg: string;
    /** Border color for icon container (e.g., "border-emerald-400/30") */
    iconBorder: string;
    /** Text color for title (e.g., "text-emerald-400") */
    titleColor: string;
    /** Gradient classes for progress bar (e.g., "from-emerald-400 to-cyan-400") */
    progressGradient: string;
    /** Background and border classes for badge (e.g., "bg-emerald-500/20 text-emerald-300 border-emerald-400/30") */
    badgeColors: string;
  };
  /** Display text for the bottom badge */
  badgeText: string;
  /** Additional CSS classes */
  className?: string;
}

const SalesStatCard: React.FC<SalesStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  colorScheme = 'primary',
  onClick,
  className = '',
}) => {
  return (
    <PokemonCard
      cardType="metric"
      variant="glass"
      size="md"
      title={title}
      value={value}
      icon={Icon}
      subtitle={subtitle || trendLabel}
      colorScheme={colorScheme}
      onClick={onClick}
      interactive={!!onClick}
      className={className}
    />
  );
};

export default SalesStatCard;