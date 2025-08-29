/**
 * Shimmer - Reusable shimmer effect component
 * Eliminates duplicate shimmer animations across Button and other components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized shimmer animation
 * - Consistent micro-interaction patterns
 * - Reusable across interactive elements
 * - Theme-aware styling and animations
 */

import React from 'react';
// themeConfig import removed

interface ShimmerProps {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className = '' }) => {
  // const themeConfig = useCentralizedTheme(); // Removed

  // Simplified shimmer with fallback values
  const shimmerColor = 'via-cyan-200/20';
  const animationDuration = '1000ms';

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-r from-transparent ${shimmerColor} to-transparent animate-shimmer pointer-events-none ${className}`}
      style={{
        '--shimmer-duration': animationDuration,
        transitionDuration: 'var(--shimmer-duration)',
      }}
    />
  );
};

export default Shimmer;
