/**
 * Centralized Theme Configuration
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * Single source of truth for theme configuration across all components
 * Following SOLID principles:
 * - SRP: Single responsibility for theme configuration aggregation
 * - DRY: Eliminates duplicate theme hook usage across components
 * - DIP: Provides abstraction layer for theme access
 */

import {
  useVisualTheme,
  useLayoutTheme,
  useAnimationTheme,
  useAccessibilityTheme,
} from '../../contexts/theme';

export interface CentralizedThemeConfig {
  // Visual settings
  visualTheme: string;
  particleEffectsEnabled: boolean;
  glassmorphismIntensity: number;

  // Layout settings
  density: string;

  // Animation settings
  animationIntensity: string;

  // Accessibility settings
  highContrast: boolean;
  reducedMotion: boolean;
}

/**
 * Centralized Theme Hook
 * Single hook that aggregates all theme settings
 * Use this instead of importing individual theme hooks
 */
export const useCentralizedTheme = (): CentralizedThemeConfig => {
  const { visualTheme, particleEffectsEnabled, glassmorphismIntensity } =
    useVisualTheme();
  const { density } = useLayoutTheme();
  const { animationIntensity } = useAnimationTheme();
  const { highContrast, reducedMotion } = useAccessibilityTheme();

  return {
    visualTheme,
    particleEffectsEnabled,
    glassmorphismIntensity,
    density,
    animationIntensity,
    highContrast,
    reducedMotion,
  };
};

/**
 * Theme Configuration Utilities
 * Helper functions for common theme checks
 */
export const themeUtils = {
  // Check if animations should be disabled
  shouldDisableAnimations: (config: CentralizedThemeConfig): boolean => {
    return config.animationIntensity === 'disabled' || config.reducedMotion;
  },

  // Check if particles should be shown
  shouldShowParticles: (config: CentralizedThemeConfig): boolean => {
    return config.particleEffectsEnabled && !config.reducedMotion;
  },

  // Get adjusted opacity based on glassmorphism intensity
  getAdjustedOpacity: (
    config: CentralizedThemeConfig,
    baseOpacity: number
  ): number => {
    return baseOpacity * (config.glassmorphismIntensity / 100);
  },

  // Check if high contrast mode is active
  isHighContrast: (config: CentralizedThemeConfig): boolean => {
    return config.highContrast;
  },
};
