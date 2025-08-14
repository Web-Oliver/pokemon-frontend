/**
 * THEME PROVIDER - DESIGN SYSTEM
 * Following Carbon Design System conventions and Context7 best practices
 * 
 * Clean, professional implementation
 * Industry standard naming patterns
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  ThemeName,
  ColorScheme,
  Density,
  AnimationLevel,
  ThemeSettings,
  applyTheme,
  saveThemeSettings,
  loadThemeSettings,
  getSystemColorScheme,
  resolveTheme,
  defaultThemeSettings,
  isGlassTheme,
  // getThemeDisplayName, // Commented out - unused
} from './DesignSystem';

interface ThemeContextType {
  // Current settings
  settings: ThemeSettings;
  resolvedTheme: ThemeName;
  systemColorScheme: 'light' | 'dark';
  
  // Theme setters
  setTheme: (theme: ThemeName) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDensity: (density: Density) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setGlassmorphismEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setParticleEffectsEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  
  // Utilities
  resetToDefaults: () => void;
  isSystemTheme: boolean;
  isGlassTheme: boolean;
  isLoaded: boolean;
  
  // Legacy compatibility
  
  density: Density;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>('dark');

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadThemeSettings();
    setSettings(loadedSettings);
    setSystemColorScheme(getSystemColorScheme());
    setIsLoaded(true);
  }, []);

  // Apply theme whenever settings change
  useEffect(() => {
    if (isLoaded) {
      const resolvedThemeName = resolveTheme(settings);
      applyTheme(resolvedThemeName);
      saveThemeSettings(settings);
    }
  }, [settings, isLoaded]);

  // Listen for system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      const newSystemScheme = getSystemColorScheme();
      setSystemColorScheme(newSystemScheme);
      
      // If using system color scheme, reapply theme
      if (settings.colorScheme === 'system') {
        const resolvedThemeName = resolveTheme(settings);
        applyTheme(resolvedThemeName);
      }
    };

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [settings.colorScheme]);

  // Theme setters
  const setTheme = useCallback((theme: ThemeName) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    setSettings(prev => ({ ...prev, colorScheme }));
  }, []);

  const setDensity = useCallback((density: Density) => {
    setSettings(prev => ({ ...prev, density }));
  }, []);

  const setAnimationLevel = useCallback((animationLevel: AnimationLevel) => {
    setSettings(prev => ({ ...prev, animationLevel }));
  }, []);

  const setGlassmorphismEnabled = useCallback((glassmorphismEnabled: boolean) => {
    setSettings(prev => ({ ...prev, glassmorphismEnabled }));
  }, []);

  const setAnimationsEnabled = useCallback((animationsEnabled: boolean) => {
    setSettings(prev => ({ ...prev, animationsEnabled }));
  }, []);

  const setParticleEffectsEnabled = useCallback((particleEffectsEnabled: boolean) => {
    setSettings(prev => ({ ...prev, particleEffectsEnabled }));
  }, []);

  const setReduceMotion = useCallback((reduceMotion: boolean) => {
    setSettings(prev => ({ ...prev, reduceMotion }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultThemeSettings);
  }, []);

  // Computed values
  const resolvedThemeName = resolveTheme(settings);
  const isSystemTheme = settings.colorScheme === 'system';
  const isGlass = isGlassTheme(resolvedThemeName);

  const contextValue: ThemeContextType = {
    // Current settings
    settings,
    resolvedTheme: resolvedThemeName,
    systemColorScheme,
    
    // Setters
    setTheme,
    setColorScheme,
    setDensity,
    setAnimationLevel,
    setGlassmorphismEnabled,
    setAnimationsEnabled,
    setParticleEffectsEnabled,
    setReduceMotion,
    
    // Utilities
    resetToDefaults,
    isSystemTheme,
    isGlassTheme: isGlass,
    isLoaded,
    
    // Legacy compatibility
    density: settings.density,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Main theme hook
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook for theme name only
 */
export const useThemeName = (): ThemeName => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
};

/**
 * Hook for color scheme only
 */
export const useColorScheme = (): { 
  colorScheme: ColorScheme; 
  setColorScheme: (scheme: ColorScheme) => void;
  systemColorScheme: 'light' | 'dark';
} => {
  const { settings, setColorScheme, systemColorScheme } = useTheme();
  return {
    colorScheme: settings.colorScheme,
    setColorScheme,
    systemColorScheme,
  };
};

export default ThemeProvider;