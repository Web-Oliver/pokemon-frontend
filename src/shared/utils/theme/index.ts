/**
 * Centralized Theme Configuration & Utilities
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for all theme-related utilities and constants
 * - OCP: Open for extension via configuration objects
 * - DRY: Eliminates theme constant duplication across files
 * - DIP: Depends on abstractions via interfaces
 *
 * Consolidates:
 * - ThemePropertyManager.ts functions and interfaces
 * - Theme constants from multiple files
 * - Default theme configurations
 * - Utility functions for theme manipulation
 */

// Re-export all types and interfaces for centralized access
export * from '../../types/themeTypes';
export * from '../../../theme/formThemes';

// Re-export ThemePropertyManager as part of centralized utilities
export { ThemePropertyManager } from './ThemePropertyManager';
export type {
  AnimationConfig,
  VisualConfig,
  ThemeConfig,
  FormTheme,
} from './ThemePropertyManager';

// Re-export centralized theme config utilities
export {
  useCentralizedTheme,
  themeUtils,
  type CentralizedThemeConfig,
} from '../ui/themeConfig';

// ================================
// CENTRALIZED THEME CONSTANTS
// ================================

/**
 * Default Theme Configuration Values
 * Single source of truth for theme defaults across the application
 */
export const DEFAULT_THEME_CONFIG = {
  // Visual Theme Settings
  visualTheme: 'context7-premium' as const,
  colorScheme: 'system' as const,
  density: 'comfortable' as const,
  animationIntensity: 'normal' as const,

  // Color Configuration
  primaryColor: 'dark' as const,

  // Accessibility Settings
  highContrast: false,
  reducedMotion: false,

  // Advanced Settings
  glassmorphismIntensity: 50, // 0-100
  particleEffectsEnabled: true,

  // Performance Settings
  enableAnimations: true,
  enableParticles: true,
  enableBlur: true,
} as const;

/**
 * Theme Preset Configurations
 * Predefined theme combinations for quick setup
 */
export const THEME_PRESETS = {
  'context7-premium': {
    id: 'context7-premium',
    name: 'Context7 Premium',
    description: 'Professional dark theme with purple accents',
    config: {
      ...DEFAULT_THEME_CONFIG,
      visualTheme: 'context7-premium' as const,
      primaryColor: 'purple' as const,
      glassmorphismIntensity: 60,
    },
    preview: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundColor: '#1a1a2e',
      textColor: '#e94560',
    },
  },
  'context7-futuristic': {
    id: 'context7-futuristic',
    name: 'Context7 Futuristic',
    description: 'Modern theme with blue/cyan accents',
    config: {
      ...DEFAULT_THEME_CONFIG,
      visualTheme: 'context7-futuristic' as const,
      primaryColor: 'blue' as const,
      glassmorphismIntensity: 70,
    },
    preview: {
      gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      backgroundColor: '#0f1419',
      textColor: '#64ffda',
    },
  },
  'dba-cosmic': {
    id: 'dba-cosmic',
    name: 'DBA Cosmic',
    description: 'Space-themed with cosmic effects',
    config: {
      ...DEFAULT_THEME_CONFIG,
      visualTheme: 'dba-cosmic' as const,
      primaryColor: 'amber' as const,
      particleEffectsEnabled: true,
      glassmorphismIntensity: 80,
    },
    preview: {
      gradient:
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      backgroundColor: '#1e1e2e',
      textColor: '#f5c2e7',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple theme',
    config: {
      ...DEFAULT_THEME_CONFIG,
      visualTheme: 'minimal' as const,
      primaryColor: 'emerald' as const,
      glassmorphismIntensity: 20,
      particleEffectsEnabled: false,
      animationIntensity: 'subtle' as const,
    },
    preview: {
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      backgroundColor: '#ffffff',
      textColor: '#374151',
    },
  },
} as const;

/**
 * Animation Duration Constants
 * Standardized animation durations for consistent motion
 */
export const ANIMATION_DURATIONS = {
  subtle: {
    fast: '0.1s',
    normal: '0.2s',
    slow: '0.3s',
  },
  normal: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
  },
  enhanced: {
    fast: '0.2s',
    normal: '0.4s',
    slow: '0.7s',
  },
  disabled: {
    fast: '0s',
    normal: '0s',
    slow: '0s',
  },
} as const;

/**
 * Animation Delay Constants
 * Standardized delays for orchestrated animations
 */
export const ANIMATION_DELAYS = {
  short: '0.2s',
  medium: '0.5s',
  long: '0.9s',
  orbit: '15s',
  particle: '20s',
} as const;

/**
 * Density Multiplier Constants
 * Spacing multipliers for different density settings
 */
export const DENSITY_MULTIPLIERS = {
  compact: 0.75,
  comfortable: 1.0,
  spacious: 1.25,
} as const;

/**
 * Glassmorphism Effect Constants
 * Predefined glassmorphism intensity levels
 */
export const GLASSMORPHISM_PRESETS = {
  subtle: 20,
  moderate: 50,
  strong: 80,
  disabled: 0,
} as const;

/**
 * CSS Custom Property Names
 * Centralized list of all theme-related CSS custom properties
 */
export const CSS_CUSTOM_PROPERTIES = {
  // Theme Colors
  THEME_PRIMARY_GRADIENT: '--theme-primary-gradient',
  THEME_PRIMARY_HOVER: '--theme-primary-hover',
  THEME_HEADER_BACKGROUND: '--theme-header-background',
  THEME_BORDER_COLOR: '--theme-border-color',
  THEME_FOCUS_RING: '--theme-focus-ring',

  // Animation Properties
  ANIMATION_DURATION_FAST: '--animation-duration-fast',
  ANIMATION_DURATION_NORMAL: '--animation-duration-normal',
  ANIMATION_DURATION_SLOW: '--animation-duration-slow',
  ANIMATION_DELAY_SHORT: '--animation-delay-short',
  ANIMATION_DELAY_MEDIUM: '--animation-delay-medium',
  ANIMATION_DELAY_LONG: '--animation-delay-long',
  ANIMATION_DURATION_ORBIT: '--animation-duration-orbit',
  ANIMATION_DURATION_PARTICLE: '--animation-duration-particle',

  // Density Spacing
  DENSITY_SPACING_XS: '--density-spacing-xs',
  DENSITY_SPACING_SM: '--density-spacing-sm',
  DENSITY_SPACING_MD: '--density-spacing-md',
  DENSITY_SPACING_LG: '--density-spacing-lg',
  DENSITY_SPACING_XL: '--density-spacing-xl',

  // Glassmorphism Effects
  GLASS_ALPHA: '--glass-alpha',
  GLASS_BLUR: '--glass-blur',
} as const;

// ================================
// THEME UTILITY FUNCTIONS
// ================================

/**
 * Get animation durations based on intensity setting
 * @param animationIntensity - The animation intensity level
 * @returns Object with fast, normal, and slow duration values
 */
export function getAnimationDurations(animationIntensity: string) {
  return (
    ANIMATION_DURATIONS[
      animationIntensity as keyof typeof ANIMATION_DURATIONS
    ] || ANIMATION_DURATIONS.normal
  );
}

/**
 * Get density multiplier based on density setting
 * @param density - The density level
 * @returns Multiplier value for spacing calculations
 */
export function getDensityMultiplier(density: string): number {
  return (
    DENSITY_MULTIPLIERS[density as keyof typeof DENSITY_MULTIPLIERS] ||
    DENSITY_MULTIPLIERS.comfortable
  );
}

/**
 * Calculate glassmorphism blur value based on intensity
 * @param intensity - Intensity value (0-100)
 * @returns Blur value in pixels
 */
export function calculateGlassBlur(intensity: number): string {
  return `${Math.max(0, Math.min(100, intensity)) / 5}px`;
}

/**
 * Calculate glassmorphism alpha value based on intensity
 * @param intensity - Intensity value (0-100)
 * @returns Alpha value (0-1)
 */
export function calculateGlassAlpha(intensity: number): number {
  return Math.max(0, Math.min(100, intensity)) / 100;
}

/**
 * Check if animations should be disabled based on configuration
 * @param config - Theme configuration object
 * @returns true if animations should be disabled
 */
export function shouldDisableAnimations(config: {
  animationIntensity: string;
  reducedMotion: boolean;
}): boolean {
  return config.animationIntensity === 'disabled' || config.reducedMotion;
}

/**
 * Check if particles should be shown based on configuration
 * @param config - Theme configuration object
 * @returns true if particles should be displayed
 */
export function shouldShowParticles(config: {
  particleEffectsEnabled: boolean;
  reducedMotion: boolean;
}): boolean {
  return config.particleEffectsEnabled && !config.reducedMotion;
}

/**
 * Get theme preset by ID
 * @param presetId - The preset identifier
 * @returns Theme preset configuration or undefined
 */
export function getThemePreset(presetId: string) {
  return THEME_PRESETS[presetId as keyof typeof THEME_PRESETS];
}

/**
 * Validate theme configuration object
 * @param config - Theme configuration to validate
 * @returns true if configuration is valid
 */
export function validateThemeConfig(config: any): boolean {
  if (!config || typeof config !== 'object') return false;

  // Check required properties exist
  const requiredProps = [
    'visualTheme',
    'colorScheme',
    'density',
    'animationIntensity',
  ];
  return requiredProps.every((prop) => prop in config);
}

/**
 * Merge theme configurations with defaults
 * @param userConfig - User-provided configuration
 * @param defaults - Default configuration
 * @returns Merged configuration object
 */
export function mergeThemeConfig<T extends Record<string, any>>(
  userConfig: Partial<T>,
  defaults: T
): T {
  return { ...defaults, ...userConfig };
}

/**
 * Generate CSS custom property declarations from theme config
 * @param config - Theme configuration object
 * @returns CSS string with custom property declarations
 */
export function generateThemeCSSVariables(config: Record<string, any>): string {
  return Object.entries(config)
    .map(([key, value]) => `--theme-${key}: ${value};`)
    .join('\n');
}

// ================================
// THEME STORAGE UTILITIES
// ================================

/**
 * Theme Storage Keys
 * Centralized storage key constants
 */
export const THEME_STORAGE_KEYS = {
  THEME_CONFIG: 'pokemon-collection-theme-config',
  VISUAL_THEME: 'pokemon-collection-visual-theme',
  COLOR_SCHEME: 'pokemon-collection-color-scheme',
  ACCESSIBILITY: 'pokemon-collection-accessibility',
  PREFERENCES: 'pokemon-collection-theme-preferences',
} as const;

/**
 * Save theme configuration to localStorage
 * @param config - Theme configuration to save
 */
export function saveThemeConfig(config: any): void {
  try {
    localStorage.setItem(
      THEME_STORAGE_KEYS.THEME_CONFIG,
      JSON.stringify(config)
    );
  } catch (error) {
    console.warn('Failed to save theme configuration:', error);
  }
}

/**
 * Load theme configuration from localStorage
 * @returns Saved theme configuration or null
 */
export function loadThemeConfig(): any | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEYS.THEME_CONFIG);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load theme configuration:', error);
    return null;
  }
}

/**
 * Reset theme configuration to defaults
 */
export function resetThemeConfig(): void {
  try {
    Object.values(THEME_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to reset theme configuration:', error);
  }
}

// ================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ================================

// Export everything for centralized access
export default {
  DEFAULT_THEME_CONFIG,
  THEME_PRESETS,
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  DENSITY_MULTIPLIERS,
  GLASSMORPHISM_PRESETS,
  CSS_CUSTOM_PROPERTIES,
  THEME_STORAGE_KEYS,

  // Utility functions
  getAnimationDurations,
  getDensityMultiplier,
  calculateGlassBlur,
  calculateGlassAlpha,
  shouldDisableAnimations,
  shouldShowParticles,
  getThemePreset,
  validateThemeConfig,
  mergeThemeConfig,
  generateThemeCSSVariables,
  saveThemeConfig,
  loadThemeConfig,
  resetThemeConfig,
};
