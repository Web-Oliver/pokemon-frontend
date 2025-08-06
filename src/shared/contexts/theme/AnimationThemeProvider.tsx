/**
 * Animation Theme Provider
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 1.3
 *
 * Focused context for animation and motion management following ISP
 * Handles: animation intensity, durations, delays, and motion settings
 */

import React, { createContext, useContext, useCallback } from 'react';
import { AnimationIntensity } from '../../types/themeTypes';

// ================================
// ANIMATION THEME INTERFACES
// ================================

export interface AnimationThemeState {
  animationIntensity: AnimationIntensity;
}

export interface AnimationDurations {
  fast: string;
  normal: string;
  slow: string;
}

export interface AnimationDelays {
  short: string;
  medium: string;
  long: string;
}

export interface ComplexAnimationDurations {
  orbit: string;
  particle: string;
}

export interface AnimationThemeContextType {
  // Current State
  animationIntensity: AnimationIntensity;

  // Animation Management
  setAnimationIntensity: (intensity: AnimationIntensity) => void;

  // Utility Functions
  getAnimationDurations: () => AnimationDurations;
  getAnimationDelays: () => AnimationDelays;
  getComplexAnimationDurations: () => ComplexAnimationDurations;
  getAnimationClasses: () => string;
  isAnimationDisabled: () => boolean;
}

// ================================
// ANIMATION UTILITIES
// ================================

const animationDurationMap: Record<AnimationIntensity, AnimationDurations> = {
  subtle: { fast: '0.1s', normal: '0.2s', slow: '0.3s' },
  normal: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
  enhanced: { fast: '0.2s', normal: '0.4s', slow: '0.7s' },
  disabled: { fast: '0s', normal: '0s', slow: '0s' },
};

const animationDelays: AnimationDelays = {
  short: '0.2s',
  medium: '0.5s',
  long: '0.9s',
};

const complexAnimationDurations: ComplexAnimationDurations = {
  orbit: '15s',
  particle: '20s',
};

// ================================
// CONTEXT SETUP
// ================================

const AnimationThemeContext = createContext<AnimationThemeContextType | null>(
  null
);

export interface AnimationThemeProviderProps {
  children: React.ReactNode;
  state: AnimationThemeState;
  onStateChange: (newState: Partial<AnimationThemeState>) => void;
}

/**
 * Animation Theme Provider Component
 * Manages animation and motion state following Single Responsibility Principle
 * Only handles animation intensity, durations, and motion-related theme aspects
 */
export const AnimationThemeProvider: React.FC<AnimationThemeProviderProps> = ({
  children,
  state,
  onStateChange,
}) => {
  // Animation manipulation functions
  const setAnimationIntensity = useCallback(
    (intensity: AnimationIntensity) => {
      onStateChange({ animationIntensity: intensity });
    },
    [onStateChange]
  );

  // Utility functions
  const getAnimationDurations = useCallback((): AnimationDurations => {
    return animationDurationMap[state.animationIntensity];
  }, [state.animationIntensity]);

  const getAnimationDelays = useCallback((): AnimationDelays => {
    return animationDelays;
  }, []);

  const getComplexAnimationDurations =
    useCallback((): ComplexAnimationDurations => {
      return complexAnimationDurations;
    }, []);

  const getAnimationClasses = useCallback((): string => {
    return `animation-${state.animationIntensity}`;
  }, [state.animationIntensity]);

  const isAnimationDisabled = useCallback((): boolean => {
    return state.animationIntensity === 'disabled';
  }, [state.animationIntensity]);

  const contextValue: AnimationThemeContextType = {
    // Current State
    animationIntensity: state.animationIntensity,

    // Animation Management
    setAnimationIntensity,

    // Utility Functions
    getAnimationDurations,
    getAnimationDelays,
    getComplexAnimationDurations,
    getAnimationClasses,
    isAnimationDisabled,
  };

  return (
    <AnimationThemeContext.Provider value={contextValue}>
      {children}
    </AnimationThemeContext.Provider>
  );
};

/**
 * Hook to access animation theme context
 * Provides type-safe access to animation theme functionality
 */
export const useAnimationTheme = (): AnimationThemeContextType => {
  const context = useContext(AnimationThemeContext);
  if (!context) {
    throw new Error(
      'useAnimationTheme must be used within an AnimationThemeProvider'
    );
  }
  return context;
};
