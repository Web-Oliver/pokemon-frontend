/**
 * Unified Theme Context System
 * Phase 1.1.1: Foundation & Infrastructure
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Manages comprehensive theme configuration
 * - Open/Closed: Extensible by adding new theme presets
 * - DRY: Single source of truth for all theme management
 * - Dependency Inversion: Abstracts theme details from components
 *
 * Integrates with:
 * - Existing next-themes system (ThemeToggle.tsx)
 * - Form theme system (formThemes.ts)
 * - CSS design system (pokemon-design-system.css)
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { ThemeColor, formThemes } from '../theme/formThemes';

// ================================
// THEME INTERFACES & TYPES
// ================================

export type VisualTheme =
  | 'context7-premium'
  | 'context7-futuristic'
  | 'dba-cosmic'
  | 'minimal';
export type ColorScheme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type AnimationIntensity = 'subtle' | 'normal' | 'enhanced' | 'disabled';

/**
 * Comprehensive theme configuration interface
 * Extends existing form theme system with visual themes and settings
 */
export interface ThemeConfiguration {
  // Visual Theme Settings
  visualTheme: VisualTheme;
  colorScheme: ColorScheme;
  density: Density;
  animationIntensity: AnimationIntensity;

  // Color Configuration (extends existing formThemes)
  primaryColor: ThemeColor;

  // Accessibility Settings
  highContrast: boolean;
  reducedMotion: boolean;

  // Advanced Settings
  glassmorphismIntensity: number; // 0-100
  particleEffectsEnabled: boolean;
  customCSSProperties?: Record<string, string>;
}

/**
 * Theme preset configurations
 * Each preset represents a complete visual style
 */
export interface ThemePreset {
  id: VisualTheme;
  name: string;
  description: string;
  config: Partial<ThemeConfiguration>;
  preview: {
    gradient: string;
    backgroundColor: string;
    textColor: string;
  };
}

/**
 * Theme context interface
 * Provides theme state and manipulation functions
 */
export interface ThemeContextType {
  // Current Configuration
  config: ThemeConfiguration;
  resolvedTheme: 'light' | 'dark';

  // Theme Management
  setVisualTheme: (theme: VisualTheme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDensity: (density: Density) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  setPrimaryColor: (color: ThemeColor) => void;

  // Accessibility
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;

  // Advanced Configuration
  setGlassmorphismIntensity: (intensity: number) => void;
  toggleParticleEffects: () => void;
  setCustomProperties: (properties: Record<string, string>) => void;

  // Preset Management
  applyPreset: (presetId: VisualTheme) => void;
  saveCustomPreset: (name: string, config: ThemeConfiguration) => void;
  loadCustomPreset: (name: string) => void;
  resetToDefaults: () => void;

  // Utility Functions
  getThemeClasses: () => string;
  getCSSProperties: () => Record<string, string>;
  isThemeLoaded: boolean;

  // System Integration
  getSystemPreference: () => 'light' | 'dark';
  isSystemTheme: boolean;
}

// ================================
// THEME PRESETS
// ================================

export const themePresets: ThemePreset[] = [
  {
    id: 'context7-premium',
    name: 'Context7 Premium',
    description:
      'Glassmorphism design with premium gradients and micro-interactions',
    config: {
      visualTheme: 'context7-premium',
      primaryColor: 'dark',
      density: 'comfortable',
      animationIntensity: 'normal',
      glassmorphismIntensity: 80,
      particleEffectsEnabled: true,
    },
    preview: {
      gradient: 'from-zinc-900/80 to-zinc-800/80',
      backgroundColor: 'backdrop-blur-xl',
      textColor: 'text-cyan-400',
    },
  },
  {
    id: 'context7-futuristic',
    name: 'Context7 2025 Futuristic',
    description: 'Advanced neural network patterns with holographic effects',
    config: {
      visualTheme: 'context7-futuristic',
      primaryColor: 'blue',
      density: 'comfortable',
      animationIntensity: 'enhanced',
      glassmorphismIntensity: 100,
      particleEffectsEnabled: true,
    },
    preview: {
      gradient: 'from-blue-500 to-cyan-500',
      backgroundColor: 'neural-network',
      textColor: 'text-blue-400',
    },
  },
  {
    id: 'dba-cosmic',
    name: 'DBA Cosmic',
    description:
      'Space-themed with cosmic gradients and holographic backgrounds',
    config: {
      visualTheme: 'dba-cosmic',
      primaryColor: 'purple',
      density: 'spacious',
      animationIntensity: 'enhanced',
      glassmorphismIntensity: 90,
      particleEffectsEnabled: true,
    },
    preview: {
      gradient: 'from-purple-500 to-pink-500',
      backgroundColor: 'cosmic-gradient',
      textColor: 'text-purple-400',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Clean, accessible design with reduced visual complexity',
    config: {
      visualTheme: 'minimal',
      primaryColor: 'emerald',
      density: 'comfortable',
      animationIntensity: 'subtle',
      glassmorphismIntensity: 20,
      particleEffectsEnabled: false,
      highContrast: false,
      reducedMotion: false,
    },
    preview: {
      gradient: 'from-emerald-500 to-teal-500',
      backgroundColor: 'clean-white',
      textColor: 'text-emerald-600',
    },
  },
];

// ================================
// DEFAULT CONFIGURATION
// ================================

const defaultConfig: ThemeConfiguration = {
  visualTheme: 'context7-premium',
  colorScheme: 'system',
  density: 'comfortable',
  animationIntensity: 'normal',
  primaryColor: 'dark',
  highContrast: false,
  reducedMotion: false,
  glassmorphismIntensity: 80,
  particleEffectsEnabled: true,
};

// ================================
// STORAGE UTILITIES
// ================================

const STORAGE_KEY = 'pokemon-theme-config';

const saveConfig = (config: ThemeConfiguration): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save theme configuration:', error);
  }
};

const loadConfig = (): ThemeConfiguration => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultConfig, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load theme configuration:', error);
  }
  return defaultConfig;
};

// ================================
// THEME CONTEXT
// ================================

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Theme Provider Component
 * Manages all theme state and provides theme manipulation functions
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    theme: nextTheme,
    setTheme: setNextTheme,
    resolvedTheme,
  } = useNextTheme();
  const [config, setConfig] = useState<ThemeConfiguration>(defaultConfig);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load configuration on mount and set up system theme detection
  useEffect(() => {
    const loadedConfig = loadConfig();
    setConfig(loadedConfig);
    setIsThemeLoaded(true);

    // Sync color scheme with next-themes
    if (loadedConfig.colorScheme !== 'system') {
      setNextTheme(loadedConfig.colorScheme);
    }

    // Auto dark/light mode detection - listen for system changes
    if (
      loadedConfig.colorScheme === 'system' &&
      typeof window !== 'undefined'
    ) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemThemeChange = () => {
        // Only apply if user hasn't overridden system setting
        setConfig((prev) => {
          if (prev.colorScheme === 'system') {
            // Update next-themes to match system preference
            setNextTheme('system');
            return prev;
          }
          return prev;
        });
      };

      // Add listener for system theme changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleSystemThemeChange);
      }

      // Cleanup function
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    }
  }, [setNextTheme]);

  // Save configuration whenever it changes
  useEffect(() => {
    if (isThemeLoaded) {
      saveConfig(config);
      updateCSSProperties(config);
    }
  }, [config, isThemeLoaded]);

  // Update CSS custom properties based on theme configuration
  const updateCSSProperties = useCallback((themeConfig: ThemeConfiguration) => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const formTheme = formThemes[themeConfig.primaryColor];

    // Density tokens
    const densityMultiplier = {
      compact: 0.8,
      comfortable: 1,
      spacious: 1.2,
    }[themeConfig.density];

    // Animation tokens
    const animationDurations = {
      subtle: { fast: '0.1s', normal: '0.2s', slow: '0.3s' },
      normal: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
      enhanced: { fast: '0.2s', normal: '0.4s', slow: '0.7s' },
      disabled: { fast: '0s', normal: '0s', slow: '0s' },
    }[themeConfig.animationIntensity];

    // Apply theme tokens
    root.style.setProperty(
      '--theme-primary-gradient',
      formTheme.button.primary
    );
    root.style.setProperty(
      '--theme-primary-hover',
      formTheme.button.primaryHover
    );
    root.style.setProperty(
      '--theme-header-background',
      formTheme.header.background
    );
    root.style.setProperty('--theme-border-color', formTheme.element.border);
    root.style.setProperty('--theme-focus-ring', formTheme.element.focus);

    // Density spacing
    root.style.setProperty(
      '--density-spacing-xs',
      `${0.25 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-sm',
      `${0.5 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-md',
      `${1 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-lg',
      `${1.5 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-xl',
      `${2 * densityMultiplier}rem`
    );

    // Animation durations
    root.style.setProperty(
      '--animation-duration-fast',
      animationDurations.fast
    );
    root.style.setProperty(
      '--animation-duration-normal',
      animationDurations.normal
    );
    root.style.setProperty(
      '--animation-duration-slow',
      animationDurations.slow
    );

    // Animation delays for orchestrated effects
    root.style.setProperty('--animation-delay-short', '0.2s');
    root.style.setProperty('--animation-delay-medium', '0.5s');
    root.style.setProperty('--animation-delay-long', '0.9s');

    // Complex animation durations for special effects
    root.style.setProperty('--animation-duration-orbit', '15s');
    root.style.setProperty('--animation-duration-particle', '20s');

    // Glassmorphism intensity
    const glassAlpha = themeConfig.glassmorphismIntensity / 100;
    root.style.setProperty('--glass-alpha', glassAlpha.toString());
    root.style.setProperty(
      '--glass-blur',
      `${themeConfig.glassmorphismIntensity / 5}px`
    );

    // Visual theme classes
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${themeConfig.visualTheme}`);

    // Accessibility settings
    if (themeConfig.reducedMotion) {
      root.style.setProperty('--animation-duration-fast', '0s');
      root.style.setProperty('--animation-duration-normal', '0s');
      root.style.setProperty('--animation-duration-slow', '0s');
    }

    // Custom properties
    if (themeConfig.customCSSProperties) {
      Object.entries(themeConfig.customCSSProperties).forEach(
        ([key, value]) => {
          root.style.setProperty(key, value);
        }
      );
    }
  }, []);

  // Theme manipulation functions
  const setVisualTheme = useCallback((theme: VisualTheme) => {
    setConfig((prev) => ({ ...prev, visualTheme: theme }));
  }, []);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setConfig((prev) => ({ ...prev, colorScheme: scheme }));
      setNextTheme(scheme);
    },
    [setNextTheme]
  );

  const setDensity = useCallback((density: Density) => {
    setConfig((prev) => ({ ...prev, density }));
  }, []);

  const setAnimationIntensity = useCallback((intensity: AnimationIntensity) => {
    setConfig((prev) => ({ ...prev, animationIntensity: intensity }));
  }, []);

  const setPrimaryColor = useCallback((color: ThemeColor) => {
    setConfig((prev) => ({ ...prev, primaryColor: color }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setConfig((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setConfig((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const setGlassmorphismIntensity = useCallback((intensity: number) => {
    setConfig((prev) => ({
      ...prev,
      glassmorphismIntensity: Math.max(0, Math.min(100, intensity)),
    }));
  }, []);

  const toggleParticleEffects = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      particleEffectsEnabled: !prev.particleEffectsEnabled,
    }));
  }, []);

  const setCustomProperties = useCallback(
    (properties: Record<string, string>) => {
      setConfig((prev) => ({ ...prev, customCSSProperties: properties }));
    },
    []
  );

  // Preset management
  const applyPreset = useCallback((presetId: VisualTheme) => {
    const preset = themePresets.find((p) => p.id === presetId);
    if (preset) {
      setConfig((prev) => ({ ...prev, ...preset.config }));
    }
  }, []);

  const saveCustomPreset = useCallback(
    (name: string, themeConfig: ThemeConfiguration) => {
      try {
        const customPresets = JSON.parse(
          localStorage.getItem('pokemon-custom-presets') || '{}'
        );
        customPresets[name] = themeConfig;
        localStorage.setItem(
          'pokemon-custom-presets',
          JSON.stringify(customPresets)
        );
      } catch (error) {
        console.warn('Failed to save custom preset:', error);
      }
    },
    []
  );

  const loadCustomPreset = useCallback((name: string) => {
    try {
      const customPresets = JSON.parse(
        localStorage.getItem('pokemon-custom-presets') || '{}'
      );
      if (customPresets[name]) {
        setConfig(customPresets[name]);
      }
    } catch (error) {
      console.warn('Failed to load custom preset:', error);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(defaultConfig);
    setNextTheme('system');
  }, [setNextTheme]);

  // Utility functions
  const getThemeClasses = useCallback((): string => {
    const classes = [
      `theme-${config.visualTheme}`,
      `density-${config.density}`,
      `animation-${config.animationIntensity}`,
    ];

    if (config.highContrast) {
      classes.push('high-contrast');
    }
    if (config.reducedMotion) {
      classes.push('reduced-motion');
    }
    if (!config.particleEffectsEnabled) {
      classes.push('no-particles');
    }

    return classes.join(' ');
  }, [config]);

  const getCSSProperties = useCallback((): Record<string, string> => {
    const formTheme = formThemes[config.primaryColor];
    const densityMultiplier = {
      compact: 0.8,
      comfortable: 1,
      spacious: 1.2,
    }[config.density];

    return {
      '--theme-primary-gradient': formTheme.button.primary.replace(
        'bg-gradient-to-r ',
        ''
      ),
      '--theme-primary-hover': formTheme.button.primaryHover.replace(
        'hover:',
        ''
      ),
      '--density-multiplier': densityMultiplier.toString(),
      '--glass-alpha': (config.glassmorphismIntensity / 100).toString(),
      '--glass-blur': `${config.glassmorphismIntensity / 5}px`,
      ...config.customCSSProperties,
    };
  }, [config]);

  // System theme utilities
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  const isSystemTheme = config.colorScheme === 'system';

  const contextValue: ThemeContextType = {
    config,
    resolvedTheme: (resolvedTheme as 'light' | 'dark') || 'dark',
    setVisualTheme,
    setColorScheme,
    setDensity,
    setAnimationIntensity,
    setPrimaryColor,
    toggleHighContrast,
    toggleReducedMotion,
    setGlassmorphismIntensity,
    toggleParticleEffects,
    setCustomProperties,
    applyPreset,
    saveCustomPreset,
    loadCustomPreset,
    resetToDefaults,
    getThemeClasses,
    getCSSProperties,
    isThemeLoaded,
    getSystemPreference,
    isSystemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context
 * Provides type-safe access to all theme functionality
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * HOC for theme-aware components
 * Automatically provides theme configuration as props
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextType }>
) => {
  return (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

export default ThemeContext;
