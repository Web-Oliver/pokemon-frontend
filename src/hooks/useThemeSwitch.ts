/**
 * Theme Switching Utilities Hook
 * Phase 1.2.2: Advanced theme switching and utility enhancements
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Theme switching logic only
 * - Open/Closed: Extensible for new switching patterns
 * - DRY: Centralized theme switching utilities
 * - Dependency Inversion: Abstracts theme switching implementation
 *
 * Integrates with:
 * - ThemeContext.tsx for theme state management
 * - themeUtils.ts for styling utilities
 * - formThemes.ts for color scheme transitions
 */

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  VisualTheme,
  ColorScheme,
  Density,
  AnimationIntensity,
} from '../contexts/ThemeContext';
import { ThemeColor } from '../theme/formThemes';

// ================================
// THEME SWITCHING HOOKS
// ================================

/**
 * Enhanced theme switching hook with transition effects
 * Provides smooth theme transitions and loading states
 */
export function useThemeSwitch() {
  const theme = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<VisualTheme | null>(null);

  // Smooth theme switching with transition effects
  const switchTheme = useCallback(
    async (newTheme: VisualTheme, duration: number = 300) => {
      if (isTransitioning || newTheme === theme.config.visualTheme) {
        return;
      }

      setIsTransitioning(true);
      setPreviousTheme(theme.config.visualTheme);

      // Add transition class to document
      document.documentElement.classList.add('theme-transitioning');

      // Apply new theme
      theme.setVisualTheme(newTheme);

      // Wait for transition to complete
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Remove transition class
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
      setPreviousTheme(null);
    },
    [theme, isTransitioning]
  );

  // Quick theme switching without transitions
  const quickSwitchTheme = useCallback(
    (newTheme: VisualTheme) => {
      theme.setVisualTheme(newTheme);
    },
    [theme]
  );

  // Cycle through available themes
  const cycleTheme = useCallback(() => {
    const themes: VisualTheme[] = [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ];
    const currentIndex = themes.indexOf(theme.config.visualTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    switchTheme(themes[nextIndex]);
  }, [theme.config.visualTheme, switchTheme]);

  // Switch to next theme in sequence
  const nextTheme = useCallback(() => {
    const themes: VisualTheme[] = [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ];
    const currentIndex = themes.indexOf(theme.config.visualTheme);
    const nextIndex = currentIndex < themes.length - 1 ? currentIndex + 1 : 0;
    switchTheme(themes[nextIndex]);
  }, [theme.config.visualTheme, switchTheme]);

  // Switch to previous theme in sequence
  const previousThemeSwitch = useCallback(() => {
    const themes: VisualTheme[] = [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ];
    const currentIndex = themes.indexOf(theme.config.visualTheme);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : themes.length - 1;
    switchTheme(themes[prevIndex]);
  }, [theme.config.visualTheme, switchTheme]);

  return {
    currentTheme: theme.config.visualTheme,
    isTransitioning,
    previousTheme,
    switchTheme,
    quickSwitchTheme,
    cycleTheme,
    nextTheme,
    previousTheme: previousThemeSwitch,
    availableThemes: [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ] as const,
  };
}

/**
 * Color scheme switching hook
 * Manages color scheme transitions with next-themes integration
 */
export function useColorSchemeSwitch() {
  const theme = useTheme();

  const switchColorScheme = useCallback(
    (newScheme: ColorScheme) => {
      theme.setColorScheme(newScheme);
    },
    [theme]
  );

  const cycleColorScheme = useCallback(() => {
    const schemes: ColorScheme[] = ['light', 'dark', 'system'];
    const currentIndex = schemes.indexOf(theme.config.colorScheme);
    const nextIndex = (currentIndex + 1) % schemes.length;
    switchColorScheme(schemes[nextIndex]);
  }, [theme.config.colorScheme, switchColorScheme]);

  const toggleDarkMode = useCallback(() => {
    const newScheme = theme.config.colorScheme === 'dark' ? 'light' : 'dark';
    switchColorScheme(newScheme);
  }, [theme.config.colorScheme, switchColorScheme]);

  return {
    currentScheme: theme.config.colorScheme,
    resolvedTheme: theme.resolvedTheme,
    switchColorScheme,
    cycleColorScheme,
    toggleDarkMode,
    availableSchemes: ['light', 'dark', 'system'] as const,
  };
}

/**
 * Primary color switching hook
 * Manages form theme color transitions
 */
export function usePrimaryColorSwitch() {
  const theme = useTheme();

  const switchPrimaryColor = useCallback(
    (newColor: ThemeColor) => {
      theme.setPrimaryColor(newColor);
    },
    [theme]
  );

  const cyclePrimaryColor = useCallback(() => {
    const colors: ThemeColor[] = [
      'purple',
      'blue',
      'emerald',
      'amber',
      'rose',
      'dark',
    ];
    const currentIndex = colors.indexOf(theme.config.primaryColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    switchPrimaryColor(colors[nextIndex]);
  }, [theme.config.primaryColor, switchPrimaryColor]);

  return {
    currentColor: theme.config.primaryColor,
    switchPrimaryColor,
    cyclePrimaryColor,
    availableColors: [
      'purple',
      'blue',
      'emerald',
      'amber',
      'rose',
      'dark',
    ] as const,
  };
}

/**
 * Advanced theme settings hook
 * Manages density, animation intensity, and accessibility settings
 */
export function useAdvancedThemeSettings() {
  const theme = useTheme();

  const switchDensity = useCallback(
    (newDensity: Density) => {
      theme.setDensity(newDensity);
    },
    [theme]
  );

  const cycleDensity = useCallback(() => {
    const densities: Density[] = ['compact', 'comfortable', 'spacious'];
    const currentIndex = densities.indexOf(theme.config.density);
    const nextIndex = (currentIndex + 1) % densities.length;
    switchDensity(densities[nextIndex]);
  }, [theme.config.density, switchDensity]);

  const switchAnimationIntensity = useCallback(
    (newIntensity: AnimationIntensity) => {
      theme.setAnimationIntensity(newIntensity);
    },
    [theme]
  );

  const cycleAnimationIntensity = useCallback(() => {
    const intensities: AnimationIntensity[] = [
      'subtle',
      'normal',
      'enhanced',
      'disabled',
    ];
    const currentIndex = intensities.indexOf(theme.config.animationIntensity);
    const nextIndex = (currentIndex + 1) % intensities.length;
    switchAnimationIntensity(intensities[nextIndex]);
  }, [theme.config.animationIntensity, switchAnimationIntensity]);

  const adjustGlassmorphismIntensity = useCallback(
    (intensity: number) => {
      theme.setGlassmorphismIntensity(Math.max(0, Math.min(100, intensity)));
    },
    [theme]
  );

  const increaseGlassmorphism = useCallback(
    (step: number = 10) => {
      const current = theme.config.glassmorphismIntensity;
      adjustGlassmorphismIntensity(current + step);
    },
    [theme.config.glassmorphismIntensity, adjustGlassmorphismIntensity]
  );

  const decreaseGlassmorphism = useCallback(
    (step: number = 10) => {
      const current = theme.config.glassmorphismIntensity;
      adjustGlassmorphismIntensity(current - step);
    },
    [theme.config.glassmorphismIntensity, adjustGlassmorphismIntensity]
  );

  return {
    // Density controls
    currentDensity: theme.config.density,
    switchDensity,
    cycleDensity,
    availableDensities: ['compact', 'comfortable', 'spacious'] as const,

    // Animation controls
    currentAnimationIntensity: theme.config.animationIntensity,
    switchAnimationIntensity,
    cycleAnimationIntensity,
    availableIntensities: ['subtle', 'normal', 'enhanced', 'disabled'] as const,

    // Glassmorphism controls
    glassmorphismIntensity: theme.config.glassmorphismIntensity,
    adjustGlassmorphismIntensity,
    increaseGlassmorphism,
    decreaseGlassmorphism,

    // Particle effects
    particleEffectsEnabled: theme.config.particleEffectsEnabled,
    toggleParticleEffects: theme.toggleParticleEffects,

    // Accessibility
    highContrast: theme.config.highContrast,
    toggleHighContrast: theme.toggleHighContrast,
    reducedMotion: theme.config.reducedMotion,
    toggleReducedMotion: theme.toggleReducedMotion,
  };
}

// ================================
// THEME PRESET HOOKS
// ================================

/**
 * Theme preset management hook
 * Handles saving, loading, and managing custom theme presets
 */
export function useThemePresets() {
  const theme = useTheme();
  const [customPresets, setCustomPresets] = useState<Record<string, any>>({});

  // Load custom presets on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pokemon-custom-presets');
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load custom presets:', error);
    }
  }, []);

  const saveCurrentAsPreset = useCallback(
    (name: string) => {
      theme.saveCustomPreset(name, theme.config);
      setCustomPresets((prev) => ({
        ...prev,
        [name]: theme.config,
      }));
    },
    [theme]
  );

  const loadPreset = useCallback(
    (name: string) => {
      theme.loadCustomPreset(name);
    },
    [theme]
  );

  const deletePreset = useCallback((name: string) => {
    try {
      const stored = JSON.parse(
        localStorage.getItem('pokemon-custom-presets') || '{}'
      );
      delete stored[name];
      localStorage.setItem('pokemon-custom-presets', JSON.stringify(stored));
      setCustomPresets(stored);
    } catch (error) {
      console.warn('Failed to delete preset:', error);
    }
  }, []);

  const exportPresets = useCallback(() => {
    const dataStr = JSON.stringify(customPresets, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = 'pokemon-theme-presets.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [customPresets]);

  const importPresets = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          localStorage.setItem(
            'pokemon-custom-presets',
            JSON.stringify(imported)
          );
          setCustomPresets(imported);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    customPresets,
    builtInPresets: theme.config,
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
    exportPresets,
    importPresets,
    resetToDefaults: theme.resetToDefaults,
  };
}

// ================================
// KEYBOARD SHORTCUT HOOK
// ================================

/**
 * Theme keyboard shortcuts hook
 * Provides keyboard shortcuts for common theme operations
 */
export function useThemeKeyboardShortcuts(enabled: boolean = true) {
  const { cycleTheme } = useThemeSwitch();
  const { toggleDarkMode } = useColorSchemeSwitch();
  const { cycleDensity } = useAdvancedThemeSettings();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only activate with Ctrl/Cmd + Shift modifier
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) {
        return;
      }

      switch (event.key) {
        case 'T':
        case 't':
          event.preventDefault();
          cycleTheme();
          break;
        case 'D':
        case 'd':
          event.preventDefault();
          toggleDarkMode();
          break;
        case 'S':
        case 's':
          event.preventDefault();
          cycleDensity();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enabled, cycleTheme, toggleDarkMode, cycleDensity]);

  return {
    shortcuts: {
      'Ctrl/Cmd + Shift + T': 'Cycle visual theme',
      'Ctrl/Cmd + Shift + D': 'Toggle dark/light mode',
      'Ctrl/Cmd + Shift + S': 'Cycle density setting',
    },
  };
}

// ================================
// SYSTEM PREFERENCE HOOKS
// ================================

/**
 * System preference detection hook
 * Automatically adjusts theme based on system preferences
 */
export function useSystemPreferences() {
  const theme = useTheme();
  const [systemPreferences, setSystemPreferences] = useState({
    prefersColorScheme: 'light' as 'light' | 'dark',
    prefersReducedMotion: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    // Color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateColorScheme = () => {
      setSystemPreferences((prev) => ({
        ...prev,
        prefersColorScheme: colorSchemeQuery.matches ? 'dark' : 'light',
      }));
    };
    updateColorScheme();
    colorSchemeQuery.addEventListener('change', updateColorScheme);

    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setSystemPreferences((prev) => ({
        ...prev,
        prefersReducedMotion: motionQuery.matches,
      }));

      // Auto-apply reduced motion if system preference is set
      if (motionQuery.matches && !theme.config.reducedMotion) {
        theme.toggleReducedMotion();
      }
    };
    updateMotion();
    motionQuery.addEventListener('change', updateMotion);

    // High contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const updateContrast = () => {
      setSystemPreferences((prev) => ({
        ...prev,
        prefersHighContrast: contrastQuery.matches,
      }));

      // Auto-apply high contrast if system preference is set
      if (contrastQuery.matches && !theme.config.highContrast) {
        theme.toggleHighContrast();
      }
    };
    updateContrast();
    contrastQuery.addEventListener('change', updateContrast);

    return () => {
      colorSchemeQuery.removeEventListener('change', updateColorScheme);
      motionQuery.removeEventListener('change', updateMotion);
      contrastQuery.removeEventListener('change', updateContrast);
    };
  }, [theme]);

  return {
    systemPreferences,
    syncWithSystem: () => {
      if (
        systemPreferences.prefersReducedMotion &&
        !theme.config.reducedMotion
      ) {
        theme.toggleReducedMotion();
      }
      if (systemPreferences.prefersHighContrast && !theme.config.highContrast) {
        theme.toggleHighContrast();
      }
    },
  };
}

export default {
  useThemeSwitch,
  useColorSchemeSwitch,
  usePrimaryColorSwitch,
  useAdvancedThemeSettings,
  useThemePresets,
  useThemeKeyboardShortcuts,
  useSystemPreferences,
};
