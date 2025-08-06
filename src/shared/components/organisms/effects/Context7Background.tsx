/**
 * Context7 Premium Background Pattern Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Reusable Context7 premium background pattern used throughout the application.
 * Eliminates code duplication and follows DRY principles.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Provides premium background pattern
 * - DRY: Eliminates repeated background pattern code
 * - Reusability: Used across PageLayout, AuctionDetail, and other components
 * - Not Over-Engineered: Simple, focused component
 */

import React from 'react';

export interface Context7BackgroundProps {
  /** Opacity level for the background pattern */
  opacity?: number;
  /** Custom className for the container */
  className?: string;
  /** Color variant for the pattern */
  color?: 'default' | 'purple' | 'cyan' | 'emerald' | 'rose';
  /** Whether to animate the pattern */
  animated?: boolean;
}

const Context7Background: React.FC<Context7BackgroundProps> = ({
  opacity = 0.3,
  className = '',
  color = 'default',
  animated = false,
}) => {
  // Color configurations for different variants
  const colorConfigs = {
    default: '%236366f1', // indigo-500
    purple: '%23a855f7', // purple-500
    cyan: '%2306b6d4', // cyan-500
    emerald: '%2310b981', // emerald-500
    rose: '%23f43f5e', // rose-500
  };

  const selectedColor = colorConfigs[color];

  // Generate the SVG data URL for the pattern
  const backgroundImageUrl = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${selectedColor}' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className={`absolute inset-0 ${className}`} style={{ opacity }}>
      <div
        className={`w-full h-full ${animated ? 'animate-pulse' : ''}`}
        style={{
          backgroundImage: backgroundImageUrl,
        }}
      />
    </div>
  );
};

export default Context7Background;
