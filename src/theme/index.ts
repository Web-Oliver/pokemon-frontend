/**
 * UNIFIED THEME SYSTEM - Pokemon Collection
 * Phase 1.2 Implementation - Central theme export
 *
 * Following THEME_ARCHITECTURE_DESIGN.md specifications:
 * - Single source of truth for all theme exports
 * - Backwards compatibility with existing imports
 * - Clean API surface
 */

// Core tokens and themes
export * from './tokens';
export * from './themes';
export * from './generator';

// Component variants
export * from './variants/button';
export * from './variants/card';
export * from './variants/input';
export * from './variants/badge';

// Hooks and utilities
export * from './hooks/useTheme';
export * from './hooks/useVariant';
export * from './utils/colors';

// Legacy exports for backwards compatibility
export * from './themeSystem';
export * from './DesignSystem';
export * from './formThemes';
export * from './ThemeProvider';
export * from './ThemePicker';

// Export the actual default theme settings for backwards compatibility
export const defaultTheme = {
  theme: 'pokemon' as const,
  colorScheme: 'system' as const,
  density: 'comfortable' as const,
  animationLevel: 'normal' as const,
  glassmorphismEnabled: false
};

// Re-export default theme settings with new structure
export { defaultThemeSettings as newDefaultTheme } from './themes';

// Main export
export { ThemeProvider as default } from './ThemeProvider';