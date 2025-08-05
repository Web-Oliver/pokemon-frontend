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
import { useTheme } from '../../../contexts/ThemeContext';

interface ShimmerProps {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className = '' }) => {
  const { config } = useTheme();
  
  // Theme-aware shimmer colors
  const shimmerColor = config.primaryColor === 'dark' 
    ? 'via-cyan-200/20' 
    : `via-${config.primaryColor}-200/20`;
    
  // Animation duration based on theme settings
  const animationDuration = config.reducedMotion ? '0s' : config.animationIntensity === 'enhanced' ? '1200ms' : '1000ms';
  
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-r from-transparent ${shimmerColor} to-transparent -translate-x-full group-hover:translate-x-full transition-transform ease-out ${className} ${config.animationIntensity === 'disabled' ? 'opacity-0' : ''}`}
      style={{
        '--shimmer-duration': animationDuration,
        transitionDuration: 'var(--shimmer-duration)',
      }}
    />
  );
};

export default Shimmer;
