/**
 * Dashboard Icon Component - Layer 3: Components (UI Building Blocks)
 * Following CLAUDE.md SOLID principles:
 * 
 * Single Responsibility Principle (SRP): 
 * - Only responsible for rendering dashboard stat card icons with improved visibility
 * 
 * Open/Closed Principle (OCP):
 * - Open for extension through variant and styling props
 * - Closed for modification of core icon rendering logic
 * 
 * Liskov Substitution Principle (LSP):
 * - Can replace any standard icon component without breaking functionality
 * 
 * Interface Segregation Principle (ISP):
 * - Provides focused interface for dashboard icon display
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on LucideIcon abstraction, not concrete implementations
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconGlassmorphism } from '../../organisms/effects/GlassmorphismContainer';

/**
 * Dashboard icon configuration following Open/Closed Principle
 */
export interface DashboardIconConfig {
  size: number;
  glowIntensity: 'subtle' | 'medium' | 'intense';
  backgroundBlur: boolean;
  pulseAnimation: boolean;
  innerGlow: boolean;
}

/**
 * Dashboard icon props interface following Interface Segregation Principle
 */
export interface DashboardIconProps {
  /** The Lucide icon component to render */
  icon: LucideIcon;
  
  /** Size variant for consistent scaling */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color scheme for theming */
  colorScheme?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  
  /** Visual intensity level */
  intensity?: 'minimal' | 'standard' | 'premium';
  
  /** Optional custom configuration */
  config?: Partial<DashboardIconConfig>;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Icon size configurations following Single Responsibility Principle
 */
const SIZE_CONFIGS: Record<string, DashboardIconConfig> = {
  sm: {
    size: 24,
    glowIntensity: 'subtle',
    backgroundBlur: false,
    pulseAnimation: false,
    innerGlow: false,
  },
  md: {
    size: 32,
    glowIntensity: 'medium',
    backgroundBlur: true,
    pulseAnimation: false,
    innerGlow: true,
  },
  lg: {
    size: 40,
    glowIntensity: 'intense',
    backgroundBlur: true,
    pulseAnimation: true,
    innerGlow: true,
  },
  xl: {
    size: 48,
    glowIntensity: 'intense',
    backgroundBlur: true,
    pulseAnimation: true,
    innerGlow: true,
  },
};

/**
 * Visual intensity level configurations following Open/Closed Principle
 */
const INTENSITY_CONFIGS: Record<string, Partial<DashboardIconConfig>> = {
  minimal: {
    glowIntensity: 'subtle',
    backgroundBlur: false,
    pulseAnimation: false,
    innerGlow: false,
  },
  standard: {
    glowIntensity: 'medium',
    backgroundBlur: true,
    pulseAnimation: false,
    innerGlow: true,
  },
  premium: {
    glowIntensity: 'intense',
    backgroundBlur: true,
    pulseAnimation: true,
    innerGlow: true,
  },
};

/**
 * Dashboard Icon Component
 * Provides improved visibility and visual appeal for dashboard stat cards
 */
export const DashboardIcon: React.FC<DashboardIconProps> = ({
  icon: Icon,
  size = 'md',
  colorScheme = 'primary',
  intensity = 'standard',
  config = {},
  className = '',
  style = {},
}) => {
  // Merge configurations following Dependency Inversion Principle
  const baseConfig = SIZE_CONFIGS[size];
  const intensityConfig = INTENSITY_CONFIGS[intensity];
  const finalConfig: DashboardIconConfig = {
    ...baseConfig,
    ...intensityConfig,
    ...config,
  };

  // Calculate container dimensions
  const containerSize = Math.round(finalConfig.size * 1.2);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Background glow effect - conditionally rendered following SRP */}
      {finalConfig.backgroundBlur && (
        <div 
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--theme-accent-primary)]/30 to-[var(--theme-accent-secondary)]/20 blur-xl ${finalConfig.pulseAnimation ? 'animate-pulse' : ''}`}
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`,
          }}
        />
      )}
      
      {/* Icon container with glassmorphism effect */}
      <IconGlassmorphism
        variant="premium"
        colorScheme={colorScheme}
        className={`relative flex items-center justify-center`}
        style={{
          width: `${containerSize}px`,
          height: `${containerSize}px`,
        }}
      >
        {/* Enhanced icon with multiple glow effects */}
        <Icon
          size={finalConfig.size}
          className="relative z-10 text-white drop-shadow-2xl"
          style={{
            filter: `drop-shadow(0 0 ${getGlowRadius(finalConfig.glowIntensity)}px var(--theme-accent-primary)) drop-shadow(0 0 ${getGlowRadius(finalConfig.glowIntensity) * 0.6}px currentColor)`,
            textShadow: '0 0 20px currentColor',
          }}
        />
        
        {/* Inner glow overlay - conditionally rendered following SRP */}
        {finalConfig.innerGlow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
        )}
      </IconGlassmorphism>
    </div>
  );
};

/**
 * Helper function for glow radius calculation following Single Responsibility Principle
 */
const getGlowRadius = (intensity: DashboardIconConfig['glowIntensity']): number => {
  switch (intensity) {
    case 'subtle':
      return 15;
    case 'medium':
      return 25;
    case 'intense':
      return 35;
    default:
      return 25;
  }
};

/**
 * Specialized stat card icon component following Liskov Substitution Principle
 * Optimized for dashboard stat cards with premium visual effects
 */
export const StatCardIcon: React.FC<Omit<DashboardIconProps, 'size' | 'intensity'>> = (props) => (
  <DashboardIcon
    {...props}
    size="lg"
    intensity="premium"
  />
);

export default DashboardIcon;