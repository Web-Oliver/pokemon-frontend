/**
 * UNIFIED THEME PROVIDER
 * Single source of truth for theme management
 * Consolidates multiple theme provider implementations
 */

import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  ThemeSettings, 
  ThemeContextType, 
  ThemeMode, 
  DensityMode, 
  AnimationLevel, 
  GlassmorphismLevel,
  ThemeName,
  ColorScheme,
  DEFAULT_THEME_SETTINGS,
  THEME_STORAGE_CONFIG
} from './themeTypes';
import { getThemeConfig, hasGlassmorphismSupport } from './themeDefinitions';
import { ThemeContext } from './useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get system color scheme preference
 */
function getSystemColorScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Load theme settings from localStorage
 */
function loadThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME_SETTINGS;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_CONFIG.key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_THEME_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load theme settings:', error);
  }
  
  return DEFAULT_THEME_SETTINGS;
}

/**
 * Save theme settings to localStorage
 */
function saveThemeSettings(settings: ThemeSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_CONFIG.key, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save theme settings:', error);
  }
}

/**
 * Resolve the actual color scheme based on mode and system preference
 */
function resolveColorScheme(mode: ThemeMode, systemColorScheme: ColorScheme): ColorScheme {
  if (mode === 'system') {
    return systemColorScheme;
  }
  return mode as ColorScheme;
}

/**
 * Apply theme to document root with CSS variables
 */
function applyThemeToDocument(settings: ThemeSettings, resolvedColorScheme: ColorScheme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Apply color scheme class
  root.classList.add(resolvedColorScheme);
  
  // Apply theme name class if specified
  if (settings.name) {
    root.classList.add(`theme-${settings.name}`);
  }
  
  // Apply density class
  root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
  root.classList.add(`density-${settings.density}`);
  
  // Apply animation level class
  root.classList.remove('animations-none', 'animations-reduced', 'animations-normal', 'animations-enhanced');
  root.classList.add(`animations-${settings.animationLevel}`);
  
  // Apply glassmorphism level class
  root.classList.remove('glass-none', 'glass-subtle', 'glass-moderate', 'glass-intense');
  root.classList.add(`glass-${settings.glassmorphismLevel}`);
  
  // Apply accessibility classes
  root.classList.toggle('reduce-motion', settings.reduceMotion);
  root.classList.toggle('high-contrast', settings.highContrast);
  
  // Apply feature classes
  root.classList.toggle('particle-effects', settings.particleEffectsEnabled);
  root.classList.toggle('sound-effects', settings.soundEffects);
  
  // Apply border radius class
  root.classList.remove('radius-none', 'radius-small', 'radius-medium', 'radius-large', 'radius-full');
  root.classList.add(`radius-${settings.borderRadius}`);
  
  // Apply CSS custom properties from theme config
  const themeConfig = getThemeConfig(
    settings.name || 'pokemon', 
    resolvedColorScheme
  );
  
  if (themeConfig) {
    // Apply color variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply spacing variables
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius variables
    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Apply shadow variables
    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Apply typography variables
    Object.entries(themeConfig.typography.fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(themeConfig.typography.fontWeights).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    Object.entries(themeConfig.typography.lineHeights).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value);
    });
    
    root.style.setProperty('--font-family', themeConfig.typography.fontFamily);
    
    // Apply effects if available
    if (themeConfig.effects) {
      if (themeConfig.effects.glassmorphism) {
        Object.entries(themeConfig.effects.glassmorphism).forEach(([key, value]) => {
          root.style.setProperty(`--glassmorphism-${key}`, value);
        });
      }
      
      if (themeConfig.effects.gradients) {
        Object.entries(themeConfig.effects.gradients).forEach(([key, value]) => {
          root.style.setProperty(`--gradient-${key}`, value);
        });
      }
    }
  }
  
  // Apply density-specific spacing
  applyDensitySettings(settings.density);
  
  // Apply glassmorphism settings
  applyGlassmorphismSettings(settings.glassmorphismEnabled || false);
  
  // Apply animation settings
  applyAnimationSettings(settings);
  
  // Apply custom accent color if specified
  if (settings.customAccentColor) {
    root.style.setProperty('--color-accent-custom', settings.customAccentColor);
  }
  
  // Apply custom CSS properties if specified
  if (settings.customCSSProperties) {
    Object.entries(settings.customCSSProperties).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
}

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme>('light');

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
      const resolvedColorScheme = resolveColorScheme(settings.mode, systemColorScheme);
      applyThemeToDocument(settings, resolvedColorScheme);
      saveThemeSettings(settings);
    }
  }, [settings, isLoaded, systemColorScheme]);

  // Listen for system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      const newSystemScheme = getSystemColorScheme();
      setSystemColorScheme(newSystemScheme);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  // Computed values
  const resolvedTheme = settings.name || 'pokemon';
  const resolvedColorScheme = resolveColorScheme(settings.mode, systemColorScheme);
  const isDark = resolvedColorScheme === 'dark';
  const isLight = !isDark;
  const isSystemTheme = settings.mode === 'system';
  const isGlassTheme = hasGlassmorphismSupport(resolvedTheme);

  // Theme management functions
  const updateSettings = useCallback((newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    updateSettings({ name: theme });
  }, [updateSettings]);

  const setMode = useCallback((mode: ThemeMode) => {
    updateSettings({ mode });
  }, [updateSettings]);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    updateSettings({ mode: colorScheme });
  }, [updateSettings]);

  const setDensity = useCallback((density: DensityMode) => {
    updateSettings({ density });
  }, [updateSettings]);

  const setAnimationLevel = useCallback((animationLevel: AnimationLevel) => {
    updateSettings({ animationLevel });
  }, [updateSettings]);

  const setGlassmorphismLevel = useCallback((glassmorphismLevel: GlassmorphismLevel) => {
    updateSettings({ glassmorphismLevel });
  }, [updateSettings]);

  const setGlassmorphismEnabled = useCallback((enabled: boolean) => {
    updateSettings({ glassmorphismEnabled: enabled });
  }, [updateSettings]);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    updateSettings({ animationsEnabled: enabled });
  }, [updateSettings]);

  const setParticleEffectsEnabled = useCallback((enabled: boolean) => {
    updateSettings({ particleEffectsEnabled: enabled });
  }, [updateSettings]);

  const setReduceMotion = useCallback((enabled: boolean) => {
    updateSettings({ 
      reduceMotion: enabled,
      animationLevel: enabled ? 'reduced' : 'normal'
    });
  }, [updateSettings]);

  const setHighContrast = useCallback((enabled: boolean) => {
    updateSettings({ highContrast: enabled });
  }, [updateSettings]);

  const setSoundEffects = useCallback((enabled: boolean) => {
    updateSettings({ soundEffects: enabled });
  }, [updateSettings]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_THEME_SETTINGS);
  }, []);

  const contextValue: ThemeContextType = {
    // Current state
    settings,
    resolvedTheme,
    systemColorScheme,
    
    // Theme setters
    setTheme,
    setMode,
    setColorScheme,
    setDensity,
    setAnimationLevel,
    setGlassmorphismLevel,
    
    // Feature toggles
    setGlassmorphismEnabled,
    setAnimationsEnabled,
    setParticleEffectsEnabled,
    setReduceMotion,
    setHighContrast,
    setSoundEffects,
    
    // Bulk update
    updateSettings,
    
    // Utilities
    resetToDefaults,
    isSystemTheme,
    isGlassTheme,
    isLoaded,
    
    // Computed properties
    isDark,
    isLight,
    
    // Legacy compatibility
    density: settings.density,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

// ===============================
// THEME APPLICATION HELPERS
// CSS Variable Application Functions
// ===============================

/**
 * Apply density-aware spacing to CSS variables
 */
const applyDensitySettings = (density: DensityMode): void => {
  const root = document.documentElement;
  
  const densityMap = {
    compact: {
      xs: '0.125rem',
      sm: '0.25rem', 
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      '3xl': '2rem'
    },
    comfortable: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem', 
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    spacious: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1.5rem',
      lg: '2.25rem', 
      xl: '3rem',
      '2xl': '4.5rem',
      '3xl': '6rem'
    }
  };
  
  const spacings = densityMap[density];
  
  Object.entries(spacings).forEach(([key, value]) => {
    root.style.setProperty(`--density-spacing-${key}`, value);
  });
  
  root.setAttribute('data-density', density);
};

/**
 * Apply glassmorphism intensity settings
 */
const applyGlassmorphismSettings = (enabled: boolean): void => {
  const root = document.documentElement;
  
  if (enabled) {
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
    root.style.setProperty('--glass-blur', '20px');
  } else {
    root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.05)');
    root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)'); 
    root.style.setProperty('--glass-blur', '0px');
  }
  
  root.setAttribute('data-glass-enabled', enabled.toString());
};

/**
 * Apply animation and motion settings
 */
const applyAnimationSettings = (settings: ThemeSettings): void => {
  const root = document.documentElement;
  
  // Animation duration based on level
  const durationMap = {
    none: { fast: '0ms', normal: '0ms', slow: '0ms' },
    reduced: { fast: '50ms', normal: '100ms', slow: '150ms' },
    normal: { fast: '150ms', normal: '250ms', slow: '400ms' },
    enhanced: { fast: '200ms', normal: '350ms', slow: '600ms' }
  };
  
  const durations = durationMap[settings.animationLevel];
  
  Object.entries(durations).forEach(([key, value]) => {
    root.style.setProperty(`--animation-duration-${key}`, value);
  });
  
  // Reduced motion override
  if (settings.reduceMotion) {
    root.style.setProperty('--animation-duration-fast', '0ms');
    root.style.setProperty('--animation-duration-normal', '0ms');
    root.style.setProperty('--animation-duration-slow', '0ms');
  }
  
  root.setAttribute('data-animations-enabled', (settings.animationsEnabled ?? true).toString());
  root.setAttribute('data-reduce-motion', settings.reduceMotion.toString());
};