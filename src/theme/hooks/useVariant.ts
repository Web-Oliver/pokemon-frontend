/**
 * VARIANT HOOK - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Component variant selection
 */

import { useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * Hook to get theme-aware variant props
 */
export function useVariant() {
  const { settings, isDark } = useTheme();
  
  return useMemo(() => {
    return {
      // Density-based variants
      getDensityVariant: () => settings.density,
      
      // Motion-based variants
      getMotionVariant: () => settings.motion,
      
      // Theme-specific variants
      getThemeVariant: (component: 'button' | 'card' | 'input') => {
        switch (settings.name) {
          case 'pokemon':
            return component === 'button' ? 'pokemon' : 'pokemon';
          case 'glass':
            return 'glass';
          case 'cosmic':
            return 'cosmic';
          default:
            return 'default';
        }
      },
      
      // Glass effect availability
      shouldUseGlass: () => settings.glassmorphismEnabled && (settings.name === 'glass' || settings.name === 'cosmic'),
      
      // Reduced motion check
      shouldReduceMotion: () => settings.reducedMotion || settings.motion === 'reduced',
      
      // High contrast check
      shouldUseHighContrast: () => settings.highContrast,
      
      // Get appropriate size variant based on density
      getSizeByDensity: (baseSize: 'sm' | 'default' | 'lg' = 'default') => {
        if (settings.density === 'compact') {
          return baseSize === 'lg' ? 'default' : baseSize === 'default' ? 'sm' : 'sm';
        }
        if (settings.density === 'spacious') {
          return baseSize === 'sm' ? 'default' : baseSize === 'default' ? 'lg' : 'lg';
        }
        return baseSize;
      },
      
      // Current theme info
      themeName: settings.name,
      themeMode: settings.mode,
      isDarkMode: isDark,
      density: settings.density,
      motion: settings.motion
    };
  }, [settings, isDark]);
}