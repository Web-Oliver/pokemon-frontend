/**
 * Composed Theme Provider
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 4
 * 
 * Composes all focused theme providers following DIP
 * Maintains existing theme functionality while enabling focused usage
 * Acts as the orchestrator for all theme-related state management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { 
  ThemeConfiguration,
  ColorScheme,
} from '../../types/themeTypes';
import { 
  defaultConfig as originalDefaultConfig,
} from '../ThemeContext';
import { ThemeColor } from '../../theme/formThemes';
import { VisualThemeProvider, VisualThemeState } from './VisualThemeProvider';
import { LayoutThemeProvider, LayoutThemeState } from './LayoutThemeProvider';
import { AnimationThemeProvider, AnimationThemeState } from './AnimationThemeProvider';
import { AccessibilityThemeProvider, AccessibilityThemeState } from './AccessibilityThemeProvider';
import { ThemeStorageProvider } from './ThemeStorageProvider';
import { formThemes } from '../../theme/formThemes';

// ================================
// COMPOSED THEME STATE
// ================================

interface ComposedThemeState {
  visual: VisualThemeState;
  layout: LayoutThemeState;
  animation: AnimationThemeState;
  accessibility: AccessibilityThemeState;
  colorScheme: ColorScheme;
  primaryColor: ThemeColor;
  customCSSProperties?: Record<string, string>;
  isThemeLoaded: boolean;
}

// ================================
// DEFAULT CONFIGURATION
// ================================

const defaultConfig: ComposedThemeState = {
  visual: {
    visualTheme: 'context7-premium',
    glassmorphismIntensity: 80,
    particleEffectsEnabled: true,
  },
  layout: {
    density: 'comfortable',
  },
  animation: {
    animationIntensity: 'normal',
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
  },
  colorScheme: 'system',
  primaryColor: 'dark',
  isThemeLoaded: false,
};

// ================================
// STORAGE UTILITIES
// ================================

const STORAGE_KEY = 'pokemon-theme-config';

const saveComposedConfig = (config: ComposedThemeState): void => {
  try {
    // Convert to the original ThemeConfiguration format for storage compatibility
    const legacyConfig: ThemeConfiguration = {
      visualTheme: config.visual.visualTheme,
      colorScheme: config.colorScheme,
      density: config.layout.density,
      animationIntensity: config.animation.animationIntensity,
      primaryColor: config.primaryColor,
      highContrast: config.accessibility.highContrast,
      reducedMotion: config.accessibility.reducedMotion,
      glassmorphismIntensity: config.visual.glassmorphismIntensity,
      particleEffectsEnabled: config.visual.particleEffectsEnabled,
      customCSSProperties: config.customCSSProperties,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyConfig));
  } catch (error) {
    console.warn('Failed to save theme configuration:', error);
  }
};

const loadComposedConfig = (): ComposedThemeState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const legacyConfig: ThemeConfiguration = JSON.parse(stored);
      return {
        visual: {
          visualTheme: legacyConfig.visualTheme,
          glassmorphismIntensity: legacyConfig.glassmorphismIntensity,
          particleEffectsEnabled: legacyConfig.particleEffectsEnabled,
        },
        layout: {
          density: legacyConfig.density,
        },
        animation: {
          animationIntensity: legacyConfig.animationIntensity,
        },
        accessibility: {
          highContrast: legacyConfig.highContrast,
          reducedMotion: legacyConfig.reducedMotion,
        },
        colorScheme: legacyConfig.colorScheme,
        primaryColor: legacyConfig.primaryColor,
        customCSSProperties: legacyConfig.customCSSProperties,
        isThemeLoaded: true,
      };
    }
  } catch (error) {
    console.warn('Failed to load theme configuration:', error);
  }
  return { ...defaultConfig, isThemeLoaded: true };
};

// ================================
// COMPOSED THEME PROVIDER
// ================================

export interface ComposedThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Composed Theme Provider Component
 * Orchestrates all focused theme providers and manages global theme state
 * Maintains backward compatibility while enabling focused theme usage
 */
export const ComposedThemeProvider: React.FC<ComposedThemeProviderProps> = ({
  children,
}) => {
  const { setTheme: setNextTheme } = useNextTheme();
  const [config, setConfig] = useState<ComposedThemeState>(defaultConfig);

  // Load configuration on mount
  useEffect(() => {
    const loadedConfig = loadComposedConfig();
    setConfig(loadedConfig);

    // Sync color scheme with next-themes
    if (loadedConfig.colorScheme !== 'system') {
      setNextTheme(loadedConfig.colorScheme);
    }

    // Auto dark/light mode detection for system theme
    if (loadedConfig.colorScheme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemThemeChange = () => {
        setConfig((prev) => {
          if (prev.colorScheme === 'system') {
            setNextTheme('system');
            return prev;
          }
          return prev;
        });
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.addListener(handleSystemThemeChange);
        return () => mediaQuery.removeListener(handleSystemThemeChange);
      }
    }
  }, [setNextTheme]);

  // Save configuration and update CSS whenever it changes
  useEffect(() => {
    if (config.isThemeLoaded) {
      saveComposedConfig(config);
      updateCSSProperties(config);
    }
  }, [config]);

  // Update CSS custom properties based on theme configuration
  const updateCSSProperties = useCallback((themeConfig: ComposedThemeState) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const formTheme = formThemes[themeConfig.primaryColor];

    // Density tokens
    const densityMultiplier = {
      compact: 0.8,
      comfortable: 1,
      spacious: 1.2,
    }[themeConfig.layout.density];

    // Animation tokens
    const animationDurations = {
      subtle: { fast: '0.1s', normal: '0.2s', slow: '0.3s' },
      normal: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
      enhanced: { fast: '0.2s', normal: '0.4s', slow: '0.7s' },
      disabled: { fast: '0s', normal: '0s', slow: '0s' },
    }[themeConfig.animation.animationIntensity];

    // Apply theme tokens
    root.style.setProperty('--theme-primary-gradient', formTheme.button.primary);
    root.style.setProperty('--theme-primary-hover', formTheme.button.primaryHover);
    root.style.setProperty('--theme-header-background', formTheme.header.background);
    root.style.setProperty('--theme-border-color', formTheme.element.border);
    root.style.setProperty('--theme-focus-ring', formTheme.element.focus);

    // Density spacing
    root.style.setProperty('--density-spacing-xs', `${0.25 * densityMultiplier}rem`);
    root.style.setProperty('--density-spacing-sm', `${0.5 * densityMultiplier}rem`);
    root.style.setProperty('--density-spacing-md', `${1 * densityMultiplier}rem`);
    root.style.setProperty('--density-spacing-lg', `${1.5 * densityMultiplier}rem`);
    root.style.setProperty('--density-spacing-xl', `${2 * densityMultiplier}rem`);

    // Animation durations
    root.style.setProperty('--animation-duration-fast', animationDurations.fast);
    root.style.setProperty('--animation-duration-normal', animationDurations.normal);
    root.style.setProperty('--animation-duration-slow', animationDurations.slow);

    // Animation delays for orchestrated effects
    root.style.setProperty('--animation-delay-short', '0.2s');
    root.style.setProperty('--animation-delay-medium', '0.5s');
    root.style.setProperty('--animation-delay-long', '0.9s');

    // Complex animation durations for special effects
    root.style.setProperty('--animation-duration-orbit', '15s');
    root.style.setProperty('--animation-duration-particle', '20s');

    // Glassmorphism intensity
    const glassAlpha = themeConfig.visual.glassmorphismIntensity / 100;
    root.style.setProperty('--glass-alpha', glassAlpha.toString());
    root.style.setProperty('--glass-blur', `${themeConfig.visual.glassmorphismIntensity / 5}px`);

    // Visual theme classes
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${themeConfig.visual.visualTheme}`);

    // Accessibility settings
    if (themeConfig.accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration-fast', '0s');
      root.style.setProperty('--animation-duration-normal', '0s');
      root.style.setProperty('--animation-duration-slow', '0s');
    }

    // Custom properties
    if (themeConfig.customCSSProperties) {
      Object.entries(themeConfig.customCSSProperties).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, []);

  // State change handlers for focused providers
  const handleVisualStateChange = useCallback((newVisualState: Partial<VisualThemeState>) => {
    setConfig(prev => ({
      ...prev,
      visual: { ...prev.visual, ...newVisualState }
    }));
  }, []);

  const handleLayoutStateChange = useCallback((newLayoutState: Partial<LayoutThemeState>) => {
    setConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, ...newLayoutState }
    }));
  }, []);

  const handleAnimationStateChange = useCallback((newAnimationState: Partial<AnimationThemeState>) => {
    setConfig(prev => ({
      ...prev,
      animation: { ...prev.animation, ...newAnimationState }
    }));
  }, []);

  const handleAccessibilityStateChange = useCallback((newAccessibilityState: Partial<AccessibilityThemeState>) => {
    setConfig(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...newAccessibilityState }
    }));
  }, []);

  return (
    <ThemeStorageProvider>
      <VisualThemeProvider
        state={config.visual}
        onStateChange={handleVisualStateChange}
      >
        <LayoutThemeProvider
          state={config.layout}
          onStateChange={handleLayoutStateChange}
        >
          <AnimationThemeProvider
            state={config.animation}
            onStateChange={handleAnimationStateChange}
          >
            <AccessibilityThemeProvider
              state={config.accessibility}
              onStateChange={handleAccessibilityStateChange}
            >
              {children}
            </AccessibilityThemeProvider>
          </AnimationThemeProvider>
        </LayoutThemeProvider>
      </VisualThemeProvider>
    </ThemeStorageProvider>
  );
};