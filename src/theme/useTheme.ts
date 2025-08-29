/**
 * UNIFIED THEME HOOKS
 * Single source of truth for all theme-related hooks
 * Provides convenient access to theme functionality
 */

import { useContext, createContext } from 'react';
import { 
  ThemeContextType, 
  ThemeName, 
  ColorScheme, 
  ThemeSettings,
  DensityMode,
  AnimationLevel,
  GlassmorphismLevel
} from './themeTypes';

// Create the context here to avoid circular dependency
export const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Main unified theme hook
 * Provides access to all theme functionality
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook for accessing current theme settings only
 */
export function useThemeSettings(): ThemeSettings {
  const { settings } = useTheme();
  return settings;
}

/**
 * Hook for accessing resolved theme name only
 */
export function useThemeName(): ThemeName {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}

/**
 * Hook for color scheme management
 */
export function useColorScheme(): {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  systemColorScheme: ColorScheme;
  isDark: boolean;
  isLight: boolean;
  isSystemTheme: boolean;
} {
  const { settings, setColorScheme, systemColorScheme, isDark, isLight, isSystemTheme } = useTheme();
  return {
    colorScheme: settings.mode as ColorScheme,
    setColorScheme,
    systemColorScheme,
    isDark,
    isLight,
    isSystemTheme,
  };
}

/**
 * Hook for density management
 */
export function useDensity(): {
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
} {
  const { settings, setDensity } = useTheme();
  return {
    density: settings.density,
    setDensity,
  };
}

/**
 * Hook for animation management
 */
export function useAnimations(): {
  animationLevel: AnimationLevel;
  setAnimationLevel: (level: AnimationLevel) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
} {
  const { 
    settings, 
    setAnimationLevel, 
    setAnimationsEnabled, 
    setReduceMotion 
  } = useTheme();
  
  return {
    animationLevel: settings.animationLevel,
    setAnimationLevel,
    animationsEnabled: settings.animationsEnabled ?? true,
    setAnimationsEnabled,
    reduceMotion: settings.reduceMotion,
    setReduceMotion,
  };
}

/**
 * Hook for glassmorphism management
 */
export function useGlassmorphism(): {
  glassmorphismLevel: GlassmorphismLevel;
  setGlassmorphismLevel: (level: GlassmorphismLevel) => void;
  glassmorphismEnabled: boolean;
  setGlassmorphismEnabled: (enabled: boolean) => void;
  isGlassTheme: boolean;
} {
  const { 
    settings, 
    setGlassmorphismLevel, 
    setGlassmorphismEnabled,
    isGlassTheme 
  } = useTheme();
  
  return {
    glassmorphismLevel: settings.glassmorphismLevel,
    setGlassmorphismLevel,
    glassmorphismEnabled: settings.glassmorphismEnabled ?? false,
    setGlassmorphismEnabled,
    isGlassTheme,
  };
}

/**
 * Hook for accessibility features
 */
export function useAccessibility(): {
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
} {
  const { settings, setHighContrast, setReduceMotion } = useTheme();
  return {
    highContrast: settings.highContrast,
    setHighContrast,
    reduceMotion: settings.reduceMotion,
    setReduceMotion,
  };
}

/**
 * Hook for feature toggles
 */
export function useFeatures(): {
  particleEffectsEnabled: boolean;
  setParticleEffectsEnabled: (enabled: boolean) => void;
  soundEffects: boolean;
  setSoundEffects: (enabled: boolean) => void;
} {
  const { settings, setParticleEffectsEnabled, setSoundEffects } = useTheme();
  return {
    particleEffectsEnabled: settings.particleEffectsEnabled,
    setParticleEffectsEnabled,
    soundEffects: settings.soundEffects,
    setSoundEffects,
  };
}

/**
 * Hook for theme management utilities
 */
export function useThemeUtils(): {
  resetToDefaults: () => void;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  isLoaded: boolean;
} {
  const { resetToDefaults, updateSettings, isLoaded } = useTheme();
  return {
    resetToDefaults,
    updateSettings,
    isLoaded,
  };
}

/**
 * Hook for computed theme values
 */
export function useThemeComputed(): {
  isDark: boolean;
  isLight: boolean;
  isSystemTheme: boolean;
  isGlassTheme: boolean;
  resolvedTheme: ThemeName;
  systemColorScheme: ColorScheme;
} {
  const { 
    isDark, 
    isLight, 
    isSystemTheme, 
    isGlassTheme, 
    resolvedTheme, 
    systemColorScheme 
  } = useTheme();
  
  return {
    isDark,
    isLight,
    isSystemTheme,
    isGlassTheme,
    resolvedTheme,
    systemColorScheme,
  };
}

/**
 * Legacy compatibility hooks
 */

/**
 * @deprecated Use useColorScheme instead
 */
export const useMode = useColorScheme;

/**
 * @deprecated Use useThemeSettings instead  
 */
export const useSettings = useThemeSettings;

/**
 * @deprecated Use useThemeComputed instead
 */
export const useThemeData = useThemeComputed;

// Default export for convenience
export default useTheme;