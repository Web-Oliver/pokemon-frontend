/**
 * UNIFIED THEME SYSTEM
 * Single export point for all theme functionality
 * 
 * This is the ONLY file that should be imported by components.
 * All theme-related imports should come from '@/theme'
 */

// Import what we need for the default export
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { DEFAULT_THEME_SETTINGS, THEME_STORAGE_CONFIG } from './themeTypes';
import { getThemeConfig, hasGlassmorphismSupport } from './themeDefinitions';

// ==========================================
// CORE THEME EXPORTS
// ==========================================

// Types and interfaces
export type {
  ThemeSettings,
  ThemeContextType,
  ThemeMode,
  DensityMode,
  AnimationLevel,
  GlassmorphismLevel,
  ThemeName,
  ColorScheme,
  VisualTheme,
  ThemeConfig,
  ComponentSize,
  ComponentVariant,
  ComponentState,
  IconPosition,
  
  // Component-level interfaces
  BaseThemeProps,
  ComponentAnimationConfig,
  ComponentStyleConfig,
  ThemeAwareComponentConfig,
  PolymorphicProps,
  FormIntegrationProps,
  LoadingProps,
  CompoundComponentProps,
  StandardComponentProps,
  StandardButtonProps,
  StandardInputProps,
  StandardSelectProps,
  StandardCardProps,
  StandardModalProps,
  StandardBadgeProps,
  StandardAlertProps,
  
  // Advanced types
  ThemeOverride,
  ThemePreset,
  ThemeConfiguration,
  
  // Compatibility aliases
  Density,
  AnimationIntensity,
} from './themeTypes';

// Constants
export {
  DEFAULT_THEME_SETTINGS,
  THEME_STORAGE_CONFIG,
} from './themeTypes';

// Theme definitions and utilities
export {
  themeDefinitions,
  themeMetadata,
  getThemeConfig,
  getAvailableThemes,
  hasGlassmorphismSupport,
} from './themeDefinitions';

// ==========================================
// PROVIDER AND CONTEXT
// ==========================================

// Main provider component
export { 
  ThemeProvider,
  default as UnifiedThemeProvider 
} from './ThemeProvider';

// Context for advanced usage
export { ThemeContext } from './useTheme';

// ==========================================
// HOOKS
// ==========================================

// Main unified hook
export {
  useTheme,
  default as useUnifiedTheme,
  
  // Specialized hooks
  useThemeSettings,
  useThemeName,
  useColorScheme,
  useDensity,
  useAnimations,
  useGlassmorphism,
  useAccessibility,
  useFeatures,
  useThemeUtils,
  useThemeComputed,
  
  // Legacy compatibility
  useMode,
  useSettings,
  useThemeData,
} from './useTheme';

// ==========================================
// LEGACY COMPATIBILITY EXPORTS
// ==========================================

// Legacy exports for backwards compatibility - keep existing working imports
export * from './formThemes';

// Legacy theme picker (has some issues, commenting out for now)
// export * from './ThemePicker';

// Legacy theme constants for backwards compatibility
export const defaultTheme = {
  theme: 'pokemon' as const,
  colorScheme: 'system' as const,
  density: 'comfortable' as const,
  animationLevel: 'normal' as const,
  glassmorphismEnabled: false
};

// Alias the new default settings for legacy compatibility (import from themeTypes)
export { DEFAULT_THEME_SETTINGS as defaultThemeSettings } from './themeTypes';
export { DEFAULT_THEME_SETTINGS as newDefaultTheme } from './themeTypes';

// ==========================================
// CONVENIENCE RE-EXPORTS
// ==========================================

// For backwards compatibility and convenience
export { useTheme as useUnifiedThemeContext } from './useTheme';
export { ThemeProvider as UnifiedThemeContext } from './ThemeProvider';

// ==========================================
// DEFAULT EXPORT
// ==========================================

// Default export provides the most commonly used items
export default {
  // Core components
  ThemeProvider,
  useTheme,
  
  // Constants
  DEFAULT_THEME_SETTINGS,
  THEME_STORAGE_CONFIG,
  
  // Utilities
  getThemeConfig,
  hasGlassmorphismSupport,
};

// ==========================================
// TYPE HELPERS FOR COMPONENTS
// ==========================================

// Note: Type helpers are available through direct imports:
// import { BaseThemeProps, PolymorphicProps, etc. } from '@/theme'