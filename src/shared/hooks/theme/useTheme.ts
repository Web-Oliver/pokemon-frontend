/**
 * THEME HOOK - DESIGN SYSTEM
 * Professional naming following Carbon Design System conventions
 * Based on Context7 analysis
 */

import { useTheme as useDesignSystemTheme } from '../../../theme/ThemeProvider';

/**
 * Main theme hook for the application
 * Uses clean, professional design system
 */
export const useTheme = () => {
  const theme = useDesignSystemTheme();
  
  // Provide clean API for components
  return {
    // Current theme info
    colorScheme: theme.settings.colorScheme,
    visualTheme: theme.resolvedTheme,
    density: theme.settings.density,
    resolvedTheme: theme.resolvedTheme,
    
    // Computed properties
    isDarkMode: theme.resolvedTheme !== 'white',
    isLightMode: theme.resolvedTheme === 'white',
    isSystemMode: theme.settings.colorScheme === 'system',
    isGlassTheme: theme.isGlassTheme,
    
    // Theme setters
    setColorScheme: theme.setColorScheme,
    setTheme: theme.setTheme,
    setDensity: theme.setDensity,
    setAnimationLevel: theme.setAnimationLevel,
    
    // Glass and animation controls
    setGlassmorphismEnabled: theme.setGlassmorphismEnabled,
    setAnimationsEnabled: theme.setAnimationsEnabled,
    setParticleEffectsEnabled: theme.setParticleEffectsEnabled,
    setReduceMotion: theme.setReduceMotion,
    
    // Utilities
    resetToDefaults: theme.resetToDefaults,
    isLoaded: theme.isLoaded,
  };
};

/**
 * Simplified theme hook for components that only need basic theme info
 * @deprecated Use useThemeSettings from new theme system
 */
export const useThemeInfo = () => {
  const { settings, resolvedTheme } = useNewTheme();
  
  return {
    colorScheme: settings.colorScheme,
    visualTheme: settings.theme,
    density: settings.density,
    isDarkMode: resolvedTheme !== 'light',
    isLightMode: resolvedTheme === 'light',
  };
};

// Default export
export default useTheme;