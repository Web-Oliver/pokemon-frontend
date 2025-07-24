/**
 * PremiumShimmer - Reusable shimmer effect component
 * Eliminates duplicate shimmer animations across Button and other components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized shimmer animation
 * - Consistent micro-interaction patterns
 * - Reusable across interactive elements
 */

import React from 'react';

interface PremiumShimmerProps {
  className?: string;
}

export const PremiumShimmer: React.FC<PremiumShimmerProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out ${className}`}
    />
  );
};

export default PremiumShimmer;
