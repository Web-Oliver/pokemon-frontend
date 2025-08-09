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
import { useCentralizedTheme } from '../utils/ui/themeConfig';
import { useVisualTheme, useLayoutTheme, useAnimationTheme, useAccessibilityTheme } from '../contexts/theme/UnifiedThemeProvider';
import { useTheme as useNextTheme } from 'next-themes';
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
  const themeConfig = useCentralizedTheme();
  const visualTheme = useVisualTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<VisualTheme | null>(null);

  // Smooth theme switching with transition effects
  const switchTheme = useCallback(
    async (newTheme: VisualTheme, duration: number = 300) => {
      if (isTransitioning || newTheme === themeConfig.visualTheme) {
        return;
      }

      setIsTransitioning(true);
      setPreviousTheme(themeConfig.visualTheme as VisualTheme);

      // Add transition class to document
      document.documentElement.classList.add('theme-transitioning');

      // Apply new theme
      visualTheme.setVisualTheme(newTheme);

      // Wait for transition to complete
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Remove transition class
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
      setPreviousTheme(null);
    },
    [themeConfig.visualTheme, visualTheme, isTransitioning]
  );

  // Quick theme switching without transitions
  const quickSwitchTheme = useCallback(
    (newTheme: VisualTheme) => {
      visualTheme.setVisualTheme(newTheme);
    },
    [visualTheme]
  );

  // Cycle through available themes
  const cycleTheme = useCallback(() => {
    const themes: VisualTheme[] = [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ];
    const currentIndex = themes.indexOf(themeConfig.visualTheme as VisualTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    switchTheme(themes[nextIndex]);
  }, [themeConfig.visualTheme, switchTheme]);

  // Switch to next theme in sequence
  const nextTheme = useCallback(() => {
    const themes: VisualTheme[] = [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ];
    const currentIndex = themes.indexOf(themeConfig.visualTheme as VisualTheme);
    const nextIndex = currentIndex < themes.length - 1 ? currentIndex + 1 : 0;
    switchTheme(themes[nextIndex]);
  }, [themeConfig.visualTheme, switchTheme]);

  // Switch to previous theme in sequence
  const previousThemeSwitch = useCallback(() => {
    const themes: VisualTheme[] = [
      'context7-premium',
      'context7-futuristic',
      'dba-cosmic',
      'minimal',
    ];
    const currentIndex = themes.indexOf(themeConfig.visualTheme as VisualTheme);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : themes.length - 1;
    switchTheme(themes[prevIndex]);
  }, [themeConfig.visualTheme, switchTheme]);

  return {
    currentTheme: themeConfig.visualTheme as VisualTheme,
    isTransitioning,
    previousTheme,
    switchTheme,
    quickSwitchTheme,
    cycleTheme,
    nextTheme,
    previousThemeSwitch,
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
  const { setTheme, resolvedTheme } = useNextTheme();

  const switchColorScheme = useCallback(
    (newScheme: ColorScheme) => {
      setTheme(newScheme);
    },
    [setTheme]
  );

  const cycleColorScheme = useCallback(() => {
    const schemes: ColorScheme[] = ['light', 'dark', 'system'];
    const currentIndex = schemes.indexOf(
      (resolvedTheme as ColorScheme) || 'system'
    );
    const nextIndex = (currentIndex + 1) % schemes.length;
    switchColorScheme(schemes[nextIndex]);
  }, [resolvedTheme, switchColorScheme]);

  const toggleDarkMode = useCallback(() => {
    const newScheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    switchColorScheme(newScheme);
  }, [resolvedTheme, switchColorScheme]);

  return {
    currentScheme: (resolvedTheme as ColorScheme) || 'system',
    resolvedTheme: (resolvedTheme as 'light' | 'dark') || 'dark',
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
  // Note: Primary color functionality not yet implemented in centralized system
  // Keeping interface for backward compatibility
  const [currentColor, setCurrentColor] = useState<ThemeColor>('dark');

  const switchPrimaryColor = useCallback((newColor: ThemeColor) => {
    setCurrentColor(newColor);
    // TODO: Implement primary color switching in centralized theme system
    console.warn(
      'Primary color switching not yet implemented in centralized theme system'
    );
  }, []);

  const cyclePrimaryColor = useCallback(() => {
    const colors: ThemeColor[] = [
      'purple',
      'blue',
      'emerald',
      'amber',
      'rose',
      'dark',
    ];
    const currentIndex = colors.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    switchPrimaryColor(colors[nextIndex]);
  }, [currentColor, switchPrimaryColor]);

  return {
    currentColor,
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
  const themeConfig = useCentralizedTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationTheme();
  const visualTheme = useVisualTheme();
  const accessibilityTheme = useAccessibilityTheme();

  const switchDensity = useCallback(
    (newDensity: Density) => {
      layoutTheme.setDensity(newDensity);
    },
    [layoutTheme]
  );

  const cycleDensity = useCallback(() => {
    const densities: Density[] = ['compact', 'comfortable', 'spacious'];
    const currentIndex = densities.indexOf(themeConfig.density as Density);
    const nextIndex = (currentIndex + 1) % densities.length;
    switchDensity(densities[nextIndex]);
  }, [themeConfig.density, switchDensity]);

  const switchAnimationIntensity = useCallback(
    (newIntensity: AnimationIntensity) => {
      animationTheme.setAnimationIntensity(newIntensity);
    },
    [animationTheme]
  );

  const cycleAnimationIntensity = useCallback(() => {
    const intensities: AnimationIntensity[] = [
      'subtle',
      'normal',
      'enhanced',
      'disabled',
    ];
    const currentIndex = intensities.indexOf(
      themeConfig.animationIntensity as AnimationIntensity
    );
    const nextIndex = (currentIndex + 1) % intensities.length;
    switchAnimationIntensity(intensities[nextIndex]);
  }, [themeConfig.animationIntensity, switchAnimationIntensity]);

  const adjustGlassmorphismIntensity = useCallback(
    (intensity: number) => {
      visualTheme.setGlassmorphismIntensity(
        Math.max(0, Math.min(100, intensity))
      );
    },
    [visualTheme]
  );

  const increaseGlassmorphism = useCallback(
    (step: number = 10) => {
      const current = themeConfig.glassmorphismIntensity;
      adjustGlassmorphismIntensity(current + step);
    },
    [themeConfig.glassmorphismIntensity, adjustGlassmorphismIntensity]
  );

  const decreaseGlassmorphism = useCallback(
    (step: number = 10) => {
      const current = themeConfig.glassmorphismIntensity;
      adjustGlassmorphismIntensity(current - step);
    },
    [themeConfig.glassmorphismIntensity, adjustGlassmorphismIntensity]
  );

  return {
    // Density controls
    currentDensity: themeConfig.density as Density,
    switchDensity,
    cycleDensity,
    availableDensities: ['compact', 'comfortable', 'spacious'] as const,

    // Animation controls
    currentAnimationIntensity:
      themeConfig.animationIntensity as AnimationIntensity,
    switchAnimationIntensity,
    cycleAnimationIntensity,
    availableIntensities: ['subtle', 'normal', 'enhanced', 'disabled'] as const,

    // Glassmorphism controls
    glassmorphismIntensity: themeConfig.glassmorphismIntensity,
    adjustGlassmorphismIntensity,
    increaseGlassmorphism,
    decreaseGlassmorphism,

    // Particle effects
    particleEffectsEnabled: themeConfig.particleEffectsEnabled,
    toggleParticleEffects: visualTheme.toggleParticleEffects,

    // Accessibility
    highContrast: themeConfig.highContrast,
    toggleHighContrast: accessibilityTheme.toggleHighContrast,
    reducedMotion: themeConfig.reducedMotion,
    toggleReducedMotion: accessibilityTheme.toggleReducedMotion,
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
  const themeConfig = useCentralizedTheme();
  const visualTheme = useVisualTheme();
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
      try {
        const stored = JSON.parse(
          localStorage.getItem('pokemon-custom-presets') || '{}'
        );
        stored[name] = themeConfig;
        localStorage.setItem('pokemon-custom-presets', JSON.stringify(stored));
        setCustomPresets((prev) => ({
          ...prev,
          [name]: themeConfig,
        }));
      } catch (error) {
        console.warn('Failed to save preset:', error);
      }
    },
    [themeConfig]
  );

  const loadPreset = useCallback(
    (name: string) => {
      try {
        const stored = JSON.parse(
          localStorage.getItem('pokemon-custom-presets') || '{}'
        );
        const preset = stored[name];
        if (preset) {
          // Apply preset settings to theme providers
          if (preset.visualTheme) {
            visualTheme.setVisualTheme(preset.visualTheme);
          }
          // TODO: Apply other preset settings when providers support it
          console.warn('Preset loading partially implemented');
        }
      } catch (error) {
        console.warn('Failed to load preset:', error);
      }
    },
    [visualTheme]
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

  const resetToDefaults = useCallback(() => {
    // Reset all providers to defaults
    visualTheme.setVisualTheme('context7-premium');
    visualTheme.setGlassmorphismIntensity(80);
    if (!themeConfig.particleEffectsEnabled) {
      visualTheme.toggleParticleEffects();
    }
    // TODO: Reset other providers when available
    console.warn('Reset to defaults partially implemented');
  }, [visualTheme, themeConfig.particleEffectsEnabled]);

  return {
    customPresets,
    builtInPresets: themeConfig,
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
    exportPresets,
    importPresets,
    resetToDefaults,
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
  const themeConfig = useCentralizedTheme();
  const accessibilityTheme = useAccessibilityTheme();
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
      if (motionQuery.matches && !themeConfig.reducedMotion) {
        accessibilityTheme.toggleReducedMotion();
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
      if (contrastQuery.matches && !themeConfig.highContrast) {
        accessibilityTheme.toggleHighContrast();
      }
    };
    updateContrast();
    contrastQuery.addEventListener('change', updateContrast);

    return () => {
      colorSchemeQuery.removeEventListener('change', updateColorScheme);
      motionQuery.removeEventListener('change', updateMotion);
      contrastQuery.removeEventListener('change', updateContrast);
    };
  }, [themeConfig, accessibilityTheme]);

  return {
    systemPreferences,
    syncWithSystem: () => {
      if (
        systemPreferences.prefersReducedMotion &&
        !themeConfig.reducedMotion
      ) {
        accessibilityTheme.toggleReducedMotion();
      }
      if (systemPreferences.prefersHighContrast && !themeConfig.highContrast) {
        accessibilityTheme.toggleHighContrast();
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
