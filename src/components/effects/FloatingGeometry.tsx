/**
 * Floating Geometry Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Extracted from CreateAuction.tsx Context7 2025 futuristic system
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for floating geometric elements
 * - OCP: Open for extension via configurable props
 * - DIP: Abstracts geometric animation implementation details
 * - DRY: Reusable geometric elements across components
 *
 * Theme-compatible: Uses theme tokens and respects animation settings
 */

import React from 'react';
import { useCentralizedTheme, themeUtils } from '../../utils/themeConfig';
import { useAnimationTheme } from '../../hooks/theme/useAnimationTheme';

export interface GeometricElement {
  type: 'square' | 'circle' | 'triangle' | 'diamond';
  size: number;
  color: string;
  position: { top: string; left?: string; right?: string; bottom?: string };
  animation: 'spin' | 'pulse' | 'bounce' | 'float';
  animationDuration?: string;
  borderOnly?: boolean;
  opacity?: number;
  glowEffect?: boolean;
}

export interface FloatingGeometryProps {
  /** Array of geometric elements to render */
  elements?: GeometricElement[];
  /** Additional CSS classes */
  className?: string;
}

const defaultElements: GeometricElement[] = [
  {
    type: 'square',
    size: 80,
    color: '#06b6d4',
    position: { top: '2rem', right: '2rem' },
    animation: 'spin',
    animationDuration: '20s',
    borderOnly: true,
    opacity: 0.4,
    glowEffect: true,
  },
  {
    type: 'circle',
    size: 64,
    color: '#a855f7',
    position: { bottom: '2rem', left: '2rem' },
    animation: 'pulse',
    opacity: 0.4,
    borderOnly: true,
    glowEffect: true,
  },
];

const FloatingGeometry: React.FC<FloatingGeometryProps> = ({
  elements = defaultElements,
  className = '',
}) => {
  const themeConfig = useCentralizedTheme();
  const { animationIntensity } = useAnimationTheme();

  // Respect animation settings
  if (themeUtils.shouldDisableAnimations(themeConfig)) {
    return null;
  }

  const getAnimationClass = (animation: string, duration?: string) => {
    const baseClass = `animate-${animation}`;
    const intensityMultiplier = {
      subtle: 0.5,
      normal: 1,
      enhanced: 1.5,
      disabled: 0,
    }[animationIntensity];

    return {
      className: baseClass,
      style: duration
        ? {
            animationDuration: `${parseFloat(duration) * (1 / intensityMultiplier)}s`,
          }
        : undefined,
    };
  };

  const getShapeClasses = (element: GeometricElement) => {
    const baseClasses = 'absolute border-2 transition-all duration-500';

    switch (element.type) {
      case 'square':
        return `${baseClasses} ${element.borderOnly ? '' : 'bg-current'} transform rotate-45`;
      case 'circle':
        return `${baseClasses} ${element.borderOnly ? '' : 'bg-current'} rounded-full`;
      case 'diamond':
        return `${baseClasses} ${element.borderOnly ? '' : 'bg-current'} transform rotate-45`;
      case 'triangle':
        return `${baseClasses} ${element.borderOnly ? '' : 'bg-current'} transform rotate-12`;
      default:
        return baseClasses;
    }
  };

  const getShadowStyle = (element: GeometricElement) => {
    if (!element.glowEffect) {
      return {};
    }

    return {
      boxShadow: `0 0 20px rgba(${hexToRgb(element.color)}, 0.3)`,
    };
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {elements.map((element, index) => {
        const animation = getAnimationClass(
          element.animation,
          element.animationDuration
        );

        return (
          <div
            key={index}
            className={`${getShapeClasses(element)} ${animation.className}`}
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              color: element.color,
              borderColor: element.color,
              opacity: element.opacity || 1,
              ...element.position,
              ...getShadowStyle(element),
              ...animation.style,
            }}
          />
        );
      })}
    </div>
  );
};

// Utility function to convert hex to RGB values
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '6, 182, 212'; // Default cyan color
}

export default FloatingGeometry;
