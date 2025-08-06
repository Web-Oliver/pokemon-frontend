/**
 * Accessibility Theme Provider
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 1.4
 *
 * Focused context for accessibility settings management following ISP
 * Handles: high contrast, reduced motion, and a11y-related theme aspects
 */

import React, { createContext, useContext, useCallback } from 'react';

// ================================
// ACCESSIBILITY THEME INTERFACES
// ================================

export interface AccessibilityThemeState {
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface AccessibilityThemeContextType {
  // Current State
  highContrast: boolean;
  reducedMotion: boolean;

  // Accessibility Management
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;

  // Utility Functions
  getAccessibilityClasses: () => string;
  shouldReduceMotion: () => boolean;
  isHighContrastEnabled: () => boolean;
}

// ================================
// CONTEXT SETUP
// ================================

const AccessibilityThemeContext =
  createContext<AccessibilityThemeContextType | null>(null);

export interface AccessibilityThemeProviderProps {
  children: React.ReactNode;
  state: AccessibilityThemeState;
  onStateChange: (newState: Partial<AccessibilityThemeState>) => void;
}

/**
 * Accessibility Theme Provider Component
 * Manages accessibility state following Single Responsibility Principle
 * Only handles accessibility-related theme aspects (contrast, motion, etc.)
 */
export const AccessibilityThemeProvider: React.FC<
  AccessibilityThemeProviderProps
> = ({ children, state, onStateChange }) => {
  // Accessibility manipulation functions
  const toggleHighContrast = useCallback(() => {
    onStateChange({ highContrast: !state.highContrast });
  }, [onStateChange, state.highContrast]);

  const toggleReducedMotion = useCallback(() => {
    onStateChange({ reducedMotion: !state.reducedMotion });
  }, [onStateChange, state.reducedMotion]);

  const setHighContrast = useCallback(
    (enabled: boolean) => {
      onStateChange({ highContrast: enabled });
    },
    [onStateChange]
  );

  const setReducedMotion = useCallback(
    (enabled: boolean) => {
      onStateChange({ reducedMotion: enabled });
    },
    [onStateChange]
  );

  // Utility functions
  const getAccessibilityClasses = useCallback((): string => {
    const classes: string[] = [];

    if (state.highContrast) {
      classes.push('high-contrast');
    }
    if (state.reducedMotion) {
      classes.push('reduced-motion');
    }

    return classes.join(' ');
  }, [state]);

  const shouldReduceMotion = useCallback((): boolean => {
    return state.reducedMotion;
  }, [state.reducedMotion]);

  const isHighContrastEnabled = useCallback((): boolean => {
    return state.highContrast;
  }, [state.highContrast]);

  const contextValue: AccessibilityThemeContextType = {
    // Current State
    highContrast: state.highContrast,
    reducedMotion: state.reducedMotion,

    // Accessibility Management
    toggleHighContrast,
    toggleReducedMotion,
    setHighContrast,
    setReducedMotion,

    // Utility Functions
    getAccessibilityClasses,
    shouldReduceMotion,
    isHighContrastEnabled,
  };

  return (
    <AccessibilityThemeContext.Provider value={contextValue}>
      {children}
    </AccessibilityThemeContext.Provider>
  );
};

/**
 * Hook to access accessibility theme context
 * Provides type-safe access to accessibility theme functionality
 */
export const useAccessibilityTheme = (): AccessibilityThemeContextType => {
  const context = useContext(AccessibilityThemeContext);
  if (!context) {
    throw new Error(
      'useAccessibilityTheme must be used within an AccessibilityThemeProvider'
    );
  }
  return context;
};
