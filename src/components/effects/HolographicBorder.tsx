/**
 * Holographic Border Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for holographic border effects
 * - OCP: Open for extension via intensity and timing props
 * - DIP: Uses Layer 1 utilities for effect generation
 * - DRY: Abstracts holographic border pattern from multiple components
 *
 * Extracted from border-holographic pattern across DBA components
 */

import React from 'react';
import { cn } from '../../utils/common';

export interface HolographicBorderProps {
  /** Child components to wrap with holographic border */
  children: React.ReactNode;
  /** Border intensity (0-1) */
  intensity?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Border color theme */
  colorTheme?: 'cyan' | 'purple' | 'gradient' | 'cosmic';
  /** Border width */
  borderWidth?: 'thin' | 'medium' | 'thick';
  /** Additional CSS classes */
  className?: string;
  /** Whether border is always visible or only on hover */
  showOnHover?: boolean;
}

const HolographicBorder: React.FC<HolographicBorderProps> = ({
  children,
  intensity = 0.3,
  duration = 2,
  colorTheme = 'cyan',
  borderWidth = 'medium',
  className = '',
  showOnHover = true,
}) => {
  const getColorStyles = (theme: string) => {
    const colors = {
      cyan: `rgba(6, 182, 212, ${intensity})`,
      purple: `rgba(168, 85, 247, ${intensity})`,
      gradient: `linear-gradient(90deg, transparent, rgba(6, 182, 212, ${intensity}), rgba(168, 85, 247, ${intensity}), transparent)`,
      cosmic: `linear-gradient(90deg, transparent, rgba(6, 182, 212, ${intensity}), rgba(139, 92, 246, ${intensity}), rgba(236, 72, 153, ${intensity}), transparent)`,
    };
    return colors[theme as keyof typeof colors] || colors.cyan;
  };

  const getBorderWidthClass = (width: string) => {
    const widths = {
      thin: 'before:border',
      medium: 'before:border-2',
      thick: 'before:border-4',
    };
    return widths[width as keyof typeof widths] || widths.medium;
  };

  const borderColor = getColorStyles(colorTheme);

  return (
    <div
      className={cn(
        'relative',
        getBorderWidthClass(borderWidth),
        'before:content-[""] before:absolute before:inset-0 before:rounded-inherit before:opacity-0 before:transition-opacity before:ease-in-out before:animate-pulse',
        showOnHover ? 'hover:before:opacity-100' : 'before:opacity-100',
        className
      )}
      style={
        {
          '--holographic-border-color': borderColor,
          '--holographic-duration': `${duration}s`,
        } as React.CSSProperties & Record<string, string>
      }
    >
      {children}
    </div>
  );
};

export default HolographicBorder;
