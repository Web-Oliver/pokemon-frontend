/**
 * Composite Theme Hook
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 3
 *
 * Composite hook that aggregates all focused theme hooks
 * Maintains backward compatibility with existing useTheme interface
 * Enables gradual migration path for components
 */

import { useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import {
  ThemeContextType,
  ThemeConfiguration,
  ColorScheme,
  ThemeColor,
} from '../../contexts/ThemeContext';
import { useVisualTheme } from './useVisualTheme';
import { useLayoutTheme } from './useLayoutTheme';
import { useAnimationTheme } from './useAnimationTheme';
import { useAccessibilityTheme } from './useAccessibilityTheme';
import { useThemeStorage } from './useThemeStorage';
import { formThemes } from '../../../theme/formThemes';

/**
 * Composite Theme Hook
 * Aggregates all focused theme hooks into a single interface
 * Maintains backward compatibility with the original monolithic useTheme
 */
export const useTheme = (): ThemeContextType => {
  // Get focused theme contexts
  const visualTheme = useVisualTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationTheme();
  const accessibilityTheme = useAccessibilityTheme();
  const themeStorage = useThemeStorage();

  // Get next-themes context for color scheme management
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme();

  // Build composite configuration object
  const config: ThemeConfiguration = {
    // Visual settings
    visualTheme: visualTheme.visualTheme,
    glassmorphismIntensity: visualTheme.glassmorphismIntensity,
    particleEffectsEnabled: visualTheme.particleEffectsEnabled,

    // Layout settings
    density: layoutTheme.density,

    // Animation settings
    animationIntensity: animationTheme.animationIntensity,

    // Accessibility settings
    highContrast: accessibilityTheme.highContrast,
    reducedMotion: accessibilityTheme.reducedMotion,

    // Default values for properties not yet decomposed
    colorScheme: 'system' as ColorScheme,
    primaryColor: 'dark' as ThemeColor,
  };

  // Color scheme management (simplified for backward compatibility)
  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setNextTheme(scheme);
    },
    [setNextTheme]
  );

  // Primary color management (simplified for backward compatibility)
  const setPrimaryColor = useCallback((color: ThemeColor) => {
    // This would need to be handled by a color theme provider in a complete implementation
    console.warn('setPrimaryColor not yet implemented in decomposed context');
  }, []);

  // Utility functions that combine multiple focused contexts
  const getThemeClasses = useCallback((): string => {
    const classes = [
      `theme-${visualTheme.visualTheme}`,
      layoutTheme.getDensityClasses(),
      animationTheme.getAnimationClasses(),
      accessibilityTheme.getAccessibilityClasses(),
    ];

    if (!visualTheme.particleEffectsEnabled) {
      classes.push('no-particles');
    }

    return classes.join(' ');
  }, [visualTheme, layoutTheme, animationTheme, accessibilityTheme]);

  const getCSSProperties = useCallback((): Record<string, string> => {
    const formTheme = formThemes[config.primaryColor];
    const densityMultiplier = layoutTheme.getDensityMultiplier();
    const animationDurations = animationTheme.getAnimationDurations();
    const animationDelays = animationTheme.getAnimationDelays();
    const complexDurations = animationTheme.getComplexAnimationDurations();
    const spacingTokens = layoutTheme.getSpacingTokens();

    const properties: Record<string, string> = {
      // Form theme properties
      '--theme-primary-gradient': formTheme.button.primary.replace(
        'bg-gradient-to-r ',
        ''
      ),
      '--theme-primary-hover': formTheme.button.primaryHover.replace(
        'hover:',
        ''
      ),
      '--theme-header-background': formTheme.header.background,
      '--theme-border-color': formTheme.element.border,
      '--theme-focus-ring': formTheme.element.focus,

      // Density properties
      '--density-multiplier': densityMultiplier.toString(),
      '--density-spacing-xs': spacingTokens.xs,
      '--density-spacing-sm': spacingTokens.sm,
      '--density-spacing-md': spacingTokens.md,
      '--density-spacing-lg': spacingTokens.lg,
      '--density-spacing-xl': spacingTokens.xl,

      // Animation properties
      '--animation-duration-fast': animationDurations.fast,
      '--animation-duration-normal': animationDurations.normal,
      '--animation-duration-slow': animationDurations.slow,
      '--animation-delay-short': animationDelays.short,
      '--animation-delay-medium': animationDelays.medium,
      '--animation-delay-long': animationDelays.long,
      '--animation-duration-orbit': complexDurations.orbit,
      '--animation-duration-particle': complexDurations.particle,

      // Visual properties
      '--glass-alpha': (visualTheme.glassmorphismIntensity / 100).toString(),
      '--glass-blur': `${visualTheme.glassmorphismIntensity / 5}px`,
    };

    // Override animation durations if reduced motion is enabled
    if (accessibilityTheme.reducedMotion) {
      properties['--animation-duration-fast'] = '0s';
      properties['--animation-duration-normal'] = '0s';
      properties['--animation-duration-slow'] = '0s';
    }

    return properties;
  }, [config, visualTheme, layoutTheme, animationTheme, accessibilityTheme]);

  // System theme utilities
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  const resetToDefaults = useCallback(() => {
    // Reset all focused contexts to defaults
    visualTheme.setVisualTheme('context7-premium');
    visualTheme.setGlassmorphismIntensity(80);
    if (visualTheme.particleEffectsEnabled !== true) {
      visualTheme.toggleParticleEffects();
    }

    layoutTheme.setDensity('comfortable');
    animationTheme.setAnimationIntensity('normal');

    if (accessibilityTheme.highContrast) {
      accessibilityTheme.toggleHighContrast();
    }
    if (accessibilityTheme.reducedMotion) {
      accessibilityTheme.toggleReducedMotion();
    }

    setNextTheme('system');
  }, [
    visualTheme,
    layoutTheme,
    animationTheme,
    accessibilityTheme,
    setNextTheme,
  ]);

  // Build complete ThemeContextType interface for backward compatibility
  const contextValue: ThemeContextType = {
    // Current Configuration
    config,
    resolvedTheme: (resolvedTheme as 'light' | 'dark') || 'dark',

    // Theme Management (delegated to focused providers)
    setVisualTheme: visualTheme.setVisualTheme,
    setColorScheme,
    setDensity: layoutTheme.setDensity,
    setAnimationIntensity: animationTheme.setAnimationIntensity,
    setPrimaryColor,

    // Accessibility (delegated to accessibility provider)
    toggleHighContrast: accessibilityTheme.toggleHighContrast,
    toggleReducedMotion: accessibilityTheme.toggleReducedMotion,

    // Advanced Configuration (delegated to visual provider)
    setGlassmorphismIntensity: visualTheme.setGlassmorphismIntensity,
    toggleParticleEffects: visualTheme.toggleParticleEffects,
    setCustomProperties: () =>
      console.warn(
        'setCustomProperties not yet implemented in decomposed context'
      ),

    // Preset Management (delegated to visual and storage providers)
    applyPreset: visualTheme.applyPreset,
    saveCustomPreset: themeStorage.saveCustomPreset,
    loadCustomPreset: async (name: string) => {
      const config = await themeStorage.loadCustomPreset(name);
      if (config) {
        // Apply loaded configuration to all providers
        // This would need more sophisticated coordination in a complete implementation
        console.warn('loadCustomPreset partial implementation');
      }
    },
    resetToDefaults,

    // Utility Functions (composed from focused providers)
    getThemeClasses,
    getCSSProperties,
    isThemeLoaded: true, // Simplified for now

    // System Integration
    getSystemPreference,
    isSystemTheme: config.colorScheme === 'system',
  };

  return contextValue;
};
