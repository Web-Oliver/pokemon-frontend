/**
 * Visual Theme Provider
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 1.1
 *
 * Focused context for visual theme management following ISP
 * Handles: visual themes, presets, and visual appearance settings
 */

import React, { createContext, useContext, useCallback } from 'react';
import { VisualTheme, ThemePreset } from '../../types/themeTypes';

// Import theme presets from ThemeContext (this is safe - no circular dependency)
import { themePresets } from '../ThemeContext';

// ================================
// VISUAL THEME INTERFACES
// ================================

export interface VisualThemeState {
  visualTheme: VisualTheme;
  glassmorphismIntensity: number; // 0-100
  particleEffectsEnabled: boolean;
}

export interface VisualThemeContextType {
  // Current State
  visualTheme: VisualTheme;
  glassmorphismIntensity: number;
  particleEffectsEnabled: boolean;

  // Available Presets
  presets: ThemePreset[];

  // Theme Management
  setVisualTheme: (theme: VisualTheme) => void;
  setGlassmorphismIntensity: (intensity: number) => void;
  toggleParticleEffects: () => void;

  // Preset Management
  applyPreset: (presetId: VisualTheme) => void;
  getPreset: (presetId: VisualTheme) => ThemePreset | undefined;
}

// ================================
// CONTEXT SETUP
// ================================

const VisualThemeContext = createContext<VisualThemeContextType | null>(null);

export interface VisualThemeProviderProps {
  children: React.ReactNode;
  state: VisualThemeState;
  onStateChange: (newState: Partial<VisualThemeState>) => void;
}

/**
 * Visual Theme Provider Component
 * Manages visual theme state and provides theme manipulation functions
 * Following Single Responsibility Principle - only handles visual appearance
 */
export const VisualThemeProvider: React.FC<VisualThemeProviderProps> = ({
  children,
  state,
  onStateChange,
}) => {
  // Theme manipulation functions
  const setVisualTheme = useCallback(
    (theme: VisualTheme) => {
      onStateChange({ visualTheme: theme });
    },
    [onStateChange]
  );

  const setGlassmorphismIntensity = useCallback(
    (intensity: number) => {
      const clampedIntensity = Math.max(0, Math.min(100, intensity));
      onStateChange({ glassmorphismIntensity: clampedIntensity });
    },
    [onStateChange]
  );

  const toggleParticleEffects = useCallback(() => {
    onStateChange({ particleEffectsEnabled: !state.particleEffectsEnabled });
  }, [onStateChange, state.particleEffectsEnabled]);

  // Preset management
  const applyPreset = useCallback(
    (presetId: VisualTheme) => {
      const preset = themePresets.find((p) => p.id === presetId);
      if (preset && preset.config) {
        const updates: Partial<VisualThemeState> = {};

        if (preset.config.visualTheme !== undefined) {
          updates.visualTheme = preset.config.visualTheme;
        }
        if (preset.config.glassmorphismIntensity !== undefined) {
          updates.glassmorphismIntensity = preset.config.glassmorphismIntensity;
        }
        if (preset.config.particleEffectsEnabled !== undefined) {
          updates.particleEffectsEnabled = preset.config.particleEffectsEnabled;
        }

        onStateChange(updates);
      }
    },
    [onStateChange]
  );

  const getPreset = useCallback((presetId: VisualTheme) => {
    return themePresets.find((p) => p.id === presetId);
  }, []);

  const contextValue: VisualThemeContextType = {
    // Current State
    visualTheme: state.visualTheme,
    glassmorphismIntensity: state.glassmorphismIntensity,
    particleEffectsEnabled: state.particleEffectsEnabled,

    // Available Presets
    presets: themePresets,

    // Theme Management
    setVisualTheme,
    setGlassmorphismIntensity,
    toggleParticleEffects,

    // Preset Management
    applyPreset,
    getPreset,
  };

  return (
    <VisualThemeContext.Provider value={contextValue}>
      {children}
    </VisualThemeContext.Provider>
  );
};

/**
 * Hook to access visual theme context
 * Provides type-safe access to visual theme functionality
 */
export const useVisualTheme = (): VisualThemeContextType => {
  const context = useContext(VisualThemeContext);
  if (!context) {
    throw new Error('useVisualTheme must be used within a VisualThemeProvider');
  }
  return context;
};
