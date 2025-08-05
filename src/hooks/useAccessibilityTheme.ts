/**
 * Accessibility Theme Hook
 * Phase 3.2.2: Accessibility theme features ONLY
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Accessibility theme management only
 * - Open/Closed: Extensible for new accessibility patterns
 * - DRY: Centralized accessibility theme logic
 * - Dependency Inversion: Abstracts accessibility implementation
 *
 * Integrates with:
 * - ThemeContext.tsx for theme state management
 * - useThemeSwitch.ts for theme switching utilities
 * - AccessibilityTheme.tsx for component rendering
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useCentralizedTheme } from '../utils/themeConfig';
import { useAccessibilityTheme as useAccessibilityProvider } from '../contexts/theme/AccessibilityThemeProvider';

// ================================
// ACCESSIBILITY INTERFACES
// ================================

export interface AccessibilitySystemPreferences {
  /** System prefers high contrast */
  prefersHighContrast: boolean;
  /** System prefers reduced motion */
  prefersReducedMotion: boolean;
  /** System color scheme preference */
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  /** System prefers reduced transparency */
  prefersReducedTransparency: boolean;
  /** System prefers reduced data usage */
  prefersReducedData: boolean;
}

export interface AccessibilityThemeConfig {
  /** Enable automatic system preference detection */
  autoDetectPreferences?: boolean;
  /** Enable accessibility keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** High contrast color overrides */
  highContrastOverrides?: {
    background?: string;
    text?: string;
    border?: string;
    accent?: string;
  };
  /** Reduced motion configuration */
  reducedMotionOverrides?: {
    disableTransitions?: boolean;
    disableAnimations?: boolean;
    disableParallax?: boolean;
    disableAutoplay?: boolean;
  };
  /** Focus management settings */
  focusManagement?: {
    trapFocus?: boolean;
    restoreFocus?: boolean;
    skipLinks?: boolean;
  };
}

export interface AccessibilityThemeActions {
  /** Toggle high contrast mode */
  toggleHighContrast: () => void;
  /** Toggle reduced motion mode */
  toggleReducedMotion: () => void;
  /** Set high contrast with custom options */
  setHighContrast: (
    enabled: boolean,
    overrides?: AccessibilityThemeConfig['highContrastOverrides']
  ) => void;
  /** Set reduced motion with custom options */
  setReducedMotion: (
    enabled: boolean,
    overrides?: AccessibilityThemeConfig['reducedMotionOverrides']
  ) => void;
  /** Sync with system preferences */
  syncWithSystemPreferences: () => void;
  /** Reset accessibility settings */
  resetAccessibilitySettings: () => void;
  /** Apply accessibility preset */
  applyAccessibilityPreset: (
    preset: 'maximum' | 'moderate' | 'minimal' | 'off'
  ) => void;
}

export interface AccessibilityThemeState {
  /** Current accessibility configuration */
  config: AccessibilityThemeConfig;
  /** System preferences */
  systemPreferences: AccessibilitySystemPreferences | null;
  /** Accessibility mode active */
  isAccessibilityModeActive: boolean;
  /** High contrast active */
  isHighContrastActive: boolean;
  /** Reduced motion active */
  isReducedMotionActive: boolean;
  /** Focus management active */
  isFocusManagementActive: boolean;
}

// ================================
// MAIN ACCESSIBILITY THEME HOOK
// ================================

/**
 * Main accessibility theme hook
 * Provides comprehensive accessibility theme management
 */
function useAccessibilityTheme(
  config: AccessibilityThemeConfig = {}
): AccessibilityThemeState & AccessibilityThemeActions {
  const themeConfig = useCentralizedTheme();
  const accessibilityProvider = useAccessibilityProvider();
  const [systemPreferences, setSystemPreferences] =
    useState<AccessibilitySystemPreferences | null>(null);
  const [accessibilityConfig, setAccessibilityConfig] =
    useState<AccessibilityThemeConfig>(config);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ================================
  // SYSTEM PREFERENCE DETECTION
  // ================================

  useEffect(() => {
    if (!config.autoDetectPreferences) {
      return;
    }

    const detectSystemPreferences = () => {
      const preferences: AccessibilitySystemPreferences = {
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)')
          .matches,
        prefersReducedMotion: window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches,
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'no-preference',
        prefersReducedTransparency: window.matchMedia(
          '(prefers-reduced-transparency: reduce)'
        ).matches,
        prefersReducedData: window.matchMedia('(prefers-reduced-data: reduce)')
          .matches,
      };

      setSystemPreferences(preferences);
      return preferences;
    };

    // Initial detection
    const initialPreferences = detectSystemPreferences();

    // Set up media query listeners
    const mediaQueries = [
      {
        query: '(prefers-contrast: high)',
        handler: () => detectSystemPreferences(),
      },
      {
        query: '(prefers-reduced-motion: reduce)',
        handler: () => detectSystemPreferences(),
      },
      {
        query: '(prefers-color-scheme: dark)',
        handler: () => detectSystemPreferences(),
      },
      {
        query: '(prefers-color-scheme: light)',
        handler: () => detectSystemPreferences(),
      },
      {
        query: '(prefers-reduced-transparency: reduce)',
        handler: () => detectSystemPreferences(),
      },
      {
        query: '(prefers-reduced-data: reduce)',
        handler: () => detectSystemPreferences(),
      },
    ];

    const mediaQueryLists = mediaQueries.map(({ query, handler }) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', handler);
      return { mql, handler };
    });

    // Auto-apply system preferences if enabled
    if (initialPreferences.prefersHighContrast && !themeConfig.highContrast) {
      accessibilityProvider.toggleHighContrast();
    }
    if (
      initialPreferences.prefersReducedMotion &&
      !themeConfig.reducedMotion
    ) {
      accessibilityProvider.toggleReducedMotion();
    }

    return () => {
      mediaQueryLists.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler);
      });
    };
  }, [config.autoDetectPreferences, themeConfig, accessibilityProvider]);

  // ================================
  // KEYBOARD SHORTCUTS
  // ================================

  useEffect(() => {
    if (!config.enableKeyboardShortcuts) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only activate with Ctrl/Cmd + Alt modifier for accessibility shortcuts
      if (!(event.ctrlKey || event.metaKey) || !event.altKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'c':
          event.preventDefault();
          toggleHighContrast();
          announceAccessibilityChange('High contrast toggled');
          break;
        case 'm':
          event.preventDefault();
          toggleReducedMotion();
          announceAccessibilityChange('Reduced motion toggled');
          break;
        case 'r':
          event.preventDefault();
          resetAccessibilitySettings();
          announceAccessibilityChange('Accessibility settings reset');
          break;
        case 's':
          event.preventDefault();
          syncWithSystemPreferences();
          announceAccessibilityChange('Synced with system preferences');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.enableKeyboardShortcuts]);

  // ================================
  // FOCUS MANAGEMENT
  // ================================

  const manageFocus = useCallback(() => {
    if (!config.focusManagement?.restoreFocus) {
      return;
    }

    // Store current focused element
    if (document.activeElement && document.activeElement !== document.body) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [config.focusManagement?.restoreFocus]);

  const _restoreFocus = useCallback(() => {
    if (!config.focusManagement?.restoreFocus || !previousFocusRef.current) {
      return;
    }

    try {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    } catch (error) {
      console.warn('Failed to restore focus:', error);
    }
  }, [config.focusManagement?.restoreFocus]);

  // ================================
  // ACCESSIBILITY ACTIONS
  // ================================

  const toggleHighContrast = useCallback(() => {
    accessibilityProvider.toggleHighContrast();
    manageFocus();
  }, [accessibilityProvider, manageFocus]);

  const toggleReducedMotion = useCallback(() => {
    accessibilityProvider.toggleReducedMotion();
    manageFocus();
  }, [accessibilityProvider, manageFocus]);

  const setHighContrast = useCallback(
    (
      enabled: boolean,
      overrides?: AccessibilityThemeConfig['highContrastOverrides']
    ) => {
      if (enabled !== themeConfig.highContrast) {
        accessibilityProvider.toggleHighContrast();
      }

      if (overrides) {
        setAccessibilityConfig((prev) => ({
          ...prev,
          highContrastOverrides: overrides,
        }));
      }

      manageFocus();
    },
    [themeConfig.highContrast, accessibilityProvider, manageFocus]
  );

  const setReducedMotion = useCallback(
    (
      enabled: boolean,
      overrides?: AccessibilityThemeConfig['reducedMotionOverrides']
    ) => {
      if (enabled !== themeConfig.reducedMotion) {
        accessibilityProvider.toggleReducedMotion();
      }

      if (overrides) {
        setAccessibilityConfig((prev) => ({
          ...prev,
          reducedMotionOverrides: overrides,
        }));
      }

      manageFocus();
    },
    [themeConfig.reducedMotion, accessibilityProvider, manageFocus]
  );

  const syncWithSystemPreferences = useCallback(() => {
    if (!systemPreferences) {
      return;
    }

    let changes = false;

    if (systemPreferences.prefersHighContrast && !themeConfig.highContrast) {
      accessibilityProvider.toggleHighContrast();
      changes = true;
    }

    if (systemPreferences.prefersReducedMotion && !themeConfig.reducedMotion) {
      accessibilityProvider.toggleReducedMotion();
      changes = true;
    }

    if (changes) {
      announceAccessibilityChange(
        'Synced with system accessibility preferences'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemPreferences, themeConfig, accessibilityProvider]);

  const resetAccessibilitySettings = useCallback(() => {
    if (themeConfig.highContrast) {
      accessibilityProvider.toggleHighContrast();
    }
    if (themeConfig.reducedMotion) {
      accessibilityProvider.toggleReducedMotion();
    }

    setAccessibilityConfig({
      autoDetectPreferences: true,
      enableKeyboardShortcuts: true,
    });

    announceAccessibilityChange('Accessibility settings reset to defaults');
    manageFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeConfig, accessibilityProvider, manageFocus]);

  const applyAccessibilityPreset = useCallback(
    (preset: 'maximum' | 'moderate' | 'minimal' | 'off') => {
      switch (preset) {
        case 'maximum':
          setHighContrast(true, {
            background: '#000000',
            text: '#ffffff',
            border: '#ffffff',
            accent: '#ffff00',
          });
          setReducedMotion(true, {
            disableTransitions: true,
            disableAnimations: true,
            disableParallax: true,
            disableAutoplay: true,
          });
          break;

        case 'moderate':
          setHighContrast(true);
          setReducedMotion(true, {
            disableTransitions: false,
            disableAnimations: true,
            disableParallax: true,
            disableAutoplay: false,
          });
          break;

        case 'minimal':
          setHighContrast(false);
          setReducedMotion(true, {
            disableTransitions: false,
            disableAnimations: false,
            disableParallax: true,
            disableAutoplay: true,
          });
          break;

        case 'off':
          resetAccessibilitySettings();
          break;
      }

      announceAccessibilityChange(`Applied ${preset} accessibility preset`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setHighContrast, setReducedMotion, resetAccessibilitySettings]
  );

  // ================================
  // ACCESSIBILITY ANNOUNCEMENTS
  // ================================

  const announceAccessibilityChange = useCallback((message: string) => {
    // Create a live region announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove the announcement after a delay
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }, []);

  // ================================
  // DERIVED STATE
  // ================================

  const isAccessibilityModeActive =
    themeConfig.highContrast || themeConfig.reducedMotion;
  const isHighContrastActive = themeConfig.highContrast;
  const isReducedMotionActive = themeConfig.reducedMotion;
  const isFocusManagementActive = Boolean(
    config.focusManagement?.trapFocus || config.focusManagement?.restoreFocus
  );

  return {
    // State
    config: accessibilityConfig,
    systemPreferences,
    isAccessibilityModeActive,
    isHighContrastActive,
    isReducedMotionActive,
    isFocusManagementActive,

    // Actions
    toggleHighContrast,
    toggleReducedMotion,
    setHighContrast,
    setReducedMotion,
    syncWithSystemPreferences,
    resetAccessibilitySettings,
    applyAccessibilityPreset,
  };
}

// ================================
// HIGH CONTRAST THEME HOOK
// ================================

export interface HighContrastConfig {
  /** High contrast intensity (1-10) */
  intensity?: number;
  /** Color overrides */
  colorOverrides?: {
    background?: string;
    foreground?: string;
    accent?: string;
    border?: string;
  };
  /** Auto-apply system preference */
  autoApply?: boolean;
}

/**
 * High Contrast Theme Hook
 * Specialized hook for high contrast mode management
 */
function useHighContrastTheme(config: HighContrastConfig = {}) {
  const themeConfig = useCentralizedTheme();
  const accessibilityProvider = useAccessibilityProvider();
  const [intensity, setIntensity] = useState(config.intensity || 5);
  const [colorOverrides, setColorOverrides] = useState(config.colorOverrides);

  // Monitor system high contrast preference
  useEffect(() => {
    if (!config.autoApply) {
      return;
    }

    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleContrastChange = () => {
      if (contrastQuery.matches && !themeConfig.highContrast) {
        accessibilityProvider.toggleHighContrast();
      }
    };

    handleContrastChange(); // Initial check
    contrastQuery.addEventListener('change', handleContrastChange);

    return () =>
      contrastQuery.removeEventListener('change', handleContrastChange);
  }, [config.autoApply, themeConfig.highContrast, accessibilityProvider]);

  const adjustIntensity = useCallback((newIntensity: number) => {
    const clampedIntensity = Math.max(1, Math.min(10, newIntensity));
    setIntensity(clampedIntensity);

    // Update CSS custom property
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--accessibility-contrast-intensity',
        (clampedIntensity / 5).toString()
      );
    }
  }, []);

  const updateColorOverrides = useCallback(
    (overrides: HighContrastConfig['colorOverrides']) => {
      setColorOverrides(overrides);

      if (typeof document !== 'undefined' && overrides) {
        const root = document.documentElement;

        Object.entries(overrides).forEach(([key, value]) => {
          if (value) {
            root.style.setProperty(`--accessibility-hc-${key}`, value);
          }
        });
      }
    },
    []
  );

  const resetHighContrast = useCallback(() => {
    setIntensity(5);
    setColorOverrides(undefined);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.removeProperty('--accessibility-contrast-intensity');
      root.style.removeProperty('--accessibility-hc-background');
      root.style.removeProperty('--accessibility-hc-foreground');
      root.style.removeProperty('--accessibility-hc-accent');
      root.style.removeProperty('--accessibility-hc-border');
    }
  }, []);

  return {
    isHighContrastEnabled: themeConfig.highContrast,
    intensity,
    colorOverrides,
    adjustIntensity,
    updateColorOverrides,
    toggleHighContrast: accessibilityProvider.toggleHighContrast,
    resetHighContrast,
  };
}

// ================================
// REDUCED MOTION THEME HOOK
// ================================

export interface ReducedMotionConfig {
  /** Motion sensitivity level (1-5, 5 = most sensitive) */
  sensitivityLevel?: number;
  /** Specific motion preferences */
  motionPreferences?: {
    allowEssentialMotion?: boolean;
    allowHoverEffects?: boolean;
    allowFocusEffects?: boolean;
    allowScrollAnimations?: boolean;
  };
  /** Auto-apply system preference */
  autoApply?: boolean;
}

/**
 * Reduced Motion Theme Hook
 * Specialized hook for motion sensitivity management
 */
function useReducedMotionTheme(config: ReducedMotionConfig = {}) {
  const themeConfig = useCentralizedTheme();
  const accessibilityProvider = useAccessibilityProvider();
  const [sensitivityLevel, setSensitivityLevel] = useState(
    config.sensitivityLevel || 3
  );
  const [motionPreferences, setMotionPreferences] = useState(
    config.motionPreferences || {
      allowEssentialMotion: true,
      allowHoverEffects: false,
      allowFocusEffects: true,
      allowScrollAnimations: false,
    }
  );

  // Monitor system reduced motion preference
  useEffect(() => {
    if (!config.autoApply) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = () => {
      if (motionQuery.matches && !themeConfig.reducedMotion) {
        accessibilityProvider.toggleReducedMotion();
      }
    };

    handleMotionChange(); // Initial check
    motionQuery.addEventListener('change', handleMotionChange);

    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, [config.autoApply, themeConfig.reducedMotion, accessibilityProvider]);

  const adjustSensitivity = useCallback((newLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(5, newLevel));
    setSensitivityLevel(clampedLevel);

    // Update CSS custom property
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--accessibility-motion-sensitivity',
        clampedLevel.toString()
      );
    }
  }, []);

  const updateMotionPreferences = useCallback(
    (preferences: ReducedMotionConfig['motionPreferences']) => {
      setMotionPreferences((prev) => ({ ...prev, ...preferences }));

      if (typeof document !== 'undefined' && preferences) {
        const root = document.documentElement;

        Object.entries(preferences).forEach(([key, value]) => {
          root.style.setProperty(
            `--accessibility-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            value ? 'true' : 'false'
          );
        });
      }
    },
    []
  );

  const resetReducedMotion = useCallback(() => {
    setSensitivityLevel(3);
    setMotionPreferences({
      allowEssentialMotion: true,
      allowHoverEffects: false,
      allowFocusEffects: true,
      allowScrollAnimations: false,
    });

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.removeProperty('--accessibility-motion-sensitivity');
      root.style.removeProperty('--accessibility-allow-essential-motion');
      root.style.removeProperty('--accessibility-allow-hover-effects');
      root.style.removeProperty('--accessibility-allow-focus-effects');
      root.style.removeProperty('--accessibility-allow-scroll-animations');
    }
  }, []);

  return {
    isReducedMotionEnabled: themeConfig.reducedMotion,
    sensitivityLevel,
    motionPreferences,
    adjustSensitivity,
    updateMotionPreferences,
    toggleReducedMotion: accessibilityProvider.toggleReducedMotion,
    resetReducedMotion,
  };
}

// ================================
// FOCUS MANAGEMENT HOOK
// ================================

export interface FocusManagementConfig {
  /** Focus trap enabled */
  trapFocus?: boolean;
  /** Focus restore on unmount */
  restoreFocus?: boolean;
  /** Enhanced focus indicators */
  enhancedFocusIndicators?: boolean;
  /** Focus indicator style */
  focusIndicatorStyle?: 'ring' | 'outline' | 'glow' | 'border';
  /** Focus indicator color */
  focusIndicatorColor?: string;
  /** Focus indicator thickness */
  focusIndicatorThickness?: number;
}

/**
 * Focus Management Hook
 * Provides theme-aware focus management capabilities
 */
function useFocusManagementTheme(config: FocusManagementConfig = {}) {
  const themeConfig = useCentralizedTheme();
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);
  const trapContainerRef = useRef<HTMLElement | null>(null);

  // Enhanced focus indicators
  useEffect(() => {
    if (!config.enhancedFocusIndicators) {
      return;
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      root.style.setProperty('--accessibility-enhanced-focus', 'true');
      root.style.setProperty(
        '--accessibility-focus-style',
        config.focusIndicatorStyle || 'ring'
      );

      if (config.focusIndicatorColor) {
        root.style.setProperty(
          '--accessibility-focus-color',
          config.focusIndicatorColor
        );
      }

      root.style.setProperty(
        '--accessibility-focus-thickness',
        `${config.focusIndicatorThickness || 2}px`
      );
    }

    return () => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.style.removeProperty('--accessibility-enhanced-focus');
        root.style.removeProperty('--accessibility-focus-style');
        root.style.removeProperty('--accessibility-focus-color');
        root.style.removeProperty('--accessibility-focus-thickness');
      }
    };
  }, [
    config.enhancedFocusIndicators,
    config.focusIndicatorStyle,
    config.focusIndicatorColor,
    config.focusIndicatorThickness,
  ]);

  // Focus trap implementation
  useEffect(() => {
    if (!config.trapFocus || !trapContainerRef.current) {
      return;
    }

    const container = trapContainerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element when trap is enabled
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [config.trapFocus]);

  // Focus history management
  const pushFocusHistory = useCallback((element: HTMLElement) => {
    setFocusHistory((prev) => [...prev.slice(-9), element]); // Keep last 10 elements
  }, []);

  const restorePreviousFocus = useCallback(() => {
    const previousElement = focusHistory[focusHistory.length - 2];
    if (previousElement && config.restoreFocus) {
      try {
        previousElement.focus();
        setFocusHistory((prev) => prev.slice(0, -1));
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }
  }, [focusHistory, config.restoreFocus]);

  return {
    trapContainerRef,
    focusHistory,
    pushFocusHistory,
    restorePreviousFocus,
    enhancedFocusEnabled: config.enhancedFocusIndicators || false,
    focusStyle: config.focusIndicatorStyle || 'ring',
  };
}

// ================================
// MOTION SENSITIVITY HOOK
// ================================

export interface MotionSensitivityConfig {
  /** Motion sensitivity level (1-5) */
  sensitivityLevel?: number;
  /** Disable specific motion types */
  disabledMotions?: {
    transitions?: boolean;
    animations?: boolean;
    transforms?: boolean;
    parallax?: boolean;
    autoplay?: boolean;
  };
  /** Allow essential motions only */
  essentialOnly?: boolean;
}

/**
 * Motion Sensitivity Hook
 * Advanced motion sensitivity management for users with vestibular disorders
 */
function useMotionSensitivity(config: MotionSensitivityConfig = {}) {
  const themeConfig = useCentralizedTheme();
  const accessibilityProvider = useAccessibilityProvider();
  const [sensitivityLevel, setSensitivityLevel] = useState(
    config.sensitivityLevel || 3
  );
  const [disabledMotions, setDisabledMotions] = useState(
    config.disabledMotions || {}
  );

  // Apply motion sensitivity settings to CSS
  useEffect(() => {
    if (!themeConfig.reducedMotion) {
      return;
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Set sensitivity level
      root.style.setProperty(
        '--accessibility-motion-sensitivity',
        sensitivityLevel.toString()
      );

      // Apply motion restrictions
      Object.entries(disabledMotions).forEach(([motionType, disabled]) => {
        if (disabled) {
          root.style.setProperty(
            `--accessibility-disable-${motionType}`,
            'true'
          );
        }
      });

      // Essential motion only mode
      if (config.essentialOnly) {
        root.style.setProperty('--accessibility-essential-motion-only', 'true');
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.style.removeProperty('--accessibility-motion-sensitivity');
        root.style.removeProperty('--accessibility-essential-motion-only');

        Object.keys(disabledMotions).forEach((motionType) => {
          root.style.removeProperty(`--accessibility-disable-${motionType}`);
        });
      }
    };
  }, [
    themeConfig.reducedMotion,
    sensitivityLevel,
    disabledMotions,
    config.essentialOnly,
  ]);

  const adjustSensitivity = useCallback((newLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(5, newLevel));
    setSensitivityLevel(clampedLevel);

    // Auto-adjust disabled motions based on sensitivity
    if (clampedLevel >= 4) {
      setDisabledMotions({
        transitions: true,
        animations: true,
        transforms: true,
        parallax: true,
        autoplay: true,
      });
    } else if (clampedLevel >= 3) {
      setDisabledMotions({
        transitions: false,
        animations: true,
        transforms: false,
        parallax: true,
        autoplay: true,
      });
    } else {
      setDisabledMotions({
        transitions: false,
        animations: false,
        transforms: false,
        parallax: true,
        autoplay: false,
      });
    }
  }, []);

  const toggleMotionType = useCallback(
    (
      motionType: keyof MotionSensitivityConfig['disabledMotions'],
      disabled: boolean
    ) => {
      setDisabledMotions((prev) => ({
        ...prev,
        [motionType]: disabled,
      }));
    },
    []
  );

  return {
    sensitivityLevel,
    disabledMotions,
    isReducedMotionEnabled: themeConfig.reducedMotion,
    adjustSensitivity,
    toggleMotionType,
    toggleReducedMotion: accessibilityProvider.toggleReducedMotion,
  };
}

// ================================
// ACCESSIBILITY KEYBOARD SHORTCUTS
// ================================

/**
 * Accessibility Keyboard Shortcuts Hook
 * Provides keyboard shortcuts for accessibility features
 */
function useAccessibilityKeyboardShortcuts(enabled: boolean = true) {
  const accessibility = useAccessibilityTheme();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Accessibility shortcuts use Ctrl/Cmd + Alt
      if (!(event.ctrlKey || event.metaKey) || !event.altKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'c':
          event.preventDefault();
          accessibility.toggleHighContrast();
          break;
        case 'm':
          event.preventDefault();
          accessibility.toggleReducedMotion();
          break;
        case 'r':
          event.preventDefault();
          accessibility.resetAccessibilitySettings();
          break;
        case 's':
          event.preventDefault();
          accessibility.syncWithSystemPreferences();
          break;
        case '1':
          event.preventDefault();
          accessibility.applyAccessibilityPreset('minimal');
          break;
        case '2':
          event.preventDefault();
          accessibility.applyAccessibilityPreset('moderate');
          break;
        case '3':
          event.preventDefault();
          accessibility.applyAccessibilityPreset('maximum');
          break;
        case '0':
          event.preventDefault();
          accessibility.applyAccessibilityPreset('off');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enabled, accessibility]);

  return {
    shortcuts: {
      'Ctrl/Cmd + Alt + C': 'Toggle high contrast mode',
      'Ctrl/Cmd + Alt + M': 'Toggle reduced motion mode',
      'Ctrl/Cmd + Alt + R': 'Reset accessibility settings',
      'Ctrl/Cmd + Alt + S': 'Sync with system preferences',
      'Ctrl/Cmd + Alt + 1': 'Apply minimal accessibility preset',
      'Ctrl/Cmd + Alt + 2': 'Apply moderate accessibility preset',
      'Ctrl/Cmd + Alt + 3': 'Apply maximum accessibility preset',
      'Ctrl/Cmd + Alt + 0': 'Turn off accessibility features',
    },
  };
}

// ================================
// EXPORTS
// ================================

export default useAccessibilityTheme;

export {
  useAccessibilityTheme,
  useHighContrastTheme,
  useReducedMotionTheme,
  useFocusManagementTheme,
  useMotionSensitivity,
  useAccessibilityKeyboardShortcuts,
};
