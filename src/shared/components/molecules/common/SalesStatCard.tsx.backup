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
  icon: Icon,
  emoji,
  colorScheme,
  badgeText,
  className = '',
}) => {
  return (
    <div
      className={`card-premium bg-[var(--theme-surface)] border-[var(--theme-border)] rounded-xl p-6 h-48 group float-gentle ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${colorScheme.iconBg} rounded-xl flex items-center justify-center border ${colorScheme.iconBorder} backdrop-blur-sm ${Icon ? 'glow-on-hover' : ''}`}
        >
          {Icon ? (
            <Icon className="w-6 h-6 text-cyan-300" />
          ) : (
            <span className="text-xl">{emoji}</span>
          )}
        </div>
        <div className="text-right">
          <div className={`text-sm ${colorScheme.titleColor} font-medium mb-1`}>
            {title}
          </div>
          <div className="text-4xl font-bold text-[var(--theme-text-primary)]">
            {value}
          </div>
        </div>
      </div>
      <div className="h-2 bg-gradient-to-r from-zinc-700/30 to-zinc-600/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className={`h-full bg-gradient-to-r ${colorScheme.progressGradient} rounded-full w-full shimmer`}
        ></div>
      </div>
      <div className="mt-4 text-center">
        <span
          className={`inline-flex items-center px-3 py-1 ${colorScheme.badgeColors} rounded-full text-sm font-medium border backdrop-blur-sm`}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
};

export default SalesStatCard;
