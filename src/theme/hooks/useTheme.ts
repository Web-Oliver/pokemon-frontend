/**
 * THEME MANAGEMENT HOOK - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Main theme management hook
 *
 * Following THEME_ARCHITECTURE_DESIGN.md specifications:
 * - Theme switching functionality
 * - CSS variable generation and application
 * - Performance optimization with memoization
 * - Accessibility compliance
 */

import { useContext, useMemo, useCallback, useEffect } from 'react';
import { ThemeContext } from '../../contexts/theme-context';
import { generateCSSVariables, applyCSSVariables, applyCompleteTheme } from '../generator';
import { themeDefinitions, type ThemeName, type ThemeMode, type DensityMode, type MotionMode, type ThemeSettings } from '../themes';

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { settings, updateSettings } = context;

  // Memoize theme configuration
  const currentTheme = useMemo(() => {
    const resolvedMode = settings.mode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.mode;

    return themeDefinitions[settings.name][resolvedMode];
  }, [settings.name, settings.mode]);

  // Memoize CSS variables
  const cssVariables = useMemo(() => {
    return generateCSSVariables(currentTheme, settings.density, settings.motion);
  }, [currentTheme, settings.density, settings.motion]);

  // Apply theme changes
  const applyTheme = useCallback(() => {
    applyCompleteTheme(settings);
  }, [settings]);

  // Apply theme on settings change
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme();
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.mode, applyTheme]);

  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      if (mediaQuery.matches && !settings.reducedMotion) {
        updateSettings({ reducedMotion: true });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.reducedMotion, updateSettings]);

  return {
    // Settings
    settings,
    updateSettings,
    
    // Theme data
    currentTheme,
    cssVariables,
    
    // Actions
    applyTheme,
    
    // Convenience getters
    isDark: settings.mode === 'dark' || 
            (settings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isLight: settings.mode === 'light' || 
             (settings.mode === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches),
    isSystem: settings.mode === 'system',
    isGlassmorphismEnabled: settings.glassmorphismEnabled,
    isReducedMotion: settings.reducedMotion,
    isHighContrast: settings.highContrast,

    // Theme switching methods
    setTheme: useCallback((name: ThemeName) => updateSettings({ name }), [updateSettings]),
    setMode: useCallback((mode: ThemeMode) => updateSettings({ mode }), [updateSettings]),
    setDensity: useCallback((density: DensityMode) => updateSettings({ density }), [updateSettings]),
    setMotion: useCallback((motion: MotionMode) => updateSettings({ motion }), [updateSettings]),
    toggleGlassmorphism: useCallback(() => updateSettings({ glassmorphismEnabled: !settings.glassmorphismEnabled }), [settings.glassmorphismEnabled, updateSettings]),
    toggleReducedMotion: useCallback(() => updateSettings({ reducedMotion: !settings.reducedMotion }), [settings.reducedMotion, updateSettings]),
    toggleHighContrast: useCallback(() => updateSettings({ highContrast: !settings.highContrast }), [settings.highContrast, updateSettings]),
    toggleMode: useCallback(() => {
      const newMode = settings.mode === 'light' ? 'dark' : settings.mode === 'dark' ? 'system' : 'light';
      updateSettings({ mode: newMode });
    }, [settings.mode, updateSettings])
  };
}