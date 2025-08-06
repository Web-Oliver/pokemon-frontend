/**
 * Context7 Design System Styling Utilities
 * Extracted from imageProcessing.ts and cosmicEffects.ts
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles Context7 design system styling
 * - Open/Closed: Extensible for new Context7 patterns
 * - DRY: Centralized Context7 styling logic
 * - Reusability: Context7 styles used across components
 */

import React from 'react';
import { ImageAspectInfo, ResponsiveImageConfig } from '../utils/file/imageProcessing';

// ================================
// CONTEXT7 CONTAINER UTILITIES
// ================================

/**
 * Context7 premium container classes for different orientations
 * Optimized for glassmorphism design system
 */
export const getContext7ContainerClasses = (
  orientation: ImageAspectInfo['orientation']
): string => {
  const baseClasses =
    'relative overflow-hidden rounded-3xl backdrop-blur-theme border border-glass-border-light shadow-glass-main group transition-all duration-theme-normal';

  const orientationClasses = {
    landscape:
      'aspect-[4/3] hover:shadow-theme-hover hover:scale-102 hover:border-glass-border-medium',
    portrait:
      'aspect-[3/4] hover:shadow-theme-hover hover:scale-105 hover:border-glass-border-medium',
    square:
      'aspect-square hover:shadow-theme-hover hover:scale-103 hover:border-glass-border-medium',
  };

  return `${baseClasses} ${orientationClasses[orientation]}`;
};

/**
 * Context7 premium image classes with object-fit optimization
 * Standard for better vertical and horizontal image handling
 */
export const getContext7ImageClasses = (
  config: ResponsiveImageConfig,
  withHoverEffects: boolean = true
): string => {
  const baseClasses = 'w-full h-full object-cover transition-all duration-theme-normal';
  const hoverClasses = withHoverEffects
    ? 'group-hover:scale-110 group-hover:brightness-110'
    : '';

  const orientationClasses = {
    landscape: 'object-center',
    portrait: 'object-center object-top',
    square: 'object-center',
  };

  return `${baseClasses} ${hoverClasses} ${orientationClasses[config.orientation]}`;
};

// ================================
// CONTEXT7 VISUAL EFFECTS
// ================================

/**
 * Context7 premium glass overlay effects
 * Creates depth and premium feel for card components
 */
export const getContext7GlassOverlay = (
  orientation: ImageAspectInfo['orientation']
): string => {
  switch (orientation) {
    case 'landscape':
      return 'absolute inset-0 bg-gradient-to-br from-glass-primary/30 via-transparent to-glass-secondary/20 pointer-events-none';
    case 'portrait':
      return 'absolute inset-0 bg-gradient-to-b from-glass-primary/20 via-transparent to-glass-secondary/30 pointer-events-none';
    case 'square':
      return 'absolute inset-0 bg-gradient-to-br from-glass-primary/25 via-transparent to-glass-secondary/25 pointer-events-none';
    default:
      return 'absolute inset-0 bg-gradient-to-br from-glass-primary/25 via-transparent to-glass-secondary/25 pointer-events-none';
  }
};

/**
 * Context7 premium shimmer effect for loading states
 * Provides visual feedback during content loading
 */
export const getContext7ShimmerEffect = (): string => {
  return 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none';
};

/**
 * Context7 holographic border animation styles
 * Premium holographic effects for special components
 */
export const getContext7HolographicBorderStyles = (
  intensity: number = 0.3,
  duration: number = 2
): React.CSSProperties => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: `linear-gradient(45deg, 
      hsl(280, 100%, 70%), 
      hsl(320, 100%, 70%), 
      hsl(200, 100%, 70%), 
      hsl(280, 100%, 70%)
    )`,
    backgroundSize: '300% 300%',
    animation: `holographic-border ${duration}s ease-in-out infinite`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'xor',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    opacity: intensity,
  },
});

// ================================
// CONTEXT7 THEME INTEGRATION
// ================================

/**
 * Context7 responsive grid classes
 * Optimized for different screen sizes and orientations
 */
export const getContext7GridClasses = (itemCount: number): string => {
  if (itemCount === 1) {
    return 'grid-cols-1';
  } else if (itemCount === 2) {
    return 'grid-cols-1 md:grid-cols-2';
  } else if (itemCount <= 4) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
  } else if (itemCount <= 6) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  } else {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }
};

/**
 * Context7 spacing classes based on density
 * Provides consistent spacing across Context7 components
 */
export const getContext7SpacingClasses = (
  density: 'compact' | 'normal' | 'spacious' = 'normal'
): string => {
  const spacingMap = {
    compact: 'gap-3 p-3',
    normal: 'gap-4 p-4',
    spacious: 'gap-6 p-6',
  };

  return spacingMap[density];
};

/**
 * Context7 animation classes for premium interactions
 * Consistent animation patterns across Context7 design system
 */
export const getContext7AnimationClasses = (
  type: 'hover' | 'focus' | 'loading' = 'hover'
): string => {
  const animationMap = {
    hover: 'transition-all duration-theme-normal hover:scale-102 hover:shadow-theme-hover',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50 focus-visible:ring-offset-2',
    loading: 'animate-pulse',
  };

  return animationMap[type];
};

// ================================
// CONTEXT7 KEYFRAMES & ANIMATIONS
// ================================

/**
 * Context7 CSS keyframes for holographic effects
 * Can be injected into CSS or used with CSS-in-JS
 */
export const context7Keyframes = `
  @keyframes holographic-border {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes glass-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
    50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.2); }
  }
`;

export default {
  getContext7ContainerClasses,
  getContext7ImageClasses,
  getContext7GlassOverlay,
  getContext7ShimmerEffect,
  getContext7HolographicBorderStyles,
  getContext7GridClasses,
  getContext7SpacingClasses,
  getContext7AnimationClasses,
  context7Keyframes,
};