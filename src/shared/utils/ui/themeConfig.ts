/**
 * THEME CONFIGURATION - DESIGN SYSTEM
 * Professional implementation following Carbon Design System patterns
 * Based on Context7 analysis of industry best practices
 */

import { useTheme } from '../../hooks/theme/useTheme';

export interface ThemeConfig {
  // Visual settings
  visualTheme: string;
  particleEffectsEnabled: boolean;
  glassmorphismIntensity: number;

  // Layout settings
  density: string;

  // Animation settings
  animationLevel: string;

  // Accessibility settings
  highContrast: boolean;
  reducedMotion: boolean;
}

/**
 * Theme configuration hook
 * Aggregates all theme settings following Carbon patterns
 */
export const useThemeConfig = (): ThemeConfig => {
  const theme = useTheme();

  return {
    visualTheme: theme.visualTheme || 'g100',
    particleEffectsEnabled: true,
    glassmorphismIntensity: 0.8,
    density: theme.density || 'comfortable',
    animationLevel: 'normal',
    highContrast: false,
    reducedMotion: false,
  };
};

// Legacy export for backward compatibility
export const useCentralizedTheme = useThemeConfig;
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
