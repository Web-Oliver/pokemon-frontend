/**
 * Layout Theme Provider
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 1.2
 * 
 * Focused context for layout and spacing management following ISP
 * Handles: density settings, spacing tokens, and layout configurations
 */

import React, { createContext, useContext, useCallback } from 'react';
import { Density } from '../../types/themeTypes';

// ================================
// LAYOUT THEME INTERFACES
// ================================

export interface LayoutThemeState {
  density: Density;
}

export interface DensitySpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface LayoutThemeContextType {
  // Current State
  density: Density;
  
  // Layout Management
  setDensity: (density: Density) => void;
  
  // Utility Functions
  getDensityMultiplier: () => number;
  getSpacingTokens: () => DensitySpacing;
  getDensityClasses: () => string;
}

// ================================
// DENSITY UTILITIES
// ================================

const densityMultipliers: Record<Density, number> = {
  compact: 0.8,
  comfortable: 1,
  spacious: 1.2,
};

const calculateSpacingTokens = (multiplier: number): DensitySpacing => ({
  xs: `${0.25 * multiplier}rem`,
  sm: `${0.5 * multiplier}rem`,
  md: `${1 * multiplier}rem`,
  lg: `${1.5 * multiplier}rem`,
  xl: `${2 * multiplier}rem`,
});

// ================================
// CONTEXT SETUP
// ================================

const LayoutThemeContext = createContext<LayoutThemeContextType | null>(null);

export interface LayoutThemeProviderProps {
  children: React.ReactNode;
  state: LayoutThemeState;
  onStateChange: (newState: Partial<LayoutThemeState>) => void;
}

/**
 * Layout Theme Provider Component
 * Manages layout and spacing state following Single Responsibility Principle
 * Only handles density, spacing, and layout-related theme aspects
 */
export const LayoutThemeProvider: React.FC<LayoutThemeProviderProps> = ({
  children,
  state,
  onStateChange,
}) => {
  // Layout manipulation functions
  const setDensity = useCallback((density: Density) => {
    onStateChange({ density });
  }, [onStateChange]);

  // Utility functions
  const getDensityMultiplier = useCallback((): number => {
    return densityMultipliers[state.density];
  }, [state.density]);

  const getSpacingTokens = useCallback((): DensitySpacing => {
    const multiplier = densityMultipliers[state.density];
    return calculateSpacingTokens(multiplier);
  }, [state.density]);

  const getDensityClasses = useCallback((): string => {
    return `density-${state.density}`;
  }, [state.density]);

  const contextValue: LayoutThemeContextType = {
    // Current State
    density: state.density,
    
    // Layout Management
    setDensity,
    
    // Utility Functions
    getDensityMultiplier,
    getSpacingTokens,
    getDensityClasses,
  };

  return (
    <LayoutThemeContext.Provider value={contextValue}>
      {children}
    </LayoutThemeContext.Provider>
  );
};

/**
 * Hook to access layout theme context
 * Provides type-safe access to layout theme functionality
 */
export const useLayoutTheme = (): LayoutThemeContextType => {
  const context = useContext(LayoutThemeContext);
  if (!context) {
    throw new Error('useLayoutTheme must be used within a LayoutThemeProvider');
  }
  return context;
};